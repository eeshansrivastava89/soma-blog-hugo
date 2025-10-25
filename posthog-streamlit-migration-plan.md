# PostHog + Supabase + Streamlit Migration Plan

## 🚀 Quick Status

**Last Updated:** 2025-10-25

| Chunk | Status | Date Completed |
|-------|--------|----------------|
| 1. PostHog Setup & Event Tracking | ✅ DONE | 2025-10-25 |
| 2. PostHog → Supabase Data Pipeline | ✅ DONE | 2025-10-25 |
| 3. Build Streamlit Dashboard | 🔲 TODO | - |
| 4. Embed Streamlit in Hugo | 🔲 TODO | - |
| 5. Test End-to-End Flow | 🔲 TODO | - |
| 6. Cleanup & Remove FastAPI | 🔲 TODO | - |
| 7. Documentation & Polish | 🔲 TODO | - |

**Useful Debug Commands:**
```javascript
// Reset PostHog variant assignment (use in browser console)
localStorage.clear();
posthog.reset();
posthog.reloadFeatureFlags();
location.reload();
```

---

## Context for Future Claude Sessions

### Project Overview
**What:** A/B Testing Simulator embedded in a Hugo blog (Science of Marketing Analytics) demonstrating enterprise-grade experimentation and analytics workflows.

**Current Stack:**
- **Frontend:** Hugo static site (Rusty Typewriter theme) hosted on Fly.io
- **Simulator:** Custom word-search puzzle game with variant A (3 words) and variant B (4 words)
- **Current Tracking:** Custom JavaScript tracking events to Supabase via localStorage for variant assignment
- **Current API:** FastAPI (Python) on Fly.io serving stats endpoints
- **Current Dashboard:** Custom HTML/CSS/JS with Plotly.js for visualizations
- **Database:** Supabase (PostgreSQL) with events table

**Current Architecture:**
```
Hugo (puzzle game) → Custom JS tracking → localStorage (variant) → FastAPI → Supabase → Custom HTML/CSS dashboard
```

**What's Working Well:**
- ✅ Puzzle game mechanics (word search, timer, validation)
- ✅ Event tracking to Supabase (started, completed, attempted events)
- ✅ Leaderboard with localStorage persistence
- ✅ Basic stats calculation in Python
- ✅ Three-column layouts (puzzle + leaderboard, stats dashboard)
- ✅ Hugo shortcodes for clean separation (ab-simulator-puzzle.html, ab-simulator-dashboard.html, ab-simulator-code.html)

**Pain Points:**
- ❌ Too much custom HTML/CSS for stats rendering
- ❌ localStorage variant assignment is toy code (not enterprise-grade)
- ❌ Manual stats calculations and rendering
- ❌ Hard to iterate on analysis/visualizations
- ❌ FastAPI feels like unnecessary middleware

### User's Working Principles
1. **Chunk-based approach:** Break work into small, verifiable pieces. Complete one chunk, verify it works, then move to next.
2. **Minimalism:** Always seek the simplest solution. Reduce code, reduce dependencies, reduce complexity.
3. **Enterprise mindset:** Not building a toy blog. Demonstrating cutting-edge data science and analytics foundations suitable for real companies.
4. **Learning value:** Prefer tools that have work/career value (e.g., Streamlit over custom dashboards).
5. **Tools over custom code:** Prefer established tools over rolling custom solutions.
6. **Single source of truth:** Data transformations and analysis should happen in one place (Python/Pandas), not scattered across API + JS + HTML.
7. **Verify before proceeding:** After each chunk, stop and verify it works before moving forward.

### Key Files and Structure
```
soma-blog-hugo/
├── content/
│   └── experiments/
│       └── ab-test-simulator.md          # Main page content
├── layouts/
│   └── shortcodes/
│       ├── ab-simulator-puzzle.html       # Puzzle game HTML
│       ├── ab-simulator-dashboard.html    # Stats dashboard HTML
│       └── ab-simulator-code.html         # Python code display
├── static/
│   ├── css/
│   │   └── ab-simulator.css              # All simulator styles
│   └── js/
│       └── ab-simulator.js               # All simulator logic
├── api/                                   # FastAPI (to be removed)
│   ├── main.py
│   ├── stats.py
│   └── visualizations.py
└── assets/
    └── css/
        └── custom.css                     # Site-wide custom CSS
```

