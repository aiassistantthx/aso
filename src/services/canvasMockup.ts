import { StyleConfig, DeviceSize, DEVICE_SIZES, MockupContinuation, ScreenshotMockupSettings } from '../types';
import { MOCKUP_PROPORTIONS as MP } from '../constants/mockup';
import { loadImage, drawScreenshotClipped } from './canvasShared';

// Screen area coordinates within the mockup image (2000x2000)
// Blue iPhone 15 mockup with transparent background
export const MOCKUP_CONFIG = {
  imageWidth: 2000,
  imageHeight: 2000,
  phoneX: 575,
  phoneY: 42,
  phoneWidth: 850,
  phoneHeight: 1740,
  screenX: 600,
  screenY: 60,
  screenWidth: 800,
  screenHeight: 1700,
  screenCornerRadius: 80,
  dynamicIslandX: 870,
  dynamicIslandY: 100,
  dynamicIslandWidth: 260,
  dynamicIslandHeight: 75,
  dynamicIslandRadius: 37,
  buttons: {
    leftSwitch: { x: -12, y: 280, width: 12, height: 60 },
    leftVolumeUp: { x: -12, y: 380, width: 12, height: 120 },
    leftVolumeDown: { x: -12, y: 520, width: 12, height: 120 },
    rightPower: { x: 850, y: 420, width: 12, height: 180 }
  }
};

// Google Pixel mockup configuration
export const PIXEL_CONFIG = {
  phoneWidth: 450,
  phoneHeight: 980,
  bezelWidth: 8,
  cornerRadius: 50,
  screenCornerRadius: 45,
  punchHoleX: 225,
  punchHoleY: 35,
  punchHoleRadius: 12,
  buttons: {
    rightPower: { x: 450, y: 200, width: 6, height: 80 },
    rightVolume: { x: 450, y: 300, width: 6, height: 100 }
  }
};

export const getVisibilityRatio = (visibility: StyleConfig['mockupVisibility']): number => {
  switch (visibility) {
    case '2/3': return 2 / 3;
    case '1/2': return 0.5;
    default: return 1;
  }
};

export const getFrameColor = (color: 'black' | 'white' | 'natural'): string => {
  switch (color) {
    case 'white': return '#F5F5F7';
    case 'natural': return '#E3D5C8';
    default: return '#1D1D1F';
  }
};

// Mockup image cache
let mockupImageCache: HTMLImageElement | null = null;

const loadMockupImage = async (): Promise<HTMLImageElement> => {
  if (mockupImageCache) {
    return mockupImageCache;
  }
  const img = await loadImage('/mockups/iphone-black.png');
  mockupImageCache = img;
  return img;
};

// Draw side buttons for realistic mockup (using PNG mockup coordinates)
const drawSideButtons = (
  ctx: CanvasRenderingContext2D,
  mockupX: number,
  mockupY: number,
  scale: number,
  frameColor: string
): void => {
  const buttons = MOCKUP_CONFIG.buttons;
  const buttonRadius = 4 * scale;

  ctx.fillStyle = frameColor === '#F5F5F7' ? '#D2D2D7' :
                  frameColor === '#E3D5C8' ? '#C5B5A6' : '#2D2D2F';

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

// Draw side buttons for programmatic mockups (flat/minimal)
const drawProgrammaticSideButtons = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  frameColor: string
): void => {
  const buttonColor = frameColor === '#F5F5F7' ? '#D1D1D6' :
                      frameColor === '#E3D5C8' ? '#C4B5A8' : '#0D0D0D';

  const buttonWidth = width * MP.BUTTON_WIDTH;
  const buttonRadius = buttonWidth / 2;

  ctx.fillStyle = buttonColor;

  const actionBtnHeight = height * 0.035;
  const actionBtnY = y + height * 0.15;
  ctx.beginPath();
  ctx.roundRect(x - buttonWidth, actionBtnY, buttonWidth, actionBtnHeight, buttonRadius);
  ctx.fill();

  const volUpHeight = height * 0.065;
  const volUpY = y + height * 0.22;
  ctx.beginPath();
  ctx.roundRect(x - buttonWidth, volUpY, buttonWidth, volUpHeight, buttonRadius);
  ctx.fill();

  const volDownY = volUpY + volUpHeight + height * 0.015;
  ctx.beginPath();
  ctx.roundRect(x - buttonWidth, volDownY, buttonWidth, volUpHeight, buttonRadius);
  ctx.fill();

  const powerHeight = height * 0.08;
  const powerY = y + height * 0.24;
  ctx.beginPath();
  ctx.roundRect(x + width, powerY, buttonWidth, powerHeight, buttonRadius);
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

  const buttonWidth = width * MP.BUTTON_WIDTH;

  const actionBtnHeight = height * 0.035;
  const actionBtnY = y + height * 0.15;
  ctx.beginPath();
  ctx.roundRect(x - buttonWidth - lineWidth / 2, actionBtnY, buttonWidth, actionBtnHeight, 2);
  ctx.stroke();

  const volUpHeight = height * 0.065;
  const volUpY = y + height * 0.22;
  ctx.beginPath();
  ctx.roundRect(x - buttonWidth - lineWidth / 2, volUpY, buttonWidth, volUpHeight, 2);
  ctx.stroke();

  const volDownY = volUpY + volUpHeight + height * 0.015;
  ctx.beginPath();
  ctx.roundRect(x - buttonWidth - lineWidth / 2, volDownY, buttonWidth, volUpHeight, 2);
  ctx.stroke();

  const powerHeight = height * 0.08;
  const powerY = y + height * 0.24;
  ctx.beginPath();
  ctx.roundRect(x + width + lineWidth / 2, powerY, buttonWidth, powerHeight, 2);
  ctx.stroke();
};

