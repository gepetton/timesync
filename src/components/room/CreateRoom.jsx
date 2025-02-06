import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateRoomId } from '../../utils/shareUtils';

function CreateRoom() {
  const [roomTitle, setRoomTitle] = useState('');
  const [viewType, setViewType] = useState('month'); // month, week, day
  const navigate = useNavigate();

  const handleCreate = () => {
    const roomId = generateRoomId();
    const roomData = {
      id: roomId,
      title: roomTitle,
      viewType,
      createdAt: Date.now(),
      participants: [],
      availableSlots: []
    };
    
    localStorage.setItem(`room_${roomId}`, JSON.stringify(roomData));
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">새로운 모임 만들기</h2>
      <input
        type="text"
        value={roomTitle}
        onChange={(e) => setRoomTitle(e.target.value)}
        placeholder="모임 제목을 입력하세요"
        className="w-full p-2 border rounded mb-4"
      />
      <select
        value={viewType}
        onChange={(e) => setViewType(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="month">월간</option>
        <option value="week">주간</option>
        <option value="day">일간</option>
      </select>
      <button
        onClick={handleCreate}
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        모임 만들기
      </button>
    </div>
  );
}

export default CreateRoom; 