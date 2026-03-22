import React, { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

// --- THEME CONSTANTS ---
const themeColors = {
  bgGradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  glassBg: 'rgba(25, 25, 55, 0.65)',
  glassBorder: '1px solid rgba(255, 255, 255, 0.1)',
  textSecondary: '#a0a0c0',
  blue: '#3b82f6',
};

export default function Logout() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  // Clear Storage on Component Mount
  useEffect(() => {
    try {
      ["localStorage", "sessionStorage"].forEach((store) => {
        const s = window[store];
        s.removeItem("auth_token");
        s.removeItem("auth_user");
        s.removeItem("auth_role");
        // Optional: Keep 'remember_email' intact so it pre-fills on the next login
      });
    } catch {}
  }, []);

  // Timer Logic
  useEffect(() => {
    // If timer hits 0, navigate
    if (countdown <= 0) {
      navigate("/login", { replace: true });
      return;
    }

    // Decrement every second
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: themeColors.bgGradient,
        position: "relative",
        overflow: "hidden",
        px: 2,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* --- CSS Animations --- */}
      <style>{`
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.95) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes iconPulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `}</style>

      {/* Decorative Background Orbs */}
      <Box sx={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)', zIndex: 0 }} />
      <Box sx={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(215, 25, 20, 0.1) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: 0 }} />

      {/* Sexy Glassmorphic Card */}
      <Box
        sx={{
          background: themeColors.glassBg,
          backdropFilter: 'blur(20px)',
          border: themeColors.glassBorder,
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          p: { xs: 4, md: 6 },
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
          zIndex: 1,
          animation: 'fadeInScale 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        }}
      >
        {/* Animated Top Icon */}
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.1)',
            border: `1px solid rgba(59, 130, 246, 0.3)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 3,
            color: themeColors.blue,
            animation: 'iconPulse 2s infinite',
          }}
        >
          <LockOutlinedIcon fontSize="large" />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mb: 1.5, letterSpacing: '-0.5px' }}>
          You've been signed out
        </Typography>
        
        <Typography variant="body2" sx={{ color: themeColors.textSecondary, mb: 5, lineHeight: 1.6, fontSize: '0.95rem' }}>
          Your session is no longer active. You will be automatically redirected to the login page shortly.
        </Typography>

        {/* Circular Countdown Timer */}
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 5 }}>
          {/* Faded Background Circle */}
          <CircularProgress
            variant="determinate"
            value={100}
            size={80}
            thickness={2}
            sx={{ color: 'rgba(255,255,255,0.05)', position: 'absolute' }}
          />
          {/* Animated Foreground Circle */}
          <CircularProgress 
            variant="determinate" 
            value={(countdown / 5) * 100} 
            size={80}
            thickness={2}
            sx={{ 
                color: themeColors.blue,
                circle: { transition: 'stroke-dashoffset 1s linear' } // Makes the ring shrink smoothly
            }} 
          />
          {/* Centered Number */}
          <Box
            sx={{
              top: 0, left: 0, bottom: 0, right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h4" component="div" sx={{ color: '#fff', fontWeight: 800 }}>
              {countdown}
            </Typography>
          </Box>
        </Box>

        {/* Manual Redirect Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate("/login", { replace: true })}
          sx={{
            background: `linear-gradient(135deg, ${themeColors.blue}, #2563eb)`,
            color: '#fff',
            py: 1.5,
            borderRadius: '12px',
            fontSize: "0.95rem",
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.3s ease',
            "&:hover": { 
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 25px rgba(59, 130, 246, 0.4)',
            },
          }}
        >
          Go to Login Now
        </Button>
      </Box>
    </Box>
  );
}