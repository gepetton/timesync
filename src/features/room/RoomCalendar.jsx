/**
 * 모임 캘린더 컴포넌트
 * 
 * 모임 방에서 사용되는 메인 캘린더 컴포넌트입니다.
 * RoomContext를 통해 모임 데이터와 상태를 관리하며,
 * 사용자가 선택한 시간대에 따라 적절한 캘린더 뷰를 표시합니다.
 * 
 * 주요 기능:
 * - 모임의 시간대(연/월/주/일)에 따른 캘린더 뷰 표시
 * - 참여 가능한 시간대 시각화
 * - 날짜 선택 기능
 */

import { FiCalendar } from 'react-icons/fi';
import Calendar from '@/features/calendar/Calendar';
import { useRoomContext } from '@/contexts/RoomContext';
import { TIME_FRAME } from '@/constants/roomTypes';

function RoomCalendar() {
  // RoomContext에서 필요한 상태와 핸들러를 가져옵니다
  const { 
    room,             // 현재 모임 정보
    selectedDate,     // 선택된 날짜
    handleDateSelect  // 날짜 선택 이벤트 핸들러
  } = useRoomContext();

  return (
    // 캘린더 섹션 전체 컨테이너
    <div className="w-2/3 p-4 overflow-auto">
      {/* 캘린더 카드 - 그림자와 애니메이션 효과 적용 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300">
        {/* 헤더 영역 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* 캘린더 아이콘 - 그라디언트 배경과 그림자 효과 */}
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <FiCalendar className="w-5 h-5 text-white" />
            </div>
            {/* 제목과 현재 선택된 시간대 정보 */}
            <div>
              <h2 className="text-xl font-bold text-gray-900">일정 선택</h2>
              {/* 시간대에 따른 동적 텍스트 표시 */}
              <p className="text-sm text-gray-500 mt-0.5">
                {room?.timeFrame === TIME_FRAME.YEAR 
                  ? `${room.specificYear}년` 
                  : room?.timeFrame === TIME_FRAME.MONTH 
                    ? `${room.specificYear || new Date().getFullYear()}년 ${room.specificMonth}월`
                    : room?.timeFrame === TIME_FRAME.WEEK
                      ? `${room.specificYear || new Date().getFullYear()}년 ${room.specificMonth}월 ${room.specificWeek}`
                      : '날짜를 선택해주세요'}
              </p>
            </div>
          </div>
        </div>
        {/* 캘린더 컴포넌트 래퍼 */}
        <div className="calendar-wrapper rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100">
          {/* 
            캘린더 컴포넌트
            - viewType: 현재 선택된 시간대 뷰 타입 (기본값: 연간 뷰)
            - availableSlots: 참여자들이 선택 가능한 시간대 목록
            - startDate/endDate: 선택 가능한 날짜 범위 설정
            - selectedYear/Month/Week: 현재 선택된 연도, 월, 주 정보
            - currentDate: 현재 선택된 날짜
            - onDateSelect: 날짜 선택 시 실행되는 콜백 함수
          */}
          <Calendar
            viewType={room?.timeFrame || TIME_FRAME.YEAR}
            availableSlots={room?.availableSlots}
            startDate={room?.specificDate}
            endDate={room?.specificDate}
            selectedYear={room?.timeFrame === TIME_FRAME.YEAR ? parseInt(room.specificYear) : undefined}
            selectedMonth={room?.specificMonth ? parseInt(room.specificMonth) : undefined}
            selectedWeek={room?.specificWeek}
            currentDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>
      </div>
    </div>
  );
}

export default RoomCalendar; 