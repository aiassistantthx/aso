import { StyleConfig, DeviceSize, DEVICE_SIZES, ScreenshotStyleOverride, ScreenshotMockupSettings } from '../types';
import { wrapFormattedText } from './textFormatting';
import { loadImage, drawBackgroundPattern } from './canvasShared';
import { drawFormattedText, calculateAdaptiveFontSize, TextAreaBounds, calculateTextArea } from './canvasText';
import { drawDecorations } from './canvasDecorations';
import { MOCKUP_CONFIG, PIXEL_CONFIG, getVisibilityRatio, drawMockupWithScreenshot } from './canvasMockup';

export interface ElementBounds {
  mockup: { x: number; y: number; width: number; height: number };
  text: { x: number; y: number; width: number; height: number };
}

export interface GenerateImageOptions {
  screenshot: string | null;
  text: string;
  style: StyleConfig;
  deviceSize: DeviceSize;
  decorations?: import('../types').Decoration[];
  styleOverride?: ScreenshotStyleOverride;
  mockupScreenshot?: string | null;
  mockupContinuation?: import('../types').MockupContinuation;
  mockupSettings?: ScreenshotMockupSettings;
}

// Merge global style with per-screenshot overrides
const getEffectiveStyle = (style: StyleConfig, override?: ScreenshotStyleOverride): StyleConfig => {
  if (!override) return style;
  return {
    ...style,
    textColor: override.textColor ?? style.textColor,
    backgroundColor: override.backgroundColor ?? style.backgroundColor,
    gradient: override.gradient ?? style.gradient,
    highlightColor: override.highlightColor ?? style.highlightColor
  };
};

const drawGradientBackground = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  style: StyleConfig
): void => {
  if (style.gradient.enabled) {
    const angleRad = (style.gradient.angle * Math.PI) / 180;
    const centerX = width / 2;
    const centerY = height / 2;
    const gradientLength = Math.sqrt(width * width + height * height);

    const x1 = centerX - Math.cos(angleRad) * gradientLength / 2;
    const y1 = centerY - Math.sin(angleRad) * gradientLength / 2;
    const x2 = centerX + Math.cos(angleRad) * gradientLength / 2;
    const y2 = centerY + Math.sin(angleRad) * gradientLength / 2;

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, style.gradient.color1);
    gradient.addColorStop(1, style.gradient.color2);
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = style.backgroundColor;
  }
  ctx.fillRect(0, 0, width, height);
};

// --- Shared helpers for generateScreenshotImage & generatePreviewCanvas ---

interface MockupLayout {
  mockupWidth: number;
  mockupHeight: number;
  mockupX: number;
  mockupY: number;
  mockupCenterX: number;
  mockupCenterY: number;
  rotation: number;
  hasMockup: boolean;
  screenshotForMockup: string | null;
}

