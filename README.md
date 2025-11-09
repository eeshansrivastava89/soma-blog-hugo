# SOMA Blog (ARCHIVED)

Original Hugo blog implementation. **Status:** Local development only (no Fly.io deployment, no DNS routing).

## Quick Reference

**Tech Stack:** Hugo + PostHog + Supabase + custom JavaScript  
**Deployment:** None (kept for reference only)  
**Status:** ✅ Functional locally, 🔴 Not in production

## Local Development

```bash
hugo server -D
# Opens at http://localhost:1313
```

## File Structure
```
├── content/              # Blog posts & pages
├── layouts/              # Hugo templates & shortcodes
├── static/               # CSS, JS, images
├── supabase-schema.sql   # Database schema reference
└── fly.toml              # (Legacy, not deployed)
```

## What This Was

A static Hugo blog with:
- A/B testing puzzle game (word search)
- PostHog event tracking + feature flags
- Supabase data warehouse integration
- Embedded Streamlit dashboard (iframe)

**Replaced by:** [soma-portfolio](../soma-portfolio) (Astro) - now in production at https://eeshans.com

## Reference

- Blog posts: `content/posts/`
- Puzzle code: `static/js/ab-simulator.js`
- Analytics pipeline: `supabase-schema.sql`

See [PROJECT_HISTORY.md](../soma-portfolio/PROJECT_HISTORY.md) for full architecture.