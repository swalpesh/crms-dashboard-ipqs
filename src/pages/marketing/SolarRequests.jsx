import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Chip, Avatar, CircularProgress, 
  InputBase, MenuItem, Select, FormControl, Snackbar, Alert,
  useTheme, useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  VisibilityOutlined as VisibilityIcon,
  CalendarTodayOutlined as CalendarIcon
} from '@mui/icons-material';

// --- API HELPERS ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

// --- STYLES CONSTANTS ---
const pageStyle = {
  minHeight: '100vh',
  background: '#0f0c29',
  backgroundImage: `radial-gradient(circle at 15% 50%, rgba(76, 29, 149, 0.15) 0%, transparent 50%), radial-gradient(circle at 85% 30%, rgba(37, 99, 235, 0.1) 0%, transparent 50%)`,
  color: '#ffffff',
  fontFamily: "'Inter', sans-serif",
  p: { xs: 2, md: 4 },
};

const cardStyle = {
  background: 'rgba(30, 32, 55, 0.6)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '16px',
  p: 2.5,
  mb: 2,
  display: 'grid',
  // Adjusted grid for 7 columns to fit the new Lead Stage
  gridTemplateColumns: { xs: '1fr', md: '2.5fr 1fr 1fr 1.2fr 1.2fr 2.5fr 0.8fr' },
  alignItems: 'center',
  gap: 2,
  transition: 'all 0.2s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    background: 'rgba(40, 42, 70, 0.8)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
  }
};

const inputStyle = {
  bgcolor: 'rgba(255,255,255,0.05)',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  px: 2,
  py: 0.5,
  display: 'flex',
  alignItems: 'center',
  '&:hover': { borderColor: 'rgba(255,255,255,0.2)' }
};

// --- FORMATTERS ---
const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return "₹0.00";
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (timeStr) => {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':');
  if (!hours || !minutes) return null;
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

