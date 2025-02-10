import { createContext, useContext, useState, useCallback } from 'react';
import { TIME_FRAME, DEFAULT_ROOM_DATA } from '@/constants/roomTypes';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const RoomContext = createContext();

export function RoomProvider({ children }) {
  const [room, setRoom] = useState(DEFAULT_ROOM_DATA);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const updateRoom = useCallback((updates) => {
    setRoom(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const handleDateSelect = useCallback((date, type) => {
    switch (type) {
      case TIME_FRAME.YEAR:
        updateRoom({
          timeFrame: TIME_FRAME.YEAR,
          specificYear: date.getFullYear(),
          specificMonth: '',
          specificWeek: '',
          specificDate: ''
        });
        break;
      case TIME_FRAME.MONTH:
        updateRoom({
          timeFrame: TIME_FRAME.MONTH,
          specificMonth: date.getMonth() + 1,
          specificWeek: '',
          specificDate: ''
        });
        break;
      case TIME_FRAME.WEEK:
        const weekNumber = format(date, 'w');
        updateRoom({
          timeFrame: TIME_FRAME.WEEK,
          specificMonth: date.getMonth() + 1,
          specificWeek: `${weekNumber}주차`,
          specificDate: ''
        });
        break;
      case TIME_FRAME.DAY:
        setSelectedDate(date);
        setShowTimeModal(true);
        updateRoom({
          timeFrame: TIME_FRAME.DAY,
          specificDate: format(date, 'yyyy-MM-dd')
        });
        break;
      default:
        break;
    }
  }, [updateRoom]);

  const value = {
    room,
    setRoom,
    updateRoom,
    selectedDate,
    setSelectedDate,
    showTimeModal,
    setShowTimeModal,
    showShareModal,
    setShowShareModal,
    messages,
    setMessages,
    loading,
    setLoading,
    handleDateSelect
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoomContext() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoomContext must be used within a RoomProvider');
  }
  return context;
} 