// Draw flat style mockup
const drawFlatMockup = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number,
  frameColor: string,
  screenshot: HTMLImageElement | null
): void => {
  const frameThickness = width * MP.FRAME_THICKNESS;
  const cornerRadius = width * MP.CORNER_RADIUS;
  const screenCornerRadius = cornerRadius - frameThickness * MP.INNER_RADIUS_FACTOR;

  const screenWidth = width - frameThickness * 2;
  const dynamicIslandWidth = screenWidth * MP.DYNAMIC_ISLAND_WIDTH_RATIO;
  const dynamicIslandHeight = height * MP.DYNAMIC_ISLAND_HEIGHT;
  const dynamicIslandY = y + frameThickness + height * MP.DYNAMIC_ISLAND_Y_OFFSET;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetX = 10;
  ctx.shadowOffsetY = 20;

  ctx.fillStyle = frameColor;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, cornerRadius);
  ctx.fill();
  ctx.restore();

  drawProgrammaticSideButtons(ctx, x, y, width, height, frameColor);

  const screenX = x + frameThickness;
  const screenY = y + frameThickness;
  const screenHeight = height - frameThickness * 2;

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(screenX, screenY, screenWidth, screenHeight, screenCornerRadius);
  ctx.fill();

  if (screenshot) {
    drawScreenshotClipped(ctx, screenshot, screenX, screenY, screenWidth, screenHeight, screenCornerRadius);
  }

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(x + (width - dynamicIslandWidth) / 2, dynamicIslandY, dynamicIslandWidth, dynamicIslandHeight, dynamicIslandHeight / 2);
  ctx.fill();
};

// Draw minimal style mockup
const drawMinimalMockup = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number,
  frameColor: string,
  screenshot: HTMLImageElement | null
): void => {
  const borderWidth = width * MP.MINIMAL_BORDER;
  const cornerRadius = width * MP.MINIMAL_CORNER_RADIUS;
  const innerRadius = cornerRadius - borderWidth;

  const dynamicIslandWidth = width * MP.MINIMAL_DI_WIDTH;
  const dynamicIslandHeight = height * MP.MINIMAL_DI_HEIGHT;
  const dynamicIslandY = y + borderWidth + height * MP.MINIMAL_DI_Y_OFFSET;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 35;
  ctx.shadowOffsetY = 12;

  ctx.fillStyle = frameColor;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, cornerRadius);
  ctx.fill();
  ctx.restore();

  drawProgrammaticSideButtons(ctx, x, y, width, height, frameColor);

  const screenX = x + borderWidth;
  const screenY = y + borderWidth;
  const screenWidth = width - borderWidth * 2;
  const screenHeight = height - borderWidth * 2;

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(screenX, screenY, screenWidth, screenHeight, innerRadius);
  ctx.fill();

  if (screenshot) {
    drawScreenshotClipped(ctx, screenshot, screenX, screenY, screenWidth, screenHeight, innerRadius);
  }

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(x + (width - dynamicIslandWidth) / 2, dynamicIslandY, dynamicIslandWidth, dynamicIslandHeight, dynamicIslandHeight / 2);
  ctx.fill();
};

