/**
 * 캘린더 컴포넌트
 *
 * 다양한 시간대 뷰(월/주)를 제공하는 캘린더 컴포넌트입니다.
 * date-fns 라이브러리를 활용하여 날짜 계산 및 포맷팅을 처리하며,
 * 사용자의 일정 선택과 가용 시간대 시각화를 지원합니다.
 *
 * 주요 기능:
 * - 월간/주간 뷰 전환
 * - 참여 가능 시간대 시각화 (색상으로 표현)
 * - 과거 날짜 선택 방지
 * - 다국어 지원 (한국어 - date-fns/locale/ko)
 * - 반응형 그리드 레이아웃 (Tailwind CSS 활용)
 *
 * @param {Object} props
 * @param {string} props.viewType - 캘린더 뷰 타입 ('month'|'week') - TIME_FRAME 상수 사용
 * @param {Array} props.availableSlots - 선택 가능한 시간대 목록 (date, isAvailable 속성을 가진 객체 배열)
 * @param {Date|string} props.startDate - 선택 가능한 시작 날짜 (Date 객체 또는 'yyyy-MM-dd' 형식 문자열)
 * @param {Date|string} props.endDate - 선택 가능한 종료 날짜 (Date 객체 또는 'yyyy-MM-dd' 형식 문자열)
 * @param {Function} props.onDateSelect - 날짜 선택 시 호출되는 핸들러 함수 (선택된 Date 객체, 뷰 타입 문자열 인자)
 * @param {number} props.selectedYear - 선택된 연도 (연간 뷰에서 사용)
 * @param {number} props.selectedMonth - 선택된 월 (월간 뷰에서 사용, 1-12)
 * @param {string} props.selectedWeek - 선택된 주차 (주간 뷰에서 사용, "N주차" 형식 문자열)
 * @param {Date} props.currentDate - 현재 캘린더에 표시할 날짜 (Date 객체) - 초기값 설정에 사용
 */
import { useState, useEffect } from 'react'; // React의 useState, useEffect 훅을 import합니다. 상태 관리 및 side effect 처리에 사용됩니다.
import { addMonths, addWeeks, format, parse, isBefore, startOfToday, getWeek } from 'date-fns'; // date-fns 라이브러리에서 날짜 관련 함수들을 import합니다. 날짜 계산 및 포맷팅에 사용됩니다.
import { ko } from 'date-fns/locale'; // date-fns 라이브러리에서 한국어 locale을 import합니다. 날짜 포맷팅에 한국어 설정을 적용하기 위해 사용됩니다.
import MonthView from './MonthView'; // MonthView 컴포넌트를 import합니다. 월간 캘린더 뷰를 표시하는 컴포넌트입니다.
import WeekView from './WeekView'; // WeekView 컴포넌트를 import합니다. 주간 캘린더 뷰를 표시하는 컴포넌트입니다.
import { TIME_FRAME } from '@/constants/roomTypes'; // '@/constants/roomTypes' 경로에서 TIME_FRAME 상수를 import합니다. 시간대 관련 상수들을 정의합니다.

/**
 * 캘린더 컴포넌트의 메인 함수
 * viewType, availableSlots, startDate, endDate, onDateSelect, selectedYear, selectedMonth, selectedWeek, initialDate props를 받습니다.
 */
function Calendar({
  viewType = TIME_FRAME.MONTH, // 캘린더 뷰 타입 props, 기본값은 월간 뷰 (TIME_FRAME.MONTH)
  availableSlots = [], // 참여 가능 시간대 목록 props, 기본값은 빈 배열
  startDate, // 선택 가능한 시작 날짜 props
  endDate, // 선택 가능한 종료 날짜 props
  onDateSelect, // 날짜 선택 핸들러 함수 props
  selectedYear, // 선택된 연도 props (연간 뷰에서 사용)
  selectedMonth, // 선택된 월 props (월간 뷰에서 사용)
  selectedWeek, // 선택된 주차 props (주간 뷰에서 사용)
  currentDate: initialDate // 현재 캘린더에 표시할 날짜 props, 초기값 설정에 사용
}) {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date()); // 현재 캘린더 날짜 상태, 초기값은 props로 받거나 현재 날짜
  const today = startOfToday(); // 오늘 날짜를 date-fns의 startOfToday() 함수로 가져옵니다 (시간 정보 제거)

  // initialDate 또는 startDate props 변경 시 currentDate 업데이트
  useEffect(() => {
    if (initialDate) {
      setCurrentDate(initialDate);
    } else if (startDate) {
      const parsedDate = typeof startDate === 'string'
        ? parse(startDate, 'yyyy-MM-dd', new Date())
        : startDate;
      setCurrentDate(parsedDate);
    }
  }, [startDate, initialDate]);

  return (
    // 캘린더 컴포넌트의 최상위 컨테이너, 흰색 배경, 둥근 테두리 적용
    <div className="bg-white rounded-lg">
      {/* 캘린더 헤더 영역 (월/주 표시, 이전/다음 버튼) */}
      <div className="p-6">
        {/* 캘린더 뷰 타입이 주간 뷰이거나 selectedWeek prop이 있는 경우 WeekView 컴포넌트 렌더링 */}
        {viewType === TIME_FRAME.WEEK || selectedWeek ? (
          <WeekView
            date={currentDate} // 현재 날짜 prop
            selectedWeek={selectedWeek} // 선택된 주차 prop
          />
        ) : (
          // 그 외의 경우 (월간 뷰) MonthView 컴포넌트 렌더링
          <MonthView
            date={currentDate} // 현재 날짜 prop
          />
        )}
      </div>
    </div>
  );
}

export default Calendar; // Calendar 컴포넌트를 export합니다.