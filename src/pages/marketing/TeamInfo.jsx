import React, { useState } from 'react';
import { 
  Box, Card, Avatar, Typography, Badge, Chip, 
  Tabs, Tab, TextField, InputAdornment, 
  LinearProgress, IconButton, Stack, Divider 
} from '@mui/material';
import { 
  Search, Phone, ChatBubble, Map, History, 
  LocationOn, CheckCircle, AccessTime 
} from '@mui/icons-material';

// --- THEME CONSTANTS ---
const COLORS = {
  bgDeep: '#584f6e',
  bgPurpleMid: '#3b1b1b',
  bgPurpleLight: '#3a2a65',
  glassBg: 'rgba(35, 11, 49, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  active: '#10b981',
  break: '#f59e0b',
  inactive: '#9ca3af'
};

// --- DATA ---
const teamData = [
  {
    id: 1,
    name: "Tushar Ahire",
    role: "Technical Person",
    status: "ACTIVE",
    location: "Near Sector 4 Pune Metro",
    lastUpdated: "2 mins ago",
    progress: 65,
    visits: [
      { time: "09:00 AM", task: "Meter Repair", type: "done" },
      { time: "11:30 AM", task: "Cabling Inspection", type: "current" },
      { time: "03:00 PM", task: "Voltage Check", type: "future" }
    ]
  },
  {
    id: 2,
    name: "Akshay T.",
    role: "Field Engineer",
    status: "CLOCKED OUT",
    location: "Silverline Pune",
    lastUpdated: "8h ago",
    progress: 100,
    visits: [
      { time: "10:00 AM", task: "Warehouse Check", type: "done" },
      { time: "01:00 PM", task: "Client Meeting", type: "done" }
    ]
  },
  {
    id: 3,
    name: "Piyush",
    role: "Technical Engineer",
    status: "ON BREAK",
    location: "Industrial Park, Site B",
    lastUpdated: "1 min ago",
    progress: 45,
    visits: [
      { time: "08:30 AM", task: "Safety Briefing", type: "done" },
      { time: "10:00 AM", task: "Transformer Install", type: "done" },
      { time: "02:00 PM", task: "System Diagnostics", type: "future" }
    ]
  }
];

