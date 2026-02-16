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
  IconButton,
  Paper,
  Chip,
  createTheme,
  ThemeProvider,
  styled
} from '@mui/material';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import BoltIcon from '@mui/icons-material/Bolt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PlaceIcon from '@mui/icons-material/Place';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// --- THEME CONFIGURATION ---
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#8b5cf6' },
    background: { default: '#0f0c29' },
    text: { primary: '#ffffff', secondary: '#a0a0c0' },
    success: { main: '#10b981' },
    warning: { main: '#f97316' },
    info: { main: '#3b82f6' },
    error: { main: '#ef4444' },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
});

// --- STYLED COMPONENTS ---
const GlassPanel = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  borderRadius: 20,
  color: theme.palette.text.primary,
  overflow: 'hidden',
}));

const GlassTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  padding: '25px 16px', // Generous padding for alignment
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

const TabButton = styled(Button)(({ theme, active }) => ({
  borderRadius: 20,
  padding: '6px 20px',
  textTransform: 'none',
  fontSize: '13px',
  fontWeight: 500,
  color: active ? '#fff' : theme.palette.text.secondary,
  backgroundColor: active ? theme.palette.primary.main : 'transparent',
  boxShadow: active ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none',
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : 'rgba(255,255,255,0.05)',
  },
}));

const POButton = styled(Button)({
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  color: '#fff',
  borderRadius: 12,
  textTransform: 'none',
  fontSize: '13px',
  fontWeight: 600,
  padding: '8px 20px',
  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
  '&:hover': {
    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.6)',
  },
});

// --- DATA ---
const poRows = [
  {
    id: 1,
    company: 'Mahindra & Mahindra',
    contact: 'Mr. Rahul Sharma (Procurement)',
    location: 'Nashik',
    type: 'Product',
    status: 'Negotiation',
    statusColor: '#f97316', // Orange
    createdBy: 'Alex D.',
    logo: 'M',
    logoColor: '#ef4444',
    logoShadow: 'rgba(239, 68, 68, 0.3)',
  },
  {
    id: 2,
    company: 'Renuka Logistics',
    contact: 'Mrs. Priya Deshmukh',
    location: 'Pune',
    type: 'Service',
    status: 'New',
    statusColor: '#3b82f6', // Blue
    createdBy: 'Maria G.',
    logo: 'R',
    logoColor: '#3b82f6',
    logoShadow: 'rgba(59, 130, 246, 0.3)',
  },
  {
    id: 3,
    company: 'Quantum Solutions',
    contact: 'Amit Patel',
    location: 'Mumbai',
    type: 'Product',
    status: 'Qualified',
    statusColor: '#10b981', // Green
    createdBy: 'John K.',
    logo: 'Q',
    logoColor: '#8b5cf6', // Purple
    logoShadow: 'rgba(139, 92, 246, 0.3)',
  },
  {
    id: 4,
    company: 'TechSpace Park',
    contact: 'Emily Chen',
    location: 'Bangalore',
    type: 'Service',
    status: 'Urgent',
    statusColor: '#ef4444', // Red
    createdBy: 'Alex D.',
    logo: 'T',
    logoColor: '#f97316', // Orange
    logoShadow: 'rgba(249, 115, 22, 0.3)',
  },
];

