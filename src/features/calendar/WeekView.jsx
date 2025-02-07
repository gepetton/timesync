import { useMemo } from 'react';
import { startOfWeek, endOfWeek, eachDayOfInterval, eachHourOfInterval, format, isToday, isBefore, isAfter, startOfToday, getWeek } from 'date-fns';
import { ko } from 'date-fns/locale';

function WeekView({ date, availableSlots = [], startDate, endDate, selectedWeek }) {
  const today = startOfToday();

  const weekDays = useMemo(() => {
    const start = startOfWeek(date, { weekStartsOn: 0 });
    const end = endOfWeek(date, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [date]);

  const hours = useMemo(() => {
    const start = new Date().setHours(0, 0, 0, 0);
    const end = new Date().setHours(23, 0, 0, 0);
    return eachHourOfInterval({ start: new Date(start), end: new Date(end) });
  }, []);

  const hasAvailableSlot = (day, hour) => {
    return availableSlots.some(slot => {
      const slotDate = new Date(slot.date);
      return format(slotDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') &&
             format(slotDate, 'HH') === format(hour, 'HH');
    });
  };

  const isDateSelectable = (day) => {
    const isPast = isBefore(day, today);
    const isBeforeStart = startDate && isBefore(day, startDate);
    const isAfterEnd = endDate && isAfter(day, endDate);
    
    return !isPast && !isBeforeStart && !isAfterEnd;
  };

  const getWeekText = (day) => {
    return selectedWeek || '첫째 주';  // selectedWeek가 없을 경우에만 기본값 사용
  };

  return (
    <div className="select-none">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {format(date, 'M월', { locale: ko })} {getWeekText(date)}
        </h3>
      </div>
      <div className="grid grid-cols-8 divide-x divide-gray-200 border border-gray-200">
        {/* 시간 열 */}
        <div className="bg-white">
          <div className="h-14 flex items-center justify-center border-b border-gray-200">시간</div>
          {hours.map(hour => (
            <div
              key={hour.toString()}
              className="h-14 flex items-center justify-center text-sm text-gray-500 border-b border-gray-200"
            >
              {format(hour, 'HH:mm')}
            </div>
          ))}
        </div>

        {/* 요일 열 */}
        {weekDays.map((day, index) => {
          const isSelectable = isDateSelectable(day);
          
          return (
            <div key={day.toString()} className="flex-1">
              <div
                className={`h-14 flex items-center justify-center font-medium border-b border-gray-200
                  ${isToday(day) ? 'bg-blue-50' : 'bg-white'}
                  ${format(day, 'E', { locale: ko }) === '일' ? 'text-red-500' : ''}
                  ${format(day, 'E', { locale: ko }) === '토' ? 'text-blue-500' : ''}
                  ${!isSelectable ? 'opacity-50' : ''}
                `}
              >
                <div className="text-center">
                  <div className="text-sm">{format(day, 'E', { locale: ko })}</div>
                  <div className="text-lg">{format(day, 'd')}</div>
                </div>
              </div>

              {hours.map(hour => (
                <div
                  key={hour.toString()}
                  className={`
                    h-14 bg-white border-b border-gray-200
                    ${hasAvailableSlot(day, hour) && isSelectable ? 'bg-primary/10' : ''}
                    ${!isSelectable ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                  `}
                >
                  {hasAvailableSlot(day, hour) && isSelectable && (
                    <div className="h-full flex items-center justify-center text-xs text-primary">
                      가능
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeekView;