// --- MAIN COMPONENT ---
export default function FollowUps() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Extract unique departments from the fetched leads for the filter dropdown
  const allDepartments = useMemo(() => {
    const depts = leads.map(l => l.lead_stage).filter(Boolean);
    return [...new Set(depts)].sort();
  }, [leads]);

  // --- FETCH API ---
  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/leads/admin/follow-up`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (response.ok) {
        setLeads(result.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch follow-ups");
      }
    } catch (err) {
      console.error(err);
      setToast({ open: true, message: err.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  // --- FILTERING ---
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const q = searchQuery.toLowerCase();
      const company = (lead.company_name || "").toLowerCase();
      const contact = (lead.contact_person_name || "").toLowerCase();
      
      const matchesSearch = company.includes(q) || contact.includes(q);
      const matchesDept = deptFilter === "All Departments" || lead.lead_stage === deptFilter;

      return matchesSearch && matchesDept;
    });
  }, [leads, searchQuery, deptFilter]);

  // --- COLOR HELPERS ---
  const getPriorityProps = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return { bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' };
      case 'medium': return { bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'low': return { bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' };
      default: return { bgcolor: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)' };
    }
  };

  const getTypeProps = (type) => {
    switch (type?.toLowerCase()) {
      case 'service': return { bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' };
      case 'product': return { bgcolor: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' };
      default: return { bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' };
    }
  };

  return (
    <Box sx={pageStyle}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        
        {/* --- HEADER --- */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' }, 
          gap: 3, 
          mb: 4,
          bgcolor: 'rgba(30, 32, 55, 0.8)',
          p: 2.5,
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" fontWeight={800} color="#fff">Follow-Up's</Typography>
            <Chip label={`${filteredLeads.length} Pending`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }} />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
            <Box sx={{ ...inputStyle, flex: 1, minWidth: { md: '300px' } }}>
              <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1, fontSize: 20 }} />
              <InputBase 
                placeholder="Search leads or contacts..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ color: '#fff', width: '100%', fontSize: '14px' }} 
              />
            </Box>
            
            <FormControl size="small">
              <Select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                sx={{ 
                  ...inputStyle, 
                  py: 0, 
                  fontSize: '14px', 
                  minWidth: '180px',
                  '& .MuiSelect-select': { py: 1 },
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' } 
                }}
                MenuProps={{ PaperProps: { sx: { bgcolor: '#1a1625', color: '#fff' } } }}
              >
                <MenuItem value="All Departments">All Departments</MenuItem>
                {allDepartments.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* --- LIST HEADER ROW --- */}
        {!isMobile && (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: '2.5fr 1fr 1fr 1.2fr 1.2fr 2.5fr 0.8fr', 
            gap: 2, 
            px: 3, 
            pb: 2, 
            color: 'rgba(255,255,255,0.5)', 
            fontSize: '12px', 
            fontWeight: 700, 
            letterSpacing: '0.5px' 
          }}>
            <Box>LEAD / CONTACT PERSON</Box>
            <Box>PRIORITY</Box>
            <Box>LEAD TYPE</Box>
            <Box>EXPECTED REV.</Box>
            <Box>LEAD STAGE</Box>
            <Box>FOLLOW-UP DETAILS</Box>
            <Box textAlign="right">ACTIONS</Box>
          </Box>
        )}

        {/* --- LIST ITEMS --- */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress sx={{ color: '#3b82f6' }} />
          </Box>
        ) : filteredLeads.length === 0 ? (
          <Box textAlign="center" py={10} color="rgba(255,255,255,0.5)">
            <Typography variant="h6">No pending follow-ups found.</Typography>
          </Box>
        ) : (
          filteredLeads.map((lead) => {
            const pProps = getPriorityProps(lead.lead_priority);
            const tProps = getTypeProps(lead.lead_type);
            
            const fDate = formatDate(lead.follow_up_date);
            const fTime = formatTime(lead.follow_up_time);

            return (
              <Box key={lead.lead_id} sx={cardStyle}>
                {/* Blue Left Border Accent */}
                <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', bgcolor: '#3b82f6', borderTopLeftRadius: '16px', borderBottomLeftRadius: '16px' }} />

                {/* COL 1: Lead Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pl: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontWeight: 'bold' }}>
                    {lead.company_name?.charAt(0).toUpperCase() || 'L'}
                  </Avatar>
                  <Box>
                    <Typography fontWeight={700} fontSize="15px" color="#fff" noWrap>
                      {lead.company_name}
                    </Typography>
                    <Typography fontSize="13px" color="rgba(255,255,255,0.5)" noWrap>
                      {lead.contact_person_name || 'No Contact Person'}
                    </Typography>
                  </Box>
                </Box>

                {/* COL 2: Priority */}
                <Box>
                  <Chip label={lead.lead_priority || 'N/A'} size="small" sx={{ ...pProps, fontWeight: 700, fontSize: '11px', borderRadius: '6px' }} />
                </Box>

                {/* COL 3: Lead Type */}
                <Box>
                  <Chip label={lead.lead_type || 'N/A'} size="small" sx={{ ...tProps, fontWeight: 700, fontSize: '11px', borderRadius: '6px' }} />
                </Box>

                {/* COL 4: Expected Revenue */}
                <Box>
                  <Typography fontWeight={700} fontSize="14px" sx={{ color: '#10b981' }}>
                    {formatCurrency(lead.expected_revenue)}
                  </Typography>
                </Box>

                {/* COL 5: Lead Stage */}
                <Box>
                  <Typography fontWeight={600} fontSize="13px" sx={{ color: '#fff' }}>
                    {lead.lead_stage || 'N/A'}
                  </Typography>
                </Box>

                {/* COL 6: Follow-Up Details */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <CalendarIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 18, mt: 0.2 }} />
                  <Box>
                    {fDate ? (
                      <Typography fontWeight={600} fontSize="14px" color="#fff">
                        {fDate} <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>at {fTime || '-'}</span>
                      </Typography>
                    ) : (
                      <Typography fontWeight={600} fontSize="14px" color="#fff">
                        Not Set <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>at -</span>
                      </Typography>
                    )}
                    <Typography fontSize="12px" color="rgba(255,255,255,0.5)" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {lead.follow_up_reason || 'No reason provided'}
                    </Typography>
                  </Box>
                </Box>

                {/* COL 7: Actions */}
                <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  <Button 
                    size="small" 
                    onClick={() => navigate(`/marketing/customer-info/${lead.lead_id}`)}
                    sx={{ color: '#60a5fa', textTransform: 'none', minWidth: 'auto', p: 1, '&:hover': { bgcolor: 'rgba(96,165,250,0.1)' } }}
                  >
                    <VisibilityIcon fontSize="small" sx={{ mr: 0.5 }} /> View
                  </Button>
                </Box>

              </Box>
            );
          })
        )}

      </Box>

      {/* --- TOAST --- */}
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: '12px', width: '100%', border: '1px solid rgba(255,255,255,0.1)' }} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}