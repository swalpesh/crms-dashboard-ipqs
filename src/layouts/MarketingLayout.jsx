import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Tooltip,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import MarketingSideNav from "../components/MarketingSideNav.jsx";

const DRAWER_WIDTH = 260;

export default function MarketingLayout() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Public folder logo fallbacks: /ipqs.png -> /ipqs_logo.png -> /logo.png
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
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
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
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        {/* Close the drawer after navigation on small screens */}
        <MarketingSideNav onNavigate={() => setOpen(false)} />
      </Drawer>

      {/* Content area (shifted on md+) */}
      <Box
        sx={{
          ml: { xs: 0, md: `${DRAWER_WIDTH}px` },
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* Top bar: hamburger (mobile) + centered logo + logout (right) */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "background.paper",
            color: "text.primary",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Toolbar
            sx={{
              // 3 equal regions: left icon, centered logo, right icon
              display: "grid",
              gridTemplateColumns: "48px 1fr 48px",
              alignItems: "center",
              minHeight: 64,
            }}
          >
            {/* Left: Hamburger (only on small screens) or spacer */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {!isMdUp ? (
                <IconButton
                  aria-label="open navigation"
                  onClick={() => setOpen(true)}
                >
                  <MenuIcon />
                </IconButton>
              ) : (
                <Box sx={{ width: 48, height: 48 }} />
              )}
            </Box>

            {/* Center: IPQS Logo from public folder */}
            <Box
              sx={{
                justifySelf: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none", // purely decorative
              }}
            >
              <img
                src={logoSrc}
                alt="IPQS"
                onError={() => setLogoIdx((i) => i + 1)}
                style={{
                  height: 28,
                  width: "auto",
                  display: "block",
                  objectFit: "contain",
                }}
              />
            </Box>

            {/* Right: Logout */}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Tooltip title="Logout">
                <IconButton
                  aria-label="logout"
                  onClick={handleLogout}
                  sx={{
                    color: "text.primary",
                    "&:hover": {
                      color: "error.main",
                      bgcolor: "rgba(215,25,20,0.07)",
                    },
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ p: { xs: 2, md: 3 }, width: "100%" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
