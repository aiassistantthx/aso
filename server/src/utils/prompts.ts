import { PrismaClient } from '@prisma/client';

export interface PromptConfig {
  systemMessage: string;
  userTemplate: string;
  model: string;
  temperature: number;
}

// Default prompts used as fallback when DB is empty or prompt not found
export const DEFAULT_PROMPTS: Record<string, PromptConfig> = {
  headlines_generation: {
    systemMessage: 'You are an ASO expert. Return only valid JSON.',
    userTemplate: `You are an expert ASO copywriter for App Store screenshots.
Generate {{count}} compelling short headlines for "{{appName}}".
App description: "{{briefDescription}}"
Target keywords: "{{targetKeywords}}"

IMPORTANT: Generate all headlines in English (en-US), regardless of the language of the app name or description provided.

Rules:
- Each headline: 3-5 words MAXIMUM (shorter is better!)
- Headlines MUST fit on 2-3 lines of a mobile screen - keep them extremely concise
- Use [brackets] to highlight key words — place brackets around ACTION VERBS and separately around BENEFITS/OUTCOMES. Examples: "[Create] Videos [Effortlessly]", "[Save] Hours [Daily]", "[Transform] Your [Ideas]", "[Boost] Your [Productivity]"
- Each headline MUST have at least TWO separate bracketed sections: one for the action verb, one for the benefit
- Each headline MUST be unique in meaning — cover different features, benefits, or use cases. No repetition or paraphrasing of the same idea.
- Use power words that drive downloads
- Return JSON: { "headlines": ["...", "..."] }`,
    model: 'gpt-4o-mini',
    temperature: 0.7,
  },

  metadata_generation: {
    systemMessage: 'You are an ASO expert. Return only valid JSON.',
    userTemplate: `You are an expert ASO (App Store Optimization) copywriter. Generate optimized App Store (iOS) metadata.

App Name: "{{appName}}"
Brief Description: "{{briefDescription}}"{{keywordsLine}}

IMPORTANT: Generate all metadata in English (en-US), regardless of the language of the app name or description provided.

Return a JSON object with these fields: {{fieldsDescription}}

ASO Best Practices — FOLLOW STRICTLY:

CRITICAL RULE - ZERO WORD DUPLICATION:
Before writing ANY field, list all words you've used. NEVER repeat a word (or its variations like video/videos) across appName, subtitle, and keywords. Apple indexes all three fields, so repeating words wastes character space and hurts rankings.

1. appName (30 chars): Format as "{{appName}} - [Key Benefit Phrase]" or "{{appName}}: [Key Benefit Phrase]". The benefit phrase should read naturally, NOT be a comma-separated keyword list. Example: "Fitbit - Health & Fitness" not "Fitbit - health,fitness,tracker"

2. subtitle (30 chars): Use COMPLETELY DIFFERENT words than appName. If appName mentions "Video", subtitle MUST NOT use "Video" or "Videos". Focus on secondary features, target audience, or unique selling point using fresh vocabulary.

3. keywords (100 chars): Comma-separated, NO spaces after commas. Include ONLY words that are NOT already in appName or subtitle. Every word must be unique. Use singular forms. Include common misspellings and synonyms.

4. VALIDATION CHECK: Before returning, verify that NO word appears in more than one field. Words like "video/videos", "create/creating", "edit/editor" count as the same word.

5. description (4000 chars):
   - First 3 lines are crucial (visible before "Read More") — put key value proposition and keywords here
   - Use short paragraphs (2-3 sentences max)
   - Include social proof if applicable
   - End with clear call-to-action

6. whatsNew (4000 chars): Write a well-structured release notes section with:
   - Brief intro sentence
   - "New Features:" section with bullet points using • character
   - "Improvements:" section with bullet points
   - "Bug Fixes:" section with bullet points
   - Short closing sentence thanking users
   Make it scannable and professional.

- Respect character limits strictly
- Return ONLY valid JSON, no markdown fences`,
    model: 'gpt-4o-mini',
    temperature: 0.7,
  },

  // Android/Google Play metadata generation
  android_metadata_generation: {
    systemMessage: 'You are an ASO expert for Google Play. Return only valid JSON.',
    userTemplate: `You are an expert ASO (App Store Optimization) copywriter. Generate optimized Google Play (Android) metadata.

App Name: "{{appName}}"
Brief Description: "{{briefDescription}}"{{keywordsLine}}

IMPORTANT: Generate all metadata in English (en-US), regardless of the language of the app name or description provided.

Return a JSON object with these fields: {{fieldsDescription}}

Google Play ASO Best Practices — FOLLOW STRICTLY:

1. appName (30 chars): Format as "{{appName}} - [Key Benefit Phrase]" or "{{appName}}: [Key Benefit Phrase]". Keep it natural and readable.

2. shortDescription (80 chars): This is the most important field! It's visible without expanding. Write a compelling one-liner that:
   - Summarizes the core value proposition
   - Includes primary keywords naturally
   - Creates urgency or highlights unique benefits
   - Reads like a tagline, not a keyword list

3. fullDescription (4000 chars):
   - First 2-3 lines are crucial (visible before "Read More")
   - Use short paragraphs (2-3 sentences max)
   - Include bullet points with ✓ or • for features
   - Add keywords naturally throughout (Google indexes the full text!)
   - Include social proof if applicable
   - End with clear call-to-action and download prompt

4. whatsNew (500 chars): Keep it concise! Use:
   - Quick intro line
   - 2-4 bullet points (• character) for key changes
   - Brief closing

- Respect character limits strictly
- Return ONLY valid JSON, no markdown fences`,
    model: 'gpt-4o-mini',
    temperature: 0.7,
  },

  android_metadata_fix: {
    systemMessage: 'You are an ASO expert for Google Play. Return only valid JSON. Every field MUST respect its character limit.',
    userTemplate: `These generated Google Play ASO fields exceed character limits. Rewrite ONLY these fields to fit.

App name: "{{appName}}"
{{keywordsLine}}

Fields to fix:
{{fixList}}

Rules:
- Keep app name "{{appName}}" in appName
- Incorporate keywords naturally
- Stay marketing-friendly
- Return ONLY valid JSON with just the fixed fields`,
    model: 'gpt-4o-mini',
    temperature: 0.3,
  },

  android_metadata_translation: {
    systemMessage: 'You are a professional ASO translator for Google Play. Return only valid JSON. Every field MUST respect its character limit.',
    userTemplate: `Translate this Google Play (Android) metadata from {{sourceLanguage}} to {{targetLanguage}}.

App name: "{{appName}}"{{keywordsContext}}

Current metadata:
{{metadata}}

Rules:
- Adapt the marketing tone to the target culture
- STRICTLY respect character limits: {{fieldsDescription}}
- The app name "{{appName}}" MUST remain in appName field
- For short fields (appName, shortDescription): if the direct translation exceeds the limit, rewrite it shorter
- fullDescription: maintain bullet points and formatting
- whatsNew: keep it very concise (500 chars max)
- Return ONLY valid JSON with the same field names`,
    model: 'gpt-4o-mini',
    temperature: 0.3,
  },

  android_metadata_translation_fix: {
    systemMessage: 'You are a professional ASO translator for Google Play. Return only valid JSON. Every field MUST respect its character limit.',
    userTemplate: `The following translated fields exceed their character limits. Rewrite ONLY these fields to fit within limits.

App name: "{{appName}}"{{keywordsContext}}

Fields to fix:
{{fixList}}

Rules:
- Keep the app name "{{appName}}" in the appName field
- Keep it marketing-friendly and natural in {{targetLanguage}}
- Return ONLY valid JSON with just the fixed fields`,
    model: 'gpt-4o-mini',
    temperature: 0.2,
  },

  metadata_fix: {
    systemMessage: 'You are an ASO expert. Return only valid JSON. Every field MUST respect its character limit.',
    userTemplate: `These generated ASO fields exceed character limits. Rewrite ONLY these fields to fit.

App name: "{{appName}}"
{{keywordsLine}}

Fields to fix:
{{fixList}}

Rules:
- Keep app name "{{appName}}" in appName
- Incorporate keywords naturally
- Stay marketing-friendly
- Return ONLY valid JSON with just the fixed fields`,
    model: 'gpt-4o-mini',
    temperature: 0.3,
  },

  headlines_translation: {
    systemMessage: `You are a professional translator for App Store screenshots. Translate the following texts to {{targetLanguage}}.

IMPORTANT RULES:
1. Keep translations EXTREMELY SHORT - maximum 5-7 words per headline! These appear on mobile screenshots with limited space.
2. If a direct translation is too long, REWRITE it shorter while keeping the same meaning. Brevity is more important than literal accuracy.
3. PRESERVE all [brackets] around text - these mark highlighted words
4. PRESERVE the | character for line breaks
5. Keep numbers and special characters as-is
6. Return ONLY the translations, one per line, in the exact same order
7. Do not add numbers, quotes, or any other formatting
8. For short promotional phrases, keep them punchy and marketing-style`,
    userTemplate: '{{headlines}}',
    model: 'gpt-4o-mini',
    temperature: 0.3,
  },

  metadata_translation: {
    systemMessage: 'You are a professional ASO translator. Return only valid JSON. Every field MUST respect its character limit.',
    userTemplate: `Translate this App Store (iOS) metadata from {{sourceLanguage}} to {{targetLanguage}}.

App name: "{{appName}}"{{keywordsContext}}

Current metadata:
{{metadata}}

Rules:
- Adapt the marketing tone to the target culture
- STRICTLY respect character limits: {{fieldsDescription}}
- The app name "{{appName}}" MUST remain in appName field
- For short fields (appName, subtitle): if the direct translation exceeds the limit, rewrite it shorter
- Incorporate target keywords naturally
- For keywords: use equivalent search terms in the target language, comma-separated, no spaces
- Return ONLY valid JSON with the same field names`,
    model: 'gpt-4o-mini',
    temperature: 0.3,
  },

  metadata_translation_fix: {
    systemMessage: 'You are a professional ASO translator. Return only valid JSON. Every field MUST respect its character limit.',
    userTemplate: `The following translated fields exceed their character limits. Rewrite ONLY these fields to fit within limits.

App name: "{{appName}}"{{keywordsContext}}

Fields to fix:
{{fixList}}

Rules:
- Keep the app name "{{appName}}" in the appName field
- Keep it marketing-friendly and natural in {{targetLanguage}}
- Return ONLY valid JSON with just the fixed fields`,
    model: 'gpt-4o-mini',
    temperature: 0.2,
  },

  icon_generation: {
    systemMessage: '',
    userTemplate: `Create a modern professional iOS app icon for "{{appName}}".
The app is: {{briefDescription}}.
Style: Clean, minimal, simple recognizable symbol.
Use a {{toneAdjective}} color palette.
No text or letters. Square format.`,
    model: 'dall-e-3',
    temperature: 0,
  },
};

