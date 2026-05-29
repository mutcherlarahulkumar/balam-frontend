import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1a3c5e',
      light: '#2d6a9f',
      dark: '#0d2137',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#c97a18',
      light: '#e8952a',
      dark: '#9e5e0d',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f4f6f9',
      paper: '#ffffff',
    },
    success: { main: '#2e7d32' },
    warning: { main: '#e65100' },
    error: { main: '#c62828' },
    text: {
      primary: '#1a2a3a',
      secondary: '#4a6080',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 16,
    h4: { fontWeight: 700, fontSize: '1.6rem' },
    h5: { fontWeight: 700, fontSize: '1.35rem' },
    h6: { fontWeight: 700, fontSize: '1.15rem' },
    subtitle1: { fontWeight: 600, fontSize: '1.05rem' },
    subtitle2: { fontWeight: 600, fontSize: '0.95rem' },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.95rem', lineHeight: 1.5 },
    caption: { fontSize: '0.85rem' },
    button: { fontSize: '1rem', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          minHeight: 48,
          paddingLeft: 20,
          paddingRight: 20,
          fontSize: '1rem',
        },
        sizeSmall: { minHeight: 36, fontSize: '0.875rem' },
        sizeLarge: { minHeight: 56, fontSize: '1.1rem' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: { padding: 20, '&:last-child': { paddingBottom: 20 } },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            backgroundColor: '#eef2f7',
            color: '#1a3c5e',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { fontSize: '0.95rem', padding: '14px 16px' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: '0.85rem' },
        sizeMedium: { height: 30 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': { fontSize: '1rem', minHeight: 52 },
          '& .MuiInputLabel-root': { fontSize: '1rem' },
          '& .MuiFormHelperText-root': { fontSize: '0.85rem' },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: { fontSize: '1rem' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { minHeight: 52 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: '0.95rem',
          fontWeight: 600,
          minHeight: 52,
          textTransform: 'none',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { fontSize: '0.95rem', borderRadius: 12 },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: { fontSize: '0.75rem' },
        label: { fontSize: '0.75rem', '&.Mui-selected': { fontSize: '0.75rem' } },
      },
    },
  },
});
