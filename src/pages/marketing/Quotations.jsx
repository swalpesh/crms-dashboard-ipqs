import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, InputBase, Avatar, 
  Button, Chip, useTheme, useMediaQuery,
  Snackbar, Alert, CircularProgress,
  Stack, Grid, TextField, MenuItem, Collapse
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { 
  MagnifyingGlass, MapPin, Funnel, Receipt, PaperPlaneRight
} from "@phosphor-icons/react";

// --- API HELPERS ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const AnimatedCounter = ({ end, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return <>{count.toLocaleString()}</>;
};

const QuotationLeads = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false); 
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [pushingLeadId, setPushingLeadId] = useState(null); // Track which lead is currently being pushed

  // Data & Filters
  const [leads, setLeads] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [filterCountry, setFilterCountry] = useState("All");
  const [filterState, setFilterState] = useState("All");
  const [filterCity, setFilterCity] = useState("All");
  const [filterQuotated, setFilterQuotated] = useState("No"); // DEFAULT IS NOW "No" (Pending)

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // --- 1. FETCH LEADS ---
  const fetchLeads = async () => {
    setLoadingData(true);
    try {
        const token = getToken();
        if(!token) return;
        
        const response = await fetch(`${API_BASE_URL}/api/v1/quotations/quotation-team`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            setLeads(data.leads || []);
        }
    } catch (error) { 
        console.error("API Error:", error); 
        setToast({ open: true, message: "Failed to fetch leads.", severity: "error" });
    } finally { 
        setLoadingData(false); 
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  // Compute Pending Stats Dynamically (Excluding PO Confirmed ones)
  const pendingCount = useMemo(() => {
    return leads.filter(l => l.quotation_created !== "Yes" && l.po_confirmed !== "Yes").length;
  }, [leads]);


  // ==========================================
  //  🔍 DYNAMIC FILTER LOGIC (Derived from Leads)
  // ==========================================
  
  const uniqueCountries = useMemo(() => {
    const allCountries = leads.map(l => l.company_country).filter(Boolean); 
    return [...new Set(allCountries)].sort(); 
  }, [leads]);

  const uniqueStates = useMemo(() => {
    if (filterCountry === "All") return [];
    const relevantLeads = leads.filter(l => l.company_country === filterCountry);
    const allStates = relevantLeads.map(l => l.company_state).filter(Boolean);
    return [...new Set(allStates)].sort();
  }, [leads, filterCountry]);

  const uniqueCities = useMemo(() => {
    if (filterState === "All") return [];
    const relevantLeads = leads.filter(l => 
        (filterCountry === "All" || l.company_country === filterCountry) && 
        l.company_state === filterState
    );
    const allCities = relevantLeads.map(l => l.company_city).filter(Boolean);
    return [...new Set(allCities)].sort();
  }, [leads, filterCountry, filterState]);

  const handleFilterCountryChange = (val) => {
    setFilterCountry(val); setFilterState("All"); setFilterCity("All");
  };

  const handleFilterStateChange = (val) => {
    setFilterState(val); setFilterCity("All");
  };

  // --- Filtering Logic ---
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
        const matchesSearch = (lead.company_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || (lead.lead_name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchesCountry = filterCountry === "All" || lead.company_country === filterCountry;
        const matchesState = filterState === "All" || lead.company_state === filterState;
        const matchesCity = filterCity === "All" || lead.company_city === filterCity;
        const matchesQuotated = filterQuotated === "All" || lead.quotation_created === filterQuotated;
        
        // Hide leads that already have PO confirmed
        const matchesPo = lead.po_confirmed !== "Yes";

        return matchesSearch && matchesCountry && matchesState && matchesCity && matchesQuotated && matchesPo;
    });
  }, [leads, searchTerm, filterCountry, filterState, filterCity, filterQuotated]);

  // Styles
  const glassPanel = { background: 'rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)', borderRadius: '16px' };
  
  const filterInputStyle = {
    "& .MuiOutlinedInput-root": { 
        color: "#fff", bgcolor: "rgba(0,0,0,0.2)", borderRadius: '8px', height: '40px', fontSize: '0.85rem',
        "& fieldset": { borderColor: "rgba(255,255,255,0.1)" }, 
        "&:hover fieldset": { borderColor: "#3b82f6" }, 
        "&.Mui-focused fieldset": { borderColor: "#3b82f6" } 
    },
    "& .MuiInputLabel-root": { color: "#a0a0c0", fontSize: '0.8rem', top: '-4px' }, 
    "& .MuiSvgIcon-root": { color: "#3b82f6" }
  };

  const handleViewClick = (id) => navigate(`/marketing/customer-info/${id}`);
  
  // --- Push Followup API Logic ---
  const handlePushFollowup = async (id) => {
    setPushingLeadId(id);
    try {
      const token = getToken();
      if (!token) throw new Error("Missing authentication token.");

      // 1. Fetch Lead Origin Information
      const originRes = await fetch(`${API_BASE_URL}/api/leads/${id}/origin`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!originRes.ok) {
        throw new Error("Failed to fetch lead origin details.");
      }

      const originData = await originRes.json();
      const firstAssignment = originData.first_assignment;

      if (!firstAssignment || !firstAssignment.department || !firstAssignment.employee_id) {
        throw new Error("Missing origin department or employee assignment. Cannot push back.");
      }

      // 2. Patch Lead Back to Origin
      const pushRes = await fetch(`${API_BASE_URL}/api/v1/quotations/send-back`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lead_id: id,
          new_lead_stage: firstAssignment.department,
          assigned_employee: firstAssignment.employee_id,
          reason: "Quotation is ready! Please follow up with the client."
        })
      });

      if (!pushRes.ok) {
        throw new Error("Failed to push lead back to origin.");
      }

      // 3. Success Feedback & Refresh
      setToast({ open: true, message: `Successfully pushed lead back to ${firstAssignment.department}!`, severity: "success" });
      fetchLeads(); // Refresh the table automatically

    } catch (error) {
      console.error("Push Error:", error);
      setToast({ open: true, message: error.message || "Failed to push lead.", severity: "error" });
    } finally {
      setPushingLeadId(null);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: '#fff', p: { xs: 2, md: 4 }, fontFamily: "'Inter', sans-serif" }}>

      <Box sx={{ maxWidth: 1400, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* --- Combined Header & Filters Card --- */}
        <Box sx={{ ...glassPanel, p: 3, display: 'flex', flexDirection: 'column' }}>
          
          {/* Top Row: Titles, Stats, and Actions */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 3, width: '100%' }}>
            
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="h5" fontWeight={600}>Quotation Leads</Typography>
                <Typography variant="body2" sx={{ color: '#a0a0c0' }}>Manage leads ready for quotation processing</Typography>
            </Box>

            {!isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#a0a0c0', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Pending Quotations</Typography>
                        <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5, color: '#3b82f6' }}>
                          <AnimatedCounter end={pendingCount} />
                        </Typography>
                    </Box>
                </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', md: 'auto' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, px: 2, py: 1, border: '1px solid rgba(255,255,255,0.05)', flex: 1, minWidth: { md: 200 } }}>
                    <MagnifyingGlass size={20} color="#a0a0c0" />
                    <InputBase placeholder="Search companies or leads..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ ml: 1, color: '#fff', fontSize: 14, width: '100%' }} />
                </Box>
                
                {/* Filter Toggle Button */}
                <Button 
                  variant={showFilters ? "contained" : "outlined"} 
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{
                    minWidth: 0, p: 1.1,
                    bgcolor: showFilters ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: showFilters ? '#60a5fa' : '#a0a0c0',
                    borderRadius: 2,
                    '&:hover': { borderColor: '#3b82f6', color: '#60a5fa', bgcolor: 'rgba(59, 130, 246, 0.1)' }
                  }}
                >
                  <Funnel size={22} weight={showFilters ? "fill" : "regular"} />
                </Button>
            </Box>
          </Box>

          {/* Collapsible Filter Section */}
          <Collapse in={showFilters}>
            <Box sx={{ pt: 3, mt: 3, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                  <Box display="flex" alignItems="center" gap={1.5} color="#a0a0c0" minWidth={100}>
                    <Funnel size={22} weight="duotone" color="#3b82f6" />
                    <Typography variant="body2" fontWeight={600} letterSpacing={0.5} sx={{textTransform: 'uppercase', fontSize: '0.75rem'}}>Filters:</Typography>
                  </Box>
                  <Grid container spacing={2} sx={{ width: '100%' }}>
                      <Grid item xs={6} md={3}>
                          <TextField select fullWidth size="small" label="Quotation Status" value={filterQuotated} onChange={(e) => setFilterQuotated(e.target.value)} sx={filterInputStyle}>
                              <MenuItem value="All">All Leads</MenuItem>
                              <MenuItem value="Yes">Quotated</MenuItem>
                              <MenuItem value="No">Pending</MenuItem>
                          </TextField>
                      </Grid>
                      <Grid item xs={6} md={3}>
                          <TextField select fullWidth size="small" label="Country" value={filterCountry} onChange={(e) => handleFilterCountryChange(e.target.value)} sx={filterInputStyle}>
                              <MenuItem value="All">All Countries</MenuItem>
                              {uniqueCountries.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                          </TextField>
                      </Grid>
                      <Grid item xs={6} md={3}>
                          <TextField select fullWidth size="small" label="State" value={filterState} onChange={(e) => handleFilterStateChange(e.target.value)} sx={filterInputStyle} disabled={filterCountry === "All"}>
                              <MenuItem value="All">All States</MenuItem>
                              {uniqueStates.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                          </TextField>
                      </Grid>
                      <Grid item xs={6} md={3}>
                          <TextField select fullWidth size="small" label="City" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} sx={filterInputStyle} disabled={filterState === "All"}>
                              <MenuItem value="All">All Cities</MenuItem>
                              {uniqueCities.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                          </TextField>
                      </Grid>
                  </Grid>
              </Stack>
            </Box>
          </Collapse>
        </Box>

        {/* --- LEADS TABLE VIEWS --- */}
        <Box sx={{ ...glassPanel, p: { xs: 2, md: 3 }, maxHeight: '75vh', overflowY: 'auto', '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '10px' } }}>
          
          {loadingData ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
          ) : filteredLeads.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 5, color: '#a0a0c0' }}>
                  {filterQuotated === "No" ? "No pending quotations found." : "No leads found matching your search."}
              </Box>
          ) : (
              <>
                  {!isMobile && (
                      <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 2fr 2.5fr 1.5fr 1.5fr', alignItems: 'center', pb: 2, mb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#a0a0c0', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', position: 'sticky', top: 0, zIndex: 2, backdropFilter: 'blur(10px)', background: 'rgba(25, 25, 55, 0.9)' }}>
                          <Box sx={{ pl: 2 }}>Company & Lead Name</Box>
                          <Box>Location</Box>
                          <Box>Contact Person</Box>
                          <Box>Stage</Box>
                          <Box sx={{ textAlign: 'right', pr: 2 }}>Action</Box>
                      </Box>
                  )}
                  
                  {filteredLeads.map((lead) => {
                      const isPushing = pushingLeadId === lead.lead_id;

                      return (
                          <Box key={lead.lead_id} sx={{ position: 'relative', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 2fr 2.5fr 1.5fr 1.5fr' }, alignItems: 'center', gap: { xs: 1, md: 2 }, p: 2, mb: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, transition: 'all 0.2s ease', border: '1px solid transparent', overflow: 'hidden', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)', transform: 'translateY(-2px)' } }}>
                              
                              {/* QUOTATED BADGE CORNER */}
                              {lead.quotation_created === "Yes" && (
                                <Box sx={{
                                  position: 'absolute', top: 10, left: -25, width: 90, textAlign: 'center',
                                  transform: 'rotate(-45deg)', bgcolor: '#c084fc', color: '#1a1a2e',
                                  fontSize: '0.55rem', fontWeight: 800, letterSpacing: 0.5, py: 0.3, zIndex: 1,
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}>
                                  QUOTATED
                                </Box>
                              )}

                              {/* 1. Company & Lead Name */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pl: { md: 3 } }}>
                                  <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: 16, fontWeight: 700, width: 38, height: 38 }}>
                                    {lead.company_name?.charAt(0).toUpperCase() || 'C'}
                                  </Avatar>
                                  <Box overflow="hidden">
                                      <Typography variant="body2" fontWeight={700} color="#fff" noWrap>{lead.company_name}</Typography>
                                      <Typography variant="caption" sx={{ color: '#a0a0c0', display: 'block' }} noWrap>{lead.lead_name}</Typography>
                                  </Box>
                              </Box>

                              {/* 2. Location */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#ddd', fontSize: 13 }}>
                                  <MapPin weight="fill" color="#a0a0c0" />
                                  <Typography variant="body2" noWrap sx={{ fontSize: 13 }}>
                                    {[lead.company_city, lead.company_state].filter(Boolean).join(', ') || 'N/A'}
                                  </Typography>
                              </Box>

                              {/* 3. Contact Person */}
                              <Box overflow="hidden">
                                  <Typography variant="body2" fontSize={13} color="#e2e8f0" fontWeight={500} noWrap>
                                    {lead.contact_person_name || 'N/A'}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }} noWrap>
                                    {lead.contact_person_email || lead.contact_person_phone || 'No Contact Info'}
                                  </Typography>
                              </Box>

                              {/* 4. Stage */}
                              <Box>
                                  <Chip 
                                    icon={<Receipt size={14} weight="bold" />}
                                    label={lead.lead_stage?.replace('-', ' ') || 'Quotation'} 
                                    size="small" 
                                    sx={{ 
                                      height: 24, fontSize: 10, fontWeight: 700, 
                                      bgcolor: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa',
                                      border: '1px solid rgba(139, 92, 246, 0.3)',
                                      '& .MuiChip-icon': { color: '#a78bfa' }
                                    }} 
                                  />
                              </Box>

                              {/* 5. Action (View + Push Followup - Conditional) */}
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' }, pr: { md: 2 } }}>
                                  <Button 
                                    onClick={() => handleViewClick(lead.lead_id)} 
                                    variant="outlined" 
                                    size="small" 
                                    sx={{ 
                                      minWidth: 0, px: 2, py: 0.5, textTransform: 'none', 
                                      color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.4)', borderRadius: 2, fontSize: 12, fontWeight: 600,
                                      '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)', borderColor: '#3b82f6' } 
                                    }}
                                  >
                                    View
                                  </Button>
                                  
                                  {lead.quotation_created === "Yes" && (
                                    <Button 
                                      onClick={() => handlePushFollowup(lead.lead_id)} 
                                      variant="contained" 
                                      size="small" 
                                      disabled={isPushing}
                                      endIcon={isPushing ? <CircularProgress size={14} color="inherit" /> : <PaperPlaneRight weight="bold" />}
                                      sx={{ 
                                        minWidth: 0, px: 2, py: 0.5, textTransform: 'none', 
                                        bgcolor: '#f59e0b', color: '#1a1a2e', borderRadius: 2, fontSize: 12, fontWeight: 700,
                                        boxShadow: '0 4px 10px rgba(245, 158, 11, 0.2)',
                                        '&:hover': { bgcolor: '#d97706' },
                                        '&.Mui-disabled': { bgcolor: 'rgba(245, 158, 11, 0.5)', color: 'rgba(26, 26, 46, 0.5)' }
                                      }}
                                    >
                                      {isPushing ? 'Pushing...' : 'Push'}
                                    </Button>
                                  )}
                              </Box>
                          </Box>
                      )
                  })}
              </>
          )}
        </Box>
      </Box>

      <Snackbar open={toast.open} autoHideDuration={6000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: '12px', width: '100%' }}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default QuotationLeads;