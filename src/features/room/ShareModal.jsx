import { FiX } from 'react-icons/fi';
import ShareLink from '@/features/room/ShareLink';
import { useRoomContext } from '@/contexts/RoomContext';

function ShareModal({ roomId, onClose }) {
  const { room } = useRoomContext();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">공유하기</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <ShareLink roomId={roomId} roomTitle={room?.title} />
        </div>
      </div>
    </div>
  );
}

export default ShareModal; 