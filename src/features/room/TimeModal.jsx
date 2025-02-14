import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FiX } from 'react-icons/fi';
import DayView from '@/features/calendar/DayView';
import { useRoomContext } from '@/contexts/RoomContext';

function TimeModal() {
  const { 
    room,
    selectedDate,
    showTimeModal,
    setShowTimeModal
  } = useRoomContext();

  if (!showTimeModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {format(selectedDate, 'yyyy년 M월 d일', { locale: ko })}
            </h3>
            <button 
              onClick={() => setShowTimeModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto">
          <DayView
            date={selectedDate}
            availableSlots={room?.availableSlots || []}
            startDate={room?.specificDate}
            endDate={room?.specificDate}
          />
        </div>
      </div>
    </div>
  );
}

export default TimeModal; 