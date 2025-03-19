import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FiX } from 'react-icons/fi';
import { BsClockFill } from 'react-icons/bs';
import { useRoomContext } from '@/contexts/RoomContext';
import { motion, AnimatePresence } from 'framer-motion';

function TimeModal() {
  const { 
    room,
    selectedDate,
    showTimeModal,
    setShowTimeModal
  } = useRoomContext();

  if (!showTimeModal) return null;

  // 선택된 날짜의 예약 가능한 시간대 필터링
  const daySlots = room?.availableSlots?.filter(slot => 
    format(new Date(slot.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  ) || [];

  // 시간대별 예약 가능 여부 확인
  const isTimeAvailable = (hour) => {
    const timeStr = hour.toString().padStart(2, '0') + ':00';
    return daySlots.some(slot => format(new Date(slot.date), 'HH:mm') === timeStr);
  };

  // 시간대 배열 생성 (00-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <AnimatePresence>
      {showTimeModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] transform overflow-hidden"
          >
            {/* 헤더 섹션 */}
            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-purple-100 rounded-full blur-sm"></div>
                    <div className="relative">
                      <BsClockFill className="w-8 h-8 text-indigo-500" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                      {format(selectedDate, 'yyyy년 M월 d일', { locale: ko })}
                    </h3>
                    <p className="text-indigo-400 text-sm">
                      {format(selectedDate, 'EEEE', { locale: ko })}
                    </p>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ rotate: 90 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  onClick={() => setShowTimeModal(false)}
                  className="text-indigo-400 hover:text-indigo-600 transition-colors p-2 hover:bg-white/80 rounded-full"
                >
                  <FiX className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* 시간 선택 그리드 */}
            <div className="p-6 overflow-y-auto">
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.03
                    }
                  }
                }}
                className="grid grid-cols-4 gap-3"
              >
                {hours.map((hour) => {
                  const isAvailable = isTimeAvailable(hour);
                  return (
                    <motion.button
                      key={hour}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      disabled={!isAvailable}
                      className={`
                        p-4 rounded-xl text-center transition-all
                        ${isAvailable 
                          ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-2 border-indigo-200'
                          : 'bg-red-50 text-red-400 cursor-not-allowed border-2 border-red-200'}
                      `}
                    >
                      <span className="text-lg font-semibold">
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                      <div className="text-sm mt-1">
                        {isAvailable ? '가능' : '불가능'}
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TimeModal; 