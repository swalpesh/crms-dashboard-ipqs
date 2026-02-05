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
  CircularProgress,
  Alert,
  Snackbar,
  Divider, // <--- Fixed: Added missing import
  keyframes,
  useTheme
} from '@mui/material';

// Icons
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';

// --- API HELPERS ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

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
  glassBg: 'rgba(255, 255, 255, 0.03)',
  glassBorder: '1px solid rgba(255, 255, 255, 0.08)',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  accentBlue: '#3b82f6',
  accentOrange: '#f59e0b',
  statusRed: '#ef4444',
  statusYellow: '#f59e0b',
  statusGreen: '#10b981',
};

// --- STYLES CONSTANTS ---
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

const glassPanelStyle = {
  background: themeColors.glassBg,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: themeColors.glassBorder,
  borderRadius: '24px',
  p: 3,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.3s ease',
};

const inputStyle = {
  width: '100%',
  p: '4px 12px',
  borderRadius: '12px',
  bgcolor: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  transition: '0.3s',
  '&:hover': { border: '1px solid rgba(255,255,255,0.3)' },
  '&:focus-within': { border: `1px solid ${themeColors.accentBlue}`, boxShadow: `0 0 10px ${themeColors.accentBlue}33` },
  '& input': { color: '#fff', fontSize: '0.9rem', cursor: 'pointer' },
  '& input::-webkit-calendar-picker-indicator': { filter: 'invert(1)', cursor: 'pointer' }
};

const primaryBtnStyle = {
  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  color: 'white',
  borderRadius: '16px',
  textTransform: 'none',
  fontWeight: 700,
  py: 1.5,
  boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(37, 99, 235, 0.5)',
  },
  '&.Mui-disabled': {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.3)'
  }
};

