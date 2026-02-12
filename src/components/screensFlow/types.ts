import { ScreenshotMockupSettings } from '../../types';

export type DragMode = 'mockup' | 'text';

export const DEFAULT_MOCKUP_SETTINGS: ScreenshotMockupSettings = {
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  scale: 1.0,
  linkedToNext: false
};
