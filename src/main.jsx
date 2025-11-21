import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// bootstrap (css only; we’ll use MUI components primarily)
import "bootstrap/dist/css/bootstrap.min.css";

import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#d71914" }, // red Sign In button color
    secondary: { main: "#111827" },
    background: { default: "#f7f7f7" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      `'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
    h4: { fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", borderRadius: 12 } },
    },
    MuiTextField: {
      defaultProps: { size: "medium", fullWidth: true },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
