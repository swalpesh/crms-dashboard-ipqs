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
  Chip
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
const followUps = [
  {
    id: 1,
    company: "Mahindra & Mahindra",
    contact: "Mr. Rahul Sharma",
    avatarColor: theme.danger,
    avatarLetter: "M",
    priority: "High",
    type: "Product",
    status: "overdue", 
    date: "10 Jan 2026",
    activityType: "Scheduled"
  },
  {
    id: 2,
    company: "Renuka Logistics",
    contact: "Mrs. Priya Deshmukh",
    avatarColor: theme.info,
    avatarLetter: "R",
    priority: "Medium",
    type: "Service",
    status: "completed",
    date: "09 Jan 2026",
    activityType: "Conducted"
  },
  {
    id: 3,
    company: "Quantum Solutions",
    contact: "Amit Patel",
    avatarColor: theme.purple,
    avatarLetter: "Q",
    priority: "Low",
    type: "Product",
    status: "scheduled",
    date: "12 Jan 2026",
    activityType: "Scheduled"
  }
];

const PendingFollowup = () => {
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fix: Return ONLY styles object
  const getPriorityStyle = (priority) => {
    if (priority === 'High') return styles.badgeHigh;
    if (priority === 'Medium') return styles.badgeMed;
    return styles.badgeLow;
  };

  // Fix: Return ONLY the Icon component
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
        <Box sx={{ 
          ...styles.glassPanel, 
          display: 'flex', flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', alignItems: 'center', 
          p: 3, mb: 3, gap: 2 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" fontWeight={700}>Follow-Up's</Typography>
            <Chip label="12 Pending" sx={{ 
              bgcolor: 'rgba(255,255,255,0.1)', color: 'white', 
              border: theme.glassBorder, height: 28 
            }} />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', md: 'auto' } }}>
            <Box sx={styles.headerInput}>
              <SearchIcon sx={{ color: theme.textSecondary, mr: 1 }} />
              <InputBase placeholder="Search leads or contacts..." fullWidth sx={{ color: 'white' }} />
            </Box>

            <Select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)} 
              sx={styles.select}
              displayEmpty
            >
              <MenuItem value="all">All Priorities</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>

            <Select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)} 
              sx={styles.select}
              displayEmpty
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
            </Select>

            <Button variant="contained" startIcon={<AddIcon />} sx={{ 
              bgcolor: theme.accent, textTransform: 'none', borderRadius: '10px',
              '&:hover': { bgcolor: '#2563eb' }
            }}>
              New Follow-Up
            </Button>
          </Box>
        </Box>

        {/* --- List Header --- */}
        <Box sx={{ 
          display: { xs: 'none', md: 'grid' }, 
          gridTemplateColumns: '2.5fr 1fr 1fr 1.5fr 1.5fr', 
          px: 3, py: 1.5, mb: 1, 
          color: theme.textSecondary, fontSize: '0.85rem', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase'
        }}>
          <Box>Lead / Contact Person</Box>
          <Box>Priority</Box>
          <Box>Lead Type</Box>
          <Box>Activity Status</Box>
          <Box sx={{ textAlign: 'right' }}>Actions</Box>
        </Box>

        {/* --- List Items --- */}
        <Box>
          {followUps.map((item) => (
            <Box key={item.id} sx={{ 
              ...styles.gridRow,
              borderLeft: item.status === 'overdue' ? `3px solid ${theme.danger}` : theme.glassBorder,
              opacity: item.status === 'completed' ? 0.7 : 1,
            }}>
              
              {/* Column 1 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ 
                  bgcolor: item.avatarColor, width: 45, height: 45, 
                  fontSize: '1.2rem', fontWeight: 700, borderRadius: '12px' 
                }}>
                  {item.avatarLetter}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontSize="1.05rem" fontWeight={600}>{item.company}</Typography>
                  <Typography variant="body2" color={theme.textSecondary}>{item.contact}</Typography>
                </Box>
              </Box>

              {/* Column 2 */}
              <Box>
                <Chip 
                  label={item.priority} 
                  icon={getPriorityIcon(item.priority)} 
                  size="small" 
                  sx={{ 
                    ...getPriorityStyle(item.priority), 
                    fontWeight: 600, borderRadius: '8px', 
                    '& .MuiChip-icon': { color: 'inherit' } 
                  }} 
                />
              </Box>

              {/* Column 3 */}
              <Box>
                <Chip 
                  label={item.type} 
                  size="small" 
                  sx={{ ...getTypeBadge(item.type), fontWeight: 600, borderRadius: '8px' }} 
                />
              </Box>

              {/* Column 4 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {item.activityType === 'Conducted' 
                  ? <CheckCircleIcon sx={{ color: theme.success }} />
                  : <CalendarTodayIcon sx={{ color: item.status === 'overdue' ? theme.warning : theme.accent }} />
                }
                <Box>
                  <Typography variant="body2" fontWeight={600} color="white">{item.activityType}</Typography>
                  <Typography variant="caption" color={theme.textSecondary}>on {item.date}</Typography>
                </Box>
              </Box>

              {/* Column 5 */}
              <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                {item.status === 'completed' ? (
                  <>
                    <Typography variant="body2" color={theme.success} fontWeight={600} sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>Completed</Typography>
                    <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                      <VisibilityIcon sx={{ color: theme.textSecondary }} />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Button variant="contained" size="small" startIcon={<CheckIcon />} sx={{ 
                      bgcolor: theme.success, textTransform: 'none', color: 'white', borderRadius: '8px', 
                      '&:hover': { bgcolor: '#059669' }
                    }}>
                      Conducted
                    </Button>
                    <Button variant="outlined" size="small" startIcon={<AccessTimeIcon />} sx={{ 
                      borderColor: 'rgba(255,255,255,0.2)', color: theme.textSecondary, textTransform: 'none', borderRadius: '8px',
                      '&:hover': { borderColor: 'white', color: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
                    }}>
                      Re-schedule
                    </Button>
                  </>
                )}
              </Box>

            </Box>
          ))}
        </Box>

      </Box>
    </Box>
  );
};

export default PendingFollowup;