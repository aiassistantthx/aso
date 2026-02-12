import { Screenshot, StyleConfig, MockupStyle } from '../../types';
import { wrapFormattedText, measureLineWidth } from '../../services/textFormatting';
import { calculateRotatedBounds, drawScreenshotClipped, drawBackgroundPattern as drawSharedPattern } from '../../services/canvasShared';

// Draw side buttons for preview mockups (centered coordinate system)
export const drawPreviewSideButtons = (
  ctx: CanvasRenderingContext2D,
  mockupWidth: number,
  mockupHeight: number,
  frameColor: string,
  isOutline: boolean = false
): void => {
  const buttonColor = frameColor === '#F5F5F7' ? '#D1D1D6' :
                      frameColor === '#E3D5C8' ? '#C4B5A8' : '#0D0D0D';
  const buttonWidth = mockupWidth * 0.012;
  const buttonRadius = buttonWidth / 2;
  const x = -mockupWidth / 2;
  const y = -mockupHeight / 2;

  if (isOutline) {
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = buttonWidth * 0.6;
  } else {
    ctx.fillStyle = buttonColor;
  }

  // Action button
  const actionH = mockupHeight * 0.035;
  const actionY = y + mockupHeight * 0.15;
  ctx.beginPath();
  ctx.roundRect(x - buttonWidth, actionY, buttonWidth, actionH, buttonRadius);
  isOutline ? ctx.stroke() : ctx.fill();

  // Volume Up
  const volH = mockupHeight * 0.065;
  const volUpY = y + mockupHeight * 0.22;
  ctx.beginPath();
  ctx.roundRect(x - buttonWidth, volUpY, buttonWidth, volH, buttonRadius);
  isOutline ? ctx.stroke() : ctx.fill();

  // Volume Down
  const volDownY = volUpY + volH + mockupHeight * 0.015;
  ctx.beginPath();
  ctx.roundRect(x - buttonWidth, volDownY, buttonWidth, volH, buttonRadius);
  isOutline ? ctx.stroke() : ctx.fill();

  // Power button
  const powerH = mockupHeight * 0.08;
  const powerY = y + mockupHeight * 0.24;
  ctx.beginPath();
  ctx.roundRect(-x, powerY, buttonWidth, powerH, buttonRadius);
  isOutline ? ctx.stroke() : ctx.fill();
};

// Draw Pixel mockup frame (centered at 0,0)
export const drawPixelMockupFrame = (
  ctx: CanvasRenderingContext2D,
  mockupWidth: number,
  mockupHeight: number,
  frameColor: string,
  img: HTMLImageElement | null
): void => {
  // Pixel proportions - thinner bezels than iPhone
  const frameThickness = mockupWidth * 0.025;
  const cornerRadius = mockupWidth * 0.08;
  const screenCornerRadius = cornerRadius - frameThickness * 0.7;

  // Punch-hole camera (centered at top, smaller than Dynamic Island)
  const punchHoleRadius = mockupWidth * 0.025;
  const punchHoleY = -mockupHeight / 2 + frameThickness + mockupHeight * 0.015;

  // Draw shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 6;

  // Draw solid phone body
  ctx.fillStyle = frameColor;
  ctx.beginPath();
  ctx.roundRect(-mockupWidth / 2, -mockupHeight / 2, mockupWidth, mockupHeight, cornerRadius);
  ctx.fill();
  ctx.restore();

  // Draw screen area
  const screenW = mockupWidth - frameThickness * 2;
  const screenH = mockupHeight - frameThickness * 2;

  // Black screen background
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(-screenW / 2, -screenH / 2, screenW, screenH, screenCornerRadius);
  ctx.fill();

  // Draw screenshot if provided
  if (img) {
    drawScreenshotClipped(ctx, img, -screenW / 2, -screenH / 2, screenW, screenH, screenCornerRadius);
  }

  // Draw punch-hole camera
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(0, punchHoleY, punchHoleRadius, 0, Math.PI * 2);
  ctx.fill();

  // Draw side buttons (Pixel style - on the right side)
  const buttonColor = frameColor === '#F5F5F7' ? '#D2D2D7' :
                      frameColor === '#E3D5C8' ? '#C5B5A6' : '#2D2D2F';
  ctx.fillStyle = buttonColor;

  // Power button (right side)
  const powerWidth = mockupWidth * 0.015;
  const powerHeight = mockupHeight * 0.045;
  const powerY = -mockupHeight / 2 + mockupHeight * 0.18;
  ctx.beginPath();
  ctx.roundRect(mockupWidth / 2, powerY, powerWidth, powerHeight, 2);
  ctx.fill();

  // Volume rocker (right side, below power)
  const volHeight = mockupHeight * 0.08;
  const volY = powerY + powerHeight + mockupHeight * 0.02;
  ctx.beginPath();
  ctx.roundRect(mockupWidth / 2, volY, powerWidth, volHeight, 2);
  ctx.fill();
};

