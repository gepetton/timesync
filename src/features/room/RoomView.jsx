import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRoomContext } from '@/contexts/RoomContext';
import RoomHeader from './components/RoomHeader';
import RoomCalendar from './components/RoomCalendar';
import TimeModal from './components/TimeModal';
import ShareModal from './components/ShareModal';
import ChatSection from './components/ChatSection';

function RoomView() {
  const { roomId } = useParams();
  const { 
    setRoom,
    loading,
    setLoading,
    showShareModal,
    setShowShareModal
  } = useRoomContext();

  useEffect(() => {
    const loadRoomData = async () => {
      setLoading(true);
      try {
        const data = JSON.parse(localStorage.getItem(`room_${roomId}`));
        setRoom(data);
      } catch (error) {
        console.error('Error loading room data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoomData();
  }, [roomId, setRoom, setLoading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50/90 via-white to-indigo-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50/90 via-white to-indigo-50/50">
      <RoomHeader onShareClick={() => setShowShareModal(true)} />
      
      <div className="flex flex-1 overflow-hidden">
        <RoomCalendar />
        <ChatSection />
      </div>

      <TimeModal />
      {showShareModal && <ShareModal roomId={roomId} onClose={() => setShowShareModal(false)} />}
    </div>
  );
}

export default RoomView; 