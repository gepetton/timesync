import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Calendar from '../calendar/Calendar';
import ChatBot from '../chat/ChatBot';
import ShareLink from './ShareLink';
import { eventChannel } from '../../services/eventChannel';

function RoomView() {
  const { roomId } = useParams();
  const [roomData, setRoomData] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // 초기 데이터 로드
    const data = JSON.parse(localStorage.getItem(`room_${roomId}`));
    setRoomData(data);

    // 실시간 업데이트 구독
    const unsubscribe = eventChannel.subscribe((event) => {
      if (event.roomId === roomId) {
        setRoomData(event.data);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  return (
    <div className="flex h-screen">
      {/* 왼쪽: 캘린더 */}
      <div className="w-2/3 p-4">
        <h1 className="text-2xl font-bold mb-4">{roomData?.title}</h1>
        <Calendar
          viewType={roomData?.viewType}
          availableSlots={roomData?.availableSlots}
        />
      </div>

      {/* 오른쪽: 채팅 & 공유 */}
      <div className="w-1/3 border-l">
        <ShareLink roomId={roomId} />
        <ChatBot
          messages={messages}
          setMessages={setMessages}
          roomData={roomData}
        />
      </div>
    </div>
  );
}

export default RoomView; 