import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Chip,
  Avatar,
  Tabs,
  Tab,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Modal,
  Fade,
  Backdrop,
  CircularProgress,
  Divider, // <-- Fixed: Divider is securely imported here!
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

// Phosphor Icons
import {
  CheckCircle,
  Wrench,
  Lightbulb,
  Receipt,
  Fire,
  TrendUp,
  AddressBook,
  Briefcase,
  CalendarCheck,
  ChatCircleDots,
  Note,
  ListChecks,
  ClockCounterClockwise,
  Paperclip,
  PaperPlaneRight,
  FilePdf,
  Image as ImageIcon,
  HardHat,
  User,
  MapPin,
  CaretLeft,
  X 
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

// Helper to format date to YYYY-MM-DD (or readable string)
const formatDateString = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to format readable Date (e.g., 15 Feb 2026)
const formatReadableDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Helper to format date and time (e.g., 15 Feb 2026, 3:09 PM)
const formatDateTime = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  const datePart = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${datePart}, ${timePart}`;
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
  accent: '#7b2cbf', // Purple
  accentGlow: '#9d4edd',
  success: '#00b894', // Green
  blue: '#0984e3',
  warning: '#fdcb6e',
  danger: '#ff6b6b'
};

// --- STYLES ---
const glassCardStyle = {
  background: themeColors.glassBg,
  backdropFilter: 'blur(16px)',
  border: themeColors.glassBorder,
  borderRadius: '16px',
  boxShadow: themeColors.glassShadow,
  p: 3,
  mb: 3,
  color: themeColors.textPrimary
};

const modalBoxStyle = {
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
};

// --- HELPER COMPONENTS ---

const PipelineStep = ({ label, status, icon: Icon }) => {
  let bg = 'rgba(255,255,255,0.05)';
  let color = themeColors.textSecondary;
  let shadow = 'none';
  let fontWeight = 400;

  if (status === 'completed') {
    bg = themeColors.success;
    color = '#fff';
  } else if (status === 'active') {
    bg = themeColors.accent;
    color = '#fff';
    shadow = `0 0 15px ${themeColors.accent}`;
    fontWeight = 700;
  }

  return (
    <Box sx={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, py: 1.5,
      position: 'relative', bgcolor: bg, color: color, fontWeight: fontWeight, boxShadow: shadow,
      clipPath: 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%, 5% 50%)', ml: '-15px',
      '&:first-of-type': { ml: 0, clipPath: 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%)', borderTopLeftRadius: '50px', borderBottomLeftRadius: '50px' },
      '&:last-child': { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 5% 50%)', borderTopRightRadius: '50px', borderBottomRightRadius: '50px' }
    }}>
      {Icon && <Icon size={18} weight="fill" />}
      <Typography variant="body2" sx={{fontSize: '0.85rem'}}>{label}</Typography>
    </Box>
  );
};

const MetricBox = ({ label, value, isProbability }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    <Typography variant="caption" sx={{ color: themeColors.textSecondary, mb: 0.5 }}>{label}</Typography>
    <Typography variant="h6" sx={{ fontWeight: 600, color: isProbability ? themeColors.success : themeColors.textPrimary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {value} {isProbability && <TrendUp size={16} weight="bold" />}
    </Typography>
  </Box>
);

const FieldRow = ({ label, value, icon, isLink, isUser, isWarning, onClick }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, fontSize: '0.95rem' }}>
    <Typography sx={{ color: themeColors.textSecondary }}>{label}</Typography>
    <Box 
      onClick={onClick}
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        color: isLink ? themeColors.blue : isWarning ? themeColors.warning : themeColors.textPrimary, 
        fontWeight: 500, 
        cursor: onClick || isLink ? 'pointer' : 'default',
        '&:hover': onClick || isLink ? { textDecoration: 'underline' } : {}
      }}
    >
      {icon}
      {isUser && value !== 'Unassigned' && <Avatar sx={{ width: 20, height: 20 }} src={`https://ui-avatars.com/api/?name=${value}&background=random`} />}
      {value}
    </Box>
  </Box>
);

