import { useMemo } from 'react';
import { eachHourOfInterval, format, isBefore, isAfter, startOfToday, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

function DayView({ date, availableSlots = [], startDate, endDate }) {
  const today = startOfToday();
  
  // 날짜 파싱 헬퍼 함수
  const parseDate = (dateValue) => {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'string') return parseISO(dateValue);
    return new Date(dateValue);
  };

  const parsedDate = parseDate(date) || today;
  const parsedStartDate = parseDate(startDate);
  const parsedEndDate = parseDate(endDate);

  const timeSlots = useMemo(() => {
    const start = new Date().setHours(0, 0, 0, 0);
    const end = new Date().setHours(23, 0, 0, 0);
    return eachHourOfInterval({ start: new Date(start), end: new Date(end) });
  }, []);

  const hasAvailableSlot = (hour) => {
    return availableSlots.some(slot => {
      try {
        const slotDate = parseDate(slot.date);
        if (!slotDate) return false;
        return format(slotDate, 'yyyy-MM-dd') === format(parsedDate, 'yyyy-MM-dd') &&
               format(slotDate, 'HH') === format(hour, 'HH');
      } catch (error) {
        console.error('Invalid date format in availableSlots:', slot.date);
        return false;
      }
    });
  };

  const isDateSelectable = () => {
    try {
      const isPast = isBefore(parsedDate, today);
      const isBeforeStart = parsedStartDate && isBefore(parsedDate, parsedStartDate);
      const isAfterEnd = parsedEndDate && isAfter(parsedDate, parsedEndDate);
      
      return !isPast && !isBeforeStart && !isAfterEnd;
    } catch (error) {
      console.error('Error checking date selectability:', error);
      return false;
    }
  };

  const selectable = isDateSelectable();

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* 시간대 그리드 */}
      <div className="grid grid-cols-[100px_1fr] divide-x divide-gray-200">
        {/* 시간 열 */}
        <div className="bg-gray-50">
          <div className="h-14 flex items-center justify-center border-b border-gray-200">
            <span className="text-base font-medium text-gray-600">시간</span>
          </div>
          {timeSlots.map((time) => (
            <div
              key={time.toString()}
              className="h-14 flex items-center justify-center text-base font-medium text-gray-600 border-b last:border-b-0"
            >
              {format(time, 'HH:mm')}
            </div>
          ))}
        </div>

        {/* 시간 선택 영역 */}
        <div className="divide-y divide-gray-200 bg-white">
          <div className="h-14 flex items-center justify-center">
            <span className="text-base font-medium text-gray-900">
              {format(parsedDate, 'M월 d일 (eee)', { locale: ko })}
            </span>
          </div>
          <div className="grid grid-cols-1 divide-y divide-gray-200">
            {timeSlots.map((time) => {
              const hasSlot = hasAvailableSlot(time);
              const hourDate = new Date(parsedDate);
              hourDate.setHours(time.getHours(), 0, 0, 0);
              const isPastTime = isBefore(hourDate, today);

              return (
                <button
                  key={time.toString()}
                  disabled={isPastTime || !selectable}
                  className={`
                    h-14 relative group bg-white
                    ${hasSlot 
                      ? 'hover:bg-indigo-50' 
                      : isPastTime || !selectable 
                        ? 'bg-gray-50 cursor-not-allowed' 
                        : 'hover:bg-gray-50'}
                  `}
                >
                  {hasSlot && (
                    <div className="absolute inset-0.5 rounded border border-indigo-200 bg-indigo-50/30" />
                  )}
                  {!isPastTime && !hasSlot && selectable && (
                    <div className="absolute inset-0.5 rounded border border-transparent group-hover:border-gray-200 transition-colors" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DayView;
