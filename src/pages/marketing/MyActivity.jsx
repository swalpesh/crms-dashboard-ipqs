import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  IconButton,
  LinearProgress,
} from '@mui/material';

// Phosphor Icons
import {
  CaretRight,
  Trophy,
  User,
  Phone,
  MapPin,
  Envelope,
  CheckCircle,
  Play,
  Clock,
  CalendarCheck
} from "@phosphor-icons/react";

// --- THEME CONSTANTS ---
const theme = {
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
    background: theme.glassBg,
    backdropFilter: 'blur(16px)',
    border: theme.glassBorder,
    borderRadius: '16px',
    boxShadow: theme.glassShadow,
    p: 2.5,
    mb: 3,
    color: theme.textPrimary,
    transition: 'transform 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      background: 'rgba(255, 255, 255, 0.07)',
    }
  },
  activeCard: {
    border: `1px solid rgba(0, 184, 148, 0.4)`,
    boxShadow: `0 0 20px rgba(0, 184, 148, 0.15)`,
  },
  tabBtn: {
    textTransform: 'none',
    color: theme.textSecondary,
    borderRadius: '8px',
    px: 2.5,
    py: 1.2,
    fontSize: '0.9rem',
    fontWeight: 500,
    display: 'flex',
    gap: 1.5,
    '&.Mui-selected': {
      bgcolor: theme.blue,
      color: '#fff',
      boxShadow: '0 4px 15px rgba(9, 132, 227, 0.3)',
    },
    '&:hover': {
      bgcolor: 'rgba(255, 255, 255, 0.05)',
    }
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
  }
};

// --- SUB-COMPONENTS ---

const DateItem = ({ day, date, active }) => (
  <Box sx={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    width: 60, height: 70,
    bgcolor: active ? theme.blue : 'rgba(0,0,0,0.2)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: active ? '0 0 15px rgba(9, 132, 227, 0.4)' : 'none',
    border: active ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent'
  }}>
    <Typography sx={{ fontSize: '0.7rem', color: active ? '#fff' : theme.textSecondary }}>{day}</Typography>
    <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{date}</Typography>
  </Box>
);

