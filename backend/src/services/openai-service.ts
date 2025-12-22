import OpenAI from 'openai';
import { HolidayTheme } from '@card0r/shared';
import type { MessageGenerationRequest, MessageGenerationResponse, RecipientWithMessage } from '@card0r/shared';

const HOLIDAY_PROMPTS: Record<HolidayTheme, string> = {
  [HolidayTheme.CHRISTMAS]: 'Create a warm, festive Christmas greeting',
  [HolidayTheme.NEW_YEAR]: 'Create an inspiring New Year greeting',
  [HolidayTheme.EASTER]: 'Create a joyful Easter greeting',
  [HolidayTheme.VALENTINES_DAY]: 'Create a heartfelt Valentine\'s Day message',
  [HolidayTheme.HALLOWEEN]: 'Create a fun and spooky Halloween greeting',
  [HolidayTheme.THANKSGIVING]: 'Create a grateful Thanksgiving message',
  [HolidayTheme.ROSH_HASHANAH]: 'Create a meaningful Rosh Hashanah greeting (Jewish New Year)',
  [HolidayTheme.HANUKKAH]: 'Create a joyful Hanukkah greeting',
  [HolidayTheme.PASSOVER]: 'Create a thoughtful Passover greeting',
  [HolidayTheme.YOM_KIPPUR]: 'Create a reflective Yom Kippur message',
  [HolidayTheme.EID_AL_FITR]: 'Create a celebratory Eid al-Fitr greeting',
  [HolidayTheme.EID_AL_ADHA]: 'Create a meaningful Eid al-Adha greeting',
  [HolidayTheme.RAMADAN]: 'Create a blessed Ramadan greeting',
  [HolidayTheme.CHINESE_NEW_YEAR]: 'Create a prosperous Chinese New Year greeting',
  [HolidayTheme.DIWALI]: 'Create a bright and festive Diwali greeting',
  [HolidayTheme.LUNAR_NEW_YEAR]: 'Create a prosperous Lunar New Year greeting',
};

export async function generateMessages(
  request: MessageGenerationRequest,
  apiKey: string
): Promise<MessageGenerationResponse> {
  const openai = new OpenAI({ apiKey });
  const { recipients, theme } = request;

  const holidayPrompt = HOLIDAY_PROMPTS[theme];
  const recipientsWithMessages: RecipientWithMessage[] = [];

  // Generate messages for each recipient
  for (const recipient of recipients) {
    try {
      const prompt = `${holidayPrompt} for ${recipient.name}.

Guidance: ${recipient.messageGuidance}

Requirements:
- Make it personal and warm
- Keep it suitable for a 30-second video (approximately 75-100 words when read aloud)
- Focus on the person and the guidance provided
- Use appropriate tone for the holiday
- Make it feel genuine and heartfelt

Return ONLY the message text, no additional commentary.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a creative greeting card writer who creates personalized, heartfelt messages for special occasions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 200
      });

      const generatedMessage = completion.choices[0]?.message?.content?.trim() || '';

      recipientsWithMessages.push({
        ...recipient,
        generatedMessage
      });
    } catch (error) {
      console.error(`Failed to generate message for ${recipient.name}:`, error);
      // Provide a fallback message
      recipientsWithMessages.push({
        ...recipient,
        generatedMessage: `Happy ${theme.replace(/_/g, ' ')}! Wishing you all the best, ${recipient.name}!`
      });
    }
  }

  return { recipients: recipientsWithMessages };
}