// Draw mockup frame based on style (centered at 0,0)
export const drawMockupFrame = (
  ctx: CanvasRenderingContext2D,
  mockupStyle: MockupStyle,
  mockupWidth: number,
  mockupHeight: number,
  frameColor: string,
  img: HTMLImageElement | null,
  isAndroid: boolean = false
): void => {
  // For Android, always use Pixel mockup
  if (isAndroid) {
    drawPixelMockupFrame(ctx, mockupWidth, mockupHeight, frameColor, img);
    return;
  }

  const frameThickness = mockupWidth * 0.035;
  const cornerRadius = mockupWidth * 0.12;
  const innerRadius = cornerRadius - frameThickness * 0.8;

  // Dynamic Island dimensions
  const diWidth = mockupWidth * 0.30;
  const diHeight = mockupHeight * 0.022;
  const diY = -mockupHeight / 2 + frameThickness + mockupHeight * 0.008;

  switch (mockupStyle) {
    case 'flat': {
      // Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;

      // Solid phone body
      ctx.fillStyle = frameColor;
      ctx.beginPath();
      ctx.roundRect(-mockupWidth / 2, -mockupHeight / 2, mockupWidth, mockupHeight, cornerRadius);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Side buttons
      drawPreviewSideButtons(ctx, mockupWidth, mockupHeight, frameColor, false);

      // Black screen background
      const screenW = mockupWidth - frameThickness * 2;
      const screenH = mockupHeight - frameThickness * 2;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(-screenW / 2, -screenH / 2, screenW, screenH, innerRadius);
      ctx.fill();

      // Screenshot
      if (img) {
        drawScreenshotClipped(ctx, img, -screenW / 2, -screenH / 2, screenW, screenH, innerRadius);
      }

      // Dynamic Island
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(-diWidth / 2, diY, diWidth, diHeight, diHeight / 2);
      ctx.fill();
      break;
    }

    case 'minimal': {
      const borderW = mockupWidth * 0.02;
      const minRadius = mockupWidth * 0.1;
      const minInnerRadius = minRadius - borderW;

      // Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 6;

      // Border frame
      ctx.fillStyle = frameColor;
      ctx.beginPath();
      ctx.roundRect(-mockupWidth / 2, -mockupHeight / 2, mockupWidth, mockupHeight, minRadius);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Side buttons
      drawPreviewSideButtons(ctx, mockupWidth, mockupHeight, frameColor, false);

      // Black screen
      const screenW = mockupWidth - borderW * 2;
      const screenH = mockupHeight - borderW * 2;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(-screenW / 2, -screenH / 2, screenW, screenH, minInnerRadius);
      ctx.fill();

      // Screenshot
      if (img) {
        drawScreenshotClipped(ctx, img, -screenW / 2, -screenH / 2, screenW, screenH, minInnerRadius);
      }

      // Dynamic Island
      const minDiY = -mockupHeight / 2 + borderW + mockupHeight * 0.01;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(-diWidth / 2, minDiY, diWidth, diHeight, diHeight / 2);
      ctx.fill();
      break;
    }

    case 'outline': {
      const borderW = mockupWidth * 0.025;
      const outRadius = mockupWidth * 0.11;
      const outInnerRadius = outRadius - borderW / 2;

      // Black screen background
      const screenW = mockupWidth - borderW * 2;
      const screenH = mockupHeight - borderW * 2;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(-screenW / 2, -screenH / 2, screenW, screenH, outInnerRadius);
      ctx.fill();

      // Screenshot
      if (img) {
        drawScreenshotClipped(ctx, img, -screenW / 2, -screenH / 2, screenW, screenH, outInnerRadius);
      }

      // Outline frame
      ctx.strokeStyle = frameColor;
      ctx.lineWidth = borderW;
      ctx.beginPath();
      ctx.roundRect(-mockupWidth / 2 + borderW / 2, -mockupHeight / 2 + borderW / 2,
                    mockupWidth - borderW, mockupHeight - borderW, outRadius);
      ctx.stroke();

      // Side buttons (outline style)
      drawPreviewSideButtons(ctx, mockupWidth, mockupHeight, frameColor, true);

      // Dynamic Island
      const outDiY = -mockupHeight / 2 + borderW + mockupHeight * 0.012;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(-diWidth / 2, outDiY, diWidth, diHeight, diHeight / 2);
      ctx.fill();
      break;
    }

    default: {
      // Realistic style
      ctx.fillStyle = frameColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 10;
      ctx.beginPath();
      ctx.roundRect(-mockupWidth / 2 - 8, -mockupHeight / 2 - 8, mockupWidth + 16, mockupHeight + 16, cornerRadius + 4);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Screenshot
      if (img) {
        drawScreenshotClipped(ctx, img, -mockupWidth / 2, -mockupHeight / 2, mockupWidth, mockupHeight, cornerRadius);
      }

      // Dynamic Island
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(-diWidth / 2, -mockupHeight / 2 + 8, diWidth, mockupHeight * 0.035, 10);
      ctx.fill();
    }
  }
};

