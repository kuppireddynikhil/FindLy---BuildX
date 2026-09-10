/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        findlyBg: '#F8FAFC',
        findlySurface: '#FFFFFF',
        findlyTextPrimary: '#0F172A',
        findlyTextSecondary: '#475569',
        findlyBlue: '#38BDF8',
        findlyCyan: '#06B6D4',
        findlyBorder: '#E2E8F0',
        findlySuccess: '#22C55E',
        findlyWarning: '#F59E0B',
        findlyDanger: '#EF4444',
        brandPrimary: '#38BDF8',
        brandSecondary: '#06B6D4',

        // Arctic Pearl Tokens aligned to Findly Sky Blue (#38BDF8 / #0EA5E9 / #0284C7)
        primary: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          DEFAULT: '#38BDF8',
        },
        surface: {
          default: '#FFFFFF',
          subtle: '#F8FAFC',
          raised: '#FFFFFF',
          dim: '#E2E8F0',
          container: '#F0F9FF',
          'container-low': '#F8FAFC',
          'container-high': '#E0F2FE',
          inverse: '#0F172A',
          DEFAULT: '#FFFFFF',
        },
        'on-surface': '#0F172A',
        'on-surface-variant': '#475569',
        'outline-variant': '#E2E8F0',
        border: {
          default: '#E2E8F0',
          strong: '#CBD5E1',
          DEFAULT: '#E2E8F0',
        },
        success: {
          DEFAULT: '#10B981',
          bg: '#ECFDF5',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: '#FFFBEB',
        },
        error: {
          DEFAULT: '#EF4444',
          bg: '#FEF2F2',
        },
        info: {
          DEFAULT: '#38BDF8',
          bg: '#F0F9FF',
        },
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '14px',
        'xl': '20px',
        '2xl': '24px',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 8px -1px rgba(15, 23, 42, 0.02)',
        'premium': '0 12px 30px -4px rgba(15, 23, 42, 0.06), 0 4px 12px -2px rgba(15, 23, 42, 0.03)',
        'premium-hover': '0 20px 40px -4px rgba(15, 23, 42, 0.1), 0 8px 20px -4px rgba(15, 23, 42, 0.05)',
        'card': '0 2px 4px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #38BDF8 0%, #06B6D4 100%)',
        'arctic-gradient': 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
      }
    },
  },
  plugins: [],
}
