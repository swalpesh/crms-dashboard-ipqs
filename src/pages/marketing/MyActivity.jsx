import React, { useState, useEffect, useRef } from 'react';
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
  Fade
} from '@mui/material';

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
  X
} from "@phosphor-icons/react";

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
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
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

const ActivityCard = ({ status, time, title, purpose, contact, phone, location, email, isActive }) => {
  let statusColor = themeColors.textSecondary;
  let badgeText = "Pending";

  if (isActive) {
    statusColor = themeColors.success;
    badgeText = "In Progress";
  } else if (status === 'scheduled') {
    statusColor = themeColors.blue;
    badgeText = "Next Stop";
  }

  return (
    <Box sx={{ ...styles.glassCard, ...(isActive ? { border: `1px solid rgba(0, 184, 148, 0.4)`, boxShadow: `0 0 20px rgba(0, 184, 148, 0.15)` } : {}) }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: statusColor, fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
          {isActive ? <Box sx={{ width: 10, height: 10, bgcolor: themeColors.success, borderRadius: '50%', boxShadow: `0 0 10px ${themeColors.success}` }} /> : <Clock size={18} weight="fill" />}
          {isActive ? 'In Progress' : time}
        </Box>
        <Chip label={isActive ? `Started at ${time}` : badgeText} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} />
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
        {isActive ? (
          <>
            <Button fullWidth variant="outlined" sx={{ borderColor: themeColors.success, color: themeColors.success }}>Reached</Button>
            <Button fullWidth variant="contained" sx={{ bgcolor: themeColors.blue }}>End Visit</Button>
          </>
        ) : (
          <Button fullWidth variant="contained" startIcon={<Play weight="fill" />} sx={{ bgcolor: themeColors.blue, py: 1.5, fontWeight: 700 }}>Start Visit</Button>
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
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#eee' }}>{value}</Typography>
    </Box>
  </Box>
);

// --- MAIN COMPONENT ---
const MyActivity = () => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const [activeTab, setActiveTab] = useState(0); 
  const [dateRange, setDateRange] = useState([]);
  const [baseDate, setBaseDate] = useState(new Date());
  const [openModal, setOpenModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const timerRef = useRef(null);

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
        isActualToday: d.toDateString() === new Date().toDateString()
      });
    }
    setDateRange(range);
  }, [baseDate]);

  const shiftDate = (amount) => {
    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() + amount);
    setBaseDate(newDate);
  };

  const handleOpenSchedule = (lead) => { setSelectedLead(lead); setOpenModal(true); };
  const handleCloseModal = () => { setOpenModal(false); setSelectedLead(null); };

  // Mock data representing leads for planning and completed visits
  const leadsData = [
    { id: 1, company: "Mahindra & Mahindra", contact: "Mr. Rahul Sharma", location: "Nashik, Maharashtra", type: "Product", status: "Negotiation", logo: "M", logoColor: "#ef4444" },
    { id: 2, company: "Renuka Logistics", contact: "Mrs. Priya Deshmukh", location: "Pune, Maharashtra", type: "Service", status: "New", logo: "R", logoColor: "#3b82f6" }
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: themeColors.bgGradient, color: themeColors.textPrimary, p: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: '850px', mx: 'auto', pb: 5 }}>
        
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeColors.textSecondary }}><Typography variant="body2">Dashboard</Typography><CaretRight size={14} /><Typography variant="body2" color="#fff" fontWeight={600}>My Activity</Typography></Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(255,255,255,0.1)', py: 0.5, px: 1, borderRadius: '30px', border: themeColors.glassBorder }}>
            <Avatar src="https://ui-avatars.com/api/?name=Rahul+J&background=0984e3&color=fff" sx={{ width: 28, height: 28 }} />
            <Typography variant="body2" fontWeight={600}>Rahul Jadhav</Typography>
          </Box>
        </Box>

        {/* Calendar Row */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 4 }}>
          <Box sx={{ ...styles.glassCard, flex: 1, mb: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}><Typography variant="subtitle1" fontWeight={700}>Daily Target</Typography><Chip icon={<Trophy weight="fill" color={themeColors.success} />} label="Great Job!" size="small" sx={{ bgcolor: 'rgba(0, 184, 148, 0.15)', color: themeColors.success, fontWeight: 700 }} /></Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Box sx={{ flex: 1, height: 8, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}><Box sx={{ width: '60%', height: '100%', bgcolor: themeColors.success, boxShadow: `0 0 10px ${themeColors.success}` }} /></Box><Typography fontWeight={800}>3/5</Typography></Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', bgcolor: 'rgba(0,0,0,0.2)', p: 1, borderRadius: '20px', border: themeColors.glassBorder, justifyContent: 'space-between' }}>
            <IconButton onClick={() => shiftDate(-1)} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}><CaretLeft size={20} weight="bold" /></IconButton>
            <Box sx={{ display: 'flex', gap: 1 }}>{dateRange.map((item, idx) => (<DateItem key={idx} day={item.day} date={item.date} active={item.isActualToday} />))}</Box>
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
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
             <ActivityCard isActive time="10:30 AM" title="Tata Power" purpose="Substation Inspection" contact="Rajesh Kumar" phone="+91 98765 43210" location="Sector 18, Noida" email="r.kumar@tatapower.com" />
             <ActivityCard status="scheduled" time="02:00 PM" title="Mahindra Auto" purpose="Maintenance" contact="Amit Singh" phone="+91 98112 23344" location="Jaipur, Rajasthan" email="amit.singh@mahindra.com" />
          </Box>
        )}

        {(activeTab === 1 || activeTab === 2) && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!isMobile && (
              <Box sx={{ display: 'flex', px: 3, mb: 1, color: themeColors.textSecondary, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                <Box sx={{ flex: 2.5 }}>Company Name</Box><Box sx={{ flex: 1.5 }}>Location</Box><Box sx={{ flex: 0.8 }}>Type</Box><Box sx={{ flex: 0.8 }}>Status</Box><Box sx={{ flex: 0.5, textAlign: 'right' }}>Action</Box>
              </Box>
            )}
            {leadsData.map((lead) => (
              <Box key={lead.id} sx={{ ...styles.glassCard, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', p: 2, mb: 1.5, gap: 2 }}>
                <Box sx={{ flex: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: lead.logoColor }}>{lead.logo}</Avatar>
                  <Box><Typography fontWeight={600}>{lead.company}</Typography><Typography variant="caption" sx={{ color: themeColors.textSecondary }}>{lead.contact}</Typography></Box>
                </Box>
                <Box sx={{ flex: 1.5, fontSize: '0.85rem' }}><MapPin size={16} /> {lead.location}</Box>
                <Box sx={{ flex: 0.8 }}><Chip label={lead.type} size="small" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: themeColors.blue }} /></Box>
                <Box sx={{ flex: 0.8 }}><Chip label={lead.status} size="small" sx={{ bgcolor: 'rgba(249, 115, 22, 0.1)', color: themeColors.warning }} /></Box>
                <Box sx={{ flex: 0.5, textAlign: 'right', width: isMobile ? '100%' : 'auto' }}>
                  {activeTab === 1 ? (
                    <Button onClick={() => handleOpenSchedule(lead)} variant="outlined" startIcon={<CalendarPlus weight="fill" />} sx={{ textTransform: 'none', color: '#fff', borderColor: 'rgba(255,255,255,0.2)', width: isMobile ? '100%' : 'auto' }}>Schedule</Button>
                  ) : (
                    /* Completed Indicator */
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, color: themeColors.success }}>
                      <CheckCircle weight="fill" size={20} /><Typography variant="body2" fontWeight={700}>Completed</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* --- Schedule Modal Popup --- */}
      <Modal open={openModal} onClose={handleCloseModal} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500, style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' } }}>
        <Fade in={openModal}>
          <Box sx={styles.modalBox}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}><Typography variant="h6" fontWeight={700} color="#fff">Schedule Visit</Typography><IconButton onClick={handleCloseModal} sx={{ color: themeColors.textSecondary }}><X size={20} /></IconButton></Box>
            <Typography variant="body2" sx={{ color: themeColors.textSecondary, mb: 3 }}>Scheduling visit for <span style={{ color: themeColors.blue, fontWeight: 700 }}>{selectedLead?.company}</span></Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}><Typography variant="caption" sx={{ color: themeColors.blue, fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>Select Date</Typography><TextField fullWidth type="date" sx={styles.inputField} InputLabelProps={{ shrink: true }} /></Grid>
              <Grid item xs={12}><Typography variant="caption" sx={{ color: themeColors.blue, fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>Select Time</Typography><TextField fullWidth type="time" sx={styles.inputField} InputLabelProps={{ shrink: true }} /></Grid>
            </Grid>
            <Box sx={{ mt: 5, display: 'flex', gap: 2 }}><Button fullWidth onClick={handleCloseModal} sx={{ color: themeColors.textSecondary, textTransform: 'none' }}>Cancel</Button><Button fullWidth variant="contained" onClick={handleCloseModal} sx={{ bgcolor: themeColors.blue, py: 1.5, borderRadius: '12px', fontWeight: 700, textTransform: 'none' }}>Confirm Schedule</Button></Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default MyActivity;