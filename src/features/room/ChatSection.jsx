import { useState } from 'react';
import { FiMessageSquare, FiCalendar, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useRoomContext } from '@/contexts/RoomContext';
import { analyzeTime } from '@/services/deepseek/client';
import { parseAvailability } from '@/shared/utils/roomUtils';

function ChatSection() {
  const { room, updateRoom, messages, setMessages } = useRoomContext();
  const [inputMessage, setInputMessage] = useState('');
  const [isMessageSending, setIsMessageSending] = useState(false);
  const [messageStatus, setMessageStatus] = useState(null);

  const handleMessageSend = async () => {
    if (!inputMessage.trim() || isMessageSending) return;

    setIsMessageSending(true);
    setMessageStatus(null);

    try {
      // 사용자 메시지 추가
      const userMessage = { role: 'user', content: inputMessage };
      setMessages(prev => [...prev, userMessage]);

      // API 호출
      const response = await analyzeTime(inputMessage);
      const availableSlots = parseAvailability(response.content);
      
      updateRoom({
        availableSlots: [...(room.availableSlots || []), ...availableSlots]
      });

      setMessageStatus({ type: 'success' });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.content
      }]);

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
        content: '죄송합니다. 시간 분석 중 오류가 발생했습니다.'
      }]);
    } finally {
      setIsMessageSending(false);
      setTimeout(() => {
        setMessageStatus(null);
      }, 10000);
    }
  };

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
              <h3 className="font-semibold text-indigo-900">AI 도우미 안내</h3>
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

        {/* 가능한 날짜 카드 */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FiCalendar className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">가능한 날짜</h2>
            </div>
            <div className="space-y-2">
              {room?.availableSlots?.length ? (
                room.availableSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-indigo-100 hover:border-indigo-300 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {format(new Date(slot.date), 'yyyy년 M월 d일 (eee)', { locale: ko })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(slot.date), 'a h:mm', { locale: ko })}
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
        </div>
      </div>
    </div>
  );
}

export default ChatSection; 