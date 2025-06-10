import { useMemo } from 'react';
import { startOfWeek, endOfWeek, eachDayOfInterval, eachHourOfInterval, format, isToday, isBefore, startOfToday, getWeek, parse, setWeek } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useRoomContext } from '@/contexts/RoomContext';

/**
 * 주간 캘린더 뷰 컴포넌트
 * 한 주의 시간대 그리드를 표시하고, 각 시간대별 참여 가능 여부를 시각화합니다.
 * 시간대 선택 기능을 제공하며, 과거 시간대는 선택 불가능하도록 처리합니다.
 *
 * @param {Object} props
 * @param {Date} props.date - 현재 주를 표시하기 위한 기준 날짜 (Date 객체)
 * @param {string} props.selectedWeek - 선택된 주차 (예: "2주차")
 */
function WeekView({ date, selectedWeek }) {
  const { checkTimeAvailability } = useRoomContext();
  
  // 오늘 날짜를 date-fns의 startOfToday() 함수로 가져옵니다 (시간 정보 제거)
  const today = startOfToday();

  // useMemo 훅을 사용하여 weekDays (주간 날짜 배열)를 memoization합니다.
  // date 또는 selectedWeek prop이 변경될 때만 weekDays를 다시 계산합니다.
  const weekDays = useMemo(() => {
    let targetDate = date; // targetDate 변수를 date prop 값으로 초기화

    // selectedWeek prop이 있는 경우 (특정 주차를 선택한 경우)
    if (selectedWeek) {
      const weekNumber = parseInt(selectedWeek); // selectedWeek 문자열에서 주차 숫자 부분 추출 (정수 변환)
      const year = date.getFullYear(); // 현재 date의 연도
      const month = date.getMonth(); // 현재 date의 월

      // 해당 월의 1일로 targetDate 설정 (주차 계산 기준일 설정)
      targetDate = new Date(year, month, 1);

      // 해당 월의 모든 날짜를 가져옴 (date-fns eachDayOfInterval 함수 사용)
      const daysInMonth = eachDayOfInterval({
        start: targetDate, // 해당 월 1일부터
        end: new Date(year, month + 1, 0) // 해당 월 마지막 날까지
      });

      // 주차별로 날짜 그룹화 (reduce 함수 사용)
      const weekGroups = daysInMonth.reduce((acc, day) => {
        // 각 날짜의 주차 번호 계산 (해당 월의 1일 기준으로 몇 번째 주차인지 계산)
        const weekNum = Math.ceil((day.getDate() + new Date(year, month, 1).getDay()) / 7);
        if (!acc[weekNum]) acc[weekNum] = []; // acc 객체에 해당 주차 key가 없으면 빈 배열로 초기화
        acc[weekNum].push(day); // 해당 주차 key에 날짜 push
        return acc; // 누적된 주차별 날짜 그룹 acc 반환
      }, {}); // reduce 초기값: 빈 객체 {}

      // 선택된 주차의 첫 날짜로 targetDate 설정
      if (weekGroups[weekNumber] && weekGroups[weekNumber].length > 0) {
        targetDate = weekGroups[weekNumber][0]; // weekGroups에서 선택된 주차의 첫 번째 날짜를 targetDate로 설정
      }
    }

    // 해당 주의 시작일과 종료일 계산 (일요일 시작 기준, date-fns startOfWeek, endOfWeek 함수 사용)
    const start = startOfWeek(targetDate, { weekStartsOn: 0 }); // 해당 주의 시작일 (일요일)
    const end = endOfWeek(targetDate, { weekStartsOn: 0 }); // 해당 주의 종료일 (토요일)

    // 해당 주의 시작일부터 종료일까지 모든 날짜를 담은 배열 생성 (date-fns eachDayOfInterval 함수 사용)
    return eachDayOfInterval({ start, end }); // 시작일부터 종료일까지 날짜 배열 반환
  }, [date, selectedWeek]); // date, selectedWeek prop이 변경될 때 weekDays memoization 다시 계산

  // useMemo 훅을 사용하여 hours (시간 배열)를 memoization합니다.
  // hours는 0시부터 23시까지 1시간 간격의 시간 Date 객체 배열입니다.
  const hours = useMemo(() => {
    const start = new Date().setHours(0, 0, 0, 0); // 오늘 0시 0분 0초 Date 객체 생성
    const end = new Date().setHours(23, 0, 0, 0); // 오늘 23시 0분 0초 Date 객체 생성
    return eachHourOfInterval({ start: new Date(start), end: new Date(end) }); // 0시부터 23시까지 1시간 간격 시간 배열 반환
  }, []); // 의존성 배열: 빈 배열 (컴포넌트 mount 시 1번만 계산)

  /**
   * 시간대 상태에 따른 스타일 클래스 이름을 반환하는 함수
   * 과거 시간대인지, 예약 가능한 시간대인지 여부에 따라 다른 스타일을 적용합니다.
   * 오늘 날짜인 경우 현재 시간 이전은 과거 시간으로 처리합니다.
   *
   * @param {Date} dateTime - 특정 시간 (Date 객체)
   * @param {boolean} isAvailable - 예약 가능 여부 (true: 가능, false: 불가능)
   * @returns {string} Tailwind CSS 클래스 이름
   */
  const getTimeSlotStyle = (dateTime, isAvailable) => {
    const now = new Date(); // 현재 시간
    
    // 과거 날짜이거나, 오늘 날짜의 현재 시간 이전이면 과거 시간으로 처리
    if (isBefore(dateTime, today) || 
        (format(dateTime, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd') && 
         dateTime.getHours() <= now.getHours())) {
      // dateTime이 과거이면 선택 불가능 스타일 (bg-gray-200)
      return 'bg-gray-200';
    }
    // dateTime이 미래이면 예약 가능 여부에 따라 스타일 결정
    return isAvailable
      ? 'bg-green-100' // 가능한 시간: 초록색
      : 'bg-red-100'; // 불가능한 시간: 빨간색
  };

  return (
    // 주간 캘린더 뷰의 최상위 컨테이너, space-y-6 (세로 margin) 적용
    <div className="space-y-6">
      {/* 범례 */}
      <div className="flex items-center justify-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-sm text-gray-600">가능한 시간</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-sm text-gray-600">불가능한 시간</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
          <span className="text-sm text-gray-600">과거 시간</span>
        </div>
      </div>

      {/* 주간 캘린더 Container (테두리, 둥근 모서리, 그림자 효과, overflow hidden 적용) */}
      <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-md">
        {/* 요일 헤더 Row (시간 column + 7요일 column) */}
        <div className="grid grid-cols-[6rem_repeat(7,1fr)] border-b-2 border-gray-200 bg-gray-50">
          {/* 시간 column header (요일 header row 좌측 상단) */}
          <div className="py-3 px-4 text-base font-semibold text-gray-700 border-r-2 border-gray-200 flex items-center justify-center">
            시간
          </div>
          {/* 요일 column headers (일 ~ 토) */}
          {weekDays.map((date) => ( // weekDays 배열 순회 (요일 header cell 렌더링)
            <div key={date.toString()} className="py-2 px-1 text-center border-r-2 border-gray-200 last:border-r-0">
              {/* 요일 (일, 월, 화, 수, 목, 금, 토) */}
              <div className={`text-base font-medium ${
                format(date, 'E', { locale: ko }) === '일' ? 'text-red-500' : // 일요일: text-red-500
                format(date, 'E', { locale: ko }) === '토' ? 'text-blue-500' : // 토요일: text-blue-500
                'text-gray-700' // 평일: text-gray-700
              }`}>
                {format(date, 'E', { locale: ko })} {/* date-fns format 함수, 'E' format string (요일 축약형), 한국어 locale 적용 */}
              </div>
              {/* 날짜 (1, 2, 3, ...) */}
              <div className={`mt-1 text-lg font-semibold ${
                isToday(date) ? 'bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto' : 'text-gray-900' // 오늘 날짜 하이라이팅
              }`}>
                {format(date, 'd')} {/* date-fns format 함수, 'd' format string (일) */}
              </div>
            </div>
          ))}
        </div>

        {/* 시간대 그리드 Row (시간 row + 7요일 columns) */}
        {hours.map((hour) => ( // hours 배열 순회 (시간 row 렌더링)
          <div key={hour.toString()} className="grid grid-cols-[6rem_repeat(7,1fr)] border-b-2 border-gray-200 last:border-b-0">
            {/* 시간 column cell (각 시간 row 좌측) */}
            <div className="h-12 py-2 px-4 text-base font-medium text-gray-700 border-r-2 border-gray-200 bg-gray-50 flex items-center justify-center">
              {format(hour, 'HH:mm')} {/* date-fns format 함수, 'HH:mm' format string (시간:분 24시간 형식) */}
            </div>
            {/* 요일별 시간대 cells (일 ~ 토 시간대 cell) */}
            {weekDays.map((day) => { // weekDays 배열 순회 (요일 column cell 렌더링)
              const dateTime = new Date(day); // 현재 요일(day) Date 객체 복사
              dateTime.setHours(hour.getHours(), 0, 0, 0); // dateTime 객체에 현재 시간(hour) 설정 (분, 초, 밀리초 0으로 초기화)
              const isAvailable = checkTimeAvailability(dateTime, format(hour, 'HH:mm')); // RoomContext의 checkTimeAvailability 함수 사용
              
              const now = new Date(); // 현재 시간
              // 과거 날짜이거나, 오늘 날짜의 현재 시간 이전이면 과거 시간으로 처리
              const isPast = isBefore(dateTime, today) || 
                           (format(dateTime, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd') && 
                            dateTime.getHours() <= now.getHours());

              return (
                // 시간대 button (선택 가능한 시간대) or div (선택 불가능한 시간대) 렌더링
                <div
                  key={dateTime.toString()} // key prop for React list rendering (시간/날짜 Date 객체 string 변환)
                  className={`
                    h-12 transition-all duration-200 border-r-2 border-gray-200 last:border-r-0 // 높이, transition, border style
                    ${getTimeSlotStyle(dateTime, isAvailable)} // getTimeSlotStyle 함수 호출하여 스타일 클래스 이름 동적 결정
                    relative // relative positioning (hover effect overlay absolute positioning 기준)
                  `}
                >
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeekView; // WeekView 컴포넌트 export