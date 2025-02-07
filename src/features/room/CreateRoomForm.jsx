import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiCalendar, FiClock, FiArrowRight } from 'react-icons/fi';

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
    setStep(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('handleSubmit called', { step, formData });  // 디버깅 로그 추가

    // 최종 제출 시에만 인원수 검증
    if (!formData.memberCount) {
      alert('참여 인원을 선택해주세요.');
      return;
    }

    // 모임 데이터 생성
    const roomId = generateRoomId();
    const roomData = {
      id: roomId,
      ...formData,
      createdAt: new Date().toISOString(),
      participants: [],
      availableSlots: []
    };

    // 로컬 스토리지에 저장
    try {
      localStorage.setItem(`room_${roomId}`, JSON.stringify(roomData));
      // 생성된 방으로 이동
      navigate(`/room/${roomId}`);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50/90 via-white to-indigo-50/50 py-12 px-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          {/* Progress Steps */}
          <div className="flex justify-center space-x-8 sm:space-x-16 mb-16">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex flex-col items-center">
                <div className={getStepClassName(num)}>
                  {num}
                </div>
                <span className="mt-3 text-sm font-medium text-gray-500">
                  {num === 1 ? '모임 정보' : num === 2 ? '시간대' : '인원'}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-10">
            {/* Step 1: 모임 제목 */}
            {step === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">모임 이름을 알려주세요</h2>
                  <p className="text-gray-600">모임의 성격을 잘 나타내는 이름을 입력해주세요.</p>
                </div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="예: 대학 동아리 정기 모임"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 transition-colors text-lg"
                />
              </div>
            )}

            {/* Step 2: 시간대 선택 */}
            {step === 2 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">언제쯤 모일 예정인가요?</h2>
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
                      className={getTimeFrameButtonClass(value)}
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
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 transition-colors"
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
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 transition-colors"
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
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 transition-colors"
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
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-600 transition-colors"
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: 인원 수 */}
            {step === 3 && (
              <form onSubmit={handleSubmit}>
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">몇 명이서 모이나요?</h2>
                    <p className="text-gray-600">예상 참여 인원을 선택해주세요.</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[2, 3, 4, 5, 6, 8, 10, 15].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleInputChange({ target: { name: 'memberCount', value: num } })}
                        className={getMemberCountButtonClass(num)}
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
                    className="ml-auto inline-flex items-center space-x-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-indigo-200"
                  >
                    <span>모임 만들기</span>
                    <FiArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
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
                  className="ml-auto inline-flex items-center space-x-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-indigo-200"
                >
                  <span>다음</span>
                  <FiArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateRoomForm; 