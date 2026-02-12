import { Decoration, StarRatingDecoration, LaurelDecoration } from '../types';
import { loadImage } from './canvasShared';

// Draw a 5-pointed star
const drawStar = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
): void => {
  const spikes = 5;
  const outerRadius = size / 2;
  const innerRadius = outerRadius * 0.4;
  const rotation = -Math.PI / 2; // Start from top

  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();

  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / spikes + rotation;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

// Draw star rating decoration
const drawStarRating = (
  ctx: CanvasRenderingContext2D,
  decoration: StarRatingDecoration
): void => {
  if (!decoration.enabled) return;

  const { count, size, color, position } = decoration;
  const gap = size * 0.2;
  const totalWidth = count * size + (count - 1) * gap;
  const startX = position.x - totalWidth / 2 + size / 2;

  for (let i = 0; i < count; i++) {
    const x = startX + i * (size + gap);
    drawStar(ctx, x, position.y, size, color);
  }
};

// Laurel wreath image cache
let laurelImageCache: HTMLImageElement | null = null;

const loadLaurelImage = async (): Promise<HTMLImageElement> => {
  if (laurelImageCache) {
    return laurelImageCache;
  }
  const img = await loadImage('/mockups/laurel-wreath.png');
  laurelImageCache = img;
  return img;
};

// Tint an image with a specific color
const tintImage = (
  img: HTMLImageElement,
  color: string,
  width: number,
  height: number
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(img, 0, 0, width, height);

  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  return canvas;
};

// Calculate adaptive font sizes for laurel text to fit within wreath
const calculateAdaptiveLaurelSizes = (
  ctx: CanvasRenderingContext2D,
  textBlocks: LaurelDecoration['textBlocks'],
  maxWidth: number,
  maxHeight: number,
  fontFamily: string
): { sizes: number[]; totalHeight: number } => {
  let scaleFactor = 1.0;
  const minScale = 0.3;

  while (scaleFactor >= minScale) {
    const sizes = textBlocks.map(b => Math.round(b.size * scaleFactor));
    let totalHeight = 0;
    let allFit = true;

    for (let i = 0; i < textBlocks.length; i++) {
      const block = textBlocks[i];
      const fontSize = sizes[i];
      const fontWeight = block.bold ? 'bold ' : '';
      ctx.font = `${fontWeight}${fontSize}px ${fontFamily}`;

      const lines = block.text.split(/\||\n/).map(l => l.trim());
      const lineHeight = fontSize * 1.1;
      totalHeight += lines.length * lineHeight;

      for (const line of lines) {
        const lineWidth = ctx.measureText(line).width;
        if (lineWidth > maxWidth) {
          allFit = false;
          break;
        }
      }
      if (!allFit) break;
    }

    if (allFit && totalHeight <= maxHeight) {
      return { sizes, totalHeight };
    }

    scaleFactor -= 0.05;
  }

  return {
    sizes: textBlocks.map(b => Math.round(b.size * minScale)),
    totalHeight: textBlocks.reduce((sum, b) => sum + Math.round(b.size * minScale) * 1.1, 0)
  };
};

// Draw laurel wreath decoration using image
const drawLaurelWreath = async (
  ctx: CanvasRenderingContext2D,
  decoration: LaurelDecoration
): Promise<void> => {
  if (!decoration.enabled) return;

  const { size, color, position, textBlocks, textColor, fontFamily } = decoration;

  const baseWidth = 500 * size;
  let baseHeight = baseWidth;

  try {
    const laurelImg = await loadLaurelImage();
    baseHeight = baseWidth * (laurelImg.height / laurelImg.width);

    const tintedCanvas = tintImage(laurelImg, color, baseWidth, baseHeight);

    const drawX = position.x - baseWidth / 2;
    const drawY = position.y - baseHeight / 2;

    ctx.drawImage(tintedCanvas, drawX, drawY, baseWidth, baseHeight);
  } catch (e) {
    console.error('Failed to load laurel image:', e);
  }

  if (textBlocks && textBlocks.length > 0) {
    ctx.save();
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const font = fontFamily || 'SF Pro Display, -apple-system, sans-serif';

    const innerWidth = baseWidth * 0.55;
    const innerHeight = baseHeight * 0.65;

    const { sizes, totalHeight } = calculateAdaptiveLaurelSizes(
      ctx, textBlocks, innerWidth, innerHeight, font
    );

    const blockData: { lines: string[]; size: number; lineHeight: number }[] = [];
    textBlocks.forEach((block, idx) => {
      const lines = block.text.split(/\||\n/).map(l => l.trim());
      const fontSize = sizes[idx];
      const lineHeight = fontSize * 1.1;
      blockData.push({ lines, size: fontSize, lineHeight });
    });

    let currentY = position.y - totalHeight / 2;
    blockData.forEach((block, blockIndex) => {
      const fontWeight = textBlocks[blockIndex].bold ? 'bold ' : '';
      ctx.font = `${fontWeight}${block.size}px ${font}`;

      block.lines.forEach((line) => {
        currentY += block.lineHeight / 2;
        ctx.fillText(line, position.x, currentY);
        currentY += block.lineHeight / 2;
      });
    });

    ctx.restore();
  }
};

// Draw all decorations
export const drawDecorations = async (
  ctx: CanvasRenderingContext2D,
  decorations: Decoration[] | undefined
): Promise<void> => {
  if (!decorations) return;

  for (const decoration of decorations) {
    if (decoration.type === 'stars') {
      drawStarRating(ctx, decoration);
    } else if (decoration.type === 'laurel') {
      await drawLaurelWreath(ctx, decoration);
    }
  }
};
