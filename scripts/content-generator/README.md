# LocalizeShots Content Generator

Automated content generation system for LocalizeShots blog and pages.

## Features

- **Automatic blog generation**: AI-powered blog articles on ASO topics
- **Page generation**: Tools, landing pages, comparison pages
- **Auto-deploy**: Commits, pushes, and deploys to Coolify
- **Reports**: Daily markdown reports of generated content

## Schedule

| Time | Content |
|------|---------|
| 09:00 | 1 blog article + 1 page |
| 18:00 | 1 blog article |

**Total**: 2 blog articles + 1 page per day

## Setup

```bash
# Run setup script
./setup.sh
```

This will:
1. Create logs and reports directories
2. Install launchd jobs for scheduling
3. Set up automatic daily runs

## Manual Usage

```bash
# Generate blog only
node generate-content.cjs --type=blog

# Generate page only
node generate-content.cjs --type=page

# Generate both
node generate-content.cjs --type=both
```

## Topic Queues

### Blog Topics (15 articles)
1. 10 Common App Store Screenshot Mistakes
2. A/B Testing App Store Screenshots
3. Seasonal ASO Strategies
4. Mobile Game Screenshot Strategies
5. App Subtitle Optimization
6. Competitor Screenshot Analysis
7. App Preview Videos Guide
8. ASO for SaaS Apps
9. App Ratings and Reviews Strategy
10. Google Play vs App Store ASO
11. Screenshot Copywriting Formulas
12. ASO Keyword Research 2026
13. Localization ROI Calculator
14. App Store Feature Graphics
15. Essential ASO Metrics and KPIs

### Page Topics (10 pages)
1. Screenshot Size Guide (tool)
2. ASO Checklist (tool)
3. Screenshot Templates (landing)
4. LocalizeShots vs StoreMaven (comparison)
5. LocalizeShots vs AppFollow (comparison)
6. Screenshot Generator for Fitness Apps (industry)
7. Screenshot Generator for Gaming (industry)
8. AI Headline Generator (tool)
9. Metadata Analyzer (tool)
10. AI Icon Generator (tool)

## File Structure

```
content-generator/
├── generate-content.cjs    # Main generator script
├── state.json            # Tracks generation progress
├── run-morning.sh        # Morning run wrapper
├── run-evening.sh        # Evening run wrapper
├── setup.sh              # Installation script
├── launchd/              # macOS scheduler configs
│   ├── com.localizeshots.content-morning.plist
│   └── com.localizeshots.content-evening.plist
├── logs/                 # Execution logs
└── reports/              # Daily markdown reports
```

## Reports

Reports are saved to `reports/YYYY-MM-DD.md` with:
- Generated content titles and URLs
- Success/failure status
- Deployment info
- Timestamps

## Troubleshooting

### Check if jobs are running
```bash
launchctl list | grep localizeshots
```

### View logs
```bash
tail -f logs/morning-$(date +%Y-%m-%d).log
tail -f logs/evening-$(date +%Y-%m-%d).log
```

### Reload jobs
```bash
launchctl unload ~/Library/LaunchAgents/com.localizeshots.content-*.plist
launchctl load ~/Library/LaunchAgents/com.localizeshots.content-morning.plist
launchctl load ~/Library/LaunchAgents/com.localizeshots.content-evening.plist
```

### Manual test run
```bash
cd /Users/ivorobyev/projects/localizeshots/scripts/content-generator
node generate-content.cjs --type=both
```

## Dependencies

- Node.js 18+
- OpenAI API key (in server/.env)
- Git configured for push
- Coolify API access
