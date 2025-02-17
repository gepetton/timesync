// client.js
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { TIME_ANALYSIS_PROMPT } from './prompts';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const schema = {
  type: SchemaType.OBJECT,
  properties: {
    unavailableTimes: {
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
  required: ["unavailableTimes"],
};

const formatExistingTimes = (unavailableSlots = []) => {
  if (!unavailableSlots.length) return "아직 없음";

  return unavailableSlots
    .map(slot => {
      const date = new Date(slot.date);
      return format(date, 'yyyy년 M월 d일 a h시', { locale: ko });
    })
    .join(', ');
};

export async function analyzeTime(message, existingSlots = []) {
  try {
    console.log('🚀 Gemini API 요청:', { message, existingSlots });

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite-preview-02-05",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const formattedExistingTimes = formatExistingTimes(existingSlots);
    // currentDate와 currentTime을 한국 시간 기준으로 얻기
    const currentDate = format(new Date(), 'yyyy년 M월 d일', { locale: ko });
    const currentTime = format(new Date(), 'a h:mm', { locale: ko });

    const prompt = TIME_ANALYSIS_PROMPT
      .replace('{message}', message)
      .replace('{existingTimes}', formattedExistingTimes)
      .replace('{currentDate}', currentDate)
      .replace('{currentTime}', currentTime);


    const result = await model.generateContent(prompt);
    const content = result.response.text();

    console.log('📥 Gemini API 응답:', { content });

    try {
      const parsedContent = JSON.parse(content);
      console.log('✅ 파싱된 응답:', parsedContent);
      return parsedContent;
    } catch (error) {
      console.error('❌ Gemini 응답 파싱 실패:', error);
      return { unavailableTimes: [] };
    }
  } catch (error) {
    console.error('❌ 시간 분석 중 오류 발생:', error);
    return { unavailableTimes: [] };
  }
}