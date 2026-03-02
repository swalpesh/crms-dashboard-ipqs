import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Avatar,
  AvatarGroup,
  Paper,
  createTheme,
  ThemeProvider,
  styled,
  CircularProgress,
  LinearProgress
} from '@mui/material';

// Icons 
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PieChartIcon from '@mui/icons-material/PieChart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BoltIcon from '@mui/icons-material/Bolt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalculateIcon from '@mui/icons-material/Calculate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// --- API HELPERS ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

// --- THEME & STYLES ---
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#8b5cf6' }, // Purple
    secondary: { main: '#a0a0c0' }, // Text Secondary
    background: { default: '#0f0c29' },
    text: { primary: '#ffffff', secondary: '#a0a0c0' },
    success: { main: '#10b981' },
    warning: { main: '#f97316' }, // Orange
    info: { main: '#3b82f6' }, // Blue
    error: { main: '#ef4444' },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
});

// Custom Styled Components
const GlassPanel = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  borderRadius: 20,
  color: theme.palette.text.primary,
  overflow: 'hidden', 
}));

const IconBox = styled(Box)(({ color }) => ({
  width: 42,
  height: 42,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontSize: '20px',
  ...(color === 'purple' && { background: '#8b5cf6', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)' }),
  ...(color === 'blue' && { background: '#3b82f6', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' }),
  ...(color === 'orange' && { background: '#f97316', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)' }),
  ...(color === 'green' && { background: '#10b981', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }),
}));

// --- MAIN COMPONENT ---
const QuotationDashboard = () => {
  const [loading, setLoading] = useState(true);
  
  // API Stats States
  const [stats, setStats] = useState({
    confirmedValue: 0,
    confirmedCount: 0,
    totalQuotedValue: 0,
    pendingQuotations: 0,
    pendingPOs: 0
  });

  // Margin Calculator States
  const [cost, setCost] = useState('10000');
  const [margin, setMargin] = useState('30');
  const [sellPrice, setSellPrice] = useState(14285);

  // --- FETCH KPI DATA ---
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) return;

        const headers = { 'Authorization': `Bearer ${token}` };

        // API 1: Total Confirmed Revenue
        const confRevRes = await fetch(`${API_BASE_URL}/api/leads/analytics/confirmed-revenue`, { headers });
        const confRevData = confRevRes.ok ? await confRevRes.json() : null;
        const confirmedValue = confRevData?.summary?.total_revenue || 0;
        const confirmedCount = confRevData?.summary?.total_leads || 0;

        // API 2: Total Quotated Value
        const myQuotesRes = await fetch(`${API_BASE_URL}/api/v1/quotations/my`, { headers });
        const myQuotesData = myQuotesRes.ok ? await myQuotesRes.json() : null;
        let totalQuotedValue = 0;
        if (myQuotesData && myQuotesData.quotations) {
           totalQuotedValue = myQuotesData.quotations.reduce((sum, q) => sum + parseFloat(q.grand_total || 0), 0);
        }

        // API 3: Pending Quotations & Pending POs
        const teamRes = await fetch(`${API_BASE_URL}/api/v1/quotations/quotation-team`, { headers });
        const teamData = teamRes.ok ? await teamRes.json() : null;
        let pendingQuotations = 0;
        let pendingPOs = 0;
        
        if (teamData && teamData.leads) {
           // Quotations Pending: quotation_created is No
           pendingQuotations = teamData.leads.filter(l => l.quotation_created === "No").length;
           // Pending PO: quotation_created is Yes AND po_confirmed is Yes
           pendingPOs = teamData.leads.filter(l => l.quotation_created === "Yes" && l.po_confirmed === "Yes").length;
        }

        setStats({
          confirmedValue,
          confirmedCount,
          totalQuotedValue,
          pendingQuotations,
          pendingPOs
        });

      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Margin Calculation Logic
  const handleCalculate = () => {
    const costVal = parseFloat(cost) || 0;
    const marginVal = parseFloat(margin) || 0;
    if (marginVal >= 100) {
      setSellPrice(0);
      return;
    }
    const calculatedPrice = costVal / (1 - (marginVal / 100));
    setSellPrice(Math.round(calculatedPrice));
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
          backgroundAttachment: 'fixed',
          display: 'flex',
          color: 'text.primary',
        }}
      >
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, overflowY: 'auto', height: '100vh' }}>
          
          {/* KPI Grid */}
          {loading ? (
            <Box display="flex" justifyContent="center" p={5} mb={3}>
              <CircularProgress sx={{ color: '#8b5cf6' }} />
            </Box>
          ) : (
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(4, 1fr)' }} gap={3} mb={3}>
              
              {/* KPI 1: Total Confirmed Value */}
              <GlassPanel sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 160 }}>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" color="text.secondary">Total Confirmed Value</Typography>
                  <IconBox color="green"><AttachMoneyIcon /></IconBox>
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="700" mb={1}>
                    ₹ {stats.confirmedValue.toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CheckCircleIcon sx={{ fontSize: 14 }} /> {stats.confirmedCount} Leads Won
                  </Typography>
                </Box>
              </GlassPanel>

              {/* KPI 2: Total Quotated Value */}
              <GlassPanel sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 160 }}>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" color="text.secondary">Total Quotated Value</Typography>
                  <IconBox color="purple"><PieChartIcon /></IconBox>
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="700" mb={1}>
                    ₹ {stats.totalQuotedValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Sum of all generated quotes
                  </Typography>
                </Box>
              </GlassPanel>

              {/* KPI 3: Quotations Pending */}
              <GlassPanel sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 160 }}>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" color="text.secondary">Quotations Pending</Typography>
                  <IconBox color="blue"><AssignmentIcon /></IconBox>
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="700" mb={1}>
                    {stats.pendingQuotations}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <BoltIcon sx={{ fontSize: 16 }} /> Needs Action
                  </Typography>
                </Box>
              </GlassPanel>

              {/* KPI 4: Pending PO */}
              <GlassPanel sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 160 }}>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body2" color="text.secondary">Pending PO</Typography>
                  <IconBox color="orange"><ShoppingCartIcon /></IconBox>
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="700" mb={1}>
                    {stats.pendingPOs} <Typography component="span" variant="body1" color="text.secondary">Orders</Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Awaiting final confirmation
                  </Typography>
                </Box>
              </GlassPanel>
            </Box>
          )}

          {/* Quick Margin Calculator */}
          <GlassPanel sx={{ p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4 }}>
            <Box display="flex" alignItems="center" gap={2} minWidth={200}>
              <IconBox color="green"><CalculateIcon /></IconBox>
              <Typography variant="h6" fontWeight="600">Quick Margin Calculator</Typography>
            </Box>

            <Box display="flex" flex={1} alignItems="center" gap={3} width="100%" justifyContent={{ xs: 'center', md: 'flex-end' }} flexWrap="wrap">
              
              <Box display="flex" gap={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary" mb={0.5} display="block">TOTAL COST</Typography>
                  <Box sx={{ 
                    bgcolor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, 
                    display: 'flex', alignItems: 'center', px: 1.5, py: 1, width: 140 
                  }}>
                    <Typography color="text.secondary" mr={1}>₹</Typography>
                    <TextField 
                      variant="standard" 
                      type="number"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      InputProps={{ disableUnderline: true, sx: { color: '#fff', fontWeight: 600 } }} 
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" mb={0.5} display="block">TARGET MARGIN</Typography>
                  <Box sx={{ 
                    bgcolor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, 
                    display: 'flex', alignItems: 'center', px: 1.5, py: 1, width: 140 
                  }}>
                    <TextField 
                      variant="standard" 
                      type="number"
                      value={margin}
                      onChange={(e) => setMargin(e.target.value)}
                      InputProps={{ disableUnderline: true, sx: { color: '#fff', fontWeight: 600 } }} 
                    />
                    <Typography color="text.secondary" ml={1}>%</Typography>
                  </Box>
                </Box>
              </Box>

              <ArrowForwardIcon sx={{ color: 'text.secondary', display: { xs: 'none', md: 'block' } }} />

              <Box>
                <Typography variant="caption" color="text.secondary" mb={0.5} display="block">SELL PRICE</Typography>
                <Typography variant="h5" fontWeight="700">
                  ₹ {sellPrice.toLocaleString('en-IN')}
                </Typography>
              </Box>

              <Button 
                variant="contained" 
                onClick={handleCalculate}
                sx={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                  borderRadius: 3, textTransform: 'none', px: 4, py: 1.5, fontWeight: 600,
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                }}
              >
                Calculate
              </Button>
            </Box>
          </GlassPanel>

        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default QuotationDashboard;