// --- MAIN COMPONENT ---
const PurchaseOrder = () => {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
          backgroundAttachment: 'fixed',
          p: { xs: 2, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        
        {/* --- TOP BAR --- */}
        <GlassPanel sx={{ p: 2.5, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          {/* Breadcrumb Area */}
          <Box>
            <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
              <Box
                sx={{
                  width: 28, height: 28, borderRadius: 1,
                  background: 'linear-gradient(135deg, #fbb03b, #ffce00)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#000',
                }}
              >
                <BoltIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="h6" fontWeight="600">Pending Purchase Orders</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
              Manage incoming POs from qualified leads
            </Typography>
          </Box>

          {/* Header Actions (No Bell/Profile as requested) */}
          <Box display="flex" alignItems="center" gap={2} width={{ xs: '100%', md: 'auto' }}>
            <TextField
              placeholder="Search companies..."
              variant="standard"
              InputProps={{
                disableUnderline: true,
                startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment>),
                sx: {
                  background: 'rgba(0,0,0,0.2)', borderRadius: 30, py: 1, px: 2,
                  border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: { xs: '100%', md: 280 }
                }
              }}
              sx={{ width: { xs: '100%', md: 'auto' } }}
            />
            <IconButton sx={{ color: '#fff' }}>
              <FilterListIcon />
            </IconButton>
          </Box>
        </GlassPanel>

        {/* --- TABLE SECTION --- */}
        <GlassPanel sx={{ p: 3, minHeight: '80vh' }}>
          
          {/* Section Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 42, height: 42, borderRadius: 3, bgcolor: '#f97316',
                  boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                }}
              >
                <ShoppingCartIcon />
              </Box>
              <Typography variant="h6" fontWeight="600">New Orders</Typography>
            </Box>

            <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 0.5, borderRadius: 30, border: '1px solid rgba(255,255,255,0.1)' }}>
              {['All', 'Product', 'Service'].map((tab) => (
                <TabButton key={tab} active={activeTab === tab ? 1 : 0} onClick={() => setActiveTab(tab)}>
                  {tab}
                </TabButton>
              ))}
            </Box>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <GlassTableCell>Company Name</GlassTableCell>
                  <GlassTableCell>Location</GlassTableCell>
                  <GlassTableCell>Lead Type</GlassTableCell>
                  <GlassTableCell>Status</GlassTableCell>
                  <GlassTableCell>Created By</GlassTableCell>
                  <GlassTableCell align="right">Action</GlassTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {poRows.map((row) => (
                  <TableRow key={row.id}>
                    
                    {/* Company Info */}
                    <GlassTableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          variant="rounded"
                          sx={{
                            width: 44, height: 44, bgcolor: row.logoColor,
                            boxShadow: `0 4px 12px ${row.logoShadow}`,
                            fontWeight: 700, fontSize: 15
                          }}
                        >
                          {row.logo}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                            {row.company}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Contact: {row.contact}
                          </Typography>
                        </Box>
                      </Box>
                    </GlassTableCell>

                    {/* Location */}
                    <GlassTableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PlaceIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">{row.location}</Typography>
                      </Box>
                    </GlassTableCell>

                    {/* Lead Type Pill */}
                    <GlassTableCell>
                      <Chip
                        label={row.type}
                        size="small"
                        sx={{
                          bgcolor: row.type === 'Product' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(160, 160, 192, 0.15)',
                          color: row.type === 'Product' ? '#8b5cf6' : '#a0a0c0',
                          border: `1px solid ${row.type === 'Product' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(160, 160, 192, 0.3)'}`,
                          fontWeight: 600, fontSize: '11px',
                        }}
                      />
                    </GlassTableCell>

                    {/* Status Text */}
                    <GlassTableCell>
                      <Typography variant="body2" fontWeight={600} sx={{ color: row.statusColor }}>
                        {row.status}
                      </Typography>
                    </GlassTableCell>

                    {/* Created By */}
                    <GlassTableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 11, bgcolor: 'rgba(255,255,255,0.1)' }}>
                          {row.avatar}
                        </Avatar>
                        <Typography variant="body2">{row.createdBy}</Typography>
                      </Box>
                    </GlassTableCell>

                    {/* Action Button */}
                    <GlassTableCell align="right">
                      <POButton startIcon={<CheckCircleIcon sx={{ fontSize: '16px !important' }} />}>
                        PO Received
                      </POButton>
                    </GlassTableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

        </GlassPanel>
      </Box>
    </ThemeProvider>
  );
};

export default PurchaseOrder;