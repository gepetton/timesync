import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { TIME_FRAME } from '@/constants/roomTypes';

function CalendarHeader({ 
  currentDate,
  viewType,
  selectedMonth,
  selectedWeek
}) {
  const getHeaderText = () => {
    switch (viewType) {
      case TIME_FRAME.YEAR:
        return `${currentDate.getFullYear()}년 ${format(currentDate, 'M월', { locale: ko })}`;
      case TIME_FRAME.MONTH:
        if (selectedMonth) {
          return format(new Date(currentDate.getFullYear(), selectedMonth - 1), 'yyyy년 M월', { locale: ko });
        }
        return format(currentDate, 'yyyy년', { locale: ko });
      case TIME_FRAME.WEEK:
        return format(currentDate, 'yyyy년 M월', { locale: ko });
      case TIME_FRAME.DAY:
        return format(currentDate, 'yyyy년 M월 d일', { locale: ko });
      default:
        return '';
    }
  };

  return (
    <div className="p-6 flex items-center justify-between border-b">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {getHeaderText()}
        </h2>
      </div>
    </div>
  );
}

export default CalendarHeader; 