# Phase 2 Implementation Roadmap: Gamification & Engagement

## 🎉 DEPLOYMENT COMPLETE - Phase 2A & 2B DONE!

---

## Tech Stack & Deployment

### Architecture
```
┌─────────────────────────────────────────┐
│  Frontend: Hugo Static Site             │
│  https://soma-blog-hugo-shy-bird-7985   │
│           .fly.dev                      │
│  - Content delivery                     │
│  - User interface                       │
│  - Client-side JavaScript               │
└──────────────┬──────────────────────────┘
               │
               │ HTTPS API Calls
               │
               ▼
┌─────────────────────────────────────────┐
│  Backend: Python FastAPI                │
│  https://api-spring-night-5744.fly.dev  │
│  - Data science (pandas, scipy, numpy)  │
│  - Statistical analysis                 │
│  - Plotly visualizations                │
│  - Event tracking                       │
└──────────────┬──────────────────────────┘
               │
               │ SQL Queries
               │
               ▼
┌─────────────────────────────────────────┐
│  Database: Supabase (PostgreSQL)        │
│  - User events storage                  │
│  - Experiment data                      │
│  - Real-time analytics                  │
└─────────────────────────────────────────┘
```

### Deployment Details

**Frontend (Hugo Site)**
- Platform: Fly.io
- App Name: `soma-blog-hugo-shy-bird-7985`
- URL: https://soma-blog-hugo-shy-bird-7985.fly.dev
- Region: Dallas (dfw)
- Memory: 256MB
- Auto-scaling: Yes (0 min machines)
- Build: Docker (Hugo 0.151.0 + nginx)

**Backend (Python API)**
- Platform: Fly.io
- App Name: `api-spring-night-5744`
- URL: https://api-spring-night-5744.fly.dev
- Region: Dallas (dfw)
- Memory: 512MB
- Auto-scaling: Yes (0 min machines)
- Runtime: Python 3.11
- Key Dependencies: FastAPI, pandas, scipy, numpy, plotly, supabase

**Database**
- Platform: Supabase (managed PostgreSQL)
- Access: Via environment variables (SUPABASE_URL, SUPABASE_KEY)

**CI/CD**
- GitHub Actions workflow: `.github/workflows/deploy.yml`
- Auto-deploy on push to `main` branch
- Path-based filtering:
  - Hugo files changed → Deploy frontend only
  - API files changed → Deploy backend only
  - Both changed → Deploy both

**Environment Variables**
- Set via: `flyctl secrets set KEY=value`
- Required for API:
  - `SUPABASE_URL`
  - `SUPABASE_KEY`

---

## Local Development Setup

### Prerequisites
```bash
# Install Hugo
brew install hugo

# Install Python 3.11+
brew install python@3.11

# Install Fly.io CLI
brew install flyctl
```

### Running Locally

**Frontend (Hugo):**
```bash
# From project root
hugo server

# Visit: http://localhost:1313
```

**Backend (API):**
```bash
# From api/ directory
cd api/
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Visit: http://localhost:8000/api/health
```

**Full Stack Testing:**
- Run both Hugo and API locally
- Hugo will call localhost:8000 for API requests
- Database: Uses production Supabase (shared)

---

## Deployment Workflow

### One-Time Setup (✅ COMPLETE)
1. ✅ Created Fly.io account
2. ✅ Installed flyctl CLI
3. ✅ Created two Fly.io apps (Hugo + API)
4. ✅ Set up GitHub Actions auto-deploy
5. ✅ Configured CORS and environment variables

### Daily Workflow
```bash
# 1. Make changes locally
# 2. Test locally (hugo server + uvicorn)
# 3. Commit and push
git add .
git commit -m "your message"
git push

# 4. Auto-deploy happens via GitHub Actions (2-3 min)
# 5. Visit production URL to verify
```

### Manual Deploy (if needed)
```bash
# Deploy Hugo site
flyctl deploy  # from project root

# Deploy API
cd api/
flyctl deploy
```

---

## Overview
Transform the A/B simulator from static stats display to engaging gamified experience. Focus: Puzzle engagement → Data generation → Blog content.

---

## Phase 2A: MVP (Core Gamification) ✅ COMPLETE

### Step 0: Database Schema Update ✅ DONE
- [x] Add `action_type` column to events table
- [x] Add `completion_time` column to events table
- [x] Add `success` column to events table
- [x] Add `correct_words_count` column to events table
- [x] Add `total_guesses_count` column to events table
- [x] Drop old `attempts_count` column
- [x] Verify columns exist in Supabase

**Completion Status:** `[x]` DONE

---

