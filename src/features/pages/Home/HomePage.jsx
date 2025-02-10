import { Link } from 'react-router-dom';
import { FiCalendar, FiUsers, FiArrowRight, FiGithub } from 'react-icons/fi';
import PageTransition from '@/shared/components/common/PageTransition';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50">
      {/* Hero Section - 더 강렬한 디자인 */}
      <div className="flex-1">
        <div className="container mx-auto px-4 pt-16 sm:pt-24 pb-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8 flex justify-center">
              <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium inline-flex items-center">
                ✨ 더 쉬워진 일정 조율
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-8 text-gray-900 leading-tight">
              친구들과 만날 시간,<br className="hidden sm:block"/>
              <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
                TimeSync
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 transform skew-x-12"></span>
              </span>
              가 찾아드릴게요 ⏰
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 leading-relaxed">
              "이번 주 언제 시간 돼?"<br className="hidden sm:block"/>
              더 이상 카톡으로 시간 정하기 힘들지 않아요!
            </p>
            <Link
              to="/create-room"
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-5 rounded-2xl text-lg font-medium hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-indigo-200/50"
            >
              <span>모임 만들기</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Quick Start Guide - 더 현대적인 디자인 */}
        <div className="py-20 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {[
                  {
                    emoji: "1️⃣",
                    title: "모임 만들기",
                    desc: "30초면 충분해요!\n모임 이름만 입력하세요",
                    gradient: "from-blue-50 to-blue-100/50"
                  },
                  {
                    emoji: "2️⃣",
                    title: "링크 공유",
                    desc: "카톡, 슬랙 등으로\n친구들에게 공유하세요",
                    gradient: "from-purple-50 to-purple-100/50"
                  },
                  {
                    emoji: "3️⃣",
                    title: "시간 확인",
                    desc: "AI가 모두의 일정을\n분석해서 알려드려요",
                    gradient: "from-indigo-50 to-indigo-100/50"
                  }
                ].map((item, index) => (
                  <div key={index} className="relative group">
                    <div className={`bg-gradient-to-br ${item.gradient} p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 backdrop-blur-sm`}>
                      <div className="text-3xl mb-6 group-hover:scale-110 transition-transform duration-200">{item.emoji}</div>
                      <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features - 더 세련된 디자인 */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                {
                  icon: FiCalendar,
                  title: "캘린더 연동",
                  desc: "구글 캘린더 연동으로\n일정을 자동으로 확인해요",
                  gradient: "from-blue-100 to-indigo-100"
                },
                {
                  icon: FiUsers,
                  title: "실시간 응답",
                  desc: "참여자들의 응답을\n실시간으로 확인할 수 있어요",
                  gradient: "from-purple-100 to-indigo-100"
                }
              ].map((feature, index) => (
                <div key={index} className="group relative">
                  <div className={`bg-gradient-to-br ${feature.gradient} p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 backdrop-blur-sm`}>
                    <div className="flex items-center space-x-5">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-md">
                        <feature.icon className="w-7 h-7 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer - 더 세련된 디자인 */}
      <footer className="bg-white/70 backdrop-blur-sm border-t border-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4 text-gray-900">TimeSync</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                더 쉽고 스마트한 시간 조율,<br />
                TimeSync와 함께하세요.
              </p>
              <div className="flex space-x-4">
                <a href="https://github.com/timesync" 
                   className="text-gray-400 hover:text-indigo-600 transition-colors"
                   target="_blank" 
                   rel="noopener noreferrer">
                  <FiGithub className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm mb-4 text-gray-900">문의</h3>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:support@timesync.kr" 
                     className="text-gray-600 hover:text-indigo-600 transition-colors text-sm">
                    이메일 문의하기
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-sm mb-4 text-gray-900">약관</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-gray-600 hover:text-indigo-600 transition-colors text-sm">
                    개인정보처리방침
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-600 hover:text-indigo-600 transition-colors text-sm">
                    이용약관
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 mt-8 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              TimeSync © MIT License
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 