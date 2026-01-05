import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Avatar,
  InputBase,
  Checkbox,
  keyframes,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  FilterList,
  SwapVert,
  LocationOn,
  CalendarToday,
  AccessTime,
  Star,
  Search
} from '@mui/icons-material';

// --- ANIMATIONS ---
const float = keyframes`
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -30px); }
`;

// --- STYLES CONSTANTS ---

const pageStyle = {
  minHeight: '100vh',
  background: '#0f0c29',
  backgroundImage: `
    radial-gradient(circle at 10% 20%, rgba(91, 33, 182, 0.4) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(30, 58, 138, 0.4) 0%, transparent 40%)
  `,
  color: '#fff',
  fontFamily: "'Inter', sans-serif",
  position: 'relative',
  overflowX: 'hidden',
  p: { xs: 2, md: 4 },
  display: 'flex',
  justifyContent: 'center',
};

const orbStyle = {
  position: 'fixed',
  borderRadius: '50%',
  filter: 'blur(80px)',
  zIndex: 0,
  animation: `${float} 10s infinite ease-in-out`,
};

// Glass Card Style
const glassCardStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderTop: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '24px',
  p: 3,
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
};

// Toggle Buttons
const toggleContainerStyle = {
  background: 'rgba(0, 0, 0, 0.2)',
  p: '4px',
  borderRadius: '12px',
  display: 'inline-flex',
  width: 'fit-content',
};

const toggleBtnStyle = (active) => ({
  background: active ? '#3b82f6' : 'transparent',
  color: active ? 'white' : 'rgba(255, 255, 255, 0.6)',
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '14px',
  fontWeight: 500,
  px: 2,
  py: 0.5,
  boxShadow: active ? '0 2px 10px rgba(59, 130, 246, 0.5)' : 'none',
  '&:hover': {
    background: active ? '#3b82f6' : 'rgba(255,255,255,0.05)',
  },
});

// Priority Button
const priorityBtnStyle = (active, color) => ({
  flex: 1,
  background: active ? `${color}20` : 'rgba(255,255,255,0.05)', 
  color: active ? color : 'rgba(255,255,255,0.6)',
  border: active ? `1px solid ${color}80` : '1px solid transparent',
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '13px',
  py: 1,
  '&:hover': { background: `${color}15` }
});

// Badge Style
const badgeStyle = (color, bg) => ({
  fontSize: '11px',
  fontWeight: 700,
  color: color,
  bgcolor: bg,
  px: 1.5,
  py: 0.5,
  borderRadius: '20px',
  border: `1px solid ${color}40`,
  whiteSpace: 'nowrap'
});

const TechnicalVisitPlanner = () => {
  const [scheduleView, setScheduleView] = useState('my');
  const [timeView, setTimeView] = useState('specific');
  const [priority, setPriority] = useState('medium');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={pageStyle}>
      <Box sx={{ ...orbStyle, width: '400px', height: '400px', background: 'rgba(139, 92, 246, 0.15)', top: '-50px', left: '-100px' }} />
      <Box sx={{ ...orbStyle, width: '300px', height: '300px', background: 'rgba(59, 130, 246, 0.15)', bottom: '50px', right: '-50px', animationDelay: '-5s' }} />

      <Box sx={{ width: '100%', maxWidth: '1200px', position: 'relative', zIndex: 1 }}>
        
        <Typography variant="h4" sx={{ 
          mb: 4, fontWeight: 600, 
          background: 'linear-gradient(to right, #fff, #a5b4fc)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          fontSize: { xs: '1.5rem', md: '2rem' }
        }}>
          Visit Planner & Team Manager
        </Typography>

        {/* --- CUSTOM GRID LAYOUT (Matching CSS 1.8fr 1.2fr) --- */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.8fr 1.2fr', // EXACT CSS MATCH
          gap: 3,
          width: '100%'
        }}>
          
          {/* ================= LEFT COLUMN ================= */}
          <Stack spacing={3}>
            
            {/* Calendar Card */}
            <Box sx={glassCardStyle}>
              <Box sx={toggleContainerStyle}>
                <Button onClick={() => setScheduleView('my')} sx={toggleBtnStyle(scheduleView === 'my')}>My Schedule</Button>
                <Button onClick={() => setScheduleView('team')} sx={toggleBtnStyle(scheduleView === 'team')}>Team Schedule</Button>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 3 }}>
                <IconButton size="small" sx={{ color: '#fff' }}><ChevronLeft /></IconButton>
                <Typography variant="h6" fontWeight={600}>October 2024</Typography>
                <IconButton size="small" sx={{ color: '#fff' }}><ChevronRight /></IconButton>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, textAlign: 'center', mb: 2 }}>
                {['S','M','T','W','T','F','S'].map(d => (
                  <Typography key={d} sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', mb: 1, fontWeight: 500 }}>{d}</Typography>
                ))}
                
                {[...Array(3)].map((_, i) => <Box key={`e-${i}`} />)}
                <Box sx={{ ...dayBaseStyle, color: 'rgba(255,255,255,0.3)' }}>30</Box>
                <Box sx={dayBaseStyle}>1</Box>
                <Box sx={dayBaseStyle}>2</Box>
                <Box sx={dayBaseStyle}>3 <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#3b82f6', mt: 0.5 }} /></Box>
                {[4,5,6,7,8].map(d => <Box key={d} sx={dayBaseStyle}>{d}</Box>)}
                <Box sx={dayBaseStyle}>9 <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#9ca3af', mt: 0.5 }} /></Box>
                <Box sx={dayBaseStyle}>10 <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#3b82f6', mt: 0.5 }} /></Box>
                {[11,12,13].map(d => <Box key={d} sx={dayBaseStyle}>{d}</Box>)}
                
                {/* Active Day */}
                <Box sx={{ 
                  ...dayBaseStyle, 
                  background: 'linear-gradient(135deg, #60a5fa, #3b82f6)', 
                  color: '#fff', 
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.5)' 
                }}>
                  14
                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#fff' }} />
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#ef4444' }} />
                  </Stack>
                </Box>

                {[15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31].map(d => <Box key={d} sx={dayBaseStyle}>{d}</Box>)}
              </Box>

              <Stack direction="row" spacing={3} justifyContent="center" sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#3b82f6' }} /> You</Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#9ca3af' }} /> Others</Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ef4444' }} /> Conflict</Box>
              </Stack>
            </Box>

            {/* Queue Card */}
            <Box sx={glassCardStyle}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600 }}>Pending Visits Queue</Typography>
                <Stack direction="row" spacing={1} sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  <IconButton size="small" sx={{ color: 'inherit' }}><FilterList fontSize="small" /></IconButton>
                  <IconButton size="small" sx={{ color: 'inherit' }}><SwapVert fontSize="small" /></IconButton>
                </Stack>
              </Box>

              <Stack spacing={1.5}>
                <QueueItem title="Volt Industries" subtitle="Sector 4 Substation" badge="VIP/Escalation" type="red" />
                <QueueItem title="PowerGrid Corp" subtitle="Riverside Power Plant" badge="Standard" type="yellow" />
                <QueueItem title="Nexus Energy" subtitle="Downtown HQ" badge="Flexible" type="green" />
              </Stack>
            </Box>

          </Stack>

          {/* ================= RIGHT COLUMN ================= */}
          <Box sx={glassCardStyle}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Assign Visit</Typography>

            {/* Toggle Full Width */}
            <Box sx={{ ...toggleContainerStyle, width: '100%', display: 'flex', mb: 3 }}>
              <Button fullWidth onClick={() => setTimeView('specific')} sx={toggleBtnStyle(timeView === 'specific')}>Specific Time</Button>
              <Button fullWidth onClick={() => setTimeView('flexible')} sx={toggleBtnStyle(timeView === 'flexible')}>Flexible Bucket</Button>
            </Box>

            {/* Inputs */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', mb: 1 }}>Date</Typography>
                <Box sx={glassInputStyle}>
                  <Typography fontSize="13px" fontWeight={500}>10/14/2024</Typography>
                  <CalendarToday fontSize="small" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }} />
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', mb: 1 }}>Time</Typography>
                <Box sx={glassInputStyle}>
                  <Typography fontSize="13px" fontWeight={500}>09:00 AM</Typography>
                  <AccessTime fontSize="small" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }} />
                </Box>
              </Box>
            </Stack>

            {/* Priority */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', mb: 1 }}>Priority</Typography>
              <Stack direction="row" spacing={1}>
                <Button onClick={() => setPriority('high')} sx={priorityBtnStyle(priority === 'high', '#fca5a5')}>High</Button>
                <Button onClick={() => setPriority('medium')} sx={priorityBtnStyle(priority === 'medium', '#60a5fa')}>Medium</Button>
                <Button onClick={() => setPriority('low')} sx={priorityBtnStyle(priority === 'low', '#6ee7b7')}>Low</Button>
              </Stack>
            </Box>

            {/* Tech Selection */}
            <Box sx={{ mb: 3, flex: 1 }}>
              <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', mb: 1 }}>Assign Technical Person</Typography>
              
              <Box sx={{ 
                background: 'rgba(0, 0, 0, 0.3)', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                <Box sx={{ p: 1.5, borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                  <Star sx={{ color: '#fbbf24', fontSize: '18px' }} />
                  <Typography fontSize="13px" fontWeight={600}>Assign to Me (Self)</Typography>
                </Box>

                <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.6)' }}>
                  <Search fontSize="small" />
                  <InputBase placeholder="Search other technicians..." sx={{ color: '#fff', fontSize: '13px', flex: 1, '&::placeholder': { color: 'rgba(255,255,255,0.4)' } }} />
                </Box>

                <Stack spacing={0.5} sx={{ p: 1 }}>
                  <TechItem name="Amit Verma" initials="AV" load="Low" loadColor="#a7f3d0" loadText="#064e3b" />
                  <TechItem name="Priya Sharma" initials="PS" load="Medium" loadColor="#fde047" loadText="#713f12" />
                  <TechItem name="Rajesh Kumar" initials="RK" load="High" loadColor="#fca5a5" loadText="#7f1d1d" />
                </Stack>
              </Box>
            </Box>

            <Button fullWidth sx={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white',
              py: 1.5,
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)',
              mt: 'auto', // Push to bottom
              '&:hover': { boxShadow: '0 6px 25px rgba(37, 99, 235, 0.6)' }
            }}>
              Complete Action
            </Button>

          </Box>

        </Box>
      </Box>
    </Box>
  );
};

// --- Sub-Components ---

const dayBaseStyle = {
  height: '36px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '13px',
  borderRadius: '50%',
  cursor: 'pointer',
  transition: 'background 0.2s',
  '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
};

const glassInputStyle = {
  background: 'rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  p: 1.2,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const QueueItem = ({ title, subtitle, badge, type }) => (
  <Box sx={{
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    p: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    transition: 'transform 0.2s',
    '&:hover': { background: 'rgba(255, 255, 255, 0.06)', transform: 'translateY(-2px)' }
  }}>
    <Checkbox size="small" sx={{ 
      color: 'rgba(255,255,255,0.4)', 
      p: 0, 
      '&.Mui-checked': { color: '#3b82f6' } 
    }} />
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{title}</Typography>
      <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
        <LocationOn sx={{ fontSize: '12px' }} /> {subtitle}
      </Typography>
    </Box>
    <Box sx={
      type === 'red' ? badgeStyle('#fca5a5', 'rgba(239, 68, 68, 0.2)') :
      type === 'yellow' ? badgeStyle('#fcd34d', 'rgba(245, 158, 11, 0.2)') :
      badgeStyle('#6ee7b7', 'rgba(16, 185, 129, 0.2)')
    }>{badge}</Box>
  </Box>
);

const TechItem = ({ name, initials, load, loadColor, loadText }) => (
  <Box sx={{ 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
    p: 1, borderRadius: '8px', cursor: 'pointer', 
    '&:hover': { background: 'rgba(255, 255, 255, 0.05)' } 
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Avatar sx={{ width: 28, height: 28, fontSize: '10px', bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>{initials}</Avatar>
      <Typography fontSize="13px" fontWeight={500}>{name}</Typography>
    </Box>
    <Box sx={{ 
      fontSize: '10px', px: 1, py: 0.4, borderRadius: '12px', 
      bgcolor: loadColor, color: loadText, fontWeight: 700 
    }}>
      Load: {load}
    </Box>
  </Box>
);

export default TechnicalVisitPlanner;