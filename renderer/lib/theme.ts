import { red } from '@material-ui/core/colors';
import { createTheme } from '@material-ui/core/styles';

export const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        html: {
          WebkitFontSmoothing: 'auto',
        },
        '*::-webkit-scrollbar': {
          width: 6,
        },
        /* Track */
        '*::-webkit-scrollbar-track': {
          '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.3)',
          '-webkit-border-radius': 10,
          borderRadius: 10,
        },
        /* Handle */
        '*::-webkit-scrollbar-thumb': {
          '-webkit-border-radius': 10,
          borderRadius: 10,
          background: 'rgba(26,172,84,0.8)',
          '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.5)',
        },
        '*::-webkit-scrollbar-thumb:window-inactive': {
          background: 'rgba(26,172,84,0.4)',
        },
      `,
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
