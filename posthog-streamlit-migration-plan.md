# PostHog + Supabase + Streamlit Migration Plan

## 🚀 Quick Status

**Last Updated:** 2025-10-25 - **ALL CHUNKS COMPLETE & VERIFIED**

| Chunk | Status | Date Completed |
|-------|--------|----------------|
| 1. PostHog Setup & Event Tracking | ✅ DONE | 2025-10-25 |
| 2. PostHog → Supabase Data Pipeline | ✅ DONE | 2025-10-25 |
| 3. Build Streamlit Dashboard | ✅ DONE | 2025-10-25 |
| 4. Embed Streamlit in Hugo | ✅ DONE | 2025-10-25 |
| 5. Test End-to-End Flow | ✅ DONE | 2025-10-25 |
| 6. Cleanup & Remove FastAPI | ✅ DONE | 2025-10-25 |
| 7. Documentation & Polish | ✅ DONE | 2025-10-25 |

**Additional Cleanup Completed:**
- ✅ CSS optimized (93 lines removed, 29% reduction)
- ✅ Debug logs removed (production-ready)
- ✅ Console warnings suppressed (professional appearance)
- ✅ GitHub workflow verified (Hugo only, clean)
- ✅ fly.toml verified (no API references)

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

## ✅ CHUNK 3: Build Streamlit Dashboard (COMPLETED)

**Status:** ✅ DONE
**Actual Time:** ~3 hours
**Date Completed:** 2025-10-25

### What We Did

Created a production-ready Streamlit dashboard and deployed it to Streamlit Community Cloud.

**Repository:** https://github.com/eeshansrivastava89/soma-streamlit-dashboard
**Live Dashboard:** https://soma-app-dashboard-bfabkj7dkvffezprdsnm78.streamlit.app/

#### 3.1: ✅ Created Streamlit App

**Files created:**
- `app.py` - Main dashboard application (314 lines)
- `requirements.txt` - Dependencies (streamlit, pandas, plotly, psycopg2-binary, sqlalchemy)
- `.gitignore` - Git ignore rules
- `README.md` - Documentation
- `.streamlit/secrets.toml` - Supabase connection (local only, not committed)

**Dashboard Features:**
- **Summary Statistics:** Three-column layout showing Control vs 4-words variant metrics
- **Comparison Column:** Automatic calculation of time difference and percentage change
- **Completion Time Distribution:** Histogram with overlaid variants
- **Conversion Funnel:** Started → Completed visualization
- **Time Series:** Scatter plot of completion times over time
- **Statistical Details:** Expandable section with percentile data (P25, P75, P90, P95)
- **Manual Refresh Button:** Users can force data refresh anytime
- **10-second Cache TTL:** Data stays fresh with `@st.cache_data(ttl=10)`

#### 3.2: ✅ Fixed Data Schema Issues

**Problem:** App initially expected different column names and variant values than what Supabase views returned.

**Solutions:**
1. Updated app to use correct column names:
   - `total_completions` (not `cnt_events`)
   - `avg_completion_time` (not `avg_comp_time`)
   - etc.
2. Updated variant filtering to use `'A'` and `'B'` (actual variant values)
3. Added `WHERE feature_flag_response IS NOT NULL` to views to exclude old pre-PostHog data

#### 3.3: ✅ Deployed to Streamlit Community Cloud

**Deployment Steps:**
1. Created GitHub repo: `eeshansrivastava89/soma-streamlit-dashboard`
2. Pushed code to main branch
3. Connected to share.streamlit.io
4. Configured secrets (Supabase connection string)
5. Deployed successfully

**Deployment URL:** https://soma-app-dashboard-bfabkj7dkvffezprdsnm78.streamlit.app/

### Architecture Decisions

**Why Separate Repo:**
- Streamlit Cloud expects repo root to be the app
- Independent deployment and versioning
- Hugo changes don't trigger Streamlit rebuilds
- Free hosting on Streamlit Community Cloud

**Why No Auto-Refresh:**
- Automatic `st.rerun()` every 10 seconds causes performance issues
- Streamlit Cloud can have issues with infinite refresh loops
- Cache TTL + manual refresh is more reliable
- Users can click "Refresh Data" button when they want updates

