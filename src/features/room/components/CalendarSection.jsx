import { FiCalendar } from 'react-icons/fi';
import Calendar from '@/features/calendar/Calendar';
import { TIME_FRAME } from '@/constants/roomTypes';

function CalendarSection({ 
  roomData, 
  selectedDate,
  onDateSelect 
}) {
  return (
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
        <div className="calendar-wrapper rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100">
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