const ActivityCard = ({ status, time, title, purpose, contact, phone, location, email, isActive }) => {
  let statusColor = theme.textSecondary;
  let statusBg = 'rgba(255,255,255,0.1)';
  let statusIcon = <Clock size={16} />;
  let badgeText = "Pending";

  if (isActive) {
    statusColor = theme.success;
    statusBg = 'rgba(0, 184, 148, 0.1)'; // Fixed typo from 'bg'
    statusIcon = <span className="pulse-dot" style={{
      width: 8, height: 8, borderRadius: '50%', bgcolor: theme.success,
      boxShadow: `0 0 0 rgba(0, 184, 148, 0.7)`
    }} />;
    badgeText = "In Progress";
  } else if (status === 'scheduled') {
    statusColor = theme.blue;
    statusBg = 'rgba(9, 132, 227, 0.1)'; // Fixed typo
    badgeText = "Next Stop";
  }

  return (
    <Box sx={{ ...styles.glassCard, ...(isActive ? styles.activeCard : {}) }}>
      {/* Header Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ 
          display: 'flex', alignItems: 'center', gap: 1, 
          color: statusColor, fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' 
        }}>
          {isActive && (
            <Box sx={{
              width: 8, height: 8, bgcolor: theme.success, borderRadius: '50%',
              boxShadow: `0 0 0 4px rgba(0, 184, 148, 0.2)`,
              animation: 'pulse 2s infinite'
            }} />
          )}
          {!isActive && <Clock size={16} weight="fill" />}
          {isActive ? 'In Progress' : time}
        </Box>
        <Chip label={isActive ? `Started at ${time}` : badgeText} size="small" sx={{ 
          bgcolor: 'rgba(255,255,255,0.1)', color: theme.textSecondary, borderRadius: '6px', height: 24, fontSize: '0.75rem' 
        }} />
      </Box>

      {/* Title */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>{title}</Typography>
      <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 3 }}>{purpose}</Typography>

      {/* Grid Info */}
      <Grid container spacing={2} sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 2.5, borderRadius: '12px', mb: 3 }}>
        <Grid item xs={6}>
          <InfoItem icon={<User size={18} />} label="Contact" value={contact} />
        </Grid>
        <Grid item xs={6}>
          <InfoItem icon={<Phone size={18} />} label="Phone" value={phone} />
        </Grid>
        <Grid item xs={12}>
          <InfoItem icon={<MapPin size={18} />} label="Location" value={location} />
        </Grid>
        <Grid item xs={12}>
          <InfoItem icon={<Envelope size={18} />} label="Email" value={email} />
        </Grid>
      </Grid>

      {/* Buttons */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {isActive ? (
          <>
            <Button fullWidth variant="outlined" startIcon={<CheckCircle weight="fill" />} sx={{ 
              borderColor: theme.success, color: theme.success, bgcolor: 'rgba(0, 184, 148, 0.1)', 
              '&:hover': { bgcolor: 'rgba(0, 184, 148, 0.2)', borderColor: theme.success }
            }}>
              Reached
            </Button>
            <Button fullWidth variant="contained" sx={{ bgcolor: theme.blue }}>End Visit</Button>
          </>
        ) : (
          <Button fullWidth variant="contained" startIcon={<Play weight="fill" />} sx={{ 
            bgcolor: theme.blue, '&:hover': { bgcolor: '#0074d9' }, py: 1.2 
          }}>
            Start Visit
          </Button>
        )}
      </Box>
    </Box>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
    <Box sx={{ 
      width: 36, height: 36, borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.05)', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.blue 
    }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="caption" sx={{ color: theme.textSecondary, display: 'block', lineHeight: 1 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
    </Box>
  </Box>
);

// --- MAIN COMPONENT ---
const MyActivity = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: theme.bgGradient, 
      color: theme.textPrimary,
      fontFamily: "'Inter', sans-serif",
      p: { xs: 2, md: 3 }
    }}>
      
      <Box sx={{ maxWidth: '850px', mx: 'auto', pb: 5 }}>
        
        {/* --- Header --- */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.textSecondary, fontSize: '0.9rem' }}>
            <span>Dashboard</span> 
            <CaretRight size={14} /> 
            <span style={{ color: '#fff', fontWeight: 600 }}>My Activity</span>
          </Box>
          <Box sx={{ 
            display: 'flex', alignItems: 'center', gap: 1.5, 
            bgcolor: 'rgba(255,255,255,0.1)', py: 0.5, px: 0.5, pr: 2, 
            borderRadius: '30px', border: theme.glassBorder 
          }}>
            <Avatar src="https://ui-avatars.com/api/?name=Rahul+S&background=random" sx={{ width: 32, height: 32 }} />
            <Typography variant="body2" fontWeight={500}>Rahul Jadhav</Typography>
          </Box>
        </Box>

        {/* --- Stats Row --- */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 4 }}>
          
          {/* Target Card */}
          <Box sx={{ ...styles.glassCard, flex: 1, mb: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={600}>Daily Target</Typography>
                <Typography variant="caption" color={theme.textSecondary}>Visits Completed</Typography>
              </Box>
              <Chip icon={<Trophy weight="fill" style={{ color: theme.success }} />} label="Great Job!" size="small" sx={{ 
                bgcolor: 'rgba(0, 184, 148, 0.2)', color: theme.success, fontWeight: 600, border: '1px solid rgba(0, 184, 148, 0.3)' 
              }} />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1, height: 8, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ width: '60%', height: '100%', bgcolor: theme.success, boxShadow: `0 0 10px rgba(0, 184, 148, 0.5)` }} />
              </Box>
              <Typography fontWeight={700}>3/5 Visits</Typography>
            </Box>
          </Box>

          {/* Date Selector */}
          <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
            <DateItem day="MON" date="26" />
            <DateItem day="TUE" date="27" />
            <DateItem day="WED" date="28" active />
            <DateItem day="THU" date="29" />
            <DateItem day="FRI" date="30" />
          </Box>
        </Box>

        {/* --- Tabs --- */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Box sx={{ 
            display: 'inline-flex', gap: 1, p: 0.8, 
            bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '14px', border: theme.glassBorder 
          }}>
            <Button onClick={() => setActiveTab(0)} sx={{ ...styles.tabBtn, bgcolor: activeTab === 0 ? theme.blue : 'transparent', color: activeTab === 0 ? '#fff' : theme.textSecondary }}>
              <Box sx={{ ...styles.tabNumber, bgcolor: activeTab === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)' }}>1</Box> Scheduled
            </Button>
            <Button onClick={() => setActiveTab(1)} sx={{ ...styles.tabBtn, bgcolor: activeTab === 1 ? theme.blue : 'transparent', color: activeTab === 1 ? '#fff' : theme.textSecondary }}>
              <Box sx={{ ...styles.tabNumber, bgcolor: activeTab === 1 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)' }}>2</Box> Plan Visit
            </Button>
            <Button onClick={() => setActiveTab(2)} sx={{ ...styles.tabBtn, bgcolor: activeTab === 2 ? theme.blue : 'transparent', color: activeTab === 2 ? '#fff' : theme.textSecondary }}>
              <Box sx={{ ...styles.tabNumber, bgcolor: activeTab === 2 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)' }}>3</Box> Completed
            </Button>
          </Box>
        </Box>

        {/* --- List Header --- */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>My Activity</Typography>
          <Chip label="4 Scheduled" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: theme.textSecondary }} />
        </Box>

        {/* --- Cards List --- */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          <ActivityCard 
            isActive
            time="10:30 AM"
            title="Tata Power"
            purpose="Substation Unit 4 Inspection"
            contact="Rajesh Kumar"
            phone="+91 98765 43210"
            location="Sector 18, Noida, Uttar Pradesh"
            email="r.kumar@tatapower.com"
          />

          <ActivityCard 
            status="scheduled"
            time="02:00 PM"
            title="Mahindra Auto"
            purpose="Preventive Maintenance - Assembly Line B"
            contact="Amit Singh"
            phone="+91 98112 23344"
            location="Mahindra Zone, Jaipur, Rajasthan"
            email="amit.singh@mahindra.com"
          />

          <ActivityCard 
            status="pending"
            time="04:30 PM"
            title="Green Energy Park"
            purpose="Solar Inverter Annual Inspection"
            contact="Priya Verma"
            phone="+91 99887 76655"
            location="Solar City, Gurugram, Haryana"
            email="p.verma@greenenergy.com"
          />

          <ActivityCard 
            status="pending"
            time="06:00 PM"
            title="DLF CyberHub"
            purpose="Emergency Generator Check - Block C"
            contact="Suresh Reddy"
            phone="+91 88776 65544"
            location="DLF Phase 2, Gurugram"
            email="admin@dlfcyber.com"
          />

        </Box>

      </Box>
    </Box>
  );
};

export default MyActivity;