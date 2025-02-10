import { FiCalendar } from 'react-icons/fi';
import Calendar from '@/features/calendar/Calendar';
import { useRoomContext } from '@/contexts/RoomContext';
import { TIME_FRAME } from '@/constants/roomTypes';

function RoomCalendar() {
  const { 
    room,
    selectedDate,
    handleDateSelect
  } = useRoomContext();

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
        <div className="calendar-wrapper rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100">
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