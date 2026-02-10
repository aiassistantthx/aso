import { StyleConfig, DeviceSize, DEVICE_SIZES, Decoration, StarRatingDecoration, LaurelDecoration, ScreenshotStyleOverride, BackgroundPattern, MockupContinuation, ScreenshotMockupSettings } from '../types';

export interface ElementBounds {
  mockup: { x: number; y: number; width: number; height: number };
  text: { x: number; y: number; width: number; height: number };
}

export interface GenerateImageOptions {
  screenshot: string | null;
  text: string;
  style: StyleConfig;
  deviceSize: DeviceSize;
  decorations?: Decoration[];
  styleOverride?: ScreenshotStyleOverride;  // per-screenshot color overrides
  // For mockup continuation: override which screenshot to show in mockup
  mockupScreenshot?: string | null;
  // Per-screenshot mockup continuation (overrides style.mockupContinuation)
  mockupContinuation?: MockupContinuation;
  // Per-screenshot mockup positioning (from ScreensFlowEditor)
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

// Mockup image cache
let mockupImageCache: HTMLImageElement | null = null;

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Only set crossOrigin for cross-origin URLs (e.g. external DALL-E images)
    // Same-origin /uploads/ paths don't need it and it can cause CORS failures
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

const loadMockupImage = async (): Promise<HTMLImageElement> => {
  if (mockupImageCache) {
    return mockupImageCache;
  }
  const img = await loadImage('/mockups/iphone-black.png');
  mockupImageCache = img;
  return img;
};

// Text segment with optional highlight
interface TextSegment {
  text: string;
  highlighted: boolean;
}

// Line containing multiple text segments
interface ParsedLine {
  segments: TextSegment[];
}

// Parse text with [highlighted] syntax and | line breaks
const parseFormattedText = (text: string): ParsedLine[] => {
  // Split by | or newline for manual line breaks
  const rawLines = text.split(/\||\n/);

  return rawLines.map(line => {
    const segments: TextSegment[] = [];
    // Match [highlighted text] patterns
    const regex = /\[([^\]]+)\]|([^\[]+)/g;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match[1]) {
        // Highlighted text (inside brackets)
        segments.push({ text: match[1], highlighted: true });
      } else if (match[2]) {
        // Normal text
        segments.push({ text: match[2], highlighted: false });
      }
    }

    return { segments };
  });
};

// Measure total width of a line with all its segments
const measureLineWidth = (ctx: CanvasRenderingContext2D, line: ParsedLine): number => {
  return line.segments.reduce((total, segment) => {
    return total + ctx.measureText(segment.text).width;
  }, 0);
};

// Wrap formatted text to fit within maxWidth
const wrapFormattedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): ParsedLine[] => {
  const parsedLines = parseFormattedText(text);
  const wrappedLines: ParsedLine[] = [];

  for (const line of parsedLines) {
    let currentLine: TextSegment[] = [];
    let currentWidth = 0;

    for (const segment of line.segments) {
      const words = segment.text.split(' ');

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const wordWithSpace = i > 0 || currentLine.length > 0 ? ' ' + word : word;
        const wordWidth = ctx.measureText(wordWithSpace).width;

        if (currentWidth + wordWidth > maxWidth && currentLine.length > 0) {
          // Start new line
          wrappedLines.push({ segments: currentLine });
          currentLine = [];
          currentWidth = 0;

          // Add word to new line without leading space
          const trimmedWord = word;
          currentLine.push({ text: trimmedWord, highlighted: segment.highlighted });
          currentWidth = ctx.measureText(trimmedWord).width;
        } else {
          // Add to current line
          if (currentLine.length > 0 && currentLine[currentLine.length - 1].highlighted === segment.highlighted) {
            // Same highlight state, append to last segment
            currentLine[currentLine.length - 1].text += wordWithSpace;
          } else {
            // Different highlight state, create new segment
            currentLine.push({ text: wordWithSpace.trimStart() ? wordWithSpace : word, highlighted: segment.highlighted });
          }
          currentWidth += wordWidth;
        }
      }
    }

    if (currentLine.length > 0) {
      wrappedLines.push({ segments: currentLine });
    }
  }

  return wrappedLines;
};

// Draw formatted text with highlights
const drawFormattedText = (
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

    // Calculate starting X based on alignment
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

    // Draw each segment
    for (const segment of line.segments) {
      const segmentWidth = ctx.measureText(segment.text).width;

      if (segment.highlighted && segment.text.trim()) {
        // Draw highlight background - adaptive padding based on font size
        const paddingH = Math.max(style.highlightPadding || 12, style.fontSize * 0.18); // Horizontal
        const paddingV = Math.max(8, style.fontSize * 0.12); // Vertical
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

      // Draw text
      ctx.fillStyle = style.textColor;
      ctx.fillText(segment.text, x, y);

      x += segmentWidth;
    }
  });
};

