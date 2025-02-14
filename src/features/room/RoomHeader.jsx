import { Link, useNavigate } from 'react-router-dom';
import { FiUsers, FiShare2 } from 'react-icons/fi';
import { useRoomContext } from '@/contexts/RoomContext';
import { motion, AnimatePresence } from 'framer-motion';

function RoomHeader({ onShareClick }) {
  const { room } = useRoomContext();
  const navigate = useNavigate();

  const handleLogoClick = (e) => {
    e.preventDefault();
    
    // 페이지 전환 애니메이션
    const container = document.querySelector('.app-container');
    if (container) {
      container.style.transition = 'all 0.5s cubic-bezier(0.6, -0.05, 0.01, 0.99)';
      container.style.opacity = '0';
      container.style.transform = 'scale(0.95) translateY(-20px)';
    }

    setTimeout(() => {
      navigate('/');
    }, 200);
  };

  return (
    <motion.div 
      className="bg-white shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }}
    >
      <div className="container mx-auto px-2 sm:px-4 py-4">
        <div className="grid grid-cols-3 items-center">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="pl-2 sm:pl-4"
          >
            <Link to="/" className="inline-block" onClick={handleLogoClick}>
              <div className="relative">
                <span className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 text-transparent bg-clip-text tracking-tight hover:from-indigo-500 hover:via-purple-400 hover:to-indigo-500 transition-all duration-300">
                  Time
                </span>
                <span className="text-3xl font-black bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 text-transparent bg-clip-text tracking-tight hover:from-purple-400 hover:via-indigo-400 hover:to-purple-500 transition-all duration-300">
                  Sync
                </span>
                <div className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
              </div>
            </Link>
          </motion.div>
          <div className="flex flex-col justify-center items-center">
            <span className="text-sm font-medium text-gray-500 mb-1">모임명</span>
            <h1 className="text-2xl font-black text-center bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 bg-clip-text text-transparent drop-shadow-sm">
              {room?.title || '모임 일정 조율'}
            </h1>
            <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-indigo-300 to-transparent mt-2"></div>
          </div>
          <div className="flex items-center justify-end gap-4">
            <div className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-sm text-indigo-600 rounded-xl border border-indigo-100/30 shadow-sm">
              <FiUsers className="w-4 h-4 mr-2 text-indigo-500" />
              <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {room?.memberCount}명 참여중
              </span>
            </div>
            <button
              onClick={onShareClick}
              className="inline-flex items-center px-4 py-2 text-sm bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-100/30 text-indigo-600 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <FiShare2 className="w-4 h-4 mr-2 text-indigo-500" />
              <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                공유하기
              </span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default RoomHeader; 