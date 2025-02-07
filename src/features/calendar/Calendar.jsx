import { useState, useEffect } from 'react';
import { addMonths, addWeeks, addDays, format, parse, isBefore, startOfToday, getYear, eachYearOfInterval, eachMonthOfInterval, startOfYear, endOfYear, startOfMonth, endOfMonth, eachWeekOfInterval, startOfWeek, endOfWeek, getWeek } from 'date-fns';
import { ko } from 'date-fns/locale';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';

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
const getDateAvailabilityFrequency = (date, availableSlots) => {
  return availableSlots.filter(slot => {
    const slotDate = new Date(slot.date);
    return format(slotDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  }).length;
};

function Calendar({ 
  viewType = 'month', 
  availableSlots = [], 
  startDate, 
  endDate,
  onDateSelect,
  selectedYear,
  selectedMonth,
  selectedWeek,
  currentDate: initialDate
}) {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const today = startOfToday();

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

  const isMonthSelected = (month) => {
    return selectedMonth === month.getMonth() + 1;
  };

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

  const renderWeekView = () => {
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const date = startOfWeek(currentDate, { weekStartsOn: 0 });
      return addDays(date, i);
    });

    return (
      <div className="space-y-6">
        <div className="border rounded-lg overflow-hidden">
          {/* 요일 헤더 */}
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

          {/* 시간대 그리드 */}
          {Array.from({ length: 24 }, (_, i) => {
            const time = new Date();
            time.setHours(i, 0, 0, 0);
            
            return (
              <div key={i} className="grid grid-cols-8 border-b last:border-b-0">
                <div className="w-20 p-3 text-base font-medium text-gray-600 border-r bg-gray-50">
                  {format(time, 'HH:mm')}
                </div>
                {weekDates.map((date) => {
                  const dateTime = new Date(date);
                  dateTime.setHours(i, 0, 0, 0);
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

  const renderCalendarView = () => {
    const props = {
      date: currentDate,
      availableSlots,
      startDate,
      endDate,
      onDateSelect
    };

    if (selectedWeek || viewType === 'week') {
      return renderWeekView();
    }

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
      <div className="p-6 flex items-center justify-between border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {getHeaderText()}
          </h2>
        </div>
      </div>
      <div className="p-6">
        {renderCalendarView()}
      </div>
    </div>
  );
}

export default Calendar;
