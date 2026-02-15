import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Avatar, Typography, Badge, Chip, 
  Tabs, Tab, InputBase, IconButton, Stack, 
  Collapse, Dialog, DialogContent, 
  Divider, CircularProgress, Alert, Snackbar,
  keyframes, useTheme
} from '@mui/material';
import { 
  Search, ExpandMore, Map, 
  Business, Person, LocationOn, Close,
  FiberManualRecord, CalendarToday,
  Call, Email
} from '@mui/icons-material';

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
  accentPurple: '#8b5cf6',
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
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
  height: '100%',
  overflow: 'hidden'
};

const inputStyle = {
  width: '100%',
  p: '8px 16px',
  borderRadius: '16px',
  bgcolor: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  transition: '0.3s',
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  '&:hover': { border: '1px solid rgba(255,255,255,0.3)' },
  '&:focus-within': { border: `1px solid ${themeColors.accentBlue}`, boxShadow: `0 0 15px ${themeColors.accentBlue}33` },
  '& input': { color: '#fff', fontSize: '0.95rem' }
};

// --- MAP DIALOG COMPONENT ---
const MapDialog = ({ open, onClose, location }) => {
  const cleanLocation = location ? location.replace(/° [N|S|E|W]/g, '') : '';

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          bgcolor: '#1a1625',
          backgroundImage: 'linear-gradient(to bottom right, #1a1625, #0f0c29)',
          border: themeColors.glassBorder,
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }
      }}
    >
      <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: themeColors.glassBorder }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <LocationOn sx={{ color: themeColors.statusGreen }} />
          <Typography variant="h6" color="white" fontWeight={600}>Location View</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'grey.500', '&:hover': { color: 'white' } }}>
          <Close />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 0, height: '450px', bgcolor: '#000', position: 'relative' }}>
        <iframe 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          style={{ border: 0, opacity: 0.85, filter: 'contrast(1.1) saturate(1.1)' }}
          src={`https://maps.google.com/maps?q=${encodeURIComponent(cleanLocation)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
          title="Map Location"
        />
      </DialogContent>
    </Dialog>
  );
};

// --- LEAD ITEM (ACCORDION) ---
const LeadItem = ({ lead, onMapClick }) => {
  const [expanded, setExpanded] = useState(false);

  // Helper to format Date & Time
  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return "Pending";
    const d = new Date(dateString);
    if (timeString) {
        const [hours, minutes] = timeString.split(':');
        d.setHours(hours);
        d.setMinutes(minutes);
    }
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'completed') return themeColors.statusGreen;
    if (s === 'Pending' || s === 'started') return themeColors.accentBlue;
    return themeColors.textSecondary; // Grey for pending/new
  };

  const statusColor = getStatusColor(lead.field_lead_visit_status);
  const isStarted = lead.field_lead_visit_status === 'Pending' || lead.field_lead_visit_status === 'Started';
  const isCompleted = lead.field_lead_visit_status === 'completed';

  const timelineData = [
    { label: "Assigned", time: formatDateTime(lead.field_visit_date, lead.field_visit_time), completed: true, showMap: false },
    { label: "Visit Started", time: isStarted ? "On Site" : "Pending", completed: isStarted, showMap: isStarted && lead.field_visit_start_location },
    { label: "Completed", time: isCompleted && lead.field_visit_complete_time ? formatDateTime(lead.field_visit_complete_time) : "Pending", completed: isCompleted, showMap: false }
  ];

  return (
    <Box sx={{ 
      mb: 2, 
      borderRadius: '16px', 
      bgcolor: expanded ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)', 
      border: `1px solid ${expanded ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'}`, 
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)' }
    }}>
      
      {/* Header */}
      <Box sx={{ p: 2, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setExpanded(!expanded)}>
        <Stack direction="row" spacing={2} alignItems="center" overflow="hidden">
            <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.05)', color: statusColor, 
                width: 42, height: 42, borderRadius: '12px',
                border: `1px solid ${statusColor}44` 
            }}>
                <Business sx={{ fontSize: 20 }} />
            </Avatar>
            <Box overflow="hidden">
                <Typography variant="body2" fontWeight="700" color="white" noWrap sx={{ letterSpacing: 0.5 }}>
                    {lead.company_name}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.7 }}>
                   <Person sx={{ fontSize: 12 }} />
                   <Typography variant="caption" noWrap>{lead.contact_person_name}</Typography>
                   <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)', height: 10, my: 'auto' }} />
                   <Call sx={{ fontSize: 12 }} />
                   <Typography variant="caption" noWrap>{lead.contact_person_phone}</Typography>
                </Stack>
            </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip 
            label={lead.lead_visit_status || lead.field_lead_visit_status} 
            size="small" 
            sx={{ 
                bgcolor: expanded ? statusColor : `${statusColor}22`, 
                color: expanded ? '#000' : statusColor, 
                border: expanded ? 'none' : `1px solid ${statusColor}44`, 
                fontSize: '0.65rem', fontWeight: '800', height: 22, textTransform: 'uppercase', letterSpacing: 0.5 
            }} 
          />
          <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.5)', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>
            <ExpandMore fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Expanded Timeline */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ p: 2, pt: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Box sx={{ mt: 1, pl: 1 }}>
            {timelineData.map((event, idx) => (
              <Box key={idx} sx={{ position: 'relative', pb: idx === timelineData.length - 1 ? 0 : 3 }}>
                
                {/* Connecting Line */}
                {idx !== timelineData.length - 1 && (
                  <Box sx={{ 
                    position: 'absolute', left: 7, top: 20, bottom: 0, width: 2, 
                    background: event.completed ? `linear-gradient(to bottom, ${themeColors.accentBlue}, ${themeColors.accentPurple})` : 'rgba(255,255,255,0.1)',
                    borderRadius: 1
                  }} />
                )}

                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <FiberManualRecord sx={{ 
                    fontSize: 16, 
                    color: event.completed ? themeColors.accentBlue : 'rgba(255,255,255,0.2)', 
                    mt: 0.5, zIndex: 1,
                    filter: event.completed ? `drop-shadow(0 0 5px ${themeColors.accentBlue})` : 'none'
                  }} />
                  
                  <Box flexGrow={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="body2" color={event.completed ? "white" : "rgba(255,255,255,0.5)"} fontWeight={event.completed ? 600 : 400}>
                                {event.label}
                            </Typography>
                            <Typography variant="caption" color="rgba(255,255,255,0.4)" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CalendarToday sx={{ fontSize: 12 }} /> {event.time}
                            </Typography>
                        </Box>
                        
                        {event.showMap && (
                            <IconButton 
                                size="small" 
                                onClick={(e) => { e.stopPropagation(); onMapClick(lead.field_visit_start_location); }}
                                sx={{ 
                                    color: '#fff', 
                                    bgcolor: themeColors.accentBlue, 
                                    boxShadow: `0 0 15px ${themeColors.accentBlue}66`,
                                    '&:hover': { bgcolor: themeColors.accentPurple }
                                }}
                            >
                                <Map fontSize="small" />
                            </IconButton>
                        )}
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            ))}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

// --- TEAM CARD COMPONENT ---
const TeamCard = ({ employee }) => {
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');

  const handleOpenMap = (location) => {
    setSelectedLocation(location);
    setMapOpen(true);
  };

  const isInactive = employee.total_leads === 0;
  const statusLabel = isInactive ? "NO LEADS" : "ACTIVE";
  const statusColor = isInactive ? themeColors.textSecondary : themeColors.statusGreen;

  return (
    <>
      <Box sx={glassPanelStyle}>
        {/* Card Header */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Badge 
              overlap="circular" 
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} 
              variant="dot" 
              sx={{ '& .MuiBadge-badge': { backgroundColor: statusColor, boxShadow: `0 0 10px ${statusColor}` } }}
            >
              <Avatar sx={{ 
                width: 56, height: 56, 
                background: 'linear-gradient(135deg, #2d2438 0%, #1f1a28 100%)', 
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: '1.2rem', fontWeight: 700
              }}>
                {employee.username.charAt(0).toUpperCase()}
              </Avatar>
            </Badge>
            <Box flexGrow={1} overflow="hidden">
              <Typography variant="h6" fontWeight="bold" color="white" noWrap sx={{ fontSize: '1.1rem', letterSpacing: 0.5 }}>
                {employee.username.split('@')[0]}
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.5)" display="block" noWrap sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                {employee.role_id.replace(/-/g, ' ')}
              </Typography>
            </Box>
            <Chip 
                label={statusLabel} 
                size="small" 
                sx={{ 
                  bgcolor: isInactive ? 'rgba(255,255,255,0.1)' : 'rgba(16, 185, 129, 0.15)', 
                  color: isInactive ? 'rgba(255,255,255,0.5)' : themeColors.statusGreen, 
                  fontWeight: '800', 
                  border: isInactive ? '1px solid rgba(255,255,255,0.1)' : `1px solid ${themeColors.statusGreen}44`,
                  fontSize: '0.7rem'
                }} 
            />
          </Stack>
        </Box>

        {/* Scrollable Leads List */}
        <Box sx={{ 
            p: 2, flexGrow: 1, maxHeight: 500, overflowY: 'auto',
            '&::-webkit-scrollbar': { width: '4px' }, 
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '4px' } 
        }}>
          {employee.leads && employee.leads.length > 0 ? (
            employee.leads.map(lead => (
              <LeadItem key={lead.lead_id} lead={lead} onMapClick={handleOpenMap} />
            ))
          ) : (
            <Box textAlign="center" py={6} sx={{ opacity: 0.5 }}>
                <Typography variant="body2" color="white" fontStyle="italic">No leads assigned currently.</Typography>
            </Box>
          )}
        </Box>
      </Box>

      <MapDialog open={mapOpen} onClose={() => setMapOpen(false)} location={selectedLocation} />
    </>
  );
};

