import { StyleConfig, Screenshot, MockupStyle } from '../../types';
import { wrapFormattedText, measureLineWidth } from '../../services/textFormatting';
import { MOCKUP_PROPORTIONS as MP } from '../../constants/mockup';

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
  const buttonWidth = mockupWidth * MP.BUTTON_WIDTH;
  const buttonRadius = buttonWidth / 2;
  const x = -mockupWidth / 2;
  const y = -mockupHeight / 2;

  if (isOutline) {
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = buttonWidth * 0.6;
  } else {
    ctx.fillStyle = buttonColor;
  }

  const buttons = [
    { bx: x - buttonWidth, by: y + mockupHeight * 0.15, bh: mockupHeight * 0.035 },
    { bx: x - buttonWidth, by: y + mockupHeight * 0.22, bh: mockupHeight * 0.065 },
    { bx: x - buttonWidth, by: y + mockupHeight * 0.22 + mockupHeight * 0.065 + mockupHeight * 0.015, bh: mockupHeight * 0.065 },
    { bx: -x, by: y + mockupHeight * 0.24, bh: mockupHeight * 0.08 },
  ];

  for (const b of buttons) {
    ctx.beginPath();
    ctx.roundRect(b.bx, b.by, buttonWidth, b.bh, buttonRadius);
    isOutline ? ctx.stroke() : ctx.fill();
  }
};

// Draw mockup frame based on style (centered at 0,0)
export const drawMockupFrame = (
  ctx: CanvasRenderingContext2D,
  mockupStyle: MockupStyle,
  mockupWidth: number,
  mockupHeight: number,
  frameColor: string,
  img: HTMLImageElement | null
): void => {
  const frameThickness = mockupWidth * MP.FRAME_THICKNESS;
  const cornerRadius = mockupWidth * MP.CORNER_RADIUS;
  const innerRadius = cornerRadius - frameThickness * MP.INNER_RADIUS_FACTOR;
  const diWidth = mockupWidth * 0.30; // Preview approximation of DI width
  const diHeight = mockupHeight * MP.DYNAMIC_ISLAND_HEIGHT;
  const diY = -mockupHeight / 2 + frameThickness + mockupHeight * MP.DYNAMIC_ISLAND_Y_OFFSET;

  // Shared screenshot clipping helper (centered coordinate system)
  const drawScreenshot = (screenW: number, screenH: number, screenRadius: number) => {
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.roundRect(-screenW / 2, -screenH / 2, screenW, screenH, screenRadius);
    ctx.fill();

    if (!img) return;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(-screenW / 2, -screenH / 2, screenW, screenH, screenRadius);
    ctx.clip();
    const imgAspect = img.width / img.height;
    const screenAspect = screenW / screenH;
    const drawH = imgAspect > screenAspect ? screenH : screenW / imgAspect;
    const drawW = imgAspect > screenAspect ? drawH * imgAspect : screenW;
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  };

  switch (mockupStyle) {
    case 'flat': {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = frameColor;
      ctx.beginPath();
      ctx.roundRect(-mockupWidth / 2, -mockupHeight / 2, mockupWidth, mockupHeight, cornerRadius);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      drawPreviewSideButtons(ctx, mockupWidth, mockupHeight, frameColor, false);
      const screenW = mockupWidth - frameThickness * 2;
      const screenH = mockupHeight - frameThickness * 2;
      drawScreenshot(screenW, screenH, innerRadius);

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(-diWidth / 2, diY, diWidth, diHeight, diHeight / 2);
      ctx.fill();
      break;
    }

    case 'minimal': {
      const borderW = mockupWidth * MP.MINIMAL_BORDER;
      const minRadius = mockupWidth * MP.MINIMAL_CORNER_RADIUS;
      const minInnerRadius = minRadius - borderW;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = frameColor;
      ctx.beginPath();
      ctx.roundRect(-mockupWidth / 2, -mockupHeight / 2, mockupWidth, mockupHeight, minRadius);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      drawPreviewSideButtons(ctx, mockupWidth, mockupHeight, frameColor, false);
      drawScreenshot(mockupWidth - borderW * 2, mockupHeight - borderW * 2, minInnerRadius);

      const minDiY = -mockupHeight / 2 + borderW + mockupHeight * MP.MINIMAL_DI_Y_OFFSET;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(-diWidth / 2, minDiY, diWidth, diHeight, diHeight / 2);
      ctx.fill();
      break;
    }

    case 'outline': {
      const borderW = mockupWidth * MP.OUTLINE_BORDER;
      const outRadius = mockupWidth * MP.OUTLINE_CORNER_RADIUS;
      const outInnerRadius = outRadius - borderW / 2;

      drawScreenshot(mockupWidth - borderW * 2, mockupHeight - borderW * 2, outInnerRadius);

      ctx.strokeStyle = frameColor;
      ctx.lineWidth = borderW;
      ctx.beginPath();
      ctx.roundRect(-mockupWidth / 2 + borderW / 2, -mockupHeight / 2 + borderW / 2,
                    mockupWidth - borderW, mockupHeight - borderW, outRadius);
      ctx.stroke();

      drawPreviewSideButtons(ctx, mockupWidth, mockupHeight, frameColor, true);

      const outDiY = -mockupHeight / 2 + borderW + mockupHeight * MP.OUTLINE_DI_Y_OFFSET;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(-diWidth / 2, outDiY, diWidth, diHeight, diHeight / 2);
      ctx.fill();
      break;
    }

    default: {
      ctx.fillStyle = frameColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 10;
      ctx.beginPath();
      ctx.roundRect(-mockupWidth / 2 - 8, -mockupHeight / 2 - 8, mockupWidth + 16, mockupHeight + 16, cornerRadius + 4);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      if (img) {
        ctx.beginPath();
        ctx.roundRect(-mockupWidth / 2, -mockupHeight / 2, mockupWidth, mockupHeight, cornerRadius);
        ctx.clip();
        const imgAspect = img.width / img.height;
        const frameAspect = mockupWidth / mockupHeight;
        const drawH = imgAspect > frameAspect ? mockupHeight : mockupWidth / imgAspect;
        const drawW = imgAspect > frameAspect ? drawH * imgAspect : mockupWidth;
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      }

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.roundRect(-diWidth / 2, -mockupHeight / 2 + 8, diWidth, mockupHeight * 0.035, 10);
      ctx.fill();
    }
  }
};

