import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isBefore, startOfToday } from 'date-fns';
import { ko } from 'date-fns/locale';

function MonthView({ date, availableSlots = [], onDateSelect }) {
  const today = startOfToday();
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 요일 배열
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // 달력 그리드를 위한 빈 날짜 채우기
  const firstDayOfMonth = monthStart.getDay();
  const prefixDays = Array(firstDayOfMonth).fill(null);
  
  const lastDayOfMonth = monthEnd.getDay();
  const suffixDays = Array(6 - lastDayOfMonth).fill(null);

  const allDays = [...prefixDays, ...days, ...suffixDays];

  // 주 단위로 날짜 그룹화
  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  // 가능한 시간대의 빈도에 따른 색상 클래스를 반환하는 함수
  const getAvailabilityColorClass = (frequency) => {
    if (frequency === 0) return 'bg-white';
    if (frequency <= 2) return 'bg-green-100';
    if (frequency <= 4) return 'bg-green-200';
    if (frequency <= 6) return 'bg-green-300';
    if (frequency <= 8) return 'bg-green-400';
    return 'bg-green-500';
  };

  // 특정 날짜의 가능한 시간대 빈도를 계산하는 함수
  const getDateAvailabilityFrequency = (date) => {
    return availableSlots.filter(slot => 
      format(new Date(slot.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    ).length;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 bg-gray-50 border-b">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`
              py-4 text-base font-medium text-center border-r last:border-r-0
              ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'}
            `}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7">
            {week.map((day, dayIndex) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${dayIndex}`}
                    className="h-32 border-b border-r last:border-r-0 bg-gray-50"
                  />
                );
              }

              const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
              const isPast = isBefore(day, today);
              const frequency = getDateAvailabilityFrequency(day);
              const availabilityClass = getAvailabilityColorClass(frequency);

              return (
                <button
                  key={day.toString()}
                  onClick={() => onDateSelect(day, 'day')}
                  disabled={isPast}
                  className={`
                    h-32 relative border-b border-r last:border-r-0
                    ${isPast ? 'bg-gray-50 cursor-not-allowed' : availabilityClass}
                    ${isToday ? 'bg-indigo-50' : ''}
                    group transition-colors duration-200
                  `}
                >
                  <div className="absolute top-2 left-3">
                    <div
                      className={`
                        text-lg font-medium
                        ${dayIndex === 0 ? 'text-red-500' : dayIndex === 6 ? 'text-blue-500' : 'text-gray-900'}
                        ${isPast ? 'text-gray-400' : ''}
                      `}
                    >
                      {format(day, 'd')}
                    </div>
                  </div>
                  {frequency > 0 && (
                    <div className="absolute top-2 right-2">
                      <div className="text-xs font-medium text-gray-600">
                        {frequency}개
                      </div>
                    </div>
                  )}
                  {!isPast && (
                    <div className="absolute inset-1 rounded-lg border-2 border-transparent group-hover:border-green-200 transition-colors" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MonthView; 