**Supabase Schema:**
```sql
events table:
- id (uuid)
- experiment_id (varchar)
- user_id (varchar)
- variant (varchar) -- 'A' or 'B'
- action_type (varchar) -- 'started', 'completed', 'attempted'
- completion_time (integer) -- milliseconds
- success (boolean)
- attempts_count (integer)
- timestamp (timestamp)
- metadata (jsonb)
```

### Design Decisions Made
- **Three-column layouts:** Used CSS Grid (`display: grid; grid-template-columns: 1fr 1fr 1fr`) for clean responsive layouts
- **No dark mode:** Disabled via hugo.toml and CSS (`#theme-switcher { display: none }`)
- **75vw page width:** Simulator page uses wider layout (`max-width: 75vw`) with sidebar hidden (`aside#side-pane { display: none }`)
- **Hugo shortcodes:** Separated HTML into reusable shortcodes to keep markdown clean
- **Auto-refresh:** Dashboard auto-refreshes every 10 seconds (configurable via `POLLING_INTERVAL_MS` constant)

### Current Challenges to Address
1. Replace localStorage variant assignment with PostHog experiments (proper statistical rigor)
2. Eliminate custom HTML/CSS dashboard rendering
3. Remove FastAPI (unnecessary middleware)
4. Move all analysis to Streamlit (Python-native, minimal code)
5. Keep Supabase as data warehouse for future analysis flexibility

---

## Target Architecture

```
┌─────────────────────────────────────────────┐
│  Hugo Blog (Fly.io)                         │
│    ├─ Puzzle game (custom JS)              │
│    │   └─> PostHog SDK                     │
│    │        ├─ Experiment assignment       │
│    │        └─ Event tracking              │
│    └─ Embedded Streamlit dashboard         │
│         └─> <iframe>                       │
└─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│  PostHog Cloud (Free tier)                  │
│    ├─ A/B experiment orchestration          │
│    ├─ Event collection                      │
│    └─ Batch export to Supabase             │
└─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│  Supabase (Free tier)                       │
│    ├─ Events table (raw data)               │
│    └─ Future: aggregated tables             │
└─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│  Streamlit Community Cloud (Free)           │
│    ├─ Connect to Supabase                   │
│    ├─ Pandas/NumPy analysis                 │
│    ├─ Plotly visualizations                 │
│    └─ Auto-refresh every 10s                │
└─────────────────────────────────────────────┘
```

**What Gets Eliminated:**
- ❌ FastAPI (entire api/ folder)
- ❌ Custom dashboard HTML/CSS/JS
- ❌ localStorage variant assignment
- ❌ Manual Plotly.js integration

**What Gets Added:**
- ✅ PostHog SDK in Hugo
- ✅ PostHog → Supabase batch export
- ✅ Streamlit app (new repo)
- ✅ iframe embed in Hugo

---

## Migration Plan: Chunked Implementation

### Prerequisites Checklist
- [x] PostHog account created (posthog.com/signup)
- [ ] Streamlit Community Cloud account (share.streamlit.io)
- [ ] GitHub repo for Streamlit app created
- [x] Supabase connection string ready
- [x] PostHog API key obtained

---

## ✅ CHUNK 1: PostHog Setup & Event Tracking (COMPLETED)

**Status:** ✅ DONE
**Actual Time:** ~2 hours
**Date Completed:** 2025-10-25

### What We Did

#### 1.1: ✅ Created PostHog Account & Experiment
- **Account:** Created at posthog.com
- **Project:** "Exp_Word_Searchv2_10_24_25"
- **Feature Flag Key:** `word_search_difficulty_v2`
- **Variants:**
  - `control` → Variant A (3 words) - 50%
  - `4-words` → Variant B (4 words) - 50%