const TechnicalVisitPlanner = () => {
  const theme = useTheme();
  
  // --- STATE ---
  const [scheduleType, setScheduleType] = useState('my');
  const [priority, setPriority] = useState('Medium');
  const [techSearch, setTechSearch] = useState('');
  
  // Selection State
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [visitTime, setVisitTime] = useState("09:00");

  // API State
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [unassignedLeads, setUnassignedLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [calendarVisits, setCalendarVisits] = useState({ head: [], team: [] });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Calendar State
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(new Date()); 
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [anchorEl, setAnchorEl] = useState(null);
  const [popupData, setPopupData] = useState(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) throw new Error("No access token found");

        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        const [queueRes, calendarRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/tleads/technicalteam/all-leads`, { method: 'GET', headers }),
            fetch(`${API_BASE_URL}/api/tleads/technicalteam/visit-details`, { method: 'GET', headers })
        ]);

        if (!queueRes.ok) throw new Error('Failed to fetch lead queue');
        if (!calendarRes.ok) throw new Error('Failed to fetch calendar visits');

        const queueData = await queueRes.json();
        const calendarData = await calendarRes.json();

        setUnassignedLeads(queueData.unassigned_leads || []);
        setEmployees(queueData.employees || []);
        setCalendarVisits({
            head: calendarData.head_data?.visits || [],
            team: calendarData.team_data?.visits || []
        });

      } catch (err) {
        console.error("API Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- ASSIGN LOGIC ---
  const handleCompleteAction = async () => {
    if (!selectedLead) return setToast({ open: true, message: 'Please select a lead from the queue.', severity: 'warning' });
    if (!selectedEmployee) return setToast({ open: true, message: 'Please select a technical person.', severity: 'warning' });

    setAssigning(true);
    try {
      const token = getToken();
      const payload = {
        lead_id: selectedLead.lead_id,
        assigned_employee: selectedEmployee.employee_id,
        technical_visit_date: visitDate,
        technical_visit_time: visitTime,
        technical_visit_priority: priority,
        technical_visit_type: "Specific",
        reason: `New Technical Person ${selectedEmployee.username} assigned to ${selectedLead.company_name || selectedLead.lead_name}`
      };

      const response = await fetch(`${API_BASE_URL}/api/tleads/assign`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Assignment failed');

      setToast({ open: true, message: `Lead assigned successfully!`, severity: 'success' });
      setUnassignedLeads(prev => prev.filter(l => l.lead_id !== selectedLead.lead_id));
      setSelectedLead(null);
      setSelectedEmployee(null);

    } catch (err) {
      setToast({ open: true, message: err.message, severity: 'error' });
    } finally {
      setAssigning(false);
    }
  };

  const filteredTechs = useMemo(() => employees.filter(emp => emp.username.toLowerCase().includes(techSearch.toLowerCase())), [employees, techSearch]);
  
  const getLoadStatus = (count) => {
    if (count < 3) return { label: 'Low', color: themeColors.statusGreen };
    if (count < 6) return { label: 'Medium', color: themeColors.statusYellow };
    return { label: 'High', color: themeColors.statusRed };
  };

  // Calendar Logic
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const activeScheduleMap = useMemo(() => {
    const visits = scheduleType === 'my' ? calendarVisits.head : calendarVisits.team;
    const map = {};
    visits.forEach(visit => {
        if (visit.visit_date) {
            const vDate = new Date(visit.visit_date);
            if (vDate.getMonth() === viewDate.getMonth() && vDate.getFullYear() === viewDate.getFullYear()) {
                map[vDate.getDate()] = visit; 
            }
        }
    });
    return map;
  }, [calendarVisits, scheduleType, viewDate]);

  const handleDayClick = (event, day, task) => {
    setSelectedDay(day);
    if (task) {
      setAnchorEl(event.currentTarget);
      setPopupData({
        lead: task.company_name || task.lead_name || "Unknown Lead",
        person: task.assigned_person || "Unassigned",
        time: task.visit_time || "TBD",
        date: new Date(task.visit_date).toLocaleDateString()
      });
    }
  };

  // --- SUB-COMPONENTS ---

  const CalendarSection = () => (
    <Box sx={glassPanelStyle}>
      {/* Toggle */}
      <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '12px', p: 0.5, display: 'flex', mb: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
        <Button 
          onClick={() => setScheduleType('my')} 
          fullWidth 
          sx={{ 
            borderRadius: '8px', 
            color: scheduleType === 'my' ? '#fff' : 'rgba(255,255,255,0.5)',
            bgcolor: scheduleType === 'my' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' }
          }}
        >
          My Schedule
        </Button>
        <Button 
          onClick={() => setScheduleType('team')} 
          fullWidth 
          sx={{ 
             borderRadius: '8px', 
             color: scheduleType === 'team' ? '#fff' : 'rgba(255,255,255,0.5)',
             bgcolor: scheduleType === 'team' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
             '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' }
          }}
        >
          Team Schedule
        </Button>
      </Box>

      {/* Calendar Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <IconButton sx={{ color: 'rgba(255,255,255,0.7)', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }} onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}><ChevronLeftIcon /></IconButton>
        <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 0.5 }}>{monthName} {viewDate.getFullYear()}</Typography>
        <IconButton sx={{ color: 'rgba(255,255,255,0.7)', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }} onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}><ChevronRightIcon /></IconButton>
      </Box>

      {/* Days Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, textAlign: 'center', mb: 1 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (<Typography key={d} sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 700 }}>{d}</Typography>))}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, textAlign: 'center', mb: 3 }}>
        {[...Array(firstDay)].map((_, i) => <Box key={`pad-${i}`} />)}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const isSelected = day === selectedDay;
          const task = activeScheduleMap[day];
          
          return (
            <Box 
              key={day} 
              onClick={(e) => handleDayClick(e, day, task)} 
              sx={{
                height: 42,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                borderRadius: '12px', cursor: 'pointer', position: 'relative',
                background: isSelected ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
                color: isSelected ? '#fff' : 'rgba(255,255,255,0.8)',
                fontWeight: isSelected ? 700 : 400,
                boxShadow: isSelected ? '0 4px 15px rgba(59, 130, 246, 0.4)' : 'none',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: isSelected ? '' : 'rgba(255,255,255,0.1)' }
              }}
            >
              <Typography variant="body2">{day}</Typography>
              {task && <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: isSelected ? '#fff' : '#f59e0b', mt: 0.5 }} />}
            </Box>
          );
        })}
      </Box>

      {/* Popover for Task */}
      <Popover 
        open={Boolean(anchorEl)} 
        anchorEl={anchorEl} 
        onClose={() => setAnchorEl(null)} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ '& .MuiPaper-root': { bgcolor: '#1a1625', color: '#fff', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', p: 2, boxShadow: '0 10px 40px rgba(0,0,0,0.6)' } }}
      >
        <Box sx={{ minWidth: 200 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="caption" color="#3b82f6" fontWeight={700}>VISIT DETAILS</Typography>
                <IconButton size="small" onClick={() => setAnchorEl(null)} sx={{ p: 0.5, color: 'grey.500' }}><CloseIcon fontSize="small" /></IconButton>
            </Stack>
            <Typography variant="subtitle2" fontWeight={600} mb={0.5}>{popupData?.lead}</Typography>
            <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                <PersonIcon sx={{ fontSize: 16, color: 'grey.500' }} />
                <Typography variant="body2" color="rgba(255,255,255,0.7)">{popupData?.person}</Typography>
            </Stack>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 1.5 }} />
            <Stack direction="row" justifyContent="space-between">
                 <Box><Typography variant="caption" color="grey.500" display="block">Date</Typography><Typography variant="body2" fontWeight={600}>{popupData?.date}</Typography></Box>
                 <Box textAlign="right"><Typography variant="caption" color="grey.500" display="block">Time</Typography><Typography variant="body2" fontWeight={600}>{popupData?.time}</Typography></Box>
            </Stack>
        </Box>
      </Popover>
    </Box>
  );

  const QueueSection = () => (
    <Box sx={glassPanelStyle}>
      <Typography variant="h6" fontWeight={700} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
         <span style={{ width: 4, height: 24, background: '#3b82f6', borderRadius: 2, display: 'inline-block' }}></span>
         Pending Visits Queue
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}><CircularProgress sx={{ color: '#fff' }} /></Box>
      ) : unassignedLeads.length === 0 ? (
        <Box display="flex" justifyContent="center" p={4}><Typography color="rgba(255,255,255,0.5)">No unassigned leads found</Typography></Box>
      ) : (
        <Stack spacing={1.5} sx={{ height: '420px', overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '4px' } }}>
          {unassignedLeads.map((item, i) => {
            const isSelected = selectedLead?.lead_id === item.lead_id;
            return (
              <Box 
                key={item.lead_id || i} 
                onClick={() => setSelectedLead(item)}
                sx={{ 
                  bgcolor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.02)', 
                  border: isSelected ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.05)', 
                  borderRadius: '16px', 
                  p: 2, 
                  display: 'flex', alignItems: 'center', gap: 2,
                  cursor: 'pointer', transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.08)', transform: 'translateX(5px)' }
                }}
              >
                <Checkbox checked={isSelected} sx={{ color: 'rgba(255,255,255,0.2)', p: 0, '&.Mui-checked': { color: '#3b82f6' } }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600} color="#fff">{item.company_name || item.lead_name}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <LocationOnIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }} /> 
                    {item.company_city ? `${item.company_city}, ${item.company_state}` : 'Location N/A'}
                  </Typography>
                </Box>
                <Chip label={item.lead_status || 'New'} size="small" sx={{ height: 22, fontSize: '0.65rem', bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)' }} />
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );

  const AssignSection = () => (
    <Box sx={glassPanelStyle}>
      <Typography variant="h6" fontWeight={700} mb={3}>Assign Visit</Typography>
      
      {/* Date & Time */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6}>
            <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block" fontWeight={600}>Visit Date</Typography>
            <Box sx={inputStyle}><InputBase type="date" fullWidth value={visitDate} onChange={(e) => setVisitDate(e.target.value)} sx={{ color: '#fff', '& input': { p: 0 } }} /></Box>
        </Grid>
        <Grid item xs={6}>
            <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block" fontWeight={600}>Visit Time</Typography>
            <Box sx={inputStyle}><InputBase type="time" fullWidth value={visitTime} onChange={(e) => setVisitTime(e.target.value)} sx={{ color: '#fff', '& input': { p: 0 } }} /></Box>
        </Grid>
      </Grid>

      {/* Priority */}
      <Box mb={4}>
        <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={1} display="block" fontWeight={600}>Priority Level</Typography>
        <Stack direction="row" spacing={1}>
          {[{ label: 'High', color: '#ef4444' }, { label: 'Medium', color: '#f59e0b' }, { label: 'Low', color: '#10b981' }].map((p) => (
            <Button 
              key={p.label} 
              fullWidth 
              onClick={() => setPriority(p.label)} 
              sx={{ 
                bgcolor: priority === p.label ? `${p.color}22` : 'rgba(255,255,255,0.03)', 
                color: priority === p.label ? p.color : 'rgba(255,255,255,0.6)', 
                border: priority === p.label ? `1px solid ${p.color}` : '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '12px', py: 1, fontSize: '0.8rem',
                '&:hover': { bgcolor: `${p.color}11` }
              }}
            >
              {p.label}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* Employee List */}
      <Box>
        <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={1} display="block" fontWeight={600}>Select Technician</Typography>
        <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', p: 2 }}>
          
          {/* Search */}
          <Box sx={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 1, mb: 2, py: 1 }}>
            <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 20 }} />
            <InputBase placeholder="Search technician..." sx={{ color: '#fff', fontSize: '0.9rem', width: '100%' }} value={techSearch} onChange={(e) => setTechSearch(e.target.value)} />
          </Box>

          {/* List */}
          <Stack spacing={1} sx={{ maxHeight: '200px', overflowY: 'auto', pr: 0.5, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '4px' } }}>
            {filteredTechs.map((emp, i) => {
              const status = getLoadStatus(emp.total_leads);
              const isSelected = selectedEmployee?.employee_id === emp.employee_id;
              return (
                <Box 
                  key={emp.employee_id || i} 
                  onClick={() => setSelectedEmployee(emp)}
                  sx={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.2, borderRadius: '12px', 
                    bgcolor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'transparent', border: isSelected ? '1px solid #3b82f6' : '1px solid transparent',
                    cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } 
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: '#3b82f6', color: '#fff' }}>{emp.username?.charAt(0).toUpperCase()}</Avatar>
                    <Typography variant="body2" color="#fff">{emp.username}</Typography>
                  </Stack>
                  <Chip 
                    label={`Load: ${status.label}`} 
                    size="small" 
                    sx={{ height: 18, fontSize: '0.6rem', bgcolor: `${status.color}22`, color: status.color }} 
                  />
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Box>

      {/* Action Button */}
      <Button 
        fullWidth 
        variant="contained" 
        onClick={handleCompleteAction}
        disabled={assigning}
        sx={{ mt: 4, ...primaryBtnStyle }}
      >
        {assigning ? <CircularProgress size={24} color="inherit" /> : 'Assign Visit'}
      </Button>
    </Box>
  );

  return (
    <Box sx={pageStyle}>
      {/* Background Blobs */}
      <Box sx={{ ...orbStyle, width: '600px', height: '600px', background: 'rgba(91, 33, 182, 0.25)', top: '-10%', left: '-10%', animation: `${liquidMove} 15s infinite alternate` }} />
      <Box sx={{ ...orbStyle, width: '500px', height: '500px', background: 'rgba(59, 130, 246, 0.2)', bottom: '-10%', right: '-5%', animation: `${liquidMove} 20s infinite alternate-reverse` }} />

      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '1400px', mx: 'auto', animation: `${slideUpFade} 0.8s ease-out` }}>
        <Typography variant="h4" fontWeight={800} mb={1} sx={{ background: 'linear-gradient(to right, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
          Visit Planner
        </Typography>
        <Typography variant="body1" color="rgba(255,255,255,0.6)" mb={5}>
          Manage team schedules and assign technical visits
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}

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

      {/* Toast Notification */}
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: '12px', width: '100%', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TechnicalVisitPlanner;