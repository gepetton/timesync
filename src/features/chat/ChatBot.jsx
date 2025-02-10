import { useState } from 'react';
import { analyzeTime } from '@/services/deepseek/client';
import { parseAvailability } from '@/shared/utils/roomUtils';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { FiMessageSquare, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { addHours, getWeek, endOfMonth } from 'date-fns';

// 테스트용 더미 데이터
const DUMMY_RESPONSES = {
  success: {
    content: [
      {
        date: new Date(),
        type: 'available',
        message: '이 시간 가능합니다.'
      },
      {
        date: addHours(new Date(), 2),
        type: 'available',
        message: '이 시간도 가능합니다.'
      }
    ]
  },
  networkError: {
    error: new Error('네트워크 연결에 실패했습니다.'),
    code: 'NETWORK_ERROR',
    details: 'API 서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.'
  },
  apiError: {
    error: new Error('API 호출 중 오류가 발생했습니다.'),
    code: 'API_ERROR',
    details: '요청한 작업을 처리하는 중에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
  },
  parseError: {
    error: new Error('응답 데이터 파싱 중 오류가 발생했습니다.'),
    code: 'PARSE_ERROR',
    details: '서버 응답을 처리하는 중에 문제가 발생했습니다. 입력 형식을 확인해주세요.'
  }
};

// 날짜가 선택된 기간 내에 있는지 확인하는 함수
const isDateInRange = (date, roomData) => {
  if (!roomData) return false;

  const targetDate = new Date(date);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const weekNumber = getWeek(targetDate, { weekStartsOn: 0 });

  // 연도 체크
  if (roomData.timeFrame === 'year' && roomData.specificYear) {
    return year === parseInt(roomData.specificYear);
  }

  // 월 체크
  if (roomData.timeFrame === 'month' && roomData.specificMonth) {
    return year === new Date().getFullYear() && month === parseInt(roomData.specificMonth);
  }

  // 주 체크
  if (roomData.timeFrame === 'week' && roomData.specificWeek) {
    if (month !== parseInt(roomData.specificMonth)) return false;
    
    // 주차 비교 로직
    const weekLabel = roomData.specificWeek;
    if (weekLabel === '첫째 주' && weekNumber === 1) return true;
    if (weekLabel === '둘째 주' && weekNumber === 2) return true;
    if (weekLabel === '셋째 주' && weekNumber === 3) return true;
    if (weekLabel === '넷째 주' && weekNumber === 4) return true;
    if (weekLabel === '마지막 주' && weekNumber === getWeek(endOfMonth(targetDate), { weekStartsOn: 0 })) return true;
    if (weekLabel === `${weekNumber}주차`) return true;
  }

  return false;
};

function ChatBot({ messages, setMessages, roomData, onUpdateRoom }) {
  const [inputMessage, setInputMessage] = useState('');
  const [isMessageSending, setIsMessageSending] = useState(false);
  const [messageStatus, setMessageStatus] = useState(null);

  const handleSend = async (input) => {
    if (!input.trim() || isMessageSending) return;

    setIsMessageSending(true);
    setMessageStatus(null);

    // 테스트 모드 감지
    const isTestMode = input.includes('#test');
    const scenario = input.split('#test_')[1]?.split(' ')[0] || 'success';

    try {
      // 사용자 메시지 추가
      const userMessage = { role: 'user', content: input };
      setMessages(prev => [...prev, userMessage]);

      let newAvailableSlots = [];

      if (isTestMode) {
        // 테스트 모드: 더미 데이터 사용
        if (scenario === 'success') {
          const response = DUMMY_RESPONSES.success;
          // 선택된 기간 내의 날짜만 필터링
          newAvailableSlots = response.content
            .filter(item => isDateInRange(item.date, roomData))
            .map(item => ({
              date: item.date,
              type: item.type
            }));

          if (newAvailableSlots.length === 0) {
            throw {
              message: '선택된 기간 내에 가능한 날짜가 없습니다.',
              code: 'NO_DATES_IN_RANGE',
              response: { data: { message: '다른 기간을 선택하거나 다른 날짜를 입력해주세요.' } }
            };
          }

          const updatedRoomData = {
            ...roomData,
            availableSlots: [...(roomData.availableSlots || []), ...newAvailableSlots]
          };
          onUpdateRoom(updatedRoomData);

          setMessageStatus({ type: 'success' });
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `테스트 성공: ${newAvailableSlots.length}개의 가능한 시간이 추가되었습니다.`
          }]);
        } else {
          // 에러 시나리오 테스트
          const errorData = DUMMY_RESPONSES[scenario] || DUMMY_RESPONSES.networkError;
          throw {
            message: errorData.error.message,
            code: errorData.code,
            response: { data: { message: errorData.details } }
          };
        }
      } else {
        // 실제 API 호출
        const response = await analyzeTime(input);
        // 선택된 기간 내의 날짜만 필터링
        newAvailableSlots = parseAvailability(response.content)
          .filter(slot => isDateInRange(slot.date, roomData));

        if (newAvailableSlots.length === 0) {
          throw {
            message: '선택된 기간 내에 가능한 날짜가 없습니다.',
            code: 'NO_DATES_IN_RANGE',
            response: { data: { message: '다른 기간을 선택하거나 다른 날짜를 입력해주세요.' } }
          };
        }

        const updatedRoomData = {
          ...roomData,
          availableSlots: [...(roomData.availableSlots || []), ...newAvailableSlots]
        };
        onUpdateRoom(updatedRoomData);

        setMessageStatus({ type: 'success' });
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.content
        }]);
      }

      setInputMessage('');

    } catch (error) {
      console.error('메시지 전송 중 오류:', error);
      setMessageStatus({ 
        type: 'error',
        error: {
          message: error.message,
          code: error.code,
          details: error.response?.data?.message || '알 수 없는 오류가 발생했습니다.'
        }
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '죄송합니다. ' + (error.code === 'NO_DATES_IN_RANGE' 
          ? '선택된 기간 내에 가능한 날짜가 없습니다.' 
          : '시간 분석 중 오류가 발생했습니다.')
      }]);
    } finally {
      setIsMessageSending(false);
      setTimeout(() => {
        setMessageStatus(null);
      }, 10000);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* AI 도우미 안내 */}
      <div className="p-4 border-b border-gray-100">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
              <FiMessageSquare className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-semibold text-indigo-900">AI 도우미 안내</h3>
          </div>
          <ul className="text-sm text-indigo-700 space-y-2">
            <li>• 자연어로 가능한 시간을 입력해보세요. (예: "다음 주 월요일 오후 2시 가능해요")</li>
            <li>• 불가능한 시간도 알려주세요. (예: "이번 주 금요일은 회의가 있어서 안돼요")</li>
            <li>• AI가 자동으로 일정을 분석하고 캘린더에 반영해드립니다.</li>
            <li className="text-purple-500">• 테스트: "#test_[시나리오]" 입력 (success/networkError/apiError/parseError)</li>
          </ul>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4">
        <ChatMessages messages={messages} />
      </div>

      {/* 입력 섹션 */}
      <div className="p-4 border-t border-gray-100">
        <div className="relative">
          <textarea
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
            disabled={isMessageSending}
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            {messageStatus && (
              <div className={`
                flex flex-col gap-1 px-2 py-1 rounded-lg text-sm max-w-[200px]
                ${messageStatus.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}
              `}>
                {messageStatus.type === 'success' ? (
                  <div className="flex items-center gap-1">
                    <FiCheck className="w-4 h-4 shrink-0" />
                    <span>전송완료</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1">
                      <FiAlertCircle className="w-4 h-4 shrink-0" />
                      <span>전송실패</span>
                    </div>
                    {messageStatus.error && (
                      <div className="text-xs text-red-500 break-words">
                        {messageStatus.error.message}
                        {messageStatus.error.code && (
                          <div className="mt-1 font-mono">
                            Error Code: {messageStatus.error.code}
                          </div>
                        )}
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
              onClick={() => handleSend(inputMessage)}
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
    </div>
  );
}

export default ChatBot; 