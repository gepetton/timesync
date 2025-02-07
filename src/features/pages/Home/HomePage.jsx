import { Link } from 'react-router-dom';
import { FiCalendar, FiUsers, FiArrowRight, FiGithub } from 'react-icons/fi';

function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50/90 via-white to-indigo-50/50">
      {/* Hero Section */}
      <div className="flex-1">
        <div className="container mx-auto px-4 pt-12 sm:pt-20 pb-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900 leading-tight">
              친구들과 만날 시간, <br className="hidden sm:block"/>
              <span className="text-indigo-600">TimeSync</span>가 찾아드릴게요 ⏰
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed">
              "이번 주 언제 시간 돼?"<br className="hidden sm:block"/>
              더 이상 카톡으로 시간 정하기 힘들지 않아요!
            </p>
            <Link
              to="/create-room"
              className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-indigo-200"
            >
              <span>모임 만들기</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex sm:flex-col items-center sm:items-start space-x-4 sm:space-x-0 group hover:bg-indigo-50">
                  <div className="text-2xl sm:mb-4 group-hover:scale-110 transition-transform duration-200">1️⃣</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">모임 만들기</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      30초면 충분해요!<br className="hidden sm:block"/>
                      모임 이름만 입력하세요
                    </p>
                  </div>
                </div>
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex sm:flex-col items-center sm:items-start space-x-4 sm:space-x-0 group hover:bg-indigo-50">
                  <div className="text-2xl sm:mb-4 group-hover:scale-110 transition-transform duration-200">2️⃣</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">링크 공유</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      카톡, 슬랙 등으로<br className="hidden sm:block"/>
                      친구들에게 공유하세요
                    </p>
                  </div>
                </div>
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex sm:flex-col items-center sm:items-start space-x-4 sm:space-x-0 group hover:bg-indigo-50">
                  <div className="text-2xl sm:mb-4 group-hover:scale-110 transition-transform duration-200">3️⃣</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">시간 확인</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      AI가 모두의 일정을<br className="hidden sm:block"/>
                      분석해서 알려드려요
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:bg-indigo-50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
                    <FiCalendar className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">캘린더 연동</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      구글 캘린더 연동으로<br className="hidden sm:block"/>
                      일정을 자동으로 확인해요
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:bg-indigo-50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
                    <FiUsers className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">실시간 응답</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      참여자들의 응답을<br className="hidden sm:block"/>
                      실시간으로 확인할 수 있어요
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100">
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
}

export default HomePage; 