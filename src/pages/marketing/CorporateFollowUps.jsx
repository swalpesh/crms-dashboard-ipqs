import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  InputBase,
  Select,
  MenuItem,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Modal,
  Fade,
  Backdrop,
  Grid,
  TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Material UI Icons
import SearchIcon from '@mui/icons-material/Search';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

// --- API HELPERS ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

// --- THEME CONSTANTS ---
const theme = {
  bgGradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  glassBg: 'rgba(255, 255, 255, 0.04)',
  glassBorder: '1px solid rgba(255, 255, 255, 0.1)',
  glassShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  accent: '#3b82f6',
  success: '#10b981', 
  warning: '#f1c40f',
  danger: '#e74c3c',
  info: '#3498db',
  purple: '#9b59b6',
  teal: '#2ecc71'
};

// --- STYLES ---
const styles = {
  container: {
    minHeight: '100vh',
    background: theme.bgGradient,
    color: theme.textPrimary,
    fontFamily: "'Inter', sans-serif",
    p: { xs: 2, md: 4 },
  },
  glassPanel: {
    background: theme.glassBg,
    backdropFilter: 'blur(16px)',
    border: theme.glassBorder,
    boxShadow: theme.glassShadow,
    borderRadius: '16px',
  },
  headerInput: {
    background: 'rgba(0,0,0,0.2)',
    border: theme.glassBorder,
    borderRadius: '10px',
    color: 'white',
    padding: '4px 12px',
    display: 'flex',
    alignItems: 'center',
    width: { xs: '100%', sm: '300px' }
  },
  select: {
    height: 40,
    borderRadius: '10px',
    bgcolor: 'rgba(0,0,0,0.2)',
    border: theme.glassBorder,
    color: 'white',
    '& .MuiSvgIcon-root': { color: theme.textSecondary },
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
  },
  gridRow: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '2.5fr 0.8fr 0.8fr 1.2fr 2fr 1.8fr' },
    alignItems: 'center',
    gap: 2,
    p: 2.5,
    mb: 1.5,
    borderRadius: '12px',
    border: theme.glassBorder,
    background: theme.glassBg,
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      background: 'rgba(255,255,255,0.08)'
    }
  },
  dateTimeBox: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 500 }, 
    bgcolor: '#1a1a35',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.1)',
    p: 4,
    outline: 'none',
    boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
  },
  inputField: {
    '& .MuiOutlinedInput-root': {
      color: '#fff',
      bgcolor: 'rgba(255,255,255,0.03)',
      borderRadius: '12px',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
      '&:hover fieldset': { borderColor: theme.accent },
      '&.Mui-focused fieldset': { borderColor: theme.accent },
    },
    '& .MuiInputLabel-root': { color: theme.textSecondary },
  },
  badgeHigh: { bgcolor: 'rgba(231, 76, 60, 0.2)', color: theme.danger, border: `1px solid rgba(231, 76, 60, 0.3)` },
  badgeMed: { bgcolor: 'rgba(241, 196, 15, 0.2)', color: theme.warning, border: `1px solid rgba(241, 196, 15, 0.3)` },
  badgeLow: { bgcolor: 'rgba(52, 152, 219, 0.2)', color: theme.info, border: `1px solid rgba(52, 152, 219, 0.3)` },
  typeProduct: { bgcolor: 'rgba(155, 89, 182, 0.2)', color: theme.purple, border: `1px solid rgba(155, 89, 182, 0.3)` },
  typeService: { bgcolor: 'rgba(46, 204, 113, 0.2)', color: theme.teal, border: `1px solid rgba(46, 204, 113, 0.3)` },
};

// --- HELPER FUNCTIONS ---
const getInitials = (name) => {
  if (!name) return "U";
  return name.charAt(0).toUpperCase();
};

