import { TIME_ANALYSIS_PROMPT } from './prompts';

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function analyzeTime(message) {
  try {
    const prompt = TIME_ANALYSIS_PROMPT.replace('{message}', message);

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error('DeepSeek API 요청 실패');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('DeepSeek 응답 파싱 실패:', error);
      return { availableTimes: [] };
    }
  } catch (error) {
    console.error('시간 분석 중 오류 발생:', error);
    return { availableTimes: [] };
  }
}