### Step 1: Puzzle Engine ✅ DONE
- [x] Replace CTA button with word search puzzle display
- [x] Variant A: Find 3 four-letter words (difficulty 3/10)
- [x] Variant B: Find 4 four-letter words (difficulty 5/10)
- [x] Create word validation function
- [x] Track puzzle start time
- [x] Track puzzle submission time
- [x] Calculate completion_time in seconds.milliseconds
- [x] Handle correct/incorrect submissions
- [x] Timer displays as mm:ss:ms
- [x] Test locally and on Vercel
- [x] Verify events stored correctly in Supabase

**Completion Status:** `[x]` DONE

---

### Step 2: Event Tracking Enhancement ✅ DONE
- [x] Add `action_type` field to events (started/completed/attempted)
- [x] Add `completion_time` field to events
- [x] Add `success` field to events
- [x] Add `correct_words_count` and `total_guesses_count` fields
- [x] Send all data to `/api/track` endpoint
- [x] Verify events store correctly in Supabase
- [x] Test both variants independently

**Completion Status:** `[x]` DONE (completed as part of Step 1)

---

### Step 3: Feedback & Celebration ✅ DONE
- [x] Show sleek inline completion message (no modal)
- [x] Display completion time: "00:10:45"
- [x] Show variant comparison: "⚡ 2.5s faster than B | A avg: 9.0s"
- [x] Add "Try Again" button
- [x] Add "View Stats" link (scrolls to dashboard)
- [x] Test on desktop and mobile
- [x] Compact 4-line design with minimal spacing

**Completion Status:** `[x]` DONE

---

### Step 4: Leaderboard (localStorage-based) ✅ DONE
- [x] Generate random fun username on first visit
- [x] Store username in localStorage
- [x] After completion, add user to leaderboard
- [x] Keep top 50 fastest times
- [x] Display top 10 on leaderboard
- [x] Highlight current user in leaderboard
- [x] Show only best score per user (not all attempts)
- [x] Show "Personal Best!" indicator when user beats their record
- [x] Show current attempt below top 10 if slower than personal best
- [x] Show "Your Position" if ranked outside top 10
- [x] Display times with 2 decimal places everywhere
- [x] Test leaderboard persistence

**Completion Status:** `[x]` DONE (localStorage-based, Step 15 will add cross-device sync)

---

### Step 5: Funnel Visualization ✅ DONE
- [x] Track "started" events (puzzle displayed)
- [x] Track "completed" events (puzzle solved)
- [x] Track "repeated" events (user clicked "Try Again")
- [x] Calculate funnel metrics per variant in API:
  - Started count
  - Completed count
  - Repeated count
  - Completion rate %
  - Repeat rate %
- [x] Display funnel bars for Variant A and B side-by-side
- [x] Add CSS for funnel visualization
- [x] Update funnel in real-time with polling toggle
- [x] Global max scaling for visual comparison across variants
- [x] Add cache busting for Vercel deployments
- [x] Test data accuracy

**Completion Status:** `[x]` DONE

---

### Step 6: Testing & Verification ✅ DONE
- [x] Test locally: Create 10+ events, verify leaderboard works
- [x] Test locally: Refresh page, verify username persists
- [x] Add username display to Challenge section
- [x] Test production: Click puzzle, record completion
- [x] Test production: Check Supabase events table
- [x] Test production: Enable live refresh, watch funnel update
- [x] Test production: Click 5+ times, verify leaderboard ranking
- [x] Test mobile responsiveness (good enough for MVP)
- [x] Verify no console errors (all clear, API returns 200)

**Completion Status:** `[x]` DONE

---

## Phase 2B: Data Science Backend & Advanced Analytics ✅ COMPLETE

### Step 7: Statistical Analysis Module (`stats.py`) ✅ COMPLETE
**Goal:** Professional pandas/scipy-based statistical analysis

