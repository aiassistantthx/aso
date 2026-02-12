# Refactoring Plan — LocalizeShots

All items completed.

## P0: Extract shared text formatting ✅

- Created `src/services/textFormatting.ts` with shared types (`TextSegment`, `ParsedLine`) and functions
- Imported in both `ScreensFlowEditor.tsx` and `canvas.ts`, deleted local copies

## P1: Unify mockup drawing functions in canvas.ts ✅

- Extracted `drawScreenshotInArea()` and `drawDynamicIsland()` shared helpers
- Each mockup style function now only contains unique parts (frame drawing, shadow, border style)

## P2: Deduplicate generateScreenshotImage / generatePreviewCanvas ✅

- Extracted `calculateMockupLayout()` for shared dimension/position calculations
- Extracted `renderText()` for text drawing logic
- Extracted `renderCanvas()` as shared rendering pipeline
- Both export functions now call shared helpers, differing only in canvas creation and output

## P3: Split ScreensFlowEditor.tsx into modules ✅

- Extracted `src/components/screensFlow/LinkedPairCanvas.tsx`
- Extracted `src/components/screensFlow/SingleScreenPreview.tsx`
- Extracted `src/components/screensFlow/UploadCard.tsx`
- Extracted `src/components/screensFlow/drawHelpers.ts`
- `ScreensFlowEditor.tsx` is now ~269 lines as orchestrator, re-exported from index

## P4: Extract mockup proportion constants ✅

- Created `MOCKUP_PROPORTIONS` in `src/constants/mockup.ts`
- Referenced in `canvas.ts` (drawFlatMockup, drawMinimalMockup, drawOutlineMockup, drawProgrammaticSideButtons, drawOutlineSideButtons)
- Referenced in `drawHelpers.ts` (drawMockupFrame, drawPreviewSideButtons)
