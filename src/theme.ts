import { createTheme, ThemeOptions } from '@mui/material/styles';

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#085f80',
      light: '#1489b5',
      dark: '#064c66',
    },
    secondary: {
      main: '#19857b',
    },
    background: {
      default: '#161616',
      paper: '#222222',
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h1: {
      fontFamily: "'Fredoka One', cursive",
      fontWeight: 700,
    },
    h2: {
      fontFamily: "'Fredoka One', cursive",
      fontWeight: 700,
    },
    h3: {
      fontFamily: "'Fredoka One', cursive",
      fontWeight: 700,
    },
    h4: {
      fontFamily: "'Fredoka One', cursive",
      fontWeight: 700,
    },
    h5: {
      fontFamily: "'Fredoka One', cursive",
      fontWeight: 700,
    },
    h6: {
      fontFamily: "'Fredoka One', cursive",
      fontWeight: 700,
    },
    button: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          padding: '12px 24px',
          fontSize: '1rem',
          textTransform: 'none',
          transition: 'all 0.3s ease',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(8, 95, 128, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#222222',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(22, 22, 22, 0.9)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
};

const theme = createTheme(themeOptions);

export default theme;
