/**
 * 캘린더 섹션 컴포넌트
 * 
 * 모임의 일정을 선택하고 표시하는 캘린더 영역을 담당합니다.
 * 선택된 시간대(연/월/주/일)에 따라 다른 뷰를 보여주며,
 * 사용자가 선택한 날짜와 가능한 시간대를 시각적으로 표시합니다.
 * 
 * @param {Object} props
 * @param {Object} props.roomData - 모임 데이터 객체
 * @param {Date} props.selectedDate - 현재 선택된 날짜
 * @param {Function} props.onDateSelect - 날짜 선택 시 호출되는 콜백 함수
 */

import { FiCalendar } from 'react-icons/fi';
import Calendar from '@/features/calendar/Calendar';
import { TIME_FRAME } from '@/constants/roomTypes';

function CalendarSection({ 
  roomData,           // 모임 정보를 담고 있는 객체
  selectedDate,       // 현재 선택된 날짜
  onDateSelect        // 날짜 선택 이벤트 핸들러
}) {
  return (
    // 캘린더 섹션 전체 컨테이너
    <div className="w-2/3 p-4 overflow-auto">
      {/* 캘린더 카드 - 그림자와 애니메이션 효과 적용 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300">
        {/* 헤더 영역 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* 캘린더 아이콘 - 그라디언트 배경 적용 */}
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <FiCalendar className="w-5 h-5 text-white" />
            </div>
            {/* 제목과 현재 선택된 시간대 표시 */}
            <div>
              <h2 className="text-xl font-bold text-gray-900">일정 선택</h2>
              {/* 선택된 시간대에 따라 다른 형식으로 날짜 표시 */}
              <p className="text-sm text-gray-500 mt-0.5">
                {roomData?.timeFrame === TIME_FRAME.YEAR 
                  ? `${roomData.specificYear}년` 
                  : roomData?.timeFrame === TIME_FRAME.MONTH 
                    ? `${roomData.specificYear || new Date().getFullYear()}년 ${roomData.specificMonth}월`
                    : roomData?.timeFrame === TIME_FRAME.WEEK
                      ? `${roomData.specificYear || new Date().getFullYear()}년 ${roomData.specificMonth}월 ${roomData.specificWeek}`
                      : '날짜를 선택해주세요'}
              </p>
            </div>
          </div>
        </div>
        {/* 캘린더 컴포넌트 래퍼 */}
        <div className="calendar-wrapper rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100">
          {/* 
            캘린더 컴포넌트
            - viewType: 현재 선택된 시간대 뷰 (연/월/주/일)
            - availableSlots: 참여 가능한 시간대 목록
            - startDate/endDate: 선택 가능한 날짜 범위
            - selectedYear/Month/Week: 현재 선택된 연/월/주 정보
            - currentDate: 현재 선택된 날짜
            - onDateSelect: 날짜 선택 시 호출되는 콜백
          */}
          <Calendar
            viewType={roomData?.timeFrame || TIME_FRAME.YEAR}
            availableSlots={roomData?.availableSlots}
            startDate={roomData?.specificDate}
            endDate={roomData?.specificDate}
            selectedYear={roomData?.timeFrame === TIME_FRAME.YEAR ? parseInt(roomData.specificYear) : undefined}
            selectedMonth={roomData?.specificMonth ? parseInt(roomData.specificMonth) : undefined}
            selectedWeek={roomData?.specificWeek}
            currentDate={selectedDate}
            onDateSelect={onDateSelect}
          />
        </div>
      </div>
    </div>
  );
}

export default CalendarSection; 