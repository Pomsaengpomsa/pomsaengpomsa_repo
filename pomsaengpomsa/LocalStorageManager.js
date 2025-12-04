// 닉네임과 점수를 저장할 로컬 스토리지 매니저
class LocalStorageManager {
    // 특정 키를 사용하여 데이터를 로컬 스토리지에 저장합니다.
  static setItem(key, value) {
    try {
      // 값을 JSON 문자열로 변환
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      console.log(
        `LocalStorage: Key "${key}"에 데이터가 성공적으로 저장되었습니다.`
      );
    } catch (error) {
      console.error(`LocalStorage: Key "${key}" 저장 실패:`, error);
    }
  }

    // 특정 키에 연결된 데이터를 로컬 스토리지에서 가져옵니다.
  static getItem(key) {
    try {
      const serializedValue = localStorage.getItem(key);
      // 저장된 값이 없으면 null 반환
      if (serializedValue === null) {
        return null;
      }
      // JSON 문자열을 원래의 JavaScript 객체로 복원
      return JSON.parse(serializedValue);
    } catch (error) {
      console.error(`LocalStorage: Key "${key}" 불러오기 실패:`, error);
      return null;
    }
  }


   // 특정 키의 데이터를 로컬 스토리지에서 제거합니다.
  static removeItem(key) {
    try {
      localStorage.removeItem(key);
      console.log(`LocalStorage: Key "${key}"의 데이터가 제거되었습니다.`);
    } catch (error) {
      console.error(`LocalStorage: Key "${key}" 제거 실패:`, error);
    }
  }


   // 로컬 스토리지에 저장된 모든 데이터를 제거합니다. (주의: 해당 도메인의 모든 데이터가 삭제됩니다.)
  static clearAll() {
    try {
      localStorage.clear();
      console.log("LocalStorage: 모든 데이터가 성공적으로 제거되었습니다.");
    } catch (error) {
      console.error("LocalStorage: 모든 데이터 제거 실패:", error);
    }
  }
}
