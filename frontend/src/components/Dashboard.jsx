// src/components/Dashboard.jsx
import React, { useState, useMemo } from "react";
import {
  Box,
  CssBaseline,
  Container,
  useMediaQuery,
  IconButton,
  Tooltip,
  Typography,
  Grid,
  Paper,
  Switch,
  Card,
  CardContent,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import BlockIcon from "@mui/icons-material/Block";
import MemoryIcon from "@mui/icons-material/Memory";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import ShowChartIcon from "@mui/icons-material/ShowChart";

import LogsTable from "./LogsTable";
import BlacklistManager from "./BlacklistManager";
import RealTimeChart from "./RealTimeChart";
import SystemStats from "./SystemStats";
import ActivityHeatmap from "./ActivityHeatmap";
import Notifications from "./Notifications";

const NAV = [
  { key: "overview", label: "Overview", icon: <DashboardIcon fontSize="large" /> },
  { key: "logs", label: "Logs", icon: <ListAltIcon fontSize="large" /> },
  { key: "realtime", label: "Real-Time", icon: <ShowChartIcon fontSize="large" /> },
  { key: "stats", label: "Stats", icon: <MemoryIcon fontSize="large" /> },
  { key: "blacklist", label: "Blacklist", icon: <BlockIcon fontSize="large" /> },
  { key: "heatmap", label: "Heatmap", icon: <WhatshotIcon fontSize="large" /> },
];

function SummaryCard({ title, color, onClick, children }) {
  return (
    <Paper
      elevation={10}
      component={motion.div}
      whileHover={{ y: -8, boxShadow: `0 0 30px ${color}, 0 0 50px ${color}` }}
      onClick={onClick}
      sx={{
        cursor: "pointer",
        minWidth: 220,
        minHeight: 140,
        background: "rgba(22,34,46,0.40) url('/noise-texture.png') repeat",
        borderRadius: 6,
        p: 3,
        mx: 1,
        border: `2.5px solid ${color}99`,
        boxShadow: `0 1px 30px ${color}55`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease-in-out",
        backdropFilter: "blur(12px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Typography
        variant="h6"
        sx={{ color, fontWeight: 900, mb: 1, letterSpacing: 2, userSelect: "none" }}
      >
        {title}
      </Typography>
      {children}
      <Typography
        sx={{
          mt: 1.5,
          fontSize: 13,
          color: "#7ff6ffcc",
          textShadow: "0 0 6px #04f8ffbb",
          userSelect: "none",
        }}
      >
        View Details &rarr;
      </Typography>
      <motion.div
        initial={{ opacity: 0.4 }}
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{
          position: "absolute",
          top: -14,
          left: -12,
          width: 90,
          height: 90,
          borderRadius: "50%",
          border: `1.5px solid ${color}`,
          filter: "blur(3px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
    </Paper>
  );
}

function ThemeToggle({ darkMode, toggleDarkMode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
      <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
        <Switch
          checked={darkMode}
          onChange={toggleDarkMode}
          inputProps={{ "aria-label": "theme toggle" }}
          color="primary"
          sx={{
            width: 62,
            height: 34,
            padding: 0,
            "& .MuiSwitch-switchBase": {
              padding: 2,
              "&.Mui-checked": {
                transform: "translateX(28px)",
                color: "#fff",
                "& + .MuiSwitch-track": { backgroundColor: "#00e5ff" },
              },
            },
            "& .MuiSwitch-thumb": {
              width: 30,
              height: 30,
              background: `radial-gradient(circle, #15f3ff 30%, #0099cc)`,
              boxShadow: "0 0 8px #00e5ffaa",
            },
            "& .MuiSwitch-track": {
              borderRadius: 20,
              backgroundColor: darkMode ? "#0b1c2d" : "#c5defa",
              opacity: 1,
              transition: "background-color 300ms",
            },
          }}
          icon={<Brightness7Icon sx={{ color: "#ffc600" }} />}
          checkedIcon={<Brightness4Icon sx={{ color: "#0891b2" }} />}
        />
      </Tooltip>
    </Box>
  );
}

export default function Dashboard() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  const [panel, setPanel] = useState("overview");
  const [notifications, setNotifications] = useState([]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const neonColors = {
    primary: "#15f3ff",
    secondary: "#e542ff",
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: { main: neonColors.primary },
          secondary: { main: neonColors.secondary },
          background: {
            default: darkMode ? "#061223" : "#fafafa",
            paper: darkMode
              ? "linear-gradient(135deg, #0a1e35, #050f22)"
              : "linear-gradient(135deg, #f0f9ff, #e7f0fe)",
          },
          text: {
            primary: darkMode ? "#c2e6ff" : "#000000",
            secondary: darkMode ? "#9ccfff" : "#445566",
          },
        },
        typography: {
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          h3: {
            fontWeight: 900,
            letterSpacing: 6,
            background: darkMode
              ? "linear-gradient(90deg, #00dbde 0%, #fc00ff 100%)"
              : "linear-gradient(90deg, #0969da 0%, #1db954 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "textGradientShift 8s ease infinite",
            userSelect: "none",
            textAlign: "center",
          },
        },
        shape: { borderRadius: 24 },
        shadows: darkMode
          ? [
              "none",
              "0 1px 3px #0cf",
              "0 1px 8px #09c",
              "0 2px 20px #0af",
              "0 4px 30px #0ff",
            ]
          : [],
      }),
    [darkMode]
  );

  const bodyBg = darkMode
    ? "radial-gradient(circle at center, #091237 0%, #040a25 90%)"
    : "radial-gradient(circle at center, #f0f4f8 0%, #fafafa 90%)";

  const panelMotion = {
    initial: { opacity: 0, y: 24, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 24, scale: 0.96 },
    transition: { duration: 0.45 },
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          width: "100vw",
          background: bodyBg,
          display: "flex",
          overflowX: "hidden",
        }}
      >
        {/* Sidebar Navigation */}
        <Box
          sx={{
            width: 92,
            pt: 5,
            bgcolor: darkMode ? "#0b1e3a" : "#e8f5ff",
            boxShadow: darkMode ? "0 0 24px #14ffefa0 inset" : "0 0 24px #09c4ff60 inset",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderTopRightRadius: 30,
            borderBottomRightRadius: 30,
          }}
        >
          <Box sx={{ mb: 5 }}>
            <span
              style={{
                fontSize: 32,
                filter: `drop-shadow(0 0 16px ${neonColors.primary}cc)`,
                userSelect: "none",
              }}
            >
              🚀
            </span>
          </Box>

          {NAV.map((nav) => (
            <Tooltip key={nav.key} title={nav.label} placement="right">
              <motion.div
                whileHover={{ scale: 1.2, rotate: 8, filter: "drop-shadow(0 0 12px #00e5ff)" }}
                animate={{
                  textShadow:
                    panel === nav.key
                      ? `0 0 24px ${neonColors.primary}, 0 0 38px ${neonColors.secondary}`
                      : "none",
                }}
                transition={{ type: "spring", stiffness: 160 }}
                style={{ marginBottom: 16 }}
              >
                <IconButton
                  aria-label={nav.label}
                  size="large"
                  onClick={() => setPanel(nav.key)}
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    backgroundColor:
                      panel === nav.key ? `rgba(21, 243, 255, 0.2)` : "transparent",
                    color: panel === nav.key ? neonColors.primary : "inherit",
                    border: panel === nav.key ? `2px solid ${neonColors.primary}` : "none",
                    backdropFilter: "blur(8px)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {nav.icon}
                </IconButton>
              </motion.div>
            </Tooltip>
          ))}

          {/* Theme toggle with animation */}
          <Box sx={{ mt: "auto", mb: 5 }}>
            <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </Box>
        </Box>

        {/* Main Content Area */}
        <Container
          maxWidth="xl"
          sx={{
            flex: 1,
            pt: 5,
            px: 5,
            overflowY: "auto",
            maxHeight: "100vh",
          }}
        >
          <motion.div initial={{ y: -36, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1 }}>
            <Typography variant="h3" sx={{ mb: 5, fontWeight: 900, textAlign: "center" }}>
              Proxy Server Dashboard
            </Typography>
          </motion.div>

          <Box sx={{ width: "100%", minHeight: 480 }}>
            <AnimatePresence exitBeforeEnter>
              {panel === "overview" && (
                <motion.div key="overview" {...panelMotion}>
                  <Grid container spacing={4} justifyContent="center" alignItems="stretch">
                    <Grid item>
                      <SummaryCard color={neonColors.primary} title="Real-Time" onClick={() => setPanel("realtime")}>
                        <ShowChartIcon sx={{ color: neonColors.primary, fontSize: 40, mb: 1 }} />
                        <span>Live Traffic</span>
                      </SummaryCard>
                    </Grid>
                    <Grid item>
                      <SummaryCard color={neonColors.primary} title="Logs" onClick={() => setPanel("logs")}>
                        <ListAltIcon sx={{ color: neonColors.primary, fontSize: 40, mb: 1 }} />
                        <span>Full Access Logs</span>
                      </SummaryCard>
                    </Grid>
                    <Grid item>
                      <SummaryCard color={neonColors.secondary} title="Blacklist" onClick={() => setPanel("blacklist")}>
                        <BlockIcon sx={{ color: neonColors.secondary, fontSize: 40, mb: 1 }} />
                        <span>Domain/IP Bans</span>
                      </SummaryCard>
                    </Grid>
                    <Grid item>
                      <SummaryCard color={neonColors.primary} title="System Stats" onClick={() => setPanel("stats")}>
                        <MemoryIcon sx={{ color: neonColors.primary, fontSize: 40, mb: 1 }} />
                        <span>CPU / RAM</span>
                      </SummaryCard>
                    </Grid>
                    <Grid item>
                      <SummaryCard color={neonColors.primary} title="Heatmap" onClick={() => setPanel("heatmap")}>
                        <WhatshotIcon sx={{ color: neonColors.primary, fontSize: 40, mb: 1 }} />
                        <span>Request Timing</span>
                      </SummaryCard>
                    </Grid>
                  </Grid>
                </motion.div>
              )}

              {panel === "logs" && (
                <motion.div key="logs" {...panelMotion} style={{ width: "98vw", maxWidth: 1180 }}>
                  <Card>
                    <CardContent sx={{ padding: 3 }}>
                      <Typography variant="h5" gutterBottom sx={{ marginBottom: 2, paddingLeft: 1, paddingTop: 1 }}>
                        Proxy Logs
                      </Typography>
                      <LogsTable />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {panel === "blacklist" && (
                <motion.div key="blacklist" {...panelMotion} style={{ width: 430 }}>
                  <Card>
                    <CardContent sx={{ padding: 3 }}>
                      <Typography variant="h5" gutterBottom sx={{ marginBottom: 2, paddingLeft: 1, paddingTop: 1 }}>
                        Blacklist Manager
                      </Typography>
                      <BlacklistManager />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {panel === "realtime" && (
                <motion.div key="realtime" {...panelMotion} style={{ width: 520, maxWidth: "95vw" }}>
                  <Card>
                    <CardContent sx={{ padding: 3 }}>
                      <Typography variant="h5" gutterBottom sx={{ marginBottom: 2, paddingLeft: 1, paddingTop: 1 }}>
                        Real-Time Chart
                      </Typography>
                      <RealTimeChart />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {panel === "stats" && (
                <motion.div key="stats" {...panelMotion} style={{ width: 380 }}>
                  <Card>
                    <CardContent sx={{ padding: 3 }}>
                      <Typography variant="h5" gutterBottom sx={{ marginBottom: 2, paddingLeft: 1, paddingTop: 1 }}>
                        System Stats
                      </Typography>
                      <SystemStats />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {panel === "heatmap" && (
                <motion.div key="heatmap" {...panelMotion} style={{ width: 720 }}>
                  <Card>
                    <CardContent sx={{ padding: 3 }}>
                      <Typography variant="h5" gutterBottom sx={{ marginBottom: 2, paddingLeft: 1, paddingTop: 1 }}>
                        Activity Heatmap
                      </Typography>
                      <ActivityHeatmap />
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          {/* Notifications */}
          <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1300 }}>
            <Notifications notifications={notifications} />
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
