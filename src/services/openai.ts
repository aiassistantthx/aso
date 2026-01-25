import OpenAI from 'openai';
import { TranslatedTexts } from '../types';
import { APP_STORE_LANGUAGES } from '../constants/languages';

let openaiClient: OpenAI | null = null;

export const initializeOpenAI = (apiKey: string): void => {
  openaiClient = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

export const translateTexts = async (
  texts: string[],
  sourceLanguage: string,
  targetLanguages: string[],
  onProgress?: (progress: number) => void
): Promise<TranslatedTexts> => {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized. Please set your API key.');
  }

  const results: TranslatedTexts = {};

  // Add source language texts
  results[sourceLanguage] = texts;

  const totalTranslations = targetLanguages.filter(l => l !== sourceLanguage).length;
  let completedTranslations = 0;

  for (const targetLang of targetLanguages) {
    if (targetLang === sourceLanguage) continue;

    const targetLanguageInfo = APP_STORE_LANGUAGES.find(l => l.code === targetLang);
    const targetLanguageName = targetLanguageInfo?.name || targetLang;

    try {
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator for App Store screenshots. Translate the following texts to ${targetLanguageName}. Keep translations concise and impactful - they will appear as headlines on app screenshots. Return ONLY the translations, one per line, in the same order as the input. Do not add numbers, quotes, or any other formatting.`
          },
          {
            role: 'user',
            content: texts.join('\n')
          }
        ],
        temperature: 0.3
      });

      const translatedContent = response.choices[0]?.message?.content || '';
      const translatedTexts = translatedContent.split('\n').filter(t => t.trim());

      // Ensure we have the same number of translations as input texts
      results[targetLang] = texts.map((_, index) =>
        translatedTexts[index]?.trim() || texts[index]
      );
    } catch (error) {
      console.error(`Translation error for ${targetLang}:`, error);
      // Fallback to original texts on error
      results[targetLang] = texts;
    }

    completedTranslations++;
    if (onProgress) {
      onProgress((completedTranslations / totalTranslations) * 100);
    }
  }

  return results;
};
