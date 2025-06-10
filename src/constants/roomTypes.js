/**
 * 시간대 타입 상수
 * 모임 시간대 선택 시 사용되는 타입을 정의합니다.
 * 사용자는 월간 또는 주간 단위로 모임 시간대를 선택할 수 있습니다.
 *
 * @constant
 * @type {Object}
 * @property {string} MONTH - 월간 시간대 (한 달 전체를 기준으로 시간 선택)
 * @property {string} WEEK - 주간 시간대 (특정 주를 기준으로 시간 선택)
 */
export const TIME_FRAME = {
  MONTH: 'month', // 월간 시간대
  WEEK: 'week'    // 주간 시간대
};

/**
 * 주차 이름 배열
 * 월간 달력에서 주차를 표시할 때 사용되는 한글 주차 이름 목록입니다.
 * '첫째 주', '둘째 주', '셋째 주', '넷째 주', '마지막 주' 와 같이 순서대로 정의되어 있으며,
 * 캘린더 UI 에서 주차 정보를 표시하거나, 사용자가 주차를 선택할 때 활용됩니다.
 *
 * @constant
 * @type {string[]}
 */
export const WEEK_NAMES = ['첫째 주', '둘째 주', '셋째 주', '넷째 주', '넷째 주', '마지막 주'];

/**
 * 기본 모임방 데이터 구조
 * 새로운 모임방을 생성할 때 사용되는 초기 데이터 구조를 정의합니다.
 * 이 객체는 모임 제목, 시간대 타입, 선택된 월/주차, 참여 인원 수,
 * 불가능한 시간 슬롯 정보, 참여자 목록, 비밀번호 정보 등을 포함합니다.
 *
 * `unavailableSlotsByDate` 필드는 날짜별 불가능한 시간 구간을 관리하는 객체이며,
 * 각 날짜별로 불가능한 시간 구간들의 배열을 가집니다.
 *
 * @constant
 * @type {Object}
 * @property {string} title - 모임 제목
 * @property {string} timeFrame - 시간대 타입
 * @property {string} specificMonth - 선택된 월
 * @property {string} specificWeek - 선택된 주차
 * @property {string} memberCount - 참여 인원 수
 * @property {Object} unavailableSlotsByDate - 날짜별 불가능한 시간 구간
 *   - key: 날짜 (YYYY-MM-DD)
 *   - value: 불가능한 시간 구간 배열 [{ start: "HH:mm", end: "HH:mm" }]
 * @property {string} password - 방 비밀번호
 * @property {boolean} isPasswordProtected - 비밀번호 보호 여부
 */
export const DEFAULT_ROOM_DATA = {
  title: '',
  timeFrame: TIME_FRAME.MONTH,
  specificMonth: '',
  specificWeek: '',
  memberCount: '',
  unavailableSlotsByDate: {},
  password: '',
  isPasswordProtected: false
};