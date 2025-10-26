# SOMA Blog - Science of Marketing Analytics

This is a Hugo-based blog focused on marketing analytics, experimentation, and measurement techniques. The site features an interactive A/B testing simulator that demonstrates enterprise-grade experimentation and analytics workflows.

## Architecture Overview

### Current Stack
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
│    └─ Views for analytics                   │
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

### Components
- **Frontend**: Hugo static site hosted on Fly.io
- **Experimentation**: PostHog for feature flags and A/B testing
- **Data Storage**: Supabase PostgreSQL for event storage and analysis
- **Analytics Dashboard**: Streamlit app hosted on Streamlit Community Cloud
- **Event Pipeline**: Real-time webhooks + batch export for data reliability

## Key Features

### A/B Testing Simulator
- Interactive word-search puzzle game comparing two variants
- Variant A: Find 3 four-letter words (difficulty 3/10)
- Variant B: Find 4 four-letter words (difficulty 5/10)
- Real-time analytics dashboard showing conversion rates and completion times
- Local storage-based leaderboard with personal best tracking

### Analytics Integration
- PostHog-powered experiment assignment (50/50 split)
- Real-time event tracking (start, completion, failure)
- Supabase data warehouse for analysis
- Interactive Streamlit dashboard with live-updating visualizations

## Local Development

### Prerequisites
```bash
# Install Hugo
brew install hugo

# Install Fly.io CLI (optional)
brew install flyctl
```

### Running Locally
```bash
# From project root
hugo server

# Visit: http://localhost:1313
```

## Deployment

### Frontend (Hugo)
- Platform: Fly.io
- Build: Docker (Hugo + nginx)

### CI/CD
- GitHub Actions workflow: `.github/workflows/deploy.yml`
- Auto-deploy on push to `main` branch

## Data Privacy

This site uses PostHog for analytics and A/B testing. The following data is collected:
- Page views and user interactions
- A/B test variant assignments and performance
- Puzzle completion times and success rates
- Unique user identifiers (not personally identifiable information)

## Project Structure
```
.
├── content/                 # Hugo content (posts, pages)
├── layouts/                 # Hugo templates and shortcodes
├── static/                  # Static assets (CSS, JS)
├── themes/                  # Hugo theme (rusty-typewriter)
├── hugo.toml                # Hugo configuration
├── Dockerfile               # Docker build configuration
├── fly.toml                 # Fly.io deployment config
├── supabase-schema.sql      # Supabase database schema
├── supabase-edge-function-posthog-webhook.ts # PostHog webhook handler
├── phase-2-implementation-roadmap.md  # Development history
└── posthog-streamlit-migration-plan.md # Migration documentation
```

## Technologies Used
- **Hugo**: Static site generator
- **PostHog**: Product analytics and experimentation
- **Supabase**: PostgreSQL database and authentication
- **Streamlit**: Interactive data dashboard
- **Fly.io**: Hosting platform
- **GitHub Actions**: CI/CD automation