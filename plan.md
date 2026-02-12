# Refactoring Plan: P1 + P2 + P3

## Context

After the previous refactoring (text formatting extraction, generate function dedup, ScreensFlowEditor split), three major issues remain:

1. **canvas.ts ↔ drawHelpers.ts duplication** (~300-400 lines of duplicated rendering logic)
2. **WizardPage.tsx** (2379 lines) — monolithic 8-step wizard
3. **canvas.ts** (1771 lines) — still large, can be split into modules

## P1: Extract shared canvas primitives

### Problem
`canvas.ts` (export rendering) and `drawHelpers.ts` (preview rendering) independently implement:
- Mockup frame drawing (flat, minimal, outline, Pixel)
- Side button drawing
- Background + pattern rendering
- Font size calculation (binary search)
- Rotated bounds calculation

The core algorithms are identical; differences are:
- **Coordinate system**: canvas.ts uses absolute (x, y), drawHelpers.ts uses centered (0, 0)
- **Scale**: canvas.ts is full-scale, drawHelpers.ts is preview-scale (0.15 patterns)
- **Shadow quality**: canvas.ts uses larger blur/offset

### Solution: `src/services/canvasShared.ts`

Extract shared primitives that accept a coordinate transform parameter or work in a normalized way.

#### 1a. Shared side button drawing
Both files draw the same phone buttons (power, volume). Extract:
```ts
export const drawSideButtons = (
  ctx, x, y, mockupWidth, mockupHeight, frameColor, isOutline?
) => void
```
canvas.ts calls with absolute (x, y). drawHelpers.ts calls with centered (-w/2, -h/2).

#### 1b. Shared Pixel mockup frame
Both draw identical Pixel phone structure. Extract:
```ts
export const drawPixelFrame = (
  ctx, x, y, width, height, frameColor, screenshot?, shadowParams?
) => void
```
Shadow params differ: canvas.ts uses `{blur:40, offsetX:8, offsetY:16}`, drawHelpers uses `{blur:15, offsetX:0, offsetY:6}`.

#### 1c. Shared flat/minimal/outline mockup frame
canvas.ts has 3 separate functions, drawHelpers.ts has 1 with switch. Consolidate:
```ts
export const drawMockupFrameByStyle = (
  ctx, x, y, width, height, style: MockupStyle, frameColor, screenshot?, shadowParams?
) => void
```

#### 1d. Shared background pattern drawing
Both implement identical pattern algorithms (dots, grid, diagonal-lines, circles, squares). Extract:
```ts
export const drawPattern = (
  ctx, x, y, width, height, pattern: BackgroundPattern, scale?: number
) => void
```
canvas.ts calls with scale=1.0, drawHelpers calls with scale=0.15.

#### 1e. Shared rotated bounds calculation
```ts
export const calculateRotatedBounds = (
  width, height, rotation
) => { top, bottom, left, right, width, height }
```
drawHelpers.ts `getRotatedMockupTop` becomes a thin wrapper.

### After P1:
- `canvasShared.ts`: ~350 lines of shared primitives
- `canvas.ts`: shrinks by ~300 lines (from 1771 to ~1470)
- `drawHelpers.ts`: shrinks by ~250 lines (from 675 to ~425)

## P2: Split canvas.ts into modules

### Problem
Even after P1, canvas.ts remains ~1470 lines mixing mockup rendering, decorations, text rendering, and the generation pipeline.

### Solution: Split into focused modules

```
src/services/
  canvas.ts              → re-export public API (thin file)
  canvasShared.ts        → shared primitives (from P1)
  canvasMockup.ts        → mockup rendering (drawMockupWithScreenshot + helpers)
  canvasDecorations.ts   → stars, laurels
  canvasText.ts          → drawFormattedText, calculateAdaptiveFontSize, text area calculation
  canvasRender.ts        → renderCanvas pipeline, calculateMockupLayout, generate functions
  textFormatting.ts      → (existing, unchanged)
```

#### 2a. `canvasDecorations.ts` (~200 lines)
Extract from canvas.ts:
- `drawStar` (184-216)
- `drawStarRating` (219-234)
- `loadLaurelImage` + `laurelImageCache` (237-246)
- `tintImage` (249-270)
- `calculateAdaptiveLaurelSizes` (273-322)
- `drawLaurelWreath` (325-399)
- `drawDecorations` (402-415)

#### 2b. `canvasText.ts` (~180 lines)
Extract from canvas.ts:
- `drawFormattedText` (69-130)
- `calculateAdaptiveFontSize` (134-181)
- `RotatedBounds` interface (603-610)
- `TextAreaBounds` interface (638-643)
- `calculateRotatedMockupBounds` (612-635) — wraps canvasShared.calculateRotatedBounds
- `calculateTextArea` (645-691)

