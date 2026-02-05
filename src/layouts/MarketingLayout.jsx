import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Tooltip,
  Drawer,
  useMediaQuery,
  Button,
  Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import BoltIcon from "@mui/icons-material/Bolt"; 
import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import MarketingSideNav from "../components/MarketingSideNav.jsx";

const DRAWER_WIDTH = 260;

// --- Styles matching the "Dark Glassmorphism" theme ---
const glassBorder = "rgba(255, 255, 255, 0.08)"; // Subtler border
const glassBgHover = "rgba(255, 255, 255, 0.1)";

// Style for the square icon buttons (Calendar, Mail, Bell)
const actionBtnStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "12px",
  border: `1px solid ${glassBorder}`,
  backgroundColor: "rgba(255, 255, 255, 0.03)", // Darker, transparent bg
  color: "rgba(255, 255, 255, 0.7)", // Muted white text
  marginLeft: "12px",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: glassBgHover,
    color: "#fff",
    transform: "translateY(-2px)",
    borderColor: "rgba(255,255,255,0.2)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
  },
};

export default function MarketingLayout() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Public folder logo fallbacks
  const logoCandidates = ["/ipqs.png", "/ipqs_logo.png", "/logo.png"];
  const [logoIdx, setLogoIdx] = useState(0);
  const logoSrc = logoCandidates[Math.min(logoIdx, logoCandidates.length - 1)];

  const handleLogout = () => {
    try {
      ["localStorage", "sessionStorage"].forEach((store) => {
        const s = window[store];
        s.removeItem("auth_token");
        s.removeItem("auth_user");
        s.removeItem("auth_role");
        s.removeItem("remember_email");
      });
    } catch {}
    navigate("/logout", { replace: true });
  };

  return (
    // Main Page Background - Matching the dark theme
    <Box sx={{ minHeight: "100vh", bgcolor: "#0f0c29" }}>
      
      {/* Left sidenav drawer */}
      <Drawer
        variant={isMdUp ? "permanent" : "temporary"}
        open={isMdUp ? true : open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: `1px solid ${glassBorder}`,
            bgcolor: "transparent", // Let the Nav component handle its own bg
            // Ensure no white background leaks through
            background: "linear-gradient(to bottom right, #131129, #1a1625)",
          },
        }}
      >
        <MarketingSideNav onNavigate={() => setOpen(false)} />
      </Drawer>

      {/* Content area */}
      <Box
        sx={{
          ml: { xs: 0, md: `${DRAWER_WIDTH}px` },
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* --- TOP NAV BAR START --- */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            // Updated to Dark Glass Gradient
            background: "linear-gradient(to right, #131129, #1a1625)", 
            color: "text.primary",
            borderBottom: `1px solid ${glassBorder}`,
            backdropFilter: "blur(10px)",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              minHeight: 70, 
              px: { xs: 2, md: 4 },
            }}
          >
            {/* 1. Left: Hamburger (Mobile) */}
            <Box sx={{ display: "flex", alignItems: "center", width: "50px" }}>
              {!isMdUp && (
                <IconButton
                  aria-label="open navigation"
                  onClick={() => setOpen(true)}
                  sx={{ color: "#fff" }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>

            {/* 2. Center: Logo */}
            <Box
              sx={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
              }}
            >
              <img
                src={logoSrc}
                alt="ENGAGE"
                onError={() => setLogoIdx((i) => i + 1)}
                style={{
                  height: 28, // Slightly larger for better visibility
                  width: "auto",
                  display: "block",
                  objectFit: "contain",
                  // Invert filter to make logo white
                  filter: "brightness(0) invert(1) drop-shadow(0 0 8px rgba(255,255,255,0.3))", 
                }}
              />
            </Box>

            {/* 3. Right: Profile & Action Icons */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              
              {/* My Profile Button */}
              {isMdUp && (
                <Button
                  startIcon={<BoltIcon sx={{ color: "#818cf8" }} />} // Indigo accent
                  sx={{
                    borderRadius: "30px",
                    color: "#fff",
                    textTransform: "uppercase",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.8px",
                    border: `1px solid ${glassBorder}`,
                    background: "rgba(255, 255, 255, 0.03)",
                    padding: "6px 20px",
                    marginRight: "10px",
                    transition: "all 0.2s",
                    "&:hover": {
                      background: "rgba(59, 130, 246, 0.1)", // Blue tint on hover
                      borderColor: "#3b82f6",
                      boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
                    },
                  }}
                >
                  My Profile
                </Button>
              )}

              {/* Calendar Icon */}
              <Tooltip title="My Tasks">
                <IconButton sx={actionBtnStyle}>
                   <CalendarTodayIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>

              {/* Message Icon */}
              <Tooltip title="Messages">
                <IconButton sx={actionBtnStyle}>
                   <MailOutlineIcon sx={{ fontSize: 19 }} />
                </IconButton>
              </Tooltip>

              {/* Notification Icon */}
              <Tooltip title="Notifications">
                <IconButton sx={actionBtnStyle}>
                   <NotificationsNoneIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>

              {/* Logout Icon */}
              <Tooltip title="Logout">
                <IconButton
                  onClick={handleLogout}
                  sx={{
                    marginLeft: "15px",
                    color: "rgba(255,255,255,0.4)",
                    transition: "color 0.2s",
                    "&:hover": { color: "#ef4444" }, // Red on hover for logout
                  }}
                >
                  <LogoutIcon sx={{ fontSize: 22 }} />
                </IconButton>
              </Tooltip>

            </Box>
          </Toolbar>
        </AppBar>
        {/* --- TOP NAV BAR END --- */}

        {/* Main Content Area - Renders child routes */}
        <Box component="main" sx={{ p: 0, width: "100%", flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}