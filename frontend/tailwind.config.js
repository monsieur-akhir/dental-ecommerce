/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs principales - Sobres et rassurantes
        primary: {
          50: '#f8f9fa',    // Blanc cassé
          100: '#f1f3f4',   // Gris perle très clair
          200: '#e8eaed',   // Gris perle clair
          300: '#dadce0',   // Gris perle moyen
          400: '#9aa0a6',   // Gris perle foncé
          500: '#5f6368',   // Gris perle principal
          600: '#3c4043',   // Gris perle sombre
          700: '#202124',   // Gris perle très sombre
          800: '#1a1c1e',   // Gris perle noir
          900: '#0f1012',   // Gris perle très noir
        },
        // Couleurs d'accent - Médicales et rassurantes
        accent: {
          50: '#f0f7f0',    // Vert sauge très clair
          100: '#e1efe1',   // Vert sauge clair
          200: '#c3dfc3',   // Vert sauge moyen
          300: '#a5cfa5',   // Vert sauge principal
          400: '#87bf87',   // Vert sauge foncé
          500: '#69af69',   // Vert sauge accent
          600: '#5a9f5a',   // Vert sauge sombre
          700: '#4b8f4b',   // Vert sauge très sombre
          800: '#3c7f3c',   // Vert sauge noir
          900: '#2d6f2d',   // Vert sauge très noir
        },
        // Couleurs secondaires - Chaleureuses
        secondary: {
          50: '#fdf8f3',    // Beige sable très clair
          100: '#faf1e6',   // Beige sable clair
          200: '#f5e3cc',   // Beige sable moyen
          300: '#f0d5b2',   // Beige sable principal
          400: '#e6c088',   // Beige sable foncé
          500: '#dcab5e',   // Beige sable accent
          600: '#d29644',   // Beige sable sombre
          700: '#c8812a',   // Beige sable très sombre
          800: '#be6c10',   // Beige sable noir
          900: '#b45700',   // Beige sable très noir
        },
        // Couleurs tertiaires - Élégantes
        tertiary: {
          50: '#fdf6f3',    // Terracotta très clair
          100: '#fbece6',   // Terracotta clair
          200: '#f7d9cc',   // Terracotta moyen
          300: '#f3c6b2',   // Terracotta principal
          400: '#e6a388',   // Terracotta foncé
          500: '#d9805e',   // Terracotta accent
          600: '#cc5d34',   // Terracotta sombre
          700: '#bf3a0a',   // Terracotta très sombre
          800: '#b22700',   // Terracotta noir
          900: '#a51400',   // Terracotta très noir
        },
        // Couleurs sémantiques
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'display': ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'serif': ['Merriweather', 'Georgia', 'serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(105, 175, 105, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSoft: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0, -8px, 0)' },
          '70%': { transform: 'translate3d(0, -4px, 0)' },
          '90%': { transform: 'translate3d(0, -2px, 0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