// Draw outline style mockup
const drawOutlineMockup = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number,
  frameColor: string,
  screenshot: HTMLImageElement | null
): void => {
  const borderWidth = width * MP.OUTLINE_BORDER;
  const cornerRadius = width * MP.OUTLINE_CORNER_RADIUS;
  const innerRadius = cornerRadius - borderWidth / 2;

  const dynamicIslandWidth = width * MP.MINIMAL_DI_WIDTH;
  const dynamicIslandHeight = height * MP.MINIMAL_DI_HEIGHT;
  const dynamicIslandY = y + borderWidth + height * MP.OUTLINE_DI_Y_OFFSET;

  const screenX = x + borderWidth;
  const screenY = y + borderWidth;
  const screenWidth = width - borderWidth * 2;
  const screenHeight = height - borderWidth * 2;

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(screenX, screenY, screenWidth, screenHeight, innerRadius);
  ctx.fill();

  if (screenshot) {
    drawScreenshotClipped(ctx, screenshot, screenX, screenY, screenWidth, screenHeight, innerRadius);
  }

  ctx.strokeStyle = frameColor;
  ctx.lineWidth = borderWidth;
  ctx.beginPath();
  ctx.roundRect(x + borderWidth / 2, y + borderWidth / 2, width - borderWidth, height - borderWidth, cornerRadius);
  ctx.stroke();

  drawOutlineSideButtons(ctx, x, y, width, height, frameColor, borderWidth * 0.6);

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(x + (width - dynamicIslandWidth) / 2, dynamicIslandY, dynamicIslandWidth, dynamicIslandHeight, dynamicIslandHeight / 2);
  ctx.fill();
};

// Draw Google Pixel style mockup
const drawPixelMockup = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number,
  frameColor: string,
  screenshot: HTMLImageElement | null
): void => {
  const frameThickness = width * 0.025;
  const cornerRadius = width * 0.08;
  const screenCornerRadius = cornerRadius - frameThickness * 0.7;

  const punchHoleRadius = width * 0.025;
  const punchHoleY = y + frameThickness + height * 0.015;
  const punchHoleX = x + width / 2;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 16;

  ctx.fillStyle = frameColor;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, cornerRadius);
  ctx.fill();
  ctx.restore();

  const screenX = x + frameThickness;
  const screenY = y + frameThickness;
  const screenWidth = width - frameThickness * 2;
  const screenHeight = height - frameThickness * 2;

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(screenX, screenY, screenWidth, screenHeight, screenCornerRadius);
  ctx.fill();

  if (screenshot) {
    drawScreenshotClipped(ctx, screenshot, screenX, screenY, screenWidth, screenHeight, screenCornerRadius);
  }

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(punchHoleX, punchHoleY, punchHoleRadius, 0, Math.PI * 2);
  ctx.fill();

  const buttonColor = frameColor === '#F5F5F7' ? '#D2D2D7' :
                      frameColor === '#E3D5C8' ? '#C5B5A6' : '#2D2D2F';
  ctx.fillStyle = buttonColor;

  const powerWidth = width * 0.015;
  const powerHeight = height * 0.045;
  const powerY = y + height * 0.18;
  ctx.beginPath();
  ctx.roundRect(x + width, powerY, powerWidth, powerHeight, 2);
  ctx.fill();

  const volHeight = height * 0.08;
  const volY = powerY + powerHeight + height * 0.02;
  ctx.beginPath();
  ctx.roundRect(x + width, volY, powerWidth, volHeight, 2);
  ctx.fill();
};

