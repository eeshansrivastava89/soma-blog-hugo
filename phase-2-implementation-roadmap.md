# Phase 2 Implementation Roadmap: Gamification & Engagement

## Overview
Transform the A/B simulator from static stats display to engaging gamified experience with professional data science backend. Focus: Puzzle engagement → Data generation → Statistical analysis → Blog content.

---

## Phase 2A: MVP (Core Gamification) ✅ COMPLETE

### Step 0: Database Schema Update ✅
- [x] Add `action_type` column to events table
- [x] Add `completion_time` column to events table
- [x] Add `success` column to events table
- [x] Add `correct_words_count` column to events table
- [x] Add `total_guesses_count` column to events table
- [x] Drop old `attempts_count` column
- [x] Verify columns exist in Supabase

### Step 1: Puzzle Engine ✅
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

### Step 2: Event Tracking Enhancement ✅
- [x] Add `action_type` field to events (started/completed/attempted)
- [x] Add `completion_time` field to events
- [x] Add `success` field to events
- [x] Add `correct_words_count` and `total_guesses_count` fields
- [x] Send all data to `/api/track` endpoint
- [x] Verify events store correctly in Supabase
- [x] Test both variants independently

### Step 3: Feedback & Celebration ✅
- [x] Show sleek inline completion message (no modal)
- [x] Display completion time: "00:10:45"
- [x] Show variant comparison: "⚡ 2.5s faster than B | A avg: 9.0s"
- [x] Add "Try Again" button
- [x] Add "View Stats" link (scrolls to dashboard)
- [x] Test on desktop and mobile
- [x] Compact 4-line design with minimal spacing

### Step 4: Leaderboard (localStorage-based) ✅
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

### Step 5: Basic Funnel Visualization ✅
- [x] Track "started" events (puzzle displayed)
- [x] Track "completed" events (puzzle solved)
- [x] Track "repeated" events (user clicked "Try Again")
- [x] Calculate funnel metrics per variant in API
- [x] Display funnel bars for Variant A and B side-by-side
- [x] Global max scaling for visual comparison across variants
- [x] Add CSS for funnel visualization
- [x] Update funnel in real-time with polling toggle
- [x] Test data accuracy

### Step 6: Testing & Verification ✅
- [x] Test locally: Create 10+ events, verify leaderboard works
- [x] Test locally: Refresh page, verify username persists
- [x] Add username display to Challenge section
- [x] Test Vercel: Click puzzle, record completion
- [x] Test Vercel: Check Supabase events table
- [x] Test Vercel: Enable live refresh, watch funnel update
- [x] Test Vercel: Click 5+ times, verify leaderboard ranking
- [x] Test mobile responsiveness (good enough for MVP)
- [x] Verify no console errors (all clear, API returns 200)

**Phase 2A Status:** ✅ COMPLETE

---

## Phase 2B: Data Science Backend & Advanced Analytics

### Step 7: Statistical Analysis Module (`stats.py`)
**Goal:** Professional pandas/scipy-based statistical analysis

- [ ] Create `/api/stats.py` module
- [ ] Load Supabase events into pandas DataFrame
- [ ] Calculate core metrics:
  - Completion rates by variant
  - Average completion times with confidence intervals
  - Success rates
  - Repeat rates
