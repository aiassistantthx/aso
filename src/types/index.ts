export interface Screenshot {
  id: string;
  file: File;
  preview: string;
  text: string;
}

export interface GradientConfig {
  enabled: boolean;
  color1: string;
  color2: string;
  angle: number;
}

export type MockupPosition = 'full' | 'top-3/4' | 'top-1/2' | 'bottom-3/4' | 'bottom-1/2';

export interface StyleConfig {
  backgroundColor: string;
  gradient: GradientConfig;
  textColor: string;
  fontFamily: string;
  fontSize: number;
  textPosition: 'top' | 'bottom';
  textAlign: 'left' | 'center' | 'right';
  paddingTop: number;
  paddingBottom: number;
  showMockup: boolean;
  mockupColor: 'black' | 'white' | 'natural';
  mockupPosition: MockupPosition;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface TranslatedTexts {
  [languageCode: string]: string[];
}

export type DeviceSize = '6.9' | '6.5';

export interface DeviceDimensions {
  width: number;
  height: number;
  name: string;
  // iPhone screen dimensions within the frame
  screenWidth: number;
  screenHeight: number;
  cornerRadius: number;
  bezelWidth: number;
  dynamicIslandWidth: number;
  dynamicIslandHeight: number;
}

export const DEVICE_SIZES: Record<DeviceSize, DeviceDimensions> = {
  '6.9': {
    width: 1320,
    height: 2868,
    name: 'iPhone 16 Pro Max (6.9")',
    screenWidth: 1320,
    screenHeight: 2868,
    cornerRadius: 140,
    bezelWidth: 12,
    dynamicIslandWidth: 310,
    dynamicIslandHeight: 95
  },
  '6.5': {
    width: 1284,
    height: 2778,
    name: 'iPhone 11 Pro Max (6.5")',
    screenWidth: 1284,
    screenHeight: 2778,
    cornerRadius: 130,
    bezelWidth: 12,
    dynamicIslandWidth: 290,
    dynamicIslandHeight: 90
  }
};
