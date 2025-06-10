import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useRoomContext } from '@/contexts/RoomContext';
import { roomService } from '@/services/firebase/roomService';
import RoomHeader from './RoomHeader';
import RoomCalendar from './RoomCalendar';
import ShareModal from './ShareModal';
import ChatSection from './ChatSection';
import PasswordModal from './PasswordModal';
import TimeModal from '@/pages/Calendar/TimeModal';

/**
 * 방 페이지 컴포넌트
 * 방의 정보를 표시하고, 캘린더와 채팅 섹션을 포함합니다.
 */
function RoomView() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    setRoom,
    room,
    loading,
    setLoading,
    showShareModal,
    setShowShareModal,
    isAuthenticated,
    setIsAuthenticated,
    showPasswordModal,
    setShowPasswordModal,
    setSelectedDate,
    setShowTimeModal
  } = useRoomContext();

  // 방 데이터 로드 및 실시간 구독
  useEffect(() => {
    let unsubscribe;

    const loadRoomData = async () => {
      setLoading(true);
      try {
        const data = await roomService.getRoom(roomId);
        if (data) {
          setRoom(data.info);

          // 초기 날짜 설정
          if (location.state?.initialDate) {
            setSelectedDate(new Date(location.state.initialDate));
          }

          // 비밀번호 보호 방 확인
          if (data.info?.isPasswordProtected && !isAuthenticated) {
            setShowPasswordModal(true);
          }

          // 실시간 업데이트 구독
          unsubscribe = roomService.subscribeToRoom(roomId, (updatedData) => {
            setRoom(updatedData.info);
          });
        } else {
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Error loading room data:', error);
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadRoomData();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [roomId, setRoom, setLoading, navigate, isAuthenticated, setShowPasswordModal, location.state, setSelectedDate]);

  // 로딩 중이거나 인증이 필요한 경우
  if (loading || (room?.isPasswordProtected && !isAuthenticated)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50/90 via-white to-indigo-50/50">
        {loading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        ) : (
          <PasswordModal />
        )}
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

      {/* 모달들 */}
      {showShareModal && <ShareModal roomId={roomId} onClose={() => setShowShareModal(false)} />}
      <PasswordModal />
      <TimeModal />
    </div>
  );
}

export default RoomView;