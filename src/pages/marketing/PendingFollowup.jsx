import React, { useState } from 'react';
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
  Modal,
  TextField,
  Grid,
  Backdrop,
  Fade
} from '@mui/material';

// Material UI Icons
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckIcon from '@mui/icons-material/Check';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// --- THEME CONSTANTS ---
const theme = {
  bgGradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  glassBg: 'rgba(255, 255, 255, 0.04)',
  glassBorder: '1px solid rgba(255, 255, 255, 0.1)',
  glassShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  accent: '#3b82f6',
  success: '#00b894',
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
  modalStyle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', sm: 600 },
    maxHeight: '80vh',
    bgcolor: '#12122b',
    border: theme.glassBorder,
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    borderRadius: '24px',
    p: 4,
    overflowY: 'auto',
    outline: 'none'
  },
  dateTimeBox: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 450 }, // Slightly wider to accommodate multiline
    bgcolor: '#1a1a35',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.1)',
    p: 4,
    outline: 'none'
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
    gridTemplateColumns: { xs: '1fr', md: '2.5fr 1fr 1fr 1.5fr 1.5fr' },
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
  badgeHigh: { bgcolor: 'rgba(231, 76, 60, 0.2)', color: theme.danger, border: `1px solid rgba(231, 76, 60, 0.3)` },
  badgeMed: { bgcolor: 'rgba(241, 196, 15, 0.2)', color: theme.warning, border: `1px solid rgba(241, 196, 15, 0.3)` },
  badgeLow: { bgcolor: 'rgba(52, 152, 219, 0.2)', color: theme.info, border: `1px solid rgba(52, 152, 219, 0.3)` },
  typeProduct: { bgcolor: 'rgba(155, 89, 182, 0.2)', color: theme.purple, border: `1px solid rgba(155, 89, 182, 0.3)` },
  typeService: { bgcolor: 'rgba(46, 204, 113, 0.2)', color: theme.teal, border: `1px solid rgba(46, 204, 113, 0.3)` },
};

// --- MOCK DATA ---
const initialFollowUps = [
  { id: 1, company: "Mahindra & Mahindra", contact: "Mr. Rahul Sharma", avatarColor: theme.danger, avatarLetter: "M", priority: "High", type: "Product", status: "overdue", date: "10 Jan 2026", activityType: "Scheduled" },
  { id: 2, company: "Renuka Logistics", contact: "Mrs. Priya Deshmukh", avatarColor: theme.info, avatarLetter: "R", priority: "Medium", type: "Service", status: "completed", date: "09 Jan 2026", activityType: "Conducted" },
  { id: 3, company: "Quantum Solutions", contact: "Amit Patel", avatarColor: theme.purple, avatarLetter: "Q", priority: "Low", type: "Product", status: "scheduled", date: "12 Jan 2026", activityType: "Scheduled" }
];

const mockLeads = [
  { id: 101, company: "Tata Motors", contact: "Suresh P.", logo: "T", color: "#e74c3c" },
  { id: 102, company: "Infosys Ltd", contact: "Anjali M.", logo: "I", color: "#3498db" },
  { id: 103, company: "Reliance Ind.", contact: "Vikram S.", logo: "R", color: "#f1c40f" },
];

