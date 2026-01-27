import OpenAI from 'openai';
import { TranslatedTexts, TranslationData, Screenshot, LaurelDecoration } from '../types';
import { APP_STORE_LANGUAGES } from '../constants/languages';

let openaiClient: OpenAI | null = null;

export const initializeOpenAI = (apiKey: string): void => {
  openaiClient = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

// Extract laurel texts from screenshots
const extractLaurelTexts = (screenshots: Screenshot[]): string[][] => {
  return screenshots.map(screenshot => {
    const laurelDec = screenshot.decorations?.find(d => d.type === 'laurel') as LaurelDecoration | undefined;
    if (!laurelDec?.textBlocks) return [];
    return laurelDec.textBlocks.map(block => block.text);
  });
};

export const translateTexts = async (
  texts: string[],
  sourceLanguage: string,
  targetLanguages: string[],
  onProgress?: (progress: number) => void
): Promise<TranslatedTexts> => {
  const result = await translateAllContent(
    texts,
    [],
    sourceLanguage,
    targetLanguages,
    onProgress
  );
  return result.headlines;
};

// Translate all content including headlines and laurel texts
export const translateAllContent = async (
  headlines: string[],
  screenshots: Screenshot[],
  sourceLanguage: string,
  targetLanguages: string[],
  onProgress?: (progress: number) => void
): Promise<TranslationData> => {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized. Please set your API key.');
  }

  const laurelTexts = extractLaurelTexts(screenshots);

  const results: TranslationData = {
    headlines: { [sourceLanguage]: headlines },
    laurelTexts: { [sourceLanguage]: laurelTexts }
  };

  const totalTranslations = targetLanguages.filter(l => l !== sourceLanguage).length;
  let completedTranslations = 0;

  for (const targetLang of targetLanguages) {
    if (targetLang === sourceLanguage) continue;

    const targetLanguageInfo = APP_STORE_LANGUAGES.find(l => l.code === targetLang);
    const targetLanguageName = targetLanguageInfo?.name || targetLang;

    try {
      // Prepare all texts for translation
      // Format: HEADLINES section, then LAUREL section
      const allTexts: string[] = [];
      const headlineCount = headlines.length;

      // Add headlines
      headlines.forEach(h => allTexts.push(h));

      // Add laurel texts (flattened with markers)
      const laurelMarkers: { screenshotIdx: number; blockIdx: number }[] = [];
      laurelTexts.forEach((screenshotLaurels, sIdx) => {
        screenshotLaurels.forEach((text, bIdx) => {
          allTexts.push(text);
          laurelMarkers.push({ screenshotIdx: sIdx, blockIdx: bIdx });
        });
      });

      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator for App Store screenshots. Translate the following texts to ${targetLanguageName}.

IMPORTANT RULES:
1. Keep translations concise and impactful - they appear as headlines on app screenshots
2. PRESERVE all [brackets] around text - these mark highlighted words. Example: "[Download] Now" → "[Descargar] Ahora"
3. PRESERVE the | character for line breaks. Example: "Create|Videos" → "Crear|Videos"
4. Keep numbers and special characters as-is
5. Return ONLY the translations, one per line, in the exact same order
6. Do not add numbers, quotes, or any other formatting
7. For short promotional phrases (like "You need only", "App to create"), keep them punchy and marketing-style`
          },
          {
            role: 'user',
            content: allTexts.join('\n')
          }
        ],
        temperature: 0.3
      });

      const translatedContent = response.choices[0]?.message?.content || '';
      const translatedTexts = translatedContent.split('\n').filter(t => t.trim());

      // Split results back into headlines and laurel texts
      const translatedHeadlines = headlines.map((original, index) =>
        translatedTexts[index]?.trim() || original
      );

      // Reconstruct laurel texts structure
      const translatedLaurels: string[][] = laurelTexts.map(() => []);
      laurelMarkers.forEach((marker, idx) => {
        const translatedIdx = headlineCount + idx;
        const translated = translatedTexts[translatedIdx]?.trim() || laurelTexts[marker.screenshotIdx][marker.blockIdx];
        if (!translatedLaurels[marker.screenshotIdx]) {
          translatedLaurels[marker.screenshotIdx] = [];
        }
        translatedLaurels[marker.screenshotIdx][marker.blockIdx] = translated;
      });

      results.headlines[targetLang] = translatedHeadlines;
      results.laurelTexts[targetLang] = translatedLaurels;

    } catch (error) {
      console.error(`Translation error for ${targetLang}:`, error);
      // Fallback to original texts on error
      results.headlines[targetLang] = headlines;
      results.laurelTexts[targetLang] = laurelTexts;
    }

    completedTranslations++;
    if (onProgress) {
      onProgress((completedTranslations / totalTranslations) * 100);
    }
  }

  return results;
};
