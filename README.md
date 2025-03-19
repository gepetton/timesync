<div align="center">
  <img src="public/logo.png" alt="TimeSync Logo" width="200"/>
  <h1>TimeSync</h1>
  <p>
    <b>AI 채팅으로 쉽게 만나는 시간</b>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=React&logoColor=black"/>
    <img src="https://img.shields.io/badge/Vite-5.0.8-646CFF?style=flat-square&logo=Vite&logoColor=white"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white"/>
    <img src="https://img.shields.io/badge/Google_Gemini-0.21.0-8E75B2?style=flat-square&logo=google&logoColor=white"/>
  </p>
</div>

## 📝 TimeSync란?

TimeSync는 모임 시간을 정하기 위한 끝없는 카톡 설문과 메시지 교환에 지친 당신을 위한 서비스입니다. Google Gemini AI의 강력한 자연어 처리 기능을 통해, 복잡한 일정 조율을 간단하게 해결해 드립니다.

> "이번 주 화요일 저녁 7시 이후나 목요일 오후 3시에서 5시 사이에 가능해요"

단순히 이런 메시지를 채팅창에 입력하면, AI가 자동으로 분석하여 최적의 모임 시간을 찾아드립니다!

### ✨ 특별한 점

- 📱 **회원가입 필요 없음** - 링크 하나로 즉시 시작
- 💬 **자연어로 일정 입력** - "다음주 월요일 오후 2시부터 4시까지 가능해요" 처럼 편하게 입력
- 🤖 **Google Gemini AI** - 고급 AI가 복잡한 일정을 즉시 분석
- 👥 **실시간 채팅** - 참여자들과 실시간으로 소통하며 일정 조율
- 🔍 **시각적 결과** - 모든 참여자의 가능 시간을 한눈에 확인

## 📱 사용 방법

<div align="center">
  <img src="docs/images/demo.gif" alt="TimeSync Demo" width="600"/>
</div>

### 1️⃣ 모임방 만들기
- 메인 화면에서 '새 모임 만들기' 버튼 클릭
- 모임 이름 입력 및 시간대(월/주) 선택
- 필요시 비밀번호 설정 가능

### 2️⃣ 참여자 초대하기
- 생성된 링크를 카카오톡, 메신저 등으로 공유
- 참여자는 링크를 통해 별도 가입 없이 즉시 참여

### 3️⃣ 가능한 시간 입력하기
- 채팅창에 자연어로 가능한 시간 입력
  - 예: "저는 다음주 월, 수, 금 오후 2시 이후 가능해요"
  - 예: "목요일 빼고 아무때나 괜찮아요"
- Google Gemini AI가 자동으로 일정을 분석하여 캘린더에 표시

### 4️⃣ 최적의 시간 확인하기
- 모든 참여자의 일정이 시각적으로 표시
- AI가 추천하는 최적 모임 시간 확인
- 채팅으로 최종 시간 확정

## 🌟 Google Gemini AI 활용

TimeSync는 Google의 최신 AI 모델인 Gemini를 활용하여 자연어 일정 처리를 제공합니다:

- **자연어 인식** - 일상 대화처럼 입력한 시간 정보를 정확히 인식
- **맥락 이해** - "다음 주", "이번 달 말" 등의 상대적 표현 이해
- **다국어 지원** - 한국어로 편하게 일정 입력 가능
- **최적 시간 추천** - 모든 참여자의 일정을 분석하여 최적의 시간 제안

## 🤝 기여하기

TimeSync는 오픈소스 프로젝트로, 여러분의 기여를 환영합니다!

### 기여 방법

1. 이 저장소를 Fork 합니다
2. 새로운 Branch를 생성합니다 (`git checkout -b feature/awesome-feature`)
3. 변경사항을 Commit 합니다 (`git commit -m 'Add awesome feature'`)
4. Branch에 Push 합니다 (`git push origin feature/awesome-feature`)
5. Pull Request를 생성합니다

### 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/username/timesync.git

# 디렉토리 이동
cd timesync

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 📦 주요 패키지 버전

- React: 18.2.0
- Vite: 5.0.8
- Firebase: 11.3.1
- date-fns: 2.30.0
- Framer Motion: 12.4.3
- Socket.io Client: 4.8.1 
- TailwindCSS: 3.4.0
- @google/generative-ai: 0.21.0

## 🔗 바로 사용해보기

<!-- [TimeSync 바로가기](https://timesync.example.com) -->

## 👥 제작자

- 박세현 - [GitHub](https://github.com/gepetton)

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.