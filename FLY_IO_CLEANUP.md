# Fly.io Cleanup Guide

**Status:** GitHub workflow cleaned  
**Next Step:** Remove old FastAPI app from Fly.io dashboard

---

## Current State

### Active Apps
- ✅ `soma-blog-hugo-shy-bird-7985` - Hugo blog (KEEP)

### Removed Apps (To Clean Up in Dashboard)
- ❌ `api-spring-night-5744` (or similar) - FastAPI app (REMOVE)

---

## Manual Cleanup

Since the FastAPI app was deployed separately to Fly.io, you need to manually remove it from the Fly.io dashboard:

### Option 1: Via Fly.io Dashboard
1. Go to https://fly.io
2. Sign in
3. Find the API app (name like `api-*`)
4. Click on it
5. Go to Settings
6. Scroll to "Delete App"
7. Confirm deletion

### Option 2: Via CLI
```bash
# List all your apps
flyctl apps list

# Destroy the old API app (replace with actual name)
flyctl apps destroy api-spring-night-5744

# Confirm: type app name when prompted
```

---

## GitHub Workflow Changes

✅ **Deploy.yml simplified:**
- Removed path-filtering for `api/**`
- Removed `deploy-api` job completely
- Removed `changes` job (no longer needed)
- Now: Single Hugo deploy job only
- Result: 50 lines → 20 lines (60% reduction)

---

## Summary of Complete Cleanup

| Component | Status | Details |
|-----------|--------|---------|
| Hugo code | ✅ Clean | PostHog → Supabase → Streamlit only |
| CSS | ✅ Clean | 93 lines of dead code removed |
| JavaScript | ✅ Clean | Debug logs removed |
| GitHub workflow | ✅ Clean | FastAPI deployment removed |
| Fly.io Hugo app | ✅ Active | `soma-blog-hugo-shy-bird-7985` |
| Fly.io API app | ❌ Orphaned | To be manually deleted |

---

## Next Steps

1. Delete the old FastAPI Fly.io app (via dashboard or CLI above)
2. Verify Hugo deployment still works
3. All cleanup complete! ✅

---

## Verification

After Fly.io cleanup, verify:
```bash
flyctl apps list
# Should show only: soma-blog-hugo-shy-bird-7985

# Verify GitHub actions
# Go to: https://github.com/eeshansrivastava89/soma-blog-hugo/actions
# Latest workflow should show only "Deploy Hugo Site"
```
