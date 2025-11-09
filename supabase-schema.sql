-- ============================================
-- PostHog Data Pipeline - Supabase Schema
-- Created: 2025-10-25
-- Purpose: Store PostHog events and sessions for Streamlit analysis
-- ============================================

-- ====================
-- 1. PostHog Events Tables
-- ====================
CREATE TABLE IF NOT EXISTS posthog_events (
  id BIGSERIAL PRIMARY KEY,

  -- Core PostHog fields
  uuid TEXT NOT NULL UNIQUE,
  event TEXT NOT NULL,
  distinct_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Full properties as JSONB
  properties JSONB,

  -- Extracted key properties for faster queries (computed from JSONB)
  variant TEXT GENERATED ALWAYS AS (properties->>'variant') STORED,
  feature_flag_response TEXT GENERATED ALWAYS AS (properties->>'$feature_flag_response') STORED,
  completion_time_seconds NUMERIC GENERATED ALWAYS AS ((properties->>'completion_time_seconds')::numeric) STORED,
  correct_words_count INTEGER GENERATED ALWAYS AS ((properties->>'correct_words_count')::integer) STORED,
  total_guesses_count INTEGER GENERATED ALWAYS AS ((properties->>'total_guesses_count')::integer) STORED,
  user_id TEXT GENERATED ALWAYS AS (properties->>'user_id') STORED,

  -- Metadata
  session_id TEXT,
  window_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_posthog_event UNIQUE (uuid)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_posthog_events_event ON posthog_events(event);
CREATE INDEX IF NOT EXISTS idx_posthog_events_distinct_id ON posthog_events(distinct_id);
CREATE INDEX IF NOT EXISTS idx_posthog_events_timestamp ON posthog_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_posthog_events_variant ON posthog_events(variant) WHERE variant IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posthog_events_feature_flag ON posthog_events(feature_flag_response) WHERE feature_flag_response IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posthog_events_user_id ON posthog_events(user_id) WHERE user_id IS NOT NULL;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_posthog_events_event_variant ON posthog_events(event, variant) WHERE variant IS NOT NULL;

COMMENT ON TABLE posthog_events IS 'Raw events from PostHog batch export';
COMMENT ON COLUMN posthog_events.variant IS 'Extracted from properties.variant (A or B)';
COMMENT ON COLUMN posthog_events.feature_flag_response IS 'Extracted from properties.$feature_flag_response (control or 4-words)';

-- ====================
-- 2. PostHog Sessions Table
-- ====================
CREATE TABLE IF NOT EXISTS posthog_sessions (
  id BIGSERIAL PRIMARY KEY,

  -- Core fields
  session_id TEXT NOT NULL UNIQUE,
  distinct_id TEXT NOT NULL,
  start_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  end_timestamp TIMESTAMP WITH TIME ZONE,

  -- Entry/Exit URLs
  entry_current_url TEXT,
  entry_pathname TEXT,
  end_current_url TEXT,
  end_pathname TEXT,

  -- Metrics
  pageview_count INTEGER DEFAULT 0,
  autocapture_count INTEGER DEFAULT 0,
  session_duration INTEGER DEFAULT 0,
  is_bounce BOOLEAN DEFAULT FALSE,

  -- Full properties as JSONB (for anything else)
  properties JSONB,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_posthog_session UNIQUE (session_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posthog_sessions_distinct_id ON posthog_sessions(distinct_id);
CREATE INDEX IF NOT EXISTS idx_posthog_sessions_start_timestamp ON posthog_sessions(start_timestamp DESC);

COMMENT ON TABLE posthog_sessions IS 'Session data from PostHog';

-- ====================
-- 3. Analysis Views
-- ====================
-- Note: We don't create separate views for completions/starts/failures
-- Just query posthog_events with WHERE event = 'puzzle_completed' etc.
-- This keeps the schema simple and flexible.

-- View: Variant Statistics Summary
CREATE OR REPLACE VIEW v_variant_stats AS
SELECT
  variant,
  feature_flag_response,
  COUNT(DISTINCT distinct_id) as unique_users,
  COUNT(DISTINCT user_id) as unique_user_ids,
  COUNT(*) as total_completions,
  AVG(completion_time_seconds) as avg_completion_time,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY completion_time_seconds) as median_completion_time,
  MIN(completion_time_seconds) as min_completion_time,
  MAX(completion_time_seconds) as max_completion_time,
  STDDEV(completion_time_seconds) as stddev_completion_time,
  AVG(total_guesses_count) as avg_guesses,
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY completion_time_seconds) as p25_completion_time,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY completion_time_seconds) as p75_completion_time,
  PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY completion_time_seconds) as p90_completion_time,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY completion_time_seconds) as p95_completion_time