- **API Key:** `phc_zfue5Ca8VaxypRHPCi9j2h2R3Qy1eytEHt3TMPWlOOS`
- **Host:** `https://us.i.posthog.com`

#### 1.2: ✅ Added PostHog SDK to Hugo
**File:** `layouts/_default/baseof.html` (lines 5-12)

Installed PostHog SDK in base template with:
```javascript
posthog.init('phc_zfue5Ca8VaxypRHPCi9j2h2R3Qy1eytEHt3TMPWlOOS', {
    api_host: 'https://us.i.posthog.com',
    defaults: '2025-05-24',
    person_profiles: 'identified_only'
})
```

#### 1.3: ✅ Updated Variant Assignment with Proper Timing
**File:** `static/js/ab-simulator.js`

**Key Changes:**
1. Added constant: `const FEATURE_FLAG_KEY = 'word_search_difficulty_v2';` (line 2)
2. Wrapped initialization in `posthog.onFeatureFlags()` callback to wait for flags to load (lines 51-58)
3. Updated variant mapping to match PostHog values:
   - `'control'` → Variant A
   - `'4-words'` → Variant B
   - Fallback to random if flag doesn't load (lines 62-85)

#### 1.4: ✅ Added PostHog Event Tracking
**File:** `static/js/ab-simulator.js`

Added PostHog tracking to all events with proper feature flag properties:
- `puzzle_started` (lines 417-423) - includes `$feature_flag` and `$feature_flag_response`
- `puzzle_completed` (lines 330-338) - includes `$feature_flag` and `$feature_flag_response`
- `puzzle_failed` (lines 375-382) - includes `$feature_flag` and `$feature_flag_response`

**Note:** Still tracking to Supabase via FastAPI as backup (will remove in Chunk 6)

#### 1.5: ✅ Launched & Tested
- **Experiment Status:** RUNNING in PostHog
- **Verified:**
  - ✅ Variants assign correctly (50/50 split)
  - ✅ Events appear in PostHog dashboard
  - ✅ Experiment metrics tracking both variants
  - ✅ Both Firefox and Brave browsers working
  - ✅ Existing FastAPI tracking still functional

### Debugging Notes & Lessons Learned

**Issue 1: Feature flags not loading in time**
- **Problem:** Called `getFeatureFlag()` before PostHog loaded flags
- **Solution:** Used `posthog.onFeatureFlags(callback)` to wait for flags

**Issue 2: Variant mapping mismatch**
- **Problem:** Code expected `'3-words'` but PostHog returned `'control'`
- **Solution:** Updated mapping logic to handle `'control'` and `'4-words'`

**Issue 3: Events not appearing in experiment metrics**
- **Problem:** Missing `$feature_flag` and `$feature_flag_response` properties
- **Solution:** Added these properties to all PostHog events

**Issue 4: Firefox stuck on one variant**
- **Problem:** PostHog caches feature flags per user, old flags persisting
- **Solution:** Reset command:
  ```javascript
  localStorage.clear();
  posthog.reset();
  posthog.reloadFeatureFlags();
  location.reload();
  ```

### Testing Locally

To test variant assignment:
```bash
# Run Hugo
hugo server --disableFastRender

# In browser console, reset to get new variant:
localStorage.clear();
posthog.reset();
posthog.reloadFeatureFlags();
location.reload();
```

### Next Steps
→ Proceed to **CHUNK 2: PostHog → Supabase Data Pipeline**

---

## ✅ CHUNK 2: PostHog → Supabase Data Pipeline (COMPLETED)

**Status:** ✅ DONE
**Actual Time:** ~3 hours
**Date Completed:** 2025-10-25

### What We Did

**Chose real-time webhooks over batch exports** for immediate data availability, giving Streamlit dashboard live updates within seconds instead of hourly delays.

#### 2.1: ✅ Created Supabase Schema

**File:** `supabase-schema.sql` (created in root directory)

