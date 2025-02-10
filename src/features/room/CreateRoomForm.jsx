import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiCalendar, FiClock, FiArrowRight } from 'react-icons/fi';
import PageTransition from '@/shared/components/common/PageTransition';
import { motion } from 'framer-motion';

function CreateRoomForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    timeFrame: 'year',
    specificMonth: '',
    specificWeek: '',
    specificDate: '',
    specificYear: new Date().getFullYear(),
    memberCount: ''
  });
  const [direction, setDirection] = useState('right');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTimeFrameChange = (value) => {
    setFormData(prev => ({
      ...prev,
      timeFrame: value,
      specificMonth: '',
      specificWeek: '',
      specificDate: '',
      specificYear: value === 'year' ? new Date().getFullYear() : ''
    }));
  };

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
      if (formData.timeFrame === 'day' && !formData.specificDate) {
        alert('날짜를 선택해주세요.');
        return;
      }
    }

    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setDirection('right');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.memberCount) {
      alert('참여 인원을 선택해주세요.');
      return;
    }

    const roomId = generateRoomId();
    const roomData = {
      id: roomId,
      ...formData,
      createdAt: new Date().toISOString(),
      participants: [],
      availableSlots: []
    };

    try {
      // 애니메이션이 완료된 후 페이지 이동을 위해 약간의 지연 추가
      await localStorage.setItem(`room_${roomId}`, JSON.stringify(roomData));
      
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
          state: { animate: true } 
        });
      }, 500);
      
    } catch (error) {
      console.error('Error creating room:', error);
      alert('모임 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 랜덤 룸 ID 생성 함수
  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const getStepClassName = (num) => {
    return `w-10 h-10 rounded-xl flex items-center justify-center ${
      step >= num 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
        : 'bg-gray-50 text-gray-400'
    }`;
  };

  const getTimeFrameButtonClass = (value) => {
    return `p-4 rounded-2xl border-2 flex items-center space-x-3 hover:bg-indigo-50 transition-all duration-200 ${
      formData.timeFrame === value 
        ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100' 
        : 'border-gray-100 hover:border-indigo-200'
    }`;
  };

  const getMemberCountButtonClass = (num) => {
    return `p-4 rounded-2xl border-2 flex items-center justify-center space-x-2 hover:bg-indigo-50 transition-all duration-200 ${
      Number(formData.memberCount) === num 
        ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100' 
        : 'border-gray-100 hover:border-indigo-200'
    }`;
  };

  const getAnimationClass = () => {
    return direction === 'left' ? 'animate-slide-left' : 'animate-slide-right';
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        {/* 배경 그라디언트 및 패턴 */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-white to-purple-100" />
        
        {/* 모던한 그리드 패턴 */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
        
        {/* 동적 배경 요소들 */}
        <div className="absolute inset-0">
          {/* 우상단 그라디언트 블롭 */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400/40 to-indigo-400/40 rounded-full mix-blend-multiply filter blur-3xl opacity-80 animate-blob" />
          
          {/* 좌하단 그라디언트 블롭 */}
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/40 to-pink-400/40 rounded-full mix-blend-multiply filter blur-3xl opacity-80 animate-blob animation-delay-2000" />
          
          {/* 중앙 그라디언트 블롭 */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/40 to-purple-400/40 rounded-full mix-blend-multiply filter blur-3xl opacity-80 animate-blob animation-delay-4000" />
          
          {/* 추가 장식 요소들 */}
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-bl from-blue-300/30 to-purple-300/30 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-gradient-to-tr from-indigo-300/30 to-pink-300/30 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse animation-delay-3000" />
        </div>

        {/* 메인 컨텐츠 */}
        <div className="relative min-h-screen flex items-center justify-center py-12 px-4">
          <motion.div 
            className="w-full max-w-2xl form-container"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white/85 backdrop-blur-xl rounded-2xl shadow-xl p-8 sm:p-10 border border-white/40 relative overflow-hidden">
              {/* 카드 내부 하이라이트 효과 */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent pointer-events-none" />
              {/* Progress Steps */}
              <div className="flex justify-center space-x-8 sm:space-x-16 mb-16">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="flex flex-col items-center relative">
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center relative z-10
                      ${step >= num 
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-xl shadow-indigo-200/50' 
                        : 'bg-gray-50 text-gray-400'}
                    `}>
                      {num}
                    </div>
                    <span className="mt-3 text-sm font-medium text-gray-500">
                      {num === 1 ? '모임 정보' : num === 2 ? '시간대' : '인원'}
                    </span>
                    {num < 3 && (
                      <div className={`
                        absolute top-5 left-12 w-16 sm:w-24 h-[2px] 
                        ${step > num ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gray-200'}
                      `} />
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-10">
                {/* Step 1: 모임 제목 */}
                {step === 1 && (
                  <div className={getAnimationClass()}>
                    <div className="space-y-8">
                      <div className="text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                          모임 이름을 알려주세요
                        </h2>
                        <p className="text-gray-600">모임의 성격을 잘 나타내는 이름을 입력해주세요.</p>
                      </div>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="예: 대학 동아리 정기 모임"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 transition-colors text-lg bg-white/50 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: 시간대 선택 */}
                {step === 2 && (
                  <div className={getAnimationClass()}>
                    <div className="space-y-8">
                      <div className="text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                          언제쯤 모일 예정인가요?
                        </h2>
                        <p className="text-gray-600">대략적인 기간을 선택해주세요.</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { value: 'year', label: '올해 중', icon: FiCalendar },
                          { value: 'month', label: '특정 달', icon: FiCalendar },
                          { value: 'week', label: '특정 주', icon: FiClock },
                          { value: 'day', label: '특정 일', icon: FiClock }
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

                      {/* 추가 선택지 */}
                      {formData.timeFrame !== 'year' && (
                        <div className="space-y-4 pt-4">
                          {formData.timeFrame === 'month' && (
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
                          )}

                          {formData.timeFrame === 'week' && (
                            <div className="space-y-4">
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
                              {formData.specificMonth && (
                                <select
                                  name="specificWeek"
                                  value={formData.specificWeek}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 transition-colors bg-white/50 backdrop-blur-sm"
                                >
                                  <option value="">주차 선택</option>
                                  {['첫째 주', '둘째 주', '셋째 주', '넷째 주', '마지막 주'].map((week, i) => (
                                    <option key={i} value={week}>{formData.specificMonth}월 {week}</option>
                                  ))}
                                </select>
                              )}
                            </div>
                          )}

                          {formData.timeFrame === 'day' && (
                            <input
                              type="date"
                              name="specificDate"
                              value={formData.specificDate}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 transition-colors bg-white/50 backdrop-blur-sm"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: 인원 수 */}
                {step === 3 && (
                  <div className={getAnimationClass()}>
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-8">
                        <div className="text-center">
                          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                            몇 명이서 모이나요?
                          </h2>
                          <p className="text-gray-600">예상 참여 인원을 선택해주세요.</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {[2, 3, 4, 5, 6, 8, 10, 15].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => handleInputChange({ target: { name: 'memberCount', value: num } })}
                              className={`
                                p-4 rounded-2xl border-2 flex items-center justify-center space-x-2 transition-all duration-300
                                ${Number(formData.memberCount) === num 
                                  ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100 scale-[1.02]' 
                                  : 'border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30'}
                                backdrop-blur-sm
                              `}
                            >
                              <FiUsers className="w-4 h-4 text-indigo-600" />
                              <span className="font-medium text-gray-900">{num}명</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Navigation Buttons */}
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
                          className="ml-auto inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-indigo-200 transform hover:scale-[1.02]"
                        >
                          <span>모임 만들기</span>
                          <FiArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Navigation Buttons for steps 1 and 2 */}
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