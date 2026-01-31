import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Modal,
  IconButton,
  Divider,
} from '@mui/material';

// Icons
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import PieChartIcon from '@mui/icons-material/PieChart';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';

const colors = {
  bgGradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0c0',
  accent: '#3b82f6',
  purple: '#8b5cf6',
  green: '#10b981',
  orange: '#f97316',
  red: '#ef4444', 
};

// --- ATTRACTIVE ANIMATION COMPONENTS ---

const AnimatedCounter = ({ end, duration = 1500, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentCount = progress * end;
      setCount(end % 1 === 0 ? Math.floor(currentCount) : Math.floor(currentCount * 10) / 10);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return (
    <Typography
      variant="h4"
      sx={{
        fontWeight: 900,
        fontSize: '2rem',
        background: 'linear-gradient(to bottom, #fff 0%, #a0a0c0 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.25))',
        letterSpacing: '-1px'
      }}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </Typography>
  );
};

const AnimatedLinearProgress = ({ targetValue, color }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(targetValue);
    }, 200);
    return () => clearTimeout(timer);
  }, [targetValue]);

  return (
    <LinearProgress
      variant="determinate"
      value={progress}
      sx={{
        height: 6,
        borderRadius: 3,
        bgcolor: 'rgba(255,255,255,0.05)',
        '& .MuiLinearProgress-bar': {
          bgcolor: color,
          transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)', 
        },
      }}
    />
  );
};

// --- DATA ---

const allLeads = [
  { 
    n: 'Mahindra Auto', v: '₹ 1.5 L', i: 'MA', c: colors.purple,
    requirement: 'Fleet upgrade for commercial EVs',
    phone: '+91 98765 43210',
    email: 'procurement@mahindra.com',
    address: 'Gateway Building, Apollo Bunder, Mumbai'
  },
  { 
    n: 'TechSpace Park', v: '₹ 50 k', i: 'TS', c: colors.accent,
    requirement: 'Solar grid maintenance contract',
    phone: '+91 88877 66655',
    email: 'admin@techspace.in',
    address: 'Hitech City, Phase 2, Hyderabad'
  },
  { 
    n: 'Infosys Ltd', v: '₹ 2.2 L', i: 'IN', c: colors.green,
    requirement: 'Smart Lighting System installation',
    phone: '+91 99000 11000',
    email: 'ops@infosys.com',
    address: 'Electronics City, Bengaluru'
  },
  { 
    n: 'Reliance Ind', v: '₹ 4.5 L', i: 'RI', c: colors.orange,
    requirement: 'Automation software license',
    phone: '+91 77766 55544',
    email: 'tech@ril.com',
    address: 'Reliance Corporate Park, Navi Mumbai'
  },
  { n: 'Tata Motors', v: '₹ 80 k', i: 'TM', c: colors.purple },
  { n: 'HDFC Bank', v: '₹ 1.2 L', i: 'HB', c: colors.accent },
  { n: 'Zomato Corp', v: '₹ 30 k', i: 'ZC', c: colors.green },
];

const leadData = [
  { name: 'Referral', value: 40, color: colors.accent },
  { name: 'Website', value: 30, color: '#0ea5e9' },
  { name: 'Cold Call', value: 20, color: colors.purple },
  { name: 'Social', value: 10, color: colors.orange },
];

const glassPanelStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '20px',
  color: colors.textPrimary,
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    background: 'rgba(255, 255, 255, 0.06)',
  }
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: 500 },
  maxHeight: '90vh',
  background: 'rgba(20, 20, 40, 0.95)',
  backdropFilter: 'blur(25px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '24px',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
};

// IMPROVED Design for the Lead Details modal
const detailModalStyle = {
    ...modalStyle,
    width: { xs: '95%', sm: 550 },
    background: 'rgba(15, 12, 41, 0.98)', 
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
    p: 0, // Header will handle internal padding
};

const Glow = ({ color }) => (
  <Box sx={{
    position: 'absolute',
    top: '-10%',
    right: '-10%',
    width: '60px',
    height: '60px',
    background: color,
    filter: 'blur(30px)',
    opacity: 0.15,
    zIndex: 0,
  }} />
);

