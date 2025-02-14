/**
 * 모임방 컨텍스트
 * 
 * 모임방의 전역 상태를 관리하는 Context입니다.
 * 모임 정보, 선택된 날짜, 모달 상태, 메시지 등
 * 모임방 전반에 걸쳐 필요한 상태와 기능을 제공합니다.
 * 
 * 주요 기능:
 * - 모임 정보 관리 (제목, 시간대, 참여자 등)
 * - 날짜 선택 및 시간대 관리
 * - 모달 상태 관리 (시간 선택, 공유)
 * - 메시지 및 로딩 상태 관리
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { TIME_FRAME, DEFAULT_ROOM_DATA } from '@/constants/roomTypes';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// Context 객체 생성
const RoomContext = createContext();

/**
 * 모임방 Provider 컴포넌트
 * 모임방의 전역 상태를 하위 컴포넌트들에게 제공합니다.
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Provider 하위에 렌더링될 컴포넌트들
 */
export function RoomProvider({ children }) {
  // 모임 정보 상태
  const [room, setRoom] = useState(DEFAULT_ROOM_DATA);
  // 선택된 날짜 상태
  const [selectedDate, setSelectedDate] = useState(null);
  // 시간 선택 모달 표시 상태
  const [showTimeModal, setShowTimeModal] = useState(false);
  // 공유 모달 표시 상태
  const [showShareModal, setShowShareModal] = useState(false);
  // 채팅 메시지 목록
  const [messages, setMessages] = useState([]);
  // 로딩 상태
  const [loading, setLoading] = useState(false);

  /**
   * 모임 정보를 업데이트하는 함수
   * 기존 정보를 유지하면서 부분적인 업데이트를 수행합니다.
   * 
   * @param {Object} updates - 업데이트할 모임 정보
   */
  const updateRoom = useCallback((updates) => {
    setRoom(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  /**
   * 날짜 선택 핸들러
   * 선택된 날짜와 시간대 타입에 따라 모임 정보를 업데이트합니다.
   * 
   * @param {Date} date - 선택된 날짜
   * @param {string} type - 시간대 타입 (연/월/주/일)
   */
  const handleDateSelect = useCallback((date, type) => {
    switch (type) {
      case TIME_FRAME.YEAR:
        // 연도 선택 시 해당 연도로 업데이트하고 하위 시간대 초기화
        updateRoom({
          timeFrame: TIME_FRAME.YEAR,
          specificYear: date.getFullYear(),
          specificMonth: '',
          specificWeek: '',
          specificDate: ''
        });
        break;
      case TIME_FRAME.MONTH:
        // 월 선택 시 해당 월로 업데이트하고 하위 시간대 초기화
        updateRoom({
          timeFrame: TIME_FRAME.MONTH,
          specificMonth: date.getMonth() + 1,
          specificWeek: '',
          specificDate: ''
        });
        break;
      case TIME_FRAME.WEEK:
        // 주 선택 시 해당 주차 정보로 업데이트
        const weekNumber = format(date, 'w');
        updateRoom({
          timeFrame: TIME_FRAME.WEEK,
          specificMonth: date.getMonth() + 1,
          specificWeek: `${weekNumber}주차`,
          specificDate: ''
        });
        break;
      case TIME_FRAME.DAY:
        // 일자 선택 시 해당 날짜로 업데이트하고 시간 선택 모달 표시
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

  // Context에 제공할 값들을 객체로 구성
  const value = {
    room,             // 모임 정보
    setRoom,          // 모임 정보 설정 함수
    updateRoom,       // 모임 정보 업데이트 함수
    selectedDate,     // 선택된 날짜
    setSelectedDate,  // 선택된 날짜 설정 함수
    showTimeModal,    // 시간 선택 모달 표시 여부
    setShowTimeModal, // 시간 선택 모달 표시 설정 함수
    showShareModal,   // 공유 모달 표시 여부
    setShowShareModal,// 공유 모달 표시 설정 함수
    messages,         // 채팅 메시지 목록
    setMessages,      // 채팅 메시지 설정 함수
    loading,          // 로딩 상태
    setLoading,       // 로딩 상태 설정 함수
    handleDateSelect  // 날짜 선택 핸들러
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
}

/**
 * 모임방 Context 사용을 위한 커스텀 훅
 * RoomProvider 내부에서만 사용 가능합니다.
 * 
 * @throws {Error} Provider 외부에서 사용 시 에러 발생
 * @returns {Object} 모임방 Context 값
 */
export function useRoomContext() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoomContext must be used within a RoomProvider');
  }
  return context;
} 