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
  [HolidayTheme.EID_AL_FITR]: 'Create a celebratory Eid al-Fitr greeting',
  [HolidayTheme.EID_AL_ADHA]: 'Create a meaningful Eid al-Adha greeting',
  [HolidayTheme.RAMADAN]: 'Create a blessed Ramadan greeting',
  [HolidayTheme.CHINESE_NEW_YEAR]: 'Create a prosperous Chinese New Year greeting',
  [HolidayTheme.DIWALI]: 'Create a bright and festive Diwali greeting',
  [HolidayTheme.LUNAR_NEW_YEAR]: 'Create a prosperous Lunar New Year greeting',
  [HolidayTheme.THANK_YOU]: 'Create a heartfelt thank you message',
  [HolidayTheme.CONGRATULATIONS]: 'Create an enthusiastic congratulations message',
};

export async function generateMessages(
  request: MessageGenerationRequest,
  apiKey: string
): Promise<MessageGenerationResponse> {
  const openai = new OpenAI({ apiKey });
  const { recipients, theme, senderName, targetWordCount = 50, creativity = 0.5 } = request;

  // Map creativity (0-1) to temperature (0.3-1.2)
  const temperature = 0.3 + (creativity * 0.9);
  // Calculate max tokens based on target word count (approx 2.5 tokens per word)
  const maxTokens = Math.ceil(targetWordCount * 2.5);

  const holidayPrompt = HOLIDAY_PROMPTS[theme];
  const recipientsWithMessages: RecipientWithMessage[] = [];

  // Generate messages for each recipient
  for (const recipient of recipients) {
    try {
      const senderInfo = senderName ? `\nFrom: ${senderName}` : '';
      const prompt = `${holidayPrompt} for ${recipient.name}.${senderInfo}

Guidance: ${recipient.messageGuidance}

Requirements:
- Make it personal and warm
- Keep the message approximately ${targetWordCount} words in length
- Focus on the person and the guidance provided
- Use appropriate tone for the holiday
- Make it feel genuine and heartfelt
${senderName ? `- The message is from "${senderName}" - you may reference this naturally but don't end with a signature line (the video will show the sender separately)` : ''}

Return ONLY the message text, no additional commentary.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
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
        temperature,
        max_tokens: maxTokens
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
