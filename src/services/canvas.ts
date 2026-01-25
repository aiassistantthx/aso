import { StyleConfig, DeviceSize, DEVICE_SIZES } from '../types';

export interface GenerateImageOptions {
  screenshot: string | null;
  text: string;
  style: StyleConfig;
  deviceSize: DeviceSize;
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
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

const getMockupColors = (color: 'black' | 'white' | 'natural'): { frame: string; bezel: string; accent: string } => {
  switch (color) {
    case 'white':
      return { frame: '#F5F5F7', bezel: '#E8E8ED', accent: '#D2D2D7' };
    case 'natural':
      return { frame: '#E3D5C8', bezel: '#D4C4B5', accent: '#C5B5A6' };
    case 'black':
    default:
      return { frame: '#1D1D1F', bezel: '#2D2D2F', accent: '#3D3D3F' };
  }
};

const drawIPhoneMockup = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  style: StyleConfig,
  deviceSize: DeviceSize
): { screenX: number; screenY: number; screenWidth: number; screenHeight: number } => {
  const dimensions = DEVICE_SIZES[deviceSize];
  const colors = getMockupColors(style.mockupColor);

  const frameWidth = 16;
  const cornerRadius = dimensions.cornerRadius * (width / dimensions.width);
  const dynamicIslandWidth = dimensions.dynamicIslandWidth * (width / dimensions.width);
  const dynamicIslandHeight = dimensions.dynamicIslandHeight * (width / dimensions.width);

  // Draw outer frame (phone body)
  ctx.save();

  // Phone body shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 20;

  // Draw phone frame
  ctx.fillStyle = colors.frame;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, cornerRadius);
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // Draw bezel highlight (top edge)
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x + 0.5, y + 0.5, width - 1, height - 1, cornerRadius);
  ctx.stroke();

  // Screen area
  const screenX = x + frameWidth;
  const screenY = y + frameWidth;
  const screenWidth = width - frameWidth * 2;
  const screenHeight = height - frameWidth * 2;
  const screenCornerRadius = cornerRadius - frameWidth / 2;

  // Draw screen background (black for empty state)
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(screenX, screenY, screenWidth, screenHeight, screenCornerRadius);
  ctx.fill();

  // Draw Dynamic Island
  const islandX = x + (width - dynamicIslandWidth) / 2;
  const islandY = y + frameWidth + 15;
  const islandRadius = dynamicIslandHeight / 2;

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(islandX, islandY, dynamicIslandWidth, dynamicIslandHeight, islandRadius);
  ctx.fill();

  ctx.restore();

  return { screenX, screenY, screenWidth, screenHeight };
};

const drawScreenshotInMockup = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  screenX: number,
  screenY: number,
  screenWidth: number,
  screenHeight: number,
  cornerRadius: number
): void => {
  ctx.save();

  // Clip to screen area
  ctx.beginPath();
  ctx.roundRect(screenX, screenY, screenWidth, screenHeight, cornerRadius);
  ctx.clip();

  // Calculate scaling to cover the screen area
  const imgAspect = img.width / img.height;
  const screenAspect = screenWidth / screenHeight;

  let drawWidth: number;
  let drawHeight: number;
  let drawX: number;
  let drawY: number;

  if (imgAspect > screenAspect) {
    // Image is wider - fit height, crop width
    drawHeight = screenHeight;
    drawWidth = drawHeight * imgAspect;
    drawX = screenX - (drawWidth - screenWidth) / 2;
    drawY = screenY;
  } else {
    // Image is taller - fit width, crop height
    drawWidth = screenWidth;
    drawHeight = drawWidth / imgAspect;
    drawX = screenX;
    drawY = screenY - (drawHeight - screenHeight) / 2;
  }

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
};

