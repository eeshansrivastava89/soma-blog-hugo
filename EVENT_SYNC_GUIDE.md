# Event Sync Configuration Guide

**Purpose:** Ensure PostHog webhook and batch export feed the same filtered events to Supabase  
**Status:** Ready to implement  
**Expected Time:** 5-10 minutes

---

## Quick Summary

**Problem:** 
- Supabase has ~200 rows (from webhook)
- PostHog has ~800 rows (from all events)
- Batch export fails on duplicate UUID

**Solution:**
- Configure batch export to filter 3 events (match webhook)
- Both sources now in sync
- No more duplicate errors

---

## Step-by-Step Implementation

### STEP 1: Open PostHog Batch Export Settings

**Navigate to:**
```
1. PostHog Dashboard (https://us.posthog.com)
2. Left sidebar → Data pipelines
3. Find your PostgreSQL export
4. Click on it
5. Click "Configuration" tab
```

**You should see:**
- Status: Active ✅
- Enabled: ON ✅
- Built from template: HTTP Webhook (or similar)
- Interval: Hourly ✅
- Model: Events ✅

---

### STEP 2: Add Event Filters

**Look for:**
- Section titled "Include events"
- Or "Match events and actions"
- Or similar filter section

**Click:** `+ Add filter` or `+ Include event`

**Add these 3 events (one by one):**
1. `puzzle_started`
2. `puzzle_completed`
3. `puzzle_failed`

**After adding, it should show:**
```
✓ puzzle_started
✓ puzzle_completed
✓ puzzle_failed
```

**IMPORTANT:** Do NOT add anything else. Leave empty:
- "Exclude events" section
- "Filters" section (unrelated to event type filtering)

---

### STEP 3: Save Configuration

**Click:** "Save" or "Update" button (usually bottom-right or top-right)

**You should see:**
```
✅ Configuration saved successfully
```

**Wait:** 30 seconds for the UI to update

---

### STEP 4: Wait for Next Hourly Run

**Batch export runs hourly.** Next run will be within 60 minutes.

**To check manually:**
```
Data pipelines → Your export → Logs tab
```

**Look for entry with:**
- Timestamp: Today, recent time
- Status: ✅ Completed (green)
- Message: Should mention ~200-300 events (not 800+)

---

### STEP 5: Verify Sync in Supabase

**Open Supabase:**
```
1. Go to supabase.com dashboard
2. Your project → SQL Editor
3. Run this query:

SELECT 
  event,
  COUNT(*) as count,
  MAX(timestamp) as latest_event
FROM posthog_events
GROUP BY event
ORDER BY count DESC;
```

**Expected output:**
```
event            | count | latest_event
puzzle_completed | ~120  | 2025-10-26 15:30:00+00
puzzle_started   | ~120  | 2025-10-26 15:29:50+00
puzzle_failed    | ~20   | 2025-10-26 15:28:00+00
```

**NOT expected** (would mean filters didn't work):
```
event            | count
page_view        | 500
autocapture      | 200
puzzle_completed | 120
...
```

---

### STEP 6: Check Batch Export Logs

**Navigate to:**
```
PostHog → Data pipelines → Your export → Logs tab
```

**Look for:**
- ✅ Most recent entry (timestamp = today, recent time)
- ✅ Status = "Completed" (green checkmark)
- ❌ NO errors about "UNIQUE constraint violation"
- ❌ NO errors about "duplicate uuid"

**If you see errors:**
- Configuration didn't save properly → Redo Step 2-3
- Batch export hasn't run yet → Wait up to 1 hour

---

### STEP 7: Verify Streamlit Dashboard

**Go to:** https://soma-app-dashboard-bfabkj7dkvffezprdsnm78.streamlit.app/

**Check:**
- ✅ Dashboard loads without errors
- ✅ Stats show reasonable numbers (Control: ~60 events, 4-words: ~60 events)
- ✅ No sudden jumps in event count

**If dashboard breaks:**
- Batch export is still sending extra events
- Run the Supabase query from Step 5 to verify

---

## Verification Checklist

- [ ] PostHog batch export configured with 3 event filters
- [ ] Configuration saved successfully
- [ ] Batch export logs show "Completed" status
- [ ] No "duplicate uuid" or "UNIQUE constraint" errors in logs
- [ ] Supabase query shows only 3 event types (puzzle_started, puzzle_completed, puzzle_failed)
- [ ] Supabase row count is ~200-300 (not 800+)
- [ ] Streamlit dashboard loads and shows correct data
- [ ] No console errors in browser DevTools

---

## Rollback Plan

If something breaks:

**Option 1: Revert batch export filter**
```
PostHog → Data pipelines → Your export → Configuration
→ Click the 3 event filters
→ Click delete (X button) on each
→ Save
→ This reverts to exporting all events
```

**Option 2: Disable batch export temporarily**
```
PostHog → Data pipelines → Your export → Configuration
→ Toggle "Enabled" to OFF
→ Webhook will still work (real-time data)
→ You can debug later
```

**Option 3: Clear Supabase and re-sync**
```sql
-- Only if things get really messed up:
-- DELETE FROM posthog_events;
-- Then re-enable batch export and wait for hourly run
-- Data will repopulate from PostHog
```

---

## FAQ

**Q: Will this delete my existing data?**
A: No. Batch export filters only affect NEW data and reconciliation. Existing ~200 rows stay. New rows will be filtered to 3 events only.

**Q: When will I see the change?**
A: Batch export runs hourly. Next run should happen within 60 minutes. Check logs to see exact time.

**Q: What if I need to add more events later?**
A: Easy! Just:
1. Add event to webhook (already filters puzzle_*)
2. Add same event to batch export filters
3. Done. Both sources in sync.

**Q: Will the Streamlit dashboard break?**
A: No. Dashboard queries use `WHERE event = 'puzzle_completed'` etc, so it automatically adapts to whatever events are in the table.

**Q: Why not just include ALL events in batch export?**
A: That would bloat Supabase with page_view, autocapture, and other junk. Our approach keeps the data clean and lean.

**Q: Can I add event filters without breaking anything?**
A: Yes! Filters only apply to NEW data. Historical data is unaffected. You can always remove filters later (rollback plan above).

---

## Success Criteria

After implementation, you should have:

1. ✅ PostHog batch export configured with 3-event filter
2. ✅ Next batch export run completed successfully (no errors)
3. ✅ Supabase `posthog_events` table contains only 3 event types
4. ✅ Event count stays ~200-300 (stable, not growing from batch exports)
5. ✅ Webhook continues working (<1s latency)
6. ✅ Streamlit dashboard displays correctly
7. ✅ Your data warehouse is clean and maintainable

---

**Questions?** Check the MIGRATION_SUMMARY.md or posthog-streamlit-migration-plan.md for more details on the overall architecture.
