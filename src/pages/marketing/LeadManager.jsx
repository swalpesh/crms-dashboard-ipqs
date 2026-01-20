import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  IconButton,
  Avatar,
  Chip,
  InputBase,
  Checkbox,
  Stack
} from '@mui/material';

// Icons
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';

// --- THEME CONSTANTS ---
const theme = {
  bgDark: '#0f0c29',
  bgGradient: 'radial-gradient(circle at 10% 20%, rgba(91, 33, 182, 0.4) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(30, 58, 138, 0.4) 0%, transparent 40%)',
  glassBg: 'rgba(255, 255, 255, 0.05)',
  glassBorder: '1px solid rgba(255, 255, 255, 0.1)',
  glassHighlight: 'rgba(255, 255, 255, 0.2)',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  accentBlue: '#3b82f6',
  accentBlueGlow: 'rgba(59, 130, 246, 0.5)',
  statusRed: '#ef4444',
  statusYellow: '#f59e0b',
  statusGreen: '#10b981',
};

// --- STYLES ---
const styles = {
  container: {
    minHeight: '100vh',
    bgcolor: theme.bgDark,
    background: `${theme.bgDark} ${theme.bgGradient}`,
    color: theme.textPrimary,
    fontFamily: "'Inter', sans-serif",
    p: { xs: 2, md: 4 },
    position: 'relative',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(80px)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  glassCard: {
    background: theme.glassBg,
    backdropFilter: 'blur(16px)',
    border: theme.glassBorder,
    borderTop: `1px solid ${theme.glassHighlight}`,
    borderRadius: '24px',
    p: 3,
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
    height: '100%',
  },
  toggleBtn: {
    textTransform: 'none',
    color: theme.textSecondary,
    borderRadius: '8px',
    px: 2,
    py: 0.8,
    fontSize: '0.9rem',
    transition: 'all 0.3s',
    '&.active': {
      bgcolor: theme.accentBlue,
      color: '#fff',
      boxShadow: `0 2px 10px ${theme.accentBlueGlow}`,
    },
    '&:hover:not(.active)': {
      bgcolor: 'rgba(255,255,255,0.05)',
    }
  },
  calendarDay: {
    height: 40,
    width: 40,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '0.9rem',
    position: 'relative',
    transition: '0.2s',
    '&:hover:not(.active)': { bgcolor: 'rgba(255,255,255,0.1)' },
    '&.active': {
      background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
      color: '#fff',
      boxShadow: `0 4px 15px ${theme.accentBlueGlow}`,
    },
    '&.disabled': { opacity: 0.3 },
  },
  dot: {
    width: 4, height: 4, borderRadius: '50%', display: 'inline-block', mx: 0.2, mt: 0.5
  },
  queueItem: {
    bgcolor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    p: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    transition: 'transform 0.2s',
    '&:hover': {
      bgcolor: 'rgba(255, 255, 255, 0.06)',
      transform: 'translateY(-2px)',
    }
  },
  priorityBtn: {
    flex: 1,
    py: 1.2,
    borderRadius: '8px',
    border: '1px solid transparent',
    bgcolor: 'rgba(255,255,255,0.05)',
    color: theme.textSecondary,
    textTransform: 'none',
    '&.active.medium': {
      color: '#60a5fa',
      bgcolor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 0.5)',
      boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)',
    }
  },
  inputGroup: {
    bgcolor: 'rgba(0, 0, 0, 0.2)',
    border: theme.glassBorder,
    borderRadius: '8px',
    p: 1.5,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#fff',
  }
};

