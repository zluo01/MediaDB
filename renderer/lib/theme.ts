import { createMuiTheme } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';

export const theme = createMuiTheme({
  overrides: {
    MuiCssBaseline: {
      '@global': {
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
    error: {
      main: red.A400,
    },
    background: {
      default: '#24323f',
    },
    action: {
      active: '#5A5F61',
      selected: '#1AAC54',
    },
    text: {
      primary: '#e7e9ec',
      secondary: '#505962',
      disabled: '#505863',
    },
  },
});
