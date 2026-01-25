import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Screenshot, StyleConfig, TranslatedTexts, DeviceSize } from '../types';
import { generateScreenshotImage } from './canvas';

export interface ExportOptions {
  screenshots: Screenshot[];
  translations: TranslatedTexts;
  style: StyleConfig;
  deviceSize: DeviceSize;
  onProgress?: (progress: number, status: string) => void;
}

export const generateZipArchive = async (options: ExportOptions): Promise<void> => {
  const { screenshots, translations, style, deviceSize, onProgress } = options;

  const zip = new JSZip();
  const languages = Object.keys(translations);
  const totalImages = languages.length * screenshots.length;
  let completedImages = 0;

  for (const langCode of languages) {
    const langTexts = translations[langCode];
    const folder = zip.folder(langCode)!;

    for (let i = 0; i < screenshots.length; i++) {
      const screenshot = screenshots[i];
      const text = langTexts[i] || screenshot.text;

      if (onProgress) {
        onProgress(
          (completedImages / totalImages) * 100,
          `Generating ${langCode} - Screenshot ${i + 1}`
        );
      }

      try {
        const blob = await generateScreenshotImage({
          screenshot: screenshot.preview,
          text,
          style,
          deviceSize
        });

        const fileName = `screenshot_${String(i + 1).padStart(2, '0')}.png`;
        folder.file(fileName, blob);
      } catch (error) {
        console.error(`Error generating image for ${langCode} screenshot ${i + 1}:`, error);
      }

      completedImages++;
    }
  }

  if (onProgress) {
    onProgress(100, 'Creating ZIP archive...');
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `app-store-screenshots-${Date.now()}.zip`);
};
