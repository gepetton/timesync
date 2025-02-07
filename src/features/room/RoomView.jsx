import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Calendar from '@/features/calendar/Calendar';
import ChatBot from '@/features/chat/components/ChatBot';
import ShareLink from './ShareLink';
import { eventChannel } from '@/services/eventChannel';
import { FiCalendar, FiMessageSquare, FiUsers, FiClock, FiX, FiShare2, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { getWeek, format, addDays, addHours, addMinutes } from 'date-fns';
import DayView from '@/features/calendar/DayView';
import { ko } from 'date-fns/locale';
import { analyzeTime } from '@/services/deepseek/client';
import { parseAvailability } from '@/shared/utils/roomUtils';

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

function RoomView() {
  const { roomId } = useParams();
  const [roomData, setRoomData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isMessageSending, setIsMessageSending] = useState(false);
  const [messageStatus, setMessageStatus] = useState(null);
  const [testMode, setTestMode] = useState(false);
  const [testScenario, setTestScenario] = useState('success');

  useEffect(() => {
    // 초기 데이터 로드
    const data = JSON.parse(localStorage.getItem(`room_${roomId}`));
    setRoomData(data);
    setLoading(false);

    // 실시간 업데이트 구독
    const unsubscribe = eventChannel.subscribe((event) => {
      if (event.roomId === roomId) {
        setRoomData(event.data);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  const handleDateSelect = (date, type) => {
    const updatedData = { ...roomData };
    
    if (type === 'year') {
      updatedData.timeFrame = 'year';
      updatedData.specificYear = date.getFullYear();
      updatedData.specificMonth = '';
      updatedData.specificWeek = '';
      updatedData.specificDate = '';
      localStorage.setItem(`room_${roomId}`, JSON.stringify(updatedData));
      setRoomData(updatedData);
      eventChannel.publish({
        roomId,
        data: updatedData
      });
    } else if (type === 'week') {
      updatedData.timeFrame = 'week';
      updatedData.specificMonth = date.getMonth() + 1;
      const weekNumber = getWeek(date, { weekStartsOn: 0 });
      const totalWeeks = getWeek(new Date(date.getFullYear(), date.getMonth() + 1, 0), { weekStartsOn: 0 });
      
      if (weekNumber === 1 && date.getMonth() === 11) updatedData.specificWeek = '마지막 주';
      else if (weekNumber === 1) updatedData.specificWeek = '첫째 주';
      else if (weekNumber === 2) updatedData.specificWeek = '둘째 주';
      else if (weekNumber === 3) updatedData.specificWeek = '셋째 주';
      else if (weekNumber === 4) updatedData.specificWeek = '넷째 주';
      else if (weekNumber === totalWeeks) updatedData.specificWeek = '마지막 주';
      else updatedData.specificWeek = `${weekNumber}주차`;
      
      localStorage.setItem(`room_${roomId}`, JSON.stringify(updatedData));
      setRoomData(updatedData);
      
      eventChannel.publish({
        roomId,
        data: updatedData
      });
    } else if (type === 'day') {
      setSelectedDate(date);
      setShowTimeModal(true);
    }
  };

  const handleMessageSend = async () => {
    if (!inputMessage.trim() || isMessageSending) return;

    setIsMessageSending(true);
    setMessageStatus(null);

    // 테스트 모드 감지 (입력 메시지에 특정 키워드가 있는 경우)
    const isTestMode = inputMessage.includes('#test');
    const scenario = inputMessage.split('#test_')[1]?.split(' ')[0] || 'success';

    try {
      // 사용자 메시지 추가
      const userMessage = { role: 'user', content: inputMessage };
      setMessages(prev => [...prev, userMessage]);

      if (isTestMode) {
        // 테스트 모드: 더미 데이터 사용
        if (scenario === 'success') {
          const response = DUMMY_RESPONSES.success;
          const availableSlots = response.content.map(item => ({
            date: item.date,
            type: item.type
          }));

          const updatedRoomData = {
            ...roomData,
            availableSlots: [...(roomData.availableSlots || []), ...availableSlots]
          };
          localStorage.setItem(`room_${roomId}`, JSON.stringify(updatedRoomData));
          setRoomData(updatedRoomData);

          setMessageStatus({ type: 'success' });
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '테스트 성공: 더미 데이터가 추가되었습니다.'
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
        const response = await analyzeTime(inputMessage);
        const availableSlots = parseAvailability(response.content);
        const updatedRoomData = {
          ...roomData,
          availableSlots: [...(roomData.availableSlots || []), ...availableSlots]
        };
        localStorage.setItem(`room_${roomId}`, JSON.stringify(updatedRoomData));
        setRoomData(updatedRoomData);

        setMessageStatus({ type: 'success' });
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.content
        }]);
      }

      setInputMessage('');
      eventChannel.publish({
        roomId,
        data: roomData
      });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50/90 via-white to-indigo-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50/90 via-white to-indigo-50/50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="grid grid-cols-3 items-center">
            <Link to="/" className="pl-0">
              <div className="text-2xl font-extrabold text-indigo-600 tracking-tight drop-shadow-sm hover:text-indigo-700 transition-colors">
                TimeSync
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 text-center">
              {roomData?.title || '모임 일정 조율'}
            </h1>
            <div className="flex items-center justify-end gap-3">
              <div className="flex items-center px-3 py-1.5 bg-indigo-50 text-sm text-indigo-600 rounded-lg">
                <FiUsers className="w-4 h-4 mr-1.5" />
                <span className="font-medium">{roomData?.memberCount}명 참여중</span>
              </div>
              <button
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center px-3 py-1.5 text-sm bg-white border border-gray-200 hover:border-indigo-400 hover:text-indigo-600 text-gray-600 rounded-lg transition-all duration-200"
              >
                <FiShare2 className="w-4 h-4 mr-1.5" />
                <span>공유하기</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 왼쪽: 캘린더 */}
        <div className="w-2/3 p-4 overflow-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <FiCalendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">일정 선택</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {roomData?.timeFrame === 'year' 
                      ? `${roomData.specificYear}년` 
                      : roomData?.timeFrame === 'month' 
                        ? `${roomData.specificYear}년 ${roomData.specificMonth}월`
                        : roomData?.timeFrame === 'week'
                          ? `${roomData.specificMonth}월 ${roomData.specificWeek}`
                          : '날짜를 선택해주세요'}
                  </p>
                </div>
              </div>
              {roomData?.selectedDate && (
                <div className="px-4 py-2 bg-indigo-50 rounded-xl">
                  <span className="text-sm font-medium text-indigo-600">
                    선택된 날짜: {roomData.selectedDate}
                  </span>
                </div>
              )}
            </div>
            <div className="calendar-wrapper rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100">
              <Calendar
                viewType={roomData?.timeFrame || 'year'}
                availableSlots={roomData?.availableSlots}
                startDate={roomData?.specificDate}
                endDate={roomData?.specificDate}
                selectedYear={roomData?.timeFrame === 'year' ? parseInt(roomData.specificYear) : undefined}
                selectedMonth={roomData?.specificMonth ? parseInt(roomData.specificMonth) : undefined}
                selectedWeek={roomData?.specificWeek}
                currentDate={
                  roomData?.timeFrame === 'week' && roomData?.specificMonth ? 
                    new Date(new Date().getFullYear(), parseInt(roomData.specificMonth) - 1) :
                  roomData?.timeFrame === 'year' && roomData?.specificYear ?
                    new Date(parseInt(roomData.specificYear), 0) :
                    new Date()
                }
                onDateSelect={handleDateSelect}
              />
            </div>
          </div>
        </div>

        {/* 오른쪽: 가능한 날짜 & AI 입력 */}
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
                  <li className="text-purple-500">• 테스트: "#test_[시나리오]" 입력 (success/networkError/apiError/parseError)</li>
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
                  {roomData?.availableSlots?.length ? (
                    roomData.availableSlots.map((slot, index) => (
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
      </div>

      {/* 시간대 선택 모달 */}
      {showTimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {format(selectedDate, 'yyyy년 M월 d일', { locale: ko })}
                </h3>
                <button 
                  onClick={() => setShowTimeModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto">
              <DayView
                date={selectedDate}
                availableSlots={roomData?.availableSlots || []}
                startDate={roomData?.specificDate}
                endDate={roomData?.specificDate}
              />
            </div>
          </div>
        </div>
      )}

      {/* 공유 모달 */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">공유하기</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <ShareLink roomId={roomId} roomTitle={roomData?.title} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomView; 