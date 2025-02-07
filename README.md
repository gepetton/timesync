<div align="center">
  <img src="public/logo.png" alt="TimeSync Logo" width="200"/>
  <h1>TimeSync</h1>
  <p>
    <b>AI 채팅으로 쉽게 만나는 시간</b>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=React&logoColor=black"/>
    <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=Vite&logoColor=white"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white"/>
  </p>
</div>

## 📝 소개

TimeSync는 실시간 채팅과 AI의 도움으로 여러분의 모임 시간 조율을 도와드립니다. 
링크 하나로 시작하는 간편한 일정 조율 서비스를 경험해보세요.

### ✨ 주요 기능

- 🔗 **간편한 공유**: 클릭 한 번으로 모임방 생성 및 공유
- 📅 **다양한 캘린더 뷰**: 월간/주간/일간 캘린더 제공
- 💬 **실시간 채팅**: 즉각적인 의견 교환 가능
- 🤖 **AI 분석**: DeepSeek AI가 최적의 시간대 추천
- 🎯 **즉시 시작**: 회원가입 없이 바로 시작

## 🖥️ 데모

<div align="center">
  <img src="docs/images/demo.gif" alt="TimeSync Demo" width="600"/>
</div>

## 🚀 시작하기

### 필요 조건

- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 방법

```bash
저장소 클론
git clone https://github.com/username/timesync.git

디렉토리 이동
cd timesync-web

의존성 설치
npm install

개발 서버 실행
npm run dev
```

### 환경 변수 설정

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```plaintext
VITE_DEEPSEEK_API_KEY=your_api_key_here
```

## 📱 사용 방법

1. 메인 페이지에서 '새 모임 만들기' 클릭
2. 모임 제목과 캘린더 뷰 선택
3. 생성된 링크를 참여자들과 공유
4. 채팅으로 가능한 시간 입력
5. AI가 분석한 최적의 시간 확인

## 🛠️ 기술 스택

- **Frontend:** React, Vite, TailwindCSS
- **상태 관리:** React Context
- **AI 통합:** DeepSeek API
- **기타:** date-fns, react-router-dom

## 🤝 기여하기

1. 이 저장소를 Fork 합니다
2. 새로운 Branch를 생성합니다 (`git checkout -b feature/amazing`)
3. 변경사항을 Commit 합니다 (`git commit -m 'Add amazing feature'`)
4. Branch에 Push 합니다 (`git push origin feature/amazing`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

## 👥 제작자

- 박세현 - [GitHub](https://github.com/gepetton)

## 🙏 감사의 말

- [DeepSeek](https://deepseek.com) - AI 기능 제공
- [React](https://reactjs.org)
- [Vite](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)