// --- MAIN PAGE ---
export default function TeamOverview() {
  const [tab, setTab] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  // Fetch Data on Tab Change or Mount
  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) throw new Error("Authentication token missing");

        const endpoint = tab === 0 
            ? `${API_BASE_URL}/api/fleads/fieldmarketing/todays-all-visits`
            : `${API_BASE_URL}/api/fleads/fieldmarketing/all-leads`;

        const response = await fetch(endpoint, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch team data");

        const data = await response.json();
        setEmployees(data.employees || []);

      } catch (err) {
        console.error("API Error:", err);
        setToast({ open: true, message: "Error loading team data", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [tab]); 

  const filteredEmployees = employees.filter(emp => 
    emp.username.toLowerCase().includes(search.toLowerCase()) ||
    (emp.leads && emp.leads.some(l => l.company_name.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <Box sx={pageStyle}>
      {/* Background Orbs */}
      <Box sx={{ ...orbStyle, width: '600px', height: '600px', background: 'rgba(59, 130, 246, 0.15)', top: '-10%', left: '-10%', animation: `${liquidMove} 15s infinite alternate` }} />
      <Box sx={{ ...orbStyle, width: '500px', height: '500px', background: 'rgba(139, 92, 246, 0.15)', bottom: '-10%', right: '-5%', animation: `${liquidMove} 20s infinite alternate-reverse` }} />

      <Box maxWidth="xl" sx={{ mx: 'auto', position: 'relative', zIndex: 1, animation: `${slideUpFade} 0.8s ease-out` }}>
        
        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-end" mb={5} spacing={3}>
          <Box>
            <Typography variant="h4" fontWeight="800" sx={{ background: 'linear-gradient(to right, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
              Team Overview
            </Typography>
            <Typography variant="body1" color={themeColors.textSecondary} sx={{ mt: 0.5 }}>
              Monitor field employees and their assigned tasks in real-time
            </Typography>
          </Box>

          <Box sx={inputStyle} maxWidth={{ xs: '100%', md: 350 }}>
            <Search sx={{ color: 'rgba(255,255,255,0.5)' }} />
            <InputBase 
                placeholder="Search employee or company..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                sx={{ color: '#fff', width: '100%' }}
            />
          </Box>
        </Stack>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)', mb: 4 }}>
          <Tabs 
            value={tab} 
            onChange={(e, v) => setTab(v)} 
            sx={{ 
                '& .MuiTabs-indicator': { backgroundColor: themeColors.accentBlue, height: 3, borderRadius: '3px 3px 0 0' },
                '& .MuiTab-root': { 
                    color: 'rgba(255,255,255,0.5)', 
                    fontWeight: 600, 
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&.Mui-selected': { color: '#fff' } 
                } 
            }}
          >
            <Tab label="Today's Visits" disableRipple />
            <Tab label="All Assigned Visits" disableRipple />
          </Tabs>
        </Box>

        {/* Content */}
        {loading ? (
            <Box display="flex" justifyContent="center" mt={10}><CircularProgress sx={{ color: themeColors.accentBlue }} /></Box>
        ) : (
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }} gap={4} alignItems="start">
            {filteredEmployees.map(emp => (
                <TeamCard key={emp.employee_id} employee={emp} />
            ))}
            </Box>
        )}

      </Box>
      
      <Snackbar open={toast.open} autoHideDuration={6000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: '12px', width: '100%', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}