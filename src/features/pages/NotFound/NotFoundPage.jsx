function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-600">페이지를 찾을 수 없습니다</p>
        <a 
          href="/" 
          className="mt-6 inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          홈으로 돌아가기
        </a>
      </div>
    </div>
  );
}

export default NotFoundPage; 