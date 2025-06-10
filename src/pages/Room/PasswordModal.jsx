import { useState } from 'react';
import { useRoomContext } from '@/contexts/RoomContext';
import { FiLock, FiX } from 'react-icons/fi';

export default function PasswordModal() {
  const [password, setPassword] = useState('');
  const { showPasswordModal, setShowPasswordModal, verifyPassword, room } = useRoomContext();

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = verifyPassword(password);
    if (isValid) {
      setShowPasswordModal(false);
      setPassword('');
    } else {
      alert('비밀번호가 일치하지 않습니다.');
    }
  };

  if (!showPasswordModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl w-full max-w-md shadow-2xl border border-white/20 overflow-hidden">
        {/* 모달 헤더 */}
        <div className="relative bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FiLock className="w-6 h-6 text-white" />
                </div>
                {/* 로고 */}
                <div className="flex items-center">
                  <span className="text-xl font-black text-white">Time</span>
                  <span className="text-xl font-black text-white/90">Sync</span>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-8">
              <div className="flex items-baseline gap-2 mb-3">
                <h2 className="text-xl font-medium text-white/90">비밀번호로 보호된 모임 :</h2>
                <h1 className="text-2xl font-black bg-gradient-to-r from-white to-white/90 text-transparent bg-clip-text">
                  {room?.title || '제목 없음'}
                </h1>
              </div>
              <div className="h-[2px] w-full bg-gradient-to-r from-white/20 via-white/10 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* 모달 본문 */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="방 비밀번호를 입력하세요"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white/50 backdrop-blur-sm transition-all duration-200"
                autoFocus
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-800 transition-all duration-200"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg shadow-indigo-200 font-medium"
              >
                확인
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 