// Draw background with gradient/solid color and pattern
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  style: StyleConfig,
  override?: Screenshot['styleOverride']
) {
  const gradient = override?.gradient ?? style.gradient;
  const bgColor = override?.backgroundColor ?? style.backgroundColor;

  if (gradient.enabled) {
    const grad = ctx.createLinearGradient(x, y, x + width, y + height);
    grad.addColorStop(0, gradient.color1);
    grad.addColorStop(1, gradient.color2);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = bgColor;
  }
  ctx.fillRect(x, y, width, height);

  // Draw pattern if present
  if (style.pattern && style.pattern.type !== 'none') {
    drawPreviewPattern(ctx, x, y, width, height, style.pattern);
  }
}

// Draw pattern for preview (delegates to shared pattern with 0.15 scale)
export function drawPreviewPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  pattern: StyleConfig['pattern']
) {
  if (!pattern || pattern.type === 'none') return;
  drawSharedPattern(ctx, x, y, width, height, pattern, 0.15);
}

// Calculate rotated bounding box top position (delegates to shared)
export function getRotatedMockupTop(
  centerY: number,
  mockupWidth: number,
  mockupHeight: number,
  rotationDegrees: number
): number {
  return calculateRotatedBounds(0, centerY, mockupWidth, mockupHeight, rotationDegrees).top;
}

// Calculate adaptive font size for preview
export function calculatePreviewFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  fontFamily: string
): number {
  const minFontSize = 8;
  const maxFontSize = 24;

  let low = minFontSize;
  let high = maxFontSize;
  let bestFit = minFontSize;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    ctx.font = `bold ${mid}px ${fontFamily}`;
    const lines = wrapText(ctx, text, maxWidth);
    const lineHeight = mid * 1.3;
    const totalHeight = lines.length * lineHeight;

    if (totalHeight <= maxHeight) {
      bestFit = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return bestFit;
}

// Simple wrap for font size calculation (strips formatting)
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.replace(/\[|\]/g, '').split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}

