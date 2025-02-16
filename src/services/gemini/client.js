import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { TIME_ANALYSIS_PROMPT } from './prompts';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const schema = {
  type: SchemaType.OBJECT,
  properties: {
    availableTimes: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          start: {
            type: SchemaType.STRING,
            description: "시작 시간 (ISO 8601 형식)",
          },
          end: {
            type: SchemaType.STRING,
            description: "종료 시간 (ISO 8601 형식)",
          },
        },
        required: ["start", "end"],
      },
    },
  },
  required: ["availableTimes"],
};

export async function analyzeTime(message) {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const prompt = TIME_ANALYSIS_PROMPT.replace('{message}', message);
    const result = await model.generateContent(prompt);
    const content = result.response.text();

    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('Gemini 응답 파싱 실패:', error);
      return { availableTimes: [] };
    }
  } catch (error) {
    console.error('시간 분석 중 오류 발생:', error);
    return { availableTimes: [] };
  }
}
