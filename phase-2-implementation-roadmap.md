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
- [ ] Update funnel in real-time with polling toggle (needs JS update)
- [ ] Test data accuracy

**Completion Status:** `[~]` MOSTLY DONE (visualization added, need to wire up live updates)

### Step 6: Testing & Verification
- [ ] Test locally: Create 10+ events, verify leaderboard works
- [ ] Test locally: Refresh page, verify username persists
- [ ] Test Vercel: Click puzzle, record completion
- [ ] Test Vercel: Check Supabase events table
- [ ] Test Vercel: Enable live refresh, watch funnel update
- [ ] Test Vercel: Click 5+ times, verify leaderboard ranking
- [ ] Test mobile responsiveness
- [ ] Verify no console errors

**Completion Status:** `[ ]` Not Started

---

## Phase 2B: Polish & Refinement

### Step 7: Visual Polish
- [ ] Add celebration animation on correct answer
- [ ] Add error shake animation on wrong answer
- [ ] Improve modal styling
- [ ] Better progress bars in funnel
- [ ] Add color coding (green for A, blue for B)
- [ ] Ensure dark mode compatibility
- [ ] Test all animations on mobile

### Step 8: Difficulty Messaging
- [ ] Calculate average completion time per variant
- [ ] Show comparison: "Variant B is 23% harder on average"
- [ ] Display difficulty badge on puzzle
- [ ] Show user's percentile: "You're faster than 67% of players"

### Step 9: Sound Effects (Optional)
- [ ] Add success sound effect
- [ ] Add error sound effect
- [ ] Add toggle for sound on/off
- [ ] Test audio on different devices

### Step 10: Mobile Optimization
- [ ] Test puzzle on mobile
- [ ] Optimize button sizes for touch
- [ ] Ensure leaderboard is readable on small screens
- [ ] Test form input on mobile keyboard
- [ ] Fix any layout issues

**Completion Status:** `[ ]` Not Started

---

## Phase 2C: Enhancement & Content

### Step 11: Multiple Puzzle Types
- [ ] Add word puzzle option
- [ ] Add logic puzzle option
- [ ] Randomly select puzzle type per session
- [ ] Track puzzle type in metadata

### Step 12: Social Features
- [ ] Add "Share Your Time" button
- [ ] Generate shareable text: "I solved it in 12 seconds on Variant B!"
- [ ] Create social media share links (Twitter, LinkedIn)

### Step 13: Blog Post Creation
- [ ] Collect data for 2-4 weeks
- [ ] Export all events from Supabase
- [ ] Analyze: Completion rates by variant
- [ ] Analyze: Time distribution
- [ ] Analyze: Repeat behavior patterns
- [ ] Write SOMA blog post: "We Built an A/B Test Simulator - Here's What We Learned"
- [ ] Include Python code snippet showing analysis
- [ ] Link blog post from simulator page

### Step 14: Data Dashboard (Meta-Analytics)
- [ ] Create view showing:
  - Total users
  - Total completions
  - Average completion time per variant
  - Completion rate by variant
  - Repeat rate by variant
  - Funnel drop-off analysis

**Completion Status:** `[ ]` Not Started

---

### Step 15: Cross-Device User Persistence
- [ ] Create `users` table in Supabase with columns:
  - id (uuid)
  - username (varchar)
  - browser_fingerprint (varchar)
  - created_at (timestamp)
- [ ] Implement browser fingerprinting (using FingerprintJS or similar)
- [ ] On first visit: create user in Supabase, store fingerprint
- [ ] On return visit: look up user by fingerprint, restore username
- [ ] Update leaderboard to use Supabase user_id instead of localStorage username
- [ ] Test across devices (same user, different browsers)
- [ ] Handle fingerprint collisions gracefully

**Completion Status:** `[ ]` Not Started

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

## Success Criteria (Phase 2A MVP)

- [x] Word search puzzle displays correctly for both variants
- [x] Completion time tracked accurately
- [x] Events stored in Supabase with all fields
- [ ] Leaderboard shows top 10 users with times
- [ ] Username persists across sessions
- [ ] Funnel shows started/completed/repeated counts
- [ ] Funnel updates live when polling enabled
- [ ] No console errors on local or Vercel
- [ ] Mobile responsive without major layout issues
- [ ] Generate 100+ events in testing

---

## Tracking Notes

**Start Date:** October 18, 2025
**Phase 2A Target:** October 25, 2025
**Phase 2B Target:** November 1, 2025
**Blog Post Target:** November 15, 2025 (after 2-4 weeks data collection)

**Blockers/Issues:**
- None currently

**Completed Features:**
- ✅ Step 0: Database schema updated with new columns
- ✅ Step 1: Word search puzzle engine with timer and validation
- ✅ Event tracking with completion_time, success, correct_words_count, total_guesses_count
- ✅ Both variants working on local and Vercel
- ✅ Data logging correctly to Supabase
- ✅ Step 3: Sleek inline completion message with variant comparison
- ✅ Real-time average completion time fetching from API
- ✅ Compact 4-line UX: Challenge Complete | Time & Guesses | Comparison | Buttons
- ✅ 60-second countdown timer
- ✅ Failure tracking for timeouts (converted: false)
- ✅ Step 4: Leaderboard with personal bests, current attempt display, and position tracking
- ✅ Step 5: Funnel tracking (started/completed/repeated events) with visualization

**Next Up:**
- Wire up funnel to update live with polling
- Step 6: Testing & Verification

---

## Notes

- Step 2 may be redundant since event tracking was completed in Step 1
- Consider moving directly to Step 3 (Feedback & Celebration)
- Need to add "started" event tracking for funnel analysis (currently only tracking "completed")
