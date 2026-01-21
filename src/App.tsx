
import "leaflet/dist/leaflet.css";
import "./App.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AppContent } from "./components/AppContent";
import { NotificationProvider } from "./contexts/NotificationContext";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#2b73d9" },
    secondary: { main: "#9fb1c9" },
    success: { main: "#2fbf71" },
    error: { main: "#e35d6a" },
    warning: { main: "#f0a636" },
    background: {
      default: "#0a1220",
      paper: "#101a2b",
    },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Manrope", "Segoe UI", sans-serif',
    fontWeightBold: 700,
    h6: { letterSpacing: -0.3 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 12,
          paddingLeft: 16,
          paddingRight: 16,
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(255,255,255,0.04)",
          boxShadow:
            "0 18px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.02)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
        },
      },
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <NotificationProvider>
          <CssBaseline />
          <AppContent />
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