// Draw background with gradient/solid and optional pattern
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

  if (style.pattern && style.pattern.type !== 'none') {
    drawPreviewPattern(ctx, x, y, width, height, style.pattern);
  }
}

// Draw pattern for preview (simplified for performance)
export function drawPreviewPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  pattern: StyleConfig['pattern']
) {
  if (!pattern || pattern.type === 'none') return;

  const { type, color, opacity, size, spacing } = pattern;
  const scale = 0.15;
  const scaledSize = Math.max(1, size * scale);
  const scaledSpacing = spacing * scale;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x, y);

  switch (type) {
    case 'dots':
      ctx.fillStyle = color;
      for (let px = scaledSpacing / 2; px < width; px += scaledSpacing) {
        for (let py = scaledSpacing / 2; py < height; py += scaledSpacing) {
          ctx.beginPath();
          ctx.arc(px, py, scaledSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    case 'grid':
      ctx.strokeStyle = color;
      ctx.lineWidth = scaledSize;
      for (let px = 0; px <= width; px += scaledSpacing) {
        ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, height); ctx.stroke();
      }
      for (let py = 0; py <= height; py += scaledSpacing) {
        ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(width, py); ctx.stroke();
      }
      break;
    case 'diagonal-lines':
      ctx.strokeStyle = color;
      ctx.lineWidth = scaledSize;
      for (let i = -height; i < width + height; i += scaledSpacing) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + height, height); ctx.stroke();
      }
      break;
    case 'circles':
      ctx.strokeStyle = color;
      ctx.lineWidth = scaledSize;
      for (let px = scaledSpacing; px < width; px += scaledSpacing * 2) {
        for (let py = scaledSpacing; py < height; py += scaledSpacing * 2) {
          ctx.beginPath(); ctx.arc(px, py, scaledSpacing / 2, 0, Math.PI * 2); ctx.stroke();
        }
      }
      break;
    case 'squares':
      ctx.strokeStyle = color;
      ctx.lineWidth = scaledSize;
      const squareSize = scaledSpacing * 0.6;
      for (let px = scaledSpacing / 2; px < width; px += scaledSpacing) {
        for (let py = scaledSpacing / 2; py < height; py += scaledSpacing) {
          ctx.strokeRect(px - squareSize / 2, py - squareSize / 2, squareSize, squareSize);
        }
      }
      break;
  }

  ctx.restore();
}