- [ ] Statistical tests:
  - T-test for completion time differences
  - Chi-square for success rate differences
  - Effect size calculations (Cohen's d)
  - Statistical power analysis
- [ ] Percentile calculations:
  - User's percentile rank within variant
  - Percentile rank across all users
  - Distribution quartiles
- [ ] Difficulty analysis:
  - Relative difficulty (B vs A completion time ratio)
  - Difficulty badges (easy/medium/hard based on percentiles)
- [ ] Return structured JSON with all statistics
- [ ] Unit tests for statistical functions

**Deliverable:** Clean, reusable data science module that powers all analytics

### Step 8: Visualization Module (`visualizations.py`)
**Goal:** Interactive Plotly charts for real-time data visualization

- [ ] Create `/api/visualizations.py` module
- [ ] Funnel chart (Plotly):
  - Interactive funnel with hover details
  - Side-by-side A/B comparison
  - Real-time update capability
  - Mobile-responsive
- [ ] Time distribution histogram:
  - Completion time distribution by variant
  - Overlay curves for comparison
  - Percentile markers
- [ ] Percentile ranking chart:
  - Show user's position in distribution
  - Highlight user's score
- [ ] Comparison charts:
  - Success rates with confidence intervals
  - Average times with error bars
- [ ] Return Plotly JSON format for frontend rendering

**Deliverable:** Professional interactive charts that replace CSS-based visualizations

### Step 9: API Integration
**Goal:** Connect stats and visualization modules to FastAPI endpoints

- [ ] Update `/api/main.py`:
  - Import stats and visualizations modules
  - Create `/api/stats` endpoint (use stats.py)
  - Create `/api/funnel` endpoint (use visualizations.py)
  - Create `/api/distribution` endpoint
  - Add caching for expensive calculations
  - Error handling and fallbacks
- [ ] Update `requirements.txt`:
  - Add plotly
  - Update scipy/pandas versions if needed
- [ ] Test endpoints locally
- [ ] Deploy to Vercel and verify

**Deliverable:** Clean API that separates concerns (endpoints → stats → visualizations)

### Step 10: Frontend Dashboard Redesign
**Goal:** Replace CSS-based dashboard with Plotly-rendered interactive charts

- [ ] Add Plotly.js to frontend
- [ ] Replace CSS funnel bars with Plotly funnel chart
- [ ] Add time distribution chart below funnel
- [ ] Add percentile ranking display
- [ ] Update polling logic to refresh charts
- [ ] Show difficulty messaging:
  - "Variant B is 23% harder on average"
  - "You're faster than 67% of players"
  - Difficulty badge on puzzle
- [ ] Add loading states for charts
- [ ] Test chart responsiveness
- [ ] Verify real-time updates work

**Deliverable:** Professional, interactive dashboard with real-time statistical insights

### Step 11: Visual Polish
- [x] Add celebration animation on correct answer
- [x] Add error shake animation on wrong answer
- [x] Better progress bars in funnel (NOW: Plotly charts)
- [x] Add color coding (green for A, blue for B)
- [x] Ensure dark mode compatibility (CSS variables added)
- [ ] Polish Plotly chart themes for dark mode
- [ ] Smooth chart transition animations

**Completion Status:** `[~]` 6/7 complete

---

## Phase 2C: Content Generation & Enhancement

### Step 12: Blog Post Creation (Data-Driven)
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

**Deliverable:** Professional blog post demonstrating full experimental cycle (design → execute → analyze → communicate)

### Step 13: Multiple Puzzle Types
- [ ] Add logic puzzle option
- [ ] Add pattern recognition puzzle
- [ ] Randomly select puzzle type per session
- [ ] Track puzzle type in metadata
- [ ] Update stats.py to analyze by puzzle type

**Completion Status:** `[ ]` Not Started

---

## Phase 2D: Cross-Device Persistence

### Step 14: User Persistence Across Devices
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
correct_words_count INTEGER
total_guesses_count INTEGER
leaderboard_username VARCHAR
```

### Users Table - Future (Step 14)
```sql
id UUID PRIMARY KEY
username VARCHAR
browser_fingerprint VARCHAR UNIQUE
created_at TIMESTAMP
```

---

## File Structure
```
soma-blog-hugo/
├── content/experiments/ab-test-simulator.md (UPDATE: Plotly charts)
├── api/
│   ├── main.py              (UPDATE: new endpoints)
│   ├── stats.py             (NEW: statistical analysis)
│   ├── visualizations.py    (NEW: Plotly charts)
│   └── requirements.txt     (UPDATE: add plotly)
├── static/
│   ├── js/
│   │   └── ab-simulator.js  (UPDATE: Plotly rendering)
│   └── css/
│       └── ab-simulator.css (KEEP: dark mode variables)
```

---

## Success Criteria

### Phase 2B (Data Science Backend)
- [ ] stats.py produces accurate statistical analysis
- [ ] Plotly charts render correctly and update in real-time
- [ ] API endpoints return structured JSON
- [ ] Dashboard shows professional interactive visualizations
- [ ] All statistical tests properly implemented
- [ ] Mobile responsive charts

### Phase 2C (Content)
- [ ] Blog post published with real experimental data
- [ ] Python code snippets show analytical rigor
- [ ] Interactive charts embedded in blog post
- [ ] Post linked from simulator

### Phase 2D (Persistence)
- [ ] Users can see their scores across devices
- [ ] Leaderboard persists in Supabase
- [ ] Fingerprinting works reliably

---

## Tracking Notes

**Phase 2A Completed:** October 19, 2025 ✅
**Phase 2B Target:** November 2, 2025
**Phase 2C Target:** November 15, 2025 (after data collection)
**Phase 2D Target:** November 22, 2025

**Current Focus:** Step 7 - Building statistical analysis module

**Blockers/Issues:**
- None currently

**Key Decisions:**
- ✅ Data science-first approach with pandas/scipy/plotly
- ✅ Separation of concerns (stats.py, visualizations.py)
- ✅ Interactive Plotly charts replace CSS visualizations
- ✅ Focus on statistical rigor for blog post credibility

---

## O1 Visa Narrative

"Built production-grade A/B testing simulator with professional data science backend. Implemented statistical analysis pipeline using pandas and scipy for causal inference (t-tests, chi-square, effect sizes, confidence intervals). Created interactive real-time data visualizations using Plotly. Designed and executed behavioral experiment, collected 500+ user interactions, and published findings demonstrating expertise in experimental design, statistical analysis, and data communication. Full stack: Python (FastAPI, pandas, scipy, plotly) + JavaScript + PostgreSQL."