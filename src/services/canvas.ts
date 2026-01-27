import { StyleConfig, DeviceSize, DEVICE_SIZES, Decoration, StarRatingDecoration, LaurelDecoration, ScreenshotStyleOverride } from '../types';

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
}

// Merge global style with per-screenshot overrides
const getEffectiveStyle = (style: StyleConfig, override?: ScreenshotStyleOverride): StyleConfig => {
  if (!override) return style;
  return {
    ...style,
    textColor: override.textColor ?? style.textColor,
    backgroundColor: override.backgroundColor ?? style.backgroundColor,
    gradient: override.gradient ?? style.gradient
  };
};

// Mockup image cache
let mockupImageCache: HTMLImageElement | null = null;

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
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
        // Draw highlight background
        const padding = style.highlightPadding || 12;
        const radius = style.highlightBorderRadius || 8;

        ctx.save();
        ctx.fillStyle = style.highlightColor || '#FFE135';
        ctx.beginPath();
        ctx.roundRect(
          x - padding / 2,
          y - style.fontSize * 0.85,
          segmentWidth + padding,
          style.fontSize * 1.15,
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

// Calculate adaptive font size to fit text within bounds
const calculateAdaptiveFontSize = (
  ctx: CanvasRenderingContext2D,
  text: string,
  baseFontSize: number,
  maxWidth: number,
  maxHeight: number,
  fontFamily: string
): number => {
  const minFontSize = Math.max(30, baseFontSize * 0.4); // Don't go below 40% of original or 30px
  let fontSize = baseFontSize;

  while (fontSize >= minFontSize) {
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    const lines = wrapFormattedText(ctx, text, maxWidth);
    const lineHeight = fontSize * 1.4;
    const totalHeight = lines.length * lineHeight;

    // Check if text fits
    if (totalHeight <= maxHeight) {
      // Also check that no single line is too wide (for very long words)
      let allLinesFit = true;
      for (const line of lines) {
        const lineWidth = measureLineWidth(ctx, line);
        if (lineWidth > maxWidth * 1.05) { // Allow 5% overflow
          allLinesFit = false;
          break;
        }
      }
      if (allLinesFit) {
        return fontSize;
      }
    }

    // Reduce font size and try again
    fontSize -= 4;
  }

  return minFontSize;
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

// Calculate element bounds for hit testing (in original canvas coordinates)
export const getElementBounds = (style: StyleConfig, deviceSize: DeviceSize): ElementBounds => {
  const dimensions = DEVICE_SIZES[deviceSize];
  const visibilityRatio = getVisibilityRatio(style.mockupVisibility);
  const mockupScale = style.mockupScale ?? 1.0;

  // Calculate mockup dimensions
  const textAreaHeight = style.textPosition === 'top'
    ? style.paddingTop + style.fontSize * 2.5
    : style.paddingBottom + style.fontSize * 2.5;

  const availableHeight = dimensions.height - textAreaHeight - 80;
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
      mockupY = -hiddenHeight;
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

const drawMockupWithScreenshot = async (
  ctx: CanvasRenderingContext2D,
  _mockupX: number,
  _mockupY: number,
  _mockupWidth: number,
  mockupHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  screenshot: string | null,
  style: StyleConfig
): Promise<void> => {
  const mockupImg = await loadMockupImage();
  const visibilityRatio = getVisibilityRatio(style.mockupVisibility);

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

  switch (style.mockupAlignment) {
    case 'top':
      // iPhone at TOP - top part extends ABOVE canvas (cropped from top)
      // Bottom part of iPhone visible, positioned at top of canvas
      adjustedMockupY = -hiddenHeight;
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

  // Apply custom offset from drag & drop
  adjustedMockupX += style.mockupOffset?.x || 0;
  adjustedMockupY += style.mockupOffset?.y || 0;

  ctx.save();

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

  // 1. Draw screenshot clipped to screen area
  if (screenshot) {
    const screenshotImg = await loadImage(screenshot);

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

  // Restore context
  ctx.restore();
};

export const generateScreenshotImage = async (
  options: GenerateImageOptions
): Promise<Blob> => {
  const { screenshot, text, style: baseStyle, deviceSize, styleOverride } = options;
  const style = getEffectiveStyle(baseStyle, styleOverride);
  const dimensions = DEVICE_SIZES[deviceSize];

  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const ctx = canvas.getContext('2d')!;

  // Draw gradient/solid background
  drawGradientBackground(ctx, canvas.width, canvas.height, style);

  // Calculate mockup dimensions
  const mockupScale = style.mockupScale ?? 1.0;
  const textAreaHeight = style.textPosition === 'top'
    ? style.paddingTop + style.fontSize * 2.5
    : style.paddingBottom + style.fontSize * 2.5;

  const availableHeight = canvas.height - textAreaHeight - 80;
  const baseMockupHeight = Math.min(availableHeight, canvas.height * 0.75);
  // Apply mockupScale but clamp to reasonable values
  const clampedScale = Math.max(0.3, Math.min(2.0, mockupScale));
  const mockupHeight = baseMockupHeight * clampedScale;
  // Maintain phone aspect ratio
  const phoneAspect = MOCKUP_CONFIG.phoneWidth / MOCKUP_CONFIG.phoneHeight;
  const mockupWidth = mockupHeight * phoneAspect;

  const mockupX = (canvas.width - mockupWidth) / 2;
  const mockupY = style.textPosition === 'top'
    ? textAreaHeight + 40
    : 40;

  // Only show mockup if there's a screenshot AND showMockup is enabled
  if (style.showMockup && screenshot) {
    await drawMockupWithScreenshot(ctx, mockupX, mockupY, mockupWidth, mockupHeight, canvas.width, canvas.height, screenshot, style);
  } else if (screenshot && !style.showMockup) {
    // Draw screenshot without mockup (legacy mode)
    const img = await loadImage(screenshot);
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

  // Draw text with formatting support and adaptive sizing
  if (text) {
    const maxTextWidth = canvas.width * 0.85;

    // Calculate max available height for text
    const maxTextHeight = style.textPosition === 'top'
      ? textAreaHeight - style.paddingTop - 40
      : textAreaHeight - style.paddingBottom - 40;

    // Calculate adaptive font size
    const adaptiveFontSize = calculateAdaptiveFontSize(
      ctx,
      text,
      style.fontSize,
      maxTextWidth,
      maxTextHeight,
      style.fontFamily
    );

    // Create modified style with adaptive font size
    const adaptiveStyle = { ...style, fontSize: adaptiveFontSize };

    ctx.fillStyle = style.textColor;
    ctx.font = `bold ${adaptiveFontSize}px ${style.fontFamily}`;
    ctx.textAlign = 'left'; // We handle alignment manually for highlights

    const lines = wrapFormattedText(ctx, text, maxTextWidth);
    const lineHeight = adaptiveFontSize * 1.4;

    // Calculate text area left edge
    const textAreaX = (canvas.width - maxTextWidth) / 2;

    let textY: number;
    if (style.textPosition === 'top') {
      textY = style.paddingTop + adaptiveFontSize;
    } else {
      textY = canvas.height - style.paddingBottom - (lines.length - 1) * lineHeight;
    }

    // Apply custom offset from drag & drop
    const finalX = textAreaX + (style.textOffset?.x || 0);
    const finalY = textY + (style.textOffset?.y || 0);

    drawFormattedText(ctx, lines, finalX, finalY, lineHeight, adaptiveStyle, maxTextWidth);
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
  const { screenshot, text, style: baseStyle, deviceSize, styleOverride } = options;
  const style = getEffectiveStyle(baseStyle, styleOverride);
  const dimensions = DEVICE_SIZES[deviceSize];

  // Scale down for preview
  const scale = Math.min(400 / dimensions.width, 600 / dimensions.height);
  canvas.width = dimensions.width * scale;
  canvas.height = dimensions.height * scale;
  const ctx = canvas.getContext('2d')!;

  // Clear canvas completely before drawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.scale(scale, scale);

  // Draw gradient/solid background
  drawGradientBackground(ctx, dimensions.width, dimensions.height, style);

  // Calculate mockup dimensions
  const mockupScalePreview = style.mockupScale ?? 1.0;
  const textAreaHeight = style.textPosition === 'top'
    ? style.paddingTop + style.fontSize * 2.5
    : style.paddingBottom + style.fontSize * 2.5;

  const availableHeight = dimensions.height - textAreaHeight - 80;
  const baseMockupHeightPreview = Math.min(availableHeight, dimensions.height * 0.75);
  // Apply mockupScale but clamp to reasonable values
  const clampedScalePreview = Math.max(0.3, Math.min(2.0, mockupScalePreview));
  const mockupHeight = baseMockupHeightPreview * clampedScalePreview;
  const phoneAspect = MOCKUP_CONFIG.phoneWidth / MOCKUP_CONFIG.phoneHeight;
  const mockupWidth = mockupHeight * phoneAspect;

  const mockupX = (dimensions.width - mockupWidth) / 2;
  const mockupY = style.textPosition === 'top'
    ? textAreaHeight + 40
    : 40;

  // Only show mockup if there's a screenshot AND showMockup is enabled
  if (style.showMockup && screenshot) {
    try {
      await drawMockupWithScreenshot(ctx, mockupX, mockupY, mockupWidth, mockupHeight, dimensions.width, dimensions.height, screenshot, style);
    } catch (e) {
      // Mockup not loaded yet, draw fallback
      ctx.fillStyle = '#1d1d1f';
      ctx.beginPath();
      ctx.roundRect(mockupX, mockupY, mockupWidth, mockupHeight, 60);
      ctx.fill();
    }
  } else if (screenshot && !style.showMockup) {
    try {
      const img = await loadImage(screenshot);
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

  // Draw text with formatting support and adaptive sizing
  if (text) {
    const maxTextWidth = dimensions.width * 0.85;

    // Calculate max available height for text
    const maxTextHeight = style.textPosition === 'top'
      ? textAreaHeight - style.paddingTop - 40
      : textAreaHeight - style.paddingBottom - 40;

    // Calculate adaptive font size
    const adaptiveFontSize = calculateAdaptiveFontSize(
      ctx,
      text,
      style.fontSize,
      maxTextWidth,
      maxTextHeight,
      style.fontFamily
    );

    // Create modified style with adaptive font size
    const adaptiveStyle = { ...style, fontSize: adaptiveFontSize };

    ctx.fillStyle = style.textColor;
    ctx.font = `bold ${adaptiveFontSize}px ${style.fontFamily}`;
    ctx.textAlign = 'left'; // We handle alignment manually for highlights

    const lines = wrapFormattedText(ctx, text, maxTextWidth);
    const lineHeight = adaptiveFontSize * 1.4;

    // Calculate text area left edge
    const textAreaX = (dimensions.width - maxTextWidth) / 2;

    let textY: number;
    if (style.textPosition === 'top') {
      textY = style.paddingTop + adaptiveFontSize;
    } else {
      textY = dimensions.height - style.paddingBottom - (lines.length - 1) * lineHeight;
    }

    // Apply custom offset from drag & drop
    const finalX = textAreaX + (style.textOffset?.x || 0);
    const finalY = textY + (style.textOffset?.y || 0);

    drawFormattedText(ctx, lines, finalX, finalY, lineHeight, adaptiveStyle, maxTextWidth);
  }

  // Draw decorations (stars, laurels, etc.)
  await drawDecorations(ctx, options.decorations);
};
