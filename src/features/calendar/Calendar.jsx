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
 * 참여 가능 인원 수에 따른 색상 클래스를 결정하는 함수
 * 인원이 많을수록 더 진한 녹색으로 표시됩니다.
 * Tailwind CSS 클래스명을 반환하여 스타일을 적용합니다.
 *
 * @param {number} frequency - 해당 시간대의 참여 가능 인원 수
 * @returns {string} Tailwind CSS 클래스명 (bg-color)
 */
const getAvailabilityColorClass = (frequency) => {
  if (frequency === 0) return 'bg-white'; // 참여 가능 인원이 0명이면 흰색 배경
  if (frequency <= 2) return 'bg-green-100'; // 1~2명: 연한 녹색
  if (frequency <= 4) return 'bg-green-200'; // 3~4명: 조금 더 진한 녹색
  if (frequency <= 6) return 'bg-green-300'; // 5~6명: 중간 녹색
  if (frequency <= 8) return 'bg-green-400'; // 7~8명: 진한 녹색
  return 'bg-green-500'; // 9명 이상: 매우 진한 녹색
};

/**
 * 특정 날짜의 참여 가능 인원 수를 계산하는 함수
 * availableSlots 배열에서 해당 날짜와 일치하는 slot의 개수를 세어 반환합니다.
 *
 * @param {Date} date - 계산할 날짜 (Date 객체)
 * @param {Array} availableSlots - 전체 참여 가능 시간대 목록 (객체 배열)
 * @returns {number} 해당 날짜의 참여 가능 인원 수
 */
const getDateAvailabilityFrequency = (date, availableSlots) => {
  return availableSlots.filter(slot => {
    const slotDate = new Date(slot.date); // slot 객체의 date 속성을 Date 객체로 변환
    return format(slotDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'); // 날짜 형식을 'yyyy-MM-dd'로 맞춰 비교
  }).length; // 조건에 맞는 slot의 개수를 반환 (참여 가능 인원 수)
};

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

  // useEffect 훅을 사용하여 initialDate 또는 startDate props가 변경될 때 currentDate 상태를 업데이트합니다.
  useEffect(() => {
    if (initialDate) {
      setCurrentDate(initialDate); // initialDate prop이 있으면 currentDate를 initialDate로 설정
    } else if (startDate) {
      // startDate prop이 있으면 currentDate를 startDate로 설정 (문자열인 경우 Date 객체로 파싱)
      const parsedDate = typeof startDate === 'string'
        ? parse(startDate, 'yyyy-MM-dd', new Date()) // startDate가 문자열이면 'yyyy-MM-dd' 형식으로 파싱
        : startDate; // startDate가 Date 객체이면 그대로 사용
      setCurrentDate(parsedDate); // 파싱 또는 그대로 startDate를 currentDate로 설정
    }
  }, [startDate, initialDate]); // startDate, initialDate prop이 변경될 때마다 useEffect 실행

  // 현재 선택된 주(selectedWeek)가 props로 전달된 week와 일치하는지 확인하는 함수
  const isWeekSelected = (week) => {
    if (!selectedWeek) return false; // selectedWeek prop이 없으면 false 반환
    const weekNumber = getWeek(week, { weekStartsOn: 0 }); // week의 주차 번호를 계산 (일요일 시작 기준)
    return selectedWeek === `${weekNumber}주차`; // selectedWeek prop과 계산된 주차 번호가 "N주차" 형식으로 일치하는지 비교
  };

  // 이전 달 또는 주를 보여주는 핸들러 함수
  const handlePrevious = () => {
    let newDate;
    if (viewType === TIME_FRAME.MONTH) {
      newDate = addMonths(currentDate, -1); // 월간 뷰인 경우 현재 달에서 1개월 빼기
    } else {
      newDate = addWeeks(currentDate, -1); // 주간 뷰인 경우 현재 주에서 1주 빼기
    }

    if (isBefore(newDate, today)) return; // 새로 계산된 날짜가 오늘 이전이면 (과거 날짜 선택 방지) 함수 종료
    setCurrentDate(newDate); // 새로 계산된 날짜로 currentDate 상태 업데이트
  };

  // 다음 달 또는 주를 보여주는 핸들러 함수
  const handleNext = () => {
    let newDate;
    if (viewType === TIME_FRAME.MONTH) {
      newDate = addMonths(currentDate, 1); // 월간 뷰인 경우 현재 달에서 1개월 더하기
    } else {
      newDate = addWeeks(currentDate, 1); // 주간 뷰인 경우 현재 주에서 1주 더하기
    }
    setCurrentDate(newDate); // 새로 계산된 날짜로 currentDate 상태 업데이트
  };

  // 캘린더 헤더 텍스트 (년, 월, 주차)를 반환하는 함수
  const getHeaderText = () => {
    if (viewType === TIME_FRAME.MONTH && selectedMonth) {
      // 월간 뷰이고 selectedMonth prop이 있으면 "yyyy년 M월" 형식으로 반환 (한국어 locale 적용)
      return format(new Date(currentDate.getFullYear(), selectedMonth - 1), 'yyyy년 M월', { locale: ko });
    } else if (viewType === TIME_FRAME.WEEK && selectedWeek) {
      // 주간 뷰이고 selectedWeek prop이 있으면 "yyyy년 M월 N주차" 형식으로 반환 (한국어 locale 적용)
      return `${format(currentDate, 'yyyy년 M월', { locale: ko })} ${selectedWeek}`;
    }
    // 기본적으로 "yyyy년 M월" 형식으로 반환 (한국어 locale 적용)
    return format(currentDate, 'yyyy년 M월', { locale: ko });
  };

  return (
    // 캘린더 컴포넌트의 최상위 컨테이너, 흰색 배경, 둥근 테두리 적용
    <div className="bg-white rounded-lg">
      {/* 캘린더 헤더 영역 (월/주 표시, 이전/다음 버튼) */}
      <div className="p-6">
        {/* 캘린더 뷰 타입이 주간 뷰이거나 selectedWeek prop이 있는 경우 WeekView 컴포넌트 렌더링 */}
        {viewType === TIME_FRAME.WEEK || selectedWeek ? (
          <WeekView
            date={currentDate} // 현재 날짜 prop
            availableSlots={availableSlots} // 참여 가능 시간대 목록 prop
            onDateSelect={onDateSelect} // 날짜 선택 핸들러 함수 prop
            selectedWeek={selectedWeek} // 선택된 주차 prop
          />
        ) : (
          // 그 외의 경우 (월간 뷰) MonthView 컴포넌트 렌더링
          <MonthView
            date={currentDate} // 현재 날짜 prop
            availableSlots={availableSlots} // 참여 가능 시간대 목록 prop
            onDateSelect={onDateSelect} // 날짜 선택 핸들러 함수 prop
          />
        )}
      </div>
    </div>
  );
}

export default Calendar; // Calendar 컴포넌트를 export합니다.