// Calculate adaptive font size to fill available space
// Tries to maximize font size while still fitting within bounds
const calculateAdaptiveFontSize = (
  ctx: CanvasRenderingContext2D,
  text: string,
  baseFontSize: number,
  maxWidth: number,
  maxHeight: number,
  fontFamily: string
): number => {
  const minFontSize = Math.max(24, baseFontSize * 0.25); // Don't go below 25% of original or 24px
  const maxFontSize = Math.min(baseFontSize * 2, 200); // Can grow up to 2x or 200px max

  // Binary search for optimal font size
  let low = minFontSize;
  let high = maxFontSize;
  let bestFit = minFontSize;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    ctx.font = `bold ${mid}px ${fontFamily}`;
    const lines = wrapFormattedText(ctx, text, maxWidth);
    const lineHeight = mid * 1.4;
    const totalHeight = lines.length * lineHeight;

    // Check if text fits
    let fits = totalHeight <= maxHeight;

    // Also check that no single line is too wide (for very long words)
    if (fits) {
      for (const line of lines) {
        const lineWidth = measureLineWidth(ctx, line);
        if (lineWidth > maxWidth * 1.02) { // Allow 2% overflow
          fits = false;
          break;
        }
      }
    }

    if (fits) {
      bestFit = mid;
      low = mid + 1; // Try larger
    } else {
      high = mid - 1; // Try smaller
    }
  }

  return bestFit;
};

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
  // Create off-screen canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Draw the original image
  ctx.drawImage(img, 0, 0, width, height);

  // Apply color tint using multiply blend mode
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
  // Start with original sizes and scale down if needed
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

      // Check if any line is too wide
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

  // Return minimum sizes if nothing fits
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

  // Calculate dimensions based on size multiplier
  const baseWidth = 500 * size;
  let baseHeight = baseWidth;

  try {
    const laurelImg = await loadLaurelImage();
    baseHeight = baseWidth * (laurelImg.height / laurelImg.width);

    // Tint the image with the selected color
    const tintedCanvas = tintImage(laurelImg, color, baseWidth, baseHeight);

    // Draw centered at position
    const drawX = position.x - baseWidth / 2;
    const drawY = position.y - baseHeight / 2;

    ctx.drawImage(tintedCanvas, drawX, drawY, baseWidth, baseHeight);
  } catch (e) {
    console.error('Failed to load laurel image:', e);
  }

  // Draw text blocks with adaptive sizes
  if (textBlocks && textBlocks.length > 0) {
    ctx.save();
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const font = fontFamily || 'SF Pro Display, -apple-system, sans-serif';

    // Calculate inner area of wreath (roughly 60% of width, 70% of height)
    const innerWidth = baseWidth * 0.55;
    const innerHeight = baseHeight * 0.65;

    // Calculate adaptive sizes
    const { sizes, totalHeight } = calculateAdaptiveLaurelSizes(
      ctx,
      textBlocks,
      innerWidth,
      innerHeight,
      font
    );

    // Build block data with adaptive sizes
    const blockData: { lines: string[]; size: number; lineHeight: number }[] = [];
    textBlocks.forEach((block, idx) => {
      const lines = block.text.split(/\||\n/).map(l => l.trim());
      const fontSize = sizes[idx];
      const lineHeight = fontSize * 1.1;
      blockData.push({ lines, size: fontSize, lineHeight });
    });

    // Draw each block centered
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
const drawDecorations = async (
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

// Draw background pattern overlay
const drawBackgroundPattern = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pattern: BackgroundPattern
): void => {
  if (!pattern || pattern.type === 'none') return;

  const { type, color, opacity, size, spacing } = pattern;

  ctx.save();
  ctx.globalAlpha = opacity;

  switch (type) {
    case 'dots':
      ctx.fillStyle = color;
      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;

    case 'grid':
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      // Vertical lines
      for (let x = 0; x <= width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      // Horizontal lines
      for (let y = 0; y <= height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      break;

    case 'diagonal-lines':
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      // Draw diagonal lines from top-left to bottom-right
      for (let i = -height; i < width + height; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
      }
      break;

    case 'circles':
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      for (let x = spacing; x < width; x += spacing * 2) {
        for (let y = spacing; y < height; y += spacing * 2) {
          ctx.beginPath();
          ctx.arc(x, y, spacing / 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      break;

    case 'squares':
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      const squareSize = spacing * 0.6;
      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          ctx.strokeRect(
            x - squareSize / 2,
            y - squareSize / 2,
            squareSize,
            squareSize
          );
        }
      }
      break;
  }

  ctx.restore();
};

// Screen area coordinates within the mockup image (2000x2000)
// Blue iPhone 15 mockup with transparent background
const MOCKUP_CONFIG = {
  imageWidth: 2000,
  imageHeight: 2000,
  // Phone bounds within the image
  phoneX: 575,
  phoneY: 42,
  phoneWidth: 850,
  phoneHeight: 1740,
  // Screen bounds within the image (inside the phone frame)
  screenX: 600,
  screenY: 60,
  screenWidth: 800,
  screenHeight: 1700,
  // Corner radius for the screen
  screenCornerRadius: 80,
  // Dynamic Island coordinates (relative to image)
  dynamicIslandX: 870,
  dynamicIslandY: 100,
  dynamicIslandWidth: 260,
  dynamicIslandHeight: 75,
  dynamicIslandRadius: 37,
  // Side buttons (relative to phone bounds)
  buttons: {
    // Left side - Silent switch and Volume buttons
    leftSwitch: { x: -12, y: 280, width: 12, height: 60 },
    leftVolumeUp: { x: -12, y: 380, width: 12, height: 120 },
    leftVolumeDown: { x: -12, y: 520, width: 12, height: 120 },
    // Right side - Power button
    rightPower: { x: 850, y: 420, width: 12, height: 180 }
  }
};


const getVisibilityRatio = (visibility: StyleConfig['mockupVisibility']): number => {
  switch (visibility) {
    case '2/3': return 2 / 3;
    case '1/2': return 0.5;
    default: return 1;
  }
};

// Calculate bounding box of a rotated rectangle
// Returns the top Y coordinate of the rotated mockup
interface RotatedBounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

const calculateRotatedMockupBounds = (
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  rotationDegrees: number
): RotatedBounds => {
  const rad = (rotationDegrees * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));

  // Bounding box dimensions after rotation
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

// Calculate available text area based on mockup position and rotation
interface TextAreaBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

const calculateTextArea = (
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
  const rotatedBounds = calculateRotatedMockupBounds(
    mockupCenterX,
    mockupCenterY,
    mockupWidth,
    mockupHeight,
    rotation
  );

  // Calculate horizontal text area accounting for mockup position
  // Ensure text doesn't overlap with mockup horizontally
  const gapFromMockup = 60; // Gap between text and mockup
  const minSidePadding = sidePadding;

  // Calculate text width - reduce if mockup extends into text area horizontally
  let textLeft = minSidePadding;
  let textRight = canvasWidth - minSidePadding;

  // If mockup is offset to the left, we may need to move text right boundary
  // If mockup is offset to the right, we may need to move text left boundary
  const mockupLeft = rotatedBounds.left;
  const mockupRight = rotatedBounds.right;

  // Only constrain horizontally if mockup extends significantly into text area
  if (mockupRight > textRight - gapFromMockup && mockupCenterX > canvasWidth / 2) {
    // Mockup is on the right side, reduce text width from right
    textRight = Math.max(mockupLeft - gapFromMockup, canvasWidth * 0.5);
  } else if (mockupLeft < textLeft + gapFromMockup && mockupCenterX < canvasWidth / 2) {
    // Mockup is on the left side, reduce text width from left
    textLeft = Math.min(mockupRight + gapFromMockup, canvasWidth * 0.5);
  }

  const width = textRight - textLeft;
  const x = textLeft;

  if (textPosition === 'top') {
    // Text at top: from paddingTop to mockup's top edge (minus gap)
    const availableBottom = Math.max(rotatedBounds.top - gapFromMockup, paddingTop + 50);
    const height = availableBottom - paddingTop;
    return { x, y: paddingTop, width, height: Math.max(height, 100) };
  } else {
    // Text at bottom: from mockup's bottom edge (plus gap) to canvas bottom minus paddingBottom
    const availableTop = Math.min(rotatedBounds.bottom + gapFromMockup, canvasHeight - paddingBottom - 50);
    const height = canvasHeight - paddingBottom - availableTop;
    return { x, y: availableTop, width, height: Math.max(height, 100) };
  }
};

// Calculate element bounds for hit testing (in original canvas coordinates)
export const getElementBounds = (style: StyleConfig, deviceSize: DeviceSize): ElementBounds => {
  const dimensions = DEVICE_SIZES[deviceSize];
  const visibilityRatio = getVisibilityRatio(style.mockupVisibility);
  const mockupScale = style.mockupScale ?? 1.0;

  // Use CONSISTENT text area height for mockup size calculation (35%)
  // This ensures mockups are the same size regardless of text position
  const textAreaHeightForMockup = dimensions.height * 0.35;

  const availableHeight = dimensions.height - textAreaHeightForMockup - 40;
  const baseMockupHeight = Math.min(availableHeight, dimensions.height * 0.75);
  const mockupHeight = baseMockupHeight * mockupScale;
  const phoneAspect = MOCKUP_CONFIG.phoneWidth / MOCKUP_CONFIG.phoneHeight;
  const mockupWidth = mockupHeight * phoneAspect;

  // Calculate mockup position
  const visiblePhoneHeight = mockupHeight * visibilityRatio;
  const hiddenHeight = mockupHeight - visiblePhoneHeight;

  let mockupY: number;
  switch (style.mockupAlignment) {
    case 'top':
      // When text is at top, offset mockup down to leave room for text
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

  // Apply offsets
  const finalMockupX = mockupX + (style.mockupOffset?.x || 0);
  const finalMockupY = mockupY + (style.mockupOffset?.y || 0);

  // Calculate text bounds
  const maxTextWidth = dimensions.width * 0.85;
  const lineHeight = style.fontSize * 1.2;
  const estimatedLines = 2; // Approximate

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

  // Apply text offset
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

const drawSideButtons = (
  ctx: CanvasRenderingContext2D,
  mockupX: number,
  mockupY: number,
  scale: number,
  frameColor: string
): void => {
  const buttons = MOCKUP_CONFIG.buttons;
  const buttonRadius = 4 * scale;

  // Darker shade for buttons
  ctx.fillStyle = frameColor === '#F5F5F7' ? '#D2D2D7' :
                  frameColor === '#E3D5C8' ? '#C5B5A6' : '#2D2D2F';

  // Draw each button
  const drawButton = (btn: { x: number; y: number; width: number; height: number }) => {
    const x = mockupX + btn.x * scale;
    const y = mockupY + btn.y * scale;
    const w = btn.width * scale;
    const h = btn.height * scale;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, buttonRadius);
    ctx.fill();
  };

  drawButton(buttons.leftSwitch);
  drawButton(buttons.leftVolumeUp);
  drawButton(buttons.leftVolumeDown);
  drawButton(buttons.rightPower);
};

const getFrameColor = (color: 'black' | 'white' | 'natural'): string => {
  switch (color) {
    case 'white': return '#F5F5F7';
    case 'natural': return '#E3D5C8';
    default: return '#1D1D1F';
  }
};

// Draw side buttons for programmatic mockups
const drawProgrammaticSideButtons = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  frameColor: string
): void => {
  // Button color - slightly darker than frame
  const buttonColor = frameColor === '#F5F5F7' ? '#D1D1D6' :
                      frameColor === '#E3D5C8' ? '#C4B5A8' : '#0D0D0D';

  const buttonWidth = width * 0.012;
  const buttonRadius = buttonWidth / 2;

  ctx.fillStyle = buttonColor;

  // Left side - Action button (small, top)
  const actionBtnHeight = height * 0.035;
  const actionBtnY = y + height * 0.15;
  ctx.beginPath();
  ctx.roundRect(x - buttonWidth, actionBtnY, buttonWidth, actionBtnHeight, buttonRadius);
  ctx.fill();

  // Left side - Volume Up
  const volUpHeight = height * 0.065;
  const volUpY = y + height * 0.22;
  ctx.beginPath();
  ctx.roundRect(x - buttonWidth, volUpY, buttonWidth, volUpHeight, buttonRadius);
  ctx.fill();

  // Left side - Volume Down
  const volDownY = volUpY + volUpHeight + height * 0.015;
  ctx.beginPath();
  ctx.roundRect(x - buttonWidth, volDownY, buttonWidth, volUpHeight, buttonRadius);
  ctx.fill();

  // Right side - Power button
  const powerHeight = height * 0.08;
  const powerY = y + height * 0.24;
  ctx.beginPath();
  ctx.roundRect(x + width, powerY, buttonWidth, powerHeight, buttonRadius);
  ctx.fill();
};

// Draw flat style mockup (solid colored frame like real iPhone)
const drawFlatMockup = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  frameColor: string,
  screenshot: HTMLImageElement | null
): void => {
  // iPhone proportions - frame is about 3% of width on sides
  const frameThickness = width * 0.035;
  const cornerRadius = width * 0.12;
  const screenCornerRadius = cornerRadius - frameThickness * 0.8;

  // Dynamic Island dimensions (relative to screen)
  const screenWidth = width - frameThickness * 2;
  const dynamicIslandWidth = screenWidth * 0.32;
  const dynamicIslandHeight = height * 0.022;
  const dynamicIslandY = y + frameThickness + height * 0.008;

  // Draw shadow first
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetX = 10;
  ctx.shadowOffsetY = 20;

  // Draw solid phone body
  ctx.fillStyle = frameColor;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, cornerRadius);
  ctx.fill();
  ctx.restore();

  // Draw side buttons
  drawProgrammaticSideButtons(ctx, x, y, width, height, frameColor);

  // Screen area
  const screenX = x + frameThickness;
  const screenY = y + frameThickness;
  const screenHeight = height - frameThickness * 2;

  // Draw black screen background first (prevents any bleed-through)
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(screenX, screenY, screenWidth, screenHeight, screenCornerRadius);
  ctx.fill();

  // Draw screenshot clipped to screen
  if (screenshot) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(screenX, screenY, screenWidth, screenHeight, screenCornerRadius);
    ctx.clip();

    const imgAspect = screenshot.width / screenshot.height;
    const screenAspect = screenWidth / screenHeight;
    let drawW, drawH, drawX, drawY;

    if (imgAspect > screenAspect) {
      drawH = screenHeight;
      drawW = drawH * imgAspect;
      drawX = screenX - (drawW - screenWidth) / 2;
      drawY = screenY;
    } else {
      drawW = screenWidth;
      drawH = drawW / imgAspect;
      drawX = screenX;
      drawY = screenY - (drawH - screenHeight) / 2;
    }
    ctx.drawImage(screenshot, drawX, drawY, drawW, drawH);
    ctx.restore();
  }

  // Draw Dynamic Island on top
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(
    x + (width - dynamicIslandWidth) / 2,
    dynamicIslandY,
    dynamicIslandWidth,
    dynamicIslandHeight,
    dynamicIslandHeight / 2
  );
  ctx.fill();
};

// Draw minimal style mockup (thin border, clean look)
const drawMinimalMockup = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  frameColor: string,
  screenshot: HTMLImageElement | null
): void => {
  const borderWidth = width * 0.02;
  const cornerRadius = width * 0.1;
  const innerRadius = cornerRadius - borderWidth;

  // Dynamic Island
  const dynamicIslandWidth = width * 0.28;
  const dynamicIslandHeight = height * 0.018;
  const dynamicIslandY = y + borderWidth + height * 0.01;

  // Draw shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 35;
  ctx.shadowOffsetY = 12;

  // Draw border frame
  ctx.fillStyle = frameColor;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, cornerRadius);
  ctx.fill();
  ctx.restore();

  // Draw side buttons
  drawProgrammaticSideButtons(ctx, x, y, width, height, frameColor);

  // Screen area (inside border)
  const screenX = x + borderWidth;
  const screenY = y + borderWidth;
  const screenWidth = width - borderWidth * 2;
  const screenHeight = height - borderWidth * 2;

  // Draw black screen background
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(screenX, screenY, screenWidth, screenHeight, innerRadius);
  ctx.fill();

  // Draw screenshot
  if (screenshot) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(screenX, screenY, screenWidth, screenHeight, innerRadius);
    ctx.clip();

    const imgAspect = screenshot.width / screenshot.height;
    const screenAspect = screenWidth / screenHeight;
    let drawW, drawH, drawX, drawY;

    if (imgAspect > screenAspect) {
      drawH = screenHeight;
      drawW = drawH * imgAspect;
      drawX = screenX - (drawW - screenWidth) / 2;
      drawY = screenY;
    } else {
      drawW = screenWidth;
      drawH = drawW / imgAspect;
      drawX = screenX;
      drawY = screenY - (drawH - screenHeight) / 2;
    }
    ctx.drawImage(screenshot, drawX, drawY, drawW, drawH);
    ctx.restore();
  }

  // Draw Dynamic Island
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(
    x + (width - dynamicIslandWidth) / 2,
    dynamicIslandY,
    dynamicIslandWidth,
    dynamicIslandHeight,
    dynamicIslandHeight / 2
  );
  ctx.fill();
};

// Draw outline style side buttons
const drawOutlineSideButtons = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  frameColor: string,
  lineWidth: number
): void => {
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = lineWidth;

  const buttonWidth = width * 0.012;

  // Left side - Action button (small, top)
  const actionBtnHeight = height * 0.035;
  const actionBtnY = y + height * 0.15;
  ctx.beginPath();
  ctx.roundRect(x - buttonWidth - lineWidth / 2, actionBtnY, buttonWidth, actionBtnHeight, 2);
  ctx.stroke();

  // Left side - Volume Up
  const volUpHeight = height * 0.065;
  const volUpY = y + height * 0.22;
  ctx.beginPath();
  ctx.roundRect(x - buttonWidth - lineWidth / 2, volUpY, buttonWidth, volUpHeight, 2);
  ctx.stroke();

  // Left side - Volume Down
  const volDownY = volUpY + volUpHeight + height * 0.015;
  ctx.beginPath();
  ctx.roundRect(x - buttonWidth - lineWidth / 2, volDownY, buttonWidth, volUpHeight, 2);
  ctx.stroke();

  // Right side - Power button
  const powerHeight = height * 0.08;
  const powerY = y + height * 0.24;
  ctx.beginPath();
  ctx.roundRect(x + width + lineWidth / 2, powerY, buttonWidth, powerHeight, 2);
  ctx.stroke();
};

