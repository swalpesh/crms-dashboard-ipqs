import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  IconButton,
  useMediaQuery,
  useTheme,
  Modal,
  TextField,
  Backdrop,
  Fade,
  CircularProgress,
  Stack,
  Snackbar,
  Alert,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Phosphor Icons
import {
  CaretRight,
  CaretLeft,
  Trophy,
  User,
  Phone,
  MapPin,
  Envelope,
  CheckCircle,
  Play,
  Clock,
  CalendarPlus,
  X,
  Eye,
  PaperPlaneRight,
  Users
} from "@phosphor-icons/react";

// --- API HELPERS ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

// Helper to get the logged-in user's details
const getAuthUser = () => {
  const userStr = localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");
  try { return userStr ? JSON.parse(userStr) : null; } catch (e) { return null; }
};

// Helper to generate consistent colors for avatars based on company name
const getLogoColor = (str) => {
  if (!str) return '#3b82f6';
  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

// Helper to format time (e.g., "14:30:00" -> "02:30 PM")
const formatTime = (timeStr) => {
  if (!timeStr) return "TBD";
  const [hourString, minute] = timeStr.split(':');
  const hour = parseInt(hourString, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${ampm}`;
};

// Helper to format date to YYYY-MM-DD
const formatDateString = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to format ISO Date to "15 Feb 2026, 3:09 PM"
const formatDateTime = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  const datePart = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${datePart}, ${timePart}`;
};

// Helper to get today's date string in YYYY-MM-DD format
const getTodayString = () => {
  return formatDateString(new Date());
};

// Helper to get GPS Location
const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(`${position.coords.latitude}, ${position.coords.longitude}`),
        (error) => reject(new Error("Failed to get location. Please enable GPS."))
      );
    }
  });
};

// --- THEME CONSTANTS ---
const themeColors = {
  bgGradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  glassBg: 'rgba(255, 255, 255, 0.05)',
  glassBorder: '1px solid rgba(255, 255, 255, 0.1)',
  glassShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  accent: '#7b2cbf',
  success: '#00b894',
  blue: '#0984e3',
  warning: '#fdcb6e',
  danger: '#ff7675',
};

// --- STYLES ---
const styles = {
  glassCard: {
    background: themeColors.glassBg,
    backdropFilter: 'blur(16px)',
    border: themeColors.glassBorder,
    borderRadius: '16px',
    boxShadow: themeColors.glassShadow,
    p: 2.5,
    mb: 3,
    color: themeColors.textPrimary,
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      background: 'rgba(255, 255, 255, 0.07)',
    }
  },
  modalBox: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 400 },
    bgcolor: '#1a1a2e',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '24px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
    p: 4,
    outline: 'none',
  },
  tabBtn: {
    textTransform: 'none',
    color: themeColors.textSecondary,
    borderRadius: '8px',
    px: 2.5,
    py: 1.2,
    fontSize: '0.9rem',
    fontWeight: 500,
    display: 'flex',
    gap: 1.5,
    transition: 'all 0.3s ease',
    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
  },
  tabNumber: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    bgcolor: 'rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  inputField: {
    '& .MuiOutlinedInput-root': {
      color: '#fff',
      borderRadius: '12px',
      bgcolor: 'rgba(255,255,255,0.03)',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
      '&:hover fieldset': { borderColor: themeColors.blue },
    },
    '& .MuiInputLabel-root': { color: themeColors.textSecondary },
    '& input::-webkit-calendar-picker-indicator': { filter: 'invert(1)', cursor: 'pointer' }
  },
  filterSelect: {
    color: '#fff', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '12px',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: themeColors.blue },
    '& .MuiSvgIcon-root': { color: '#fff' }
  }
};

// --- SUB-COMPONENTS ---
const DateItem = ({ day, date, active }) => (
  <Box sx={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minWidth: 65, height: 80,
    bgcolor: active ? themeColors.blue : 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: active ? '0 8px 20px rgba(9, 132, 227, 0.4)' : 'none',
    border: active ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.05)',
    '&:hover': {
       bgcolor: active ? themeColors.blue : 'rgba(255, 255, 255, 0.08)',
       transform: 'scale(1.05)'
    }
  }}>
    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: active ? '#fff' : themeColors.textSecondary, textTransform: 'uppercase', mb: 0.5 }}>{day}</Typography>
    <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{date}</Typography>
  </Box>
);