- [x] Create `/api/stats.py` module
- [x] Load Supabase events into pandas DataFrame
- [x] Calculate core metrics (completion rates, avg times, success rates, repeat rates)
- [x] Statistical tests (t-test, chi-square, Cohen's d effect size)
- [x] Percentile calculations (user rank within variant, across all users)
- [x] Difficulty analysis (relative difficulty ratio, comparison messaging)
- [x] Return structured JSON with all statistics
- [x] Update `/api/stats` endpoint to use stats module
- [x] Add `/api/user_percentile` endpoint
- [x] Display percentile in completion message
- [x] Display difficulty analysis in dashboard

**Completion Status:** `[x]` COMPLETE

**Deliverable:** ✅ Clean, reusable data science module powering all analytics

---

### Step 8: Visualization Module (`visualizations.py`) ✅ COMPLETE
**Goal:** Interactive Plotly charts for real-time data visualization

- [x] Create `/api/visualizations.py` module
- [x] Funnel chart (Plotly):
  - Interactive funnel with hover details
  - Side-by-side A/B comparison
  - Real-time update capability
  - Mobile-responsive
- [x] Time distribution histogram:
  - Completion time distribution by variant
  - Overlay curves for comparison
  - Mean lines with annotations
- [x] Comparison charts:
  - Success rates bar chart
  - Average times with confidence interval error bars
- [x] Return Plotly JSON format for frontend rendering

**Completion Status:** `[x]` COMPLETE

**Deliverable:** ✅ Professional interactive charts replacing CSS-based visualizations

---

### Step 9: API Integration & Frontend Redesign ✅ COMPLETE
**Goal:** Connect visualization module to API and render charts in frontend

- [x] Update `/api/main.py`:
  - Import visualizations module
  - Create `/api/funnel_chart` endpoint
  - Create `/api/time_distribution` endpoint
  - Create `/api/comparison_charts` endpoint
  - Error handling and fallbacks
- [x] Update `requirements.txt`:
  - Add plotly==5.24.1
- [x] Test endpoints locally (all working)
- [x] Frontend Dashboard Redesign:
  - Add Plotly.js CDN to page
  - Replace CSS funnel bars with Plotly funnel chart
  - Add time distribution histogram
  - Add success rate comparison chart
  - Add average time comparison chart with CI error bars
  - Update polling logic to refresh all charts
  - Verify real-time updates work
- [x] Deployment fixes:
  - Remove catch-all route from API
  - Fix CORS configuration
  - Deploy to Fly.io successfully

**Completion Status:** `[x]` COMPLETE

**Deliverable:** ✅ Professional, interactive Plotly dashboard with real-time statistical insights

---

## Phase 2C: Content Generation & Enhancement

### Step 11: Blog Post Creation (Data-Driven)
**Goal:** Write SOMA blog post with real experimental findings

- [ ] Collect data for 2-4 weeks (target: 500+ completions)
- [ ] Export all events from Supabase
- [ ] Run statistical analysis using stats.py:
  - Completion rates by variant (with significance tests)
  - Time distribution analysis
  - Repeat behavior patterns
  - Effect sizes and practical significance
- [ ] Generate visualizations using visualizations.py:
  - Funnel comparison charts
  - Time distribution overlays
  - Key findings summary charts
- [ ] Write blog post: "We Built an A/B Test Simulator - Here's What We Learned"
  - Hypothesis and experimental design
  - Results with statistical rigor
  - Insights and learnings
  - Python code snippets (pandas, scipy)
  - Interactive charts embedded
  - Interpretation and conclusions
- [ ] Link blog post from simulator page
- [ ] Promote on LinkedIn

**Completion Status:** `[ ]` Not Started

**Target Date:** November 15, 2025 (after 2-4 weeks data collection)

**Deliverable:** Professional blog post demonstrating full experimental cycle (design → execute → analyze → communicate)

---

### Step 12: Multiple Puzzle Types
- [ ] Add logic puzzle option
- [ ] Add pattern recognition puzzle
- [ ] Randomly select puzzle type per session
- [ ] Track puzzle type in metadata
- [ ] Update stats.py to analyze by puzzle type

**Completion Status:** `[ ]` Not Started

---

## Phase 2D: Cross-Device Persistence

### Step 13: User Persistence Across Devices
**Goal:** Move from localStorage to Supabase for cross-device leaderboard

- [ ] Create `users` table in Supabase:
  - id (uuid)
  - username (varchar)
  - browser_fingerprint (varchar)
  - created_at (timestamp)
- [ ] Implement browser fingerprinting (FingerprintJS or similar)
- [ ] On first visit: create user in Supabase, store fingerprint
- [ ] On return visit: look up user by fingerprint, restore username
- [ ] Update leaderboard to use Supabase user_id instead of localStorage
- [ ] Migrate existing localStorage leaderboard to Supabase
- [ ] Test across devices (same user, different browsers)
- [ ] Handle fingerprint collisions gracefully

**Completion Status:** `[ ]` Not Started

---

## Nice to Have (Future Phase)

### Social Features
- [ ] Add "Share Your Time" button
- [ ] Generate shareable text: "I solved it in 12 seconds on Variant B!"
- [ ] Create social media share links (Twitter, LinkedIn)
- [ ] Social proof: "X people played today"

---

## Database Schema

### Events Table - Current Fields
```sql
-- Core fields:
id, experiment_id, user_id, variant, converted, timestamp, metadata

-- Phase 2 additions (COMPLETED):
action_type VARCHAR -- 'started', 'completed', 'attempted'
completion_time NUMERIC -- seconds with decimals (e.g., 12.345)
success BOOLEAN
correct_words_count INTEGER -- number of correct words found
total_guesses_count INTEGER -- total number of guesses made
leaderboard_username VARCHAR -- for future leaderboard feature
```

---

## File Structure
```
project-root/
├── .github/
│   └── workflows/
│       └── deploy.yml          # ✅ Auto-deploy configuration
├── api/
│   ├── main.py                 # ✅ FastAPI app
│   ├── stats.py                # ✅ Statistical analysis module
│   ├── visualizations.py       # ✅ Plotly charts module
│   ├── requirements.txt        # ✅ Python dependencies
│   ├── Dockerfile              # ✅ Docker build for API
│   └── fly.toml                # ✅ Fly.io config for API
├── content/
│   └── experiments/
│       └── ab-test-simulator.md # ✅ Main simulator page
├── static/
│   ├── js/
│   │   └── ab-simulator.js     # ✅ Frontend logic (updated for production)
│   └── css/
│       └── ab-simulator.css    # ✅ Styles (cleaned up)
├── Dockerfile                   # ✅ Docker build for Hugo
├── fly.toml                     # ✅ Fly.io config for Hugo
├── hugo.toml                    # ✅ Hugo configuration
└── .env                         # 🔒 Local environment variables (not in git)
```

---

## Success Criteria

### Phase 2A MVP ✅ COMPLETE
- [x] Word search puzzle displays correctly for both variants
- [x] Completion time tracked accurately
- [x] Events stored in Supabase with all fields
- [x] Leaderboard shows top 10 users with times
- [x] Username persists across sessions
- [x] Funnel shows started/completed/repeated counts
- [x] Funnel updates live when polling enabled
- [x] No console errors on local or production
- [x] Mobile responsive without major layout issues
- [x] Generated 100+ events in testing

### Phase 2B Data Science Backend ✅ COMPLETE
- [x] Statistical analysis module with pandas/scipy
- [x] T-tests, chi-square, Cohen's d effect sizes
- [x] Percentile calculations and difficulty analysis
- [x] Interactive Plotly charts (funnel, time distribution, comparisons)
- [x] Real-time dashboard updates
- [x] Production deployment working (Fly.io)
- [x] CORS configured correctly
- [x] API health check responding

---

## Tracking Notes

**Start Date:** October 18, 2025
**Phase 2A Completed:** October 19, 2025 ✅
**Phase 2B Completed:** October 20, 2025 ✅
**Deployment to Fly.io Completed:** October 20, 2025 ✅
**Blog Post Target:** November 15, 2025 (after 2-4 weeks data collection)

**Blockers/Issues:**
- None currently

**Completed Features:**
- ✅ Phase 2A: Steps 0-6 (MVP Complete)
- ✅ Phase 2B Steps 7-9: Data Science Backend Complete
  - Statistical analysis module (stats.py) with pandas/scipy
  - T-tests, chi-square, Cohen's d effect sizes
  - Percentile calculations and difficulty analysis
  - Plotly visualization module (visualizations.py)
  - Interactive charts: funnel, time distribution, success rate, avg time
  - API endpoints: /api/funnel_chart, /api/time_distribution, /api/comparison_charts
  - Frontend Plotly integration with real-time updates
- ✅ Deployment to Fly.io
  - Hugo static site deployed
  - Python API deployed
  - GitHub Actions auto-deploy configured
  - CORS and environment variables configured
- ✅ Real-time dashboard with polling toggle
- ✅ Username display and leaderboard
- ✅ Production testing verified

**Phase 2A & 2B Status:** `[x]` COMPLETE

**Current Phase:** Ready to collect data for 2-4 weeks, then move to Phase 2C (Blog Post Creation)

**Next Up:**
- Collect data for 2-4 weeks (target: 500+ completions)
- Step 11: Blog Post Creation (Phase 2C)
- Optional: Step 13: Cross-device persistence (Phase 2D)

**Key Decisions Made:**
- ✅ Data science-first approach with pandas/scipy/plotly
- ✅ Separation of concerns (stats.py, visualizations.py)
- ✅ Interactive Plotly charts replaced CSS visualizations
- ✅ Focus on statistical rigor for blog post credibility
- ✅ Deployed to Fly.io for better Python/data science support
- ✅ Auto-deploy via GitHub Actions with path filtering
- ✅ Removed deployment complexity (one workflow, Docker-based)

---

## Notes

- Stats module is reusable for future blog posts and analysis
- Plotly charts can be themed/styled further for visual polish
- Fly.io provides room to scale (can add workers, background jobs, ML models)
- Docker ensures same environment local and production
- Auto-deploy workflow ensures GitHub is always in sync with production
- Ready to focus on data collection and content creation