// Main mockup drawing function — handles all styles, rotation, continuation
export const drawMockupWithScreenshot = async (
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
  mockupSettings?: ScreenshotMockupSettings,
  deviceSize?: DeviceSize
): Promise<void> => {
  const isAndroid = deviceSize ? DEVICE_SIZES[deviceSize].platform === 'android' : false;

  const mockupStyle = style.mockupStyle || 'realistic';
  const mockupImg = (!isAndroid && mockupStyle === 'realistic') ? await loadMockupImage() : null;
  const visibilityRatio = getVisibilityRatio(style.mockupVisibility);
  const rotation = mockupSettings?.rotation ?? style.mockupRotation ?? 0;
  const continuation = mockupContinuationOverride ?? style.mockupContinuation ?? 'none';

  const fullPhoneHeight = mockupHeight;
  const config = isAndroid ? PIXEL_CONFIG : MOCKUP_CONFIG;
  const phoneAspect = config.phoneWidth / config.phoneHeight;
  const fullPhoneWidth = fullPhoneHeight * phoneAspect;

  const scale = fullPhoneWidth / MOCKUP_CONFIG.phoneWidth;

  const scaledImgWidth = MOCKUP_CONFIG.imageWidth * scale;
  const scaledImgHeight = MOCKUP_CONFIG.imageHeight * scale;

  let adjustedMockupX = (canvasWidth - fullPhoneWidth) / 2;

  const visiblePhoneHeight = fullPhoneHeight * visibilityRatio;
  const hiddenHeight = fullPhoneHeight - visiblePhoneHeight;
  let adjustedMockupY: number;

  const textAreaForAlignment = style.textPosition === 'top' ? canvasHeight * 0.35 : 0;

  switch (style.mockupAlignment) {
    case 'top':
      adjustedMockupY = textAreaForAlignment - hiddenHeight;
      break;
    case 'bottom':
      adjustedMockupY = canvasHeight - visiblePhoneHeight - 40;
      break;
    case 'center':
    default:
      adjustedMockupY = (canvasHeight - fullPhoneHeight) / 2;
      break;
  }

  if (continuation !== 'none') {
    const splitOffset = canvasWidth * 0.4;
    switch (continuation) {
      case 'left-start':
        adjustedMockupX += splitOffset;
        break;
      case 'left-end':
        adjustedMockupX -= splitOffset;
        break;
      case 'right-start':
        adjustedMockupX -= splitOffset;
        break;
      case 'right-end':
        adjustedMockupX += splitOffset;
        break;
    }
  }

  if (mockupSettings) {
    adjustedMockupX += (mockupSettings.offsetX / 100) * canvasWidth;
    adjustedMockupY += (mockupSettings.offsetY / 100) * canvasHeight;
  } else {
    adjustedMockupX += style.mockupOffset?.x || 0;
    adjustedMockupY += style.mockupOffset?.y || 0;
  }

  ctx.save();

  if (rotation !== 0) {
    const centerX = adjustedMockupX + fullPhoneWidth / 2;
    const centerY = adjustedMockupY + fullPhoneHeight / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }

  const imgX = adjustedMockupX - (MOCKUP_CONFIG.phoneX * scale);
  const imgY = adjustedMockupY - (MOCKUP_CONFIG.phoneY * scale);

  const screenX = adjustedMockupX + ((MOCKUP_CONFIG.screenX - MOCKUP_CONFIG.phoneX) * scale);
  const screenY = adjustedMockupY + ((MOCKUP_CONFIG.screenY - MOCKUP_CONFIG.phoneY) * scale);
  const screenWidth = MOCKUP_CONFIG.screenWidth * scale;
  const screenHeight = MOCKUP_CONFIG.screenHeight * scale;
  const cornerRadius = MOCKUP_CONFIG.screenCornerRadius * scale;

  const diX = adjustedMockupX + ((MOCKUP_CONFIG.dynamicIslandX - MOCKUP_CONFIG.phoneX) * scale);
  const diY = adjustedMockupY + ((MOCKUP_CONFIG.dynamicIslandY - MOCKUP_CONFIG.phoneY) * scale);
  const diWidth = MOCKUP_CONFIG.dynamicIslandWidth * scale;
  const diHeight = MOCKUP_CONFIG.dynamicIslandHeight * scale;
  const diRadius = MOCKUP_CONFIG.dynamicIslandRadius * scale;

  const frameColor = getFrameColor(style.mockupColor);

  const screenshotImg = screenshot ? await loadImage(screenshot) : null;

  if (isAndroid) {
    drawPixelMockup(ctx, adjustedMockupX, adjustedMockupY, fullPhoneWidth, fullPhoneHeight, frameColor, screenshotImg);
    ctx.restore();
    return;
  }

  if (mockupStyle !== 'realistic') {
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
    if (screenshotImg) {
      drawScreenshotClipped(ctx, screenshotImg, screenX, screenY, screenWidth, screenHeight, cornerRadius);

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.roundRect(diX, diY, diWidth, diHeight, diRadius);
      ctx.fill();
    } else {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.roundRect(screenX, screenY, screenWidth, screenHeight, cornerRadius);
      ctx.fill();
    }

    if (mockupImg) {
      ctx.globalCompositeOperation = 'destination-over';
      ctx.drawImage(mockupImg, imgX, imgY, scaledImgWidth, scaledImgHeight);

      drawSideButtons(ctx, adjustedMockupX, adjustedMockupY, scale, frameColor);

      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 60 * scale;
      ctx.shadowOffsetX = 15 * scale;
      ctx.shadowOffsetY = 25 * scale;
      ctx.fillStyle = frameColor;
      ctx.beginPath();
      ctx.roundRect(adjustedMockupX, adjustedMockupY, fullPhoneWidth, fullPhoneHeight, cornerRadius);
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over';
    }
  }

  ctx.restore();
};
