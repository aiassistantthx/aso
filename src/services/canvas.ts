import { StyleConfig, DeviceSize, DEVICE_SIZES } from '../types';

export interface GenerateImageOptions {
  screenshot: string;
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

export const generateScreenshotImage = async (
  options: GenerateImageOptions
): Promise<Blob> => {
  const { screenshot, text, style, deviceSize } = options;
  const dimensions = DEVICE_SIZES[deviceSize];

  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const ctx = canvas.getContext('2d')!;

  // Fill background
  ctx.fillStyle = style.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Load and draw screenshot
  const img = await loadImage(screenshot);

  // Calculate screenshot placement (with mockup frame consideration)
  const frameWidth = dimensions.width * 0.85;
  const textAreaHeight = dimensions.height * 0.18;
  const screenshotAreaHeight = dimensions.height - textAreaHeight - style.paddingBottom;

  // Calculate aspect ratio and fit
  const imgAspect = img.width / img.height;
  const frameAspect = frameWidth / screenshotAreaHeight;

  let drawWidth: number;
  let drawHeight: number;

  if (imgAspect > frameAspect) {
    drawWidth = frameWidth;
    drawHeight = frameWidth / imgAspect;
  } else {
    drawHeight = screenshotAreaHeight * 0.9;
    drawWidth = drawHeight * imgAspect;
  }

  const imgX = (canvas.width - drawWidth) / 2;
  const imgY = style.textPosition === 'top'
    ? textAreaHeight + style.paddingTop
    : style.paddingTop + 20;

  // Draw screenshot with rounded corners (mockup effect)
  const cornerRadius = 40;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(imgX + cornerRadius, imgY);
  ctx.lineTo(imgX + drawWidth - cornerRadius, imgY);
  ctx.quadraticCurveTo(imgX + drawWidth, imgY, imgX + drawWidth, imgY + cornerRadius);
  ctx.lineTo(imgX + drawWidth, imgY + drawHeight - cornerRadius);
  ctx.quadraticCurveTo(imgX + drawWidth, imgY + drawHeight, imgX + drawWidth - cornerRadius, imgY + drawHeight);
  ctx.lineTo(imgX + cornerRadius, imgY + drawHeight);
  ctx.quadraticCurveTo(imgX, imgY + drawHeight, imgX, imgY + drawHeight - cornerRadius);
  ctx.lineTo(imgX, imgY + cornerRadius);
  ctx.quadraticCurveTo(imgX, imgY, imgX + cornerRadius, imgY);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(img, imgX, imgY, drawWidth, drawHeight);
  ctx.restore();

  // Draw phone frame outline
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(imgX + cornerRadius, imgY);
  ctx.lineTo(imgX + drawWidth - cornerRadius, imgY);
  ctx.quadraticCurveTo(imgX + drawWidth, imgY, imgX + drawWidth, imgY + cornerRadius);
  ctx.lineTo(imgX + drawWidth, imgY + drawHeight - cornerRadius);
  ctx.quadraticCurveTo(imgX + drawWidth, imgY + drawHeight, imgX + drawWidth - cornerRadius, imgY + drawHeight);
  ctx.lineTo(imgX + cornerRadius, imgY + drawHeight);
  ctx.quadraticCurveTo(imgX, imgY + drawHeight, imgX, imgY + drawHeight - cornerRadius);
  ctx.lineTo(imgX, imgY + cornerRadius);
  ctx.quadraticCurveTo(imgX, imgY, imgX + cornerRadius, imgY);
  ctx.closePath();
  ctx.stroke();

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

  // Fill background
  ctx.fillStyle = style.backgroundColor;
  ctx.fillRect(0, 0, dimensions.width, dimensions.height);

  // Load and draw screenshot
  try {
    const img = await loadImage(screenshot);

    const frameWidth = dimensions.width * 0.85;
    const textAreaHeight = dimensions.height * 0.18;
    const screenshotAreaHeight = dimensions.height - textAreaHeight - style.paddingBottom;

    const imgAspect = img.width / img.height;
    const frameAspect = frameWidth / screenshotAreaHeight;

    let drawWidth: number;
    let drawHeight: number;

    if (imgAspect > frameAspect) {
      drawWidth = frameWidth;
      drawHeight = frameWidth / imgAspect;
    } else {
      drawHeight = screenshotAreaHeight * 0.9;
      drawWidth = drawHeight * imgAspect;
    }

    const imgX = (dimensions.width - drawWidth) / 2;
    const imgY = style.textPosition === 'top'
      ? textAreaHeight + style.paddingTop
      : style.paddingTop + 20;

    // Draw screenshot with rounded corners
    const cornerRadius = 40;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(imgX + cornerRadius, imgY);
    ctx.lineTo(imgX + drawWidth - cornerRadius, imgY);
    ctx.quadraticCurveTo(imgX + drawWidth, imgY, imgX + drawWidth, imgY + cornerRadius);
    ctx.lineTo(imgX + drawWidth, imgY + drawHeight - cornerRadius);
    ctx.quadraticCurveTo(imgX + drawWidth, imgY + drawHeight, imgX + drawWidth - cornerRadius, imgY + drawHeight);
    ctx.lineTo(imgX + cornerRadius, imgY + drawHeight);
    ctx.quadraticCurveTo(imgX, imgY + drawHeight, imgX, imgY + drawHeight - cornerRadius);
    ctx.lineTo(imgX, imgY + cornerRadius);
    ctx.quadraticCurveTo(imgX, imgY, imgX + cornerRadius, imgY);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(img, imgX, imgY, drawWidth, drawHeight);
    ctx.restore();

    // Draw frame outline
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(imgX + cornerRadius, imgY);
    ctx.lineTo(imgX + drawWidth - cornerRadius, imgY);
    ctx.quadraticCurveTo(imgX + drawWidth, imgY, imgX + drawWidth, imgY + cornerRadius);
    ctx.lineTo(imgX + drawWidth, imgY + drawHeight - cornerRadius);
    ctx.quadraticCurveTo(imgX + drawWidth, imgY + drawHeight, imgX + drawWidth - cornerRadius, imgY + drawHeight);
    ctx.lineTo(imgX + cornerRadius, imgY + drawHeight);
    ctx.quadraticCurveTo(imgX, imgY + drawHeight, imgX, imgY + drawHeight - cornerRadius);
    ctx.lineTo(imgX, imgY + cornerRadius);
    ctx.quadraticCurveTo(imgX, imgY, imgX + cornerRadius, imgY);
    ctx.closePath();
    ctx.stroke();
  } catch (e) {
    // Screenshot not loaded yet
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
