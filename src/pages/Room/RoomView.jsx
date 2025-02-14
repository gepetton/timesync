import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRoomContext } from '@/contexts/RoomContext';
import localStore from '@/services/storage/localStore';
import RoomHeader from '@/features/room/RoomHeader';
import RoomCalendar from '@/features/room/RoomCalendar';
import TimeModal from '@/features/room/TimeModal';
import ShareModal from '@/features/room/ShareModal';
import ChatSection from '@/features/room/ChatSection';

/**
 * 방 페이지 컴포넌트
 * 방의 정보를 표시하고, 캘린더와 채팅 섹션을 포함합니다.
 * localStorage에서 방 데이터를 불러와 표시하며, 
 * 로딩 중에는 로딩 스피너를 표시합니다.
 */
function RoomView() {
  // URL 파라미터에서 방 ID를 가져옵니다
  const { roomId } = useParams();
  
  // RoomContext에서 필요한 상태와 함수들을 가져옵니다
  const { 
    setRoom,        // 방 정보를 설정하는 함수
    loading,        // 로딩 상태
    setLoading,     // 로딩 상태를 설정하는 함수
    showShareModal, // 공유 모달 표시 여부
    setShowShareModal // 공유 모달 표시 여부를 설정하는 함수
  } = useRoomContext();

  // 컴포넌트가 마운트되거나 roomId가 변경될 때 방 데이터를 불러옵니다
  useEffect(() => {
    const loadRoomData = async () => {
      setLoading(true);
      try {
        // localStorage에서 방 데이터를 불러옵니다
        const data = localStore.get(`room_${roomId}`);
        if (data) {
          setRoom(data); // 불러온 데이터로 방 정보를 설정합니다
        }
      } catch (error) {
        console.error('Error loading room data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoomData();
  }, [roomId, setRoom, setLoading]);

  // 로딩 중일 때는 로딩 스피너를 표시합니다
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50/90 via-white to-indigo-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  // 메인 레이아웃을 렌더링합니다
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50/90 via-white to-indigo-50/50">
      {/* 방 헤더 섹션 */}
      <RoomHeader onShareClick={() => setShowShareModal(true)} />
      
      {/* 메인 콘텐츠 영역 */}
      <div className="flex flex-1 overflow-hidden">
        <RoomCalendar /> {/* 캘린더 섹션 */}
        <ChatSection />  {/* 채팅 섹션 */}
      </div>

      {/* 모달 컴포넌트들 */}
      <TimeModal /> {/* 시간 선택 모달 */}
      {showShareModal && <ShareModal roomId={roomId} onClose={() => setShowShareModal(false)} />} {/* 공유 모달 */}
    </div>
  );
}

export default RoomView; 