#### 2c. `canvasMockup.ts` (~600 lines)
Extract from canvas.ts:
- `MOCKUP_CONFIG` (535-565)
- `PIXEL_CONFIG` (569-590)
- `getVisibilityRatio` (593-599)
- `getFrameColor` (813-819)
- `drawSideButtons` (782-811) — replaced by canvasShared call
- `drawProgrammaticSideButtons` (822-865) — replaced by canvasShared call
- `drawFlatMockup` (868-952) — replaced by canvasShared call
- `drawMinimalMockup` (955-1038) — replaced by canvasShared call
- `drawOutlineSideButtons` (1041-1081) — replaced by canvasShared call
- `drawOutlineMockup` (1084-1161) — replaced by canvasShared call
- `drawPixelMockup` (1164-1261) — replaced by canvasShared call
- `drawMockupWithScreenshot` (1263-1495) — uses canvasShared primitives

#### 2d. `canvasRender.ts` (~250 lines)
Extract from canvas.ts:
- `MockupLayout` interface (1499-1509)
- `calculateMockupLayout` (1511-1575)
- `renderText` (1577-1642)
- `drawLegacyScreenshot` (1644-1670)
- `renderCanvas` (1672-1723)
- `generateScreenshotImage` (1727-1752)
- `generatePreviewCanvas` (1754-1771)

#### 2e. `canvas.ts` becomes thin re-export (~15 lines)
```ts
export type { ElementBounds, GenerateImageOptions } from './canvasRender';
export { getElementBounds } from './canvasText';
export { generateScreenshotImage, generatePreviewCanvas } from './canvasRender';
```

## P3: Split WizardPage.tsx into step components

### Problem
WizardPage.tsx is 2379 lines — a monolithic component with 8 steps, complex state, API calls, and rendering all mixed together.

### Solution: Extract each step's UI into a separate component

```
src/components/wizard/
  index.ts               → re-export WizardPage
  WizardPage.tsx         → orchestrator with state + navigation (~600 lines)
  StepAppInfo.tsx        → Step 1: App Info (~130 lines)
  StepScreenshots.tsx    → Step 2: Screenshots (~90 lines)
  StepServices.tsx       → Step 3: Services (~60 lines)
  StepTone.tsx           → Step 4: Tone (~140 lines)
  StepGenerate.tsx       → Step 5: Generate (~50 lines)
  StepReview.tsx         → Step 6: Review & Editor (~300 lines)
  StepTranslate.tsx      → Step 7: Translate (~250 lines)
  StepExport.tsx         → Step 8: Export (~50 lines)
  wizardStyles.ts        → pageStyles + CSS injection (~320 lines)
  wizardTypes.ts         → WizardProjectData, helper types (~70 lines)
  wizardHelpers.ts       → toWizardData, toUnifiedUpdate, resolveStyleConfig, buildEditorScreenshots (~250 lines)
```

### 3a. `wizardTypes.ts`
- `WizardProjectData` interface (17-62)
- Step label definitions
- Props interfaces for step components

### 3b. `wizardHelpers.ts`
- `toWizardData` (65-98)
- `toUnifiedUpdate` (101-128)
- `resolveStyleConfig` (154-194)
- `buildEditorScreenshots` (197-305)

### 3c. `wizardStyles.ts`
- `pageStyles` object (2073-2266)
- CSS injection code (2268-2379)

### 3d. Step components (StepAppInfo through StepExport)
Each step receives props from the orchestrator:
```ts
interface StepProps {
  project: WizardProjectData;
  onSave: (field: string, value: any) => void;
  // step-specific props as needed
}
```

### 3e. `WizardPage.tsx` orchestrator
Keeps:
- All state variables
- All API handlers (handleGenerate, handleTranslate, handleExport, etc.)
- Navigation logic (goToStep, nextStep, prevStep, canProceed)
- Step rendering via switch that delegates to step components

### 3f. Update imports
`src/components/WizardPage.tsx` becomes re-export:
```ts
export { WizardPage } from './wizard';
```

## Execution Order

1. **P1** — Extract canvasShared.ts (eliminates duplication between canvas.ts and drawHelpers.ts)
2. **P2** — Split canvas.ts into modules (depends on P1)
3. **P3** — Split WizardPage.tsx (independent of P1/P2)
4. **Verify** — `npx tsc --noEmit` + `npx vite build`

## Verification

1. `npx tsc --noEmit` — TypeScript passes (ignore pre-existing firebase.ts errors)
2. `npx vite build` — production build succeeds (ignore pre-existing firebase failure)
3. Grep for unused imports/dead code
4. Verify no file imports from old paths