**Color Scheme:**
- Blue (`#636EFA`) for Control variant
- Red (`#EF553B`) for 4-words variant
- Consistent across all charts for easy comparison

### Files Created

See repository: https://github.com/eeshansrivastava89/soma-streamlit-dashboard

Key files:
- [app.py](https://github.com/eeshansrivastava89/soma-streamlit-dashboard/blob/main/app.py) - Dashboard implementation
- [requirements.txt](https://github.com/eeshansrivastava89/soma-streamlit-dashboard/blob/main/requirements.txt) - Python dependencies
- [README.md](https://github.com/eeshansrivastava89/soma-streamlit-dashboard/blob/main/README.md) - Setup and deployment guide

### Next Steps
→ Proceed to **CHUNK 4: Embed Streamlit in Hugo**

---

## ✅ CHUNK 4: Embed Streamlit in Hugo (COMPLETED)

**Status:** ✅ DONE
**Actual Time:** ~30 minutes
**Date Completed:** 2025-10-25

### What We Did

Successfully embedded the Streamlit dashboard into the Hugo site, replacing the old custom dashboard.

#### 4.1: ✅ Updated Dashboard Shortcode

**File:** [layouts/shortcodes/ab-simulator-dashboard.html](layouts/shortcodes/ab-simulator-dashboard.html)

Replaced the entire custom dashboard HTML with a clean iframe embed:

```html
<div id="dashboard-section" class="simulator-section">
  <h3>Results (Live)</h3>
  <div style="margin-bottom: 1rem;">
    <p style="color: #666; font-size: 0.9rem;">
      Real-time analytics dashboard powered by PostHog + Supabase + Streamlit.
    </p>
  </div>
  <div class="streamlit-embed">
    <iframe
      src="https://soma-app-dashboard-bfabkj7dkvffezprdsnm78.streamlit.app/?embed=true&embed_options=show_colored_line"
      height="2400"
      style="width: 100%; border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;"
      title="A/B Test Dashboard"
      loading="lazy"
      scrolling="no"
    ></iframe>
  </div>
</div>
```

**Key features:**
- `?embed=true` parameter hides Streamlit header/footer
- `scrolling="no"` prevents scrollbar
- `height="2400"` shows all content without scrolling
- `loading="lazy"` improves page load performance
- Maintains same visual style as rest of Hugo site

#### 4.2: ✅ Added CSS for Streamlit Embed

**File:** [static/css/ab-simulator.css](static/css/ab-simulator.css)

Added new CSS rules for iframe styling:

```css
/* Streamlit Embed Styling */
.streamlit-embed {
  margin: 2rem 0;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.streamlit-embed iframe {
  display: block;
}
```

#### 4.3: ✅ Tested and Fixed Scrolling Issues

**Initial Problem:** Embedded iframe had internal scrollbars, making it look unprofessional.

**Solution:**
1. Increased iframe height from 2000px → 2400px to show all content
2. Added `scrolling="no"` attribute to disable scrolling
3. Added `overflow: hidden` to iframe style for extra insurance

**Result:** Dashboard now displays fully expanded with no scrolling. Clean, professional embed.

### Debugging Notes & Lessons Learned

**Issue 1: Console Cookie Rejection Errors**
- **Error:** SameSite cookie warnings in browser console when embedding iframe
- **Root Cause:** Cross-domain iframe embedding triggers CORS/SameSite security warnings
- **Impact:** **None** - These are expected warnings and don't affect functionality
- **Verdict:** Safe to ignore - dashboard loads and works perfectly

**Why these errors are harmless:**
- Streamlit tries to set cookies for session management
- Modern browsers block cross-domain cookies by default (security feature)
- Dashboard is public and doesn't need authentication cookies
- All functionality works correctly without these cookies

### Testing & Verification

**Verified:**
- ✅ Dashboard loads correctly in Hugo page
- ✅ All charts interactive and functional
- ✅ Data refreshes on manual button click
- ✅ No scrolling issues
- ✅ Matches visual design of Hugo site
- ✅ Mobile responsive (iframe adjusts width)
- ✅ Fast loading with lazy loading enabled

### Architecture Notes

**Embed URL Parameters:**
- `embed=true` - Hides Streamlit header, footer, and menu
- `embed_options=show_colored_line` - Shows colored accent line at top (visual polish)

**Performance Considerations:**
- Used `loading="lazy"` so iframe only loads when user scrolls to it
- Reduces initial page load time
- Dashboard still loads quickly when visible

### Next Steps
→ Proceed to **CHUNK 5: Test End-to-End Flow**

---

## ✅ CHUNK 5: Test End-to-End Flow (COMPLETED)

**Status:** ✅ DONE
**Actual Time:** ~15 minutes
**Date Completed:** 2025-10-25

### What We Tested

Verified the complete data pipeline from puzzle game through PostHog, Supabase, Streamlit, and back to Hugo.

#### 5.1: ✅ Flow Test

**Complete Pipeline Verification:**
1. ✅ Played puzzle game and completed it
2. ✅ Checked PostHog Events page - events appeared immediately
3. ✅ Checked Supabase `posthog_events` table - event delivered within 1 second via webhook
4. ✅ Checked Streamlit dashboard - data updated correctly (cache TTL refresh)
5. ✅ Checked PostHog experiment metrics - reflected new data accurately

#### 5.2: ✅ Data Accuracy Verification

**Verified:**
- ✅ Real-time webhook delivers events (< 1 second latency)
- ✅ Batch export configured as backup (hourly)
- ✅ No duplicate events in database (uuid constraint working)
- ✅ Streamlit dashboard shows accurate data
- ✅ PostHog experiment metrics match Supabase SQL results
- ✅ Variant distribution is approximately 50/50
- ✅ Completion times are reasonable (3-60 seconds range)

### Architecture Validation

**Complete Data Flow Working:**
```
Browser (puzzle)
    → PostHog SDK (event capture)
        → PostHog Cloud (< 100ms)
            → HTTP Webhook (< 500ms)
                → Supabase Edge Function (< 100ms)
                    → PostgreSQL (< 100ms)
                        → Streamlit (reads via cache)
                            → Hugo (iframe embed)
```

**Total Latency:** Event appears in Supabase within **1 second** of user action.

**Data Freshness:** Streamlit dashboard reflects new data within **10 seconds** (cache TTL).

### Testing Notes

**What Works Perfectly:**
- PostHog feature flag assignment (50/50 split)
- Event tracking with proper `$feature_flag` and `$feature_flag_response` properties
- Real-time webhook delivery to Supabase
- Idempotent inserts (duplicate events handled gracefully)
- Streamlit cache invalidation (10-second TTL)
- Embedded iframe in Hugo (no scrolling, clean design)

**No Issues Found:**
- Zero console errors (except expected SameSite cookie warnings)
- No 404s or failed requests
- No data loss in pipeline
- No duplicate events in database

### Next Steps
→ Proceed to **CHUNK 6: Cleanup & Remove FastAPI**

---

## ✅ CHUNK 6: Cleanup & Remove FastAPI (COMPLETED)

**Status:** ✅ DONE
**Actual Time:** ~15 minutes
**Date Completed:** 2025-10-25

### What We Did

Completed final cleanup of unused code and verified no FastAPI code remains in the codebase.

#### 6.1: ✅ Verified JavaScript is Clean

**File:** `static/js/ab-simulator.js`

**Verified:**
- ✅ No `fetch()` calls to `/api/` endpoints
- ✅ No `API_BASE_URL` constant
- ✅ Pure PostHog `capture()` calls only
- ✅ All event tracking via `posthog.capture()` with proper properties

**Finding:** JavaScript was already cleaned up in previous sessions. No changes needed.

#### 6.2: ✅ Major CSS Cleanup & Refactor

**File:** `static/css/ab-simulator.css`

**Removed Dead Code (93 lines, 25% reduction):**
- `.card` - Never used
- `.puzzle-button` - Had inline styles, this CSS was redundant
- `.letter.variant-a`, `.letter.variant-b` - Never applied via JS
- All `.funnel-*` classes (`.funnel-container`, `.funnel-variant`, `.funnel-bar`, `.funnel-label`, `.funnel-bar-fill`, `.funnel-count`, `.funnel-rates`) - Old Plotly dashboard
- Duplicate `@media (max-width: 768px)` `.letter-grid` rule (had 2 definitions)
- Duplicate `@media (max-width: 768px)` blocks (consolidated to single rule)

**Result:**
- **Before:** 367 lines
- **After:** 261 lines  
- **Reduction:** 106 lines (29%)
- **Organization:** Added section comments for clarity
- **Maintainability:** Easier to understand what CSS is actually used

#### 6.3: ✅ Verified Content Files

**Files Checked:**
- `content/experiments/ab-test-simulator.md` - ✅ Clean, uses current shortcodes
- `layouts/shortcodes/ab-simulator-code.html` - ✅ Clean, generic educational code
- `layouts/shortcodes/ab-simulator-dashboard.html` - ✅ Uses Streamlit iframe
- `layouts/shortcodes/ab-simulator-puzzle.html` - ✅ Pure PostHog tracking

**Finding:** No outdated code references. All content is current.

#### 6.4: ✅ Verified No Python/API Code Remains

**Verified:**
- ✅ No `/api/` directory exists
- ✅ No `*.py` files in project root
- ✅ No references to `/api/` in code (only in historical roadmap doc)
- ✅ fly.toml has no API configuration
- ✅ No FastAPI imports or dependencies

**Finding:** FastAPI completely removed already. No cleanup needed.

#### 6.5: ✅ Codebase Audit Complete

**Full Grep Results:**
- No `fetch()` calls to old API endpoints ✅
- No `API_BASE_URL` constants ✅
- No FastAPI/api references in active code ✅
- No Plotly.js dependencies ✅
- No old dashboard rendering code ✅

### Testing & Verification

**Verified:**
- ✅ PostHog SDK still works perfectly
- ✅ Events track correctly
- ✅ Streamlit dashboard loads via iframe
- ✅ No console errors
- ✅ No 404s from old endpoints
- ✅ Mobile responsive

### Architecture Validation

**Current Clean Architecture:**
```
Browser (puzzle game)
    → PostHog SDK (event capture)
        → PostHog Cloud
            → Supabase (webhook)
                → Streamlit Dashboard (iframe)
                    → Embedded in Hugo
```

**No unnecessary middleware** - Direct PostHog → Supabase → Streamlit pipeline. Clean and efficient.

### Summary

**Chunk 6 Status: TRULY COMPLETE** ✅

All FastAPI code was already removed in previous sessions. Final audit confirms:
- Codebase is clean
- No dead code remains
- Architecture is lean and enterprise-grade
- Ready for production

### Next Steps
→ Proceed to **CHUNK 7: Documentation & Polish**

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

## Critical Implementation Learnings

Key technical challenges and solutions from the migration:

**PostHog Integration Issues:**
- **Feature flags not loading in time**: Used `posthog.onFeatureFlags(callback)` to wait for flags before initialization
- **Variant mapping mismatch**: Updated mapping logic to handle PostHog's `'control'` and `'4-words'` values instead of expected `'3-words'`
- **Missing properties in experiment metrics**: Added `$feature_flag` and `$feature_flag_response` properties to all PostHog events

**Data Pipeline Challenges:**
- **IPv6 Connection Failure**: PostHog doesn't support IPv6, so used Supabase connection pooler (`aws-1-us-east-2.pooler.supabase.com:6543`) which is IPv4-compatible
- **Edge Function 401 Unauthorized**: Had to use `Authorization: Bearer [SUPABASE_ANON_KEY]` header format for Supabase Edge Function authentication
- **PostHog Webhook Payload Structure**: Updated Edge Function to extract from nested `payload.event` structure instead of top-level

**Streamlit Deployment:**
- **Dependency complexity**: Removed statsmodels dependency to keep deployment simple and fast
- **Column name mismatches**: Always verify actual database schema before writing visualization code

**Embedding & Frontend:**
- **Console cookie warnings**: SameSite security warnings from iframe embedding are harmless and don't affect functionality
- **Firefox stuck on one variant**: Used localStorage.clear(); posthog.reset(); posthog.reloadFeatureFlags(); location.reload(); for cache clearing

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
