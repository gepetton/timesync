export const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 15);
};

export const parseAvailability = (response) => {
  if (!response || !response.availableTimes || !Array.isArray(response.availableTimes)) {
    return [];
  }

  return response.availableTimes.map(slot => ({
    date: new Date(slot.start),
    available: true
  }));
}; 