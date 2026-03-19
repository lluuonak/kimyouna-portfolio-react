export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#여기에_포폴_메인컬러',
        secondary: '#여기에_서브컬러',
      },
      fontFamily: {
        sans: ['여기에_폰트명', 'sans-serif'],
        gmarket: ['GmarketSans', 'sans-serif'],
      },
      screens: {
        // 기본값 그대로 써도 충분
      },
    },
  },
  plugins: [],
};
