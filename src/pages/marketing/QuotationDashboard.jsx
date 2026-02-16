import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  AvatarGroup,
  IconButton,
  Paper,
  Chip,
  Stack,
  createTheme,
  ThemeProvider,
  styled,
  LinearProgress
} from '@mui/material';

// Icons (Using Material UI Icons to act as Phosphor equivalents)
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FilterListIcon from '@mui/icons-material/FilterList';
import BoltIcon from '@mui/icons-material/Bolt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SaveIcon from '@mui/icons-material/Save';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PieChartIcon from '@mui/icons-material/PieChart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DownloadIcon from '@mui/icons-material/Download';
import CalculateIcon from '@mui/icons-material/Calculate';
import VisibilityIcon from '@mui/icons-material/Visibility'; // View Icon

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
  overflow: 'hidden', // Ensures rounded corners clip content
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
  // Specific color styles based on prop
  ...(color === 'purple' && { background: '#8b5cf6', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)' }),
  ...(color === 'blue' && { background: '#3b82f6', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' }),
  ...(color === 'orange' && { background: '#f97316', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)' }),
  ...(color === 'green' && { background: '#10b981', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }),
}));

const GlassTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  padding: '20px 16px',
  color: theme.palette.text.primary,
  verticalAlign: 'middle',
  '&.MuiTableCell-head': {
    color: theme.palette.text.secondary,
    fontWeight: 600,
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    paddingBottom: '20px',
  },
}));