export const generateScreenshotImage = async (
  options: GenerateImageOptions
): Promise<Blob> => {
  const { screenshot, text, style, deviceSize } = options;
  const dimensions = DEVICE_SIZES[deviceSize];

  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const ctx = canvas.getContext('2d')!;

  // Draw gradient/solid background
  drawGradientBackground(ctx, canvas.width, canvas.height, style);

  // Calculate mockup dimensions
  const textAreaHeight = style.textPosition === 'top'
    ? style.paddingTop + style.fontSize * 2.5
    : style.paddingBottom + style.fontSize * 2.5;

  const availableHeight = canvas.height - textAreaHeight - 80;
  const mockupHeight = Math.min(availableHeight, canvas.height * 0.75);
  const mockupWidth = mockupHeight * (dimensions.width / dimensions.height) * 0.85;

  const mockupX = (canvas.width - mockupWidth) / 2;
  const mockupY = style.textPosition === 'top'
    ? textAreaHeight + 40
    : 40;

  if (style.showMockup) {
    // Draw iPhone mockup
    const { screenX, screenY, screenWidth, screenHeight } = drawIPhoneMockup(
      ctx,
      mockupX,
      mockupY,
      mockupWidth,
      mockupHeight,
      style,
      deviceSize
    );

    // Draw screenshot inside mockup if provided
    if (screenshot) {
      const img = await loadImage(screenshot);
      const cornerRadius = DEVICE_SIZES[deviceSize].cornerRadius * (mockupWidth / dimensions.width) - 8;
      drawScreenshotInMockup(ctx, img, screenX, screenY, screenWidth, screenHeight, cornerRadius);
    }
  } else if (screenshot) {
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

  // Draw text
  if (text) {
    ctx.fillStyle = style.textColor;
    ctx.font = `bold ${style.fontSize}px ${style.fontFamily}`;
    ctx.textAlign = style.textAlign;

    const maxTextWidth = canvas.width * 0.85;
    const lines = wrapText(ctx, text, maxTextWidth);
    const lineHeight = style.fontSize * 1.2;

    let textX: number;
    switch (style.textAlign) {
      case 'left':
        textX = (canvas.width - maxTextWidth) / 2;
        break;
      case 'right':
        textX = canvas.width - (canvas.width - maxTextWidth) / 2;
        break;
      default:
        textX = canvas.width / 2;
    }

    let textY: number;
    if (style.textPosition === 'top') {
      textY = style.paddingTop + style.fontSize;
    } else {
      textY = canvas.height - style.paddingBottom - (lines.length - 1) * lineHeight;
    }

    lines.forEach((line, index) => {
      ctx.fillText(line, textX, textY + index * lineHeight);
    });
  }

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
  const { screenshot, text, style, deviceSize } = options;
  const dimensions = DEVICE_SIZES[deviceSize];

  // Scale down for preview
  const scale = Math.min(400 / dimensions.width, 600 / dimensions.height);
  canvas.width = dimensions.width * scale;
  canvas.height = dimensions.height * scale;
  const ctx = canvas.getContext('2d')!;

  ctx.scale(scale, scale);

  // Draw gradient/solid background
  drawGradientBackground(ctx, dimensions.width, dimensions.height, style);

  // Calculate mockup dimensions
  const textAreaHeight = style.textPosition === 'top'
    ? style.paddingTop + style.fontSize * 2.5
    : style.paddingBottom + style.fontSize * 2.5;

  const availableHeight = dimensions.height - textAreaHeight - 80;
  const mockupHeight = Math.min(availableHeight, dimensions.height * 0.75);
  const mockupWidth = mockupHeight * (dimensions.width / dimensions.height) * 0.85;

  const mockupX = (dimensions.width - mockupWidth) / 2;
  const mockupY = style.textPosition === 'top'
    ? textAreaHeight + 40
    : 40;

  if (style.showMockup) {
    // Draw iPhone mockup
    const { screenX, screenY, screenWidth, screenHeight } = drawIPhoneMockup(
      ctx,
      mockupX,
      mockupY,
      mockupWidth,
      mockupHeight,
      style,
      deviceSize
    );

    // Draw screenshot inside mockup if provided
    if (screenshot) {
      try {
        const img = await loadImage(screenshot);
        const cornerRadius = DEVICE_SIZES[deviceSize].cornerRadius * (mockupWidth / dimensions.width) - 8;
        drawScreenshotInMockup(ctx, img, screenX, screenY, screenWidth, screenHeight, cornerRadius);
      } catch (e) {
        // Screenshot not loaded yet
      }
    }
  } else if (screenshot) {
    // Draw screenshot without mockup
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

  // Draw text
  if (text) {
    ctx.fillStyle = style.textColor;
    ctx.font = `bold ${style.fontSize}px ${style.fontFamily}`;
    ctx.textAlign = style.textAlign;

    const maxTextWidth = dimensions.width * 0.85;
    const lines = wrapText(ctx, text, maxTextWidth);
    const lineHeight = style.fontSize * 1.2;

    let textX: number;
    switch (style.textAlign) {
      case 'left':
        textX = (dimensions.width - maxTextWidth) / 2;
        break;
      case 'right':
        textX = dimensions.width - (dimensions.width - maxTextWidth) / 2;
        break;
      default:
        textX = dimensions.width / 2;
    }

    let textY: number;
    if (style.textPosition === 'top') {
      textY = style.paddingTop + style.fontSize;
    } else {
      textY = dimensions.height - style.paddingBottom - (lines.length - 1) * lineHeight;
    }

    lines.forEach((line, index) => {
      ctx.fillText(line, textX, textY + index * lineHeight);
    });
  }
};
