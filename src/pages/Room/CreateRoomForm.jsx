import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '@/config/PageTransition';
import { motion } from 'framer-motion';
import { DEFAULT_ROOM_DATA } from '@/constants/roomTypes';
import { startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, isBefore, format } from 'date-fns';
import { roomService } from '@/services/firebase/roomService';
import { FiCalendar, FiClock, FiArrowRight } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

function CreateRoomForm() {
  // 라우터 네비게이션을 위한 훅
  const navigate = useNavigate();

  // 폼의 현재 단계를 관리 (1~3)
  const [step, setStep] = useState(1);

  // 폼 데이터 상태 관리, 초기값을 DEFAULT_ROOM_DATA 로 설정
  const [formData, setFormData] = useState(DEFAULT_ROOM_DATA);
  // 애니메이션 방향 상태 (left/right)
  const [direction, setDirection] = useState('right');

  /**
   * 입력 필드 값 변경 핸들러
   * @param {Event} e - 입력 이벤트 객체
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // 모든 입력을 허용 (빈 문자열 포함)
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * 시간대 범위 변경 핸들러
   * 선택된 시간대에 따라 관련 필드들을 초기화합니다.
   * @param {string} value - 선택된 시간대 값
   */
  const handleTimeFrameChange = (value) => {
    setFormData(prev => ({
      ...prev,
      timeFrame: value,
      specificMonth: '',
      specificWeek: ''
    }));
  };

    /**
   * 특정 월의 주차 목록을 반환합니다.
   * @param {number} year - 년도
   * @param {number} month - 월 (1-12)
   * @returns {Array} 해당 월의 주차 목록
   */
  const getWeeksInMonth = (year, month) => {
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(startDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weeks = [];
    let currentWeek = [];

    days.forEach((day) => {
      const dayOfWeek = day.getDay(); // 0 (일요일) - 6 (토요일)

      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    // 현재 날짜
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 0 }); // 일요일 시작

    // 주차 이름 매핑 및 과거 주차 필터링
    return weeks
      .map((week, index) => {
        const weekStart = startOfWeek(week[0], { weekStartsOn: 0 });
        const isDisabled = isBefore(weekStart, currentWeekStart);
        
        return {
          value: `${index + 1}주차`,
          label: `${index === weeks.length - 1 ? '마지막 주' : `${index + 1}주차`}`,
          disabled: isDisabled,
          weekStart: weekStart
        };
      })
      .filter(week => {
        // 현재 월인 경우에만 과거 주차 필터링, 미래 월인 경우 모든 주차 표시
        const selectedMonth = Number(formData.specificMonth);
        const currentMonth = now.getMonth() + 1;
        
        if (selectedMonth > currentMonth) {
          return true; // 미래 월은 모든 주차 표시
        } else {
          return !week.disabled; // 현재 월은 과거 주차 제외
        }
      });
  };

  const getWeeks = useMemo(() => {
    if (!formData.specificMonth) return [];
    return getWeeksInMonth(new Date().getFullYear(), Number(formData.specificMonth));
  }, [formData.specificMonth]);

  // 현재 월 가져오기
  const currentMonth = new Date().getMonth() + 1; // 1-12

  // 사용 가능한 월 목록 생성 (현재 월부터 12월까지)
  const availableMonths = useMemo(() => {
    const months = [];
    for (let i = currentMonth; i <= 12; i++) {
      months.push(i);
    }
    return months;
  }, [currentMonth]);

  /**
   * 인원 수 변경 핸들러
   * @param {'increment' | 'decrement'} action - 증가/감소 동작
   * @param {number} amount - 변경할 수량
   */
  const handleMemberCountChange = (action, amount = 1) => {
    setFormData(prev => {
      const currentCount = Number(prev.memberCount) || 0;
      let newCount;

      if (action === 'increment') {
        newCount = Math.min(100, currentCount + amount);
      } else {
        newCount = Math.max(1, currentCount - amount);
      }

      return {
        ...prev,
        memberCount: String(newCount)
      };
    });
  };

  /**
   * 인원 수 직접 입력 핸들러
   * @param {Event} e - 입력 이벤트 객체
   */
  const handleMemberCountInput = (e) => {
    const value = e.target.value;
    // 숫자만 입력 가능
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = Number(value);
      // 1-100 사이의 값만 허용
      if (numValue <= 100) {
        setFormData(prev => ({
          ...prev,
          memberCount: value
        }));
      }
    }
  };

  /**
   * 다음 단계로 이동하는 핸들러
   * 각 단계별 필수 입력값을 검증합니다.
   */
  const handleNext = () => {
    setDirection('left');
    if (step === 1) {
      if (!formData.title.trim()) {
        alert('모임 이름을 입력해주세요.');
        return;
      }
      if (formData.isPasswordProtected && formData.password.length < 4) {
        alert('비밀번호는 최소 4자 이상이어야 합니다.');
        return;
      }
    } else if (step === 2) {
      if (formData.timeFrame === 'month' && !formData.specificMonth) {
        alert('월을 선택해주세요.');
        return;
      }
      if (formData.timeFrame === 'week' && (!formData.specificMonth || !formData.specificWeek)) {
        alert('월과 주차를 모두 선택해주세요.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  /**
   * 이전 단계로 이동하는 핸들러
   */
  const handleBack = () => {
    setDirection('right');
    setStep(prev => prev - 1);
  };

  /**
   * 폼 제출 핸들러
   * 모임 데이터를 생성하고 저장한 후 모임 페이지로 이동합니다.
   * @param {Event} e - 폼 제출 이벤트 객체
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.memberCount) {
      alert('참여 인원을 선택해주세요.');
      return;
    }

    const roomId = generateRoomId();

    // formData 수정 - specificMonth를 Date 객체 대신 숫자로 저장
    const updatedFormData = {
      ...formData,
      // specificMonth는 문자열이나 숫자 그대로 사용 (1-12)
      specificMonth: formData.specificMonth,
      specificWeek: formData.specificWeek, // week 는 문자열 그대로 사용
    };

    const roomData = {
      id: roomId,
      ...updatedFormData, // updatedFormData 사용
      createdAt: new Date().toISOString(),
      unavailableSlotsByDate: {}, // 변경된 데이터 구조 적용
    };

    try {
      // Firebase Realtime Database에 방 데이터 저장
      await roomService.createRoom(roomId, roomData);

      // 페이지 전환 애니메이션
      const container = document.querySelector('.form-container');
      if (container) {
        container.style.transition = 'all 0.5s ease-in-out';
        container.style.transform = 'scale(0.95)';
        container.style.opacity = '0';
      }

      // 애니메이션 후 페이지 이동
      setTimeout(() => {
        navigate(`/room/${roomId}`, {
          state: {
            animate: true,
            initialDate: null, // Date 객체 대신 null 전달
            timeFrame: formData.timeFrame,
            specificMonth: updatedFormData.specificMonth,
            specificWeek: formData.specificWeek
          }
        });
      }, 500);

    } catch (error) {
      console.error('Error creating room:', error);
      alert('모임 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  /**
   * 랜덤한 룸 ID를 생성하는 함수
   * 36진수 문자열을 사용하여 고유한 ID를 생성합니다.
   * @returns {string} 생성된 룸 ID
   */
  const generateRoomId = () => {
    return uuidv4(); // 고유성이 보장된 ID 생성
  };

  /**
   * 현재 애니메이션 방향에 따른 클래스를 반환하는 함수
   * @returns {string} 애니메이션 클래스 문자열
   */
  const getAnimationClass = () => {
    return direction === 'left' ? 'animate-slide-left' : 'animate-slide-right';
  };

  return (
    <PageTransition>
      {/* 전체 페이지 컨테이너 */}
      <div className="min-h-screen relative overflow-hidden">
        {/* 배경 그라디언트 효과 */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-white to-purple-100" />

        {/* 모던한 그리드 패턴 배경 */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />

        {/* 동적 배경 요소들 - 움직이는 그라디언트 블롭 */}
        <div className="absolute inset-0">
          {/* 우상단 그라디언트 블롭 */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400/40 to-indigo-400/40 rounded-full mix-blend-multiply filter blur-3xl opacity-80 animate-blob" />

          {/* 좌하단 그라디언트 블롭 */}
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/40 to-pink-400/40 rounded-full mix-blend-multiply filter blur-3xl opacity-80 animate-blob animation-delay-2000" />

          {/* 중앙 그라디언트 블롭 */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/40 to-purple-400/40 rounded-full mix-blend-multiply filter blur-3xl opacity-80 animate-blob animation-delay-4000" />

          {/* 추가 장식 요소들 - 부드럽게 깜빡이는 효과 */}
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-bl from-blue-300/30 to-purple-300/30 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-gradient-to-tr from-indigo-300/30 to-pink-300/30 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse animation-delay-3000" />
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="relative min-h-screen flex items-center justify-center py-12 px-4">
          {/* 폼 컨테이너 - 프레이머 모션 애니메이션 적용 */}
          <motion.div
            className="w-full max-w-2xl form-container"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            {/* 메인 카드 - 반투명 백드롭 블러 효과 적용 */}
            <div className="bg-white/85 backdrop-blur-xl rounded-2xl shadow-xl p-8 sm:p-10 border border-white/40 relative overflow-hidden">
              {/* 카드 내부 하이라이트 효과 */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent pointer-events-none" />

              {/* 진행 단계 표시 */}
              <div className="flex justify-center space-x-8 sm:space-x-16 mb-16">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="flex flex-col items-center relative">
                    {/* 단계 번호 원형 버튼 */}
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center relative z-10
                      ${step >= num
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-xl shadow-indigo-200/50'
                        : 'bg-gray-50 text-gray-400'}
                    `}>
                      {num}
                    </div>
                    {/* 단계 이름 */}
                    <span className="mt-3 text-sm font-medium text-gray-500">
                      {num === 1 ? '모임 정보' : num === 2 ? '시간대' : '인원'}
                    </span>
                    {/* 단계 연결선 */}
                    {num < 3 && (
                      <div className={`
                        absolute top-5 left-12 w-16 sm:w-24 h-[2px]
                        ${step > num ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gray-200'}
                      `} />
                    )}
                  </div>
                ))}
              </div>

              {/* 폼 단계별 컨텐츠 */}
              <div className="space-y-10">
                {/* 1단계: 모임 제목 입력 */}
                {step === 1 && (
                  <div className={getAnimationClass()}>
                    <div className="space-y-8">
                      {/* 제목과 설명 */}
                      <div className="text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                          모임 이름을 알려주세요
                        </h2>
                        <p className="text-gray-600">모임의 성격을 잘 나타내는 이름을 입력해주세요.</p>
                      </div>
                      {/* 모임 이름 입력 필드 */}
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="예: 대학 동아리 정기 모임"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 transition-colors text-lg bg-white/50 backdrop-blur-sm"
                      />
                      {/* 비밀번호 보호 토글 */}
                      <div className="mb-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.isPasswordProtected}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              isPasswordProtected: e.target.checked,
                              password: e.target.checked ? prev.password : ''
                            }))}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span className="text-gray-700">비밀번호로 방 보호하기</span>
                        </label>
                      </div>
                      {/* 비밀번호 입력 필드 */}
                      {formData.isPasswordProtected && (
                        <div className="mb-4">
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="방 비밀번호를 입력하세요"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2단계: 시간대 선택 */}
                {step === 2 && (
                  <div className={getAnimationClass()}>
                    <div className="space-y-8">
                      {/* 제목과 설명 */}
                      <div className="text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                          언제쯤 모일 예정인가요?
                        </h2>
                        <p className="text-gray-600">대략적인 기간을 선택해주세요.</p>
                      </div>

                      {/* 시간대 선택 버튼 그리드 */}
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { value: 'month', label: '특정 달', icon: FiCalendar },
                          { value: 'week', label: '특정 주', icon: FiClock }
                        ].map(({ value, label, icon: Icon }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleTimeFrameChange(value)}
                            className={`
                              p-4 rounded-2xl border-2 flex items-center space-x-3 transition-all duration-300
                              ${formData.timeFrame === value
                                ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100 scale-[1.02]'
                                : 'border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30'}
                              backdrop-blur-sm
                            `}
                          >
                            <Icon className="w-5 h-5 text-indigo-600" />
                            <span className="font-medium text-gray-900">{label}</span>
                          </button>
                        ))}
                      </div>

                      {/* 추가 선택 옵션 - 선택된 시간대에 따라 다른 입력 필드 표시 */}
                      {formData.timeFrame && (
                        <div className="space-y-4 pt-4">
                          {/* 월 선택 - 특정 달 또는 특정 주 선택 시 모두 표시 */}
                          <select
                            name="specificMonth"
                            value={formData.specificMonth}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 transition-colors bg-white/50 backdrop-blur-sm"
                          >
                            <option value="">
                              {formData.timeFrame === 'month' ? '월 선택' : '월 선택 (주차를 선택하기 위해 먼저 월을 선택하세요)'}
                            </option>
                            {availableMonths.map((month) => (
                              <option key={month} value={month}>{month}월</option>
                            ))}
                          </select>

                          {/* 주차 선택 - 특정 주 선택 시에만 표시 */}
                          {formData.timeFrame === 'week' && formData.specificMonth && (
                            <select
                              name="specificWeek"
                              value={formData.specificWeek}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 transition-colors bg-white/50 backdrop-blur-sm"
                            >
                              <option value="">주차 선택</option>
                              {getWeeks.map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
                          )}

                          {/* 선택된 옵션 안내 텍스트 */}
                          {formData.timeFrame === 'month' && formData.specificMonth && (
                            <div className="text-sm text-gray-600 bg-indigo-50 p-3 rounded-lg">
                              📅 <strong>{formData.specificMonth}월 전체</strong>에서 모임 시간을 조율합니다.
                            </div>
                          )}
                          
                          {formData.timeFrame === 'week' && formData.specificMonth && !formData.specificWeek && (
                            <div className="text-sm text-gray-500 bg-yellow-50 p-3 rounded-lg">
                              ⚠️ 주차를 선택해주세요.
                            </div>
                          )}
                          
                          {formData.timeFrame === 'week' && formData.specificMonth && formData.specificWeek && (
                            <div className="text-sm text-gray-600 bg-indigo-50 p-3 rounded-lg">
                              📅 <strong>{formData.specificMonth}월 {formData.specificWeek}</strong>에서 모임 시간을 조율합니다.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3단계: 인원 수 선택 */}
                {step === 3 && (
                  <div className={getAnimationClass()}>
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-8">
                        {/* 제목과 설명 */}
                        <div className="text-center">
                          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                            몇 명이서 모이나요?
                          </h2>
                          <p className="text-gray-600">예상 참여 인원을 선택해주세요. (최대 100명)</p>
                        </div>

                        {/* 인원 수 선택 */}
                        <div className="flex flex-col items-center space-y-6">
                          {/* 스피너 UI */}
                          <div className="flex items-center space-x-4">
                            {/* 감소 버튼 그룹 */}
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => handleMemberCountChange('decrement', 5)}
                                className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={Number(formData.memberCount) <= 5}
                              >
                                -5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMemberCountChange('decrement', 3)}
                                className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={Number(formData.memberCount) <= 3}
                              >
                                -3
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMemberCountChange('decrement')}
                                className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={Number(formData.memberCount) <= 1}
                              >
                                -1
                              </button>
                            </div>

                            {/* 숫자 입력 */}
                            <div className="relative">
                              <input
                                type="text"
                                value={formData.memberCount}
                                onChange={handleMemberCountInput}
                                className="w-24 h-12 text-center text-2xl font-bold text-gray-800 border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                                placeholder="0"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">명</span>
                            </div>

                            {/* 증가 버튼 그룹 */}
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => handleMemberCountChange('increment')}
                                className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={Number(formData.memberCount) >= 100}
                              >
                                +1
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMemberCountChange('increment', 3)}
                                className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={Number(formData.memberCount) >= 97}
                              >
                                +3
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMemberCountChange('increment', 5)}
                                className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={Number(formData.memberCount) >= 95}
                              >
                                +5
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 네비게이션 버튼 - 최종 제출 */}
                      <div className="flex justify-between items-center pt-8">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2"
                        >
                          <span>이전</span>
                        </button>
                        <button
                          type="submit"
                          disabled={!formData.memberCount || Number(formData.memberCount) < 1}
                          className="ml-auto inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-indigo-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          <span>모임 만들기</span>
                          <FiArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 1, 2단계 네비게이션 버튼 */}
                {step < 3 && (
                  <div className="flex justify-between items-center pt-8">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2"
                      >
                        <span>이전</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleNext}
                      className="ml-auto inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-indigo-200 transform hover:scale-[1.02]"
                    >
                      <span>다음</span>
                      <FiArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

export default CreateRoomForm;