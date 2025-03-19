class BroadcastService {
  constructor() {
    this.channels = new Map();
    this.handlers = new Map();
  }

  // 채널 생성 또는 가져오기
  getChannel(roomId) {
    if (!this.channels.has(roomId)) {
      const channel = new BroadcastChannel(`room_${roomId}`);
      
      channel.onmessage = (event) => {
        const handlers = this.handlers.get(roomId) || [];
        handlers.forEach(handler => handler(event.data));
      };

      this.channels.set(roomId, channel);
    }
    return this.channels.get(roomId);
  }

  // 룸 구독
  joinRoom(roomId) {
    this.getChannel(roomId);
  }

  // 룸 구독 해제
  leaveRoom(roomId) {
    const channel = this.channels.get(roomId);
    if (channel) {
      channel.close();
      this.channels.delete(roomId);
      this.handlers.delete(roomId);
    }
  }

  // 룸 데이터 업데이트
  updateRoom(roomId, data) {
    const channel = this.getChannel(roomId);
    channel.postMessage({
      type: 'room_updated',
      roomId,
      data
    });
  }

  // 이벤트 핸들러 등록
  on(roomId, handler) {
    if (!this.handlers.has(roomId)) {
      this.handlers.set(roomId, []);
    }
    this.handlers.get(roomId).push(handler);
  }

  // 이벤트 핸들러 제거
  off(roomId, handler) {
    if (!this.handlers.has(roomId)) return;
    const handlers = this.handlers.get(roomId);
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }
}

export const broadcastService = new BroadcastService(); 