FROM posthog_events
WHERE event = 'puzzle_completed'
  AND variant IS NOT NULL
  AND feature_flag_response IS NOT NULL
GROUP BY variant, feature_flag_response;

COMMENT ON VIEW v_variant_stats IS 'Aggregated statistics by variant for A/B test analysis';

-- View: Conversion Funnel (Event-Based)
CREATE OR REPLACE VIEW v_conversion_funnel AS
WITH started_events AS (
  SELECT 
    variant,
    'Started' as stage,
    COUNT(*) as event_count,
    COUNT(DISTINCT distinct_id) as unique_users,
    1 as stage_order
  FROM posthog_events
  WHERE event = 'puzzle_started' AND variant IS NOT NULL
  GROUP BY variant
),
completed_events AS (
  SELECT 
    variant,
    'Completed' as stage,
    COUNT(*) as event_count,
    COUNT(DISTINCT distinct_id) as unique_users,
    2 as stage_order
  FROM posthog_events
  WHERE event = 'puzzle_completed' AND variant IS NOT NULL
  GROUP BY variant
),
repeated_events AS (
  SELECT 
    c.variant,
    'Repeated' as stage,
    COUNT(DISTINCT c.distinct_id) as event_count,
    COUNT(DISTINCT c.distinct_id) as unique_users,
    3 as stage_order
  FROM posthog_events c
  INNER JOIN posthog_events s 
    ON c.distinct_id = s.distinct_id 
    AND s.event = 'puzzle_started'
    AND s.variant = c.variant
    AND s.timestamp > c.timestamp
  WHERE c.event = 'puzzle_completed' AND c.variant IS NOT NULL
  GROUP BY c.variant
)
SELECT variant, stage, event_count, unique_users, stage_order
FROM (
  SELECT * FROM started_events
  UNION ALL
  SELECT * FROM completed_events
  UNION ALL
  SELECT * FROM repeated_events
) funnel_stages
ORDER BY variant, stage_order;

COMMENT ON VIEW v_conversion_funnel IS 'Event-based funnel: started events → completed events → users who repeated (started again after completing)';

-- ====================
-- 4. Helper Functions
-- ====================

-- Function to get user percentile by variant
CREATE OR REPLACE FUNCTION fn_get_user_percentile(
  p_user_time NUMERIC,
  p_variant TEXT
)
RETURNS NUMERIC AS $$
DECLARE
  percentile NUMERIC;
BEGIN
  SELECT
    ROUND(
      (COUNT(*) FILTER (WHERE completion_time_seconds <= p_user_time)::numeric /
       COUNT(*)::numeric * 100),
      1
    )
  INTO percentile
  FROM posthog_events
  WHERE event = 'puzzle_completed'
    AND variant = p_variant
    AND completion_time_seconds IS NOT NULL;

  RETURN COALESCE(percentile, 0);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION fn_get_user_percentile IS 'Calculate percentile rank for a user time within their variant';

-- ====================
-- 5. Sample Queries for Testing
-- ====================

-- After running this schema, test with:
/*

-- Check event counts by type
SELECT event, COUNT(*)
FROM posthog_events
GROUP BY event
ORDER BY COUNT(*) DESC;

-- Check variant distribution
SELECT variant, feature_flag_response, COUNT(*)
FROM posthog_events
WHERE event = 'puzzle_completed'
GROUP BY variant, feature_flag_response;

-- Get variant stats
SELECT * FROM v_variant_stats;

-- Get conversion funnel
SELECT * FROM v_conversion_funnel;

-- Get user percentile
SELECT fn_get_user_percentile(5.5, 'A') as percentile;

-- Recent completions (just query the main table)
SELECT uuid, distinct_id, variant, completion_time_seconds, total_guesses_count, timestamp
FROM posthog_events
WHERE event = 'puzzle_completed' AND variant IS NOT NULL
ORDER BY timestamp DESC
LIMIT 10;

-- All puzzle events for a user
SELECT event, variant, completion_time_seconds, timestamp
FROM posthog_events
WHERE distinct_id = '019a1a0b-49b1-710b-9bcb-35c254f1749b'
ORDER BY timestamp;

*/
