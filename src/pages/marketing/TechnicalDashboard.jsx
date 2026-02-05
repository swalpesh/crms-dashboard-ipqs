import React from 'react';
import { Box, keyframes } from '@mui/material';
import TechnicalDashboardOverview from './Technicaldashboardoverview';

// --- ANIMATIONS ---
const liquidMove = keyframes`
  0% { transform: translate(0, 0) rotate(0deg) scale(1); border-radius: 40% 60% 50% 50% / 50% 50% 60% 40%; }
  50% { transform: translate(20px, 20px) rotate(10deg) scale(1.1); border-radius: 50% 50% 20% 80% / 25% 80% 20% 75%; }
  100% { transform: translate(-20px, -10px) rotate(-5deg) scale(0.9); border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
`;

const slideUpFade = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- THEME CONSTANTS ---
const themeColors = {
  bgDark: '#0f0c29',
  textPrimary: '#ffffff',
  accentPurple: 'rgba(91, 33, 182, 0.25)',
  accentBlue: 'rgba(59, 130, 246, 0.2)',
};

// --- STYLES ---
const pageStyle = {
  minHeight: '100vh',
  width: '100%',
  position: 'relative',
  overflowX: 'hidden',
  background: themeColors.bgDark,
  backgroundImage: `
    radial-gradient(circle at 15% 50%, rgba(76, 29, 149, 0.25) 0%, transparent 50%),
    radial-gradient(circle at 85% 30%, rgba(37, 99, 235, 0.2) 0%, transparent 50%)
  `,
  color: themeColors.textPrimary,
  fontFamily: "'Inter', sans-serif",
  p: { xs: 2, md: 4 },
};

const orbStyle = {
  position: 'fixed',
  borderRadius: '50%',
  filter: 'blur(80px)',
  zIndex: 0,
  animation: `${liquidMove} 10s infinite ease-in-out`,
};

export default function TechnicalDashboard() {
  return (
    <Box sx={pageStyle}>
      {/* --- Background Floating Orbs --- */}
      <Box 
        sx={{ 
          ...orbStyle, 
          width: '600px', height: '600px', 
          background: themeColors.accentPurple, 
          top: '-10%', left: '-10%', 
          animation: `${liquidMove} 15s infinite alternate` 
        }} 
      />
      <Box 
        sx={{ 
          ...orbStyle, 
          width: '500px', height: '500px', 
          background: themeColors.accentBlue, 
          bottom: '-10%', right: '-5%', 
          animation: `${liquidMove} 20s infinite alternate-reverse` 
        }} 
      />

      {/* --- Main Content Area --- */}
      <Box 
        sx={{ 
          position: 'relative', 
          zIndex: 1, 
          width: '100%',
          animation: `${slideUpFade} 0.8s ease-out`
        }}
      >
        <TechnicalDashboardOverview />
      </Box>
    </Box>
  );
}