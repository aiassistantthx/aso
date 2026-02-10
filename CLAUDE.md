# Claude Code Guidelines

## Language Requirements

- **All commits must be written in English**
- **All documentation must be written in English**
- Code comments should be in English
- Variable and function names should be in English

## Project Overview

**LocalizeShots** — App Store Screenshot Generator & ASO Tool. A web service for creating localized App Store screenshots with iPhone mockups, AI-generated headlines, metadata, and app icons.

Website: https://localizeshots.com

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Canvas API (image generation)
- JSZip (archive creation)

### Backend
- Node.js + Fastify
- Prisma ORM + PostgreSQL
- OpenAI SDK (gpt-4o-mini for text, DALL-E 3 for icons)

### Deployment
- Coolify (self-hosted PaaS)
- Server: 46.225.26.104
- Domain: https://localizeshots.com
- App UUID: agk8kwowcc48kkwkcsk844wo

## Key Components

### Shared
- `AppHeader` - Unified header with logo, nav links (Projects, Wizard, ASO Texts), plan badge, user info, Profile link, Sign Out

### Dashboard & Editor
- `Dashboard` - Project list with CRUD operations
- `Editor` - Main screenshot editor for manual editing
- `ScreensFlowEditor` - Canvas editor with drag-and-drop mockup positioning
- `StyleEditor` - Style configuration (colors, fonts, mockup settings, decorations)
- `ExportButton` - Export with translation and progress tracking

### Wizard (Auto-generation)
- `WizardPage` - 8-step wizard for automated ASO content generation:
  1. App Info (name, description, keywords)
  2. Screenshots (upload 3+ screenshots)
  3. Services (select: screenshots, icon, metadata)
  4. Tone (visual style & layout selection)
  5. Generate (AI generates headlines, metadata, icon)
  6. Review & Edit (review/editor tabs with alternating colors)
  7. Translate (select languages, "Select All" for PRO, parallel translation)
  8. Export (download localized assets)

### Metadata
- `MetadataPage` - ASO text generation and localization

## AI Prompts (server/src/utils/prompts.ts)

### Headlines Generation
- Model: gpt-4o-mini
- Rules: 3-8 words, TWO separate [brackets] - one for verb, one for benefit
- Example: "[Create] Stunning Videos [Effortlessly]", "[Generate] Content [in Minutes]"

### Metadata Generation (ASO Best Practices)
- appName: "Brand - Key Benefit Phrase" (not keyword list)
- subtitle: Different words from appName
- keywords: Only words NOT in appName/subtitle, no duplicates
- description: First 3 lines crucial, short paragraphs, CTA at end
- whatsNew: Structured with bullet points (New Features, Improvements, Bug Fixes)
- Zero word duplication across appName, subtitle, keywords

### Translation
- Parallel batches of 10 languages
- Incremental: skips already-translated languages
- Preserves [brackets] and | line breaks

## Database Schema (server/prisma/schema.prisma)

Key models:
- `User` - Authentication
- `UnifiedProject` - Single model for all project types (mode: "wizard" | "manual")
- `UnifiedScreenshot` - Screenshot data for unified projects
- `Subscription` - Plan management (FREE/PRO)
- `AdminPrompt` - Customizable AI prompts

Legacy models (kept for backward compatibility):
- `Project`, `Screenshot`, `WizardProject`, `MetadataProject`

## Unified Project Architecture

- **Dashboard** (`src/components/Dashboard.tsx`) - Lists all projects with mode filter
- **WizardPage** (`src/components/WizardPage.tsx`) - 8-step wizard flow
- **Editor** (`src/components/Editor.tsx`) - Manual screenshot editor

API endpoints (`server/src/routes/unified.ts`):
- `GET /api/unified` - List all projects
- `GET /api/unified/:id` - Get project with screenshots
- `POST /api/unified` - Create project { mode, name? }
- `PUT /api/unified/:id` - Update project fields
- `DELETE /api/unified/:id` - Delete project
- `POST /api/unified/:id/screenshots` - Upload screenshot
- `POST /api/unified/:id/generate-all` - AI generate (wizard mode)
- `POST /api/unified/:id/translate` - Translate headlines + metadata

## Code Style

- Use functional React components with hooks
- TypeScript strict mode
- Inline styles (no CSS files)
- Keep components focused and single-purpose

## Deployment Commands

**Coolify API Token** is stored in `/Users/ivorobyev/projects/.claude/settings.local.json` (in permissions allow list).

```bash
# Deploy to Coolify (restart)
curl -s -X POST "http://46.225.26.104:8000/api/v1/applications/agk8kwowcc48kkwkcsk844wo/restart" \
  -H "Authorization: Bearer 2|hjAbdUPchFI55QuEEHIpxJinD2xqtO59gOSPJIvB8736c446"

# Run DB migrations on production
ssh -i ~/.ssh/id_ed25519_hetzner root@46.225.26.104 '
docker run --rm --network coolify \
  -e DATABASE_URL="postgres://aso:aso_secure_2024@bcsc4w84ko8swkcssosgk8ss:5432/aso" \
  $(docker images --format "{{.Repository}}:{{.Tag}}" | grep agk8kwowcc48kkwkcsk844wo | head -1) \
  npx prisma db push --schema=/app/server/prisma/schema.prisma --skip-generate
'

# Check container logs
ssh -i ~/.ssh/id_ed25519_hetzner root@46.225.26.104 \
  "docker logs \$(docker ps --filter 'name=agk8kwowcc48kkwkcsk844wo' -q) --tail 50"
```