const SidebarItem = styled(Button)(({ theme, active }) => ({
  justifyContent: 'flex-start',
  padding: '12px 16px',
  width: '100%',
  borderRadius: 10,
  textTransform: 'none',
  fontSize: '14px',
  marginBottom: '4px',
  color: active ? '#8b5cf6' : theme.palette.text.secondary,
  backgroundColor: active ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
  border: active ? '1px solid rgba(139, 92, 246, 0.2)' : 'none',
  boxShadow: active ? '0 4px 12px rgba(139, 92, 246, 0.2)' : 'none',
  '&:hover': {
    backgroundColor: active ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
}));

const TabButton = styled(Button)(({ theme, active }) => ({
  borderRadius: 20,
  padding: '6px 20px',
  textTransform: 'none',
  fontSize: '13px',
  fontWeight: 500,
  color: active ? '#1a1a2e' : theme.palette.text.secondary,
  backgroundColor: active ? '#fbb03b' : 'transparent',
  '&:hover': {
    backgroundColor: active ? '#fbb03b' : 'rgba(255,255,255,0.05)',
  },
}));

const ViewButton = styled(Button)({
  background: 'rgba(139, 92, 246, 0.15)',
  color: '#8b5cf6',
  border: '1px solid rgba(139, 92, 246, 0.3)',
  borderRadius: 20,
  textTransform: 'none',
  fontSize: '12px',
  fontWeight: 600,
  padding: '6px 16px',
  '&:hover': {
    background: 'rgba(139, 92, 246, 0.25)',
    boxShadow: '0 0 10px rgba(139, 92, 246, 0.2)',
  },
});

// --- DATA ---
const revisionRows = [
  {
    id: '#QT-2045',
    idColor: '#f97316', // Orange
    client: 'Global Logistics',
    clientInitials: 'GL',
    clientColor: 'rgba(249, 115, 22, 0.2)',
    clientTextColor: '#f97316',
    revisedBy: 'John Doe',
    role: 'Sales Lead',
    revisedInitials: 'JD',
    reasonTitle: 'Budget Reduction Request',
    reasonDesc: 'Can we reduce the fleet mgmt module scope to lower costs...',
  },
  {
    id: '#QT-2042',
    idColor: '#8b5cf6', // Purple
    client: 'InnoSoft Inc.',
    clientInitials: 'II',
    clientColor: 'rgba(139, 92, 246, 0.2)',
    clientTextColor: '#8b5cf6',
    revisedBy: 'Sarah Lee',
    role: 'Account Mgr',
    revisedInitials: 'SL',
    reasonTitle: 'License Addition',
    reasonDesc: 'Client needs 5 more user seats added to the quote immediately.',
  },
  {
    id: '#QT-2038',
    idColor: '#3b82f6', // Blue
    client: 'Mike Ross',
    clientInitials: 'MR',
    clientColor: 'rgba(59, 130, 246, 0.2)',
    clientTextColor: '#3b82f6',
    revisedBy: 'Mike Ross',
    role: 'Engineering',
    revisedInitials: 'MR',
    reasonTitle: 'Technical Spec Change',
    reasonDesc: 'Engineering updated the server specs from 64GB to 128GB RAM.',
  },
];

// --- MAIN COMPONENT ---
const QuotationDashboard = () => {
  const [activeTab, setActiveTab] = useState('Pending');

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
        
        {/* --- SIDEBAR --- */}
        <GlassPanel
          sx={{
            width: 260,
            borderRadius: 0,
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            borderTop: 'none', borderBottom: 'none', borderLeft: 'none',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            p: 3,
            zIndex: 10,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5} mb={5} pl={1}>
            <Box
              sx={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #fbb03b, #ffce00)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000',
              }}
            >
              <BoltIcon fontSize="small" />
            </Box>
            <Typography variant="h6" fontWeight="700" letterSpacing="0.5px">ENGAGE</Typography>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, pl: 2, letterSpacing: 1 }}>
            MAIN MENU
          </Typography>

          <Stack spacing={0.5}>
            <SidebarItem active={1} startIcon={<DashboardIcon />}>Dashboard</SidebarItem>
            <SidebarItem startIcon={<GroupIcon />}>Leads</SidebarItem>
            <SidebarItem startIcon={<ShoppingCartIcon />}>Purchase Order</SidebarItem>
            <SidebarItem startIcon={<ReceiptIcon />}>Reimbursement</SidebarItem>
            <SidebarItem startIcon={<SaveIcon />}>Saved Quotations</SidebarItem>
          </Stack>

          <Box mt="auto" pt={3} borderTop="1px solid rgba(255,255,255,0.05)" textAlign="center">
            <Typography variant="caption" color="text.secondary">© 2026 CRMS</Typography>
          </Box>
        </GlassPanel>

        {/* --- MAIN CONTENT --- */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, overflowY: 'auto', height: '100vh' }}>
          
          {/* Top Bar */}
          <GlassPanel sx={{ p: 2.5, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="600">Quotation Dashboard</Typography>
            
            <Box display="flex" alignItems="center" gap={2}>
              <TextField
                placeholder="Search..."
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment>),
                  sx: { background: 'rgba(0,0,0,0.2)', borderRadius: 30, py: 0.5, px: 2, color: '#fff', width: 250, border: '1px solid rgba(255,255,255,0.1)' }
                }}
              />
              <IconButton sx={{ color: '#fff' }}><NotificationsIcon /></IconButton>
              <Avatar sx={{ bgcolor: '#00CFE8', color: '#fff', width: 40, height: 40, fontSize: 14, fontWeight: 'bold' }}>AU</Avatar>
            </Box>
          </GlassPanel>

          {/* KPI Grid */}
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(4, 1fr)' }} gap={3} mb={3}>
            
            {/* KPI 1 */}
            <GlassPanel sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 160 }}>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body2" color="text.secondary">Total Quoted Value</Typography>
                <IconBox color="purple"><AttachMoneyIcon /></IconBox>
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="700" mb={1}>₹ 1.2 Cr</Typography>
                <Typography variant="body2" sx={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ArrowForwardIcon sx={{ transform: 'rotate(-45deg)', fontSize: 14 }} /> 12% <span style={{ color: '#a0a0c0' }}>vs last month</span>
                </Typography>
              </Box>
            </GlassPanel>

            {/* KPI 2 */}
            <GlassPanel sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 160 }}>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body2" color="text.secondary">Conversion Rate</Typography>
                <IconBox color="purple"><PieChartIcon /></IconBox>
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="700" mb={1}>24%</Typography>
                <LinearProgress variant="determinate" value={24} sx={{ bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#8b5cf6' }, height: 6, borderRadius: 3, mb: 1 }} />
                <Typography variant="caption" color="text.secondary">Target: 30% <span style={{ color: '#fbb03b' }}>Needs Attention</span></Typography>
              </Box>
            </GlassPanel>

            {/* KPI 3 */}
            <GlassPanel sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 160 }}>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body2" color="text.secondary">Quotations Pending</Typography>
                <IconBox color="blue"><AssignmentIcon /></IconBox>
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="700" mb={1}>12</Typography>
                <Typography variant="body2" sx={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BoltIcon sx={{ fontSize: 16 }} /> High Priority
                </Typography>
              </Box>
            </GlassPanel>

            {/* KPI 4 */}
            <GlassPanel sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 160 }}>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body2" color="text.secondary">Pending PO</Typography>
                <IconBox color="orange"><ShoppingCartIcon /></IconBox>
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="700" mb={1}>8 <Typography component="span" variant="body1" color="text.secondary">Quotes</Typography></Typography>
                <AvatarGroup max={4} sx={{ justifyContent: 'flex-start', '& .MuiAvatar-root': { width: 30, height: 30, fontSize: 12, border: '2px solid #24243e' } }}>
                  <Avatar sx={{ bgcolor: '#f97316' }}>JD</Avatar>
                  <Avatar sx={{ bgcolor: '#10b981' }}>AS</Avatar>
                  <Avatar sx={{ bgcolor: '#8b5cf6' }}>+5</Avatar>
                </AvatarGroup>
              </Box>
            </GlassPanel>
          </Box>

          {/* Revision Requests Table (Full Width) */}
          <GlassPanel sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ 
                  width: 48, height: 48, borderRadius: 3, bgcolor: 'rgba(249, 115, 22, 0.15)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  color: '#f97316', border: '1px solid rgba(249, 115, 22, 0.3)' 
                }}>
                  <WarningAmberIcon fontSize="medium" />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="600">Revision Requests</Typography>
                  <Typography variant="body2" sx={{ color: '#fbb03b' }}>Requires Immediate Attention</Typography>
                </Box>
              </Box>

              <Box display="flex" gap={2} alignItems="center">
                <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 30, p: 0.5, border: '1px solid rgba(255,255,255,0.1)' }}>
                  {['Pending', 'In Progress', 'Resolved'].map((tab) => (
                    <TabButton key={tab} active={activeTab === tab ? 1 : 0} onClick={() => setActiveTab(tab)}>
                      {tab}
                    </TabButton>
                  ))}
                </Box>
                <Button endIcon={<DownloadIcon />} sx={{ color: '#fbb03b', textTransform: 'none', fontWeight: 600 }}>Export List</Button>
              </Box>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <GlassTableCell>Quote ID</GlassTableCell>
                    <GlassTableCell>Client</GlassTableCell>
                    <GlassTableCell>Revised By</GlassTableCell>
                    <GlassTableCell sx={{ width: '35%' }}>Revision Reason</GlassTableCell>
                    <GlassTableCell align="center">Action</GlassTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {revisionRows.map((row) => (
                    <TableRow key={row.id}>
                      <GlassTableCell sx={{ color: row.idColor, fontWeight: 700 }}>{row.id}</GlassTableCell>
                      <GlassTableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Box sx={{ 
                            width: 36, height: 36, borderRadius: 2, bgcolor: row.clientColor, 
                            color: row.clientTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 
                          }}>
                            {row.clientInitials}
                          </Box>
                          <Typography variant="body2" fontWeight="600">{row.client}</Typography>
                        </Box>
                      </GlassTableCell>
                      <GlassTableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 36, height: 36, fontSize: 12, bgcolor: 'rgba(255,255,255,0.1)' }}>{row.revisedInitials}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="500">{row.revisedBy}</Typography>
                            <Typography variant="caption" color="text.secondary">{row.role}</Typography>
                          </Box>
                        </Box>
                      </GlassTableCell>
                      <GlassTableCell>
                        <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5 }}>{row.reasonTitle}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 300 }}>{row.reasonDesc}</Typography>
                      </GlassTableCell>
                      <GlassTableCell align="center">
                        <ViewButton startIcon={<VisibilityIcon />}>
                          View
                        </ViewButton>
                      </GlassTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassPanel>

          {/* Quick Margin Calculator (Full Width, Horizontal) */}
          <GlassPanel sx={{ p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4 }}>
            <Box display="flex" alignItems="center" gap={2} minWidth={200}>
              <IconBox color="green"><CalculateIcon /></IconBox>
              <Typography variant="h6" fontWeight="600">Quick Margin Calculator</Typography>
            </Box>

            <Box display="flex" flex={1} alignItems="center" gap={3} width="100%" justifyContent={{ xs: 'center', md: 'flex-end' }} flexWrap="wrap">
              
              {/* Inputs */}
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
                      defaultValue="10000" 
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
                      defaultValue="30" 
                      InputProps={{ disableUnderline: true, sx: { color: '#fff', fontWeight: 600 } }} 
                    />
                    <Typography color="text.secondary" ml={1}>%</Typography>
                  </Box>
                </Box>
              </Box>

              <ArrowForwardIcon sx={{ color: 'text.secondary', display: { xs: 'none', md: 'block' } }} />

              {/* Result */}
              <Box>
                <Typography variant="caption" color="text.secondary" mb={0.5} display="block">SELL PRICE</Typography>
                <Typography variant="h5" fontWeight="700">₹ 14,285</Typography>
              </Box>

              <Button 
                variant="contained" 
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