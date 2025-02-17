import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

const ROOMS_COLLECTION = 'rooms';

export const roomService = {
  // 새로운 방 생성
  async createRoom(roomId, roomData) {
    try {
      const roomsCollection = collection(db, ROOMS_COLLECTION);
      const roomRef = doc(roomsCollection, roomId);

      await setDoc(roomRef, {
        ...roomData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        unavailableSlotsByDate: {} // Initialize unavailableSlotsByDate as empty
      });
      return true;
    } catch (error) {
      console.error('방 생성 중 오류 발생:', error);
      throw new Error(`방 생성 실패: ${error.message}`);
    }
  },

  // 방 정보 가져오기
  async getRoom(roomId) {
    try {
      const roomsCollection = collection(db, ROOMS_COLLECTION);
      const roomRef = doc(roomsCollection, roomId);
      const roomSnap = await getDoc(roomRef);

      if (roomSnap.exists()) {
        return roomSnap.data();
      }
      return null;
    } catch (error) {
      console.error('방 정보 조회 중 오류 발생:', error);
      throw new Error(`방 정보 조회 실패: ${error.message}`);
    }
  },

  // 방 정보 업데이트
  async updateRoom(roomId, updates) {
    try {
      const roomsCollection = collection(db, ROOMS_COLLECTION);
      const roomRef = doc(roomsCollection, roomId);
      await updateDoc(roomRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('방 정보 업데이트 중 오류 발생:', error);
      throw new Error(`방 정보 업데이트 실패: ${error.message}`);
    }
  },

  // 실시간 방 정보 구독
  subscribeToRoom(roomId, callback) {
    const roomsCollection = collection(db, ROOMS_COLLECTION);
    const roomRef = doc(roomsCollection, roomId);
    return onSnapshot(
      roomRef,
      (doc) => {
        if (doc.exists()) {
          callback(doc.data());
        }
      },
      (error) => {
        console.error('방 구독 중 오류 발생:', error);
      }
    );
  },
};