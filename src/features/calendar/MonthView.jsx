import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isBefore, startOfToday, addHours, setHours } from 'date-fns';
import { ko } from 'date-fns/locale';


/**
 * 월간 캘린더 뷰 컴포넌트
 * 한 달의 날짜 그리드를 표시하고, 각 날짜별 참여 가능 시간대 정보를 시각화합니다.
 * 날짜 선택 기능을 제공하며, 과거 날짜는 선택 불가능하도록 처리합니다.
 *
 * @param {Object} props
 * @param {Date} props.date - 현재 월을 표시하기 위한 기준 날짜 (Date 객체)
 * @param {Array} props.availableSlots - 참여 가능 시간대 목록 (객체 배열)
 * @param {Function} props.onDateSelect - 날짜 선택 시 호출되는 핸들러 함수 (선택된 Date 객체, 뷰 타입 문자열 인자)
 */
function MonthView({ date, availableSlots = [], onDateSelect }) {
  // 오늘 날짜를 가져옵니다. (시간 정보 제거)
  const today = startOfToday();
  // 주어진 날짜(date)의 해당 월의 시작 날짜를 가져옵니다. (예: 2025년 2월 17일 -> 2025년 2월 1일)
  const monthStart = startOfMonth(date);
  // 주어진 날짜(date)의 해당 월의 마지막 날짜를 가져옵니다. (예: 2025년 2월 17일 -> 2025년 2월 28일)
  const monthEnd = endOfMonth(date);
  // 월의 시작 날짜부터 마지막 날짜까지 모든 날짜를 담은 배열을 생성합니다. (date-fns의 eachDayOfInterval 사용)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 요일 표시를 위한 배열 (일요일부터 토요일까지, 한국어 locale 적용)
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // 달력 그리드에서 월 시작 전 빈 칸을 채우기 위한 배열 생성
  const firstDayOfMonth = monthStart.getDay(); // 월 시작 날짜의 요일 (0: 일요일, 1: 월요일, ...)
  const prefixDays = Array(firstDayOfMonth).fill(null); // 첫 날 이전 날짜들을 null로 채운 배열

  // 달력 그리드에서 월 마지막 날 이후 빈 칸을 채우기 위한 배열 생성
  const lastDayOfMonth = monthEnd.getDay(); // 월 마지막 날짜의 요일 (0: 일요일, 1: 월요일, ...)
  const suffixDays = Array(6 - lastDayOfMonth).fill(null); // 마지막 날 이후 날짜들을 null로 채운 배열 (총 7칸을 맞추기 위해)

  // 월 시작 전 빈 칸, 월간 날짜, 월 마지막 날 이후 빈 칸을 모두 합쳐 완전한 달력 그리드 배열 생성
  const allDays = [...prefixDays, ...days, ...suffixDays];

  // allDays 배열을 주 단위로 묶어 2차원 배열 weeks 생성 (7일씩 묶음)
  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7)); // 7개씩 끊어서 weeks 배열에 push
  }

  /**
   * 특정 날짜에 해당하는 참여 가능 시간대(hours)를 Set 객체로 반환하는 함수
   * availableSlots 배열을 순회하며, 주어진 date와 날짜가 일치하는 slot들을 필터링합니다.
   * 필터링된 slot들의 시간(hour) 정보를 Set에 담아 중복 없이 반환합니다.
   *
   * @param {Date} date - 특정 날짜 (Date 객체)
   * @returns {Set<number>} 해당 날짜에 참여 가능한 시간(hour) Set (중복 제거)
   */
  const getDateAvailableHours = (date) => {
    const hours = new Set(); // 시간 정보를 Set으로 저장 (중복 제거)
    availableSlots.forEach(slot => { // availableSlots 배열 순회
      const slotDate = new Date(slot.date); // slot의 date 속성을 Date 객체로 변환
      if (format(slotDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')) { // 날짜 형식이 'yyyy-MM-dd'로 일치하는 slot 필터링
        hours.add(slotDate.getHours()); // 일치하는 slot의 시간(hour)을 Set에 추가
      }
    });
    return hours; // 참여 가능한 시간(hour) Set 반환
  };


  return (
    // 월간 캘린더 뷰의 최상위 컨테이너, 테두리, 둥근 모서리, overflow hidden 적용
    <div className="border rounded-lg overflow-hidden">
      {/* 요일 헤더 Row (일, 월, 화, 수, 목, 금, 토) */}
      <div className="grid grid-cols-7 bg-gray-50 border-b">
        {weekDays.map((day, index) => ( // weekDays 배열 순회 (요일 렌더링)
          <div
            key={day} // key prop for React list rendering
            className={`
              py-4 text-base font-medium text-center border-r last:border-r-0 // padding, font 스타일, text-center, border 스타일
              ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'} // 첫 번째(일요일)와 마지막(토요일) 요일 색상 다르게 지정
            `}
          >
            {day} {/* 요일 이름 출력 */}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 (Weeks Container) */}
      <div>
        {weeks.map((week, weekIndex) => ( // weeks 배열 순회 (주 단위 Row 렌더링)
          <div key={weekIndex} className="grid grid-cols-7">
            {week.map((day, dayIndex) => { // week 배열 순회 (일 단위 Cell 렌더링)
              if (!day) {
                // day가 null이면 빈 날짜 칸 렌더링 (월 시작 전, 월 마지막 날 이후)
                return (
                  <div
                    key={`empty-${dayIndex}`} // key prop for React list rendering
                    className="h-32 border-b border-r last:border-r-0 bg-gray-50" // 높이, border 스타일, 배경색
                  />
                );
              }

              const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'); // 현재 날짜가 오늘인지 확인
              const isPast = isBefore(day, today); // 현재 날짜가 과거인지 확인 (오늘 이전)
              const availableHours = !isPast ? getDateAvailableHours(day) : new Set(); // 과거 날짜가 아니면 참여 가능 시간대 hours Set 가져오기, 과거 날짜면 빈 Set

              return (
                // 날짜 Cell Button (선택 가능 날짜) or Div (선택 불가능 날짜) 렌더링
                <button
                  key={day.toString()} // key prop for React list rendering (날짜 Date 객체 string 변환)
                  onClick={() => onDateSelect(day, 'day')} // 날짜 클릭 시 onDateSelect 핸들러 호출 (날짜 Date 객체, 'day' 뷰 타입 전달)
                  disabled={isPast} // 과거 날짜 선택 disabled 처리
                  className={`
                    h-32 relative border-b border-r last:border-r-0 // 높이, relative positioning, border 스타일
                    ${isPast ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'} // 과거 날짜 배경색, cursor 변경
                    group transition-all duration-200 hover:shadow-lg // hover 시 그림자 효과, transition 효과
                  `}
                >
                  {/* 날짜 숫자 표시 Container (Cell 상단 좌측) */}
                  <div className="absolute top-2 left-3">
                    <div
                      className={`
                        text-lg font-medium // 폰트 스타일
                        ${isToday ? 'bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center' : ''} // 오늘 날짜 하이라이팅 스타일
                        ${dayIndex === 0 ? 'text-red-500' : dayIndex === 6 ? 'text-blue-500' : 'text-gray-900'} // 일요일, 토요일 색상 다르게 지정
                        ${isPast ? 'text-gray-400' : ''} // 과거 날짜 색상 변경
                      `}
                    >
                      {format(day, 'd')} {/* 날짜 숫자 (일) 표시 (date-fns format 함수, 'd' format string) */}
                    </div>
                  </div>

                  {/* 참여 가능 시간 slotsCount 표시 Container (Cell 상단 우측) */}
                  {!isPast && availableHours.size > 0 && ( // 과거 날짜가 아니고, 참여 가능 시간대가 있는 경우에만 표시
                    <div className="absolute top-2 right-2">
                      <div className="px-1.5 py-0.5 bg-emerald-50 rounded text-xs font-medium text-emerald-600">
                        {availableHours.size}h {/* 참여 가능 시간 slotsCount 표시 */}
                      </div>
                    </div>
                  )}

                  {/* 시간대별 가용성 Bar Chart Container (Cell 하단) */}
                  {!isPast && ( // 과거 날짜가 아닌 경우에만 표시
                    <div className="absolute inset-x-2 bottom-2">
                      <div className="flex flex-col space-y-1.5">
                        {/* 시간대별 가용성 Bar Chart Item (아침, 오후, 저녁) */}
                        <div className="flex gap-1">
                          {[
                            { label: '아침', hours: [6, 7, 8, 9, 10, 11] }, // 아침 시간대 (6시~11시)
                            { label: '오후', hours: [12, 13, 14, 15, 16, 17] }, // 오후 시간대 (12시~17시)
                            { label: '저녁', hours: [18, 19, 20, 21, 22, 23] }  // 저녁 시간대 (18시~23시)
                          ].map(({ label, hours }) => { // 시간대별 정보 배열 순회 (아침, 오후, 저녁)
                            const availableCount = hours.filter(h => availableHours.has(h)).length; // 각 시간대별 참여 가능 시간 slotsCount 계산
                            const percentage = (availableCount / hours.length) * 100; // 참여 가능 slotsCount 비율 계산 (%)
                            return (
                              // 시간대별 Bar Chart Item Container (flex-1: flex grow)
                              <div key={label} className="flex-1">
                                {/* Bar Chart 막대 Container (bg-gray-100: 기본 배경색, rounded-full: 둥근 모서리, overflow-hidden: overflow hidden) */}
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                  {/* Bar Chart 막대 (h-full: 높이 100%, transition-all, duration-300: transition 효과, rounded-full: 둥근 모서리) */}
                                  <div
                                    className={`h-full transition-all duration-300 rounded-full ${
                                      percentage > 0 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : '' // 참여 가능 slotsCount > 0 이면 그라디언트 배경색 적용
                                    }`}
                                    style={{ width: `${percentage}%` }} // width style prop으로 비율 적용
                                  />
                                </div>
                                {/* 시간대 Label (아침, 오후, 저녁) */}
                                <div className="text-[10px] text-gray-500 mt-0.5 text-center">
                                  {label}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* hover effect overlay (Cell hover 시 테두리선) */}
                  {!isPast && ( // 과거 날짜가 아닌 경우에만 hover effect overlay 표시
                    <div className="absolute inset-1 rounded-lg border-2 border-transparent group-hover:border-emerald-200 transition-colors" />
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

export default MonthView; // MonthView 컴포넌트 export