const ActivityCard = ({ visitStatus, time, title, purpose, contact, phone, location, email, disableStart, onReschedule, onStartVisit, onViewLead, onEndVisit }) => {
  let statusColor = themeColors.blue;
  let badgeText = "Next Step";

  if (visitStatus === 'Started') {
    statusColor = themeColors.success;
    badgeText = "In Progress";
  } else if (visitStatus === 'Completed') {
    statusColor = themeColors.textSecondary;
    badgeText = "Completed";
  }

  return (
    <Box sx={{ ...styles.glassCard, ...(visitStatus === 'Started' ? { border: `1px solid rgba(0, 184, 148, 0.4)`, boxShadow: `0 0 20px rgba(0, 184, 148, 0.15)` } : {}) }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: statusColor, fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
          {visitStatus === 'Started' ? <Box sx={{ width: 10, height: 10, bgcolor: themeColors.success, borderRadius: '50%', boxShadow: `0 0 10px ${themeColors.success}` }} /> : (visitStatus === 'Completed' ? <CheckCircle size={18} weight="fill" /> : <Clock size={18} weight="fill" />)}
          {visitStatus === 'Started' ? 'In Progress' : (visitStatus === 'Completed' ? 'Completed' : time)}
        </Box>
        <Chip label={visitStatus === 'Started' ? `Started at ${time}` : badgeText} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} />
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{title}</Typography>
      <Typography variant="body2" sx={{ color: themeColors.textSecondary, mb: 3 }}>{purpose}</Typography>
      <Grid container spacing={2} sx={{ bgcolor: 'rgba(0,0,0,0.25)', p: 2, borderRadius: '12px', mb: 3, border: '1px solid rgba(255,255,255,0.03)' }}>
        <Grid item xs={6}><InfoItem icon={<User size={18} />} label="Contact" value={contact} /></Grid>
        <Grid item xs={6}><InfoItem icon={<Phone size={18} />} label="Phone" value={phone} /></Grid>
        <Grid item xs={12}><InfoItem icon={<MapPin size={18} />} label="Location" value={location} /></Grid>
        <Grid item xs={12}><InfoItem icon={<Envelope size={18} />} label="Email" value={email} /></Grid>
      </Grid>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {visitStatus === 'Started' && (
          <>
            <Button fullWidth variant="outlined" startIcon={<Eye weight="bold"/>} sx={{ borderColor: themeColors.blue, color: themeColors.blue, '&:hover': { bgcolor: 'rgba(9, 132, 227, 0.1)' } }} onClick={onViewLead}>
              View Lead
            </Button>
            <Button fullWidth variant="contained" startIcon={<CheckCircle weight="fill" />} sx={{ bgcolor: themeColors.danger, fontWeight: 700, '&:hover': { bgcolor: '#d63031' } }} onClick={onEndVisit}>
              End Visit
            </Button>
          </>
        )}
        {visitStatus === 'Completed' && (
          <Button fullWidth variant="contained" disabled sx={{ bgcolor: 'rgba(255,255,255,0.1) !important', color: 'rgba(255,255,255,0.4) !important', py: 1.5, fontWeight: 700 }}>
            Ended & Transferred
          </Button>
        )}
        {(visitStatus !== 'Started' && visitStatus !== 'Completed') && (
          <>
            <Button fullWidth variant="outlined" startIcon={<CalendarPlus weight="fill"/>} sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff', '&:hover': { borderColor: themeColors.blue, bgcolor: 'rgba(59, 130, 246, 0.1)' } }} onClick={onReschedule}>
              Reschedule
            </Button>
            <Button 
              fullWidth 
              variant="contained" 
              startIcon={<Play weight="fill" />} 
              sx={{ bgcolor: disableStart ? 'rgba(255,255,255,0.1)' : themeColors.blue, color: disableStart ? 'rgba(255,255,255,0.3)' : '#fff', py: 1.5, fontWeight: 700 }} 
              disabled={disableStart}
              onClick={onStartVisit}
            >
              Start Visit
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
    <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: themeColors.blue }}>{icon}</Box>
    <Box>
      <Typography variant="caption" sx={{ color: themeColors.textSecondary, display: 'block' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#eee' }}>{value || 'N/A'}</Typography>
    </Box>
  </Box>
);

// --- MAIN COMPONENT ---
const AssociateMyactivity = () => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  // Get Auth user and check Role for Filter Visibility directly from localStorage
  const authUser = getAuthUser();
  const authRole = localStorage.getItem("auth_role") || sessionStorage.getItem("auth_role");
  const isMarketingHead = authRole === 'Associate-Marketing-Head';
  
  const [activeTab, setActiveTab] = useState(0); 
  const [dateRange, setDateRange] = useState([]);
  const [baseDate, setBaseDate] = useState(new Date());
  
  // Track selected date for filtering Scheduled Leads
  const [activeFilterDate, setActiveFilterDate] = useState(getTodayString());
  // Status Filter for Scheduled Tab
  const [statusFilter, setStatusFilter] = useState('All');
  
  // API State
  const [unscheduledLeads, setUnscheduledLeads] = useState([]);
  const [scheduledLeads, setScheduledLeads] = useState([]);
  const [completedLeadsData, setCompletedLeadsData] = useState([]); // Flat array from new API
  const [selectedEmpFilter, setSelectedEmpFilter] = useState('All'); // For the completed tab filter
  
  const [loadingUnscheduled, setLoadingUnscheduled] = useState(false);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [loadingCompleted, setLoadingCompleted] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Celebration State
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);
  
  // Schedule/Reschedule Modal State
  const [openModal, setOpenModal] = useState(false);
  const [isRescheduleMode, setIsRescheduleMode] = useState(false); 
  const [selectedLead, setSelectedLead] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [schedulePriority, setSchedulePriority] = useState('Medium');
  const [scheduleReason, setScheduleReason] = useState('Associate Visit Rescheduled.'); 
  const [isScheduling, setIsScheduling] = useState(false);

  // End Visit & Transfer Modal State
  const [openEndModal, setOpenEndModal] = useState(false);
  const [endVisitLead, setEndVisitLead] = useState(null);
  const [nextDepartment, setNextDepartment] = useState('Technical-Team');
  const [isEnding, setIsEnding] = useState(false);

  const timerRef = useRef(null);

  // --- FETCH ALL DATA ---
  const fetchAllData = async () => {
    setLoadingUnscheduled(true);
    setLoadingScheduled(true);
    setLoadingCompleted(true);
    
    const token = getToken();
    if (!token) return;

    try {
      const [unSchedRes, schedRes, compRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/aleads/unscheduled-leads`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/aleads/scheduled-visits`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/aleads/completed-visits`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (unSchedRes.ok) {
        const d = await unSchedRes.json();
        setUnscheduledLeads(d.leads || []);
      }
      if (schedRes.ok) {
        const d = await schedRes.json();
        setScheduledLeads(d.leads || []);
      }
      if (compRes.ok) {
        const d = await compRes.json();
        // Updated to use the flat leads array from the newly provided API response structure
        setCompletedLeadsData(d.leads || []);
      }
    } catch (error) { 
      console.error("API Fetch Error:", error); 
    } finally { 
      setLoadingUnscheduled(false);
      setLoadingScheduled(false);
      setLoadingCompleted(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Auto-reset calendar window after 5s
  useEffect(() => {
    const today = new Date();
    if (baseDate.toDateString() !== today.toDateString()) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => { setBaseDate(new Date()); }, 5000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [baseDate]);

  useEffect(() => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const range = [];
    for (let i = -2; i <= 2; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      range.push({
        day: days[d.getDay()],
        date: d.getDate(),
        fullDate: d,
        dateStr: formatDateString(d),
      });
    }
    setDateRange(range);
  }, [baseDate]);

  const shiftDate = (amount) => {
    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() + amount);
    setBaseDate(newDate);
  };

  // --- CALENDAR DAY CLICK HANDLER ---
  const handleDateClick = (dateStr) => {
    setActiveFilterDate(dateStr);
    if (activeTab !== 0) setActiveTab(0); // Auto-switch to Scheduled Tab
  };

  // --- MODAL HANDLERS ---
  const handleOpenSchedule = (lead, isRescheduling = false) => { 
    setSelectedLead(lead); 
    setScheduleDate(lead.associate_visit_date ? lead.associate_visit_date.split('T')[0] : '');
    setScheduleTime(lead.associate_visit_time || '');
    setSchedulePriority(lead.associate_visit_priority || 'Medium');
    setIsRescheduleMode(isRescheduling);
    setScheduleReason(isRescheduling ? 'Associate Visit Rescheduled.' : '');
    setOpenModal(true); 
  };
  
  const handleCloseModal = () => { 
    setOpenModal(false); 
    setSelectedLead(null); 
  };

  const handleOpenEndModal = (lead) => {
    setEndVisitLead(lead);
    setNextDepartment('Technical-Team'); // default selection
    setOpenEndModal(true);
  };

  const handleCloseEndModal = () => {
    setOpenEndModal(false);
    setEndVisitLead(null);
  };

  // --- SUBMIT SCHEDULE / RESCHEDULE ACTION ---
  const handleConfirmSchedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      setToast({ open: true, message: 'Please select both date and time.', severity: 'warning' });
      return;
    }

    if (isRescheduleMode && !scheduleReason) {
      setToast({ open: true, message: 'Please provide a reason for rescheduling.', severity: 'warning' });
      return;
    }

    setIsScheduling(true);
    try {
      const token = getToken();
      const currentUser = getAuthUser();
      const formattedTime = scheduleTime.length === 5 ? `${scheduleTime}:00` : scheduleTime;

      let apiUrl = '';
      let payload = {};

      if (isRescheduleMode) {
        // Hit Reschedule API
        apiUrl = `${API_BASE_URL}/api/aleads/reschedule-visit`;
        payload = {
          lead_id: selectedLead.lead_id,
          new_visit_date: scheduleDate,
          new_visit_time: formattedTime,
          reason: scheduleReason
        };
      } else {
        // Hit Assign/Schedule API
        apiUrl = `${API_BASE_URL}/api/aleads/assign`;
        payload = {
          lead_id: selectedLead.lead_id,
          assigned_employee: currentUser?.employee_id || selectedLead.assigned_employee,
          associate_visit_date: scheduleDate,
          associate_visit_time: formattedTime,
          associate_visit_priority: schedulePriority,
          associate_visit_type: "Specific",
          reason: "Lead Scheduled for Associate Visit"
        };
      }

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || `Failed to ${isRescheduleMode ? 'reschedule' : 'schedule'} visit`);

      setToast({ open: true, message: `Visit ${isRescheduleMode ? 'rescheduled' : 'scheduled'} successfully!`, severity: 'success' });
      handleCloseModal();
      
      // Auto-set the filter date to the newly scheduled date
      setActiveFilterDate(scheduleDate);
      
      // Refresh all lists
      fetchAllData();

      // Trigger Notification to specific Associate Marketing Head
      setTimeout(async () => {
        try {
          const notificationPayload = {
            to_emp_id: "IPQS-E25017",
            title: `Visit ${isRescheduleMode ? 'Rescheduled' : 'Scheduled'}`,
            message: `Lead ${selectedLead.company_name || selectedLead.lead_name} has been ${isRescheduleMode ? 'rescheduled' : 'scheduled'} by ${currentUser?.username || 'Employee'} for ${scheduleDate} at ${scheduleTime}.`
          };

          await fetch(`${API_BASE_URL}/api/notifications/send`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(notificationPayload)
          });
        } catch (e) {
          console.error("Error sending notification:", e);
        }
      }, 1000);

    } catch (err) {
      console.error(err);
      setToast({ open: true, message: err.message, severity: 'error' });
    } finally {
      setIsScheduling(false);
    }
  };

  // --- START VISIT ACTION ---
  const handleStartVisit = async (lead) => {
    try {
      setToast({ open: true, message: 'Getting your location...', severity: 'info' });
      const locationCoords = await getCurrentLocation();

      const token = getToken();
      const currentUser = getAuthUser();

      // Update Visit Status
      const payload = {
        lead_id: lead.lead_id,
        status: "Started",
        location: locationCoords
      };

      const response = await fetch(`${API_BASE_URL}/api/aleads/visit-status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start visit');
      }

      // Update Local State instantly
      setScheduledLeads(prevLeads => prevLeads.map(l => 
        l.lead_id === lead.lead_id ? { ...l, associate_lead_visit_status: 'Started' } : l
      ));

      setToast({ open: true, message: 'Visit started successfully!', severity: 'success' });

      // Trigger Notification to Associate Marketing Head
      setTimeout(async () => {
        try {
          const notificationPayload = {
            to_emp_id: "IPQS-E25017",
            title: "Visit Started",
            message: `Lead ${lead.company_name || lead.lead_name} visit started by ${currentUser?.username || 'Employee'}. Location captured.`
          };

          await fetch(`${API_BASE_URL}/api/notifications/send`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(notificationPayload)
          });
        } catch (e) {
          console.error("Error sending notification:", e);
        }
      }, 1000);

    } catch (err) {
      console.error(err);
      setToast({ open: true, message: err.message || 'Failed to start visit.', severity: 'error' });
    }
  };

  // --- END VISIT & TRANSFER ACTION ---
  const submitEndVisit = async () => {
    setIsEnding(true);
    try {
      const token = getToken();
      const currentUser = getAuthUser();

      // 1. Mark Visit as Completed
      const endResponse = await fetch(`${API_BASE_URL}/api/aleads/visit-status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: endVisitLead.lead_id,
          status: "Completed"
        })
      });

      if (!endResponse.ok) throw new Error('Failed to end visit status.');

      // 2. Change Lead Stage / Transfer to Next Dept
      const transferResponse = await fetch(`${API_BASE_URL}/api/aleads/change-stage`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: endVisitLead.lead_id,
          new_lead_stage: nextDepartment,
          reason: `Assigned to ${nextDepartment.replace('-', ' ')}`
        })
      });

      if (!transferResponse.ok) throw new Error('Failed to transfer lead to next department.');

      // Update Local State instantly
      setScheduledLeads(prevLeads => prevLeads.map(l => 
        l.lead_id === endVisitLead.lead_id ? { ...l, associate_lead_visit_status: 'Completed', lead_stage: nextDepartment } : l
      ));

      setToast({ open: true, message: 'Visit ended and lead transferred successfully!', severity: 'success' });
      handleCloseEndModal();
      
      // Pull fresh data so Completed Tab gets the new visit
      fetchAllData();

      // 3. Send Notification to target Head
      setTimeout(async () => {
        try {
          const targetEmpId = nextDepartment === 'Technical-Team' ? 'IPQS-H25010' : 'IPQS-H25010'; 
          const deptName = nextDepartment.replace('-', ' ');

          const notificationPayload = {
            to_emp_id: targetEmpId,
            title: `Lead Transferred to ${deptName}`,
            message: `Associate Lead Transferred to ${deptName}. Lead ID: ${endVisitLead.lead_id} (${endVisitLead.company_name || endVisitLead.lead_name}) by ${currentUser?.username || 'Employee'}.`
          };

          await fetch(`${API_BASE_URL}/api/notifications/send`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(notificationPayload)
          });
        } catch (e) {
          console.error("Error sending notification:", e);
        }
      }, 1000);

    } catch (err) {
      console.error(err);
      setToast({ open: true, message: err.message || 'Failed to complete visit.', severity: 'error' });
    } finally {
      setIsEnding(false);
    }
  };

  // --- FILTER DISPLAYED SCHEDULED VISITS (Date + Status) ---
  const displayedScheduledLeads = useMemo(() => {
    return scheduledLeads.filter((lead) => {
      // 1. Must match active date
      if (!lead.associate_visit_date || !lead.associate_visit_date.startsWith(activeFilterDate)) return false;

      // 2. Filter by selected Status Filter
      const currentStatus = lead.associate_lead_visit_status || 'Pending';
      if (statusFilter === 'All') return true;
      if (statusFilter === 'Pending' && currentStatus !== 'Started' && currentStatus !== 'Completed') return true;
      if (statusFilter === 'In Progress' && currentStatus === 'Started') return true;
      if (statusFilter === 'Completed' && currentStatus === 'Completed') return true;

      return false;
    });
  }, [scheduledLeads, activeFilterDate, statusFilter]);

  // --- UNIQUE EMPLOYEES EXTRACTOR (For Filter Dropdown) ---
  const uniqueEmployees = useMemo(() => {
    const empMap = new Map();
    completedLeadsData.forEach(lead => {
      if (lead.completed_by_id && !empMap.has(lead.completed_by_id)) {
        empMap.set(lead.completed_by_id, lead.completed_by_name || 'Unknown Employee');
      }
    });
    return Array.from(empMap, ([id, name]) => ({ id, name }));
  }, [completedLeadsData]);

  // --- FILTER COMPLETED VISITS (Role Based) ---
  const filteredCompleted = useMemo(() => {
    let data = completedLeadsData || [];
    
    // If not Marketing Head, user can only see their own completed visits
    if (!isMarketingHead) {
      return data.filter(lead => lead.completed_by_id === authUser?.employee_id);
    }
    
    // If Head and specific employee filter is applied
    if (selectedEmpFilter !== 'All') {
      return data.filter(lead => lead.completed_by_id === selectedEmpFilter);
    }
    
    return data;
  }, [completedLeadsData, selectedEmpFilter, isMarketingHead, authUser]);

  // Target Calculations (Based on Today's scheduled leads)
  const todaysTotalLeads = useMemo(() => {
    const todayStr = getTodayString();
    return scheduledLeads.filter((lead) => lead.associate_visit_date && lead.associate_visit_date.startsWith(todayStr));
  }, [scheduledLeads]);

  const completedCount = todaysTotalLeads.filter(l => l.associate_lead_visit_status === 'Completed').length;
  const totalVisitsCount = todaysTotalLeads.length;
  const progressPercent = totalVisitsCount > 0 ? (completedCount / totalVisitsCount) * 100 : 0;

  const todayStr = getTodayString();

  // --- CELEBRATION EFFECT EFFECT ---
  useEffect(() => {
    // If target is completed (> 0 and completed == total) and hasn't celebrated yet
    if (totalVisitsCount > 0 && completedCount === totalVisitsCount) {
      if (!hasCelebrated) {
        setShowCelebration(true);
        setHasCelebrated(true);
        // Auto-hide modal after 5 seconds
        setTimeout(() => setShowCelebration(false), 5000);
      }
    } else {
      // Reset if progress drops below 100% (e.g. new visits assigned)
      setHasCelebrated(false);
    }
  }, [completedCount, totalVisitsCount, hasCelebrated]);

  return (
    <Box sx={{ minHeight: '100vh', background: themeColors.bgGradient, color: themeColors.textPrimary, p: { xs: 2, md: 3 }, position: 'relative' }}>
      
      {/* CSS for Celebration Particles & Glow */}
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes floatParticle {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 20px rgba(0, 184, 148, 0.2); }
          50% { box-shadow: 0 0 40px rgba(0, 184, 148, 0.6); }
          100% { box-shadow: 0 0 20px rgba(0, 184, 148, 0.2); }
        }
        .celebration-text {
          background: linear-gradient(to right, #00b894, #55efc4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* TARGET CELEBRATION MODAL */}
      <Modal open={showCelebration} onClose={() => setShowCelebration(false)} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500, style: { backgroundColor: 'rgba(0,0,0,0.85)' } }}>
        <Fade in={showCelebration}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', outline: 'none', width: '100%', maxWidth: 500 }}>
            <Box sx={{ position: 'relative', display: 'inline-block', animation: 'popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}>
              
              {/* CSS Particles */}
              {[...Array(16)].map((_, i) => (
                <Box key={i} sx={{ 
                  position: 'absolute', top: '50%', left: '50%', width: 10, height: 10, borderRadius: '50%', 
                  bgcolor: ['#ff7675', '#0984e3', '#fdcb6e', '#00b894'][i % 4], 
                  animation: 'floatParticle 1.2s ease-out forwards', animationDelay: '0.1s', 
                  '--tx': `${Math.cos(i * 22.5 * Math.PI / 180) * 150}px`, 
                  '--ty': `${Math.sin(i * 22.5 * Math.PI / 180) * 150}px`,
                  zIndex: 0
                }} />
              ))}
              
              {/* Glowing Trophy */}
              <Box sx={{ position: 'relative', zIndex: 1, width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(0, 184, 148, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, mx: 'auto', border: '2px solid rgba(0, 184, 148, 0.4)', animation: 'pulseGlow 2s infinite' }}>
                <Trophy size={80} weight="fill" color={themeColors.success} />
              </Box>
            </Box>
            
            <Typography variant="h3" fontWeight={900} className="celebration-text" sx={{ animation: 'popIn 0.8s ease-out forwards', mb: 1 }}>
              Target Completed!
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', animation: 'popIn 1s ease-out forwards', mb: 4 }}>
              Outstanding work! You've crushed your daily goals.
            </Typography>
            
            <Button onClick={() => setShowCelebration(false)} variant="outlined" sx={{ borderColor: themeColors.success, color: themeColors.success, borderRadius: '30px', px: 4, py: 1, animation: 'popIn 1.2s ease-out forwards', '&:hover': { bgcolor: 'rgba(0, 184, 148, 0.1)', borderColor: themeColors.success } }}>
              Continue
            </Button>
          </Box>
        </Fade>
      </Modal>

      <Box sx={{ maxWidth: '850px', mx: 'auto', pb: 5 }}>
        
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeColors.textSecondary }}>
            <Typography variant="body2">Dashboard</Typography><CaretRight size={14} /><Typography variant="body2" color="#fff" fontWeight={600}>My Activity</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(255,255,255,0.1)', py: 0.5, px: 1, borderRadius: '30px', border: themeColors.glassBorder }}>
            <Avatar src={`https://ui-avatars.com/api/?name=${authUser?.username || 'User'}&background=0984e3&color=fff`} sx={{ width: 28, height: 28 }} />
            <Typography variant="body2" fontWeight={600}>{authUser?.username || 'User'}</Typography>
          </Box>
        </Box>

        {/* Calendar Row */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 4 }}>
          {/* Target Card with Dynamic Glow if 100% */}
          <Box sx={{ 
            ...styles.glassCard, flex: 1, mb: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center',
            ...(progressPercent === 100 && totalVisitsCount > 0 ? { border: `1px solid rgba(0, 184, 148, 0.5)`, animation: 'pulseGlow 2s infinite' } : {})
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={700}>Today's Target</Typography>
              <Chip icon={<Trophy weight="fill" color={themeColors.success} />} label="Great Job!" size="small" sx={{ bgcolor: 'rgba(0, 184, 148, 0.15)', color: themeColors.success, fontWeight: 700 }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1, height: 8, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ width: `${progressPercent}%`, height: '100%', bgcolor: themeColors.success, boxShadow: `0 0 10px ${themeColors.success}`, transition: 'width 0.5s ease-out' }} />
              </Box>
              <Typography fontWeight={800}>{completedCount}/{totalVisitsCount}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', bgcolor: 'rgba(0,0,0,0.2)', p: 1, borderRadius: '20px', border: themeColors.glassBorder, justifyContent: 'space-between' }}>
            <IconButton onClick={() => shiftDate(-1)} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}><CaretLeft size={20} weight="bold" /></IconButton>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {dateRange.map((item, idx) => (
                <Box key={idx} onClick={() => handleDateClick(item.dateStr)}>
                  <DateItem day={item.day} date={item.date} active={item.dateStr === activeFilterDate} />
                </Box>
              ))}
            </Box>
            <IconButton onClick={() => shiftDate(1)} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}><CaretRight size={20} weight="bold" /></IconButton>
          </Box>
        </Box>

        {/* Tab Selection Row */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Box sx={{ display: 'inline-flex', gap: 1, p: 0.8, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '18px', border: themeColors.glassBorder }}>
            {[ {n:1, l:'Scheduled'}, {n:2, l:'Plan Visit'}, {n:3, l:'Completed'} ].map((tab, i) => (
              <Button key={i} onClick={() => setActiveTab(i)} sx={{ ...styles.tabBtn, bgcolor: activeTab === i ? themeColors.blue : 'transparent', color: activeTab === i ? '#fff' : themeColors.textSecondary }}>
                <Box sx={{ ...styles.tabNumber, bgcolor: activeTab === i ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)' }}>{tab.n}</Box> {tab.l}
              </Button>
            ))}
          </Box>
        </Box>

        {/* --- Tab Content --- */}
        
        {/* SCHEDULED TAB (Active Tab 0) - FILTERED BY SELECTED DATE */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Status Filter Row */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { height: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 4 } }}>
               {['All', 'Pending', 'In Progress', 'Completed'].map(status => (
                 <Chip
                   key={status}
                   label={status}
                   onClick={() => setStatusFilter(status)}
                   sx={{
                     bgcolor: statusFilter === status ? themeColors.blue : 'rgba(255,255,255,0.05)',
                     color: statusFilter === status ? '#fff' : themeColors.textSecondary,
                     border: statusFilter === status ? `1px solid ${themeColors.blue}` : '1px solid rgba(255,255,255,0.1)',
                     fontWeight: 600,
                     cursor: 'pointer',
                     '&:hover': { bgcolor: statusFilter === status ? themeColors.blue : 'rgba(255,255,255,0.1)' }
                   }}
                 />
               ))}
            </Box>

            {loadingScheduled ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress sx={{ color: themeColors.blue }} /></Box>
            ) : displayedScheduledLeads.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}><Typography sx={{ color: themeColors.textSecondary }}>No visits match your filter for this date.</Typography></Box>
            ) : (
              displayedScheduledLeads.map((lead) => (
                <ActivityCard 
                  key={lead.lead_id}
                  visitStatus={lead.associate_lead_visit_status} 
                  time={formatTime(lead.associate_visit_time)} 
                  title={lead.company_name || lead.lead_name} 
                  purpose={lead.lead_requirement || 'No specific requirement'} 
                  contact={lead.contact_person_name} 
                  phone={lead.contact_person_phone} 
                  location={lead.company_city && lead.company_state ? `${lead.company_city}, ${lead.company_state}` : 'Location N/A'} 
                  email={lead.company_email || lead.contact_person_email} 
                  disableStart={!lead.associate_visit_date?.startsWith(todayStr)} // Disable if not today
                  onReschedule={() => handleOpenSchedule(lead, true)} // <--- Passes 'true' for isRescheduleMode
                  onStartVisit={() => handleStartVisit(lead)}
                  onEndVisit={() => handleOpenEndModal(lead)}
                  onViewLead={() => navigate(`/marketing/customer-info/${lead.lead_id}`)}
                />
              ))
            )}
          </Box>
        )}

        {/* PLAN VISIT TAB (Active Tab 1) */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!isMobile && (
              <Box sx={{ display: 'flex', px: 3, mb: 1, color: themeColors.textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                <Box sx={{ flex: 2.5 }}>Company Name</Box><Box sx={{ flex: 1.5 }}>Location</Box><Box sx={{ flex: 0.8 }}>Type</Box><Box sx={{ flex: 0.8 }}>Status</Box><Box sx={{ flex: 0.5, textAlign: 'right' }}>Action</Box>
              </Box>
            )}

            {loadingUnscheduled ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress sx={{ color: themeColors.blue }} />
              </Box>
            ) : unscheduledLeads.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography sx={{ color: themeColors.textSecondary }}>No unscheduled leads to plan visits for.</Typography>
              </Box>
            ) : (
              unscheduledLeads.map((lead) => {
                const companyName = lead.company_name || lead.lead_name || 'Unknown';
                const initial = companyName.charAt(0).toUpperCase();
                const location = lead.company_city && lead.company_state ? `${lead.company_city}, ${lead.company_state}` : 'Location N/A';

                return (
                  <Box key={lead.lead_id} sx={{ ...styles.glassCard, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', p: 2, mb: 1.5, gap: 2 }}>
                    <Box sx={{ flex: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: getLogoColor(companyName) }}>{initial}</Avatar>
                      <Box>
                        <Typography fontWeight={600} noWrap>{companyName}</Typography>
                        <Typography variant="caption" sx={{ color: themeColors.textSecondary }} noWrap>{lead.contact_person_name}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1.5, fontSize: '0.85rem' }}><MapPin size={16} style={{ marginRight: '4px' }} /> {location}</Box>
                    <Box sx={{ flex: 0.8 }}><Chip label={lead.lead_type || 'N/A'} size="small" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: themeColors.blue }} /></Box>
                    <Box sx={{ flex: 0.8 }}><Chip label={lead.lead_status || 'New'} size="small" sx={{ bgcolor: 'rgba(249, 115, 22, 0.1)', color: themeColors.warning }} /></Box>
                    <Box sx={{ flex: 0.5, textAlign: 'right', width: isMobile ? '100%' : 'auto' }}>
                      <Button onClick={() => handleOpenSchedule(lead, false)} variant="outlined" startIcon={<CalendarPlus weight="fill" />} sx={{ textTransform: 'none', color: '#fff', borderColor: 'rgba(255,255,255,0.2)', width: isMobile ? '100%' : 'auto', '&:hover': { borderColor: themeColors.blue, bgcolor: 'rgba(59, 130, 246, 0.1)' } }}>
                        Schedule
                      </Button>
                    </Box>
                  </Box>
                )
              })
            )}
          </Box>
        )}

        {/* --- COMPLETED VISITS TAB (Active Tab 2) --- */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Filter Dropdown (Only for Associate-Marketing-Head) */}
            {isMarketingHead && (
              <Box sx={{ mb: 2, maxWidth: 300 }}>
                <Typography variant="caption" sx={{ color: themeColors.blue, fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>Filter by Employee</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedEmpFilter}
                    onChange={(e) => setSelectedEmpFilter(e.target.value)}
                    sx={styles.filterSelect}
                  >
                    <MenuItem value="All">All Employees</MenuItem>
                    {uniqueEmployees.map(emp => (
                      <MenuItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            {loadingCompleted ? (
               <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress sx={{ color: themeColors.blue }} /></Box>
            ) : filteredCompleted.length === 0 ? (
               <Box sx={{ textAlign: 'center', p: 4 }}><Typography sx={{ color: themeColors.textSecondary }}>No completed visits found.</Typography></Box>
            ) : (
               filteredCompleted.map(lead => (
                 <Box key={lead.lead_id} sx={{ ...styles.glassCard, mb: 2 }}>
                   <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                     <Box>
                        <Typography variant="h6" fontWeight={700}>{lead.company_name || lead.lead_name}</Typography>
                        <Typography variant="caption" color={themeColors.textSecondary}>
                          Completed by <span style={{color: '#fff', fontWeight: 'bold'}}>{lead.completed_by_name || 'Employee'}</span> on {formatDateTime(lead.completed_at || lead.updated_at)}
                        </Typography>
                     </Box>
                     <Chip icon={<CheckCircle weight="fill" />} label="Completed" size="small" color="success" variant="outlined" />
                   </Stack>
                   
                   <Grid container spacing={2} sx={{ mb: 2 }}>
                     <Grid item xs={12} sm={4}>
                       <InfoItem icon={<Clock size={18} />} label="Visit Time" value={formatTime(lead.associate_visit_time || lead.visit_time)} />
                     </Grid>
                     <Grid item xs={12} sm={4}>
                       <InfoItem icon={<CalendarPlus size={18} />} label="Visit Date" value={lead.associate_visit_date || lead.visit_date ? new Date(lead.associate_visit_date || lead.visit_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "Date Not Available"} />
                     </Grid>
                     <Grid item xs={12} sm={4}>
                       <InfoItem icon={<MapPin size={18} />} label="Start Location" value={lead.associate_visit_start_location || lead.start_location || "Coordinates Captured"} />
                     </Grid>
                   </Grid>
                   
                   {/* <Button 
                     fullWidth 
                     variant="outlined" 
                     size="small" 
                     sx={{ color: themeColors.blue, borderColor: 'rgba(9, 132, 227, 0.5)', '&:hover': { bgcolor: 'rgba(9, 132, 227, 0.1)'} }} 
                     onClick={() => navigate(`/marketing/customer-info/${lead.lead_id}`)}
                   >
                     View History
                   </Button> */}
                 </Box>
               ))
            )}
          </Box>
        )}

      </Box>

      {/* --- Schedule & Reschedule Modal Popup --- */}
      <Modal open={openModal} onClose={handleCloseModal} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500, style: { backgroundColor: 'rgba(0, 0, 0, 0.85)' } }}>
        <Fade in={openModal}>
          <Box sx={styles.modalBox}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={700} color="#fff">
                {isRescheduleMode ? 'Reschedule Visit' : 'Schedule Visit'}
              </Typography>
              <IconButton onClick={handleCloseModal} sx={{ color: themeColors.textSecondary, '&:hover': { color: '#fff' } }}><X size={20} /></IconButton>
            </Box>
            
            <Typography variant="body2" sx={{ color: themeColors.textSecondary, mb: 3 }}>
              {isRescheduleMode ? 'Rescheduling visit for' : 'Scheduling visit for'} <span style={{ color: themeColors.blue, fontWeight: 700 }}>{selectedLead?.company_name || selectedLead?.lead_name}</span>
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: themeColors.blue, fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>Select Date</Typography>
                <TextField fullWidth type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} sx={styles.inputField} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: themeColors.blue, fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>Select Time</Typography>
                <TextField fullWidth type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} sx={styles.inputField} InputLabelProps={{ shrink: true }} />
              </Grid>
              
              {/* Conditional Fields based on Mode */}
              {!isRescheduleMode ? (
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: themeColors.blue, fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>Priority Level</Typography>
                  <Stack direction="row" spacing={1}>
                    {[{ label: 'High', color: themeColors.danger }, { label: 'Medium', color: themeColors.warning }, { label: 'Low', color: themeColors.success }].map((p) => (
                      <Button 
                        key={p.label} 
                        fullWidth 
                        onClick={() => setSchedulePriority(p.label)} 
                        sx={{ 
                          bgcolor: schedulePriority === p.label ? `${p.color}33` : 'rgba(255,255,255,0.03)', 
                          color: schedulePriority === p.label ? p.color : 'rgba(255,255,255,0.6)', 
                          border: schedulePriority === p.label ? `1px solid ${p.color}` : '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '12px', py: 1, fontSize: '0.8rem',
                          '&:hover': { bgcolor: `${p.color}22` }
                        }}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </Stack>
                </Grid>
              ) : (
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: themeColors.blue, fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>Reason for Rescheduling</Typography>
                  <TextField 
                    fullWidth 
                    value={scheduleReason} 
                    onChange={(e) => setScheduleReason(e.target.value)} 
                    placeholder="Enter reason..."
                    sx={styles.inputField} 
                  />
                </Grid>
              )}
            </Grid>

            <Box sx={{ mt: 5, display: 'flex', gap: 2 }}>
              <Button fullWidth onClick={handleCloseModal} sx={{ color: themeColors.textSecondary, textTransform: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>Cancel</Button>
              <Button 
                fullWidth 
                variant="contained" 
                onClick={handleConfirmSchedule} 
                disabled={isScheduling}
                sx={{ bgcolor: themeColors.blue, py: 1.5, borderRadius: '12px', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#0062cc' } }}
              >
                {isScheduling ? <CircularProgress size={24} color="inherit" /> : (isRescheduleMode ? 'Confirm Reschedule' : 'Confirm Schedule')}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* --- END VISIT & TRANSFER MODAL POPUP --- */}
      <Modal open={openEndModal} onClose={handleCloseEndModal} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500, style: { backgroundColor: 'rgba(0, 0, 0, 0.85)' } }}>
        <Fade in={openEndModal}>
          <Box sx={styles.modalBox}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={700} color="#fff">End Visit & Transfer</Typography>
              <IconButton onClick={handleCloseEndModal} sx={{ color: themeColors.textSecondary, '&:hover': { color: '#fff' } }}><X size={20} /></IconButton>
            </Box>
            
            <Typography variant="body2" sx={{ color: themeColors.textSecondary, mb: 4 }}>
              You are about to complete the visit for <span style={{ color: themeColors.blue, fontWeight: 700 }}>{endVisitLead?.company_name || endVisitLead?.lead_name}</span>. Please select the next department to transfer this lead.
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: themeColors.blue, fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>Transfer To</Typography>
                <Stack direction="row" spacing={2}>
                  {['Technical-Team', 'Solutions-Team'].map((dept) => (
                    <Button 
                      key={dept} 
                      fullWidth 
                      onClick={() => setNextDepartment(dept)} 
                      sx={{ 
                        bgcolor: nextDepartment === dept ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)', 
                        color: nextDepartment === dept ? themeColors.blue : 'rgba(255,255,255,0.6)', 
                        border: nextDepartment === dept ? `1px solid ${themeColors.blue}` : '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '12px', py: 2, fontSize: '0.8rem',
                        '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' }
                      }}
                    >
                      {dept.replace('-', ' ')}
                    </Button>
                  ))}
                </Stack>
              </Grid>
            </Grid>

            <Box sx={{ mt: 5, display: 'flex', gap: 2 }}>
              <Button fullWidth onClick={handleCloseEndModal} sx={{ color: themeColors.textSecondary, textTransform: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>Cancel</Button>
              <Button 
                fullWidth 
                variant="contained" 
                onClick={submitEndVisit} 
                disabled={isEnding}
                endIcon={<PaperPlaneRight weight="fill" />}
                sx={{ bgcolor: themeColors.success, py: 1.5, borderRadius: '12px', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#00a884' } }}
              >
                {isEnding ? <CircularProgress size={24} color="inherit" /> : 'Confirm Transfer'}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Toast Notification */}
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: '12px', width: '100%', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssociateMyactivity;