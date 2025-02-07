// import { deepseekClient } from '../deepseek/client';
// import { generateRoomId } from '../utils/roomUtils';
// import { analyzeTime } from '../deepseek/client';

// export const roomService = {
//   create: (roomData) => {
//     const roomId = generateRoomId();
//     const room = {
//       ...roomData,
//       id: roomId,
//       createdAt: Date.now(),
//       participants: [],
//       availableSlots: [],
//       title: roomData.title,
//       meetingType: roomData.meetingType,
//       maxParticipants: roomData.maxParticipants,
//       inviteLink: roomData.inviteLink,
//       messages: []
//     };
    
//     localStorage.setItem(`room_${roomId}`, JSON.stringify(room));
//     return room;
//   },
  
//   get: (roomId) => {
//     const room = localStorage.getItem(`room_${roomId}`);
//     return room ? JSON.parse(room) : null;
//   },
  
//   update: (roomId, updates) => {
//     const room = roomService.get(roomId);
//     if (!room) throw new Error('Room not found');
    
//     const updatedRoom = { ...room, ...updates };
//     localStorage.setItem(`room_${roomId}`, JSON.stringify(updatedRoom));
//     return updatedRoom;
//   }
// };

// export const chatService = {
//   analyze: async (message, roomData) => {
//     const response = await deepseekClient.complete(message);
//     return response;
//   }
// };

// export async function handleTimeAnalysis(message, userId) {
//   try {
//     const result = await analyzeTime(message);
//     return result;
//   } catch (error) {
//     console.error('시간 분석 처리 중 오류:', error);
//     throw error;
//   }
// } 