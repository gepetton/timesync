/**
 * 모임 캘린더 컴포넌트
 * 모임의 시간대에 따라 적절한 캘린더 뷰를 표시하고 날짜 선택 기능을 제공합니다.
 */
import { FiCalendar } from 'react-icons/fi';
import Calendar from '@/pages/Calendar/Calendar';
import { useRoomContext } from '@/contexts/RoomContext';
import { TIME_FRAME } from '@/constants/roomTypes';

function RoomCalendar() {
  const {
    room,
    selectedDate,
    handleDateSelect
  } = useRoomContext();

  // 현재 연도 가져오기
  const currentYear = new Date().getFullYear();

  // 캘린더에 표시할 날짜 계산
  const getDisplayDate = () => {
    // selectedMonth가 있으면 해당 월의 1일로 설정
    if (room?.specificMonth) {
      return new Date(currentYear, parseInt(room.specificMonth) - 1, 1);
    }
    // selectedMonth가 없으면 selectedDate 또는 현재 날짜 사용
    return selectedDate || new Date();
  };

  // 시간대 정보 표시 텍스트 생성
  const getTimeFrameText = () => {
    if (!room?.timeFrame) return '날짜를 선택해주세요';
    
    switch (room.timeFrame) {
      case TIME_FRAME.MONTH:
        return `${currentYear}년 ${room.specificMonth}월`;
      case TIME_FRAME.WEEK:
        return `${currentYear}년 ${room.specificMonth}월 ${room.specificWeek}`;
      default:
        return '날짜를 선택해주세요';
    }
  };

  return (
    <div className="w-2/3 p-4 overflow-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300">
        {/* 헤더 영역 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <FiCalendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">일정 선택</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {getTimeFrameText()}
              </p>
            </div>
          </div>
        </div>

        {/* 캘린더 컴포넌트 */}
        <div className="calendar-wrapper rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100">
          <Calendar
            viewType={room?.timeFrame || TIME_FRAME.MONTH}
            selectedMonth={room?.specificMonth ? parseInt(room.specificMonth) : undefined}
            selectedWeek={room?.specificWeek}
            currentDate={getDisplayDate()}
          />
        </div>
      </div>
    </div>
  );
}

export default RoomCalendar;