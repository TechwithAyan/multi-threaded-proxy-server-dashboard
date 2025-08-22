import { createTheme } from "@mui/material/styles";
export default createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#00E5FF" },
    background: { default: "#1a202c", paper: "#222a36" },
    text: { primary: "#E6F7FF", secondary: "#9fb7d7" }
  },
  shape: { borderRadius: 12 }
});
