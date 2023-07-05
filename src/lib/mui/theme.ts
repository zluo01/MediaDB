import { red } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

export const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
});

export const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          WebkitFontSmoothing: 'auto',
        },
        '*::-webkit-scrollbar': {
          width: 6,
        },
        /* Track */
        '*::-webkit-scrollbar-track': {
          WebkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.3)',
          WebkitBorderRadius: 10,
          borderRadius: 10,
        },
        /* Handle */
        '*::-webkit-scrollbar-thumb': {
          WebkitBorderRadius: 10,
          borderRadius: 10,
          background: 'rgba(26,172,84,0.8)',
          WebkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.5)',
        },
        '*::-webkit-scrollbar-thumb:window-inactive': {
          background: 'rgba(26,172,84,0.4)',
        },
      },
    },
  },
  palette: {
    primary: {
      main: '#1a2634',
    },
    secondary: {
      main: '#3b4956',
    },
    text: {
      primary: '#e7e9ec',
      secondary: '#505962',
    },
    background: {
      default: '#24323f',
    },
    error: {
      main: red.A400,
    },
    action: {
      active: '#5A5F61',
      selected: '#217c46',
      hover: '#094129',
      disabled: '#094129',
    },
  },
});
