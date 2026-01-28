# App Store Screenshot Generator

A web service for generating localized App Store screenshots with iPhone mockups.

## Features

### Screenshot Management
- **Drag & drop upload** — up to 10 images
- **Text-only slides** — create slides without screenshots
- **Screen linking** — link screens for continuous mockup flow across slides
- **Per-screenshot positioning** — drag mockups and text to position

### Styling
- **Background colors** — solid or gradient backgrounds
- **Text styling** — font family, size, color, position (top/bottom)
- **Text highlighting** — use `[text]` syntax to highlight words
- **Mockup customization** — black/white/natural frame colors, rotation, scale

### Decorations
- **Star ratings** — customizable 1-5 star decorations
- **Laurel badges** — multi-line text with laurel wreath graphics

### Localization
- **39 App Store languages** supported
- **Automatic translation** via OpenAI API (gpt-4o-mini)
- **Per-language style overrides** — adjust font size, positioning per language
- **Source language selection** — translate from any supported language

### Export
- **ZIP archive export** — organized by language folders
- **Dual device sizes** — exports both 6.9" and 6.5" sizes simultaneously
- **Progress tracking** — real-time export progress indication

## Supported Device Sizes

| Device | Dimensions |
|--------|------------|
| iPhone 16 Pro Max (6.9") | 1320 × 2868 px |
| iPhone 11 Pro Max (6.5") | 1284 × 2778 px |

## Supported Languages (39 locales)

en-US, en-GB, en-AU, en-CA, de-DE, fr-FR, fr-CA, es-ES, es-MX, it-IT, pt-BR, pt-PT, nl-NL, ru-RU, ja-JP, ko-KR, zh-Hans, zh-Hant, ar-SA, ca-ES, cs-CZ, da-DK, el-GR, fi-FI, he-IL, hi-IN, hr-HR, hu-HU, id-ID, ms-MY, no-NO, pl-PL, ro-RO, sk-SK, sv-SE, th-TH, tr-TR, uk-UA, vi-VN

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — build tool
- **Canvas API** — image generation
- **JSZip** — archive creation
- **OpenAI SDK** — text translation (gpt-4o-mini)

## Project Structure

```
aso/
├── src/
│   ├── components/
│   │   ├── ScreensFlowEditor.tsx   # Main canvas editor with uploader
│   │   ├── TextEditor.tsx          # Headline editor
│   │   ├── StyleEditor.tsx         # Style & decoration settings
│   │   ├── Preview.tsx             # Canvas preview component
│   │   ├── LanguageSelector.tsx    # Target language selection
│   │   ├── LanguageSidebar.tsx     # Language switcher sidebar
│   │   └── ExportButton.tsx        # Export with progress
│   ├── services/
│   │   ├── openai.ts               # OpenAI translation service
│   │   ├── canvas.ts               # Image generation
│   │   ├── zip.ts                  # ZIP archive creation
│   │   └── storage.ts              # Project save/load (localStorage)
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   ├── constants/
│   │   ├── languages.ts            # Language list & utilities
│   │   └── templates.ts            # Style templates
│   ├── styles/
│   │   └── common.ts               # Shared style constants
│   ├── App.tsx                     # Main application component
│   └── main.tsx                    # Entry point
├── CLAUDE.md                       # Claude Code guidelines
├── Dockerfile                      # Docker image for deployment
├── nginx.conf                      # Nginx config for SPA
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Getting Started

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Usage

1. **Upload screenshots** — drag & drop or click to upload PNG/JPG files
2. **Add headlines** — enter text for each screenshot (use `|` for line breaks, `[text]` for highlights)
3. **Configure styles** — set colors, fonts, mockup position and rotation
4. **Add decorations** — optional star ratings or laurel badges
5. **Select languages** — choose target languages for localization
6. **Enter API key** — provide OpenAI API key for translation
7. **Export** — click "Translate & Export" to generate ZIP archive

## Screen Linking

Link two screens together to create a continuous mockup flow:
1. Click the ○ button between two screens
2. The mockup will span across both screens
3. Drag to position the shared mockup
4. Use rotation controls to tilt the mockup

## Docker Deployment

```bash
# Build image
docker build -t aso-screenshot-generator .

# Run container
docker run -p 8080:80 aso-screenshot-generator
```

## License

MIT