// Draw text with adaptive sizing, highlight support, and positioning
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  canvasHeight: number,
  width: number,
  style: StyleConfig,
  override?: Screenshot['styleOverride'],
  mockupInfo?: { centerY: number; height: number; width: number; rotation: number },
  textOffsetOverride?: { x: number; y: number }
) {
  if (!text) return;

  const textColor = override?.textColor ?? style.textColor;
  const highlightColor = override?.highlightColor ?? style.highlightColor ?? '#FFE135';
  const textPosition = override?.textPosition ?? style.textPosition;
  const maxWidth = width * 0.80; // 10% padding on each side

  // Calculate available text area based on mockup position
  let availableHeight: number;
  let textAreaY: number;

  // Fixed padding values for preview (not scaled from full size)
  const paddingTop = 6; // Fixed 6px top padding for preview
  const gapFromMockup = 2; // Fixed 2px gap between text and mockup

  if (mockupInfo && style.showMockup) {
    const mockupTop = getRotatedMockupTop(
      mockupInfo.centerY,
      mockupInfo.width,
      mockupInfo.height,
      mockupInfo.rotation
    );
    const mockupBottom = mockupInfo.centerY + mockupInfo.height / 2;

    if (textPosition === 'top') {
      // Space above mockup - text must fit ABOVE the mockup, no overlay
      const spaceAboveMockup = Math.max(mockupTop - gapFromMockup - paddingTop, 30);
      availableHeight = spaceAboveMockup;
      textAreaY = paddingTop;
    } else {
      // Space below mockup
      const spaceBelowMockup = Math.max(canvasHeight - mockupBottom - gapFromMockup - 8, 30);
      availableHeight = spaceBelowMockup;
      textAreaY = mockupBottom + gapFromMockup;
    }
  } else {
    availableHeight = canvasHeight * 0.35;
    textAreaY = textPosition === 'top' ? paddingTop : canvasHeight - availableHeight - 8;
  }

  // Adaptive font sizing based on available space
  // Preview scale: convert full-size font (72px) to preview size (~18px)
  const previewScaleFactor = 0.25;
  const baseFontSize = (style.fontSize ?? 72) * previewScaleFactor;

  // Calculate base available height (at mockup scale 1.0 with default positioning)
  // This is our reference point - 35% of canvas is the "normal" text space
  const baseAvailableHeight = canvasHeight * 0.35;

  // Scale factor: how much space we have compared to base
  const spaceRatio = availableHeight / baseAvailableHeight;

  // Apply linear scaling for more responsive size changes
  // Clamp between 0.4 and 1.3 to keep text readable but allow significant shrinking
  const adaptiveScale = Math.max(0.4, Math.min(1.3, spaceRatio));
  const targetFontSize = Math.max(8, Math.min(baseFontSize * adaptiveScale, baseFontSize * 1.3));

  // Check if text fits at target size
  ctx.font = `bold ${targetFontSize}px ${style.fontFamily}`;
  const testLines = wrapFormattedText(ctx, text, maxWidth);
  const testLineHeight = targetFontSize * 1.3;
  const testTotalHeight = testLines.length * testLineHeight;

  let fontSize: number;
  if (testTotalHeight <= availableHeight) {
    // Text fits at adaptive target size
    fontSize = targetFontSize;
  } else {
    // Text doesn't fit - shrink to fit (but maintain minimum readability)
    fontSize = Math.max(10, calculatePreviewFontSize(ctx, text, maxWidth, availableHeight, style.fontFamily));
  }

  ctx.font = `bold ${fontSize}px ${style.fontFamily}`;

  const lines = wrapFormattedText(ctx, text, maxWidth);
  const lineHeight = fontSize * 1.3;
  const totalTextHeight = lines.length * lineHeight;

  // Apply text offset
  const effectiveTextOffset = textOffsetOverride ?? style.textOffset ?? { x: 0, y: 0 };
  const textOffsetX = (effectiveTextOffset.x || 0) * width / 100;
  const textOffsetY = (effectiveTextOffset.y || 0) * canvasHeight / 100;

  // Position text within available area
  let textY: number;
  if (textPosition === 'top') {
    textY = textAreaY + fontSize + (availableHeight - totalTextHeight) / 4 + textOffsetY;
  } else {
    textY = textAreaY + (availableHeight - totalTextHeight) / 2 + fontSize + textOffsetY;
  }

  // Draw each line with highlights
  const textAlign = style.textAlign || 'center';
  const sidePadding = width * 0.10; // 10% padding on each side for text area

  lines.forEach((line, lineIndex) => {
    const y = textY + lineIndex * lineHeight;
    const lineWidth = measureLineWidth(ctx, line);

    // Calculate line X based on text alignment
    let lineX: number;
    switch (textAlign) {
      case 'left':
        lineX = x + sidePadding + textOffsetX;
        break;
      case 'right':
        lineX = x + width - sidePadding - lineWidth + textOffsetX;
        break;
      case 'center':
      default:
        lineX = x + (width - lineWidth) / 2 + textOffsetX;
        break;
    }

    for (const segment of line.segments) {
      const segmentWidth = ctx.measureText(segment.text).width;

      if (segment.highlighted && segment.text.trim()) {
        // Draw highlight background - adaptive padding based on font size
        const paddingH = fontSize * 0.25; // Horizontal padding
        const paddingV = fontSize * 0.15; // Vertical padding
        const radius = fontSize * 0.15;

        ctx.save();
        ctx.fillStyle = highlightColor;
        ctx.beginPath();
        ctx.roundRect(
          lineX - paddingH,
          y - fontSize * 0.9 - paddingV,
          segmentWidth + paddingH * 2,
          fontSize * 1.1 + paddingV * 2,
          radius
        );
        ctx.fill();
        ctx.restore();
      }

      // Draw text
      ctx.fillStyle = textColor;
      ctx.textAlign = 'left';
      ctx.fillText(segment.text, lineX, y);
      lineX += segmentWidth;
    }
  });
}
