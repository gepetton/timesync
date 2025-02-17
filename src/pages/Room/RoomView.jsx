import { useEffect } from 'react'; // React의 useEffect 훅을 import합니다. 컴포넌트의 side effect를 관리하기 위해 사용됩니다. (데이터 fetching, 구독, DOM 조작 등)
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // react-router-dom에서 필요한 훅들을 import합니다. useParams: URL 파라미터 접근, useNavigate: 페이지 이동, useLocation: 현재 location 정보 접근에 사용됩니다.
import { useRoomContext } from '@/contexts/RoomContext'; // RoomContext에서 상태와 함수를 사용하기 위한 훅을 import합니다. 모임방 관련 전역 상태를 관리합니다.
import { roomService } from '@/services/firebase/roomService'; // Firebase의 roomService 모듈을 import합니다. Firestore 데이터베이스와 상호작용하여 방 데이터를 가져오고 구독하는 기능을 제공합니다.
import RoomHeader from '@/features/room/RoomHeader'; // RoomHeader 컴포넌트를 import합니다. 방 페이지의 헤더 영역을 담당합니다. (방 제목, 공유 버튼 등)
import RoomCalendar from '@/features/room/RoomCalendar'; // RoomCalendar 컴포넌트를 import합니다. 모임방의 캘린더 기능을 제공합니다. (날짜 선택, 시간 슬롯 확인 등)
import TimeModal from '@/features/room/TimeModal'; // TimeModal 컴포넌트를 import합니다. 시간 선택 모달을 표시합니다. (모임 가능 시간 설정 등)
import ShareModal from '@/features/room/ShareModal'; // ShareModal 컴포넌트를 import합니다. 공유 모달을 표시합니다. (방 링크 공유 기능 등)
import ChatSection from '@/features/room/ChatSection'; // ChatSection 컴포넌트를 import합니다. 채팅 기능을 제공합니다. (실시간 채팅 기능)
import PasswordModal from '@/features/room/PasswordModal'; // PasswordModal 컴포넌트를 import합니다. 비밀번호 입력 모달을 표시합니다. (비밀번호 방 입장 시 사용)

/**
 * 방 페이지 컴포넌트
 * 방의 정보를 표시하고, 캘린더와 채팅 섹션을 포함합니다.
 * localStorage에서 방 데이터를 불러와 표시하며,
 * 로딩 중이거나 비밀번호가 설정된 방의 경우 그에 맞는 UI를 표시합니다.
 */
