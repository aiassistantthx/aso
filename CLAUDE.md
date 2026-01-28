# Claude Code Guidelines

## Language Requirements

- **All commits must be written in English**
- **All documentation must be written in English**
- Code comments should be in English
- Variable and function names should be in English

## Project Overview

This is an App Store Screenshot Generator - a web service for creating localized App Store screenshots with iPhone mockups.

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Canvas API (image generation)
- JSZip (archive creation)
- OpenAI SDK (text translation via gpt-4o-mini)

## Key Components

- `ScreensFlowEditor` - Main canvas editor with integrated screenshot uploader
- `StyleEditor` - Style configuration (colors, fonts, mockup settings, decorations)
- `TextEditor` - Headline editor for each screenshot
- `Preview` - Real-time canvas preview
- `ExportButton` - Export with translation and progress tracking

## Code Style

- Use functional React components with hooks
- TypeScript strict mode
- Inline styles (no CSS files)
- Keep components focused and single-purpose
