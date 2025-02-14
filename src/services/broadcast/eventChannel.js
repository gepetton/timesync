class EventChannel {
  constructor() {
    this.subscribers = new Set();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  publish(event) {
    this.subscribers.forEach(callback => {
      callback(event);
    });
  }
}

export const eventChannel = new EventChannel(); 