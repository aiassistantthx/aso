import { StyleConfig, DeviceSize, DEVICE_SIZES } from '../types';

export interface GenerateImageOptions {
  screenshot: string | null;
  text: string;
  style: StyleConfig;
  deviceSize: DeviceSize;
}

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
  mockupX: number,
  mockupY: number,
  mockupWidth: number,
  mockupHeight: number,
  screenshot: string | null,
  style: StyleConfig
): Promise<void> => {
  const mockupImg = await loadMockupImage();
  const visibilityRatio = getVisibilityRatio(style.mockupVisibility);

  // Calculate scale factor
  const scale = mockupWidth / MOCKUP_CONFIG.phoneWidth;

  // Calculate the full mockup image dimensions at this scale
  const scaledImgWidth = MOCKUP_CONFIG.imageWidth * scale;
  const scaledImgHeight = MOCKUP_CONFIG.imageHeight * scale;

  // Calculate visible area dimensions
  const fullPhoneHeight = mockupHeight;
  const visibleHeight = fullPhoneHeight * visibilityRatio;

  // Calculate clip region and phone offset based on alignment
  let clipY = mockupY;
  let adjustedMockupY = mockupY;

  if (visibilityRatio < 1) {
    const hiddenHeight = fullPhoneHeight - visibleHeight;

    switch (style.mockupAlignment) {
      case 'top':
        // Phone at top of screen, UPPER part of phone is cropped
        // We see the BOTTOM portion of the phone
        // Clip starts at mockupY, phone needs to move UP
        clipY = mockupY;
        adjustedMockupY = mockupY - hiddenHeight;
        break;
      case 'bottom':
        // Phone at bottom of screen, LOWER part of phone is cropped
        // We see the TOP portion of the phone
        // Clip starts at mockupY, phone stays at mockupY
        clipY = mockupY;
        adjustedMockupY = mockupY;
        break;
      case 'center':
      default:
        // Centered - equal parts hidden top and bottom
        clipY = mockupY;
        adjustedMockupY = mockupY - hiddenHeight / 2;
        break;
    }
  }

  // Apply clipping for partial visibility
  ctx.save();
  if (visibilityRatio < 1) {
    ctx.beginPath();
    ctx.rect(mockupX - 100, clipY, mockupWidth + 200, visibleHeight);
    ctx.clip();
  }

  // Calculate offset to position the phone correctly
  const imgX = mockupX - (MOCKUP_CONFIG.phoneX * scale);
  const imgY = adjustedMockupY - (MOCKUP_CONFIG.phoneY * scale);

  // Calculate screen position and size
  const screenX = mockupX + ((MOCKUP_CONFIG.screenX - MOCKUP_CONFIG.phoneX) * scale);
  const screenY = adjustedMockupY + ((MOCKUP_CONFIG.screenY - MOCKUP_CONFIG.phoneY) * scale);
  const screenWidth = MOCKUP_CONFIG.screenWidth * scale;
  const screenHeight = MOCKUP_CONFIG.screenHeight * scale;
  const cornerRadius = MOCKUP_CONFIG.screenCornerRadius * scale;

  // Dynamic Island coordinates scaled
  const diX = mockupX + ((MOCKUP_CONFIG.dynamicIslandX - MOCKUP_CONFIG.phoneX) * scale);
  const diY = adjustedMockupY + ((MOCKUP_CONFIG.dynamicIslandY - MOCKUP_CONFIG.phoneY) * scale);
  const diWidth = MOCKUP_CONFIG.dynamicIslandWidth * scale;
  const diHeight = MOCKUP_CONFIG.dynamicIslandHeight * scale;
  const diRadius = MOCKUP_CONFIG.dynamicIslandRadius * scale;

  const frameColor = getFrameColor(style.mockupColor);

  // 0. Draw shadow for 3D depth effect
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 60 * scale;
  ctx.shadowOffsetX = 15 * scale;
  ctx.shadowOffsetY = 25 * scale;
  ctx.fillStyle = frameColor;
  ctx.beginPath();
  ctx.roundRect(mockupX, adjustedMockupY, mockupWidth, mockupHeight, cornerRadius);
  ctx.fill();
  ctx.restore();

  // 1. Draw side buttons
  drawSideButtons(ctx, mockupX, adjustedMockupY, scale, frameColor);

  // 2. Draw screenshot clipped to screen area
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

    // 3. Draw Dynamic Island on top of screenshot (cutout effect)
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

  // 4. Draw mockup frame BEHIND everything (destination-over)
  ctx.globalCompositeOperation = 'destination-over';
  ctx.drawImage(mockupImg, imgX, imgY, scaledImgWidth, scaledImgHeight);
  ctx.globalCompositeOperation = 'source-over'; // Reset

  // Restore clipping context
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
  // Maintain phone aspect ratio
  const phoneAspect = MOCKUP_CONFIG.phoneWidth / MOCKUP_CONFIG.phoneHeight;
  const mockupWidth = mockupHeight * phoneAspect;

  const mockupX = (canvas.width - mockupWidth) / 2;
  const mockupY = style.textPosition === 'top'
    ? textAreaHeight + 40
    : 40;

  if (style.showMockup) {
    await drawMockupWithScreenshot(ctx, mockupX, mockupY, mockupWidth, mockupHeight, screenshot, style);
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
  const phoneAspect = MOCKUP_CONFIG.phoneWidth / MOCKUP_CONFIG.phoneHeight;
  const mockupWidth = mockupHeight * phoneAspect;

  const mockupX = (dimensions.width - mockupWidth) / 2;
  const mockupY = style.textPosition === 'top'
    ? textAreaHeight + 40
    : 40;

  if (style.showMockup) {
    try {
      await drawMockupWithScreenshot(ctx, mockupX, mockupY, mockupWidth, mockupHeight, screenshot, style);
    } catch (e) {
      // Mockup not loaded yet, draw fallback
      ctx.fillStyle = '#1d1d1f';
      ctx.beginPath();
      ctx.roundRect(mockupX, mockupY, mockupWidth, mockupHeight, 60);
      ctx.fill();
    }
  } else if (screenshot) {
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
