const localStore = {
  // 주어진 키에 해당하는 데이터를 localStorage에서 가져옵니다.
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      // 데이터를 JSON 형식으로 파싱하여 반환합니다. 데이터가 없으면 null을 반환합니다.
      return item ? JSON.parse(item) : null;
    } catch (error) {
      // 데이터 가져오는 중 에러가 발생하면 콘솔에 에러 메시지를 출력하고 null을 반환합니다.
      console.error('localStorage에서 데이터를 가져오는 중 오류 발생:', error);
      return null;
    }
  },

  // 주어진 키와 값을 localStorage에 저장합니다.
  set: (key, value) => {
    try {
      // 값을 JSON 형식으로 변환하여 저장합니다.
      localStorage.setItem(key, JSON.stringify(value));
      return true; // 성공적으로 저장되면 true를 반환합니다.
    } catch (error) {
      // 데이터 저장 중 에러가 발생하면 콘솔에 에러 메시지를 출력하고 false를 반환합니다.
      console.error('localStorage에 데이터를 저장하는 중 오류 발생:', error);
      return false;
    }
  },

  // 주어진 키에 해당하는 데이터를 localStorage에서 제거합니다.
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true; // 성공적으로 제거되면 true를 반환합니다.
    } catch (error) {
      // 데이터 제거 중 에러가 발생하면 콘솔에 에러 메시지를 출력하고 false를 반환합니다.
      console.error('localStorage에서 데이터를 제거하는 중 오류 발생:', error);
      return false;
    }
  },

  // localStorage의 모든 데이터를 제거합니다.
  clear: () => {
    try {
      localStorage.clear();
      return true; // 성공적으로 모든 데이터가 제거되면 true를 반환합니다.
    } catch (error) {
      // 모든 데이터 제거 중 에러가 발생하면 콘솔에 에러 메시지를 출력하고 false를 반환합니다.
      console.error('localStorage를 초기화하는 중 오류 발생:', error);
      return false;
    }
  }
};

// localStore 객체를 모듈의 기본 내보내기로 설정합니다.
export default localStore;
