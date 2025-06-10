import {
  ref,
  set,
  get,
  update,
  push,
  onValue,
  off,
  serverTimestamp,
} from 'firebase/database';
import { database } from './config';

const ROOMS_PATH = 'rooms';

export const roomService = {
  // 새로운 방 생성
  async createRoom(roomId, roomData) {
    try {
      const roomRef = ref(database, `${ROOMS_PATH}/${roomId}`);
      
      const roomStructure = {
        info: {
          ...roomData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      };

      await set(roomRef, roomStructure);
      return true;
    } catch (error) {
      console.error('방 생성 중 오류 발생:', error);
      throw new Error(`방 생성 실패: ${error.message}`);
    }
  },

  // 방 정보 가져오기
  async getRoom(roomId) {
    try {
      const roomRef = ref(database, `${ROOMS_PATH}/${roomId}`);
      const snapshot = await get(roomRef);
      
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error('방 정보 조회 중 오류 발생:', error);
      throw new Error(`방 정보 조회 실패: ${error.message}`);
    }
  },

  // 범용 방 업데이트 (RoomContext에서 사용)
  async updateRoom(roomId, updates) {
    try {
      const roomRef = ref(database, `${ROOMS_PATH}/${roomId}`);
      const updateData = {};
      
      // 중첩된 경로를 평면화
      Object.entries(updates).forEach(([key, value]) => {
        updateData[key] = value;
      });
      
      // updatedAt 자동 추가
      updateData['info/updatedAt'] = serverTimestamp();
      
      await update(roomRef, updateData);
      return true;
    } catch (error) {
      console.error('방 업데이트 중 오류 발생:', error);
      throw new Error(`방 업데이트 실패: ${error.message}`);
    }
  },

  // 방 기본 정보 업데이트
  async updateRoomInfo(roomId, updates) {
    try {
      const roomInfoRef = ref(database, `${ROOMS_PATH}/${roomId}/info`);
      await update(roomInfoRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('방 정보 업데이트 중 오류 발생:', error);
      throw new Error(`방 정보 업데이트 실패: ${error.message}`);
    }
  },

  // 불가능한 시간 구간 업데이트
  async updateUnavailableSlots(roomId, date, timeSlots) {
    try {
      const updates = {
        [`info/unavailableSlotsByDate/${date}`]: timeSlots,
        'info/updatedAt': serverTimestamp()
      };
      
      const roomRef = ref(database, `${ROOMS_PATH}/${roomId}`);
      await update(roomRef, updates);
      return true;
    } catch (error) {
      console.error('불가능한 시간 구간 업데이트 중 오류 발생:', error);
      throw new Error(`불가능한 시간 구간 업데이트 실패: ${error.message}`);
    }
  },

  // 실시간 방 정보 구독
  subscribeToRoom(roomId, callback, errorCallback = null) {
    const roomRef = ref(database, `${ROOMS_PATH}/${roomId}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('방 구독 중 오류 발생:', error);
      if (errorCallback) errorCallback(error);
    });

    return () => off(roomRef, 'value', unsubscribe);
  },

  // 실시간 방 정보만 구독 (성능 최적화)
  subscribeToRoomInfo(roomId, callback, errorCallback = null) {
    const roomInfoRef = ref(database, `${ROOMS_PATH}/${roomId}/info`);
    
    const unsubscribe = onValue(roomInfoRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('방 정보 구독 중 오류 발생:', error);
      if (errorCallback) errorCallback(error);
    });

    return () => off(roomInfoRef, 'value', unsubscribe);
  },

  // 최적의 모임 시간 찾기
  async findOptimalMeetingTimes(roomId, date) {
    try {
      // 불가능한 시간 구간만 확인
      const room = await this.getRoom(roomId);
      const unavailableSlots = room?.info?.unavailableSlotsByDate?.[date] || [];
      
      const timeSlots = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
      const optimalTimes = [];

      timeSlots.forEach(hour => {
        // 불가능한 시간 구간에 포함되지 않는 시간만 추가
        const isUnavailable = unavailableSlots.some(slot => {
          const hourNum = parseInt(hour);
          const startHour = parseInt(slot.start.split(':')[0]);
          const endHour = parseInt(slot.end.split(':')[0]);
          return hourNum >= startHour && hourNum < endHour;
        });

        if (!isUnavailable) {
          optimalTimes.push({
            hour,
            score: 1 // 모든 가능한 시간은 동일한 점수
          });
        }
      });

      return optimalTimes;
    } catch (error) {
      console.error('최적 시간 찾기 중 오류 발생:', error);
      throw new Error(`최적 시간 찾기 실패: ${error.message}`);
    }
  },

  // 방 존재 여부 확인
  async roomExists(roomId) {
    try {
      const roomRef = ref(database, `${ROOMS_PATH}/${roomId}`);
      const snapshot = await get(roomRef);
      return snapshot.exists();
    } catch (error) {
      console.error('방 존재 확인 중 오류 발생:', error);
      return false;
    }
  },

  // 배치 업데이트 (성능 최적화)
  async batchUpdate(updates) {
    try {
      await update(ref(database), updates);
      return true;
    } catch (error) {
      console.error('배치 업데이트 중 오류 발생:', error);
      throw new Error(`배치 업데이트 실패: ${error.message}`);
    }
  }
};