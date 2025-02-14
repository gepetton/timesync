import { addMonths, addWeeks, addDays, isBefore } from 'date-fns';
import { TIME_FRAME } from '@/constants/roomTypes';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function CalendarNavigation({
  viewType,
  currentDate,
  onDateChange,
  minDate = new Date()
}) {
  const handlePrevious = () => {
    let newDate;
    switch (viewType) {
      case TIME_FRAME.YEAR:
        if (currentDate.getMonth() === 0) return;
        newDate = addMonths(currentDate, -1);
        break;
      case TIME_FRAME.MONTH:
        newDate = addMonths(currentDate, -1);
        break;
      case TIME_FRAME.WEEK:
        newDate = addWeeks(currentDate, -1);
        break;
      case TIME_FRAME.DAY:
        newDate = addDays(currentDate, -1);
        break;
      default:
        newDate = currentDate;
    }
    
    if (isBefore(newDate, minDate)) return;
    onDateChange(newDate);
  };

  const handleNext = () => {
    let newDate;
    switch (viewType) {
      case TIME_FRAME.YEAR:
        if (currentDate.getMonth() === 11) return;
        newDate = addMonths(currentDate, 1);
        break;
      case TIME_FRAME.MONTH:
        newDate = addMonths(currentDate, 1);
        break;
      case TIME_FRAME.WEEK:
        newDate = addWeeks(currentDate, 1);
        break;
      case TIME_FRAME.DAY:
        newDate = addDays(currentDate, 1);
        break;
      default:
        newDate = currentDate;
    }
    onDateChange(newDate);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrevious}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <FiChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={handleNext}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <FiChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export default CalendarNavigation; 