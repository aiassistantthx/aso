import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Screenshot, StyleConfig, TranslationData, DeviceSize, Decoration, LaurelDecoration, PerLanguageScreenshotStyle } from '../types';
import { generateScreenshotImage } from './canvas';
import { getLanguageName } from '../constants/languages';

// Both device sizes for App Store
const EXPORT_DEVICE_SIZES: DeviceSize[] = ['6.9', '6.5'];

export interface ExportOptions {
  screenshots: Screenshot[];
  translationData: TranslationData;
  style: StyleConfig;
  deviceSize: DeviceSize; // Primary size for preview, but we export both
  onProgress?: (progress: number, status: string) => void;
}

// Apply translated laurel texts and position overrides to decorations
const applyTranslationsAndPositions = (
  decorations: Decoration[] | undefined,
  translatedLaurelTexts: string[] | undefined,
  positionOverrides: PerLanguageScreenshotStyle['decorationPositions']
): Decoration[] | undefined => {
  if (!decorations) return decorations;

  return decorations.map((dec, idx) => {
    let result = { ...dec };

    // Apply position override
    if (positionOverrides?.[idx]) {
      result = { ...result, position: positionOverrides[idx] };
    }

    // Apply laurel text translations
    if (dec.type === 'laurel' && translatedLaurelTexts) {
      const laurelDec = result as LaurelDecoration;
      result = {
        ...laurelDec,
        textBlocks: laurelDec.textBlocks.map((block, bIdx) => ({
          ...block,
          text: translatedLaurelTexts[bIdx] || block.text
        }))
      };
    }

    return result;
  });
};

// Merge global style with per-language overrides
const mergeStyleWithOverrides = (
  style: StyleConfig,
  perLangStyle: PerLanguageScreenshotStyle | undefined
): StyleConfig => {
  if (!perLangStyle) return style;
  return {
    ...style,
    fontSize: perLangStyle.fontSize ?? style.fontSize,
    textOffset: perLangStyle.textOffset ?? style.textOffset,
    mockupOffset: perLangStyle.mockupOffset ?? style.mockupOffset,
    mockupScale: perLangStyle.mockupScale ?? style.mockupScale
  };
};

export const generateZipArchive = async (options: ExportOptions): Promise<void> => {
  const { screenshots, translationData, style, onProgress } = options;

  const zip = new JSZip();
  const languages = Object.keys(translationData.headlines);
  // Total images = languages * screenshots * device sizes
  const totalImages = languages.length * screenshots.length * EXPORT_DEVICE_SIZES.length;
  let completedImages = 0;

  for (const langCode of languages) {
    const langTexts = translationData.headlines[langCode];
    const langLaurels = translationData.laurelTexts[langCode];
    const langStyles = translationData.perLanguageStyles?.[langCode];
    // Use readable folder name: "en-US (English (US))"
    const folderName = `${langCode} (${getLanguageName(langCode)})`;
    const langFolder = zip.folder(folderName)!;

    // Generate for both device sizes
    for (const deviceSize of EXPORT_DEVICE_SIZES) {
      const sizeFolder = langFolder.folder(deviceSize === '6.9' ? '6.9-inch' : '6.5-inch')!;

      for (let i = 0; i < screenshots.length; i++) {
        const screenshot = screenshots[i];
        const text = langTexts[i] || screenshot.text;
        const perLangStyle = langStyles?.[i];

        // Apply decorations with translations and position overrides
        const translatedDecorations = applyTranslationsAndPositions(
          screenshot.decorations,
          langLaurels?.[i],
          perLangStyle?.decorationPositions
        );

        // Merge style with per-language overrides
        const mergedStyle = mergeStyleWithOverrides(style, perLangStyle);

        if (onProgress) {
          onProgress(
            (completedImages / totalImages) * 100,
            `Generating ${langCode} (${deviceSize}") - Screenshot ${i + 1}`
          );
        }

        try {
          const blob = await generateScreenshotImage({
            screenshot: screenshot.preview,
            text,
            style: mergedStyle,
            deviceSize,
            decorations: translatedDecorations,
            styleOverride: screenshot.styleOverride
          });

          const fileName = `screenshot_${String(i + 1).padStart(2, '0')}.png`;
          sizeFolder.file(fileName, blob);
        } catch (error) {
          console.error(`Error generating image for ${langCode} (${deviceSize}) screenshot ${i + 1}:`, error);
        }

        completedImages++;
      }
    }
  }

  if (onProgress) {
    onProgress(100, 'Creating ZIP archive...');
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `app-store-screenshots-${Date.now()}.zip`);
};
