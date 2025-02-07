import { createContext, useContext, useState } from 'react';

const RoomContext = createContext();

export function RoomProvider({ children }) {
  const [room, setRoom] = useState(null);

  return (
    <RoomContext.Provider value={{ room, setRoom }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoomContext() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoomContext must be used within a RoomProvider');
  }
  return context;
} 