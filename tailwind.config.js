/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        'dark': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        'accent': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Dropdown component colors using CSS variables (theme-aware)
        'dropdown': {
          'bg': 'var(--dropdown-bg)',
          'text': 'var(--dropdown-text)',
          'border': 'var(--dropdown-border)',
          'hover-bg': 'var(--dropdown-hover-bg)',
          'focus-ring': 'var(--dropdown-focus-ring)',
          'placeholder': 'var(--dropdown-placeholder)',
          'caret': 'var(--dropdown-caret)',
          'menu-bg': 'var(--dropdown-menu-bg)',
          'menu-border': 'var(--dropdown-menu-border)',
          'option-default': 'var(--dropdown-option-default)',
          'option-hover-bg': 'var(--dropdown-option-hover-bg)',
          'option-hover-text': 'var(--dropdown-option-hover-text)',
          'option-selected-bg': 'var(--dropdown-option-selected-bg)',
          'option-selected-text': 'var(--dropdown-option-selected-text)',
          'option-disabled': 'var(--dropdown-option-disabled)',
        }
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '40px',
        '4xl': '56px',
      }
    },
  },
  plugins: [],
}

