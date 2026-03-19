function Hero() {
  return (
    <section
      id="hero"
      className="h-screen flex flex-col justify-center items-center bg-gray-100"
    >
      <h1 className="text-5xl font-bold mb-6">안녕하세요, 김윤아입니다</h1>

      <p className="text-lg text-gray-600 mb-8">
        UX를 이해하는 프론트엔드 개발자
      </p>

      <button className="px-6 py-3 bg-black text-white rounded-lg">
        프로젝트 보러가기
      </button>
    </section>
  );
}

export default Hero;
