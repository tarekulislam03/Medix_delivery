/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', '"Noto Sans Bengali"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Poppins"', '"Noto Sans Bengali"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        medix: {
          green: '#003820',
          bg: '#F7F4EC',
          surface: '#FFFFFF',
          lime: '#C6F26B',
          text: '#0E1A14',
          muted: '#5E6B63',
          rx: '#D64538',
          tintGreen: '#E3EFE8',
          tintLime: '#EEF8D2',
          tintCream: '#EFEAD8',
        },
        brand: {
          green: '#003820',
          600: '#003820',
          dark: '#002615',
          light: '#E3EFE8',
          DEFAULT: '#003820',
        },
        ink: {
          DEFAULT: '#0E1A14',
          900: '#0E1A14',
          light: '#5E6B63',
          lighter: '#5E6B63',
          muted: '#5E6B63',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F7F4EC',
          muted: '#EFEAD8',
        },
      },
      borderRadius: {
        card: '16px',
        pill: '999px',
        xl: '16px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        card: '0 2px 10px rgba(14, 26, 20, 0.04)',
        elevated: '0 12px 32px -8px rgba(0, 56, 32, 0.18)',
        float: '0 12px 32px -8px rgba(0, 56, 32, 0.22)',
        nav: '0 -4px 24px rgba(14, 26, 20, 0.06)',
      },
    },
  },
  plugins: [],
}
