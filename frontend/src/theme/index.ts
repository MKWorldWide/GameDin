import { createTheme } from '@mui/material/styles';
import { blue, grey } from '@mui/material/colors';

const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: blue[500],
      light: blue[300],
      dark: blue[700],
    },
    background: {
      default: mode === 'dark' ? '#121212' : '#f5f5f5',
      paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#ffffff' : '#000000',
      secondary: mode === 'dark' ? grey[400] : grey[700],
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'dark' 
            ? '0 4px 6px rgba(0, 0, 0, 0.4)'
            : '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'none',
          },
        },
      },
    },
  },
});

export default getTheme; 