import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#d71914" },  // your red
    background: { default: "#f5f5f5" },
  },
  shape: { borderRadius: 10 },
});

export default theme;