// Draw outline style mockup (just an outline frame)
const drawOutlineMockup = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  frameColor: string,
  screenshot: HTMLImageElement | null
): void => {
  const borderWidth = width * 0.025;
  const cornerRadius = width * 0.11;
  const innerRadius = cornerRadius - borderWidth / 2;

  // Dynamic Island
  const dynamicIslandWidth = width * 0.28;
  const dynamicIslandHeight = height * 0.018;
  const dynamicIslandY = y + borderWidth + height * 0.012;

  // Screen area
  const screenX = x + borderWidth;
  const screenY = y + borderWidth;
  const screenWidth = width - borderWidth * 2;
  const screenHeight = height - borderWidth * 2;

  // Draw black screen background first
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(screenX, screenY, screenWidth, screenHeight, innerRadius);
  ctx.fill();

  // Draw screenshot
  if (screenshot) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(screenX, screenY, screenWidth, screenHeight, innerRadius);
    ctx.clip();

    const imgAspect = screenshot.width / screenshot.height;
    const screenAspect = screenWidth / screenHeight;
    let drawW, drawH, drawX, drawY;

    if (imgAspect > screenAspect) {
      drawH = screenHeight;
      drawW = drawH * imgAspect;
      drawX = screenX - (drawW - screenWidth) / 2;
      drawY = screenY;
    } else {
      drawW = screenWidth;
      drawH = drawW / imgAspect;
      drawX = screenX;
      drawY = screenY - (drawH - screenHeight) / 2;
    }
    ctx.drawImage(screenshot, drawX, drawY, drawW, drawH);
    ctx.restore();
  }

  // Draw outline frame (on top of screenshot)
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = borderWidth;
  ctx.beginPath();
  ctx.roundRect(x + borderWidth / 2, y + borderWidth / 2, width - borderWidth, height - borderWidth, cornerRadius);
  ctx.stroke();

  // Draw side buttons (outline style)
  drawOutlineSideButtons(ctx, x, y, width, height, frameColor, borderWidth * 0.6);

  // Draw Dynamic Island
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(
    x + (width - dynamicIslandWidth) / 2,
    dynamicIslandY,
    dynamicIslandWidth,
    dynamicIslandHeight,
    dynamicIslandHeight / 2
  );
  ctx.fill();
};

