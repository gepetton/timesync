/**
 * 캘린더 컴포넌트
 * 
 * 다양한 시간대 뷰(연/월/주/일)를 제공하는 고급 캘린더 컴포넌트입니다.
 * date-fns 라이브러리를 활용하여 날짜 계산 및 포맷팅을 처리하며,
 * 사용자의 일정 선택과 가용 시간대 시각화를 지원합니다.
 * 
 * 주요 기능:
 * - 연간/월간/주간/일간 뷰 전환
 * - 참여 가능 시간대 시각화
 * - 과거 날짜 선택 방지
 * - 다국어 지원 (한국어)
 * - 반응형 그리드 레이아웃
 * 
 * @param {Object} props
 * @param {string} props.viewType - 캘린더 뷰 타입 ('year'|'month'|'week'|'day')
 * @param {Array} props.availableSlots - 선택 가능한 시간대 목록
 * @param {Date|string} props.startDate - 선택 가능한 시작 날짜
 * @param {Date|string} props.endDate - 선택 가능한 종료 날짜
 * @param {Function} props.onDateSelect - 날짜 선택 핸들러
 * @param {number} props.selectedYear - 선택된 연도
 * @param {number} props.selectedMonth - 선택된 월
 * @param {string} props.selectedWeek - 선택된 주차
 * @param {Date} props.currentDate - 현재 표시할 날짜
 */

import { useState, useEffect } from 'react';
import { addMonths, addWeeks, addDays, format, parse, isBefore, startOfToday, getYear, eachYearOfInterval, eachMonthOfInterval, startOfYear, endOfYear, startOfMonth, endOfMonth, eachWeekOfInterval, startOfWeek, endOfWeek, getWeek } from 'date-fns';
import { ko } from 'date-fns/locale';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';

/**
 * 참여 가능 인원 수에 따른 색상 클래스를 결정하는 함수
 * 인원이 많을수록 더 진한 녹색으로 표시됩니다.
 * 
 * @param {number} frequency - 해당 시간대의 참여 가능 인원 수
 * @returns {string} Tailwind CSS 클래스명
 */
const getAvailabilityColorClass = (frequency) => {
  if (frequency === 0) return 'bg-white';
  if (frequency <= 2) return 'bg-green-100';
  if (frequency <= 4) return 'bg-green-200';
  if (frequency <= 6) return 'bg-green-300';
  if (frequency <= 8) return 'bg-green-400';
  return 'bg-green-500';
};

/**
 * 특정 날짜의 참여 가능 인원 수를 계산하는 함수
 * 
 * @param {Date} date - 계산할 날짜
 * @param {Array} availableSlots - 전체 참여 가능 시간대 목록
 * @returns {number} 해당 날짜의 참여 가능 인원 수
 */
