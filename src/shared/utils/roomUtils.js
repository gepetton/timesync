export const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 15);
};

export const parseAvailability = (content) => {
  // DeepSeek API 응답에서 시간대 파싱
  // 예: "내일 오후 2시", "다음주 월요일 오전 10시" 등
  const timeRegex = /(\d{4}년\s)?\d{1,2}월\s\d{1,2}일\s[\d]{1,2}시/g;
  const matches = content.match(timeRegex) || [];
  
  return matches.map(timeStr => ({
    date: new Date(timeStr),
    available: true
  }));
}; 