const calculateMockupLayout = (
  canvasWidth: number,
  canvasHeight: number,
  style: StyleConfig,
  deviceSize: DeviceSize,
  screenshotForMockup: string | null,
  mockupSettings?: ScreenshotMockupSettings
): MockupLayout => {
  const mockupScale = mockupSettings?.scale ?? style.mockupScale ?? 1.0;
  const rotation = mockupSettings?.rotation ?? style.mockupRotation ?? 0;
  const visibilityRatio = getVisibilityRatio(style.mockupVisibility);

  const textAreaHeightForMockup = canvasHeight * 0.35;
  const availableHeight = canvasHeight - textAreaHeightForMockup - 40;
  const baseMockupHeight = Math.min(availableHeight, canvasHeight * 0.75);
  const clampedScale = Math.max(0.3, Math.min(2.0, mockupScale));
  const mockupHeight = baseMockupHeight * clampedScale;

  const dimensions = DEVICE_SIZES[deviceSize];
  const isAndroid = dimensions.platform === 'android';
  const config = isAndroid ? PIXEL_CONFIG : MOCKUP_CONFIG;
  const phoneAspect = config.phoneWidth / config.phoneHeight;
  const mockupWidth = mockupHeight * phoneAspect;

  const visiblePhoneHeight = mockupHeight * visibilityRatio;
  const hiddenHeight = mockupHeight - visiblePhoneHeight;

  let mockupCenterX = canvasWidth / 2;
  let mockupCenterY: number;

  switch (style.mockupAlignment) {
    case 'top': {
      const textAreaOffsetTop = style.textPosition === 'top' ? textAreaHeightForMockup : 0;
      mockupCenterY = textAreaOffsetTop - hiddenHeight + mockupHeight / 2;
      break;
    }
    case 'bottom':
      mockupCenterY = canvasHeight - visiblePhoneHeight - 40 + mockupHeight / 2;
      break;
    case 'center':
    default:
      mockupCenterY = (canvasHeight - mockupHeight) / 2 + mockupHeight / 2;
      break;
  }

  if (mockupSettings) {
    mockupCenterX += (mockupSettings.offsetX / 100) * canvasWidth;
    mockupCenterY += (mockupSettings.offsetY / 100) * canvasHeight;
  } else {
    mockupCenterX += style.mockupOffset?.x || 0;
    mockupCenterY += style.mockupOffset?.y || 0;
  }

  const mockupX = (canvasWidth - mockupWidth) / 2;
  const mockupY = style.textPosition === 'top' ? textAreaHeightForMockup + 20 : 40;
  const hasMockup = !!(style.showMockup && screenshotForMockup);

  return {
    mockupWidth, mockupHeight,
    mockupX, mockupY,
    mockupCenterX, mockupCenterY,
    rotation, hasMockup,
    screenshotForMockup
  };
};

const renderText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  canvasWidth: number,
  canvasHeight: number,
  style: StyleConfig,
  layout: MockupLayout,
  sidePaddingRatio: number,
  mockupSettings?: ScreenshotMockupSettings
): void => {
  const sidePadding = canvasWidth * sidePaddingRatio;
  const maxTextWidth = canvasWidth - sidePadding * 2;

  let textArea: TextAreaBounds;

  if (layout.hasMockup) {
    textArea = calculateTextArea(
      canvasWidth, canvasHeight,
      layout.mockupCenterX, layout.mockupCenterY,
      layout.mockupWidth, layout.mockupHeight,
      layout.rotation,
      style.textPosition,
      style.paddingTop, style.paddingBottom,
      sidePadding
    );
  } else {
    const availHeight = canvasHeight * 0.4;
    textArea = {
      x: sidePadding,
      y: style.textPosition === 'top' ? style.paddingTop : canvasHeight - style.paddingBottom - availHeight,
      width: maxTextWidth,
      height: availHeight
    };
  }

  const adaptiveFontSize = calculateAdaptiveFontSize(
    ctx, text, style.fontSize,
    textArea.width, textArea.height, style.fontFamily
  );

  const adaptiveStyle = { ...style, fontSize: adaptiveFontSize };

  ctx.fillStyle = style.textColor;
  ctx.font = `bold ${adaptiveFontSize}px ${style.fontFamily}`;
  ctx.textAlign = 'left';

  const lines = wrapFormattedText(ctx, text, textArea.width);
  const lineHeight = adaptiveFontSize * 1.4;
  const totalTextHeight = lines.length * lineHeight;

  let textY: number;
  if (style.textPosition === 'top') {
    textY = textArea.y + adaptiveFontSize + (textArea.height - totalTextHeight) / 4;
  } else {
    textY = textArea.y + textArea.height - totalTextHeight + adaptiveFontSize;
  }

  const textOffsetXValue = mockupSettings?.textOffsetX ?? style.textOffset?.x ?? 0;
  const textOffsetYValue = mockupSettings?.textOffsetY ?? style.textOffset?.y ?? 0;
  const textOffsetX = (textOffsetXValue / 100) * canvasWidth;
  const textOffsetY = (textOffsetYValue / 100) * canvasHeight;
  const finalX = textArea.x + textOffsetX;
  const finalY = textY + textOffsetY;

  drawFormattedText(ctx, lines, finalX, finalY, lineHeight, adaptiveStyle, textArea.width);
};

