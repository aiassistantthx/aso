import { FastifyInstance } from 'fastify';
import OpenAI from 'openai';

export default async function translateRoutes(fastify: FastifyInstance) {
  const openaiKey = process.env.OPENAI_API_KEY;
  let openai: OpenAI | null = null;

  if (openaiKey) {
    openai = new OpenAI({ apiKey: openaiKey });
  }

  fastify.post('/api/translate', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    if (!openai) {
      return reply.status(503).send({ error: 'Translation service not configured' });
    }

    const { texts, sourceLanguage, targetLanguages } = request.body as {
      texts: string[];
      sourceLanguage: string;
      targetLanguages: string[];
    };

    if (!texts?.length || !sourceLanguage || !targetLanguages?.length) {
      return reply.status(400).send({ error: 'texts, sourceLanguage, and targetLanguages are required' });
    }

    // Check plan limits
    const subscription = await fastify.prisma.subscription.findUnique({
      where: { userId: request.user.id },
    });

    const plan = subscription?.plan ?? 'FREE';
    if (plan === 'FREE' && targetLanguages.length > 2) {
      return reply.status(403).send({
        error: 'Free plan allows up to 2 target languages. Upgrade to Pro for unlimited.',
        limit: 'targetLanguages',
      });
    }

    const results: Record<string, string[]> = {
      [sourceLanguage]: texts,
    };

    for (const targetLang of targetLanguages) {
      if (targetLang === sourceLanguage) continue;

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a professional translator for App Store screenshots. Translate the following texts to ${targetLang}.

IMPORTANT RULES:
1. Keep translations concise and impactful - they appear as headlines on app screenshots
2. PRESERVE all [brackets] around text - these mark highlighted words. Example: "[Download] Now" → "[Descargar] Ahora"
3. PRESERVE the | character for line breaks. Example: "Create|Videos" → "Crear|Videos"
4. Keep numbers and special characters as-is
5. Return ONLY the translations, one per line, in the exact same order
6. Do not add numbers, quotes, or any other formatting
7. For short promotional phrases, keep them punchy and marketing-style`,
            },
            {
              role: 'user',
              content: texts.join('\n'),
            },
          ],
          temperature: 0.3,
        });

        const translatedContent = response.choices[0]?.message?.content || '';
        const translatedTexts = translatedContent.split('\n').filter((t) => t.trim());
        results[targetLang] = texts.map((original, i) => translatedTexts[i]?.trim() || original);
      } catch (error) {
        fastify.log.error(error, `Translation error for ${targetLang}`);
        results[targetLang] = texts;
      }
    }

    return { translations: results };
  });
}
