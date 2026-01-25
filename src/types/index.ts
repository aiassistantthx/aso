export interface Screenshot {
  id: string;
  file: File;
  preview: string;
  text: string;
}

export interface StyleConfig {
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: number;
  textPosition: 'top' | 'bottom';
  textAlign: 'left' | 'center' | 'right';
  paddingTop: number;
  paddingBottom: number;
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
}

export const DEVICE_SIZES: Record<DeviceSize, DeviceDimensions> = {
  '6.9': {
    width: 1320,
    height: 2868,
    name: 'iPhone 16 Pro Max (6.9")'
  },
  '6.5': {
    width: 1284,
    height: 2778,
    name: 'iPhone 11 Pro Max (6.5")'
  }
};