const drawLegacyScreenshot = async (
  ctx: CanvasRenderingContext2D,
  layout: MockupLayout,
  canvasWidth: number
): Promise<void> => {
  const img = await loadImage(layout.screenshotForMockup!);
  const imgAspect = img.width / img.height;

  let drawWidth = layout.mockupWidth;
  let drawHeight = drawWidth / imgAspect;

  if (drawHeight > layout.mockupHeight) {
    drawHeight = layout.mockupHeight;
    drawWidth = drawHeight * imgAspect;
  }

  const imgX = (canvasWidth - drawWidth) / 2;
  const imgY = layout.mockupY + (layout.mockupHeight - drawHeight) / 2;

  const cornerRadius = 40;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(imgX, imgY, drawWidth, drawHeight, cornerRadius);
  ctx.clip();
  ctx.drawImage(img, imgX, imgY, drawWidth, drawHeight);
  ctx.restore();
};

const renderCanvas = async (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  options: GenerateImageOptions,
  style: StyleConfig,
  layout: MockupLayout,
  sidePaddingRatio: number,
  catchMockupErrors: boolean
): Promise<void> => {
  const { text, mockupContinuation, mockupSettings, deviceSize } = options;

  // Background
  drawGradientBackground(ctx, canvasWidth, canvasHeight, style);
  if (style.pattern) {
    drawBackgroundPattern(ctx, 0, 0, canvasWidth, canvasHeight, style.pattern, 1.0);
  }

  // Mockup
  if (layout.hasMockup) {
    if (catchMockupErrors) {
      try {
        await drawMockupWithScreenshot(ctx, layout.mockupX, layout.mockupY, layout.mockupWidth, layout.mockupHeight, canvasWidth, canvasHeight, layout.screenshotForMockup, style, mockupContinuation, mockupSettings, deviceSize);
      } catch {
        ctx.fillStyle = '#1d1d1f';
        ctx.beginPath();
        ctx.roundRect(layout.mockupX, layout.mockupY, layout.mockupWidth, layout.mockupHeight, 60);
        ctx.fill();
      }
    } else {
      await drawMockupWithScreenshot(ctx, layout.mockupX, layout.mockupY, layout.mockupWidth, layout.mockupHeight, canvasWidth, canvasHeight, layout.screenshotForMockup, style, mockupContinuation, mockupSettings, deviceSize);
    }
  } else if (layout.screenshotForMockup && !style.showMockup) {
    if (catchMockupErrors) {
      try {
        await drawLegacyScreenshot(ctx, layout, canvasWidth);
      } catch {
        // Screenshot not loaded
      }
    } else {
      await drawLegacyScreenshot(ctx, layout, canvasWidth);
    }
  }

  // Text
  if (text) {
    renderText(ctx, text, canvasWidth, canvasHeight, style, layout, sidePaddingRatio, mockupSettings);
  }

  // Decorations
  await drawDecorations(ctx, options.decorations);
};

// --- Public API ---