Created optimized PostgreSQL schema with:
- Main table: `posthog_events` with JSONB properties
- Generated columns for fast queries (variant, completion_time_seconds, etc.)
- Two analysis views: `v_variant_stats` and `v_conversion_funnel`
- Function: `fn_get_user_percentile` for percentile calculations
- Proper indexes on uuid (unique), event, distinct_id, timestamp, and variant

**Key Design Decision:** Used PostgreSQL generated columns to extract JSONB properties for faster querying without duplicating data.

#### 2.2: ✅ Set Up PostHog Batch Export (Backup)

**Configuration:**
- Destination: PostgreSQL (Supabase)
- Host: `aws-1-us-east-2.pooler.supabase.com` (connection pooler, not direct)
- Port: `6543` (pooler port, not 5432)
- User: `postgres.nazioidbiydxduonenmb`
- Table: `posthog_events`
- Frequency: Hourly

**Important:** Used Supabase connection pooler to avoid IPv6 connection errors (PostHog doesn't support IPv6).

#### 2.3: ✅ Created Supabase Edge Function for Real-Time Webhooks

**File:** `supabase-edge-function-posthog-webhook.ts`

Created Deno/TypeScript Edge Function that:
- Receives PostHog webhook POST requests
- Extracts event data from nested payload structure (`payload.event`)
- Inserts into `posthog_events` table using Supabase client
- Handles duplicate events gracefully (idempotent via uuid unique constraint)
- Returns 200 OK even for duplicates

**Deployed to:** `https://nazioidbiydxduonenmb.supabase.co/functions/v1/bright-posthog-webhook`

#### 2.4: ✅ Configured PostHog HTTP Webhook

**Settings:**
- URL: Edge Function endpoint
- Method: POST
- Events: `puzzle_started`, `puzzle_completed`, `puzzle_failed`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer [SUPABASE_ANON_KEY]`
- Log responses: Enabled (for debugging)

**Key Fix:** Had to use `Authorization: Bearer ...` header format (not just `apikey`) for Supabase Edge Function authentication.

#### 2.5: ✅ Set Up PostHog Experiment Metrics

Created two metrics in PostHog experiment:

**Primary Metric: completionTime (Ratio)**
- Event: `puzzle_completed`
- SQL Expression: `avg(toFloat(properties.completion_time_seconds))`
- Goal: Lower is better (we want faster times, but showing decrease goal)
- Date filter included to avoid old test data

**Secondary Metric: successRate (Ratio)**
- Numerator: `puzzle_completed` count
- Denominator: `puzzle_started` count
- Goal: Increase
- Measures conversion from start to completion

### Debugging Notes & Lessons Learned

**Issue 1: IPv6 Connection Failure**
- **Problem:** PostHog batch export failed with `connection to server at "2600:1f16..." failed: Network is unreachable`
- **Root Cause:** PostHog doesn't support IPv6, Supabase direct connection uses IPv6
- **Solution:** Used Supabase connection pooler (`aws-1-us-east-2.pooler.supabase.com:6543`) which is IPv4-compatible

**Issue 2: Edge Function 401 Unauthorized**
- **Problem:** PostHog webhooks received 401 errors from Supabase Edge Function
- **Root Cause:** Missing/incorrect authentication header format
- **Solution:** Added `Authorization: Bearer [SUPABASE_ANON_KEY]` header to PostHog webhook (not just `apikey`)

**Issue 3: PostHog Webhook Payload Structure**
- **Problem:** Edge Function couldn't parse event data (undefined values)
- **Root Cause:** PostHog nests event data in `payload.event`, not at top level
- **Solution:** Updated Edge Function to extract from `payload.event.uuid`, `payload.event.properties`, etc.

**Issue 4: Experiment Metric Showing Wrong Values**
- **Problem:** Metric showed 1.24s and 0.97s when actual data was 6-7s
- **Root Cause:** Old test events from before proper implementation were included
- **Solution:** Reset experiment data using localStorage.clear() + posthog.reset(), then added date filters to metrics

**Issue 5: Control Variant Metric Still Wrong After Fix**
- **Problem:** 4-words variant fixed (6.83s) but control still showed 4.55s instead of 6.0s
- **Root Cause:** Additional old test events in control group
- **Solution:** Complete experiment reset and fresh data collection

### Architecture Decisions

**Why Webhooks + Batch Export (Hybrid)?**
1. **Webhooks:** Real-time data (< 1 second latency) for Streamlit dashboard
2. **Batch Export:** Backup/reconciliation in case webhooks fail
3. **Deduplication:** PostgreSQL uuid unique constraint prevents duplicates from both sources

**Same Table Strategy:**
- Both webhook and batch export write to same `posthog_events` table
- UUID unique constraint handles conflicts automatically
- Edge Function returns 200 OK for duplicate attempts (idempotent)
- No data duplication, single source of truth

### Testing & Verification

**Verified:**
- ✅ Webhook delivers events to Supabase in real-time (< 1 second)
- ✅ Batch export running hourly as backup
- ✅ No duplicate events in database
- ✅ Generated columns populate correctly
- ✅ Both experiment metrics tracking accurately
- ✅ PostHog experiment results match SQL query results

### Next Steps
→ Proceed to **CHUNK 3: Build Streamlit Dashboard**

---

## CHUNK 3: Build Streamlit Dashboard

**Goal:** Create a Streamlit app that reads from Supabase and displays live stats. Deploy to Streamlit Community Cloud.

**Time Estimate:** 2-3 hours

### Steps

See implementation files:
- **Schema:** [supabase-schema.sql](supabase-schema.sql) - Complete database schema with tables, views, indexes, and functions
- **Edge Function:** [supabase-edge-function-posthog-webhook.ts](supabase-edge-function-posthog-webhook.ts) - Real-time webhook handler
- **PostHog Configuration:** Batch export + HTTP webhook configured via PostHog dashboard
- **Experiment Metrics:** Configured directly in PostHog experiment UI

---

## CHUNK 3: Build Streamlit Dashboard

**Goal:** Create a Streamlit app that reads from Supabase and displays live stats. Deploy to Streamlit Community Cloud.

**Time Estimate:** 2-3 hours

### Overview

Create a new repository `soma-streamlit-dashboard` with:

**Files needed:**
- `app.py` - Main Streamlit application
- `requirements.txt` - Dependencies (streamlit, pandas, plotly, psycopg2-binary, sqlalchemy)
- `.gitignore` - Exclude venv, secrets, __pycache__
- `.streamlit/secrets.toml` - Supabase connection string (local only, not committed)

**Key Features:**
- Connect to Supabase using SQLAlchemy
- Query the views created in Chunk 2 (`v_variant_stats`, `v_conversion_funnel`)
- Display metrics: completion time, success rate, variant comparison
- Interactive charts: histograms, funnel charts, time series
- Auto-refresh every 10 seconds using `st.cache_data(ttl=10)`

**Deployment:**
1. Create GitHub repo and push code
2. Deploy to share.streamlit.io
3. Configure secrets in Streamlit dashboard (Supabase connection string)
4. Note the app URL for embedding in Hugo

**Reference the Supabase views:**
- `v_variant_stats` - Pre-aggregated statistics by variant
- `v_conversion_funnel` - Start → Complete → Fail rates
- Query `posthog_events` directly for raw event data

---

## CHUNK 4: Embed Streamlit in Hugo

**Goal:** Replace custom dashboard HTML with embedded Streamlit iframe.

**Time Estimate:** 30 minutes

### Steps

1. **Update dashboard shortcode** (`layouts/shortcodes/ab-simulator-dashboard.html`):
   - Replace custom HTML with iframe pointing to Streamlit app
   - Use `?embed=true` parameter to hide Streamlit header
   - Set appropriate height (typically 1800-2000px)

2. **Add CSS for embed** (`static/css/ab-simulator.css`):
   - Style the iframe container
   - Adjust margins and shadows
   - Hide Streamlit header if needed

3. **Test locally:**
   - Run `hugo server --disableFastRender`
   - Verify dashboard loads and is interactive
   - Check mobile responsiveness

4. **Optional cleanup** (do in Chunk 6):
   - Remove old dashboard JS code
   - Remove Plotly.js script tag
   - Clean up unused CSS

---

## CHUNK 5: Test End-to-End Flow

**Goal:** Verify complete data pipeline from puzzle → PostHog → Supabase → Streamlit → Hugo

**Time Estimate:** 30 minutes

### Testing Checklist

**Flow Test:**
1. Play puzzle game and complete it
2. Check PostHog Events page (should see events immediately)
3. Check Supabase `posthog_events` table (should see event within 1 second via webhook)
4. Check Streamlit dashboard (should update within 10 seconds)
5. Check PostHog experiment metrics (should reflect new data)

**Data Accuracy:**
- Verify variant distribution is ~50/50
- Verify completion times are reasonable (3-60 seconds)
- Compare PostHog metrics with Supabase SQL queries (should match)
- Test with multiple browsers/incognito windows

**What to verify:**
- [ ] Real-time webhook delivers events (< 1 second)
- [ ] Batch export runs as backup (hourly)
- [ ] No duplicate events in database
- [ ] Streamlit dashboard shows accurate data
- [ ] PostHog experiment metrics match SQL results

---

## CHUNK 6: Cleanup & Remove FastAPI

**Goal:** Remove FastAPI code and deployment. Clean up unused code.

**Time Estimate:** 1 hour

### Cleanup Tasks

**Code Cleanup:**
1. **Remove FastAPI tracking** from `static/js/ab-simulator.js`:
   - Remove all `fetch()` calls to FastAPI endpoints
   - Remove `API_BASE_URL` constant
   - Keep only PostHog `capture()` calls

2. **Remove custom dashboard code**:
   - Delete dashboard rendering functions
   - Remove Plotly.js script tag
   - Clean up dashboard-specific CSS

3. **Update shortcodes** if needed:
   - Reference actual implemented files
   - Update code examples to show PostHog/Streamlit approach

**Infrastructure Cleanup:**
1. **Destroy FastAPI Fly.io app** (if deployed separately):
   ```bash
   fly apps destroy api-spring-night-5744
   ```

2. **Remove API code**:
   ```bash
   rm -rf api/
   git add . && git commit -m "Remove FastAPI"
   ```

3. **Verify production**:
   - No console errors
   - No 404s from old API calls
   - PostHog tracking works
   - Streamlit dashboard loads

---

## CHUNK 7: Documentation & Polish

**Goal:** Document new architecture, update README, add polish.

**Time Estimate:** 1 hour

### Documentation Tasks

1. **Update main README** (`soma-blog-hugo/README.md`):
   - Document new architecture (PostHog → Supabase → Streamlit)
   - Explain data flow
   - Add local development instructions
   - Reference key files created

2. **Create Streamlit README** (`soma-streamlit-dashboard/README.md`):
   - Describe features
   - Setup instructions
   - Deployment notes
   - Link to embedded version

3. **Update code example shortcode**:
   - Replace FastAPI code with Streamlit/PostHog examples
   - Show actual queries used
   - Reference [supabase-schema.sql](supabase-schema.sql) views

4. **Add privacy notice** to simulator page:
   - Explain PostHog tracking
   - List what data is collected
   - Link to PostHog privacy policy

5. **Optional enhancements**:
   - Create architecture diagram (Mermaid or Excalidraw)
   - Draft blog post about the migration
   - Document lessons learned

---

## CHUNK 8: Future Enhancements (Optional)

**These are ideas for later, not required for initial launch:**

### 8.1: Advanced PostHog Features

**Feature Flags:**
- Add feature flag for puzzle timer (60s vs 90s)
- Test different word lists
- A/B test leaderboard visibility

**Session Replay:**
- Enable PostHog session replay
- Watch how users interact with puzzle
- Identify UX issues

**Cohort Analysis:**
- Create cohorts: "Fast solvers" vs "Slow solvers"
- Analyze retention
- Test different messaging for each cohort

### 8.2: Streamlit Enhancements

**Advanced Stats:**
- Bayesian A/B test calculator
- Statistical power analysis
- Confidence intervals visualization
- Effect size calculations

**User Segmentation:**
- Segment by time of day
- Segment by device type (mobile vs desktop)
- Cohort retention analysis

**Export Features:**
- Download data as CSV
- Export charts as PNG
- Generate PDF reports

### 8.3: Additional Experiments

**New Variants:**
- Variant C: 5 words (harder)
- Different grid sizes (4x4 vs 5x5)
- Different time limits

**Marketing Experiments:**
- A/B test landing page copy
- Test different CTAs
- Test pricing presentation

### 8.4: Monitoring & Alerts

**Set up alerts:**
- Slack/email when experiment reaches significance
- Alert if data pipeline breaks
- Alert if completion rate drops

**Add monitoring:**
- Uptime monitoring (UptimeRobot)
- Error tracking (Sentry)
- Performance monitoring

---

## Rollback Plan

If anything goes wrong during migration:

### Rollback to Current State

**If PostHog breaks:**
1. Comment out PostHog SDK in HTML
2. Revert variant assignment to localStorage
3. Keep FastAPI tracking working

**If Streamlit breaks:**
1. Keep old dashboard HTML/CSS
2. Don't delete custom dashboard code yet
3. Debug Streamlit separately

**If Supabase export breaks:**
1. PostHog still has all data
2. Can manually export via PostHog API
3. Can query PostHog directly from Streamlit

### Gradual Rollout

**Phase approach:**
1. Add PostHog alongside existing tracking (parallel)
2. Verify PostHog data matches
3. Remove old tracking only after confidence

**Canary deployment:**
1. Launch PostHog experiment at 10% traffic first
2. Monitor for issues
3. Gradually increase to 100%

---

## Success Criteria

After completing all chunks, you should have:

### Technical
- [ ] PostHog experiment running
- [ ] Events flowing PostHog → Supabase
- [ ] Streamlit dashboard deployed and working
- [ ] Dashboard embedded in Hugo
- [ ] FastAPI removed
- [ ] No broken links or errors

### Data Quality
- [ ] Variant assignment is 50/50 (±5%)
- [ ] All events tracked accurately
- [ ] No data loss in pipeline
- [ ] Stats calculations correct

### User Experience
- [ ] Puzzle game works flawlessly
- [ ] Dashboard loads quickly (< 3 seconds)
- [ ] Mobile responsive
- [ ] No console errors

### Documentation
- [ ] README updated
- [ ] Code well-commented
- [ ] Architecture documented
- [ ] Privacy notice added

---

## Troubleshooting Guide

### PostHog Issues

**Problem:** Variant assignment not working
```javascript
// Debug in console:
posthog.getFeatureFlag('word-search-difficulty')
// Should return '3-words' or '4-words'

// Check if PostHog loaded:
console.log(posthog)
```

**Solution:** 
- Verify API key is correct
- Check experiment is launched
- Clear cache and try again

---

**Problem:** Events not appearing in PostHog

**Solution:**
- Check Network tab for failed requests
- Verify PostHog SDK loaded (check console)
- Check PostHog dashboard: Project Settings → API & Feature Flags → Is project active?

---

### Supabase Issues

**Problem:** Batch export not working

**Solution:**
- PostHog → Data pipelines → Your export → Check logs
- Verify Supabase credentials
- Test connection: `psql "postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres"`
- Check Supabase logs for connection attempts

---

**Problem:** Views return no data

**Solution:**
```sql
-- Check if base table has data
SELECT COUNT(*) FROM posthog_events;

-- Check if events are correct type
SELECT DISTINCT event FROM posthog_events;

-- Verify properties structure
SELECT properties FROM posthog_events LIMIT 1;
```

---

### Streamlit Issues

**Problem:** Connection timeout to Supabase

**Solution:**
- Verify connection string in secrets
- Check if Supabase project is active
- Test connection locally first
- Check Supabase logs: Database → Logs

---

**Problem:** Auto-refresh not working

**Solution:**
- Remove `time.sleep(10)` and `st.rerun()` (can cause issues)
- Use Streamlit's built-in `st.cache_data(ttl=10)` instead
- Refresh happens on user interaction

---

**Problem:** Iframe too short/tall in Hugo

**Solution:**
- Adjust `height` attribute in iframe tag
- Typical range: 1500-2000px
- Use browser devtools to measure actual content height

---

### General Debugging

**Check data flow:**
```
1. Browser console → PostHog events sent?
2. PostHog dashboard → Events appearing?
3. Supabase → Run: SELECT COUNT(*) FROM posthog_events
4. Streamlit → Data loading correctly?
```

**Common issues:**
- API keys incorrect
- Firewalls blocking connections
- Batch export delay (wait 1 hour)
- Cache issues (hard refresh)

---

## Cost Breakdown

### Current Costs (After Migration)

| Service | Tier | Cost |
|---------|------|------|
| Hugo (Fly.io) | Hobby | ~$2/month |
| PostHog | Free | $0 (up to 1M events) |
| Supabase | Free | $0 (up to 500MB) |
| Streamlit | Community Cloud | $0 |
| **Total** | | **~$2/month** |

### If You Exceed Free Tiers

| Service | Next Tier | Cost |
|---------|-----------|------|
| PostHog | Growth | $0.0005/event after 1M |
| Supabase | Pro | $25/month (8GB) |
| Streamlit | Team | $20/month/app |

**Your expected usage:**
- Events: ~1000/day = 30K/month (well under 1M)
- Database: ~10MB (well under 500MB)
- Streamlit: 1 public app (free)

**Verdict:** Should stay free for foreseeable future

---

## Timeline Summary

**Total estimated time:** 8-12 hours (spread over 1-2 weeks)

| Chunk | Time | Can Start |
|-------|------|-----------|
| 1. PostHog Setup | 1-2h | Immediately |
| 2. Data Pipeline | 1-2h | After Chunk 1 |
| 3. Streamlit Dashboard | 2-3h | After Chunk 2 |
| 4. Hugo Embed | 0.5h | After Chunk 3 |
| 5. E2E Testing | 0.5h | After Chunk 4 |
| 6. FastAPI Cleanup | 1h | After Chunk 5 |
| 7. Documentation | 1h | After Chunk 6 |
| 8. Polish (optional) | 2-4h | Anytime |

**Recommended pace:** 1-2 chunks per day

---

## What You'll Learn

By completing this migration, you'll gain hands-on experience with:

### Tools & Technologies
- ✅ PostHog (product analytics + experimentation)
- ✅ Supabase (PostgreSQL + modern data platform)
- ✅ Streamlit (rapid dashboard development)
- ✅ Data pipelines (batch export, ETL)
- ✅ Event-driven architecture

### Concepts
- ✅ A/B testing (proper statistical methods)
- ✅ Data warehousing (raw events → aggregated tables)
- ✅ Modern data stack (collection → storage → analysis → visualization)
- ✅ API design (RESTful, event tracking)
- ✅ Frontend integration (iframe embedding, SDK integration)

### Career Skills
- ✅ Full-stack data product development
- ✅ Tool selection & architecture decisions
- ✅ Production deployment & monitoring
- ✅ Documentation & knowledge sharing

---

## Questions for Future Claude

When you restart this project in a new chat:

1. **Where are you in the migration?**
   - Which chunks are complete?
   - What's working? What's not?

2. **What error are you seeing?**
   - Share exact error messages
   - Show relevant code snippets

3. **What have you verified?**
   - Use the checklists in each chunk
   - Show proof (screenshots, logs)

4. **What's your goal for this session?**
   - Complete one chunk?
   - Debug specific issue?
   - Add enhancement?

---

## Final Notes

**Remember:**
- ✅ Work in chunks, verify each before moving on
- ✅ Keep it simple - avoid over-engineering
- ✅ Document as you go
- ✅ Test thoroughly at each step
- ✅ Don't delete old code until new code is verified

**You're building enterprise-grade infrastructure.** Take your time, do it right, and you'll have a stellar portfolio piece that demonstrates real data engineering skills.

Good luck! 🚀