// Cache for loaded prompts
let promptsCache: Map<string, PromptConfig> | null = null;
let cacheLoadTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get a prompt configuration from DB with fallback to defaults
 */
export async function getPrompt(prisma: PrismaClient, key: string): Promise<PromptConfig> {
  // Refresh cache if expired
  if (!promptsCache || Date.now() - cacheLoadTime > CACHE_TTL) {
    await refreshPromptsCache(prisma);
  }

  const cached = promptsCache?.get(key);
  if (cached) {
    return cached;
  }

  // Fallback to default
  const defaultPrompt = DEFAULT_PROMPTS[key];
  if (defaultPrompt) {
    return defaultPrompt;
  }

  throw new Error(`Prompt not found: ${key}`);
}

/**
 * Refresh the prompts cache from DB
 */
export async function refreshPromptsCache(prisma: PrismaClient): Promise<void> {
  try {
    const dbPrompts = await prisma.adminPrompt.findMany({
      where: { isActive: true },
    });

    promptsCache = new Map();

    // Load DB prompts
    for (const prompt of dbPrompts) {
      promptsCache.set(prompt.key, {
        systemMessage: prompt.systemMessage,
        userTemplate: prompt.userTemplate,
        model: prompt.model,
        temperature: prompt.temperature,
      });
    }

    // Fill in missing prompts with defaults
    for (const [key, defaultPrompt] of Object.entries(DEFAULT_PROMPTS)) {
      if (!promptsCache.has(key)) {
        promptsCache.set(key, defaultPrompt);
      }
    }

    cacheLoadTime = Date.now();
  } catch (error) {
    // On error, use defaults
    console.error('Failed to load prompts from DB:', error);
    promptsCache = new Map(Object.entries(DEFAULT_PROMPTS));
    cacheLoadTime = Date.now();
  }
}

/**
 * Clear the prompts cache (useful after admin edits)
 */
export function clearPromptsCache(): void {
  promptsCache = null;
  cacheLoadTime = 0;
}

/**
 * Replace template variables in a prompt
 */
export function renderPrompt(template: string, variables: Record<string, string | number>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
  }
  return result;
}
