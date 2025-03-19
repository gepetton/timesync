/**
 * 모임 생성 폼 컴포넌트
 *
 * 사용자가 새로운 모임을 생성할 수 있는 3단계 폼을 제공합니다.
 * 1단계: 모임 이름 입력
 * 2단계: 모임 시간대 선택 (연/월/주/일)
 * 3단계: 참여 인원 선택
 *
 * 각 단계는 부드러운 애니메이션 효과와 함께 전환되며,
 * 사용자 경험을 향상시키기 위한 다양한 시각적 효과를 포함합니다.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiCalendar, FiClock, FiArrowRight, FiMinus, FiPlus } from 'react-icons/fi';
import PageTransition from '@/shared/components/common/PageTransition';
import { motion } from 'framer-motion';
import { WEEK_NAMES, DEFAULT_ROOM_DATA } from '@/constants/roomTypes'; // DEFAULT_ROOM_DATA import
import { startOfMonth, endOfMonth, eachWeekOfInterval } from 'date-fns';
import { roomService } from '@/services/firebase/roomService';

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
   * 선택된 월의 주차 수를 계산하는 함수
   * @param {number} month - 선택된 월 (1-12)
   * @returns {Array} 해당 월의 주차 목록
   */
  const getWeeksInMonth = (month) => {
    const year = new Date().getFullYear();
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(startDate);

    // 해당 월의 모든 주차를 가져옴
    const weeks = eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: 0 } // 일요일부터 시작
    );

    // 마지막 날짜가 속한 주차가 다음 달로 넘어가는 경우를 처리
    const lastWeekStart = weeks[weeks.length - 1];
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() + 6);

    // 마지막 주가 다음 달에 더 많이 포함되는 경우 제외
    const actualWeeks = lastWeekEnd.getMonth() !== endDate.getMonth() &&
                       lastWeekEnd.getDate() > 4 ? weeks.slice(0, -1) : weeks;

    // 주차 이름 매핑
    return actualWeeks.map((weekStart, index) => {
      // 현재 주차가 마지막 주차인지 확인
      const isLastWeek = index === actualWeeks.length - 1;

      return {
        value: `${index + 1}주차`,
        label: `${isLastWeek ? '마지막 주' : WEEK_NAMES[index]}`
      };
    });
  };

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
    // 단계별 검증
    if (step === 1) {
      if (!formData.title.trim()) {
        alert('모임 이름을 입력해주세요.');
        return;
      }
    }
    else if (step === 2) {
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

    // formData 에 Date 객체 직접 저장
    const updatedFormData = {
      ...formData,
      specificMonth: formData.specificMonth ? new Date(new Date().getFullYear(), formData.specificMonth - 1) : null,
      specificWeek: formData.specificWeek, // week 는 문자열 그대로 사용
    };

    const roomData = {
      id: roomId,
      ...updatedFormData, // updatedFormData 사용
      createdAt: new Date().toISOString(),
      participants: [],
      unavailableSlotsByDate: {}, // 변경된 데이터 구조 적용
    };


    try {
      // Firestore에 방 데이터 저장
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
            initialDate: updatedFormData.specificMonth?.toISOString() || null, // ISO 문자열 변환
            timeFrame: formData.timeFrame,
            specificMonth: formData.specificMonth,
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
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  };

  /**
   * 단계 표시 버튼의 스타일 클래스를 반환하는 함수
   * @param {number} num - 단계 번호
   * @returns {string} 스타일 클래스 문자열
   */
  const getStepClassName = (num) => {
    return `w-10 h-10 rounded-xl flex items-center justify-center ${
      step >= num
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
        : 'bg-gray-50 text-gray-400'
    }`;
  };

  /**
   * 시간대 선택 버튼의 스타일 클래스를 반환하는 함수
   * @param {string} value - 시간대 값
   * @returns {string} 스타일 클래스 문자열
   */
  const getTimeFrameButtonClass = (value) => {
    return `p-4 rounded-2xl border-2 flex items-center space-x-3 hover:bg-indigo-50 transition-all duration-200 ${
      formData.timeFrame === value
        ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100'
        : 'border-gray-100 hover:border-indigo-200'
    }`;
  };

  /**
   * 인원 수 선택 버튼의 스타일 클래스를 반환하는 함수
   * @param {number} num - 인원 수
   * @returns {string} 스타일 클래스 문자열
   */
  const getMemberCountButtonClass = (num) => {
    return `p-4 rounded-2xl border-2 flex items-center justify-center space-x-2 hover:bg-indigo-50 transition-all duration-200 ${
      Number(formData.memberCount) === num
        ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100'
        : 'border-gray-100 hover:border-indigo-200'
    }`;
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
                          {/* 월 선택 */}
                          <select
                            name="specificMonth"
                            value={formData.specificMonth}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 transition-colors bg-white/50 backdrop-blur-sm"
                          >
                            <option value="">월 선택</option>
                            {Array.from({ length: 12 }, (_, i) => (
                              <option key={i + 1} value={i + 1}>{i + 1}월</option>
                            ))}
                          </select>

                          {/* 주차 선택 */}
                          {formData.timeFrame === 'week' && formData.specificMonth && (
                            <select
                              name="specificWeek"
                              value={formData.specificWeek}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 transition-colors bg-white/50 backdrop-blur-sm"
                            >
                              <option value="">주차 선택</option>
                              {getWeeksInMonth(Number(formData.specificMonth)).map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
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