const SquareKpiCard = ({ title, valueObj, icon, iconBg, trend, trendLabel, trendColor, progress, subText }) => (
  <Card sx={glassPanelStyle}>
    <Glow color={trendColor || colors.accent} />
    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Typography sx={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>
          {title}
        </Typography>
        <Box sx={{ width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: iconBg, color: '#fff' }}>
          {React.cloneElement(icon, { sx: { fontSize: '1.2rem' } })}
        </Box>
      </Box>
      <Box>
        <AnimatedCounter end={valueObj.num} prefix={valueObj.prefix} suffix={valueObj.suffix} />
        {progress !== undefined && (
          <Box sx={{ mb: 1.5, mt: 1 }}>
            <AnimatedLinearProgress targetValue={progress} color={colors.accent} />
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          {trend && <TrendingUpIcon sx={{ fontSize: '1rem', color: trendColor }} />}
          <Typography sx={{ color: trendColor || colors.textSecondary, fontSize: '0.75rem', fontWeight: 700 }}>{trend} {trendLabel}</Typography>
        </Box>
        {subText && <Typography sx={{ color: colors.textSecondary, fontSize: '0.75rem' }}>{subText}</Typography>}
      </Box>
    </CardContent>
  </Card>
);

const FunnelBarSmall = ({ label, percentage, color, targetWidth }) => (
  <Box sx={{ mb: 1.5, width: '100%' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
      <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, fontWeight: 600 }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#fff' }}>{percentage}</Typography>
    </Box>
    <AnimatedLinearProgress targetValue={targetWidth} color={color} />
  </Box>
);

const FieldDashboard = () => {
  const [open, setOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: colors.bgGradient, p: 4, color: colors.textPrimary }}>
      <div className="container-fluid">
        
        {/* ROW 1: KPI BLOCKS */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-sm-6 col-md-3">
            <Box sx={{ aspectRatio: '1/1' }}>
              <SquareKpiCard title="Estimated Value" valueObj={{num: 24.5, prefix: "₹ ", suffix: "L"}} icon={<CurrencyRupeeIcon />} iconBg={colors.accent} trend="+12%" trendLabel="vs last month" trendColor={colors.green} />
            </Box>
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <Box sx={{ aspectRatio: '1/1' }}>
              <SquareKpiCard title="New Leads" valueObj={{num: 145, prefix: "", suffix: ""}} icon={<GroupIcon />} iconBg={colors.purple} subText="Avg. 5 per day" />
            </Box>
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <Box sx={{ aspectRatio: '1/1' }}>
              <SquareKpiCard title="Conv. Rate" valueObj={{num: 18, prefix: "", suffix: "%"}} icon={<PieChartIcon />} iconBg={colors.accent} progress={18} trendLabel="Target: 25%" />
            </Box>
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <Box sx={{ aspectRatio: '1/1' }}>
              <Card sx={glassPanelStyle}>
                <Glow color={colors.purple} />
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, mb: 1, color: colors.textSecondary, textTransform: 'uppercase' }}>Sales Funnel</Typography>
                  <Box>
                    <FunnelBarSmall label="Leads" percentage="100%" color={colors.accent} targetWidth={100} />
                    <FunnelBarSmall label="Visits" percentage="41%" color={colors.purple} targetWidth={41} />
                    <FunnelBarSmall label="Won" percentage="8%" color={colors.green} targetWidth={8} />
                    <FunnelBarSmall label="Lost" percentage="51%" color={colors.red} targetWidth={51} />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </div>
        </div>

        {/* ROW 2: ANIMATED CHART AND HOT LEADS */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-7">
            <Card sx={{ ...glassPanelStyle, p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, flexWrap: 'wrap' }}>
                <Box sx={{ width: 220, height: 220, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={leadData} innerRadius={65} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none" animationDuration={1500} animationBegin={200}>
                        {leadData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', textTransform: 'uppercase', fontSize: '0.65rem' }}>Total Leads</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>145</Typography>
                  </Box>
                </Box>
                <div className="row gx-4 gy-2" style={{ maxWidth: '300px' }}>
                   {leadData.map((item, i) => (
                     <div className="col-6 d-flex align-items-center gap-2" key={i}>
                       <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: item.color }} />
                       <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>{item.name} <b className="text-white">({item.value}%)</b></Typography>
                     </div>
                   ))}
                </div>
              </Box>
            </Card>
          </div>

          <div className="col-12 col-lg-5">
            <Card sx={{ ...glassPanelStyle, overflow: 'hidden' }}>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                   <WhatshotIcon sx={{ color: colors.orange }} />
                   <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>HOT LEADS</Typography>
                 </Box>
                 <Button onClick={handleOpen} size="small" endIcon={<ChevronRightIcon />} sx={{ color: colors.accent, textTransform: 'none' }}>View all</Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {allLeads.slice(0, 2).map((row, index) => (
                      <TableRow key={index} sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#fff', py: 2 } }}>
                        <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Avatar sx={{ bgcolor: row.c, width: 36, height: 36, fontSize: '0.8rem' }}>{row.i}</Avatar><Typography variant="body2">{row.n}</Typography></Box></TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>{row.v}</TableCell>
                        <TableCell align="right">
                            <Button onClick={() => handleViewLead(row)} variant="contained" size="small" sx={{ bgcolor: colors.accent, borderRadius: '8px', textTransform: 'none', px: 3 }}>View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </div>
        </div>

        {/* MODAL: VIEW ALL LEADS */}
        <Modal open={open} onClose={handleClose} closeAfterTransition>
          <Box sx={modalStyle}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>All Active Leads</Typography>
              <IconButton onClick={handleClose} sx={{ color: colors.textSecondary }}><CloseIcon /></IconButton>
            </Box>
            <TableContainer sx={{ overflowY: 'auto', flexGrow: 1, pr: 1, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '10px' } }}>
              <Table size="small">
                <TableBody>
                  {allLeads.map((row, index) => (
                    <TableRow key={index} sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#fff', py: 2 } }}>
                      <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Avatar sx={{ bgcolor: row.c, width: 36, height: 36, fontSize: '0.8rem' }}>{row.i}</Avatar><Typography variant="body2">{row.n}</Typography></Box></TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>{row.v}</TableCell>
                      <TableCell align="right">
                          <Button onClick={() => { handleViewLead(row); handleClose(); }} variant="contained" size="small" sx={{ bgcolor: colors.accent, borderRadius: '8px', textTransform: 'none', px: 3 }}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Modal>

        {/* PRETTY LEAD DETAILS MODAL */}
        <Modal open={Boolean(selectedLead)} onClose={() => setSelectedLead(null)}>
          <Box sx={detailModalStyle}>
            {/* Header Section with colored background matching lead company color */}
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: selectedLead?.c || colors.accent, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#fff', color: selectedLead?.c, fontWeight: 800, border: '2px solid rgba(255,255,255,0.3)' }}>{selectedLead?.i}</Avatar>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '0.5px' }}>{selectedLead?.n}</Typography>
              </Box>
              <IconButton onClick={() => setSelectedLead(null)} sx={{ color: '#fff', '&:hover': { background: 'rgba(255,255,255,0.1)' } }}><CloseIcon /></IconButton>
            </Box>
            
            <Box sx={{ p: 4 }}>
                {/* Requirement Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="caption" sx={{ color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 800, display: 'block', mb: 1.5, letterSpacing: '1.2px' }}>Lead Requirement</Typography>
                    <Box sx={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.03)', p: 2.5, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <AssignmentIcon sx={{ color: selectedLead?.c || colors.accent }} fontSize="medium" />
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#fff', lineHeight: 1.6 }}>{selectedLead?.requirement || 'Information not provided.'}</Typography>
                    </Box>
                </Box>
                
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 4 }} />

                {/* Contact Information Grid */}
                <div className="row g-4 mb-4">
                    <div className="col-12 col-sm-6">
                        <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 800, display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '1px' }}>Phone</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <CallIcon sx={{ color: colors.green }} fontSize="small" />
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#fff' }}>{selectedLead?.phone || '+91 00000 00000'}</Typography>
                        </Box>
                    </div>
                    <div className="col-12 col-sm-6">
                        <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 800, display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '1px' }}>Email</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <EmailIcon sx={{ color: colors.orange }} fontSize="small" />
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#fff' }}>{selectedLead?.email || 'contact@client.com'}</Typography>
                        </Box>
                    </div>
                </div>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 800, display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '1px' }}>Office Address</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <LocationOnIcon sx={{ color: colors.accent }} fontSize="small" />
                        <Typography variant="body2" sx={{ color: '#eee', lineHeight: 1.7 }}>{selectedLead?.address || 'Address details currently unavailable.'}</Typography>
                    </Box>
                </Box>

                <Box sx={{ mt: 5 }}>
                    <Button fullWidth variant="contained" sx={{ bgcolor: colors.accent, borderRadius: '16px', py: 2, fontWeight: 800, fontSize: '1rem', textTransform: 'none', boxShadow: `0 8px 25px ${colors.accent}44`, '&:hover': { bgcolor: '#2563eb', transform: 'translateY(-2px)' }, transition: 'all 0.2s ease' }}>Contact Representative</Button>
                </Box>
            </Box>
          </Box>
        </Modal>

        {/* ROW 3: TOP PERFORMERS */}
        <div className="row g-4">
          <div className="col-12">
            <Card sx={glassPanelStyle}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>TOP PERFORMERS</Typography>
                <div className="row g-4">
                  <div className="col-md-6">
                    <ListItem sx={{ bgcolor: 'rgba(255, 206, 0, 0.05)', borderRadius: '15px', p: 2 }} secondaryAction={<Typography variant="body1" sx={{ fontWeight: 800, color: '#ffce00' }}>₹ 4.0L</Typography>}>
                       <Typography variant="h5" sx={{ color: '#ffce00', mr: 3, fontWeight: 900 }}>1</Typography>
                       <ListItemAvatar><Avatar src="https://i.pravatar.cc/150?img=68" sx={{ width: 45, height: 45, border: '2px solid #ffce00' }} /></ListItemAvatar>
                       <ListItemText primary="Amit V." secondary="Sales Executive" />
                    </ListItem>
                  </div>
                  <div className="col-md-6">
                    <ListItem sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)', borderRadius: '15px', p: 2 }} secondaryAction={<Typography variant="body1" sx={{ fontWeight: 800 }}>₹ 2.5L</Typography>}>
                       <Typography variant="h5" sx={{ color: colors.textSecondary, mr: 3, fontWeight: 700 }}>2</Typography>
                       <ListItemAvatar><Avatar src="https://i.pravatar.cc/150?img=44" sx={{ width: 45, height: 45 }} /></ListItemAvatar>
                       <ListItemText primary="Sarah L." secondary="Senior Executive" />
                    </ListItem>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </Box>
  );
};

export default FieldDashboard;