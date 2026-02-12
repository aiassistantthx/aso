import { BackgroundPattern } from '../types';

// Shared image loader with CORS handling
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    try {
      const url = new URL(src, window.location.origin);
      if (url.origin !== window.location.origin) {
        img.crossOrigin = 'anonymous';
      }
    } catch {
      // relative URL — same origin, no crossOrigin needed
    }
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Rotated bounding box calculation
export interface RotatedBounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

export const calculateRotatedBounds = (
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  rotationDegrees: number
): RotatedBounds => {
  const rad = (rotationDegrees * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));

  const bboxWidth = width * cos + height * sin;
  const bboxHeight = width * sin + height * cos;

  return {
    top: centerY - bboxHeight / 2,
    bottom: centerY + bboxHeight / 2,
    left: centerX - bboxWidth / 2,
    right: centerX + bboxWidth / 2,
    width: bboxWidth,
    height: bboxHeight
  };
};

// Draw a screenshot image clipped to a rounded rect, cover-style
// Works with both absolute and centered coordinate systems
export const drawScreenshotClipped = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  cornerRadius: number
): void => {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, cornerRadius);
  ctx.clip();

  const imgAspect = img.width / img.height;
  const screenAspect = width / height;
  let drawW, drawH, drawX, drawY;

  if (imgAspect > screenAspect) {
    drawH = height;
    drawW = drawH * imgAspect;
    drawX = x + (width - drawW) / 2;
    drawY = y;
  } else {
    drawW = width;
    drawH = drawW / imgAspect;
    drawX = x;
    drawY = y + (height - drawH) / 2;
  }
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();
};

// Draw background pattern overlay with configurable scale
// canvas.ts calls with scale=1.0, drawHelpers calls with scale=0.15
export const drawBackgroundPattern = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  pattern: BackgroundPattern,
  scale: number = 1.0
): void => {
  if (!pattern || pattern.type === 'none') return;

  const { type, color, opacity, size, spacing } = pattern;
  const scaledSize = scale === 1.0 ? size : Math.max(1, size * scale);
  const scaledSpacing = spacing * scale;

  ctx.save();
  ctx.globalAlpha = opacity;
  if (x !== 0 || y !== 0) {
    ctx.translate(x, y);
  }

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
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, height);
        ctx.stroke();
      }
      for (let py = 0; py <= height; py += scaledSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(width, py);
        ctx.stroke();
      }
      break;

    case 'diagonal-lines':
      ctx.strokeStyle = color;
      ctx.lineWidth = scaledSize;
      for (let i = -height; i < width + height; i += scaledSpacing) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
      }
      break;

    case 'circles':
      ctx.strokeStyle = color;
      ctx.lineWidth = scaledSize;
      for (let px = scaledSpacing; px < width; px += scaledSpacing * 2) {
        for (let py = scaledSpacing; py < height; py += scaledSpacing * 2) {
          ctx.beginPath();
          ctx.arc(px, py, scaledSpacing / 2, 0, Math.PI * 2);
          ctx.stroke();
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
};
