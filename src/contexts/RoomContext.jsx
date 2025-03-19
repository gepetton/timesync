/**
 * 모임방 컨텍스트
 * 
 * 모임방의 전역 상태를 관리하는 Context입니다.
 * 모임 정보, 선택된 날짜, 모달 상태, 메시지, 불가능한 시간 슬롯 등을 관리하며,
 * 모임방 전반에 걸쳐 필요한 상태와 기능(업데이트, 검증 등)을 제공합니다.
 * 
 * 주요 기능:
 * - 모임 정보 관리 (제목, 시간대, 참여자, 불가능한 시간 슬롯 등)
 * - 날짜 선택 및 시간대 관리
 * - 모달 상태 관리 (시간 선택, 공유, 비밀번호 입력)
 * - 메시지 및 로딩 상태 관리
 * - 비밀번호 인증 및 관리
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { TIME_FRAME, DEFAULT_ROOM_DATA } from '@/constants/roomTypes';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { roomService } from '@/services/firebase/roomService'; // roomService import

// Context 객체 생성: RoomContext 를 통해 Provider 가 제공하는 값에 접근 가능
const RoomContext = createContext();

/**
 * 모임방 Provider 컴포넌트
 * 모임방의 전역 상태를 하위 컴포넌트들에게 제공합니다.
 * RoomContext.Provider 를 사용하여 Context API 를 통해 상태를 전달합니다.
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Provider 하위에 렌더링될 컴포넌트들
 */
