import {
  AppBar,
  Badge,
  Box,
  Drawer,
  IconButton,
  InputBase,
  Toolbar,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";

import EmployeeSideNav from "../components/EmployeeSideNav";

const DRAWER_WIDTH = 288;
const APPBAR_HEIGHT = 64;

export default function EmployeeLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const toggleDrawer = () => setMobileOpen((p) => !p);

  // Close the mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f7f7f7" }}>
      {/* MOBILE drawer (temporary) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        <EmployeeSideNav onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      {/* DESKTOP drawer (permanent) */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            borderRight: "1px solid",
            borderColor: "divider",
            boxSizing: "border-box",
          },
        }}
      >
        <EmployeeSideNav />
      </Drawer>

      {/* Top App Bar */}
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          height: APPBAR_HEIGHT,
          borderBottom: "1px solid",
          borderColor: "divider",
          ml: { md: `${DRAWER_WIDTH}px` },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Toolbar sx={{ minHeight: APPBAR_HEIGHT, gap: 1, px: { xs: 2, md: 3 } }}>
          {/* Hamburger only on mobile */}
          <IconButton
            onClick={toggleDrawer}
            size="large"
            sx={{ display: { xs: "inline-flex", md: "none" }, mr: 1 }}
            aria-label="open menu"
          >
            <MenuIcon />
          </IconButton>

          {/* Search */}
          <Box
            sx={{
              flex: 1,
              maxWidth: 760,
              bgcolor: "#f1f2f4",
              borderRadius: 2,
              px: 1.5,
              display: "flex",
              alignItems: "center",
            }}
          >
            <SearchIcon fontSize="small" sx={{ color: "text.secondary", mr: 1 }} />
            <InputBase
              fullWidth
              placeholder="Search Keyword"
              sx={{ py: 1 }}
              inputProps={{ "aria-label": "search" }}
            />
          </Box>

          {/* Right-side actions */}
          <IconButton size="large">
            <RefreshOutlinedIcon />
          </IconButton>
          <IconButton size="large">
            <LightModeOutlinedIcon />
          </IconButton>
          <IconButton size="large">
            <Badge color="error" variant="dot">
              <NotificationsNoneOutlinedIcon />
            </Badge>
          </IconButton>
          <IconButton size="large">
            <AccountCircleOutlinedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { xs: 0, md: `${DRAWER_WIDTH}px` },
          pt: `calc(${APPBAR_HEIGHT}px + 16px)`,
          px: { xs: 3, md: 6 },
          pb: 4,
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
