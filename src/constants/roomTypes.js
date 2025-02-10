export const TIME_FRAME = {
  YEAR: 'year',
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day'
};

export const WEEK_NAMES = ['첫째 주', '둘째 주', '셋째 주', '넷째 주', '마지막 주'];

export const DEFAULT_ROOM_DATA = {
  title: '',
  timeFrame: TIME_FRAME.YEAR,
  specificMonth: '',
  specificWeek: '',
  specificDate: '',
  specificYear: new Date().getFullYear(),
  memberCount: '',
  availableSlots: [],
  participants: []
}; 