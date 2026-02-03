# Claude Code Guidelines

## Language Requirements

- **All commits must be written in English**
- **All documentation must be written in English**
- Code comments should be in English
- Variable and function names should be in English

## Project Overview

This is an App Store Screenshot Generator - a web service for creating localized App Store screenshots with iPhone mockups. Includes an ASO Wizard for automated generation of screenshots, metadata, and app icons.

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
- App URL: http://agk8kwowcc48kkwkcsk844wo.46.225.26.104.sslip.io

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
- `WizardPage` - 9-step wizard for automated ASO content generation:
  1. App Info (name, description, keywords)
  2. Screenshots (upload 3+ screenshots)
  3. Services (select: screenshots, icon, metadata)
  4. Tone (professional, playful, minimal, etc.)
  5. Languages (select target languages, "Select All" for PRO)
  6. Generate (AI generates headlines, metadata, icon)
  7. Review & Edit (review/editor tabs with alternating colors)
  8. Translate (parallel translation, batches of 10)
  9. Export (download localized assets)

### Metadata
- `MetadataPage` - ASO text generation and localization

## AI Prompts (server/src/routes/wizard.ts)

### Headlines Generation
- Model: gpt-4o-mini
- Rules: 3-8 words, [brackets] with verb + benefit, unique meanings
- Example: "[Track Your Progress] Daily", "[Save Time] Instantly"

### Metadata Generation (ASO Best Practices)
- appName: "Brand - Key Benefit Phrase" (not keyword list)
- subtitle: Different words from appName
- keywords: Only words NOT in appName/subtitle, no duplicates
- description: First 3 lines crucial, short paragraphs, CTA at end
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

Legacy models (kept for backward compatibility during migration):
- `Project`, `Screenshot`, `WizardProject`, `MetadataProject`

## Unified Project Architecture

The codebase uses a unified project model that combines wizard and manual editing modes:

- **Dashboard** (`src/components/Dashboard.tsx`) - Lists all projects with mode filter (All/Wizard/Manual)
- **WizardPage** (`src/components/WizardPage.tsx`) - 9-step wizard flow for mode="wizard" projects
- **Editor** (`src/components/Editor.tsx`) - Manual screenshot editor for mode="manual" projects

API endpoints (`server/src/routes/unified.ts`):
- `GET /api/unified` - List all projects (optional ?mode=wizard|manual filter)
- `GET /api/unified/:id` - Get project with screenshots
- `POST /api/unified` - Create project { mode, name? }
- `PUT /api/unified/:id` - Update project fields
- `DELETE /api/unified/:id` - Delete project
- `POST /api/unified/:id/screenshots` - Upload screenshot
- `POST /api/unified/:id/generate-all` - AI generate (wizard mode)
- `POST /api/unified/:id/translate` - Translate headlines + metadata
- `POST /api/unified/:id/convert-to-manual` - Switch wizard to manual mode

## Code Style

- Use functional React components with hooks
- TypeScript strict mode
- Inline styles (no CSS files)
- Keep components focused and single-purpose

## Deployment Commands

```bash
# Deploy to Coolify
curl -X POST "http://46.225.26.104:8000/api/v1/applications/agk8kwowcc48kkwkcsk844wo/restart" \
  -H "Authorization: Bearer 2|hjAbdUPchFI55QuEEHIpxJinD2xqtO59gOSPJIvB8736c446"

# Run DB migrations on production
ssh -i ~/.ssh/id_ed25519_hetzner root@46.225.26.104 \
  "docker exec <container> npx prisma db push --schema=server/prisma/schema.prisma"

# Check container logs
ssh -i ~/.ssh/id_ed25519_hetzner root@46.225.26.104 \
  "docker logs <container> --tail 50"
```
