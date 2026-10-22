/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter Variable", "Noto Sans Bengali", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans Variable", "Inter Variable", "sans-serif"],
      },
      colors: {
        brand: {
          green: '#059669',
          600: '#059669',
          dark: '#047857',
          light: '#ecfdf5',
          DEFAULT: '#059669',
        },
        ink: {
          DEFAULT: '#111827',
          900: '#111827',
          light: '#4b5563',
          lighter: '#9ca3af',
          muted: '#6b7280',
        },
        surface: {
          DEFAULT: '#ffffff',
          subtle: '#f9fafb',
          muted: '#f3f4f6',
        },
      },
      borderRadius: {
        card: '16px',
        pill: '9999px',
      },
      boxShadow: {
        card: '0 2px 10px -1px rgba(0, 0, 0, 0.06), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
        elevated: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        nav: '0 10px 30px -5px rgba(0, 0, 0, 0.35), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
      },
    },
  },
  plugins: [],
}
