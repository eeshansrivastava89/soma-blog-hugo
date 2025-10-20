# Phase 2 Implementation Roadmap: Gamification & Engagement

## Overview
Transform the A/B simulator from static stats display to engaging gamified experience. Focus: Puzzle engagement → Data generation → Blog content.

---

## Phase 2A: MVP (Core Gamification)

### Step 0: Database Schema Update
- [x] Add `action_type` column to events table
- [x] Add `completion_time` column to events table
- [x] Add `success` column to events table
- [x] Add `correct_words_count` column to events table
- [x] Add `total_guesses_count` column to events table
- [x] Drop old `attempts_count` column
- [x] Verify columns exist in Supabase

**Completion Status:** `[x]` DONE

---

### Step 1: Puzzle Engine
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

### Step 2: Event Tracking Enhancement
- [x] Add `action_type` field to events (started/completed/attempted)
- [x] Add `completion_time` field to events
- [x] Add `success` field to events
- [x] Add `correct_words_count` and `total_guesses_count` fields
- [x] Send all data to `/api/track` endpoint
- [x] Verify events store correctly in Supabase
- [x] Test both variants independently

**Completion Status:** `[x]` DONE (completed as part of Step 1)

**Note:** Most of this was completed in Step 1. Need to verify if any additional tracking is needed.

### Step 3: Feedback & Celebration
- [x] Show sleek inline completion message (no modal)
- [x] Display completion time: "00:10:45"
- [x] Show variant comparison: "⚡ 2.5s faster than B | A avg: 9.0s"
- [x] Add "Try Again" button
- [x] Add "View Stats" link (scrolls to dashboard)
- [x] Test on desktop and mobile
- [x] Compact 4-line design with minimal spacing

**Completion Status:** `[x]` DONE

### Step 4: Leaderboard (localStorage-based)
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

### Step 5: Funnel Visualization
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

### Step 6: Testing & Verification
- [x] Test locally: Create 10+ events, verify leaderboard works
- [x] Test locally: Refresh page, verify username persists
- [x] Add username display to Challenge section
- [x] Test Vercel: Click puzzle, record completion
- [x] Test Vercel: Check Supabase events table
- [x] Test Vercel: Enable live refresh, watch funnel update
- [x] Test Vercel: Click 5+ times, verify leaderboard ranking
- [x] Test mobile responsiveness (good enough for MVP)
- [x] Verify no console errors (all clear, API returns 200)

**Completion Status:** `[x]` DONE

---

## Phase 2B: Data Science Backend & Advanced Analytics

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
- [x] Add dark mode compatibility (CSS variables)

**Completion Status:** `[x]` COMPLETE

**Code Removed:**
- Old pandas/scipy logic from main.py (replaced by stats.py)
- Hardcoded statistical calculations
- Modal-related CSS (not used)

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
- [x] Remove dark mode support (simplified CSS)
- [x] Remove modal CSS bloat (not used)
- [x] Remove old CSS funnel code from JavaScript

**Completion Status:** `[x]` COMPLETE

**Code Removed:**
- CSS funnel bar styles and JavaScript update logic
- Dark mode CSS variables and media queries
- Modal-related CSS (unused)
- All var() references replaced with direct colors

**Deliverable:** ✅ Professional, interactive Plotly dashboard with real-time statistical insights

**Note:** Plotly chart theming can be refined later for visual polish

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
soma-blog-hugo/
├── content/experiments/ab-test-simulator.md (UPDATED: word search puzzle)
├── api/main.py (UPDATED: tracks new fields)
├── static/
│   ├── js/
│   │   ├── puzzle-engine.js (embedded in .md currently)
│   │   └── leaderboard.js (TO BE CREATED)
│   └── css/
│       ├── puzzle.css (embedded in .md currently)
│       └── leaderboard.css (TO BE CREATED)
```

---

## Deployment History & Current Setup

### Platform Migration Journey
- **Vercel (Failed):** Could not handle Python workload, especially Plotly dependencies (200MB+). Serverless functions timed out.
- **Railway (Failed):** Similar issues with heavy Python dependencies and memory constraints.
- **Render (Current):** Using Blueprint with separate frontend/backend services.

### Current Render Configuration
```yaml
# render.yaml - Blueprint Setup
services:
  # Frontend: Hugo Static Site
  - type: web
    name: hugo-frontend
    runtime: static
    buildCommand: hugo --gc --minify
    staticPublishPath: public
    routes:
      - type: rewrite
        source: /api/*
        destination: http://python-api:10000/api/*

  # Backend: Python API
  - type: web
    name: python-api
    runtime: python
    plan: free
    buildCommand: pip install -r api/requirements.txt
    startCommand: uvicorn api.main:app --host 0.0.0.0 --port 10000
    healthCheckPath: /api/health
```

### Known Issues (Current)
- **502 Errors:** API endpoints returning 502 despite clean Python logs
- **Root Cause:** Service routing and dependency loading issues
- **Status:** Under investigation and fixing

---

## Success Criteria (Phase 2A MVP)

- [x] Word search puzzle displays correctly for both variants
- [x] Completion time tracked accurately
- [x] Events stored in Supabase with all fields
- [ ] Leaderboard shows top 10 users with times
- [ ] Username persists across sessions
- [ ] Funnel shows started/completed/repeated counts
- [ ] Funnel updates live when polling enabled
- [ ] **Deploy successfully on Render without 502 errors**
- [ ] Mobile responsive without major layout issues
- [ ] Generate 100+ events in testing

---

## Tracking Notes

**Start Date:** October 18, 2025
**Phase 2A Completed:** October 19, 2025 ✅
**Phase 2B Target:** October 26, 2025
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
  - Removed dark mode and CSS bloat
- ✅ Real-time dashboard with polling toggle
- ✅ Cache busting for Vercel deployments
- ✅ Username display and leaderboard
- ✅ Vercel Speed Insights integration

**Phase 2A MVP Status:** `[x]` COMPLETE
**Phase 2B Data Science Backend Status:** `[x]` COMPLETE

**Current Phase:** Ready to deploy and test on Vercel, then collect data for blog post

**Next Up:**
- Deploy to Vercel
- Test all features in production
- Collect data for 2-4 weeks
- Step 11: Blog Post Creation (Phase 2C)

**Key Decisions Made:**
- ✅ Data science-first approach with pandas/scipy/plotly
- ✅ Separation of concerns (stats.py, visualizations.py)
- ✅ Interactive Plotly charts replaced CSS visualizations
- ✅ Removed dark mode complexity
- ✅ Focus on statistical rigor for blog post credibility
- 🔄 Plotly chart theming to be refined later

---

## Notes

- Removed old statistical calculation code from main.py (now in stats.py)
- Modal-related CSS removed (not used)
- Stats module is reusable for future blog posts and analysis
