import { useState, useRef } from 'react';
import { FiMessageSquare, FiCalendar, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useRoomContext } from '@/contexts/RoomContext';
import { analyzeTime } from '@/services/gemini/client';
import { useParams } from 'react-router-dom';

function ChatSection() {
  const { roomId } = useParams();
  const { room, processUnavailableTimes } = useRoomContext();
  const [inputMessage, setInputMessage] = useState('');
  const [isMessageSending, setIsMessageSending] = useState(false);
  const [messageStatus, setMessageStatus] = useState(null);
  
  // 스팸 방지를 위한 상태
  const [lastSentTime, setLastSentTime] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [blockUntil, setBlockUntil] = useState(0);
  const textareaRef = useRef(null);

  // 스팸 방지 검사
  const checkSpamPrevention = () => {
    const now = Date.now();
    
    // 차단 시간이 남아있으면 차단
    if (now < blockUntil) {
      const remainingSeconds = Math.ceil((blockUntil - now) / 1000);
      setMessageStatus({
        type: 'error',
        error: { 
          message: `너무 많은 요청을 보냈습니다.`,
          details: `${remainingSeconds}초 후에 다시 시도해주세요.`
        }
      });
      setTimeout(() => setMessageStatus(null), 3000);
      return false;
    }

    // 5초 이내에 3번 이상 전송 시 30초 차단
    if (now - lastSentTime < 5000) {
      const newCount = messageCount + 1;
      setMessageCount(newCount);
      
      if (newCount >= 3) {
        setBlockUntil(now + 30000); // 30초 차단
        setMessageCount(0);
        setMessageStatus({
          type: 'error',
          error: { 
            message: '너무 빠르게 메시지를 보내고 있습니다.',
            details: '30초 후에 다시 시도해주세요.'
          }
        });
        setTimeout(() => setMessageStatus(null), 5000);
        return false;
      }
    } else {
      // 5초가 지났으면 카운트 리셋
      setMessageCount(1);
    }

    // 1초 이내 연속 전송 방지
    if (now - lastSentTime < 1000) {
      setMessageStatus({
        type: 'error',
        error: { message: '1초에 한 번만 전송할 수 있습니다.' }
      });
      setTimeout(() => setMessageStatus(null), 2000);
      return false;
    }

    setLastSentTime(now);
    return true;
  };

  // 엔터키 처리
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 기본 엔터 동작 방지 (줄바꿈 방지)
      handleMessageSend();
    }
  };

  // 날짜가 선택된 기간에 포함되는지 확인
  const isDateInSelectedPeriod = (dateString) => {
    console.log('🔍 isDateInSelectedPeriod 체크:', {
      dateString,
      timeFrame: room.timeFrame,
      specificMonth: room.specificMonth,
      specificWeek: room.specificWeek
    });

    if (!room.timeFrame || !room.specificMonth) {
      console.log('❌ timeFrame 또는 specificMonth가 없음');
      return false;
    }

    // YYYYMMDD 형식을 YYYY-MM-DD로 변환
    const formattedDate = `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`;
    const date = new Date(formattedDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const currentYear = new Date().getFullYear();

    console.log('📅 날짜 정보:', { formattedDate, year, month, currentYear });

    // 월 체크
    if (room.timeFrame === 'month') {
      const result = year === currentYear && month === parseInt(room.specificMonth);
      console.log('📆 월 체크 결과:', { result, yearMatch: year === currentYear, monthMatch: month === parseInt(room.specificMonth) });
      return result;
    }

    // 주 체크
    if (room.timeFrame === 'week' && room.specificWeek) {
      if (year !== currentYear || month !== parseInt(room.specificMonth)) {
        console.log('❌ 주 체크 - 년도 또는 월이 맞지 않음');
        return false;
      }
      
      // 주차 확인 로직 (간단화)
      const weekNumber = Math.ceil(date.getDate() / 7);
      const weekNames = ['첫째 주', '둘째 주', '셋째 주', '넷째 주', '마지막 주'];
      const selectedWeekIndex = weekNames.indexOf(room.specificWeek);
      
      console.log('📅 주 체크:', { weekNumber, selectedWeekIndex, specificWeek: room.specificWeek });
      
      if (selectedWeekIndex !== -1) {
        const result = weekNumber === selectedWeekIndex + 1;
        console.log('✅ 주 체크 결과:', result);
        return result;
      }
    }

    console.log('❌ 모든 조건 실패');
    return false;
  };

  const handleMessageSend = async () => {
    if (!inputMessage.trim() || isMessageSending) return;

    // 스팸 방지 검사
    if (!checkSpamPrevention()) return;

    setIsMessageSending(true);
    setMessageStatus(null);

    try {
      // 현재 날짜를 기본값으로 사용 (Gemini가 상대적 날짜 해석용)
      const currentDate = new Date();
      
      // Gemini API 호출 - 기존 불가능한 시간대 전달
      const response = await analyzeTime(
        inputMessage, 
        currentDate, 
        room.unavailableSlotsByDate || {}
      );

      let processedCount = 0;

      // 불가능한 시간대가 있으면 처리
      if (response.unavailableSlotsByDate && Object.keys(response.unavailableSlotsByDate).length > 0) {
        // 각 날짜별로 불가능한 시간 구간 처리
        for (const [dateKey, timeSlots] of Object.entries(response.unavailableSlotsByDate)) {
          // 선택된 기간에 포함되는 날짜만 처리
          // 임시로 필터링 비활성화 - 모든 날짜 처리
          // if (isDateInSelectedPeriod(dateKey) && timeSlots && timeSlots.length > 0) {
          if (timeSlots && timeSlots.length > 0) {
            console.log('🚀 날짜 처리 중:', dateKey, timeSlots);
            
            // YYYYMMDD 형식을 YYYY-MM-DD로 변환하여 Date 객체 생성
            const formattedDate = `${dateKey.slice(0, 4)}-${dateKey.slice(4, 6)}-${dateKey.slice(6, 8)}`;
            const date = new Date(formattedDate);
            
            // 유효한 날짜인지 확인
            if (isNaN(date.getTime())) {
              console.error('잘못된 날짜 형식:', dateKey, formattedDate);
              continue;
            }
            
            // 24:00을 23:59로 변환하는 함수
            const normalizeTime = (timeStr) => {
              if (timeStr === '24:00') return '23:59';
              return timeStr;
            };
            
            const unavailableTimes = timeSlots.map(slot => {
              const startTime = normalizeTime(slot.start);
              const endTime = normalizeTime(slot.end);
              
              return {
                start: new Date(`${formattedDate}T${startTime}:00`),
                end: new Date(`${formattedDate}T${endTime}:59`) // 23:59:59까지 포함
              };
            });
            
            console.log('📝 processUnavailableTimes 호출:', { date, unavailableTimes });
            await processUnavailableTimes(date, unavailableTimes);
            processedCount++;
          }
        }
        
        if (processedCount > 0) {
          setMessageStatus({ 
            type: 'success',
            message: `${processedCount}개 날짜의 불가능한 시간이 반영되었습니다.`
          });
        } else {
          setMessageStatus({ 
            type: 'error',
            error: { 
              message: '선택된 기간에 해당하는 날짜가 없습니다.',
              details: `현재 설정: ${room.timeFrame === 'month' ? `${room.specificMonth}월 전체` : `${room.specificMonth}월 ${room.specificWeek}`}`
            }
          });
        }
      } else {
        setMessageStatus({ 
          type: 'error',
          error: { message: '분석할 수 있는 시간 정보가 없습니다. 더 구체적으로 입력해주세요.' }
        });
      }

      setInputMessage('');
      // 포커스를 다시 textarea로 이동
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);

    } catch (error) {
      console.error('메시지 전송 중 오류:', error);
      setMessageStatus({ 
        type: 'error',
        error: {
          message: error.message || '시간 분석 중 오류가 발생했습니다.',
          details: '다시 시도해주세요.'
        }
      });
    } finally {
      setIsMessageSending(false);
      setTimeout(() => {
        setMessageStatus(null);
      }, 5000);
    }
  };

  // 불가능한 시간 구간을 표시용으로 변환
  const getUnavailableTimesList = () => {
    if (!room.unavailableSlotsByDate) return [];
    
    const timesList = [];
    Object.entries(room.unavailableSlotsByDate).forEach(([dateKey, slots]) => {
      if (slots && Array.isArray(slots)) {
        slots.forEach(slot => {
          // YYYYMMDD 형식을 YYYY-MM-DD로 변환하여 Date 객체 생성
          const formattedDate = `${dateKey.slice(0, 4)}-${dateKey.slice(4, 6)}-${dateKey.slice(6, 8)}`;
          timesList.push({
            date: formattedDate,
            dateKey: dateKey,
            startTime: slot.start,
            endTime: slot.end
          });
        });
      }
    });
    
    return timesList.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const unavailableTimesList = getUnavailableTimesList();

  return (
    <div className="w-1/3 border-l border-gray-100 bg-white">
      <div className="h-full flex flex-col">
        {/* AI 도우미 안내 */}
        <div className="p-4 border-b border-gray-100">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                <FiMessageSquare className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-semibold text-indigo-900">AI 도우미</h3>
            </div>
            <ul className="text-sm text-indigo-700 space-y-2">
              <li>• 자연어로 가능한 시간을 입력해보세요. (예: "다음 주 월요일 오후 2시 가능해요")</li>
              <li>• 불가능한 시간도 알려주세요. (예: "이번 주 금요일은 회의가 있어서 안돼요")</li>
              <li>• AI가 자동으로 일정을 분석하고 캘린더에 반영해드립니다.</li>
            </ul>
          </div>
        </div>

        {/* AI 입력 섹션 */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <textarea
              ref={textareaRef}
              className={`
                w-full px-4 py-3 rounded-xl border transition-all resize-none text-sm
                ${messageStatus?.type === 'success' ? 'border-green-300 focus:ring-green-200 focus:border-green-400' :
                  messageStatus?.type === 'error' ? 'border-red-300 focus:ring-red-200 focus:border-red-400' :
                  'border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400'}
              `}
              rows="3"
              placeholder="가능하거나 불가능한 날짜 정보를 AI에게 알려주세요!"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isMessageSending}
              maxLength={500} // 최대 글자 수 제한
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              {/* 글자 수 표시 */}
              <div className="text-xs text-gray-400">
                {inputMessage.length}/500
              </div>
              {messageStatus && (
                <div className={`
                  flex flex-col gap-1 px-2 py-1 rounded-lg text-sm max-w-[200px]
                  ${messageStatus.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}
                `}>
                  {messageStatus.type === 'success' ? (
                    <div className="flex items-center gap-1">
                      <FiCheck className="w-4 h-4 shrink-0" />
                      <span>반영완료</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        <FiAlertCircle className="w-4 h-4 shrink-0" />
                        <span>오류</span>
                      </div>
                      {messageStatus.error && (
                        <div className="text-xs text-red-500 break-words">
                          {messageStatus.error.message}
                          {messageStatus.error.details && (
                            <div className="mt-1 text-red-400">
                              {messageStatus.error.details}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              <button
                className={`
                  p-2 rounded-lg transition-colors
                  ${isMessageSending ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
                  text-white
                `}
                onClick={handleMessageSend}
                disabled={isMessageSending || !inputMessage.trim()}
              >
                {isMessageSending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiMessageSquare className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 불가능한 시간 목록
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <FiCalendar className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">불가능한 시간</h2>
            </div>
            <div className="space-y-2">
              {unavailableTimesList.length ? (
                unavailableTimesList.map((slot, index) => (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-red-100 hover:border-red-300 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {format(new Date(slot.date), 'yyyy년 M월 d일 (eee)', { locale: ko })}
                    </div>
                    <div className="text-sm text-red-600">
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  아직 선택된 날짜가 없습니다
                </div>
              )}
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default ChatSection; 