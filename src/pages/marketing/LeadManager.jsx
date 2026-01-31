import React, { useState, useEffect, useMemo } from 'react';
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
  Stack,
  Popover,
} from '@mui/material';

// Icons
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';

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
  accentOrange: '#f59e0b', 
  statusRed: '#ef4444',
  statusYellow: '#f59e0b',
  statusGreen: '#10b981',
};

const styles = {
  container: {
    minHeight: '100vh',
    bgcolor: theme.bgDark,
    background: `${theme.bgDark} ${theme.bgGradient}`,
    color: theme.textPrimary,
    fontFamily: "'Inter', sans-serif",
    p: { xs: 2, md: 4 },
    width: '100%',
    overflowX: 'hidden',
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
    display: 'flex',
    flexDirection: 'column',
  },
  toggleBtn: {
    flex: 1,
    textTransform: 'none',
    color: theme.textSecondary,
    borderRadius: '8px',
    py: 1,
    fontSize: '0.9rem',
    '&.active': { bgcolor: theme.accentBlue, color: '#fff' },
  },
  calendarDay: {
    height: 42,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '0.9rem',
    position: 'relative',
    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
    '&.selected': {
      background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
      color: '#fff',
      fontWeight: 700,
    },
  },
  inputGroup: {
    bgcolor: 'rgba(0, 0, 0, 0.2)',
    border: theme.glassBorder,
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    height: '48px',
    overflow: 'hidden'
  },
  clickableInput: {
    width: '100%',
    '& .MuiInputBase-input': {
      color: 'white',
      fontSize: '0.85rem',
      cursor: 'pointer',
      padding: '12px',
    },
    '& input::-webkit-calendar-picker-indicator': {
      filter: 'invert(1)',
      cursor: 'pointer'
    }
  },
  dot: { width: 5, height: 5, borderRadius: '50%', mx: 0.2, mt: 0.5 },
  popover: {
    '& .MuiPaper-root': {
      bgcolor: '#1a1a35',
      color: 'white',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.1)',
      p: 2,
      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
      minWidth: '220px'
    }
  }
};