const getDateAvailabilityFrequency = (date, availableSlots) => {
  return availableSlots.filter(slot => {
    const slotDate = new Date(slot.date);
    return format(slotDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  }).length;
};

function Calendar({ 
  viewType = 'month',      // 캘린더 뷰 타입 (기본값: 월간)
  availableSlots = [],     // 참여 가능 시간대 목록
  startDate,              // 선택 가능한 시작일
  endDate,                // 선택 가능한 종료일
  onDateSelect,           // 날짜 선택 콜백
  selectedYear,           // 선택된 연도
  selectedMonth,          // 선택된 월
  selectedWeek,           // 선택된 주차
  currentDate: initialDate // 초기 표시 날짜
}) {
  // 현재 표시 중인 날짜 상태
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  // 오늘 날짜 (시작 시간 기준)
  const today = startOfToday();

  /**
   * initialDate나 startDate가 변경될 때 현재 날짜를 업데이트
   */
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

  /**
   * 특정 월이 선택되었는지 확인하는 함수
   * @param {Date} month - 확인할 월 날짜 객체
   * @returns {boolean} 선택 여부
   */
  const isMonthSelected = (month) => {
    return selectedMonth === month.getMonth() + 1;
  };

  /**
   * 특정 주차가 선택되었는지 확인하는 함수
   * 주차는 '첫째 주', '둘째 주' 등의 형식으로 처리
   * 
   * @param {Date} week - 확인할 주차의 날짜 객체
   * @returns {boolean} 선택 여부
   */
  const isWeekSelected = (week) => {
    if (!selectedWeek) return false;
    const weekNumber = getWeek(week, { weekStartsOn: 0 });
    const isLastWeek = weekNumber === getWeek(endOfMonth(week), { weekStartsOn: 0 });
    
    return (
      selectedWeek === '마지막 주' && isLastWeek ||
      selectedWeek === '첫째 주' && weekNumber === 1 ||
      selectedWeek === '둘째 주' && weekNumber === 2 ||
      selectedWeek === '셋째 주' && weekNumber === 3 ||
      selectedWeek === '넷째 주' && weekNumber === 4 ||
      selectedWeek === `${weekNumber}주차`
    );
  };

  /**
   * 이전 날짜/월/주로 이동하는 핸들러
   * 과거 날짜로의 이동은 제한됨
   */
  const handlePrevious = () => {
    let newDate;
    switch (viewType) {
      case 'year':
        if (currentDate.getMonth() === 0) return;
        newDate = addMonths(currentDate, -1);
        break;
      case 'month':
        newDate = addMonths(currentDate, -1);
        break;
      case 'week':
        newDate = addWeeks(currentDate, -1);
        break;
      case 'day':
        newDate = addDays(currentDate, -1);
        break;
      default:
        newDate = currentDate;
    }
    
    if (isBefore(newDate, today)) return;
    setCurrentDate(newDate);
  };

  /**
   * 다음 날짜/월/주로 이동하는 핸들러
   */
  const handleNext = () => {
    let newDate;
    switch (viewType) {
      case 'year':
        if (currentDate.getMonth() === 11) return;
        newDate = addMonths(currentDate, 1);
        break;
      case 'month':
        newDate = addMonths(currentDate, 1);
        break;
      case 'week':
        newDate = addWeeks(currentDate, 1);
        break;
      case 'day':
        newDate = addDays(currentDate, 1);
        break;
      default:
        newDate = currentDate;
    }
    setCurrentDate(newDate);
  };

  /**
   * 현재 뷰 타입에 따른 헤더 텍스트를 생성하는 함수
   * 연/월/주/일 형식에 맞춰 날짜를 포맷팅
   * 
   * @returns {string} 포맷팅된 헤더 텍스트
   */
  const getHeaderText = () => {
    switch (viewType) {
      case 'year':
        return `${getYear(currentDate)}년 ${format(currentDate, 'M월', { locale: ko })}`;
      case 'month':
        if (selectedMonth) {
          return format(new Date(currentDate.getFullYear(), selectedMonth - 1), 'yyyy년 M월', { locale: ko });
        }
        return format(currentDate, 'yyyy년', { locale: ko });
      case 'week':
        return format(currentDate, 'yyyy년 M월', { locale: ko });
      case 'day':
        return format(currentDate, 'yyyy년 M월 d일', { locale: ko });
      default:
        return '';
    }
  };

  /**
   * 연간 뷰를 렌더링하는 함수
   * 12개월을 그리드 형태로 표시
   */
  const renderYearView = () => {
    const months = eachMonthOfInterval({
      start: startOfYear(currentDate),
      end: endOfYear(currentDate)
    });

    return (
      <div className="grid grid-cols-3 gap-6">
        {months.map((month) => (
          <button
            key={month.toString()}
            onClick={() => onDateSelect(month, 'week')}
            className={`
              p-4 rounded-2xl text-left transition-all duration-200
              ${isMonthSelected(month) ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-gray-50 border-gray-100'}
              border
            `}
          >
            <div className="font-medium text-gray-900">
              {format(month, 'M')}월
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {format(month, 'yyyy')}
            </div>
          </button>
        ))}
      </div>
    );
  };

  /**
   * 주간 뷰를 렌더링하는 함수
   * 7일의 24시간 타임테이블을 표시
   */
  const renderWeekView = () => {
    // 현재 주의 7일을 배열로 생성
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const date = startOfWeek(currentDate, { weekStartsOn: 0 });
      return addDays(date, i);
    });

    return (
      <div className="space-y-6">
        <div className="border rounded-lg overflow-hidden">
          {/* 요일 헤더 - 각 요일과 날짜 표시 */}
          <div className="grid grid-cols-8 border-b bg-gray-50">
            <div className="w-20 p-3 text-base font-medium text-gray-600 border-r">
              시간
            </div>
            {weekDates.map((date) => (
              <div key={date.toString()} className="p-3 text-center border-r last:border-r-0">
                <div className="text-base font-medium text-gray-600">
                  {format(date, 'eee', { locale: ko })}
                </div>
                <div className="mt-1 text-lg font-medium text-gray-900">
                  {format(date, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* 시간대 그리드 - 24시간 타임테이블 */}
          {Array.from({ length: 24 }, (_, i) => {
            const time = new Date();
            time.setHours(i, 0, 0, 0);
            
            return (
              <div key={i} className="grid grid-cols-8 border-b last:border-b-0">
                {/* 시간 레이블 */}
                <div className="w-20 p-3 text-base font-medium text-gray-600 border-r bg-gray-50">
                  {format(time, 'HH:mm')}
                </div>
                {/* 각 요일의 시간대 셀 */}
                {weekDates.map((date) => {
                  const dateTime = new Date(date);
                  dateTime.setHours(i, 0, 0, 0);
                  // 해당 시간대의 참여 가능 여부 확인
                  const isAvailable = availableSlots.some(slot => {
                    const slotDate = new Date(slot.date);
                    return format(slotDate, 'yyyy-MM-dd HH:mm') === format(dateTime, 'yyyy-MM-dd HH:mm');
                  });

                  return (
                    <button
                      key={dateTime.toString()}
                      onClick={() => onDateSelect(dateTime, 'time')}
                      disabled={isBefore(dateTime, today)}
                      className={`
                        min-h-[3rem] p-3 transition-all duration-200 border-r last:border-r-0
                        ${isAvailable 
                          ? 'bg-indigo-100 hover:bg-indigo-200' 
                          : isBefore(dateTime, today) 
                            ? 'bg-gray-50 cursor-not-allowed' 
                            : 'hover:bg-gray-50'}
                      `}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * 현재 뷰 타입에 따른 캘린더 뷰를 렌더링하는 함수
   * 연/월/주/일 뷰를 조건부로 렌더링
   */
  const renderCalendarView = () => {
    // 공통으로 사용되는 props
    const props = {
      date: currentDate,
      availableSlots,
      startDate,
      endDate,
      onDateSelect
    };

    // 주간 뷰가 선택되었거나 주차가 선택된 경우
    if (selectedWeek || viewType === 'week') {
      return renderWeekView();
    }

    // 뷰 타입에 따른 렌더링
    switch (viewType) {
      case 'year':
        return renderYearView();
      case 'month':
        if (selectedMonth) {
          const monthDate = new Date(currentDate.getFullYear(), selectedMonth - 1);
          return (
            <div className="max-w-5xl mx-auto">
              <MonthView {...props} date={monthDate} />
            </div>
          );
        }
        return renderYearView();
      case 'day':
        return (
          <div className="max-w-2xl mx-auto">
            <DayView {...props} />
          </div>
        );
      default:
        return <MonthView {...props} />;
    }
  };

  return (
    <div className="bg-white rounded-lg">
      {/* 캘린더 헤더 - 현재 날짜 표시 */}
      <div className="p-6 flex items-center justify-between border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {getHeaderText()}
          </h2>
        </div>
      </div>
      {/* 캘린더 본문 - 선택된 뷰 렌더링 */}
      <div className="p-6">
        {renderCalendarView()}
      </div>
    </div>
  );
}

export default Calendar;
