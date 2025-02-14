/**
 * 모임 관련 상수 정의
 * 
 * 모임방에서 사용되는 다양한 상수값들을 정의합니다.
 * 시간대 타입, 주차 이름, 기본 모임 데이터 구조 등을
 * 일관성 있게 관리하기 위한 상수들을 포함합니다.
 */

/**
 * 시간대 타입 상수
 * 모임 일정을 선택할 때 사용되는 시간대 구분값입니다.
 * 
 * @constant
 * @type {Object}
 * @property {string} YEAR - 연간 선택 모드 ('year')
 * @property {string} MONTH - 월간 선택 모드 ('month')
 * @property {string} WEEK - 주간 선택 모드 ('week')
 * @property {string} DAY - 일간 선택 모드 ('day')
 */
export const TIME_FRAME = {
  YEAR: 'year',   // 연간 선택
  MONTH: 'month', // 월간 선택
  WEEK: 'week',   // 주간 선택
  DAY: 'day'      // 일간 선택
};

/**
 * 주차 이름 배열
 * 월간 달력에서 주차를 표시할 때 사용되는 한글 주차 이름입니다.
 * 
 * @constant
 * @type {string[]}
 */
export const WEEK_NAMES = ['첫째 주', '둘째 주', '셋째 주', '넷째 주', '마지막 주'];

/**
 * 기본 모임방 데이터 구조
 * 새로운 모임방 생성 시 사용되는 초기 데이터 구조입니다.
 * 
 * @constant
 * @type {Object}
 * @property {string} title - 모임 제목
 * @property {string} timeFrame - 선택된 시간대 타입 (기본값: 연간)
 * @property {string} specificMonth - 선택된 월 (1-12)
 * @property {string} specificWeek - 선택된 주차
 * @property {string} specificDate - 선택된 날짜 (YYYY-MM-DD 형식)
 * @property {number} specificYear - 선택된 연도 (기본값: 현재 연도)
 * @property {string} memberCount - 참여 인원 수
 * @property {Array} availableSlots - 참여 가능한 시간대 목록
 * @property {Array} participants - 참여자 목록
 */
export const DEFAULT_ROOM_DATA = {
  title: '',                              // 모임 제목
  timeFrame: TIME_FRAME.YEAR,             // 시간대 타입 (기본값: 연간)
  specificMonth: '',                      // 선택된 월
  specificWeek: '',                       // 선택된 주차
  specificDate: '',                       // 선택된 날짜
  specificYear: new Date().getFullYear(), // 선택된 연도 (기본값: 현재 연도)
  memberCount: '',                        // 참여 인원 수
  availableSlots: [],                     // 참여 가능 시간대 목록
  participants: []                        // 참여자 목록
}; 