// New Component specifically for Activity Log mapped from API
const ActivityLogCard = ({ activity }) => {
  // Format Title
  let title = activity.change_type || 'Lead Updated';
  if (title.includes('_')) {
    title = title.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  } else if (activity.change_type === null && activity.reason === 'New Lead Created') {
    title = "Lead Created";
  }

  // Format Date (DD/MM/YYYY, HH:MM:SS)
  const dateStr = new Date(activity.change_timestamp).toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  // Format Changed By
  const changedBy = activity.changed_by_details 
    ? `${activity.changed_by_details.email || activity.changed_by_details.username} (${activity.changed_by_details.role_id?.replace(/-/g, ' ')})`
    : activity.changed_by 
      ? `${activity.changed_by} ()`
      : 'None ()';

  const oldStage = activity.old_lead_stage || 'None';
  const newStage = activity.new_lead_stage || 'None';
  
  const oldEmp = activity.old_assigned_employee || 'None';
  const newEmp = activity.new_assigned_employee || 'None';

  return (
    <Box sx={{ ...glassCardStyle, p: 2.5, mb: 2, bgcolor: 'rgba(255,255,255,0.03)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{title}</Typography>
        <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>{dateStr}</Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
        <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
          Changed by: <span style={{ fontWeight: 600, color: '#fff' }}>{changedBy}</span>
        </Typography>
        
        <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
          Stage: <span style={{ fontWeight: 600, color: '#fff' }}>{oldStage}</span> → <span style={{ fontWeight: 600, color: '#fff' }}>{newStage}</span>
        </Typography>
        
        <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
          Employee: <span style={{ fontWeight: 600, color: '#fff' }}>{oldEmp}</span> → <span style={{ fontWeight: 600, color: '#fff' }}>{newEmp}</span>
        </Typography>
        
        {activity.reason && (
          <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 0.5 }}>
            Reason: {activity.reason}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const NoteCard = ({ author, role, time, title, text, files, authorIcon }) => (
  <Box sx={{ ...glassCardStyle, p: 2.5, bgcolor: 'rgba(255,255,255,0.03)' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {authorIcon}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: themeColors.accent }}>{author}</Typography>
        <Chip label={role} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: themeColors.textSecondary, height: 20, fontSize: '0.65rem' }} />
      </Box>
      <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>{time}</Typography>
    </Box>
    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: '#fff' }}>{title}</Typography>
    <Typography variant="body2" sx={{ color: '#e0e0e0', lineHeight: 1.5, mb: 2 }}>{text}</Typography>
    {files && files.length > 0 && (
      <Box>
        <Typography variant="caption" sx={{ color: themeColors.textSecondary, display: 'flex', alignItems: 'center', mb: 1, textTransform: 'uppercase' }}>
          <Paperclip size={14} style={{ marginRight: 4 }} /> 
          {files.length} Attachment{files.length > 1 ? 's' : ''}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {files.map((file, idx) => {
            const isPdf = file.file_name?.toLowerCase().endsWith('.pdf');
            return (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, px: 1.5, py: 1, cursor: 'pointer', '&:hover': { borderColor: themeColors.accent } }} onClick={() => window.open(`${API_BASE_URL}/${file.file_path}`, '_blank')}>
                {isPdf ? <FilePdf size={20} color={themeColors.danger} weight="fill" /> : <ImageIcon size={20} color={themeColors.blue} weight="fill" />}
                <Box>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{file.file_name}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    )}
  </Box>
);

// --- MAIN PAGE COMPONENT ---
const CustomerInfo = () => {
  const { id } = useParams();
  const leadId = id || "L-064"; 
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0);
  const [leadData, setLeadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapModalOpen, setMapModalOpen] = useState(false);

  // Discussion Tab States
  const [discussions, setDiscussions] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]); // Multiple files
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const fileInputRef = useRef(null);

  // Notes Tab States
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedNoteFiles, setSelectedNoteFiles] = useState([]); // Multiple files
  const [isSendingNote, setIsSendingNote] = useState(false);
  const noteFileInputRef = useRef(null);

  // Activity Tab State
  const [activities, setActivities] = useState([]);

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  // Initial Fetch for Lead Details & All Tabs
  useEffect(() => {
    const fetchLeadDetails = async () => {
      setLoading(true);
      const token = getToken();
      try {
        const response = await fetch(`${API_BASE_URL}/api/leads/${leadId}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const result = await response.json();
          setLeadData(result.lead);
        } else {
          console.error("Failed to fetch lead details");
        }
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadDetails();
    fetchDiscussions();
    fetchNotes();
    fetchActivities();
  }, [leadId]);

  // --- TAB 1: DISCUSSIONS ---
  const fetchDiscussions = async () => {
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/api/tleads/${leadId}/discussion`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setDiscussions(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch discussions", error);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = null; // reset input
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    setIsSendingMsg(true);
    const token = getToken();
    const formData = new FormData();
    formData.append('lead_id', leadId);
    if (newMessage.trim()) formData.append('message', newMessage);
    
    // Append multiple files
    selectedFiles.forEach(file => {
      formData.append('attachments', file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/tleads/discussion`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });

      if (response.ok) {
        setNewMessage('');
        setSelectedFiles([]);
        fetchDiscussions(); // Refresh the chat
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("API Error sending message:", error);
    } finally {
      setIsSendingMsg(false);
    }
  };

  // --- TAB 2: NOTES ---
  const fetchNotes = async () => {
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/api/leads/${leadId}/notes`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setNotes(result.notes || []);
      }
    } catch (error) {
      console.error("Failed to fetch notes", error);
    }
  };

  const handleNoteFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedNoteFiles(prev => [...prev, ...files]);
    if (noteFileInputRef.current) noteFileInputRef.current.value = null; // reset input
  };

  const removeNoteFile = (index) => {
    setSelectedNoteFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitNote = async () => {
    if (!newNoteTitle.trim() || !newNoteText.trim()) return;

    setIsSendingNote(true);
    const token = getToken();
    const formData = new FormData();
    formData.append('title', newNoteTitle);
    formData.append('note', newNoteText);
    
    // Append multiple files
    selectedNoteFiles.forEach(file => {
      formData.append('attachments', file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/leads/${leadId}/notes`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });

      if (response.ok) {
        setNewNoteTitle('');
        setNewNoteText('');
        setSelectedNoteFiles([]);
        fetchNotes(); // Refresh notes list
      } else {
        console.error("Failed to submit note");
      }
    } catch (error) {
      console.error("API Error submitting note:", error);
    } finally {
      setIsSendingNote(false);
    }
  };

  // --- TAB 3: ACTIVITY TIMELINE ---
  const fetchActivities = async () => {
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/api/leads/${leadId}/activity`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setActivities(result.activities || []);
      }
    } catch (error) {
      console.error("Failed to fetch activities", error);
    }
  };

  // Priority Colors
  const priority = leadData?.lead_priority || 'Medium';
  const priorityColor = priority === 'High' ? themeColors.danger : priority === 'Medium' ? themeColors.warning : themeColors.success;
  const priorityBg = priority === 'High' ? 'rgba(255, 69, 58, 0.2)' : priority === 'Medium' ? 'rgba(253, 203, 110, 0.2)' : 'rgba(0, 184, 148, 0.2)';

  // Pipeline Logic Setup Based on User Rules
  const stage = leadData?.lead_stage || '';
  
  // Rule: Technical, Solutions, Quotations turn Purple ("active") when they are reached
  const techActive = stage === 'Technical-Team' || stage === 'Solutions-Team' || stage === 'Quotations';
  const solActive = stage === 'Solutions-Team' || stage === 'Quotations';
  const quotActive = stage === 'Quotations';

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', background: themeColors.bgGradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: themeColors.accent }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: themeColors.bgGradient, color: themeColors.textPrimary, fontFamily: "'Inter', sans-serif", p: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', pb: 5 }}>
        
        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}>
             <CaretLeft size={20} />
          </IconButton>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}>Action</Button>
            <Button variant="contained" sx={{ bgcolor: themeColors.accent, '&:hover': { bgcolor: themeColors.accentGlow }, boxShadow: `0 0 10px rgba(123, 44, 191, 0.5)` }}>Create Quotation</Button>
          </Box>
        </Box>

        {/* Pipeline Status */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '50px', p: 0.5, mb: 4, overflow: 'visible', backdropFilter: 'blur(5px)' }}>
          <PipelineStep label="Lead Created" status="completed" icon={CheckCircle} />
          <PipelineStep label="Marketing" status="completed" icon={CheckCircle} />
          <PipelineStep label="Technical" status={techActive ? 'active' : 'pending'} icon={Wrench} />
          <PipelineStep label="Solution" status={solActive ? 'active' : 'pending'} icon={Lightbulb} />
          <PipelineStep label="Quotation" status={quotActive ? 'active' : 'pending'} icon={Receipt} />
        </Box>

        {/* Header Card */}
        <Box sx={glassCardStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexDirection: {xs: 'column', sm: 'row'} }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>{leadData?.company_name || leadData?.lead_name}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label={`${leadData?.lead_type || 'N/A'} Lead`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', border: themeColors.glassBorder }} />
                <Chip label={`${priority} Priority`} icon={<Fire size={14} color={priorityColor} weight="fill" />} size="small" sx={{ bgcolor: priorityBg, color: priorityColor, border: `1px solid ${priorityColor}55` }} />
              </Box>
            </Box>
          </Box>
          <Grid container spacing={4} sx={{ borderTop: themeColors.glassBorder, pt: 2.5 }}>
            <Grid item xs={6} sm={4}><MetricBox label="Expected Revenue" value={leadData?.expected_revenue ? `₹ ${parseFloat(leadData.expected_revenue).toLocaleString('en-IN')}` : '₹ 0.00'} /></Grid>
            <Grid item xs={6} sm={4}><MetricBox label="Probability" value={`${leadData?.probability || 0}%`} isProbability /></Grid>
            <Grid item xs={12} sm={4}><MetricBox label="Closing Date" value={leadData?.expected_closing_date ? formatReadableDate(leadData.expected_closing_date) : "N/A"} /></Grid>
          </Grid>
        </Box>

        {/* Details Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ ...glassCardStyle, height: '100%' }}>
              <Typography variant="h6" sx={{ borderBottom: themeColors.glassBorder, pb: 2, mb: 2, color: themeColors.textSecondary, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AddressBook size={20} /> Contact Information
              </Typography>
              <FieldRow label="Customer" value={leadData?.company_name || "N/A"} />
              <FieldRow label="Contact Person" value={leadData?.contact_person_name || "N/A"} />
              <FieldRow label="Email" value={leadData?.company_email || leadData?.contact_person_email || "N/A"} />
              <FieldRow label="Phone" value={leadData?.company_contact_number || leadData?.contact_person_phone || "N/A"} />
              <FieldRow label="Address" value={[leadData?.company_address, leadData?.company_city, leadData?.company_state, leadData?.company_country].filter(Boolean).join(', ') || 'N/A'} />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ ...glassCardStyle, height: '100%' }}>
              <Typography variant="h6" sx={{ borderBottom: themeColors.glassBorder, pb: 2, mb: 2, color: themeColors.textSecondary, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Briefcase size={20} /> Internal Tracking
              </Typography>
              <FieldRow label="Salesperson" value={leadData?.assigned_employee_details?.username || "Unassigned"} isUser />
              <FieldRow label="Field Visit Date" value={leadData?.field_visit_date ? formatReadableDate(leadData.field_visit_date) : "N/A"} />
              <FieldRow label="Field Visit Time" value={formatTime(leadData?.field_visit_time)} />
              <FieldRow label="Field Visit Status" value={leadData?.field_lead_visit_status || "N/A"} isWarning={leadData?.field_lead_visit_status === 'Pending'} />
              
              {/* Map Row */}
              <FieldRow 
                label="Location" 
                value="View Map" 
                icon={<MapPin size={16} />} 
                isLink 
                onClick={() => setMapModalOpen(true)} 
              />
            </Box>
          </Grid>
        </Grid>

        {/* Collaboration Tabs */}
        <Box sx={{ ...glassCardStyle, p: 0, overflow: 'hidden' }} className="mt-4">
          <Tabs value={tabValue} onChange={handleTabChange} textColor="inherit" variant="scrollable" sx={{ borderBottom: themeColors.glassBorder, bgcolor: 'rgba(0,0,0,0.2)', '& .MuiTabs-indicator': { backgroundColor: themeColors.accent } }}>
            <Tab icon={<ChatCircleDots size={20} />} iconPosition="start" label="Discuss" sx={{ textTransform: 'none', color: themeColors.textSecondary }} />
            <Tab icon={<Note size={20} />} iconPosition="start" label="Notes" sx={{ textTransform: 'none', color: themeColors.textSecondary }} />
            <Tab icon={<ListChecks size={20} />} iconPosition="start" label="Activity" sx={{ textTransform: 'none', color: themeColors.textSecondary }} />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {/* DISCUSSION TAB */}
            {tabValue === 0 && (
              <Box>
                {/* Dynamically Rendered Discussions */}
                <List sx={{ maxHeight: 350, overflowY: 'auto', mb: 2, pr: 1 }}>
                  {discussions.length > 0 ? (
                    discussions.map((msg) => (
                      <ListItem key={msg.discussion_id} alignItems="flex-start" sx={{ px: 0, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, mb: 2, flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', width: '100%', px: 2, pt: 2, pb: 1 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: themeColors.blue }}>
                              {msg.author_name ? msg.author_name.charAt(0).toUpperCase() : 'U'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            disableTypography
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {msg.author_name} 
                                  <Typography component="span" variant="caption" sx={{ color: themeColors.accent, ml: 1 }}>
                                    ({msg.role_id?.replace(/-/g, ' ')})
                                  </Typography>
                                </Typography>
                                <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                                  {new Date(msg.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}
                                </Typography>
                              </Box>
                            } 
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                {msg.message && (
                                  <Typography variant="body2" sx={{ color: '#d1d1d1', mb: msg.attachments?.length ? 1.5 : 0 }}>
                                    {msg.message}
                                  </Typography>
                                )}
                                {/* Render Attachments if any */}
                                {msg.attachments && msg.attachments.length > 0 && (
                                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {msg.attachments.map(att => (
                                      <Chip 
                                        key={att.id}
                                        icon={<Paperclip size={14} />} 
                                        label={att.file_name} 
                                        size="small" 
                                        clickable
                                        sx={{ bgcolor: 'rgba(0,0,0,0.3)', color: themeColors.textSecondary, borderRadius: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }} 
                                        onClick={() => window.open(`${API_BASE_URL}/${att.file_path}`, '_blank')}
                                      />
                                    ))}
                                  </Box>
                                )}
                              </Box>
                            } 
                          />
                        </Box>
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ textAlign: 'center', color: themeColors.textSecondary, py: 4 }}>
                      No discussion history yet. Send a message to start the conversation!
                    </Typography>
                  )}
                </List>

                {/* Input Area */}
                <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 2, borderRadius: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: themeColors.accent }}>{getAuthUser()?.username?.charAt(0)?.toUpperCase() || 'M'}</Avatar>
                    
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <TextField 
                        fullWidth 
                        placeholder="Type your message here..." 
                        variant="standard" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        InputProps={{ disableUnderline: true, sx: { color: 'white' } }} 
                        onKeyPress={(e) => { if(e.key === 'Enter') handleSendMessage() }}
                      />
                    </Box>

                    <input
                      type="file"
                      hidden
                      multiple // Allowed to select multiple files
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                    <IconButton 
                      sx={{ color: selectedFiles.length > 0 ? themeColors.blue : themeColors.textSecondary }} 
                      onClick={() => fileInputRef.current.click()}
                    >
                      <Paperclip size={20} />
                    </IconButton>

                    <Button 
                      variant="contained" 
                      size="small" 
                      onClick={handleSendMessage}
                      disabled={isSendingMsg || (!newMessage.trim() && selectedFiles.length === 0)}
                      endIcon={isSendingMsg ? <CircularProgress size={14} color="inherit" /> : <PaperPlaneRight size={16} weight="fill" />} 
                      sx={{ bgcolor: themeColors.accent, '&:hover': { bgcolor: themeColors.accentGlow } }}
                    >
                      Send
                    </Button>
                  </Box>

                  {/* Show Selected Files Queue below input */}
                  {selectedFiles.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5, pl: 6 }}>
                      {selectedFiles.map((file, idx) => (
                        <Chip 
                          key={idx} 
                          label={file.name} 
                          size="small" 
                          onDelete={() => removeFile(idx)} 
                          sx={{ bgcolor: 'rgba(9, 132, 227, 0.2)', color: '#fff', border: `1px solid rgba(9, 132, 227, 0.5)` }} 
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* NOTES TAB */}
            {tabValue === 1 && (
              <Box>
                <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1, bgcolor: 'rgba(0,0,0,0.2)', p: 2, borderRadius: 3 }}>
                  <TextField 
                    fullWidth 
                    placeholder="Note Title" 
                    variant="standard" 
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    InputProps={{ disableUnderline: true, sx: { color: 'white', fontWeight: 'bold' } }} 
                  />
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                  <TextField 
                    fullWidth 
                    multiline 
                    rows={2} 
                    placeholder="Write a note..." 
                    variant="standard" 
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    InputProps={{ disableUnderline: true, sx: { color: 'white' } }} 
                  />
                  
                  {/* Show Selected Files Queue */}
                  {selectedNoteFiles.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {selectedNoteFiles.map((file, idx) => (
                        <Chip 
                          key={idx} 
                          label={file.name} 
                          size="small" 
                          onDelete={() => removeNoteFile(idx)} 
                          sx={{ bgcolor: 'rgba(9, 132, 227, 0.2)', color: '#fff', border: `1px solid rgba(9, 132, 227, 0.5)` }} 
                        />
                      ))}
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mt: 1 }}>
                    <input
                      type="file"
                      hidden
                      multiple // Allowed to select multiple files
                      ref={noteFileInputRef}
                      onChange={handleNoteFileChange}
                    />
                    <IconButton 
                      sx={{ color: selectedNoteFiles.length > 0 ? themeColors.blue : themeColors.textSecondary }} 
                      onClick={() => noteFileInputRef.current.click()}
                    >
                      <Paperclip size={20} />
                    </IconButton>
                    <Button 
                      variant="contained" 
                      size="small" 
                      onClick={handleSubmitNote}
                      disabled={isSendingNote || (!newNoteTitle.trim() || !newNoteText.trim())}
                      sx={{ bgcolor: themeColors.accent }}
                    >
                      {isSendingNote ? <CircularProgress size={20} color="inherit" /> : 'Submit'}
                    </Button>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {notes.length > 0 ? (
                    notes.map((note) => (
                      <NoteCard 
                        key={note.note_id}
                        author={note.created_by_details?.username || note.created_by_name} 
                        role={note.emp_role?.replace(/-/g, ' ')} 
                        time={new Date(note.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })} 
                        title={note.title}
                        text={note.note} 
                        authorIcon={<User size={18} color={themeColors.accent} weight="fill" />} 
                        files={note.attachments} 
                      />
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ textAlign: 'center', color: themeColors.textSecondary, py: 4 }}>
                      No notes available for this lead.
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {/* ACTIVITY TAB */}
            {tabValue === 2 && (
              <Box sx={{ position: 'relative', pl: 1, pt: 1, maxHeight: 400, overflowY: 'auto' }}>
                
                {activities.length > 0 ? (
                  activities.map((act) => (
                    <ActivityLogCard key={act.id} activity={act} />
                  ))
                ) : (
                  <Typography variant="body2" sx={{ textAlign: 'center', color: themeColors.textSecondary, py: 4 }}>
                    No activity history found for this lead.
                  </Typography>
                )}
              </Box>
            )}
            
          </Box>
        </Box>
      </Box>

      {/* --- Map Location Modal --- */}
      <Modal open={mapModalOpen} onClose={() => setMapModalOpen(false)} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500, style: { backgroundColor: 'rgba(0, 0, 0, 0.85)' } }}>
        <Fade in={mapModalOpen}>
          <Box sx={modalBoxStyle}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={700} color="#fff" display="flex" alignItems="center" gap={1}>
                <MapPin color={themeColors.blue} /> Field Visit Location
              </Typography>
              <IconButton onClick={() => setMapModalOpen(false)} sx={{ color: themeColors.textSecondary, '&:hover': { color: '#fff' } }}><X size={20} /></IconButton>
            </Box>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 3, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
               <Typography variant="body1" color="#fff" fontWeight={500}>
                 {leadData?.field_visit_start_location || "Location Coordinates Not Captured"}
               </Typography>
               <Typography variant="caption" color={themeColors.textSecondary} sx={{ mt: 1, display: 'block' }}>GPS Coordinates</Typography>
            </Box>
            <Button fullWidth variant="contained" onClick={() => setMapModalOpen(false)} sx={{ mt: 4, bgcolor: themeColors.blue, '&:hover': { bgcolor: '#0062cc' } }}>
              Close Map
            </Button>
          </Box>
        </Fade>
      </Modal>

    </Box>
  );
};

export default CustomerInfo;