const LeadManager = () => {
  const [scheduleType, setScheduleType] = useState('my'); // 'my' | 'team'
  const [assignType, setAssignType] = useState('specific'); // 'specific' | 'flexible'
  
  // --- SUB-COMPONENTS (Inline for single file requirement) ---

  const CalendarSection = () => (
    <Box sx={styles.glassCard}>
      <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '12px', p: 0.5, display: 'inline-flex', mb: 3 }}>
        <Button onClick={() => setScheduleType('my')} sx={{ ...styles.toggleBtn, className: scheduleType === 'my' ? 'active' : '' }}>
          My Schedule
        </Button>
        <Button onClick={() => setScheduleType('team')} sx={{ ...styles.toggleBtn, className: scheduleType === 'team' ? 'active' : '' }}>
          Team Schedule
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <IconButton sx={{ color: '#fff' }}><ChevronLeftIcon /></IconButton>
        <Typography variant="h6" fontWeight={600}>October 2024</Typography>
        <IconButton sx={{ color: '#fff' }}><ChevronRightIcon /></IconButton>
      </Box>

      {/* Calendar Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, textAlign: 'center', mb: 3 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <Typography key={i} sx={{ color: theme.textSecondary, fontSize: '0.8rem', mb: 1 }}>{d}</Typography>
        ))}
        
        {/* Empty Days */}
        {[...Array(3)].map((_, i) => <Box key={`e-${i}`} />)}
        
        {/* Days Logic Mockup */}
        <Box sx={{ ...styles.calendarDay, className: 'disabled' }}>30</Box>
        {[...Array(31)].map((_, i) => {
          const day = i + 1;
          const isActive = day === 14;
          const hasBlueDot = [3, 10, 14].includes(day);
          const hasGrayDot = [9].includes(day);
          const hasRedDot = [14].includes(day);

          return (
            <Box key={day} sx={{ 
              ...styles.calendarDay, 
              ...(isActive ? styles.calendarDay['&.active'] : {}) 
            }}>
              {day}
              <Box sx={{ display: 'flex', mt: 0.5 }}>
                {hasBlueDot && <Box sx={{ ...styles.dot, bgcolor: theme.accentBlue }} />}
                {hasGrayDot && <Box sx={{ ...styles.dot, bgcolor: '#9ca3af' }} />}
                {hasRedDot && <Box sx={{ ...styles.dot, bgcolor: theme.statusRed }} />}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, fontSize: '0.75rem', color: theme.textSecondary }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ ...styles.dot, bgcolor: theme.accentBlue }} /> You
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ ...styles.dot, bgcolor: '#9ca3af' }} /> Others
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ ...styles.dot, bgcolor: theme.statusRed }} /> Conflict
        </Box>
      </Box>
    </Box>
  );

  const QueueSection = () => (
    <Box sx={styles.glassCard}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>Pending Visits Queue</Typography>
        <Stack direction="row" spacing={1}>
          <IconButton size="small" sx={{ color: theme.textSecondary }}><FilterListIcon fontSize="small" /></IconButton>
          <IconButton size="small" sx={{ color: theme.textSecondary }}><SwapVertIcon fontSize="small" /></IconButton>
        </Stack>
      </Box>

      <Stack spacing={2}>
        {[
          { name: 'Volt Industries', loc: 'Sector 4 Substation', badge: 'VIP/Escalation', bColor: 'rgba(239, 68, 68, 0.2)', tColor: '#fca5a5', bBorder: 'rgba(239, 68, 68, 0.3)' },
          { name: 'PowerGrid Corp', loc: 'Riverside Power Plant', badge: 'Standard', bColor: 'rgba(245, 158, 11, 0.2)', tColor: '#fcd34d', bBorder: 'rgba(245, 158, 11, 0.3)' },
          { name: 'Nexus Energy', loc: 'Downtown HQ', badge: 'Flexible', bColor: 'rgba(16, 185, 129, 0.2)', tColor: '#6ee7b7', bBorder: 'rgba(16, 185, 129, 0.3)' },
        ].map((item, i) => (
          <Box key={i} sx={styles.queueItem}>
            <Checkbox sx={{ color: theme.textSecondary, '&.Mui-checked': { color: theme.accentBlue }, p: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
              <Typography variant="caption" sx={{ color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: 12 }} /> {item.loc}
              </Typography>
            </Box>
            <Chip label={item.badge} size="small" sx={{ 
              bgcolor: item.bColor, color: item.tColor, border: `1px solid ${item.bBorder}`, fontSize: '0.65rem', height: 20 
            }} />
          </Box>
        ))}
      </Stack>
    </Box>
  );

  const AssignSection = () => (
    <Box sx={styles.glassCard}>
      <Typography variant="h6" fontWeight={600} mb={3}>Assign Visit</Typography>

      {/* Toggle */}
      <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '12px', p: 0.5, display: 'flex', mb: 3 }}>
        <Button fullWidth onClick={() => setAssignType('specific')} sx={{ ...styles.toggleBtn, className: assignType === 'specific' ? 'active' : '' }}>
          Specific Time
        </Button>
        <Button fullWidth onClick={() => setAssignType('flexible')} sx={{ ...styles.toggleBtn, className: assignType === 'flexible' ? 'active' : '' }}>
          Flexible Bucket
        </Button>
      </Box>

      {/* Date/Time Inputs */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6}>
          <Typography variant="caption" color={theme.textSecondary} mb={1} display="block">Date</Typography>
          <Box sx={styles.inputGroup}>
            <Typography variant="body2">10/14/2024</Typography>
            <CalendarTodayIcon sx={{ fontSize: 18, color: theme.textSecondary }} />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color={theme.textSecondary} mb={1} display="block">Time</Typography>
          <Box sx={styles.inputGroup}>
            <Typography variant="body2">09:00 AM</Typography>
            <AccessTimeIcon sx={{ fontSize: 18, color: theme.textSecondary }} />
          </Box>
        </Grid>
      </Grid>

      {/* Priority */}
      <Box mb={3}>
        <Typography variant="caption" color={theme.textSecondary} mb={1} display="block">Priority</Typography>
        <Stack direction="row" spacing={1}>
          <Button sx={{ ...styles.priorityBtn, color: '#fca5a5', bgcolor: 'rgba(239, 68, 68, 0.1)' }}>High</Button>
          <Button sx={{ ...styles.priorityBtn, className: 'active medium' }}>Medium</Button>
          <Button sx={{ ...styles.priorityBtn, color: '#6ee7b7', bgcolor: 'rgba(16, 185, 129, 0.1)' }}>Low</Button>
        </Stack>
      </Box>

      {/* Technician Assignment */}
      <Box>
        <Typography variant="caption" color={theme.textSecondary} mb={1} display="block">Assign Technical Person</Typography>
        <Box sx={{ 
          bgcolor: 'rgba(0,0,0,0.2)', border: theme.glassBorder, borderRadius: '12px', overflow: 'hidden'
        }}>
          {/* Self Assign */}
          <Box sx={{ p: 1.5, borderBottom: theme.glassBorder, display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon sx={{ color: '#fbbf24', fontSize: 18 }} />
            <Typography variant="body2" fontWeight={500}>Assign to Me (Self)</Typography>
          </Box>

          {/* Search */}
          <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchIcon sx={{ color: theme.textSecondary, fontSize: 20 }} />
            <InputBase placeholder="Search other technicians..." sx={{ color: 'white', fontSize: '0.9rem', width: '100%' }} />
          </Box>

          {/* List */}
          <Stack spacing={0.5} p={1}>
            {[
              { id: 'AV', name: 'Amit Verma', load: 'Low', lColor: '#a7f3d0' },
              { id: 'PS', name: 'Priya Sharma', load: 'Medium', lColor: '#fde047' },
              { id: 'RK', name: 'Rajesh Kumar', load: 'High', lColor: '#fca5a5' },
            ].map((tech, i) => (
              <Box key={i} sx={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, 
                borderRadius: '8px', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: 'rgba(255,255,255,0.2)', fontWeight: 'bold' }}>
                    {tech.id}
                  </Avatar>
                  <Typography variant="body2">{tech.name}</Typography>
                </Box>
                <Chip label={`Load: ${tech.load}`} size="small" sx={{ 
                  height: 20, fontSize: '0.65rem', bgcolor: tech.lColor, color: '#000', fontWeight: 600 
                }} />
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* CTA */}
      <Button fullWidth sx={{ 
        mt: 3, py: 1.8, borderRadius: '12px', fontWeight: 600, fontSize: '1rem',
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white',
        boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)',
        '&:hover': { transform: 'scale(1.02)', boxShadow: '0 6px 25px rgba(37, 99, 235, 0.6)' }
      }}>
        Complete Action
      </Button>
    </Box>
  );

  return (
    <Box sx={styles.container}>
      {/* Background Orbs */}
      <Box sx={{ ...styles.orb, width: 400, height: 400, bgcolor: 'rgba(139, 92, 246, 0.15)', top: -50, left: -100 }} />
      <Box sx={{ ...styles.orb, width: 300, height: 300, bgcolor: 'rgba(59, 130, 246, 0.15)', bottom: 50, right: -50 }} />

      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        
        {/* Header */}
        <Typography variant="h4" fontWeight={600} mb={4} sx={{ 
          background: 'linear-gradient(to right, #fff, #a5b4fc)', 
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' 
        }}>
          Lead manager
        </Typography>

        {/* Layout Grid */}
        <Grid container spacing={3}>
          
          {/* Left Column: Calendar & Queue */}
          <Grid item xs={12} lg={7} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <CalendarSection />
            <QueueSection />
          </Grid>

          {/* Right Column: Assign Form */}
          <Grid item xs={12} lg={5}>
            <AssignSection />
          </Grid>

        </Grid>
      </Box>
    </Box>
  );
};

export default LeadManager;