export function RoomProvider({ children }) {
  // 모임 정보 상태 (모임 생성 및 정보 관리에 사용)
  const [room, setRoom] = useState({
    title: '',                              // 모임 제목
    timeFrame: TIME_FRAME.MONTH,            // 시간대 타입 (기본값: 월간)
    specificMonth: '',                      // 선택된 월
    specificWeek: '',                       // 선택된 주차
    memberCount: '',                        // 참여 인원 수
    unavailableSlotsByDate: {},           // 날짜별 불가능한 시간 슬롯 정보 (Firebase 데이터 구조와 일치)
    participants: [],                       // 참여자 목록 (미구현)
    password: '',                           // 방 비밀번호
    isPasswordProtected: false              // 비밀번호 보호 여부
  });
  // 선택된 날짜 상태 (캘린더 컴포넌트에서 날짜 선택 시 업데이트)
  const [selectedDate, setSelectedDate] = useState(null);
  // 시간 선택 모달 표시 상태 (시간 선택 모달의 visibility 제어)
  const [showTimeModal, setShowTimeModal] = useState(false);
  // 공유 모달 표시 상태 (공유 모달의 visibility 제어)
  const [showShareModal, setShowShareModal] = useState(false);
  // 채팅 메시지 목록 (챗봇 컴포넌트에서 메시지 목록 관리)
  const [messages, setMessages] = useState([]);
  // 로딩 상태 (API 호출, 데이터 처리 등 비동기 작업 상태 관리)
  const [loading, setLoading] = useState(false);
  // 비밀번호 인증 상태 (비밀번호 입력 모달, 방 접근 제어에 사용)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // 비밀번호 입력 모달 표시 상태 (비밀번호 입력 모달 visibility 제어)
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  /**
   * 모임 정보를 업데이트하는 함수 (useCallback 적용)
   * 
   * 기존 모임 정보 상태를 유지하면서 특정 속성만 업데이트합니다.
   * setRoom 의 함수형 업데이트를 사용하여 최신 상태를 기반으로 업데이트합니다.
   * 
   * @param {Object} updates - 업데이트할 모임 정보 (객체 형태)
   *                   예: { title: '새로운 제목', memberCount: 5 }
   */
  const updateRoom = useCallback((updates) => {
    setRoom(prevRoom => ({ // 함수형 업데이트: 최신 상태를 prevRoom 으로 받아 업데이트
      ...prevRoom,         // 기존 모임 정보 복사 (불변성 유지)
      ...updates          // 새 업데이트 덮어쓰기
    }));
  }, []); // updateRoom 함수는 room 상태에 의존하지 않으므로 빈 dependency 배열

  /**
   * 날짜 선택 핸들러 (useCallback 적용)
   * 
   * 캘린더 컴포넌트에서 날짜 선택 시 호출되는 핸들러입니다.
   * 선택된 날짜 상태를 업데이트하고, 시간 선택 모달을 표시합니다.
   * 
   * @param {Date} date - 선택된 날짜 (Date 객체)
   * @param {string} type - 시간대 타입 (연/월/주/일 - 현재는 'day' 만 사용)
   */
  const handleDateSelect = useCallback((date, type) => {
    setSelectedDate(date);         // 선택된 날짜 상태 업데이트
    setShowTimeModal(true);     // 시간 선택 모달 표시
  }, []); // handleDateSelect 함수는 외부 상태에 의존하지 않으므로 빈 dependency 배열

  /**
   * 불가능한 시간 처리 함수 (useCallback 적용)
   * 
   * 챗봇 컴포넌트에서 Gemini API 응답(불가능한 시간 슬롯)을 받아 호출됩니다.
   * API 응답 데이터를 파싱하고, Firebase Realtime Database 를 업데이트합니다.
   * 
   * @param {Date} date - 선택된 날짜 (Date 객체)
   * @param {Array<Object>} unavailableTimes - Gemini API 응답 기반 불가능한 시간 슬롯 목록
   *                 예: [{ start: '2025-03-10T10:00:00.000Z', end: '2025-03-10T11:00:00.000Z' }, ...]
   */
  const processUnavailableTimes = useCallback(async (date, unavailableTimes) => {
    setLoading(true); // 로딩 시작

    try {
      const dateKey = format(date, 'yyyy-MM-dd'); // 날짜를 Firebase 데이터 구조의 key 형식으로 변환

      // Firebase 에 업데이트할 불가능한 시간 슬롯 데이터 (객체)
      const updates = {}; 
      unavailableTimes.forEach(slot => {
        const startHour = format(new Date(slot.start), 'HH'); // 시작 시간 (HH) 추출
        updates[`unavailableSlotsByDate.${dateKey}.${startHour}.00`] = true; // 1시간 단위 불가능 슬롯 설정
      });

      await roomService.updateRoom(room.id, updates); // Firebase Realtime Database 업데이트
      setMessages(prevMessages => [ ...prevMessages, { // 챗봇 메시지 업데이트 (성공 메시지)
        role: 'assistant', 
        content: '불가능한 시간을 캘린더에 반영했습니다.' 
      }]);
    } catch (error) {
      console.error('불가능한 시간 처리 중 오류 발생:', error);
      setMessages(prevMessages => [ ...prevMessages, { // 챗봇 메시지 업데이트 (에러 메시지)
        role: 'assistant', 
        content: '불가능한 시간 반영에 실패했습니다. 다시 시도해주세요.' 
      }]);
    } finally {
      setLoading(false); // 로딩 종료
      setShowTimeModal(false); // 시간 선택 모달 닫기
    }
  }, [room.id, roomService, format, setLoading, setMessages, setShowTimeModal]); // useCallback dependencies 명시

  /**
   * 시간 슬롯 가능 여부 확인 함수
   * 
   * 특정 날짜, 특정 시간 슬롯이 가능한 시간인지 (불가능한 시간으로 설정되지 않았는지) 확인합니다.
   * 
   * @param {Date} date - 확인할 날짜 (Date 객체)
   * @param {string} time - 확인할 시간 (HH:mm 형식, 예: '09:00')
   * @returns {boolean} - true: 가능, false: 불가능
   */
  const checkTimeAvailability = useCallback((date, time) => {
    if (!room.unavailableSlotsByDate) return true; // 불가능한 시간 정보가 없으면 항상 가능

    const dateKey = format(date, 'yyyy-MM-dd'); // 날짜 key 생성
    const hour = time.split(':')[0];           // 시간 (HH) 추출

    // 해당 날짜, 시간에 불가능 슬롯 정보가 있는지 확인
    return !(room.unavailableSlotsByDate[dateKey] && room.unavailableSlotsByDate[dateKey][hour] && room.unavailableSlotsByDate[dateKey][hour]['00']);
  }, [room.unavailableSlotsByDate, format]); // useCallback dependencies 명시

  /**
   * 시간 슬롯 잠금 여부 확인 함수 (미구현)
   * 
   * 특정 시간 슬롯이 다른 사용자에 의해 이미 선택되었는지 (잠금 상태인지) 확인합니다.
   * 현재는 미구현 상태이며, 추후 동시성 제어 로직 구현 시 사용될 수 있습니다.
   * 
   * @param {Date} date - 확인할 날짜 (Date 객체)
   * @param {string} time - 확인할 시간 (HH:mm 형식, 예: '09:00')
   * @returns {boolean} - true: 잠금, false: 잠금 해제
   */
  const isTimeSlotLocked = useCallback((date, time) => {
    // TODO: 시간 슬롯 잠금 여부 확인 로직 구현 (동시성 제어)
    return false; // 현재는 항상 잠금 해제 상태 반환
  }, []); // isTimeSlotLocked 함수는 외부 상태에 의존하지 않으므로 빈 dependency 배열

  /**
   * 비밀번호 검증 함수 (useCallback 적용)
   * 
   * 사용자가 입력한 비밀번호와 방 비밀번호를 비교하여 일치 여부를 반환합니다.
   * 
   * @param {string} inputPassword - 사용자가 입력한 비밀번호
   * @returns {boolean} 비밀번호 일치 여부 (true: 일치, false: 불일치)
   */
  const verifyPassword = useCallback((inputPassword) => {
    if (!room.isPasswordProtected) return true; // 비밀번호 보호 방 아니면 항상 true
    const isValid = inputPassword === room.password; // 입력 비밀번호와 방 비밀번호 비교
    setIsAuthenticated(isValid);                 // 인증 상태 업데이트
    return isValid;                              // 비밀번호 일치 여부 반환
  }, [room.password, room.isPasswordProtected]); // verifyPassword dependencies 명시

  /**
   * 방 비밀번호 설정 함수 (useCallback 적용)
   * 
   * 모임 정보 상태에 방 비밀번호를 설정하고, 비밀번호 보호 여부를 업데이트합니다.
   * 
   * @param {string} password - 설정할 비밀번호
   */
  const setRoomPassword = useCallback((password) => {
    updateRoom({ // updateRoom 함수를 사용하여 모임 정보 업데이트
      password,                             // 비밀번호 설정
      isPasswordProtected: Boolean(password) // 비밀번호 유무에 따라 보호 여부 설정
    });
    setIsAuthenticated(true);              // 비밀번호 설정 후 인증 상태 true 로 설정
  }, [updateRoom]); // setRoomPassword dependencies: updateRoom

  // Context Provider 가 하위 컴포넌트에게 제공하는 값 묶음 (value 객체)
  const value = {
    room,                     // 현재 모임 정보 상태
    setRoom,                  // 모임 정보 상태 설정 함수 (직접 설정 - 주의!)
    updateRoom,               // 모임 정보 업데이트 함수 (부분 업데이트 권장)
    selectedDate,             // 선택된 날짜 상태
    setSelectedDate,          // 선택된 날짜 상태 설정 함수
    showTimeModal,            // 시간 선택 모달 표시 여부 상태
    setShowTimeModal,         // 시간 선택 모달 표시 상태 설정 함수
    showShareModal,           // 공유 모달 표시 여부 상태
    setShowShareModal,        // 공유 모달 표시 상태 설정 함수
    messages,                 // 채팅 메시지 목록 상태
    setMessages,              // 채팅 메시지 목록 설정 함수
    loading,                  // 로딩 상태
    setLoading,               // 로딩 상태 설정 함수
    handleDateSelect,         // 날짜 선택 핸들러 함수
    isAuthenticated,          // 비밀번호 인증 상태
    setIsAuthenticated,       // 비밀번호 인증 상태 설정 함수
    showPasswordModal,        // 비밀번호 입력 모달 표시 여부 상태
    setShowPasswordModal,     // 비밀번호 입력 모달 표시 상태 설정 함수
    verifyPassword,           // 비밀번호 검증 함수
    setRoomPassword,          // 방 비밀번호 설정 함수
    processUnavailableTimes,  // 불가능한 시간 처리 함수 (API 응답 처리, Firebase 업데이트)
    checkTimeAvailability,    // 시간 슬롯 가능 여부 확인 함수
    isTimeSlotLocked          // 시간 슬롯 잠금 여부 확인 함수 (미구현)
  };

  return (
    <RoomContext.Provider value={value}>
      {children} {/* children: RoomProvider 로 감싸진 하위 컴포넌트 트 */}
    </RoomContext.Provider>
  );
}

/**
 * 모임방 Context 사용을 위한 커스텀 훅 (Hook)
 * 
 * 함수형 컴포넌트에서 RoomContext 의 값에 편리하게 접근할 수 있도록 제공하는 Hook 입니다.
 * RoomProvider 컴포넌트 내에서 렌더링되는 하위 컴포넌트만 useRoomContext 훅을 통해 Context 값을 사용할 수 있습니다.
 * 
 * @throws {Error} RoomProvider 외부에서 Hook 호출 시 에러 발생
 * @returns {Object} RoomContext 값 (Provider 가 제공하는 value 객체)
 */
export function useRoomContext() {
  const context = useContext(RoomContext); // useContext 훅으로 Context 값Consumer
  if (!context) {
    // Context Provider 밖에서 Hook 을 사용하려고 할 때 에러 throw
    throw new Error('useRoomContext must be used within a RoomProvider');
  }
  return context; // Context 값 반환
}