const PendingFollowup = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modal states
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const [activeLead, setActiveLead] = useState(null);

  // --- Filtering Logic ---
  const filteredFollowUps = initialFollowUps.filter(item => {
    const matchesSearch = item.company.toLowerCase().includes(searchQuery.toLowerCase()) || item.contact.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || item.priority.toLowerCase() === filterPriority;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleOpenLeadModal = () => setShowLeadModal(true);
  const handleCloseLeadModal = () => setShowLeadModal(false);

  const handleOpenSchedule = (lead) => {
    setActiveLead(lead);
    setShowDateTimeModal(true);
  };

  const getPriorityStyle = (priority) => {
    if (priority === 'High') return styles.badgeHigh;
    if (priority === 'Medium') return styles.badgeMed;
    return styles.badgeLow;
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'High') return <WhatshotIcon sx={{ fontSize: 16 }} />;
    return undefined;
  };

  const getTypeBadge = (type) => {
    return type === 'Product' ? styles.typeProduct : styles.typeService;
  };

  return (
    <Box sx={styles.container}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        
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

            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} sx={styles.select} displayEmpty>
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
            </Select>

            <Button onClick={handleOpenLeadModal} variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: theme.accent, textTransform: 'none', borderRadius: '10px', '&:hover': { bgcolor: '#2563eb' } }}>
              New Follow-Up
            </Button>
          </Box>
        </Box>

        {/* --- List Header --- */}
        <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateColumns: '2.5fr 1fr 1fr 1.5fr 1.5fr', px: 3, py: 1.5, mb: 1, color: theme.textSecondary, fontSize: '0.85rem', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          <Box>Lead / Contact Person</Box><Box>Priority</Box><Box>Lead Type</Box><Box>Activity Status</Box><Box sx={{ textAlign: 'right' }}>Actions</Box>
        </Box>

        {/* --- List Items --- */}
        <Box>
          {filteredFollowUps.map((item) => (
            <Box key={item.id} sx={{ ...styles.gridRow, borderLeft: item.status === 'overdue' ? `3px solid ${theme.danger}` : theme.glassBorder, opacity: item.status === 'completed' ? 0.7 : 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: item.avatarColor, width: 45, height: 45, fontSize: '1.2rem', fontWeight: 700, borderRadius: '12px' }}>{item.avatarLetter}</Avatar>
                <Box><Typography variant="h6" fontSize="1.05rem" fontWeight={600}>{item.company}</Typography><Typography variant="body2" color={theme.textSecondary}>{item.contact}</Typography></Box>
              </Box>
              <Box><Chip label={item.priority} icon={getPriorityIcon(item.priority)} size="small" sx={{ ...getPriorityStyle(item.priority), fontWeight: 600, borderRadius: '8px', '& .MuiChip-icon': { color: 'inherit' } }} /></Box>
              <Box><Chip label={item.type} size="small" sx={{ ...getTypeBadge(item.type), fontWeight: 600, borderRadius: '8px' }} /></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {item.activityType === 'Conducted' ? <CheckCircleIcon sx={{ color: theme.success }} /> : <CalendarTodayIcon sx={{ color: item.status === 'overdue' ? theme.warning : theme.accent }} />}
                <Box><Typography variant="body2" fontWeight={600} color="white">{item.activityType}</Typography><Typography variant="caption" color={theme.textSecondary}>on {item.date}</Typography></Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                {item.status === 'completed' ? (
                  <><Typography variant="body2" color={theme.success} fontWeight={600} sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>Completed</Typography><IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}><VisibilityIcon sx={{ color: theme.textSecondary }} /></IconButton></>
                ) : (
                  <><Button variant="contained" size="small" startIcon={<CheckIcon />} sx={{ bgcolor: theme.success, textTransform: 'none', color: 'white', borderRadius: '8px', '&:hover': { bgcolor: '#059669' } }}>Conducted</Button><Button variant="outlined" size="small" startIcon={<AccessTimeIcon />} sx={{ borderColor: 'rgba(255,255,255,0.2)', color: theme.textSecondary, textTransform: 'none', borderRadius: '8px', '&:hover': { borderColor: 'white', color: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}>Re-schedule</Button></>
                )}
              </Box>
            </Box>
          ))}
        </Box>

        {/* --- MODAL 1: SELECT LEAD --- */}
        <Modal open={showLeadModal} onClose={handleCloseLeadModal} closeAfterTransition>
          <Fade in={showLeadModal}>
            <Box sx={styles.modalStyle}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" fontWeight={700} color="#fff">Available Leads</Typography>
                <IconButton onClick={handleCloseLeadModal} sx={{ color: '#fff' }}><CloseIcon /></IconButton>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {mockLeads.map((lead) => (
                  <Box key={lead.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: lead.color, fontWeight: 700 }}>{lead.logo}</Avatar>
                      <Box><Typography fontWeight={600} color="#fff">{lead.company}</Typography><Typography variant="caption" color={theme.textSecondary}>{lead.contact}</Typography></Box>
                    </Box>
                    <Button variant="outlined" size="small" startIcon={<CalendarMonthIcon />} onClick={() => handleOpenSchedule(lead)} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)', textTransform: 'none', '&:hover': { bgcolor: theme.accent, borderColor: theme.accent } }}>Schedule</Button>
                  </Box>
                ))}
              </Box>
            </Box>
          </Fade>
        </Modal>

        {/* --- MODAL 2: SELECT DATE, TIME & REASON --- */}
        <Modal open={showDateTimeModal} onClose={() => setShowDateTimeModal(false)} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500, style: { backgroundColor: 'rgba(0,0,0,0.8)' } }}>
          <Fade in={showDateTimeModal}>
            <Box sx={styles.dateTimeBox}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={700} color="#fff">Set Follow-Up</Typography>
                <IconButton onClick={() => setShowDateTimeModal(false)} sx={{ color: theme.textSecondary }}><CloseIcon size={20} /></IconButton>
              </Box>
              <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 3 }}>Scheduling for <span style={{ color: theme.accent, fontWeight: 700 }}>{activeLead?.company}</span></Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: theme.accent, fontWeight: 700, mb: 1, display: 'block' }}>DATE</Typography>
                  <TextField fullWidth type="date" sx={styles.inputField} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: theme.accent, fontWeight: 700, mb: 1, display: 'block' }}>TIME</Typography>
                  <TextField fullWidth type="time" sx={styles.inputField} InputLabelProps={{ shrink: true }} />
                </Grid>
                {/* NEW REASON FIELD */}
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: theme.accent, fontWeight: 700, mb: 1, display: 'block' }}>REASON FOR FOLLOW-UP</Typography>
                  <TextField 
                    fullWidth 
                    multiline 
                    rows={3} 
                    placeholder="Enter reason or next steps..." 
                    sx={styles.inputField} 
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 5, display: 'flex', gap: 2 }}>
                <Button fullWidth onClick={() => setShowDateTimeModal(false)} sx={{ color: theme.textSecondary, textTransform: 'none' }}>Cancel</Button>
                <Button fullWidth variant="contained" onClick={() => { setShowDateTimeModal(false); setShowLeadModal(false); }} sx={{ bgcolor: theme.accent, borderRadius: '12px', fontWeight: 700, textTransform: 'none' }}>Confirm</Button>
              </Box>
            </Box>
          </Fade>
        </Modal>

      </Box>
    </Box>
  );
};

export default PendingFollowup;