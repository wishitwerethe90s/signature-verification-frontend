// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // Or 'dark'
    primary: {
      main: '#1976d2', // A standard blue
    },
    secondary: {
      main: '#dc004e', // A standard pink
    },
    success: {
        main: '#2e7d32', // A standard green
    },
    error: {
        main: '#d32f2f', // A standard red
    }
  },
  typography: {
    fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    // MUI will calculate fontWeightBold from here, but you can be explicit
    fontWeightBold: 700,
  }
});

export default theme;