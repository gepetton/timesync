/**
 * Vite 설정 파일
 * 
 * TimeSync 프로젝트의 Vite 빌드 도구 설정을 정의합니다.
 * React 플러그인, 경로 별칭, 프록시 설정 등
 * 프로젝트의 핵심 개발 환경 설정을 포함합니다.
 * 
 * 주요 설정:
 * 1. React 지원을 위한 플러그인
 * 2. 절대 경로 별칭 (@)
 * 3. 개발 서버 프록시 설정
 * 4. API 요청 처리 및 라우팅
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Vite 설정 객체
 * @see https://vite.dev/config/
 */
export default defineConfig({
  // 플러그인 설정
  plugins: [
    react() // React 지원을 위한 공식 플러그인
  ],

  // 경로 해석 설정
  resolve: {
    alias: {
      // src 디렉토리에 대한 별칭 설정
      // 예: @/components/Button -> src/components/Button
      '@': path.resolve(__dirname, './src'),
    },
  },

  // 개발 서버 설정
  server: {
    // 프록시 설정
    proxy: {
      // '/api' 경로로 시작하는 모든 요청을 처리
      '/api': {
        // 프록시 대상 서버 주소
        target: 'http://localhost:5173',
        
        // CORS 이슈 해결을 위한 출처 변경 허용
        changeOrigin: true,
        
        // URL 재작성 규칙
        // '/api/xxx' -> '/xxx'로 변환
        rewrite: (path) => path.replace(/^\/api/, ''),

        /**
         * 프록시 서버 상세 설정
         * 특정 API 엔드포인트에 대한 커스텀 처리를 정의합니다.
         * 
         * @param {Object} proxy - node-http-proxy 인스턴스
         * @param {Object} options - 프록시 옵션
         */
        configure: (proxy, options) => {
          // 프록시 요청 이벤트 핸들러
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 시간 분석 API 엔드포인트 처리
            if (req.url === '/api/analyze-time' && req.method === 'POST') {
              const originalUrl = req.url
              // 내부 서비스 경로로 변경
              req.url = '/services/deepseek'

              // deepseek 클라이언트 동적 임포트 및 시간 분석 처리
              import('./src/services/gemini/client.js').then(({ analyzeTime }) => {
                let body = ''
                
                // 요청 본문 데이터 수집
                req.on('data', chunk => {
                  body += chunk.toString()
                })

                // 요청 처리 완료 시
                req.on('end', async () => {
                  try {
                    // 요청 본문에서 메시지 추출
                    const { message } = JSON.parse(body)
                    // 시간 분석 수행
                    const result = await analyzeTime(message)
                    
                    // 응답 헤더 설정 및 결과 반환
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify(result))
                  } catch (error) {
                    // 에러 발생 시 500 에러 응답
                    res.statusCode = 500
                    res.end(JSON.stringify({ error: error.message }))
                  }
                })
              })
              return true // 프록시 요청 처리 완료
            }
          })
        },
      },
    },
  },
})