const formatFollowUpDate = (dateStr) => {
  if (!dateStr) return "Not Set";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const formatFollowUpTime = (timeStr) => {
  if (!timeStr) return "";
  try {
    const [hourString, minute] = timeStr.split(':');
    const hour = parseInt(hourString, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  } catch {
    return timeStr;
  }
};

const CorporatePendingFollowup = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState('all');
  
  // Reschedule & Approval States
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [activeLead, setActiveLead] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '', reason: '' });
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [approvalLoadingId, setApprovalLoadingId] = useState(null);

  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();

  // --- API FETCH ---
  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/cleads/my-leads?lead_status=follow-up`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
      } else {
        setToast({ open: true, message: "Failed to fetch follow-ups.", severity: "error" });
      }
    } catch (error) {
      console.error(error);
      setToast({ open: true, message: "Server error while fetching leads.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  // --- FILTERING LOGIC ---
  const filteredFollowUps = useMemo(() => {
    return leads.filter(lead => {
      const companyName = lead.company_name || "";
      const contactPerson = lead.contact_person_name || "";
      const priority = lead.lead_priority || "";

      const matchesSearch = companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPriority = filterPriority === 'all' || priority.toLowerCase() === filterPriority.toLowerCase();

      return matchesSearch && matchesPriority;
    });
  }, [leads, searchQuery, filterPriority]);

  // --- STYLING MAPPERS ---
  const getPriorityStyle = (priority) => {
    const p = priority?.toLowerCase();
    if (p === 'high') return styles.badgeHigh;
    if (p === 'medium') return styles.badgeMed;
    return styles.badgeLow;
  };

  const getPriorityIcon = (priority) => {
    if (priority?.toLowerCase() === 'high') return <WhatshotIcon sx={{ fontSize: 16 }} />;
    return undefined;
  };

  const getTypeBadge = (type) => {
    return type?.toLowerCase() === 'product' ? styles.typeProduct : styles.typeService;
  };

  const handleViewClick = (id) => navigate(`/marketing/customer-info/${id}`);

  // --- APPROVE HANDLER (DUAL API CALL) ---
  const handleApprove = async (lead) => {
    setApprovalLoadingId(lead.lead_id);
    try {
      const token = getToken();

      // Define both API calls
      const changeStagePromise = fetch(`${API_BASE_URL}/api/cleads/change-stage`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          lead_id: lead.lead_id,
          new_lead_stage: "Quotation-Team",
          reason: "PO Confirmed"
        })
      });

      const poStatusPromise = fetch(`${API_BASE_URL}/api/leads/po-status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          lead_id: lead.lead_id,
          po_confirmed: "Yes"
        })
      });

      // Fire both concurrently
      const [resStage, resPO] = await Promise.all([changeStagePromise, poStatusPromise]);

      if (resStage.ok && resPO.ok) {
        setToast({ open: true, message: "Lead Approved: Stage changed and PO confirmed!", severity: "success" });
        fetchFollowUps(); // Refresh the list
      } else {
        throw new Error("One or more requests failed. Please check the logs.");
      }
    } catch (error) {
      console.error(error);
      setToast({ open: true, message: error.message, severity: "error" });
    } finally {
      setApprovalLoadingId(null);
    }
  };

  // --- RESCHEDULE HANDLERS ---
  const handleOpenReschedule = (lead) => {
    setActiveLead(lead);
    setRescheduleData({
      date: lead.follow_up_date ? lead.follow_up_date.split('T')[0] : '',
      time: lead.follow_up_time || '',
      reason: lead.follow_up_reason || ''
    });
    setShowRescheduleModal(true);
  };

  const handleSubmitReschedule = async () => {
    if (!rescheduleData.date || !rescheduleData.time || !rescheduleData.reason.trim()) {
      setToast({ open: true, message: "Please fill all the required fields.", severity: "warning" });
      return;
    }

    setRescheduleLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/cleads/${activeLead.lead_id}/status`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          lead_status: "follow-up",
          follow_up_reason: rescheduleData.reason,
          follow_up_date: rescheduleData.date,
          follow_up_time: rescheduleData.time
        })
      });

      if (response.ok) {
        setToast({ open: true, message: "Follow-up rescheduled successfully!", severity: "success" });
        setShowRescheduleModal(false);
        fetchFollowUps(); 
      } else {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to reschedule follow-up.");
      }
    } catch (error) {
      console.error(error);
      setToast({ open: true, message: error.message, severity: "error" });
    } finally {
      setRescheduleLoading(false);
    }
  };

  return (
    <Box sx={styles.container}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        
        {/* --- Header --- */}
        <Box sx={{ ...styles.glassPanel, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', p: 3, mb: 3, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" fontWeight={700}>Follow-Up's</Typography>
            <Chip label={`${filteredFollowUps.length} Pending`} sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', border: theme.glassBorder, height: 28 }} />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', md: 'auto' } }}>
            <Box sx={styles.headerInput}>
              <SearchIcon sx={{ color: theme.textSecondary, mr: 1 }} />
              <InputBase placeholder="Search leads or contacts..." fullWidth sx={{ color: 'white' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </Box>

            <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} sx={styles.select} displayEmpty>
              <MenuItem value="all">All Priorities</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </Box>
        </Box>

        {/* --- List Header --- */}
        <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateColumns: '2.5fr 0.8fr 0.8fr 1.2fr 2fr 1.8fr', px: 3, py: 1.5, mb: 1, color: theme.textSecondary, fontSize: '0.85rem', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          <Box>Lead / Contact Person</Box>
          <Box>Priority</Box>
          <Box>Lead Type</Box>
          <Box>Expected Rev.</Box>
          <Box>Follow-Up Details</Box>
          <Box sx={{ textAlign: 'right' }}>Actions</Box>
        </Box>

        {/* --- List Items --- */}
        <Box>
          {loading ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
          ) : filteredFollowUps.length === 0 ? (
             <Typography variant="body1" color={theme.textSecondary} textAlign="center" mt={5}>No pending follow-ups found.</Typography>
          ) : (
            filteredFollowUps.map((lead) => {
              const revenue = parseFloat(lead.expected_revenue || 0);
              const formattedRevenue = revenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
              const isApproving = approvalLoadingId === lead.lead_id;
              
              return (
                <Box key={lead.lead_id} sx={{ ...styles.gridRow, borderLeft: `3px solid ${theme.accent}` }}>
                  
                  {/* Lead Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: theme.accent, width: 45, height: 45, fontSize: '1.2rem', fontWeight: 700, borderRadius: '12px' }}>
                      {getInitials(lead.company_name)}
                    </Avatar>
                    <Box overflow="hidden">
                      <Typography variant="h6" fontSize="1.05rem" fontWeight={600} noWrap>{lead.company_name}</Typography>
                      <Typography variant="body2" color={theme.textSecondary} noWrap>{lead.contact_person_name || "No Contact"}</Typography>
                    </Box>
                  </Box>

                  {/* Priority */}
                  <Box>
                    <Chip 
                      label={lead.lead_priority || 'Medium'} 
                      icon={getPriorityIcon(lead.lead_priority)} 
                      size="small" 
                      sx={{ ...getPriorityStyle(lead.lead_priority), fontWeight: 600, borderRadius: '8px', '& .MuiChip-icon': { color: 'inherit' } }} 
                    />
                  </Box>

                  {/* Lead Type */}
                  <Box>
                    <Chip 
                      label={lead.lead_type || 'N/A'} 
                      size="small" 
                      sx={{ ...getTypeBadge(lead.lead_type), fontWeight: 600, borderRadius: '8px' }} 
                    />
                  </Box>

                  {/* Expected Revenue */}
                  <Box>
                     <Typography variant="body2" fontWeight={600} color={theme.success}>
                       {formattedRevenue}
                     </Typography>
                  </Box>

                  {/* Activity Details */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, overflow: 'hidden' }}>
                    <CalendarTodayIcon sx={{ color: theme.accent, mt: 0.2, fontSize: 18 }} />
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="body2" fontWeight={600} color="white">
                        {formatFollowUpDate(lead.follow_up_date)} <span style={{ color: theme.textSecondary, fontWeight: 400 }}>at</span> {formatFollowUpTime(lead.follow_up_time)}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color={theme.textSecondary} 
                        sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                        title={lead.follow_up_reason}
                      >
                        {lead.follow_up_reason || "No reason provided"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => handleViewClick(lead.lead_id)}
                      startIcon={<VisibilityIcon />} 
                      sx={{ 
                        minWidth: 0,
                        borderColor: 'rgba(59, 130, 246, 0.4)', 
                        color: theme.accent, 
                        textTransform: 'none', 
                        borderRadius: '8px', 
                        '&:hover': { borderColor: theme.accent, bgcolor: 'rgba(59, 130, 246, 0.1)' } 
                      }}
                    >
                      View
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => handleOpenReschedule(lead)}
                      startIcon={<AccessTimeIcon />} 
                      sx={{ 
                        minWidth: 0,
                        borderColor: 'rgba(255,255,255,0.2)', 
                        color: theme.textSecondary, 
                        textTransform: 'none', 
                        borderRadius: '8px', 
                        '&:hover': { borderColor: 'white', color: 'white', bgcolor: 'rgba(255,255,255,0.05)' } 
                      }}
                    >
                      Reschedule
                    </Button>
                    <Button 
                      variant="contained" 
                      size="small" 
                      onClick={() => handleApprove(lead)}
                      disabled={isApproving}
                      startIcon={isApproving ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />} 
                      sx={{ 
                        minWidth: 0,
                        bgcolor: theme.success, 
                        textTransform: 'none', 
                        color: 'white', 
                        borderRadius: '8px', 
                        boxShadow: `0 4px 10px rgba(16, 185, 129, 0.2)`,
                        '&:hover': { bgcolor: '#059669' } 
                      }}
                    >
                      {isApproving ? 'Approving...' : 'Approve'}
                    </Button>
                  </Box>

                </Box>
              )
            })
          )}
        </Box>

        {/* --- MODAL: RESCHEDULE --- */}
        <Modal open={showRescheduleModal} onClose={() => setShowRescheduleModal(false)} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500, style: { backgroundColor: 'rgba(0,0,0,0.8)' } }}>
          <Fade in={showRescheduleModal}>
            <Box sx={styles.dateTimeBox}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={700} color="#fff">Re-schedule Follow-Up</Typography>
                <IconButton onClick={() => setShowRescheduleModal(false)} sx={{ color: theme.textSecondary }}><CloseIcon size={20} /></IconButton>
              </Box>
              <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 3 }}>
                Scheduling for <span style={{ color: theme.accent, fontWeight: 700 }}>{activeLead?.company_name}</span>
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: theme.accent, fontWeight: 700, mb: 1, display: 'block' }}>DATE</Typography>
                  <TextField 
                    fullWidth 
                    type="date" 
                    sx={styles.inputField} 
                    InputLabelProps={{ shrink: true }} 
                    value={rescheduleData.date}
                    onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: theme.accent, fontWeight: 700, mb: 1, display: 'block' }}>TIME</Typography>
                  <TextField 
                    fullWidth 
                    type="time" 
                    sx={styles.inputField} 
                    InputLabelProps={{ shrink: true }} 
                    value={rescheduleData.time}
                    onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: theme.accent, fontWeight: 700, mb: 1, display: 'block' }}>REASON FOR FOLLOW-UP</Typography>
                  <TextField 
                    fullWidth 
                    multiline 
                    rows={3} 
                    placeholder="Enter reason or next steps..." 
                    sx={styles.inputField} 
                    value={rescheduleData.reason}
                    onChange={(e) => setRescheduleData({...rescheduleData, reason: e.target.value})}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 5, display: 'flex', gap: 2 }}>
                <Button fullWidth onClick={() => setShowRescheduleModal(false)} sx={{ color: theme.textSecondary, textTransform: 'none' }}>
                  Cancel
                </Button>
                <Button 
                  fullWidth 
                  variant="contained" 
                  onClick={handleSubmitReschedule} 
                  disabled={rescheduleLoading}
                  sx={{ bgcolor: theme.accent, borderRadius: '12px', fontWeight: 700, textTransform: 'none' }}
                >
                  {rescheduleLoading ? <CircularProgress size={24} color="inherit" /> : 'Confirm Reschedule'}
                </Button>
              </Box>
            </Box>
          </Fade>
        </Modal>

      </Box>

      {/* Global Toast */}
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} variant="filled" sx={{ borderRadius: '12px' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CorporatePendingFollowup;