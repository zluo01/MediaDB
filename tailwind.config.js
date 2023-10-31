/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ['src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    screens: {
      sm: '1280px',
      md: '1920px',
      lg: '2560px',
      xl: '3840px',
    },
    extend: {
      backgroundColor: {
        default: '#24323f',
        primary: '#1a2634',
        secondary: '#3b4956',
        hover: '#094129',
        selected: '#217c46',
      },
      textColor: {
        primary: '#e7e9ec',
        secondary: '#505962',
        active: '#5A5F61',
        hover: '#094129',
        selected: '#217c46',
      },
      borderColor: {
        selected: '#217c46',
      },
      action: {
        disabled: '#094129',
      },
    },
  },
  plugins: [],
};
