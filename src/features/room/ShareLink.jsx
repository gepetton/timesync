import { useState, useEffect } from 'react';
import { FiLink, FiCopy, FiShare2 } from 'react-icons/fi';
import { SiKakaotalk } from 'react-icons/si';

function ShareLink({ roomId, roomTitle }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/room/${roomId}`;

  useEffect(() => {
    // Kakao SDK 초기화
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(import.meta.env.VITE_KAKAO_API_KEY);
    }
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
    }
  };

  const handleKakaoShare = () => {
    if (!window.Kakao) {
      alert('카카오톡 공유 기능을 사용할 수 없습니다.');
      return;
    }

    window.Kakao.Link.sendDefault({
      objectType: 'feed',
      content: {
        title: roomTitle || 'TimeSync 모임 초대',
        description: '모임 시간을 정해보세요!',
        imageUrl: `${window.location.origin}/timesync-logo.png`,
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
      buttons: [
        {
          title: '참여하기',
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
      ],
    });
  };

  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <FiLink className="w-5 h-5 text-indigo-600" />
        <span className="font-medium text-gray-900">공유하기</span>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-3 py-2 text-sm bg-white rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 flex items-center gap-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiCopy className="w-4 h-4" />
            <span className="text-sm">{copied ? '복사됨!' : '복사'}</span>
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleKakaoShare}
            className="flex-1 px-4 py-2 flex items-center justify-center gap-2 bg-[#FEE500] text-[#000000] rounded-lg hover:bg-[#FDD800] transition-colors"
          >
            <SiKakaotalk className="w-4 h-4" />
            <span className="text-sm">카카오톡</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 px-4 py-2 flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FiShare2 className="w-4 h-4" />
            <span className="text-sm">링크 공유</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareLink;