// --- SUB-COMPONENT: TEAM CARD ---
const TeamCard = ({ member }) => {
  const isInactive = member.status === 'CLOCKED OUT';
  
  const statusConfig = {
    'ACTIVE': { color: COLORS.active, glow: `linear-gradient(90deg, ${COLORS.active}, transparent)` },
    'CLOCKED OUT': { color: COLORS.inactive, glow: `linear-gradient(90deg, ${COLORS.inactive}, transparent)` },
    'ON BREAK': { color: COLORS.break, glow: `linear-gradient(90deg, ${COLORS.break}, transparent)` }
  };

  return (
    <Card sx={{
      background: COLORS.glassBg,
      backdropFilter: 'blur(16px)',
      borderRadius: '24px',
      border: `1px solid ${COLORS.glassBorder}`,
      p: 3,
      position: 'relative',
      transition: '0.3s',
      '&:hover': { transform: 'translateY(-5px)', borderColor: 'rgba(255,255,255,0.3)' },
      overflow: 'visible'
    }}>
      {/* Glow Line */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: statusConfig[member.status].glow }} />

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Stack direction="row" spacing={2}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            sx={{ '& .MuiBadge-badge': { backgroundColor: statusConfig[member.status].color, border: '2px solid #1a1625' }}}
          >
            <Avatar 
              sx={{ width: 56, height: 56, bgcolor: '#1a1625', border: '2px solid #444', filter: isInactive ? 'grayscale(1)' : 'none' }}
            >
              {member.name[0]}
            </Avatar>
          </Badge>
          <Box>
            <Typography variant="h6" fontWeight="bold" color={isInactive ? 'text.secondary' : 'white'}>
              {member.name}
            </Typography>
            <Typography variant="caption" color="grey.500" sx={{ letterSpacing: 1, textTransform: 'uppercase' }}>
              {member.role}
            </Typography>
          </Box>
        </Stack>
        <Chip 
          label={member.status} 
          size="small" 
          sx={{ 
            bgcolor: `${statusConfig[member.status].color}22`, 
            color: statusConfig[member.status].color,
            border: `1px solid ${statusConfig[member.status].color}55`,
            fontWeight: 'bold', fontSize: '0.65rem'
          }} 
        />
      </Stack>

      {/* Location */}
      <Box sx={{ display: 'flex', gap: 1.5, bgcolor: 'rgba(255,255,255,0.03)', p: 1.5, borderRadius: '12px', mb: 3 }}>
        <LocationOn sx={{ color: isInactive ? 'grey.600' : 'secondary.light', fontSize: 20 }} />
        <Box>
          <Typography variant="body2" color="grey.300">{member.location}</Typography>
          <Typography variant="caption" color="grey.600">Last updated: {member.lastUpdated}</Typography>
        </Box>
      </Box>

      {/* Timeline */}
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="caption" color="grey.500" fontWeight="bold" display="block" mb={2}>TODAY'S VISIT PLAN</Typography>
        {member.visits.map((visit, idx) => (
          <Stack key={idx} direction="row" spacing={2} sx={{ position: 'relative', pb: 2 }}>
            {idx !== member.visits.length - 1 && (
              <Box sx={{ position: 'absolute', left: 9, top: 24, bottom: 0, width: '1px', bgcolor: 'rgba(255,255,255,0.1)' }} />
            )}
            <Box sx={{ 
              zIndex: 1, width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: '#1a1625', border: `1px solid ${visit.type === 'done' ? COLORS.active : visit.type === 'current' ? COLORS.active : '#555'}`,
              color: visit.type === 'done' ? COLORS.active : 'grey.600'
            }}>
              {visit.type === 'done' ? <CheckCircle sx={{ fontSize: 12 }} /> : <AccessTime sx={{ fontSize: 12 }} />}
            </Box>
            <Box>
              <Typography variant="caption" color={visit.type === 'current' ? 'info.main' : 'grey.600'} sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                {visit.time}
              </Typography>
              <Typography variant="body2" sx={{ color: visit.type === 'done' ? 'grey.600' : 'white', textDecoration: visit.type === 'done' ? 'line-through' : 'none' }}>
                {visit.task}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Box>

      {/* Footer */}
      <Box mt={2}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
        <LinearProgress 
          variant="determinate" 
          value={member.progress} 
          sx={{ height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)', mb: 2, '& .MuiLinearProgress-bar': { bgcolor: isInactive ? COLORS.active : 'info.main' }}} 
        />
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <IconButton disabled={isInactive} size="small" sx={{ border: '1px solid rgba(255,255,255,0.1)', color: 'grey.400' }}><Phone fontSize="small" /></IconButton>
          <IconButton size="small" sx={{ border: '1px solid rgba(255,255,255,0.1)', color: 'grey.400' }}><ChatBubble fontSize="small" /></IconButton>
          <IconButton size="small" sx={{ border: '1px solid rgba(255,255,255,0.1)', color: 'grey.400' }}>
            {isInactive ? <History fontSize="small" /> : <Map fontSize="small" />}
          </IconButton>
        </Stack>
      </Box>
    </Card>
  );
};

// --- MAIN DASHBOARD ---
export default function TeamInfo() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');

  const filterLabels = ['All', 'Active', 'Inactive', 'On Leave'];
  
  const filteredData = teamData.filter(m => {
    const activeLabel = filterLabels[tab];
    const matchesTab = activeLabel === 'All' || 
      (activeLabel === 'Active' && m.status === 'ACTIVE') ||
      (activeLabel === 'Inactive' && m.status === 'CLOCKED OUT') ||
      (activeLabel === 'On Leave' && m.status === 'ON BREAK');
    return matchesTab && m.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <Box sx={{ 
      minHeight: '100vh', p: { xs: 3, lg: 6 },
      background: `radial-gradient(circle at 50% 0%, ${COLORS.bgPurpleLight} 0%, ${COLORS.bgPurpleMid} 40%, ${COLORS.bgDeep} 100%)`,
      backgroundAttachment: 'fixed'
    }}>
      <Box maxWidth="xl" sx={{ mx: 'auto' }}>
        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }} mb={4} spacing={3}>
          <Box>
            <Typography variant="h3" fontWeight="800" color="white" gutterBottom>Field Team Overview</Typography>
            <Typography variant="body2" color="grey.400">Manage and view all Team Member accounts</Typography>
          </Box>
          <TextField 
            placeholder="Search by name..."
            variant="outlined"
            size="small"
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search sx={{ color: 'grey.500' }} /></InputAdornment>,
              sx: { borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }
            }}
            sx={{ width: { xs: '100%', md: 300 } }}
          />
        </Stack>

        {/* Tabs */}
        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)}
          sx={{ 
            mb: 4, 
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTabs-flexContainer': { gap: 1 }
          }}
        >
          {filterLabels.map((label, i) => (
            <Tab 
              key={label} 
              label={`${label} View`} 
              sx={{ 
                color: 'grey.500', borderRadius: '20px', textTransform: 'none', fontWeight: 'bold',
                '&.Mui-selected': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
              }} 
            />
          ))}
        </Tabs>

        {/* Grid */}
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }} gap={3}>
          {filteredData.map(member => (
            <TeamCard key={member.id} member={member} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}