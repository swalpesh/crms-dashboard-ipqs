import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, InputBase, Avatar, 
  Button, Chip, useTheme, useMediaQuery,
  Snackbar, Alert, CircularProgress,
  Stack, Grid, TextField, MenuItem, Tabs, Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { 
  MagnifyingGlass, MapPin, Fire, Funnel, Lightbulb
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

// --- CUSTOM DATE/TIME FORMATTER ---
const formatSolutionDateTime = (dateStr, timeStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    let timeFormatted = "";
    
    if (timeStr) {
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'pm' : 'am';
      const h12 = h % 12 || 12;
      timeFormatted = `${h12}:${minutes} ${ampm}`;
    }
    
    return `${day} ${month} ${year} ${timeFormatted}`.trim();
  } catch (e) {
    return dateStr; // fallback if parsing fails
  }
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

const SolutionLeads = () => {
  const [activeTab, setActiveTab] = useState(0); // 0 = New Leads, 1 = Solutions Provided
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  // Data & Filters
  const [leads, setLeads] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState({ total: 0, hot: 0 });

  const [filterType, setFilterType] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterCountry, setFilterCountry] = useState("All");
  const [filterState, setFilterState] = useState("All");
  const [filterCity, setFilterCity] = useState("All");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // --- 1. FETCH LEADS ---
  const fetchLeads = async () => {
    setLoadingData(true);
    try {
        const token = getToken();
        if(!token) return;
        
        // Dynamically change API endpoint based on tab selected
        // New Leads = 'new', Solutions Provided = 'progress'
        const endpointStatus = activeTab === 0 ? 'new' : 'progress';

        // Choose API path based on tab to ensure we use the correct structure
        let apiUrl = `${API_BASE_URL}/api/sleads/my-leads?lead_status=${endpointStatus}`;
        if (activeTab === 1) {
            apiUrl = `${API_BASE_URL}/api/sleads/solutions`;
        }

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            if (activeTab === 0) {
                setLeads(data.leads || []);
                setStats({ total: data.total || 0, hot: data.leads?.filter(l => l.mark_as_hot_lead === 1).length || 0 });
            } else {
                setLeads(data.data || []); // Mapping to data.data from the Solutions API
                setStats({ total: data.total_solutions || 0, hot: 0 });
            }
        }
    } catch (error) { console.error("API Error:", error); } finally { setLoadingData(false); }
  };

  useEffect(() => { fetchLeads(); }, [activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchTerm(""); // Reset search when switching tabs
  };


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
        const matchesType = filterType === "All" || lead.lead_type === filterType;
        const matchesPriority = filterPriority === "All" || lead.lead_priority === filterPriority;
        const matchesCountry = filterCountry === "All" || lead.company_country === filterCountry;
        const matchesState = filterState === "All" || lead.company_state === filterState;
        const matchesCity = filterCity === "All" || lead.company_city === filterCity;

        return matchesSearch && matchesType && matchesPriority && matchesCountry && matchesState && matchesCity;
    });
  }, [leads, searchTerm, filterType, filterPriority, filterCountry, filterState, filterCity]);

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

  const getPriorityColor = (p) => {
    switch(p?.toLowerCase()) {
        case 'high': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' };
        case 'medium': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' };
        case 'low': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' };
        default: return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' };
    }
  };

  const handleViewClick = (id) => navigate(`/marketing/customer-info/${id}`);

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: '#fff', p: { xs: 2, md: 4 }, fontFamily: "'Inter', sans-serif" }}>

      <Box sx={{ maxWidth: 1400, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* --- Top Level Tabs --- */}
        <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ '& .MuiTabs-indicator': { backgroundColor: '#c084fc', height: '3px', borderRadius: '3px 3px 0 0' } }}>
                <Tab label="New Leads" sx={{ color: '#94a3b8', '&.Mui-selected': { color: '#c084fc', fontWeight: 'bold' }, textTransform: 'none', fontSize: '1.05rem', mr: 2 }} />
                <Tab label="Solutions Provided" sx={{ color: '#94a3b8', '&.Mui-selected': { color: '#c084fc', fontWeight: 'bold' }, textTransform: 'none', fontSize: '1.05rem' }} />
            </Tabs>
        </Box>

        {/* --- Header Card --- */}
        <Box sx={{ ...glassPanel, p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 3 }}>
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h5" fontWeight={600}>{activeTab === 0 ? 'Company Leads' : 'Solutions Provided'}</Typography>
              <Typography variant="body2" sx={{ color: '#a0a0c0' }}>{activeTab === 0 ? 'Manage your newly assigned leads' : 'Review leads you have processed'}</Typography>
          </Box>

          {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#a0a0c0', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Total Leads</Typography>
                      <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}><AnimatedCounter end={stats.total} /></Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#a0a0c0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                          <Fire weight="fill" color="#f97316" /> HOT LEADS
                      </Typography>
                      <Typography variant="h5" fontWeight={800} color="#f97316" sx={{ mt: 0.5 }}><AnimatedCounter end={stats.hot} /></Typography>
                  </Box>
              </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', md: 'auto' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, px: 2, py: 1, border: '1px solid rgba(255,255,255,0.05)', flex: 1, minWidth: { md: 200 } }}>
                  <MagnifyingGlass size={20} color="#a0a0c0" />
                  <InputBase placeholder="Search companies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ ml: 1, color: '#fff', fontSize: 14, width: '100%' }} />
              </Box>
          </Box>
        </Box>

        {/* --- Filters (Dynamic & HIDDEN ON MOBILE) --- */}
        <Box sx={{ ...glassPanel, p: 2, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', display: { xs: 'none', md: 'block' } }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                <Box display="flex" alignItems="center" gap={1.5} color="#a0a0c0" minWidth={100}><Funnel size={22} weight="duotone" color="#3b82f6" /><Typography variant="body2" fontWeight={600} letterSpacing={0.5} sx={{textTransform: 'uppercase', fontSize: '0.75rem'}}>Filters:</Typography></Box>
                <Grid container spacing={2} sx={{ width: '100%' }}>
                    <Grid item xs={6} md={2.4}><TextField select fullWidth size="small" label="Lead Type" value={filterType} onChange={(e) => setFilterType(e.target.value)} sx={filterInputStyle}><MenuItem value="All">All Types</MenuItem><MenuItem value="Product">Product</MenuItem><MenuItem value="Service">Service</MenuItem></TextField></Grid>
                    <Grid item xs={6} md={2.4}><TextField select fullWidth size="small" label="Priority" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} sx={filterInputStyle}><MenuItem value="All">All Priorities</MenuItem><MenuItem value="High">High</MenuItem><MenuItem value="Medium">Medium</MenuItem><MenuItem value="Low">Low</MenuItem></TextField></Grid>
                    
                    {/* DYNAMIC FILTER MENUS */}
                    <Grid item xs={6} md={2.4}>
                        <TextField select fullWidth size="small" label="Country" value={filterCountry} onChange={(e) => handleFilterCountryChange(e.target.value)} sx={filterInputStyle}>
                            <MenuItem value="All">All Countries</MenuItem>
                            {uniqueCountries.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={6} md={2.4}>
                        <TextField select fullWidth size="small" label="State" value={filterState} onChange={(e) => handleFilterStateChange(e.target.value)} sx={filterInputStyle} disabled={filterCountry === "All"}>
                            <MenuItem value="All">All States</MenuItem>
                            {uniqueStates.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={6} md={2.4}>
                        <TextField select fullWidth size="small" label="City" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} sx={filterInputStyle} disabled={filterState === "All"}>
                            <MenuItem value="All">All Cities</MenuItem>
                            {uniqueCities.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                        </TextField>
                    </Grid>
                </Grid>
            </Stack>
        </Box>

        {/* --- LEADS TABLE VIEWS --- */}
        <Box sx={{ ...glassPanel, p: { xs: 2, md: 3 }, maxHeight: '75vh', overflowY: 'auto', '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '10px' } }}>
          
          {loadingData ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
          ) : filteredLeads.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 5, color: '#a0a0c0' }}>No leads found matching your filters.</Box>
          ) : (
              <>
                {/* 1. New Leads Layout */}
                {activeTab === 0 && (
                    <>
                        {!isMobile && (
                            <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 2fr 1fr 1fr 2fr 0.6fr', alignItems: 'center', pb: 2, mb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#a0a0c0', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', position: 'sticky', top: 0, zIndex: 2, backdropFilter: 'blur(10px)', background: 'rgba(25, 25, 55, 0.9)' }}>
                                <Box sx={{ pl: 2 }}>Company & Contact</Box><Box>Location</Box><Box>Type</Box><Box>Priority</Box><Box>Created By</Box><Box sx={{ textAlign: 'right', pr: 2 }}>Action</Box>
                            </Box>
                        )}
                        
                        {filteredLeads.map((lead) => {
                            const priorityStyle = getPriorityColor(lead.lead_priority);
                            return (
                                <Box key={lead.lead_id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 2fr 1fr 1fr 2fr 0.6fr' }, alignItems: 'center', gap: { xs: 1, md: 0 }, p: 2, mb: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, transition: 'all 0.2s ease', border: '1px solid transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)', transform: 'translateY(-2px)' } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pl: { md: 2 } }}>
                                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16, fontWeight: 700, width: 36, height: 36 }}>{lead.company_name?.charAt(0).toUpperCase()}</Avatar>
                                        <Box overflow="hidden"><Typography variant="body2" fontWeight={600} noWrap>{lead.company_name}</Typography><Typography variant="caption" sx={{ color: '#a0a0c0', display: 'block' }} noWrap>{lead.contact_person_name}</Typography></Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#ddd', fontSize: 13 }}><MapPin weight="fill" color="#a0a0c0" /><Typography variant="body2" noWrap sx={{ fontSize: 13 }}>{lead.company_city}, {lead.company_state}</Typography></Box>
                                    <Box><Chip label={lead.lead_type || 'N/A'} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 600, bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' }} /></Box>
                                    <Box><Chip label={lead.lead_priority || 'Medium'} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 600, bgcolor: priorityStyle.bg, color: priorityStyle.text }} /></Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Avatar sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 700, bgcolor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.4)' }}>{getInitials(lead.created_by)}</Avatar><Typography variant="body2" fontSize={13} color="#e2e8f0">{lead.created_by || "Unknown"}</Typography></Box>
                                    <Box sx={{ textAlign: { xs: 'left', md: 'right' }, pr: { md: 2 } }}><Button onClick={() => handleViewClick(lead.lead_id)} variant="outlined" size="small" sx={{ minWidth: 0, p: '4px 10px', textTransform: 'none', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.3)', borderRadius: 2, fontSize: 12, '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)' } }}>View</Button></Box>
                                </Box>
                            )
                        })}
                    </>
                )}

                {/* 2. Solutions Provided Layout */}
                {activeTab === 1 && (
                    <>
                        {!isMobile && (
                            <Box sx={{ display: 'grid', gridTemplateColumns: '4fr 6fr', alignItems: 'center', pb: 2, mb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#a0a0c0', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', position: 'sticky', top: 0, zIndex: 2, backdropFilter: 'blur(10px)', background: 'rgba(25, 25, 55, 0.9)' }}>
                                <Box sx={{ pl: 2 }}>Company & Contact</Box>
                                <Box>Solution Provided</Box>
                            </Box>
                        )}
                        
                        {filteredLeads.map((lead) => (
                            <Box key={lead.solution_id || lead.lead_id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '4fr 6fr' }, alignItems: 'flex-start', gap: { xs: 2, md: 3 }, p: 3, mb: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)' } }}>
                                {/* Left Side: Clean Company & Lead Name Only */}
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: 20, fontWeight: 800, width: 48, height: 48, mt: 0.5 }}>{lead.company_name?.charAt(0).toUpperCase()}</Avatar>
                                    <Box overflow="hidden">
                                        <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ color: '#fff', mb: 0.5 }}>{lead.company_name}</Typography>
                                        <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1.5 }} noWrap>
                                            {lead.lead_name}
                                        </Typography>
                                        {/* <Button onClick={() => handleViewClick(lead.lead_id)} variant="outlined" size="small" sx={{ py: 0.5, px: 2, textTransform: 'none', color: '#c084fc', borderColor: 'rgba(192, 132, 252, 0.4)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, '&:hover': { borderColor: '#c084fc', bgcolor: 'rgba(192, 132, 252, 0.1)' } }}>View Profile</Button> */}
                                    </Box>
                                </Box>

                                {/* Right Side: Solution Text & Date */}
                                <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 2, borderRadius: '12px', height: '100%', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Lightbulb weight="fill" /> Solution Details
                                        </Typography>
                                        {(lead.date || lead.time) && (
                                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                                {formatSolutionDateTime(lead.date, lead.time)}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Typography variant="body2" sx={{ color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap', flex: 1 }}>
                                        {lead.solution_provided || lead.notes || "No specific solution notes recorded for this lead yet."}
                                    </Typography>
                                    {lead.provided_by_name && (
                                        <Typography variant="caption" sx={{ color: '#94a3b8', mt: 2, display: 'block', borderTop: '1px solid rgba(255,255,255,0.05)', pt: 1 }}>
                                            Provided by: <strong style={{ color: '#fff' }}>{lead.provided_by_name}</strong>
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </>
                )}
              </>
          )}
        </Box>
      </Box>

      <Snackbar open={toast.open} autoHideDuration={6000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}><Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: '12px', width: '100%' }}>{toast.message}</Alert></Snackbar>
    </Box>
  );
};

export default SolutionLeads;