import React, { useState, useEffect, useMemo } from 'react';
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
  styled,
  CircularProgress,
  Snackbar,
  Alert
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
  '&.Mui-disabled': {
    background: 'rgba(16, 185, 129, 0.5)',
    color: 'rgba(255, 255, 255, 0.7)',
    boxShadow: 'none'
  }
});

// --- API HELPERS ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

const getInitials = (name) => {
  if (!name) return "U";
  return name.charAt(0).toUpperCase();
};

const getAvatarStyles = (type) => {
  if (type === 'Product') return { color: '#8b5cf6', shadow: 'rgba(139, 92, 246, 0.3)' };
  if (type === 'Service') return { color: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.3)' };
  return { color: '#f97316', shadow: 'rgba(249, 115, 22, 0.3)' };
};

// --- MAIN COMPONENT ---
const PurchaseOrder = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  // --- FETCH API ---
  const fetchPOLeads = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/v1/quotations/quotation-team`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
      } else {
        console.error("Failed to fetch leads");
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOLeads();
  }, []);

  // --- PO RECEIVED HANDLER ---
  const handlePOReceived = async (leadId) => {
    setProcessingId(leadId);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/v1/quotations/send-back`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          lead_id: leadId,
          new_lead_stage: "Won",
          assigned_employee: "0",
          reason: "Lead Won."
        })
      });

      if (response.ok) {
        setToast({ open: true, message: "Lead marked as Won successfully!", severity: "success" });
        fetchPOLeads(); // Refresh the list to remove it
      } else {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to update lead status.");
      }
    } catch (error) {
      console.error(error);
      setToast({ open: true, message: error.message || "An error occurred.", severity: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  // --- FILTERING LOGIC ---
  const displayedLeads = useMemo(() => {
    return leads.filter(lead => {
      // 1. STRICT REQUIREMENT: Must have Quotation Created AND PO Confirmed
      if (lead.quotation_created !== "Yes" || lead.po_confirmed !== "Yes") {
        return false;
      }

      // 2. Tab Filter (All, Product, Service)
      if (activeTab !== 'All' && lead.lead_type !== activeTab) {
        return false;
      }

      // 3. Search Bar Filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const compName = (lead.company_name || "").toLowerCase();
        const contactName = (lead.contact_person_name || "").toLowerCase();
        if (!compName.includes(q) && !contactName.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [leads, activeTab, searchQuery]);

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

          {/* Header Actions */}
          <Box display="flex" alignItems="center" gap={2} width={{ xs: '100%', md: 'auto' }}>
            <TextField
              placeholder="Search companies..."
              variant="standard"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              <Chip label={displayedLeads.length} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, ml: 1 }} />
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
                {loading ? (
                   <TableRow>
                     <TableCell colSpan={6} align="center" sx={{ py: 5, borderBottom: 'none' }}>
                       <CircularProgress sx={{ color: '#8b5cf6' }} />
                     </TableCell>
                   </TableRow>
                ) : displayedLeads.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={6} align="center" sx={{ py: 5, color: '#a0a0c0', borderBottom: 'none' }}>
                       No Pending Purchase Orders found.
                     </TableCell>
                   </TableRow>
                ) : (
                  displayedLeads.map((lead) => {
                    const avatarStyle = getAvatarStyles(lead.lead_type);
                    const isProcessing = processingId === lead.lead_id;

                    return (
                      <TableRow key={lead.lead_id}>
                        
                        {/* Company Info */}
                        <GlassTableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              variant="rounded"
                              sx={{
                                width: 44, height: 44, bgcolor: avatarStyle.color,
                                boxShadow: `0 4px 12px ${avatarStyle.shadow}`,
                                fontWeight: 700, fontSize: 15
                              }}
                            >
                              {getInitials(lead.company_name)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                {lead.company_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Contact: {lead.contact_person_name || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </GlassTableCell>

                        {/* Location */}
                        <GlassTableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PlaceIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {[lead.company_city, lead.company_state].filter(Boolean).join(', ') || 'N/A'}
                            </Typography>
                          </Box>
                        </GlassTableCell>

                        {/* Lead Type Pill */}
                        <GlassTableCell>
                          <Chip
                            label={lead.lead_type || 'Unknown'}
                            size="small"
                            sx={{
                              bgcolor: lead.lead_type === 'Product' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(160, 160, 192, 0.15)',
                              color: lead.lead_type === 'Product' ? '#8b5cf6' : '#a0a0c0',
                              border: `1px solid ${lead.lead_type === 'Product' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(160, 160, 192, 0.3)'}`,
                              fontWeight: 600, fontSize: '11px',
                            }}
                          />
                        </GlassTableCell>

                        {/* Status Text */}
                        <GlassTableCell>
                          <Typography variant="body2" fontWeight={600} sx={{ color: '#10b981' }}>
                            PO Confirmed
                          </Typography>
                        </GlassTableCell>

                        {/* Created By */}
                        <GlassTableCell>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: 11, bgcolor: 'rgba(255,255,255,0.1)' }}>
                              {getInitials(lead.created_by)}
                            </Avatar>
                            <Typography variant="body2">{lead.created_by || 'Unknown'}</Typography>
                          </Box>
                        </GlassTableCell>

                        {/* Action Button */}
                        <GlassTableCell align="right">
                          <POButton 
                            disabled={isProcessing}
                            startIcon={isProcessing ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon sx={{ fontSize: '16px !important' }} />}
                            onClick={() => handlePOReceived(lead.lead_id)}
                          >
                            {isProcessing ? 'Processing...' : 'PO Received'}
                          </POButton>
                        </GlassTableCell>

                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

        </GlassPanel>
      </Box>

      {/* GLOBAL TOAST */}
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} variant="filled" sx={{ borderRadius: '12px' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default PurchaseOrder;