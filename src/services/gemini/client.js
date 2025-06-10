// client.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TIME_ANALYSIS_PROMPT } from './prompts';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const formatExistingTimes = (unavailableSlotsByDate = {}) => {
  const entries = Object.entries(unavailableSlotsByDate);
  if (!entries.length) return "아직 없음";

  return entries
    .map(([date, slots]) => {
      const formattedSlots = slots.map(slot => `${slot.start}-${slot.end}`).join(', ');
      return `${date}: ${formattedSlots}`;
    })
    .join(' | ');
};

export async function analyzeTime(message, selectedDate, existingSlotsByDate = {}) {
  try {
    console.log('🚀 Gemini API 요청:', { message, selectedDate, existingSlotsByDate });

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite-preview-02-05",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000,
        responseMimeType: "application/json",
      },
    });

    const formattedExistingTimes = formatExistingTimes(existingSlotsByDate);
    const currentDate = format(new Date(), 'yyyy년 M월 d일', { locale: ko });
    const currentTime = format(new Date(), 'a h:mm', { locale: ko });
    const targetDate = format(selectedDate, 'yyyy년 M월 d일', { locale: ko });

    const prompt = TIME_ANALYSIS_PROMPT
      .replace('{message}', message)
      .replace('{existingTimes}', formattedExistingTimes)
      .replace('{currentDate}', currentDate)
      .replace('{currentTime}', currentTime)
      .replace('{targetDate}', targetDate);

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    console.log('📥 Gemini API 응답:', { content });

    try {
      const parsedContent = JSON.parse(content);
      console.log('✅ 파싱된 응답:', parsedContent);
      
      // 응답 검증 및 안전 처리
      if (!parsedContent || typeof parsedContent !== 'object') {
        console.warn('⚠️ 잘못된 응답 형식:', parsedContent);
        return { unavailableSlotsByDate: {} };
      }
      
      if (!parsedContent.unavailableSlotsByDate || typeof parsedContent.unavailableSlotsByDate !== 'object') {
        console.warn('⚠️ unavailableSlotsByDate가 없거나 잘못된 형식:', parsedContent);
        return { unavailableSlotsByDate: {} };
      }
      
      return parsedContent;
    } catch (error) {
      console.error('❌ Gemini 응답 파싱 실패:', error);
      return { unavailableSlotsByDate: {} };
    }
  } catch (error) {
    console.error('❌ 시간 분석 중 오류 발생:', error);
    
    // 네트워크 오류나 API 키 문제 등을 구분하여 처리
    if (error.message?.includes('API key')) {
      throw new Error('API 키가 올바르지 않습니다. 환경 변수를 확인해주세요.');
    } else if (error.message?.includes('quota')) {
      throw new Error('API 사용량 한도를 초과했습니다.');
    } else if (error.message?.includes('400')) {
      throw new Error('요청 형식이 올바르지 않습니다.');
    } else {
      throw new Error('시간 분석 서비스에 일시적인 문제가 발생했습니다.');
    }
  }
}
