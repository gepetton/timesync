import { useMemo } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FiX, FiSun, FiSunset, FiMoon, FiClock } from 'react-icons/fi';
import { BsClockFill } from 'react-icons/bs';
import { useRoomContext } from '@/contexts/RoomContext';

function TimeModal() {
  const { 
    room,
    selectedDate,
    showTimeModal,
    setShowTimeModal,
    checkTimeAvailability
  } = useRoomContext();

  // 시간 가용성을 미리 계산하여 성능 최적화
  const timeAvailability = useMemo(() => {
    if (!selectedDate) return {};
    
    const availability = {};
    for (let hour = 0; hour < 24; hour++) {
      const timeStr = hour.toString().padStart(2, '0') + ':00';
      availability[hour] = checkTimeAvailability(selectedDate, timeStr);
    }
    return availability;
  }, [selectedDate, checkTimeAvailability]);

  // 시간대별로 그룹화된 시간 배열
  const timeGroups = useMemo(() => {
    const groups = {
      dawn: { label: '새벽', icon: FiClock, hours: [], color: 'blue' },
      morning: { label: '오전', icon: FiSun, hours: [], color: 'yellow' },
      afternoon: { label: '오후', icon: FiSunset, hours: [], color: 'orange' },
      evening: { label: '저녁', icon: FiMoon, hours: [], color: 'purple' }
    };

    for (let hour = 0; hour < 24; hour++) {
      if (hour >= 0 && hour < 6) {
        groups.dawn.hours.push(hour);
      } else if (hour >= 6 && hour < 12) {
        groups.morning.hours.push(hour);
      } else if (hour >= 12 && hour < 18) {
        groups.afternoon.hours.push(hour);
      } else if (hour >= 18 && hour < 24) {
        groups.evening.hours.push(hour);
      }
    }

    return groups;
  }, []);

  if (!showTimeModal || !selectedDate) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 opacity-0 animate-[fadeIn_0.2s_ease-out_forwards]">
      <div className="bg-white rounded-[2rem] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl transform overflow-hidden scale-95 animate-[slideIn_0.2s_ease-out_forwards]">
        {/* 헤더 섹션 */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-30"></div>
                <div className="relative bg-white p-3 rounded-full">
                  <BsClockFill className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {format(selectedDate, 'yyyy년 M월 d일', { locale: ko })}
                </h3>
                <p className="text-gray-600 text-sm font-medium">
                  {format(selectedDate, 'EEEE', { locale: ko })} 시간표
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowTimeModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white/80 rounded-full hover:rotate-90 transition-transform duration-200"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 시간 선택 그리드 */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            {Object.entries(timeGroups).map(([key, group]) => {
              return (
                <div key={key} className="space-y-3">
                  {/* 시간대 헤더 */}
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      group.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                      group.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                      group.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <group.icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-semibold text-gray-800 text-lg">{group.label}</h4>
                  </div>

                  {/* 시간 버튼 그리드 */}
                  <div className="grid grid-cols-3 gap-3">
                    {group.hours.map((hour) => {
                      const isAvailable = timeAvailability[hour];
                      const nextHour = (hour + 1) % 24;
                      
                      return (
                        <button
                          key={hour}
                          disabled={!isAvailable}
                          className={`
                            p-4 rounded-xl text-center transition-all duration-200 border-2 relative overflow-hidden
                            ${isAvailable 
                              ? 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300 hover:scale-105 shadow-sm hover:shadow-md'
                              : 'bg-red-50 text-red-400 cursor-not-allowed border-red-200 opacity-60'}
                          `}
                        >
                          {isAvailable && (
                            <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 to-emerald-100/50 rounded-xl"></div>
                          )}
                          <div className="relative">
                            <span className="text-base font-bold block">
                              {hour.toString().padStart(2, '0')}:00 ~ {nextHour.toString().padStart(2, '0')}:00
                            </span>
                            <div className="text-sm mt-2 font-medium">
                              {isAvailable ? (
                                <span className="text-green-600">✓ 가능</span>
                              ) : (
                                <span className="text-red-500">✗ 불가능</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* 범례 */}
          <div className="mt-8 flex justify-center gap-8 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-200 rounded-md"></div>
              <span className="text-sm font-medium text-gray-700">가능한 시간</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border-2 border-red-200 rounded-md opacity-60"></div>
              <span className="text-sm font-medium text-gray-700">불가능한 시간</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimeModal; 