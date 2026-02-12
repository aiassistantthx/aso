import { StyleConfig } from '../types';
import { ParsedLine, wrapFormattedText, measureLineWidth } from './textFormatting';
import { calculateRotatedBounds } from './canvasShared';

// Draw formatted text with highlights
export const drawFormattedText = (
  ctx: CanvasRenderingContext2D,
  lines: ParsedLine[],
  startX: number,
  startY: number,
  lineHeight: number,
  style: StyleConfig,
  maxWidth: number
): void => {
  const textAlign = style.textAlign;

  lines.forEach((line, lineIndex) => {
    const y = startY + lineIndex * lineHeight;
    const lineWidth = measureLineWidth(ctx, line);

    let x: number;
    switch (textAlign) {
      case 'left':
        x = startX;
        break;
      case 'right':
        x = startX + maxWidth - lineWidth;
        break;
      case 'center':
      default:
        x = startX + (maxWidth - lineWidth) / 2;
        break;
    }

    for (const segment of line.segments) {
      const segmentWidth = ctx.measureText(segment.text).width;

      if (segment.highlighted && segment.text.trim()) {
        const paddingH = Math.max(style.highlightPadding || 12, style.fontSize * 0.18);
        const paddingV = Math.max(8, style.fontSize * 0.12);
        const radius = style.highlightBorderRadius || Math.max(8, style.fontSize * 0.1);

        ctx.save();
        ctx.fillStyle = style.highlightColor || '#FFE135';
        ctx.beginPath();
        ctx.roundRect(
          x - paddingH,
          y - style.fontSize * 0.88 - paddingV,
          segmentWidth + paddingH * 2,
          style.fontSize * 1.1 + paddingV * 2,
          radius
        );
        ctx.fill();
        ctx.restore();
      }

      ctx.fillStyle = style.textColor;
      ctx.fillText(segment.text, x, y);

      x += segmentWidth;
    }
  });
};

// Calculate adaptive font size to fill available space (binary search)
export const calculateAdaptiveFontSize = (
  ctx: CanvasRenderingContext2D,
  text: string,
  baseFontSize: number,
  maxWidth: number,
  maxHeight: number,
  fontFamily: string
): number => {
  const minFontSize = Math.max(16, baseFontSize * 0.2);
  const maxFontSize = Math.min(baseFontSize * 2, 200);

  let low = minFontSize;
  let high = maxFontSize;
  let bestFit = minFontSize;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    ctx.font = `bold ${mid}px ${fontFamily}`;
    const lines = wrapFormattedText(ctx, text, maxWidth);
    const lineHeight = mid * 1.4;
    const totalHeight = lines.length * lineHeight;

    let fits = totalHeight <= maxHeight;

    if (fits) {
      for (const line of lines) {
        const lineWidth = measureLineWidth(ctx, line);
        if (lineWidth > maxWidth * 1.02) {
          fits = false;
          break;
        }
      }
    }

    if (fits) {
      bestFit = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return bestFit;
};

// Available text area bounds
export interface TextAreaBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Calculate available text area based on mockup position and rotation
export const calculateTextArea = (
  canvasWidth: number,
  canvasHeight: number,
  mockupCenterX: number,
  mockupCenterY: number,
  mockupWidth: number,
  mockupHeight: number,
  rotation: number,
  textPosition: 'top' | 'bottom',
  paddingTop: number,
  paddingBottom: number,
  sidePadding: number
): TextAreaBounds => {
  const rotatedBounds = calculateRotatedBounds(
    mockupCenterX, mockupCenterY,
    mockupWidth, mockupHeight, rotation
  );

  const gapFromMockup = 15;
  const minSidePadding = sidePadding;

  const textLeft = minSidePadding;
  const textRight = canvasWidth - minSidePadding;
  const width = textRight - textLeft;
  const x = textLeft;

  if (textPosition === 'top') {
    const availableBottom = Math.max(rotatedBounds.top - gapFromMockup, paddingTop + 30);
    const height = Math.max(availableBottom - paddingTop, 30);
    return { x, y: paddingTop, width, height };
  } else {
    const availableTop = Math.min(rotatedBounds.bottom + gapFromMockup, canvasHeight - paddingBottom - 30);
    const height = Math.max(canvasHeight - paddingBottom - availableTop, 30);
    return { x, y: availableTop, width, height };
  }
};