const drawMockupWithScreenshot = async (
  ctx: CanvasRenderingContext2D,
  _mockupX: number,
  _mockupY: number,
  _mockupWidth: number,
  mockupHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  screenshot: string | null,
  style: StyleConfig,
  mockupContinuationOverride?: MockupContinuation,
  mockupSettings?: ScreenshotMockupSettings
): Promise<void> => {
  const mockupStyle = style.mockupStyle || 'realistic';
  const mockupImg = mockupStyle === 'realistic' ? await loadMockupImage() : null;
  const visibilityRatio = getVisibilityRatio(style.mockupVisibility);
  // Per-screenshot settings override global style settings
  const rotation = mockupSettings?.rotation ?? style.mockupRotation ?? 0;
  const continuation = mockupContinuationOverride ?? style.mockupContinuation ?? 'none';

  // Phone size is FIXED - never changes with visibility
  const fullPhoneHeight = mockupHeight;
  const phoneAspect = MOCKUP_CONFIG.phoneWidth / MOCKUP_CONFIG.phoneHeight;
  const fullPhoneWidth = fullPhoneHeight * phoneAspect;

  // Calculate scale factor
  const scale = fullPhoneWidth / MOCKUP_CONFIG.phoneWidth;

  // Calculate the full mockup image dimensions at this scale
  const scaledImgWidth = MOCKUP_CONFIG.imageWidth * scale;
  const scaledImgHeight = MOCKUP_CONFIG.imageHeight * scale;

  // Center phone horizontally on canvas
  let adjustedMockupX = (canvasWidth - fullPhoneWidth) / 2;

  // How much of phone is visible (based on visibility setting)
  const visiblePhoneHeight = fullPhoneHeight * visibilityRatio;

  // Calculate phone Y position based on alignment
  // hiddenHeight = part of phone that extends beyond canvas
  const hiddenHeight = fullPhoneHeight - visiblePhoneHeight;
  let adjustedMockupY: number;

  // Calculate text area height for positioning (same as ScreensFlowEditor)
  const textAreaForAlignment = style.textPosition === 'top' ? canvasHeight * 0.38 : 0;

  switch (style.mockupAlignment) {
    case 'top':
      // iPhone at TOP - top part extends ABOVE canvas (cropped from top)
      // When text is at top, offset mockup down to leave room for text
      adjustedMockupY = textAreaForAlignment - hiddenHeight;
      break;
    case 'bottom':
      // iPhone at BOTTOM - bottom part extends BELOW canvas (cropped from bottom)
      // Top part of iPhone visible, positioned so visible part is at bottom
      adjustedMockupY = canvasHeight - visiblePhoneHeight - 40;
      break;
    case 'center':
    default:
      // iPhone centered in canvas
      adjustedMockupY = (canvasHeight - fullPhoneHeight) / 2;
      break;
  }

  // Apply continuation offset for split mockups
  if (continuation !== 'none') {
    const splitOffset = canvasWidth * 0.4; // How much to offset for the split
    switch (continuation) {
      case 'left-start':
        // Mockup starts on this screen, exits to the right
        adjustedMockupX += splitOffset;
        break;
      case 'left-end':
        // Mockup continues from previous screen, entering from left
        adjustedMockupX -= splitOffset;
        break;
      case 'right-start':
        // Mockup starts on this screen, exits to the left
        adjustedMockupX -= splitOffset;
        break;
      case 'right-end':
        // Mockup continues from previous screen, entering from right
        adjustedMockupX += splitOffset;
        break;
    }
  }

  // Apply custom offset from drag & drop
  // Use per-screenshot mockupSettings (percentage-based) if available, otherwise fallback to style.mockupOffset (pixel-based)
  if (mockupSettings) {
    // Convert percentage to pixels: offsetX/offsetY are -100 to +100, representing % of canvas width/height
    adjustedMockupX += (mockupSettings.offsetX / 100) * canvasWidth;
    adjustedMockupY += (mockupSettings.offsetY / 100) * canvasHeight;
  } else {
    adjustedMockupX += style.mockupOffset?.x || 0;
    adjustedMockupY += style.mockupOffset?.y || 0;
  }

  ctx.save();

  // Apply rotation around the center of the mockup
  if (rotation !== 0) {
    const centerX = adjustedMockupX + fullPhoneWidth / 2;
    const centerY = adjustedMockupY + fullPhoneHeight / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }

  // Calculate offset to position the phone correctly
  const imgX = adjustedMockupX - (MOCKUP_CONFIG.phoneX * scale);
  const imgY = adjustedMockupY - (MOCKUP_CONFIG.phoneY * scale);

  // Calculate screen position and size
  const screenX = adjustedMockupX + ((MOCKUP_CONFIG.screenX - MOCKUP_CONFIG.phoneX) * scale);
  const screenY = adjustedMockupY + ((MOCKUP_CONFIG.screenY - MOCKUP_CONFIG.phoneY) * scale);
  const screenWidth = MOCKUP_CONFIG.screenWidth * scale;
  const screenHeight = MOCKUP_CONFIG.screenHeight * scale;
  const cornerRadius = MOCKUP_CONFIG.screenCornerRadius * scale;

  // Dynamic Island coordinates scaled
  const diX = adjustedMockupX + ((MOCKUP_CONFIG.dynamicIslandX - MOCKUP_CONFIG.phoneX) * scale);
  const diY = adjustedMockupY + ((MOCKUP_CONFIG.dynamicIslandY - MOCKUP_CONFIG.phoneY) * scale);
  const diWidth = MOCKUP_CONFIG.dynamicIslandWidth * scale;
  const diHeight = MOCKUP_CONFIG.dynamicIslandHeight * scale;
  const diRadius = MOCKUP_CONFIG.dynamicIslandRadius * scale;

  const frameColor = getFrameColor(style.mockupColor);

  // Load screenshot image if available
  const screenshotImg = screenshot ? await loadImage(screenshot) : null;

  // Choose drawing method based on mockup style
  if (mockupStyle !== 'realistic') {
    // Use programmatic mockup drawing for non-realistic styles
    switch (mockupStyle) {
      case 'flat':
        drawFlatMockup(ctx, adjustedMockupX, adjustedMockupY, fullPhoneWidth, fullPhoneHeight, frameColor, screenshotImg);
        break;
      case 'minimal':
        drawMinimalMockup(ctx, adjustedMockupX, adjustedMockupY, fullPhoneWidth, fullPhoneHeight, frameColor, screenshotImg);
        break;
      case 'outline':
        drawOutlineMockup(ctx, adjustedMockupX, adjustedMockupY, fullPhoneWidth, fullPhoneHeight, frameColor, screenshotImg);
        break;
    }
  } else {
    // Realistic style - use PNG mockup image
    // 1. Draw screenshot clipped to screen area
    if (screenshotImg) {
      ctx.save();

      // Clip to screen area with rounded corners
      ctx.beginPath();
      ctx.roundRect(screenX, screenY, screenWidth, screenHeight, cornerRadius);
      ctx.clip();

      // Calculate scaling to cover the screen area
      const imgAspect = screenshotImg.width / screenshotImg.height;
      const screenAspect = screenWidth / screenHeight;

      let drawWidth: number;
      let drawHeight: number;
      let drawX: number;
      let drawY: number;

      if (imgAspect > screenAspect) {
        drawHeight = screenHeight;
        drawWidth = drawHeight * imgAspect;
        drawX = screenX - (drawWidth - screenWidth) / 2;
        drawY = screenY;
      } else {
        drawWidth = screenWidth;
        drawHeight = drawWidth / imgAspect;
        drawX = screenX;
        drawY = screenY - (drawHeight - screenHeight) / 2;
      }

      ctx.drawImage(screenshotImg, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();

      // 2. Draw Dynamic Island on top of screenshot (cutout effect)
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.roundRect(diX, diY, diWidth, diHeight, diRadius);
      ctx.fill();
    } else {
      // Draw black screen if no screenshot
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.roundRect(screenX, screenY, screenWidth, screenHeight, cornerRadius);
      ctx.fill();
    }

    // 3. Draw mockup frame BEHIND screenshot (destination-over)
    if (mockupImg) {
      ctx.globalCompositeOperation = 'destination-over';
      ctx.drawImage(mockupImg, imgX, imgY, scaledImgWidth, scaledImgHeight);

      // 4. Draw side buttons BEHIND mockup frame
      drawSideButtons(ctx, adjustedMockupX, adjustedMockupY, scale, frameColor);

      // 5. Draw shadow BEHIND everything
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 60 * scale;
      ctx.shadowOffsetX = 15 * scale;
      ctx.shadowOffsetY = 25 * scale;
      ctx.fillStyle = frameColor;
      ctx.beginPath();
      ctx.roundRect(adjustedMockupX, adjustedMockupY, fullPhoneWidth, fullPhoneHeight, cornerRadius);
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over'; // Reset
    }
  }

  // Restore context
  ctx.restore();
};

export const generateScreenshotImage = async (
  options: GenerateImageOptions
): Promise<Blob> => {
  const { screenshot, text, style: baseStyle, deviceSize, styleOverride, mockupScreenshot, mockupContinuation, mockupSettings } = options;
  const style = getEffectiveStyle(baseStyle, styleOverride);
  // Use mockupScreenshot if provided (for continuation), otherwise use screenshot
  // Use nullish coalescing to properly fall back when mockupScreenshot is null
  const screenshotForMockup = mockupScreenshot ?? screenshot;
  const dimensions = DEVICE_SIZES[deviceSize];

  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const ctx = canvas.getContext('2d')!;

  // Draw gradient/solid background
  drawGradientBackground(ctx, canvas.width, canvas.height, style);

  // Draw background pattern if present
  if (style.pattern) {
    drawBackgroundPattern(ctx, canvas.width, canvas.height, style.pattern);
  }

  // Calculate mockup dimensions - per-screenshot scale takes precedence over global
  const mockupScale = mockupSettings?.scale ?? style.mockupScale ?? 1.0;
  const rotation = mockupSettings?.rotation ?? style.mockupRotation ?? 0;
  const visibilityRatio = getVisibilityRatio(style.mockupVisibility);

  // Use CONSISTENT text area height for mockup size calculation (35%)
  // This ensures mockups are the same size regardless of text position
  const textAreaHeightForMockup = canvas.height * 0.35;

  const availableHeight = canvas.height - textAreaHeightForMockup - 40;
  const baseMockupHeight = Math.min(availableHeight, canvas.height * 0.75);
  const clampedScale = Math.max(0.3, Math.min(2.0, mockupScale));
  const mockupHeight = baseMockupHeight * clampedScale;
  const phoneAspect = MOCKUP_CONFIG.phoneWidth / MOCKUP_CONFIG.phoneHeight;
  const mockupWidth = mockupHeight * phoneAspect;

  // Calculate mockup center for text positioning
  const visiblePhoneHeight = mockupHeight * visibilityRatio;
  const hiddenHeight = mockupHeight - visiblePhoneHeight;

  let mockupCenterX = canvas.width / 2;
  let mockupCenterY: number;

  switch (style.mockupAlignment) {
    case 'top':
      // When text is at top, offset mockup down to leave room for text
      const textAreaOffsetTop = style.textPosition === 'top' ? textAreaHeightForMockup : 0;
      mockupCenterY = textAreaOffsetTop - hiddenHeight + mockupHeight / 2;
      break;
    case 'bottom':
      mockupCenterY = canvas.height - visiblePhoneHeight - 40 + mockupHeight / 2;
      break;
    case 'center':
    default:
      mockupCenterY = (canvas.height - mockupHeight) / 2 + mockupHeight / 2;
      break;
  }

  // Apply mockup offsets for text area calculation
  if (mockupSettings) {
    mockupCenterX += (mockupSettings.offsetX / 100) * canvas.width;
    mockupCenterY += (mockupSettings.offsetY / 100) * canvas.height;
  } else {
    mockupCenterX += style.mockupOffset?.x || 0;
    mockupCenterY += style.mockupOffset?.y || 0;
  }

  const mockupX = (canvas.width - mockupWidth) / 2;
  const mockupY = style.textPosition === 'top'
    ? textAreaHeightForMockup + 20
    : 40;

  // Only show mockup if there's a screenshot AND showMockup is enabled
  const hasMockup = !!(style.showMockup && screenshotForMockup);

  if (hasMockup) {
    await drawMockupWithScreenshot(ctx, mockupX, mockupY, mockupWidth, mockupHeight, canvas.width, canvas.height, screenshotForMockup, style, mockupContinuation, mockupSettings);
  } else if (screenshotForMockup && !style.showMockup) {
    // Draw screenshot without mockup (legacy mode)
    const img = await loadImage(screenshotForMockup);
    const imgAspect = img.width / img.height;

    let drawWidth = mockupWidth;
    let drawHeight = drawWidth / imgAspect;

    if (drawHeight > mockupHeight) {
      drawHeight = mockupHeight;
      drawWidth = drawHeight * imgAspect;
    }

    const imgX = (canvas.width - drawWidth) / 2;
    const imgY = mockupY + (mockupHeight - drawHeight) / 2;

    const cornerRadius = 40;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(imgX, imgY, drawWidth, drawHeight, cornerRadius);
    ctx.clip();
    ctx.drawImage(img, imgX, imgY, drawWidth, drawHeight);
    ctx.restore();
  }

  // Draw text with auto-sizing to fill available space
  if (text) {
    const sidePadding = canvas.width * 0.10; // 10% padding from each side
    const maxTextWidth = canvas.width - sidePadding * 2;

    // Calculate available text area based on mockup bounds
    let textArea: TextAreaBounds;

    if (hasMockup) {
      textArea = calculateTextArea(
        canvas.width,
        canvas.height,
        mockupCenterX,
        mockupCenterY,
        mockupWidth,
        mockupHeight,
        rotation,
        style.textPosition,
        style.paddingTop,
        style.paddingBottom,
        sidePadding
      );
    } else {
      const availHeight = canvas.height * 0.4;
      textArea = {
        x: sidePadding,
        y: style.textPosition === 'top' ? style.paddingTop : canvas.height - style.paddingBottom - availHeight,
        width: maxTextWidth,
        height: availHeight
      };
    }

    // Calculate adaptive font size to fill available area
    const adaptiveFontSize = calculateAdaptiveFontSize(
      ctx,
      text,
      style.fontSize,
      textArea.width,
      textArea.height,
      style.fontFamily
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

    // Apply custom offset - use per-screenshot offset if available, otherwise global style
    const textOffsetXValue = mockupSettings?.textOffsetX ?? style.textOffset?.x ?? 0;
    const textOffsetYValue = mockupSettings?.textOffsetY ?? style.textOffset?.y ?? 0;
    const textOffsetX = (textOffsetXValue / 100) * canvas.width;
    const textOffsetY = (textOffsetYValue / 100) * canvas.height;
    const finalX = textArea.x + textOffsetX;
    const finalY = textY + textOffsetY;

    drawFormattedText(ctx, lines, finalX, finalY, lineHeight, adaptiveStyle, textArea.width);
  }

  // Draw decorations (stars, laurels, etc.)
  await drawDecorations(ctx, options.decorations);

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
  const { screenshot, text, style: baseStyle, deviceSize, styleOverride, mockupScreenshot, mockupContinuation, mockupSettings } = options;
  const style = getEffectiveStyle(baseStyle, styleOverride);
  const dimensions = DEVICE_SIZES[deviceSize];
  // Use nullish coalescing to properly fall back when mockupScreenshot is null
  const screenshotForMockup = mockupScreenshot ?? screenshot;

  // Scale down for preview
  const scale = Math.min(400 / dimensions.width, 600 / dimensions.height);
  canvas.width = dimensions.width * scale;
  canvas.height = dimensions.height * scale;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.scale(scale, scale);

  drawGradientBackground(ctx, dimensions.width, dimensions.height, style);

  if (style.pattern) {
    drawBackgroundPattern(ctx, dimensions.width, dimensions.height, style.pattern);
  }

  // Calculate mockup dimensions - per-screenshot scale takes precedence over global
  const mockupScalePreview = mockupSettings?.scale ?? style.mockupScale ?? 1.0;
  const rotation = mockupSettings?.rotation ?? style.mockupRotation ?? 0;
  const visibilityRatio = getVisibilityRatio(style.mockupVisibility);

  // Use CONSISTENT text area height for mockup size calculation (35%)
  // This ensures mockups are the same size regardless of text position
  const textAreaHeightForMockupPreview = dimensions.height * 0.35;

  const availableHeight = dimensions.height - textAreaHeightForMockupPreview - 40;
  const baseMockupHeight = Math.min(availableHeight, dimensions.height * 0.75);
  const clampedScalePreview = Math.max(0.3, Math.min(2.0, mockupScalePreview));
  const mockupHeight = baseMockupHeight * clampedScalePreview;
  const phoneAspect = MOCKUP_CONFIG.phoneWidth / MOCKUP_CONFIG.phoneHeight;
  const mockupWidth = mockupHeight * phoneAspect;

  // Calculate mockup center for text positioning
  const visiblePhoneHeight = mockupHeight * visibilityRatio;
  const hiddenHeight = mockupHeight - visiblePhoneHeight;

  let mockupCenterX = dimensions.width / 2;
  let mockupCenterY: number;

  switch (style.mockupAlignment) {
    case 'top':
      // When text is at top, offset mockup down to leave room for text
      const textOffsetForMockup = style.textPosition === 'top' ? textAreaHeightForMockupPreview : 0;
      mockupCenterY = textOffsetForMockup - hiddenHeight + mockupHeight / 2;
      break;
    case 'bottom':
      mockupCenterY = dimensions.height - visiblePhoneHeight - 40 + mockupHeight / 2;
      break;
    case 'center':
    default:
      mockupCenterY = (dimensions.height - mockupHeight) / 2 + mockupHeight / 2;
      break;
  }

  if (mockupSettings) {
    mockupCenterX += (mockupSettings.offsetX / 100) * dimensions.width;
    mockupCenterY += (mockupSettings.offsetY / 100) * dimensions.height;
  } else {
    mockupCenterX += style.mockupOffset?.x || 0;
    mockupCenterY += style.mockupOffset?.y || 0;
  }

  const mockupX = (dimensions.width - mockupWidth) / 2;
  const mockupY = style.textPosition === 'top'
    ? textAreaHeightForMockupPreview + 20
    : 40;

  const hasMockup = !!(style.showMockup && screenshotForMockup);

  if (hasMockup) {
    try {
      await drawMockupWithScreenshot(ctx, mockupX, mockupY, mockupWidth, mockupHeight, dimensions.width, dimensions.height, screenshotForMockup, style, mockupContinuation, mockupSettings);
    } catch (e) {
      ctx.fillStyle = '#1d1d1f';
      ctx.beginPath();
      ctx.roundRect(mockupX, mockupY, mockupWidth, mockupHeight, 60);
      ctx.fill();
    }
  } else if (screenshotForMockup && !style.showMockup) {
    try {
      const img = await loadImage(screenshotForMockup);
      const imgAspect = img.width / img.height;

      let drawWidth = mockupWidth;
      let drawHeight = drawWidth / imgAspect;

      if (drawHeight > mockupHeight) {
        drawHeight = mockupHeight;
        drawWidth = drawHeight * imgAspect;
      }

      const imgX = (dimensions.width - drawWidth) / 2;
      const imgY = mockupY + (mockupHeight - drawHeight) / 2;

      const cornerRadius = 40;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, drawWidth, drawHeight, cornerRadius);
      ctx.clip();
      ctx.drawImage(img, imgX, imgY, drawWidth, drawHeight);
      ctx.restore();
    } catch (e) {
      // Screenshot not loaded
    }
  }

  // Draw text with auto-sizing
  if (text) {
    const sidePadding = dimensions.width * 0.075;
    const maxTextWidth = dimensions.width - sidePadding * 2;

    let textArea: TextAreaBounds;

    if (hasMockup) {
      textArea = calculateTextArea(
        dimensions.width,
        dimensions.height,
        mockupCenterX,
        mockupCenterY,
        mockupWidth,
        mockupHeight,
        rotation,
        style.textPosition,
        style.paddingTop,
        style.paddingBottom,
        sidePadding
      );
    } else {
      const availHeight = dimensions.height * 0.4;
      textArea = {
        x: sidePadding,
        y: style.textPosition === 'top' ? style.paddingTop : dimensions.height - style.paddingBottom - availHeight,
        width: maxTextWidth,
        height: availHeight
      };
    }

    const adaptiveFontSize = calculateAdaptiveFontSize(
      ctx,
      text,
      style.fontSize,
      textArea.width,
      textArea.height,
      style.fontFamily
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

    // Apply custom offset - use per-screenshot offset if available, otherwise global style
    const textOffsetXValue = mockupSettings?.textOffsetX ?? style.textOffset?.x ?? 0;
    const textOffsetYValue = mockupSettings?.textOffsetY ?? style.textOffset?.y ?? 0;
    const textOffsetX = (textOffsetXValue / 100) * dimensions.width;
    const textOffsetY = (textOffsetYValue / 100) * dimensions.height;
    const finalX = textArea.x + textOffsetX;
    const finalY = textY + textOffsetY;

    drawFormattedText(ctx, lines, finalX, finalY, lineHeight, adaptiveStyle, textArea.width);
  }

  await drawDecorations(ctx, options.decorations);
};