// Calculate rotated bounding box top position
export function getRotatedMockupTop(
  centerY: number,
  mockupWidth: number,
  mockupHeight: number,
  rotationDegrees: number
): number {
  const rad = (rotationDegrees * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const bboxHeight = mockupWidth * sin + mockupHeight * cos;
  return centerY - bboxHeight / 2;
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
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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

interface MockupInfo {
  centerY: number;
  height: number;
  width: number;
  rotation: number;
}

// Draw text with adaptive sizing for preview
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  canvasHeight: number,
  width: number,
  style: StyleConfig,
  override?: Screenshot['styleOverride'],
  mockupInfo?: MockupInfo
) {
  if (!text) return;

  const textColor = override?.textColor ?? style.textColor;
  const maxWidth = width * 0.85;

  let availableHeight: number;
  let textAreaY: number;

  if (mockupInfo && style.showMockup) {
    const mockupTop = getRotatedMockupTop(mockupInfo.centerY, mockupInfo.width, mockupInfo.height, mockupInfo.rotation);
    const paddingTop = style.paddingTop * 0.04;
    const gapFromMockup = 4;

    if (style.textPosition === 'top') {
      availableHeight = Math.max(mockupTop - gapFromMockup - paddingTop, 20);
      textAreaY = paddingTop;
    } else {
      const mockupBottom = mockupInfo.centerY + mockupInfo.height / 2;
      availableHeight = Math.max(canvasHeight - mockupBottom - gapFromMockup - 8, 20);
      textAreaY = mockupBottom + gapFromMockup;
    }
  } else {
    availableHeight = canvasHeight * 0.3;
    textAreaY = style.textPosition === 'top' ? 8 : canvasHeight - availableHeight - 8;
  }

  const fontSize = calculatePreviewFontSize(ctx, text, maxWidth, availableHeight, style.fontFamily);
  ctx.font = `bold ${fontSize}px ${style.fontFamily}`;

  const lines = wrapFormattedText(ctx, text, maxWidth);
  const lineHeight = fontSize * 1.3;
  const totalTextHeight = lines.length * lineHeight;

  const textOffsetX = (style.textOffset?.x || 0) * width / 100;
  const textOffsetY = (style.textOffset?.y || 0) * canvasHeight / 100;

  let textY: number;
  if (style.textPosition === 'top') {
    textY = textAreaY + fontSize + (availableHeight - totalTextHeight) / 4 + textOffsetY;
  } else {
    textY = textAreaY + (availableHeight - totalTextHeight) / 2 + fontSize + textOffsetY;
  }

  lines.forEach((line, lineIndex) => {
    const y = textY + lineIndex * lineHeight;
    const lineWidth = measureLineWidth(ctx, line);
    let lineX = x + (width - lineWidth) / 2 + textOffsetX;

    for (const segment of line.segments) {
      const segmentWidth = ctx.measureText(segment.text).width;

      if (segment.highlighted && segment.text.trim()) {
        const paddingH = fontSize * 0.25;
        const paddingV = fontSize * 0.15;
        const radius = fontSize * 0.15;

        ctx.save();
        ctx.fillStyle = style.highlightColor || '#FFE135';
        ctx.beginPath();
        ctx.roundRect(lineX - paddingH, y - fontSize * 0.9 - paddingV, segmentWidth + paddingH * 2, fontSize * 1.1 + paddingV * 2, radius);
        ctx.fill();
        ctx.restore();
      }

      ctx.fillStyle = textColor;
      ctx.textAlign = 'left';
      ctx.fillText(segment.text, lineX, y);
      lineX += segmentWidth;
    }
  });
}
