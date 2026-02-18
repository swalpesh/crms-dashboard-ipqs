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

// --- API HELPERS ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

// Helper to get the logged-in user's details
const getAuthUser = () => {
  const userStr = localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");
  try { return userStr ? JSON.parse(userStr) : null; } catch (e) { return null; }
};

const getLogoColor = (str) => {
  if (!str) return '#3b82f6';
  const colorsList = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colorsList[Math.abs(hash) % colorsList.length];
};

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
    p: 0, 
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

  // Authentication & Role
  const authUser = getAuthUser();
  const authRole = localStorage.getItem("auth_role") || sessionStorage.getItem("auth_role");
  const isHead = authRole === 'Field-Marketing-Head';

  // API States
  const [hotLeads, setHotLeads] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [estimatedValue, setEstimatedValue] = useState(0);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [funnelData, setFunnelData] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = getToken();
      if (!token) return;

      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Fetch Hot Leads
      try {
        const res = await fetch(`${API_BASE_URL}/api/fleads/hot-leads`, { headers });
        if (res.ok) {
          const result = await res.json();
          const mappedLeads = (result.data || []).map(lead => {
            let revNum = lead.expected_revenue || 0;
            let revStr = `₹ 0`;
            if (revNum >= 100000) revStr = `₹ ${(revNum / 100000).toFixed(1)} L`;
            else if (revNum >= 1000) revStr = `₹ ${(revNum / 1000).toFixed(1)} k`;
            else if (revNum > 0) revStr = `₹ ${revNum}`;

            return {
              ...lead,
              n: lead.company_name || lead.lead_name || 'Unknown',
              v: revStr,
              i: (lead.company_name || lead.lead_name || 'U').charAt(0).toUpperCase(),
              c: getLogoColor(lead.company_name || lead.lead_name),
              requirement: lead.lead_requirement,
              phone: lead.contact_person_phone || lead.company_contact_number,
              email: lead.contact_person_email || lead.company_email,
              address: [lead.company_address, lead.company_city, lead.company_state].filter(Boolean).join(', ')
            };
          });
          setHotLeads(mappedLeads);
        }
      } catch (err) { console.error("Error fetching hot leads", err); }

      // 2. Fetch Employees Revenue (Top Performers & Estimated Value)
      try {
        const res = await fetch(`${API_BASE_URL}/api/fleads/employees-revenue`, { headers });
        if (res.ok) {
          const result = await res.json();
          const sortedPerformers = [...(result.data || [])].sort((a, b) => b.total_expected_revenue - a.total_expected_revenue);
          setTopPerformers(sortedPerformers);

          if (isHead) {
            setEstimatedValue(result.total_expected_revenue_all_employees || 0);
          } else {
            const myData = sortedPerformers.find(emp => emp.employee_id === authUser?.employee_id);
            setEstimatedValue(myData ? myData.total_expected_revenue : 0);
          }
        }
      } catch (err) { console.error("Error fetching revenue", err); }

      // 3. Fetch New Assigned Leads Summary
      try {
        const res = await fetch(`${API_BASE_URL}/api/fleads/new-assigned-summary`, { headers });
        if (res.ok) {
          const result = await res.json();
          if (isHead) {
            setNewLeadsCount(result.total_new_leads_today || 0);
          } else {
            const myData = (result.data || []).find(emp => emp.employee_id === authUser?.employee_id);
            setNewLeadsCount(myData ? myData.today_assigned : 0);
          }
        }
      } catch (err) { console.error("Error fetching new leads", err); }

      // 4. Fetch Sales Funnel
      try {
        const res = await fetch(`${API_BASE_URL}/api/fleads/sales-funnel`, { headers });
        if (res.ok) {
          const result = await res.json();
          setFunnelData(result.data);
        }
      } catch (err) { console.error("Error fetching funnel", err); }
    };

    fetchDashboardData();
  }, [isHead, authUser?.employee_id]);

  // Format Estimated Value for KPI Card dynamically (Lakhs or Thousands)
  let estNum = estimatedValue || 0;
  let estSuffix = "";
  if (estNum >= 100000) { 
    estNum = estNum / 100000; 
    estSuffix = " L"; 
  } else if (estNum >= 1000) { 
    estNum = estNum / 1000; 
    estSuffix = " k"; 
  }

  // Calculate dynamic data mapping exactly to requested labels
  const totalLeadsCount = funnelData?.total_leads?.count || 0;
  const schedCount = funnelData?.scheduled_visits?.count || 0;
  const compCount = funnelData?.completed_visits?.count || 0;
  const transCount = funnelData?.transferred_visits?.count || 0;
  
  // "Created" is any lead not yet scheduled, completed, or transferred
  const createdCount = Math.max(0, totalLeadsCount - (schedCount + compCount + transCount));

  const activePieData = [
    { name: 'Created', value: createdCount, color: colors.orange },
    { name: 'Visit Scheduled', value: schedCount, color: '#3b82f6' },
    { name: 'Visit Completed', value: compCount, color: colors.green },
    { name: 'Visit Transferred', value: transCount, color: colors.purple },
  ].filter(d => d.value > 0);

  if (activePieData.length === 0) {
    activePieData.push({ name: 'No Visits', value: 1, color: 'rgba(255,255,255,0.1)' });
  }

  return (
    <Box sx={{ minHeight: '100vh', background: colors.bgGradient, p: 4, color: colors.textPrimary }}>
      <div className="container-fluid">
        
        {/* ROW 1: KPI BLOCKS */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-sm-6 col-md-3">
            <Box sx={{ aspectRatio: '1/1' }}>
              <SquareKpiCard title="Estimated Value" valueObj={{num: estNum, prefix: "₹ ", suffix: estSuffix}} icon={<CurrencyRupeeIcon />} iconBg={colors.accent} trend="+12%" trendLabel="vs last month" trendColor={colors.green} />
            </Box>
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <Box sx={{ aspectRatio: '1/1' }}>
              <SquareKpiCard title="New Leads" valueObj={{num: newLeadsCount, prefix: "", suffix: ""}} icon={<GroupIcon />} iconBg={colors.purple} subText={isHead ? "Total Team Assigned Today" : "Assigned To You Today"} />
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
                    <FunnelBarSmall label="Total Leads" percentage={funnelData?.total_leads?.percentage || "0%"} color={colors.accent} targetWidth={parseInt(funnelData?.total_leads?.percentage || 0)} />
                    <FunnelBarSmall label="Scheduled Visits" percentage={funnelData?.scheduled_visits?.percentage || "0%"} color={colors.purple} targetWidth={parseInt(funnelData?.scheduled_visits?.percentage || 0)} />
                    <FunnelBarSmall label="Completed Visits" percentage={funnelData?.completed_visits?.percentage || "0%"} color={colors.green} targetWidth={parseInt(funnelData?.completed_visits?.percentage || 0)} />
                    <FunnelBarSmall label="Transferred Visits" percentage={funnelData?.transferred_visits?.percentage || "0%"} color={colors.orange} targetWidth={parseInt(funnelData?.transferred_visits?.percentage || 0)} />
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
                      <Pie data={activePieData} innerRadius={65} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none" animationDuration={1500} animationBegin={200}>
                        {activePieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Center Chart Text */}
                  <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: colors.textSecondary, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px', mb: 0.5 }}>TOTAL LEADS</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#fff', m: 0 }}>{totalLeadsCount}</Typography>
                  </Box>
                </Box>
                
                {/* 2x2 Grid Legend */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 4, rowGap: 2 }}>
                   {activePieData.map((item, i) => (
                     item.name !== 'No Visits' && (
                       <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                         <Box sx={{ width: 12, height: 12, borderRadius: '4px', bgcolor: item.color }} />
                         <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                           {item.name} <span style={{ color: '#fff', fontWeight: 700 }}>({item.value})</span>
                         </Typography>
                       </Box>
                     )
                   ))}
                </Box>
              </Box>
            </Card>
          </div>

          <div className="col-12 col-lg-5">
            <Card sx={{ ...glassPanelStyle, overflow: 'hidden' }}>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                   <WhatshotIcon sx={{ color: colors.orange }} />
                   <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: '0.5px' }}>HOT LEADS</Typography>
                 </Box>
                 <Box onClick={handleOpen} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: colors.accent, '&:hover': { textDecoration: 'underline' } }}>
                   <Typography variant="body2" sx={{ fontWeight: 600 }}>View all</Typography>
                   <ChevronRightIcon fontSize="small" />
                 </Box>
              </Box>

              <Box sx={{ px: 3, pb: 3 }}>
                {hotLeads.length > 0 ? hotLeads.slice(0, 2).map((row, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, borderBottom: index === 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      <Avatar sx={{ bgcolor: row.c, width: 40, height: 40, fontSize: '0.95rem', fontWeight: 600 }}>{row.i}</Avatar>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.n}</Typography>
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', width: '90px', textAlign: 'left' }}>{row.v}</Typography>
                    <Button onClick={() => handleViewLead(row)} variant="contained" size="small" sx={{ bgcolor: '#3b82f6', borderRadius: '8px', textTransform: 'none', px: 3, py: 0.6, fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#2563eb' } }}>
                      View
                    </Button>
                  </Box>
                )) : (
                  <Typography sx={{ color: colors.textSecondary, py: 4, textAlign: 'center' }}>No hot leads found.</Typography>
                )}
              </Box>
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
                  {hotLeads.map((row, index) => (
                    <TableRow key={index} sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#fff', py: 2 } }}>
                      <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Avatar sx={{ bgcolor: row.c, width: 36, height: 36, fontSize: '0.8rem' }}>{row.i}</Avatar><Typography variant="body2">{row.n}</Typography></Box></TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>{row.v}</TableCell>
                      <TableCell align="right">
                          <Button onClick={() => { handleViewLead(row); handleClose(); }} variant="contained" size="small" sx={{ bgcolor: colors.accent, borderRadius: '8px', textTransform: 'none', px: 3 }}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {hotLeads.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ color: colors.textSecondary, py: 4 }}>No hot leads available.</TableCell>
                    </TableRow>
                  )}
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
        {isHead && (
          <div className="row g-4">
            <div className="col-12">
              <Card sx={glassPanelStyle}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>TOP PERFORMERS</Typography>
                  <div className="row g-4">
                    {topPerformers.slice(0, 4).map((emp, index) => {
                      const isFirst = index === 0;
                      const rankColor = isFirst ? '#ffce00' : colors.textSecondary;
                      const rankBg = isFirst ? 'rgba(255, 206, 0, 0.05)' : 'rgba(255, 255, 255, 0.02)';
                      
                      let revNum = emp.total_expected_revenue || 0;
                      let revStr = `₹ 0`;
                      if (revNum >= 100000) revStr = `₹ ${(revNum / 100000).toFixed(1)}L`;
                      else if (revNum >= 1000) revStr = `₹ ${(revNum / 1000).toFixed(1)}k`;
                      else if (revNum > 0) revStr = `₹ ${revNum}`;

                      return (
                        <div className="col-md-6" key={emp.employee_id}>
                          <ListItem sx={{ bgcolor: rankBg, borderRadius: '15px', p: 2 }} secondaryAction={<Typography variant="body1" sx={{ fontWeight: 800, color: rankColor }}>{revStr}</Typography>}>
                             <Typography variant="h5" sx={{ color: rankColor, mr: 3, fontWeight: 900 }}>{index + 1}</Typography>
                             <ListItemAvatar><Avatar sx={{ width: 45, height: 45, border: isFirst ? `2px solid ${rankColor}` : 'none', bgcolor: getLogoColor(emp.employee_name) }}>{emp.employee_name.charAt(0).toUpperCase()}</Avatar></ListItemAvatar>
                             <ListItemText primary={emp.employee_name} secondary={`${emp.completed_leads_count} Leads Completed`} sx={{ '& .MuiListItemText-primary': { color: '#fff', fontWeight: 600 }, '& .MuiListItemText-secondary': { color: colors.textSecondary } }} />
                          </ListItem>
                        </div>
                      );
                    })}
                    {topPerformers.length === 0 && (
                      <Typography variant="body2" sx={{ color: colors.textSecondary, width: '100%', textAlign: 'center', py: 2 }}>No performer data available.</Typography>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

      </div>
    </Box>
  );
};

export default FieldDashboard;