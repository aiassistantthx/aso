export interface Position {
  x: number;
  y: number;
}

export interface StarRatingDecoration {
  type: 'stars';
  enabled: boolean;
  count: number;        // 1-5 stars
  size: number;         // star size in pixels
  color: string;
  position: Position;
}

export interface LaurelTextBlock {
  text: string;
  size: number;
  bold?: boolean;
}

export interface LaurelDecoration {
  type: 'laurel';
  enabled: boolean;
  size: number;         // scale factor (1 = default)
  color: string;
  position: Position;
  textBlocks: LaurelTextBlock[];  // array of text blocks with individual sizes
  textColor: string;
  fontFamily: string;
}

export type Decoration = StarRatingDecoration | LaurelDecoration;

// Per-screenshot style overrides
export interface ScreenshotStyleOverride {
  textColor?: string;
  backgroundColor?: string;
  highlightColor?: string;
  textPosition?: 'top' | 'bottom';
  mockupAlignment?: 'top' | 'center' | 'bottom';
  gradient?: {
    enabled: boolean;
    color1: string;
    color2: string;
    angle: number;
  };
}

// Per-screenshot mockup settings for flexible positioning
export interface ScreenshotMockupSettings {
  // Position offset as percentage of canvas width (-100 to +100)
  // 0 = centered, -50 = half off left edge, +50 = half off right edge
  offsetX: number;
  offsetY: number;
  rotation: number;  // degrees
  scale?: number;    // optional - falls back to style.mockupScale if undefined
  // Link to next screen (for smooth transitions)
  linkedToNext?: boolean;
  // Per-screenshot text offset (overrides global style.textOffset)
  textOffsetX?: number;
  textOffsetY?: number;
}

export interface Screenshot {
  id: string;
  file: File | null;  // null for text-only slides
  preview: string;    // empty string for text-only slides
  text: string;
  decorations?: Decoration[];
  styleOverride?: ScreenshotStyleOverride;  // per-screenshot color overrides
  // For mockup continuation: which screenshot index to show in the mockup
  // If undefined, uses this screen's own screenshot
  linkedMockupIndex?: number;
  // Per-screenshot mockup position/continuation (legacy)
  mockupContinuation?: MockupContinuation;
  // New flexible mockup settings
  mockupSettings?: ScreenshotMockupSettings;
}

export interface GradientConfig {
  enabled: boolean;
  color1: string;
  color2: string;
  angle: number;
}

export type MockupVisibility = 'full' | '2/3' | '1/2';
export type MockupAlignment = 'top' | 'center' | 'bottom';
export type MockupStyle = 'realistic' | 'flat' | 'minimal' | 'outline';

// Mockup continuation mode for split mockups across screens
export type MockupContinuation = 'none' | 'left-start' | 'left-end' | 'right-start' | 'right-end';

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
  mockupStyle: MockupStyle;
  mockupVisibility: MockupVisibility;
  mockupAlignment: MockupAlignment;
  // Custom position offsets (relative to default position)
  mockupOffset: Position;
  textOffset: Position;
  // Mockup scale factor (1.0 = default size)
  mockupScale: number;
  // Mockup rotation in degrees
  mockupRotation: number;
  // Mockup continuation for split screens
  mockupContinuation: MockupContinuation;
  // Highlight settings for [text] syntax
  highlightColor: string;
  highlightPadding: number;
  highlightBorderRadius: number;
  // Background pattern
  pattern?: BackgroundPattern;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface TranslatedTexts {
  [languageCode: string]: string[];
}

// Per-language style overrides for individual screenshots
export interface PerLanguageScreenshotStyle {
  fontSize?: number;
  textOffset?: Position;
  mockupOffset?: Position;
  mockupScale?: number;
  // Decoration position overrides
  decorationPositions?: {
    [decorationIndex: number]: Position;
  };
}

// Extended translation data including decoration texts and per-language styles
export interface TranslationData {
  headlines: TranslatedTexts;
  // laurelTexts[languageCode][screenshotIndex][blockIndex] = translated text
  laurelTexts: {
    [languageCode: string]: string[][];
  };
  // Per-language style overrides: styles[languageCode][screenshotIndex]
  perLanguageStyles?: {
    [languageCode: string]: {
      [screenshotIndex: number]: PerLanguageScreenshotStyle;
    };
  };
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

// ============== TEMPLATE SYSTEM ==============

// Background pattern types
export type BackgroundPatternType = 'none' | 'dots' | 'grid' | 'diagonal-lines' | 'circles' | 'squares';

export interface BackgroundPattern {
  type: BackgroundPatternType;
  color: string;        // Pattern color
  opacity: number;      // 0-1
  size: number;         // Pattern element size
  spacing: number;      // Gap between elements
}

// Layout types for mockup positioning
export type LayoutType =
  | 'classic-top'        // Text top, mockup bottom center
  | 'classic-bottom'     // Text bottom, mockup top center
  | 'side-left'          // Text left, mockup right
  | 'side-right'         // Text right, mockup left
  | 'floating'           // Mockup floating with shadow, text overlay
  | 'tilted-left'        // Mockup tilted left
  | 'tilted-right'       // Mockup tilted right
  | 'dual-mockup'        // Two mockups side by side
  | 'text-only'          // No mockup, just text and decorations
  | 'full-bleed';        // Mockup fills most of screen

// Badge/tag decoration
export interface BadgeDecoration {
  type: 'badge';
  enabled: boolean;
  text: string;
  backgroundColor: string;
  textColor: string;
  position: Position;
  borderRadius: number;
  fontSize: number;
}

// Extended decoration types
export type ExtendedDecoration = Decoration | BadgeDecoration;

// Template definition
export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  thumbnail?: string;  // Preview image URL

  // Layout
  layout: LayoutType;
  mockupRotation?: number;  // Degrees of rotation for tilted layouts

  // Colors
  backgroundColor: string;
  gradient: GradientConfig;
  textColor: string;

  // Background pattern
  pattern: BackgroundPattern;

  // Text styling
  fontFamily: string;
  fontSize: number;
  textAlign: 'left' | 'center' | 'right';
  subtitleEnabled: boolean;
  subtitleFontSize?: number;
  subtitleColor?: string;

  // Highlight style
  highlightColor: string;
  highlightStyle: 'background' | 'underline' | 'none';

  // Mockup settings
  mockupColor: 'black' | 'white' | 'natural';
  mockupScale: number;
  mockupShadow: boolean;

  // Padding
  paddingTop: number;
  paddingBottom: number;
  paddingSide: number;
}

export type TemplateCategory =
  | 'minimal'
  | 'bold'
  | 'gradient'
  | 'pattern'
  | 'dark'
  | 'light'
  | 'colorful';

// Template preset - simplified template for quick selection
export interface TemplatePreset {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  template: Partial<Template>;
}
