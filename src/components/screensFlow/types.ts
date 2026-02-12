import { ScreenshotMockupSettings } from '../../types';

export const DEFAULT_MOCKUP_SETTINGS: ScreenshotMockupSettings = {
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  // scale is intentionally omitted - should fall back to style.mockupScale
  linkedToNext: false
};
