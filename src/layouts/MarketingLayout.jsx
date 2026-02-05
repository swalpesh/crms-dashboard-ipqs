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
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import BoltIcon from "@mui/icons-material/Bolt"; 
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import CircleIcon from "@mui/icons-material/Circle";

import { Outlet, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import MarketingSideNav from "../components/MarketingSideNav.jsx";

// --- CONFIG ---
const DRAWER_WIDTH = 260;
// Using port 3000 as per your latest request, fallback to env var
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"; 

// --- Styles matching the "Dark Glassmorphism" theme ---
const glassBorder = "rgba(255, 255, 255, 0.08)";
const glassBgHover = "rgba(255, 255, 255, 0.1)";
const accentBlue = "#3b82f6";

// Style for the square icon buttons
const actionBtnStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "12px",
  border: `1px solid ${glassBorder}`,
  backgroundColor: "rgba(255, 255, 255, 0.03)", 
  color: "rgba(255, 255, 255, 0.7)", 
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

// Notification Sound (Simple Ding)
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

// Helper to get user role safely
const getUserRole = () => {
  const role = localStorage.getItem("auth_role") || sessionStorage.getItem("auth_role");
  return role ? role.toLowerCase() : "";
};

const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

export default function MarketingLayout() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // --- Notification State ---
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);
  
  // Audio Ref
  const audioRef = useRef(new Audio(NOTIFICATION_SOUND_URL));

  const openNotif = Boolean(notifAnchorEl);
  // Calculate unread count based on API 'is_read' (0 = unread, 1 = read)
  const unreadCount = notifications.filter(n => n.is_read === 0).length;

  // --- API: Fetch Notifications ---
  const fetchNotifications = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/notifications/my-notifications`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setNotifications(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // --- API: Mark Notification as Read ---
  const markAsRead = async (notificationId) => {
    try {
      const token = getToken();
      // Optimistic Update: Update UI immediately
      setNotifications(prev => prev.map(n => 
        n.notification_id === notificationId ? { ...n, is_read: 1 } : n
      ));

      await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Optionally re-fetch to ensure sync
      // fetchNotifications(); 
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  };

  // --- Effect: Poll & Sound ---
  useEffect(() => {
    fetchNotifications(); // Initial fetch

    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  // Play sound when unread count increases
  useEffect(() => {
    if (unreadCount > prevUnreadCount) {
      // Play sound
      audioRef.current.play().catch(e => console.log("Audio play failed (interaction required):", e));
    }
    setPrevUnreadCount(unreadCount);
  }, [unreadCount]);


  const handleNotifClick = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  // Public folder logo fallbacks
  const logoCandidates = ["/ipqs.png", "/ipqs_logo.png", "/logo.png"];
  const [logoIdx, setLogoIdx] = useState(0);
  const logoSrc = logoCandidates[Math.min(logoIdx, logoCandidates.length - 1)];

  // Check if user is Technical Team (Head or Employee)
  const isTechnicalTeam = useMemo(() => {
    const role = getUserRole();
    return role.includes("technical");
  }, []);

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

  // Helper for Notification Icon based on title/context
  const getNotifIcon = (title) => {
    const t = title?.toLowerCase() || "";
    if (t.includes("success") || t.includes("approved") || t.includes("complete")) return <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981' }} />;
    if (t.includes("warning") || t.includes("alert") || t.includes("reminder")) return <WarningIcon sx={{ fontSize: 20, color: '#f59e0b' }} />;
    return <InfoIcon sx={{ fontSize: 20, color: '#3b82f6' }} />;
  };

  // Helper for Time Formatting
  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour(s) ago`;
    return date.toLocaleDateString(); 
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
            bgcolor: "transparent", 
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
                  height: 28, 
                  width: "auto",
                  display: "block",
                  objectFit: "contain",
                  filter: "brightness(0) invert(1) drop-shadow(0 0 8px rgba(255,255,255,0.3))", 
                }}
              />
            </Box>

            {/* 3. Right: Profile & Action Icons */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              
              {/* My Profile Button */}
              {isMdUp && (
                <Button
                  startIcon={<BoltIcon sx={{ color: "#818cf8" }} />} 
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
                      background: "rgba(59, 130, 246, 0.1)", 
                      borderColor: "#3b82f6",
                      boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
                    },
                  }}
                >
                  My Profile
                </Button>
              )}

              {/* My Tasks (Hidden for Technical Team) */}
              {!isTechnicalTeam && (
                <Tooltip title="My Tasks">
                  <IconButton sx={actionBtnStyle}>
                    <CalendarTodayIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}

              {/* Message Icon */}
              <Tooltip title="Messages">
                <IconButton sx={actionBtnStyle}>
                   <MailOutlineIcon sx={{ fontSize: 19 }} />
                </IconButton>
              </Tooltip>

              {/* Notification Icon */}
              <Tooltip title="Notifications">
                <IconButton sx={actionBtnStyle} onClick={handleNotifClick}>
                   <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}>
                      <NotificationsNoneIcon sx={{ fontSize: 20 }} />
                   </Badge>
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
                    "&:hover": { color: "#ef4444" }, 
                  }}
                >
                  <LogoutIcon sx={{ fontSize: 22 }} />
                </IconButton>
              </Tooltip>

            </Box>
          </Toolbar>
        </AppBar>
        {/* --- TOP NAV BAR END --- */}

        {/* --- NOTIFICATION POPOVER --- */}
        <Popover
          open={openNotif}
          anchorEl={notifAnchorEl}
          onClose={handleNotifClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              width: 360,
              maxHeight: 500,
              bgcolor: '#1a1625',
              backgroundImage: 'linear-gradient(to bottom right, #1a1625, #0f0c29)',
              border: `1px solid ${glassBorder}`,
              borderRadius: '16px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
              overflow: 'hidden',
              mt: 1.5,
              ml: 1
            }
          }}
        >
          {/* Popover Header */}
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${glassBorder}` }}>
            <Typography variant="subtitle1" fontWeight={700} color="white">Notifications</Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.5)">
                {unreadCount} Unread
            </Typography>
          </Box>

          {/* Notification List */}
          <List sx={{ p: 0, overflowY: 'auto', maxHeight: 400 }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">No new notifications</Typography>
              </Box>
            ) : (
              notifications.map((notif) => {
                const isUnread = notif.is_read === 0;
                return (
                  <ListItem 
                    key={notif.notification_id} 
                    alignItems="flex-start"
                    onClick={() => isUnread && markAsRead(notif.notification_id)}
                    sx={{ 
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      bgcolor: isUnread ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                      cursor: isUnread ? 'pointer' : 'default',
                      transition: '0.2s',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 40, mt: 0.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {getNotifIcon(notif.title)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" fontWeight={isUnread ? 700 : 500} color="white" sx={{ fontSize: '0.9rem' }}>
                            {notif.title}
                          </Typography>
                          {isUnread && <CircleIcon sx={{ fontSize: 8, color: accentBlue }} />}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" color="rgba(255,255,255,0.7)" display="block" sx={{ mt: 0.5, lineHeight: 1.3 }}>
                            {notif.message}
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                             <Typography variant="caption" color="rgba(255,255,255,0.4)" sx={{ fontSize: '0.65rem' }}>
                                {formatTime(notif.created_at)}
                             </Typography>
                             {notif.sender_name && (
                                 <Typography variant="caption" color="rgba(255,255,255,0.3)" sx={{ fontSize: '0.65rem' }}>
                                    From: {notif.sender_name}
                                 </Typography>
                             )}
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                );
              })
            )}
          </List>
          
          {/* Footer */}
          <Box sx={{ p: 1.5, textAlign: 'center', borderTop: `1px solid ${glassBorder}` }}>
            <Typography variant="caption" sx={{ color: accentBlue, cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
              View All Activity
            </Typography>
          </Box>
        </Popover>

        {/* Main Content Area */}
        <Box component="main" sx={{ p: 0, width: "100%", flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}