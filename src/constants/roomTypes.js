/**
 * 모임 관련 상수 정의
 *
 * 모임방에서 사용되는 다양한 상수값들을 정의합니다.
 * 시간대 타입, 주차 이름, 기본 모임 데이터 구조 등을
 * 일관성 있게 관리하기 위한 상수들을 포함합니다.
 *
 * 이 파일은 모임방 관련 기능 전반에서 사용되는 상수들을 모아
 * 코드의 일관성과 유지보수성을 높이는 데 기여합니다.
 */

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
  MONTH: 'month', // 월간 시간대 타입 (문자열 'month' 로 정의)
  WEEK: 'week'   // 주간 시간대 타입 (문자열 'week' 로 정의)
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
export const WEEK_NAMES = ['첫째 주', '둘째 주', '셋째 주', '넷째 주', '넷째 주', '마지막 주']; // 한국어 주차 이름 배열

/**
 * 기본 모임방 데이터 구조
 * 새로운 모임방을 생성할 때 사용되는 초기 데이터 구조를 정의합니다.
 * 이 객체는 모임 제목, 시간대 타입, 선택된 월/주차, 참여 인원 수,
 * 불가능한 시간 슬롯 정보, 참여자 목록, 비밀번호 정보 등을 포함합니다.
 *
 * `unavailableSlotsByDate` 필드는 날짜별 불가능한 시간 슬롯을 관리하는 객체이며,
 * 초기에는 빈 객체 `{}` 로 설정됩니다.
 *
 * @constant
 * @type {Object}
 * @property {string} title - 모임 제목 (초기값: 빈 문자열)
 * @property {string} timeFrame - 선택된 시간대 타입 (기본값: TIME_FRAME.MONTH - 월간)
 * @property {string} specificMonth - 선택된 월 (1-12, 문자열 형태, 초기값: 빈 문자열)
 * @property {string} specificWeek - 선택된 주차 (문자열 형태, 예: '첫째 주', 초기값: 빈 문자열)
 * @property {string} memberCount - 참여 인원 수 (문자열 형태, 초기값: 빈 문자열)
 * @property {Object} unavailableSlotsByDate - 날짜별 불가능한 시간 슬롯 정보 (초기값: 빈 객체 {})
 *           - key: 날짜 (YYYY-MM-DD 형식의 문자열)
 *           - value: 시간별 불가능 여부 객체
 *               - key: 시간 (HH, 24시간 형식의 문자열)
 *               - value: 분별 불가능 여부 객체
 *                   - key: '00' (분, 문자열 '00' 으로 고정)
 *                   - value: boolean 값 (true: 불가능, false: 가능)
 * @property {Array} participants - 참여자 목록 (미구현, 초기값: 빈 배열 [])
 * @property {string} password - 방 비밀번호 (초기값: 빈 문자열)
 * @property {boolean} isPasswordProtected - 비밀번호 보호 여부 (초기값: false - 비밀번호 보호 비활성화)
 */
export const DEFAULT_ROOM_DATA = {
  title: '',                                // 모임 제목 (초기 빈 문자열)
  timeFrame: TIME_FRAME.MONTH,              // 시간대 타입 (기본값: 월간)
  specificMonth: '',                        // 선택된 월 (초기 빈 문자열)
  specificWeek: '',                         // 선택된 주차 (초기 빈 문자열)
  memberCount: '',                          // 참여 인원 수 (초기 빈 문자열)
  unavailableSlotsByDate: {},             // 날짜별 불가능한 시간 슬롯 정보 (초기 빈 객체)
  participants: [],                         // 참여자 목록 (미구현, 초기 빈 배열)
  password: '',                             // 방 비밀번호 (초기 빈 문자열)
  isPasswordProtected: false                // 비밀번호 보호 여부 (초기값: 비활성화)
};