const LeadManager = () => {
  const [scheduleType, setScheduleType] = useState('my');
  const [priority, setPriority] = useState('Medium');
  const [techSearch, setTechSearch] = useState('');
  
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(new Date()); 
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [anchorEl, setAnchorEl] = useState(null);
  const [popupData, setPopupData] = useState(null);

  const technicians = useMemo(() => [
    { n: 'Amit Verma', l: 'Low', c: theme.statusGreen },
    { n: 'Priya Sharma', l: 'Medium', c: theme.statusYellow },
    { n: 'Rajesh Kumar', l: 'High', c: theme.statusRed },
    { n: 'Suresh Patil', l: 'Low', c: theme.statusGreen },
    { n: 'Anjali Mehra', l: 'High', c: theme.statusRed },
    { n: 'Vikram Singh', l: 'Medium', c: theme.statusYellow }
  ], []);

  const filteredTechs = useMemo(() => 
    technicians.filter(t => t.n.toLowerCase().includes(techSearch.toLowerCase())),
    [techSearch, technicians]
  );

  useEffect(() => {
    if (selectedDay !== today.getDate() || viewDate.getMonth() !== today.getMonth()) {
      const timer = setTimeout(() => {
        setSelectedDay(today.getDate());
        setViewDate(new Date());
        handleClosePopup();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [selectedDay, viewDate, today]);

  const handleDayClick = (event, day, task) => {
    setSelectedDay(day);
    if (task) {
      setAnchorEl(event.currentTarget);
      setPopupData({
        lead: task.lead,
        person: task.person,
        time: task.time,
        date: `${day} ${monthName} ${viewDate.getFullYear()}`
      });
    }
  };

  const handleClosePopup = () => {
    setAnchorEl(null);
    setPopupData(null);
  };

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  const mySchedule = {
    3: { lead: "Mahindra Logistics", person: "Rahul S.", time: "10:30 AM" },
    14: { lead: "Tata Motors", person: "Suresh P.", time: "02:00 PM" }
  };
  const teamSchedule = {
    9: { lead: "Reliance Ind.", person: "Vikram K.", time: "11:00 AM" },
    25: { lead: "Infosys Ltd", person: "Anjali M.", time: "04:30 PM" }
  };

  const handleMonthChange = (direction) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + direction, 1));
  };

  const CalendarSection = () => (
    <Box sx={styles.glassCard}>
      <Box sx={{ bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '12px', p: 0.5, display: 'flex', mb: 3 }}>
        <Button onClick={() => setScheduleType('my')} sx={styles.toggleBtn} className={scheduleType === 'my' ? 'active' : ''}>My Schedule</Button>
        <Button onClick={() => setScheduleType('team')} sx={styles.toggleBtn} className={scheduleType === 'team' ? 'active' : ''}>Team Schedule</Button>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <IconButton sx={{ color: '#fff' }} onClick={() => handleMonthChange(-1)}><ChevronLeftIcon /></IconButton>
        <Typography variant="h6" fontWeight={700}>{monthName} {viewDate.getFullYear()}</Typography>
        <IconButton sx={{ color: '#fff' }} onClick={() => handleMonthChange(1)}><ChevronRightIcon /></IconButton>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, textAlign: 'center', mb: 1 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (<Typography key={d} sx={{ color: theme.textSecondary, fontSize: '0.75rem', fontWeight: 600 }}>{d}</Typography>))}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, textAlign: 'center', mb: 3 }}>
        {[...Array(firstDay)].map((_, i) => <Box key={`pad-${i}`} />)}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const isSelected = day === selectedDay;
          const task = scheduleType === 'my' ? mySchedule[day] : teamSchedule[day];
          return (
            <Box key={day} onClick={(e) => handleDayClick(e, day, task)} sx={styles.calendarDay} className={isSelected ? 'selected' : ''}>
              <Typography variant="body2">{day}</Typography>
              <Box sx={{ display: 'flex', position: 'absolute', bottom: 4 }}>
                {scheduleType === 'my' && mySchedule[day] && <Box sx={{ ...styles.dot, bgcolor: theme.accentBlue }} />}
                {scheduleType === 'team' && teamSchedule[day] && <Box sx={{ ...styles.dot, bgcolor: theme.accentOrange }} />}
              </Box>
            </Box>
          );
        })}
      </Box>
      <Stack direction="row" spacing={3} justifyContent="center" sx={{ fontSize: '0.75rem', color: theme.textSecondary }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.accentBlue }} /> Me</Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.accentOrange }} /> Other</Box>
      </Stack>

      <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClosePopup} sx={styles.popover} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Box sx={{ position: 'relative' }}>
          <IconButton size="small" onClick={handleClosePopup} sx={{ position: 'absolute', top: -10, right: -10, color: theme.textSecondary }}><CloseIcon fontSize="small" /></IconButton>
          <Typography variant="caption" sx={{ color: theme.accentBlue, fontWeight: 700, display: 'block', mb: 1 }}>VISIT DETAILS</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{popupData?.lead}</Typography>
          <Typography variant="caption" sx={{ color: theme.textSecondary, display: 'block' }}>Person: {popupData?.person}</Typography>
          <Stack direction="row" spacing={2} mt={1.5} pt={1.5} sx={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
             <Box><Typography variant="caption" color={theme.textSecondary} display="block">Date</Typography><Typography variant="caption" fontWeight={600}>{popupData?.date}</Typography></Box>
             <Box><Typography variant="caption" color={theme.textSecondary} display="block">Time</Typography><Typography variant="caption" fontWeight={600}>{popupData?.time}</Typography></Box>
          </Stack>
        </Box>
      </Popover>
    </Box>
  );

  const QueueSection = () => (
    <Box sx={styles.glassCard}>
      <Typography variant="h6" fontWeight={700} mb={3}>Pending Visits Queue</Typography>
      <Stack 
        spacing={1.5} 
        onWheel={(e) => e.stopPropagation()} // Prevent page scroll
        sx={{ 
          height: '420px', 
          overflowY: 'auto',
          pr: 1,
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none'
        }}
      >
        {['Volt Industries', 'PowerGrid Corp', 'Nexus Energy', 'Adani Power', 'JSW Steel', 'Tata Power', 'L&T Infotech'].map((name, i) => (
          <Box key={i} sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Checkbox sx={{ color: 'rgba(255,255,255,0.2)', p: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600}>{name}</Typography>
              <Typography variant="caption" sx={{ color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: 12 }} /> Location Details
              </Typography>
            </Box>
            <Chip label="VIP" size="small" sx={{ height: 20, bgcolor: 'rgba(239, 68, 68, 0.1)', color: theme.statusRed }} />
          </Box>
        ))}
      </Stack>
    </Box>
  );

  const AssignSection = () => (
    <Box sx={styles.glassCard}>
      <Typography variant="h6" fontWeight={700} mb={4}>Assign Visit</Typography>
      <Box sx={{ bgcolor: theme.accentBlue, borderRadius: '12px', p: 1.5, display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Typography sx={{ color: '#fff', fontWeight: 600 }}>Specific Time</Typography>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={6}>
          <Typography variant="caption" color={theme.textSecondary} mb={0.5} display="block" fontWeight={600}>Date</Typography>
          <Box sx={styles.inputGroup}><InputBase type="date" sx={styles.clickableInput} defaultValue="2026-01-31" /></Box>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color={theme.textSecondary} mb={0.5} display="block" fontWeight={600}>Time</Typography>
          <Box sx={styles.inputGroup}><InputBase type="time" sx={styles.clickableInput} defaultValue="09:00" /></Box>
        </Grid>
      </Grid>

      <Box mb={3}>
        <Typography variant="caption" color={theme.textSecondary} mb={1} display="block" fontWeight={600}>Priority</Typography>
        <Stack direction="row" spacing={1}>
          {[{ label: 'High', color: theme.statusRed }, { label: 'Medium', color: theme.statusYellow }, { label: 'Low', color: theme.statusGreen }].map((p) => (
            <Button key={p.label} fullWidth onClick={() => setPriority(p.label)} sx={{ bgcolor: priority === p.label ? `${p.color}44` : 'rgba(255,255,255,0.05)', color: priority === p.label ? p.color : theme.textSecondary, border: priority === p.label ? `1px solid ${p.color}` : '1px solid transparent', textTransform: 'none', borderRadius: '10px' }}>{p.label}</Button>
          ))}
        </Stack>
      </Box>

      <Box>
        <Typography variant="caption" color={theme.textSecondary} mb={1} display="block" fontWeight={600}>Assign Technical Person</Typography>
        <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', border: theme.glassBorder, borderRadius: '16px', p: 1.5 }}>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '10px', px: 1.5, py: 0.8, display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <SearchIcon sx={{ color: theme.textSecondary, fontSize: 18 }} />
            <InputBase 
              placeholder="Search technicians..." 
              sx={{ color: 'white', fontSize: '0.85rem', width: '100%' }} 
              value={techSearch}
              onChange={(e) => setTechSearch(e.target.value)}
            />
          </Box>
          <Stack 
            spacing={1} 
            onWheel={(e) => e.stopPropagation()} // Prevent page scroll
            sx={{ 
              maxHeight: '180px', 
              overflowY: 'auto', 
              pr: 0.5, 
              '&::-webkit-scrollbar': { width: '4px' }, 
              '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '4px' } 
            }}
          >
            {filteredTechs.map((t, i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderRadius: '8px', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: theme.accentBlue }}>{t.n[0]}</Avatar>
                  <Typography variant="body2">{t.n}</Typography>
                </Stack>
                <Chip label={`Load: ${t.l}`} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: `${t.c}22`, color: t.c }} />
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
      <Button fullWidth variant="contained" sx={{ mt: 4, py: 1.8, borderRadius: '16px', fontWeight: 800, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)' }}>
        Complete Action
      </Button>
    </Box>
  );

  return (
    <Box sx={styles.container}>
      <Typography variant="h4" fontWeight={900} mb={5} sx={{ color: '#fff', letterSpacing: -0.5 }}>Visit Planner & Team Manager</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}><CalendarSection /></Grid>
            <Grid item xs={12} md={6}><QueueSection /></Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} lg={4}>
          <AssignSection />
        </Grid>
      </Grid>
    </Box>
  );
};

export default LeadManager;