/**
 * 모임방 Context
 * 모임 정보, 날짜 선택, 모달 상태, 메시지 등을 전역으로 관리
 */
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { TIME_FRAME } from '@/constants/roomTypes';
import { format } from 'date-fns';
import { roomService } from '@/services/firebase/roomService';

const RoomContext = createContext();

/**
 * 모임방 Provider 컴포넌트
 * @param {Object} props
 * @param {ReactNode} props.children - 하위 컴포넌트들
 */
export function RoomProvider({ children }) {
  // 모임 정보 상태
  const [room, setRoom] = useState({
    title: '',
    timeFrame: TIME_FRAME.MONTH,
    specificMonth: '',
    specificWeek: '',
    memberCount: '',
    unavailableSlotsByDate: {},
    password: '',
    isPasswordProtected: false
  });
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  /**
   * 모임 정보 업데이트
   * @param {Object} updates - 업데이트할 정보
   */
  const updateRoom = useCallback((updates) => {
    setRoom(prevRoom => ({
      ...prevRoom,
      ...updates
    }));
  }, []);

  /**
   * 날짜 선택 핸들러
   * @param {Date} date - 선택된 날짜
   * @param {string} type - 시간대 타입
   */
  const handleDateSelect = useCallback((date, type) => {
    setSelectedDate(date);
    setShowTimeModal(true);
  }, []);

  /**
   * 불가능한 시간 처리 함수
   * @param {Date} date - 선택된 날짜
   * @param {Array} unavailableTimes - 불가능한 시간 슬롯 목록
   */
  const processUnavailableTimes = useCallback(async (date, unavailableTimes) => {
    setLoading(true);

    try {
      // YYYYMMDD 형식으로 날짜 키 생성 (Firebase 호환)
      const dateKey = format(date, 'yyyyMMdd');

      // 새로운 구조에 맞게 시간 구간 변환
      const timeSlots = unavailableTimes.map(slot => {
        // 24:00을 23:59로 변환
        const normalizeTime = (timeStr) => {
          if (timeStr === '24:00') return '23:59';
          return timeStr;
        };

        let startTime, endTime;
        
        try {
          const startDate = new Date(slot.start);
          const endDate = new Date(slot.end);
          
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.warn('⚠️ 잘못된 시간 형식, 문자열로 파싱 시도:', slot);
            // 문자열에서 직접 시간 추출 시도
            const startStr = slot.start.toString();
            const endStr = slot.end.toString();
            
            if (startStr.includes('T')) {
              startTime = normalizeTime(startStr.split('T')[1].substring(0, 5));
            } else {
              startTime = normalizeTime(startStr.substring(0, 5));
            }
            
            if (endStr.includes('T')) {
              endTime = normalizeTime(endStr.split('T')[1].substring(0, 5));
            } else {
              endTime = normalizeTime(endStr.substring(0, 5));
            }
          } else {
            startTime = normalizeTime(format(startDate, 'HH:mm'));
            endTime = normalizeTime(format(endDate, 'HH:mm'));
          }
        } catch (error) {
          console.error('❌ 시간 변환 오류:', error, slot);
          // 기본값으로 설정
          startTime = '00:00';
          endTime = '23:59';
        }

        return {
          start: startTime,
          end: endTime
        };
      });

      console.log('📝 변환된 데이터:', { dateKey, timeSlots });

      // Firebase 업데이트
      const updates = {
        [`info/unavailableSlotsByDate/${dateKey}`]: timeSlots
      };

      console.log('🔥 Firebase 업데이트 시작:', { roomId: room.id, updates });
      await roomService.updateRoom(room.id, updates);
      console.log('✅ Firebase 업데이트 완료');
      
      // 로컬 상태 업데이트
      const newUnavailableSlots = {
        ...room.unavailableSlotsByDate,
        [dateKey]: timeSlots
      };
      
      console.log('🔄 로컬 상태 업데이트:', { 
        기존: room.unavailableSlotsByDate, 
        새로운: newUnavailableSlots 
      });
      
      updateRoom({
        unavailableSlotsByDate: newUnavailableSlots
      });

      console.log('✅ 로컬 상태 업데이트 완료');

      setMessages(prevMessages => [...prevMessages, {
        role: 'assistant', 
        content: '불가능한 시간을 캘린더에 반영했습니다.'
      }]);
    } catch (error) {
      console.error('❌ 불가능한 시간 처리 중 오류 발생:', error);
      setMessages(prevMessages => [...prevMessages, {
        role: 'assistant', 
        content: '불가능한 시간 반영에 실패했습니다. 다시 시도해주세요.'
      }]);
    } finally {
      setLoading(false);
      setShowTimeModal(false);
    }
  }, [room.id, room.unavailableSlotsByDate, updateRoom]);

  /**
   * 시간 슬롯 가능 여부 확인
   * @param {Date} date - 확인할 날짜
   * @param {string} time - 확인할 시간 (HH:mm)
   * @returns {boolean} - true: 가능, false: 불가능
   */
  const checkTimeAvailability = useMemo(() => {
    return (date, time) => {
      if (!room.unavailableSlotsByDate) {
        return true;
      }

      // YYYYMMDD 형식으로 날짜 키 생성
      const dateKey = format(date, 'yyyyMMdd');
      const unavailableSlots = room.unavailableSlotsByDate[dateKey];

      if (!unavailableSlots || !Array.isArray(unavailableSlots)) {
        return true;
      }

      // 시간 구간 겹침 확인
      const result = !unavailableSlots.some(slot => {
        const timeToMinutes = (timeStr) => {
          const [hours, minutes] = timeStr.split(':').map(Number);
          return hours * 60 + minutes;
        };
        
        const checkMinutes = timeToMinutes(time);
        const startMinutes = timeToMinutes(slot.start);
        const endMinutes = timeToMinutes(slot.end);
        
        const isInRange = checkMinutes >= startMinutes && checkMinutes < endMinutes;
        
        return isInRange;
      });

      return result;
    };
  }, [room.unavailableSlotsByDate]);

  /**
   * 시간 슬롯 잠금 여부 확인 (미구현)
   * @param {Date} date - 확인할 날짜
   * @param {string} time - 확인할 시간
   * @returns {boolean} - 항상 false
   */
  const isTimeSlotLocked = useCallback((date, time) => {
    // TODO: 동시성 제어 로직 구현
    return false;
  }, []);

  /**
   * 비밀번호 검증
   * @param {string} inputPassword - 입력된 비밀번호
   * @returns {boolean} 일치 여부
   */
  const verifyPassword = useCallback((inputPassword) => {
    if (!room.isPasswordProtected) return true;
    const isValid = inputPassword === room.password;
    setIsAuthenticated(isValid);
    return isValid;
  }, [room.password, room.isPasswordProtected]);

  /**
   * 방 비밀번호 설정
   * @param {string} password - 설정할 비밀번호
   */
  const setRoomPassword = useCallback((password) => {
    updateRoom({
      password,
      isPasswordProtected: Boolean(password)
    });
    setIsAuthenticated(true);
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
    handleDateSelect,
    isAuthenticated,
    setIsAuthenticated,
    showPasswordModal,
    setShowPasswordModal,
    verifyPassword,
    setRoomPassword,
    processUnavailableTimes,
    checkTimeAvailability,
    isTimeSlotLocked
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
}

/**
 * 모임방 Context 사용을 위한 커스텀 훅
 * @throws {Error} RoomProvider 외부에서 사용 시 에러
 * @returns {Object} RoomContext 값
 */
export function useRoomContext() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoomContext must be used within a RoomProvider');
  }
  return context;
}