// Calculate element bounds for hit testing (in original canvas coordinates)
export const getElementBounds = (style: StyleConfig, deviceSize: DeviceSize): ElementBounds => {
  const dimensions = DEVICE_SIZES[deviceSize];
  const visibilityRatio = getVisibilityRatio(style.mockupVisibility);
  const mockupScale = style.mockupScale ?? 1.0;

  const textAreaHeightForMockup = dimensions.height * 0.35;

  const availableHeight = dimensions.height - textAreaHeightForMockup - 40;
  const baseMockupHeight = Math.min(availableHeight, dimensions.height * 0.75);
  const mockupHeight = baseMockupHeight * mockupScale;
  const isAndroidBounds = dimensions.platform === 'android';
  const configBounds = isAndroidBounds ? PIXEL_CONFIG : MOCKUP_CONFIG;
  const phoneAspect = configBounds.phoneWidth / configBounds.phoneHeight;
  const mockupWidth = mockupHeight * phoneAspect;

  const visiblePhoneHeight = mockupHeight * visibilityRatio;
  const hiddenHeight = mockupHeight - visiblePhoneHeight;

  let mockupY: number;
  switch (style.mockupAlignment) {
    case 'top':
      const textAreaOffsetTop = style.textPosition === 'top' ? textAreaHeightForMockup : 0;
      mockupY = textAreaOffsetTop - hiddenHeight;
      break;
    case 'bottom':
      mockupY = dimensions.height - visiblePhoneHeight - 40;
      break;
    case 'center':
    default:
      mockupY = (dimensions.height - mockupHeight) / 2;
      break;
  }

  const mockupX = (dimensions.width - mockupWidth) / 2;

  const finalMockupX = mockupX + (style.mockupOffset?.x || 0);
  const finalMockupY = mockupY + (style.mockupOffset?.y || 0);

  const maxTextWidth = dimensions.width * 0.85;
  const lineHeight = style.fontSize * 1.2;
  const estimatedLines = 2;

  let textX: number;
  switch (style.textAlign) {
    case 'left':
      textX = (dimensions.width - maxTextWidth) / 2;
      break;
    case 'right':
      textX = dimensions.width - maxTextWidth - (dimensions.width - maxTextWidth) / 2;
      break;
    default:
      textX = (dimensions.width - maxTextWidth) / 2;
  }

  let textY: number;
  if (style.textPosition === 'top') {
    textY = style.paddingTop;
  } else {
    textY = dimensions.height - style.paddingBottom - estimatedLines * lineHeight;
  }

  const finalTextX = textX + (style.textOffset?.x || 0);
  const finalTextY = textY + (style.textOffset?.y || 0);

  return {
    mockup: {
      x: finalMockupX,
      y: finalMockupY,
      width: mockupWidth,
      height: mockupHeight
    },
    text: {
      x: finalTextX,
      y: finalTextY,
      width: maxTextWidth,
      height: estimatedLines * lineHeight + style.fontSize
    }
  };
};

export const generateScreenshotImage = async (
  options: GenerateImageOptions
): Promise<Blob> => {
  const style = getEffectiveStyle(options.style, options.styleOverride);
  const dimensions = DEVICE_SIZES[options.deviceSize];
  const screenshotForMockup = options.mockupScreenshot ?? options.screenshot;

  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const ctx = canvas.getContext('2d')!;

  const layout = calculateMockupLayout(dimensions.width, dimensions.height, style, options.deviceSize, screenshotForMockup, options.mockupSettings);
  await renderCanvas(ctx, dimensions.width, dimensions.height, options, style, layout, 0.10, false);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate image'));
      },
      'image/png',
      1.0
    );
  });
};

export const generatePreviewCanvas = async (
  canvas: HTMLCanvasElement,
  options: GenerateImageOptions
): Promise<void> => {
  const style = getEffectiveStyle(options.style, options.styleOverride);
  const dimensions = DEVICE_SIZES[options.deviceSize];
  const screenshotForMockup = options.mockupScreenshot ?? options.screenshot;

  const scale = Math.min(400 / dimensions.width, 600 / dimensions.height);
  canvas.width = dimensions.width * scale;
  canvas.height = dimensions.height * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.scale(scale, scale);

  const layout = calculateMockupLayout(dimensions.width, dimensions.height, style, options.deviceSize, screenshotForMockup, options.mockupSettings);
  await renderCanvas(ctx, dimensions.width, dimensions.height, options, style, layout, 0.075, true);
};