function RoomView() {
  // URL 파라미터에서 방 ID를 추출합니다. useParams 훅은 현재 URL의 동적 세그먼트에 접근할 수 있게 해줍니다.
  const { roomId } = useParams();
  const navigate = useNavigate(); // useNavigate 훅은 페이지 이동을 위한 함수를 제공합니다.
  const location = useLocation(); // useLocation 훅은 현재 location 객체를 반환합니다. 페이지 이동 시 state를 통해 전달된 데이터를 접근하는 데 사용됩니다.

  // useRoomContext 훅을 사용하여 RoomContext에서 필요한 상태와 함수들을 가져옵니다.
  const {
    setRoom,        // 방 정보를 업데이트하는 함수 (RoomContext 상태 업데이트)
    room,          // 현재 방 정보 상태
    loading,       // 데이터 로딩 상태
    setLoading,    // 데이터 로딩 상태를 설정하는 함수
    showShareModal, // 공유 모달 표시 여부 상태
    setShowShareModal, // 공유 모달 표시 여부를 설정하는 함수
    isAuthenticated, // 방 비밀번호 인증 여부 상태
    setIsAuthenticated, // 방 비밀번호 인증 여부를 설정하는 함수
    showPasswordModal, // 비밀번호 모달 표시 여부 상태
    setShowPasswordModal, // 비밀번호 모달 표시 여부를 설정하는 함수
    setSelectedDate, // 캘린더에서 선택된 날짜 상태
    setShowTimeModal // 시간 선택 모달 표시 여부 상태
  } = useRoomContext();

  // useEffect 훅을 사용하여 컴포넌트가 마운트될 때와 roomId가 변경될 때 방 데이터를 불러오고 실시간 업데이트를 구독합니다.
  useEffect(() => {
    let unsubscribe; // Firestore 실시간 구독을 해제하기 위한 unsubscribe 함수를 저장할 변수입니다.

    const loadRoomData = async () => {
      setLoading(true); // 데이터 로딩 시작 전에 로딩 상태를 true로 설정하여 로딩 UI를 표시합니다.
      try {
        // roomService.getRoom 함수를 사용하여 Firestore에서 특정 roomId에 해당하는 방 데이터를 비동기적으로 불러옵니다.
        const data = await roomService.getRoom(roomId);
        if (data) {
          setRoom(data); // 불러온 방 데이터를 RoomContext의 room 상태에 설정합니다.

          // 페이지 이동 시 location.state를 통해 전달된 initialDate 정보가 있다면 캘린더의 선택된 날짜로 설정합니다.
          if (location.state?.initialDate) {
            setSelectedDate(new Date(location.state.initialDate));
          }

          // 방에 비밀번호가 설정되어 있고 아직 인증되지 않았다면 비밀번호 모달을 표시합니다.
          if (data.isPasswordProtected && !isAuthenticated) {
            setShowPasswordModal(true);
          }

          // roomService.subscribeToRoom 함수를 사용하여 특정 roomId에 해당하는 방 데이터의 실시간 업데이트를 구독합니다.
          // Firestore 문서가 업데이트될 때마다 콜백 함수가 실행되어 방 정보가 자동으로 업데이트됩니다.
          unsubscribe = roomService.subscribeToRoom(roomId, (updatedData) => {
            setRoom(updatedData); // 업데이트된 방 데이터로 RoomContext의 room 상태를 갱신합니다.
          });
        } else {
          // 방 데이터를 찾을 수 없는 경우 (roomService.getRoom이 null 반환), 홈 페이지('/')로 리다이렉트합니다.
          navigate('/', { replace: true }); // replace: true는 현재 페이지를 history 스택에서 교체하여 뒤로 가기 버튼으로 이전 페이지로 돌아갈 수 없게 합니다.
        }
      } catch (error) {
        // 데이터 로딩 중 에러가 발생한 경우 콘솔에 에러를 기록하고, 홈 페이지('/')로 리다이렉트합니다.
        console.error('Error loading room data:', error);
        navigate('/', { replace: true });
      } finally {
        setLoading(false); // 데이터 로딩이 완료되면 (성공 또는 실패) 로딩 상태를 false로 설정하여 로딩 UI를 숨깁니다.
      }
    };

    loadRoomData(); // 컴포넌트가 마운트될 때 loadRoomData 함수를 호출하여 방 데이터를 로드합니다.

    // useEffect 훅의 cleanup 함수입니다. 컴포넌트가 언마운트될 때 실행됩니다.
    return () => {
      if (unsubscribe) {
        unsubscribe(); // 컴포넌트가 언마운트될 때 Firestore 실시간 구독을 해제하여 메모리 누수를 방지합니다.
      }
    };
  }, [roomId, setRoom, setLoading, navigate, isAuthenticated, setShowPasswordModal, location.state, setSelectedDate]);
  // useEffect 훅의 dependency 배열입니다. 이 배열의 값이 변경될 때마다 useEffect 훅이 다시 실행됩니다.
  // roomId, setRoom, setLoading, navigate, isAuthenticated, setShowPasswordModal, location.state, setSelectedDate 가 변경될 때마다 useEffect가 다시 실행됩니다.

  // 로딩 중이거나 비밀번호로 보호된 방에 아직 인증되지 않은 경우 로딩 화면 또는 비밀번호 모달을 렌더링합니다.
  if (loading || (room?.isPasswordProtected && !isAuthenticated)) {
    return (
      // 화면 중앙에 로딩 스피너 또는 비밀번호 모달을 표시하는 flex 컨테이너입니다.
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50/90 via-white to-indigo-50/50">
        {loading ? (
          // loading 상태가 true이면 로딩 스피너를 표시합니다.
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        ) : (
          // loading 상태가 false이고, 비밀번호 방이면서 인증되지 않았다면 PasswordModal을 표시합니다.
          <PasswordModal />
        )}
      </div>
    );
  }

  // 로딩이 완료되었고, 비밀번호 인증이 완료되었거나 비밀번호 방이 아닌 경우 메인 방 페이지 레이아웃을 렌더링합니다.
  return (
    // 전체 페이지 레이아웃을 구성하는 flex 컨테이너입니다. flex-col을 사용하여 세로 방향으로 children 컴포넌트들을 배치합니다.
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50/90 via-white to-indigo-50/50">
      {/* RoomHeader 컴포넌트를 렌더링합니다. onShareClick props를 통해 공유 버튼 클릭 시 ShareModal을 표시하는 함수를 전달합니다. */}
      <RoomHeader onShareClick={() => setShowShareModal(true)} />

      {/* 메인 콘텐츠 영역을 flex 컨테이너로 감싸고, flex-1과 overflow-hidden 클래스를 적용하여 남은 공간을 모두 차지하고 내용이 넘칠 경우 숨깁니다. */}
      <div className="flex flex-1 overflow-hidden">
        <RoomCalendar /> {/* RoomCalendar 컴포넌트를 렌더링하여 캘린더 섹션을 표시합니다. */}
        <ChatSection />  {/* ChatSection 컴포넌트를 렌더링하여 채팅 섹션을 표시합니다. */}
      </div>

      {/* 모달 컴포넌트들을 렌더링합니다. TimeModal, ShareModal 컴포넌트는 필요에 따라 조건부로 렌더링될 수 있습니다. */}
      <TimeModal /> {/* TimeModal 컴포넌트를 렌더링합니다. 시간 선택 모달을 표시합니다. */}
      {showShareModal && <ShareModal roomId={roomId} onClose={() => setShowShareModal(false)} />} {/* showShareModal 상태가 true일 때 ShareModal 컴포넌트를 렌더링합니다. roomId와 onClose props를 전달합니다. */}

    </div>
  );
}

export default RoomView; // RoomView 컴포넌트를 export하여 다른 컴포넌트에서 사용할 수 있도록 합니다.