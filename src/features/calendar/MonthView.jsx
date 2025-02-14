import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isBefore, startOfToday } from 'date-fns';
import { ko } from 'date-fns/locale';

function MonthView({ date, availableSlots = [], onDateSelect }) {
  // 오늘 날짜를 가져옵니다.
  const today = startOfToday();
  // 주어진 날짜의 해당 월의 시작 날짜를 가져옵니다.
  const monthStart = startOfMonth(date);
  // 주어진 날짜의 해당 월의 마지막 날짜를 가져옵니다.
  const monthEnd = endOfMonth(date);
  // 월의 시작부터 끝까지의 모든 날짜를 배열로 만듭니다.
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 요일 배열을 정의합니다. (일요일부터 토요일까지)
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // 달력 그리드를 위한 빈 날짜를 채웁니다.
  // 월의 첫 번째 날의 요일을 가져옵니다. (0: 일요일, 1: 월요일, ...)
  const firstDayOfMonth = monthStart.getDay();
  // 첫 주의 빈 칸을 채우기 위해 null로 채운 배열을 만듭니다.
  const prefixDays = Array(firstDayOfMonth).fill(null);
  
  // 월의 마지막 날의 요일을 가져옵니다.
  const lastDayOfMonth = monthEnd.getDay();
  // 마지막 주의 빈 칸을 채우기 위해 null로 채운 배열을 만듭니다.
  const suffixDays = Array(6 - lastDayOfMonth).fill(null);

  // 모든 날짜를 포함한 배열을 만듭니다. (빈 칸 포함)
  const allDays = [...prefixDays, ...days, ...suffixDays];

  // 주 단위로 날짜를 그룹화합니다.
  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  // 가능한 시간대의 빈도에 따라 색상 클래스를 반환하는 함수입니다.
  const getAvailabilityColorClass = (frequency) => {
    if (frequency === 0) return 'bg-white'; // 가능한 시간이 없을 때
    if (frequency <= 2) return 'bg-green-100'; // 1~2개의 가능한 시간이 있을 때
    if (frequency <= 4) return 'bg-green-200'; // 3~4개의 가능한 시간이 있을 때
    if (frequency <= 6) return 'bg-green-300'; // 5~6개의 가능한 시간이 있을 때
    if (frequency <= 8) return 'bg-green-400'; // 7~8개의 가능한 시간이 있을 때
    return 'bg-green-500'; // 9개 이상의 가능한 시간이 있을 때
  };

  // 특정 날짜의 가능한 시간대 빈도를 계산하는 함수입니다.
  const getDateAvailabilityFrequency = (date) => {
    // 주어진 날짜와 같은 날짜의 슬롯을 필터링하여 그 개수를 반환합니다.
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
                // 빈 날짜 칸을 렌더링합니다.
                return (
                  <div
                    key={`empty-${dayIndex}`}
                    className="h-32 border-b border-r last:border-r-0 bg-gray-50"
                  />
                );
              }

              // 오늘 날짜인지 확인합니다.
              const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
              // 과거 날짜인지 확인합니다.
              const isPast = isBefore(day, today);
              // 해당 날짜의 가능한 시간대 빈도를 가져옵니다.
              const frequency = getDateAvailabilityFrequency(day);
              // 빈도에 따른 색상 클래스를 가져옵니다.
              const availabilityClass = getAvailabilityColorClass(frequency);

              return (
                <button
                  key={day.toString()}
                  onClick={() => onDateSelect(day, 'day')}
                  disabled={isPast} // 과거 날짜는 선택할 수 없습니다.
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
                      {format(day, 'd')} {/* 날짜를 표시합니다. */}
                    </div>
                  </div>
                  {frequency > 0 && (
                    <div className="absolute top-2 right-2">
                      <div className="text-xs font-medium text-gray-600">
                        {frequency}개 {/* 가능한 시간대의 개수를 표시합니다. */}
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