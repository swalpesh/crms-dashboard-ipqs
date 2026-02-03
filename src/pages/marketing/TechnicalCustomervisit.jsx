import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, 
  Typography,
  InputBase,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  keyframes,
  useTheme,
  CircularProgress,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; 
import { Link } from 'react-router-dom';

// --- API HELPERS ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

// --- Animations ---
const liquidMove = keyframes`
  0% { transform: translate(0, 0) rotate(0deg) scale(1); border-radius: 40% 60% 50% 50% / 50% 50% 60% 40%; }
  50% { transform: translate(20px, 20px) rotate(10deg) scale(1.1); border-radius: 50% 50% 20% 80% / 25% 80% 20% 75%; }
  100% { transform: translate(-20px, -10px) rotate(-5deg) scale(0.9); border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
`;

const slideUpFade = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styles Constants ---
const glassPanelStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px) brightness(1.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderTop: '1px solid rgba(255, 255, 255, 0.5)',
  borderLeft: '1px solid rgba(255, 255, 255, 0.5)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.05)',
  borderRadius: '24px',
};

const TechnicalCustomervisit = () => {
  const [activeTab, setActiveTab] = useState(0); // 0: New, 1: Pending, 2: Completed
  const [searchQuery, setSearchQuery] = useState(""); 
  
  // API State
  const [newVisits, setNewVisits] = useState([]);
  const [newVisitCount, setNewVisitCount] = useState(0);
  
  const [pendingVisits, setPendingVisits] = useState([]);
  const [pendingVisitCount, setPendingVisitCount] = useState(0);

  const [completedVisits, setCompletedVisits] = useState([]);
  const [completedVisitCount, setCompletedVisitCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const theme = useTheme();

  // --- Fetch Data (New, Pending, Completed) ---
  useEffect(() => {
    const fetchVisits = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) throw new Error("No authentication token found");

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch New, Pending, and Completed Visits in parallel
        const [newRes, pendingRes, completedRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/tleads/my-leads?lead_status=new`, { method: 'GET', headers }),
          fetch(`${API_BASE_URL}/api/tleads/my-leads?lead_status=progress`, { method: 'GET', headers }),
          fetch(`${API_BASE_URL}/api/tleads/technicalteam/completed-visits`, { method: 'GET', headers })
        ]);

        if (!newRes.ok) throw new Error(`New Visits Error: ${newRes.statusText}`);
        if (!pendingRes.ok) throw new Error(`Pending Visits Error: ${pendingRes.statusText}`);
        if (!completedRes.ok) throw new Error(`Completed Visits Error: ${completedRes.statusText}`);

        const newData = await newRes.json();
        const pendingData = await pendingRes.json();
        const completedData = await completedRes.json();

        // Update State
        setNewVisits(newData.leads || []);
        setNewVisitCount(newData.total || 0);

        setPendingVisits(pendingData.leads || []);
        setPendingVisitCount(pendingData.total || 0);

        setCompletedVisits(completedData.leads || []);
        setCompletedVisitCount(completedData.total || 0);

      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, []);

  // --- Helper to format address ---
  const formatAddress = (lead) => {
    const parts = [
      lead.company_address,
      lead.company_city,
      lead.company_state,
      lead.company_country,
      lead.zipcode
    ].filter(Boolean); // Remove null/undefined/empty strings
    return parts.join(', ') || 'N/A';
  };

  // --- Filtering Logic ---
  const currentData = useMemo(() => {
    // Select data source based on tab
    let sourceData = [];
    if (activeTab === 0) sourceData = newVisits;
    else if (activeTab === 1) sourceData = pendingVisits;
    else sourceData = completedVisits;

    // Filter
    return sourceData.filter((item) => {
      const lowerQuery = searchQuery.toLowerCase();
      return (
        (item.lead_name && item.lead_name.toLowerCase().includes(lowerQuery)) ||
        (item.lead_id && item.lead_id.toLowerCase().includes(lowerQuery)) ||
        (item.contact_person_email && item.contact_person_email.toLowerCase().includes(lowerQuery)) ||
        (item.company_email && item.company_email.toLowerCase().includes(lowerQuery))
      );
    });
  }, [searchQuery, activeTab, newVisits, pendingVisits, completedVisits]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(to right, #24243e, #302b63, #0f0c29)',
        color: '#fff',
        fontFamily: "'Inter', sans-serif",
        p: { xs: 2, md: 4 },
      }}
    >
      {/* --- Background Shapes --- */}
      <Box sx={{
        position: 'fixed', top: '-10%', left: '-10%', width: '600px', height: '600px',
        background: 'linear-gradient(180deg, #715161 0%, #33033c 100%)',
        filter: 'blur(60px)', opacity: 0.7, zIndex: 0,
        animation: `${liquidMove} 15s infinite alternate`,
      }} />
      <Box sx={{
        position: 'fixed', bottom: '-10%', right: '-5%', width: '500px', height: '500px',
        background: 'linear-gradient(180deg, #5d0d64 0%, #082b0b 100%)',
        filter: 'blur(60px)', opacity: 0.7, zIndex: 0,
        animation: `${liquidMove} 20s infinite alternate-reverse`,
      }} />

      {/* --- Main Content --- */}
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '1400px', mx: 'auto' }}>
        
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          <Box>
            <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, fontWeight: 800, background: 'linear-gradient(to right, #fff, #c0c0c0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))', mb: 0.5 }}>
              Customer Visits Dashboard
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem' }}>
              Manage and view all visits
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
            <Box sx={{ position: 'relative', flexGrow: 1, width: { xs: '100%', md: '300px' } }}>
              <Box sx={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)', pointerEvents: 'none' }}><SearchIcon fontSize="small" /></Box>
              <InputBase
                placeholder="Search visits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  width: '100%', padding: '10px 16px 10px 48px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderTop: '1px solid rgba(255, 255, 255, 0.4)', borderRadius: '16px', color: '#fff', transition: 'all 0.3s',
                  '&:focus-within': { background: 'rgba(255, 255, 255, 0.15)', boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.6)' }
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* --- Tabs --- */}
        <Box sx={{ mb: 4, ...glassPanelStyle, padding: '0.5rem', animation: `${slideUpFade} 0.7s ease` }}>
          <Box sx={{ position: 'relative', display: 'flex', width: '100%' }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, height: '54px', width: '33.33%', background: 'rgba(255, 255, 255, 0.15)', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.6), inset 0 -1px 1px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(10px)', borderRadius: '18px', zIndex: 1, transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)', transform: `translateX(${activeTab * 100}%)` }} />
            
            {/* New Visits Tab */}
            <Box onClick={() => setActiveTab(0)} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '54px', zIndex: 2, cursor: 'pointer', fontSize: { xs: '0.8rem', md: '1rem' }, fontWeight: 600, color: activeTab === 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.6)', textShadow: activeTab === 0 ? '0 0 10px rgba(255,255,255,0.5)' : 'none', transition: 'all 0.3s ease' }}>
              New Visits
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.6rem', height: '1.6rem', ml: 1, borderRadius: '50%', fontSize: '0.8rem', fontWeight: 700, backdropFilter: 'blur(5px)', transition: '0.3s ease', bgcolor: activeTab === 0 ? '#fff' : 'rgba(255,255,255,0.1)', color: activeTab === 0 ? '#2563eb' : '#fff', boxShadow: activeTab === 0 ? '0 0 15px rgba(255,255,255,0.6)' : 'none' }}>
                {loading ? '...' : newVisitCount}
              </Box>
            </Box>

            {/* Pending Visits Tab */}
            <Box onClick={() => setActiveTab(1)} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '54px', zIndex: 2, cursor: 'pointer', fontSize: { xs: '0.8rem', md: '1rem' }, fontWeight: 600, color: activeTab === 1 ? '#ffffff' : 'rgba(255, 255, 255, 0.6)', textShadow: activeTab === 1 ? '0 0 10px rgba(255,255,255,0.5)' : 'none', transition: 'all 0.3s ease' }}>
              Pending Visits
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.6rem', height: '1.6rem', ml: 1, borderRadius: '50%', fontSize: '0.8rem', fontWeight: 700, backdropFilter: 'blur(5px)', transition: '0.3s ease', bgcolor: activeTab === 1 ? '#fff' : 'rgba(255,255,255,0.1)', color: activeTab === 1 ? '#2563eb' : '#fff', boxShadow: activeTab === 1 ? '0 0 15px rgba(255,255,255,0.6)' : 'none' }}>
                {loading ? '...' : pendingVisitCount}
              </Box>
            </Box>

            {/* Completed Visits Tab */}
            <Box onClick={() => setActiveTab(2)} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '54px', zIndex: 2, cursor: 'pointer', fontSize: { xs: '0.8rem', md: '1rem' }, fontWeight: 600, color: activeTab === 2 ? '#ffffff' : 'rgba(255, 255, 255, 0.6)', textShadow: activeTab === 2 ? '0 0 10px rgba(255,255,255,0.5)' : 'none', transition: 'all 0.3s ease' }}>
              Completed Visits
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.6rem', height: '1.6rem', ml: 1, borderRadius: '50%', fontSize: '0.8rem', fontWeight: 700, backdropFilter: 'blur(5px)', transition: '0.3s ease', bgcolor: activeTab === 2 ? '#fff' : 'rgba(255,255,255,0.1)', color: activeTab === 2 ? '#2563eb' : '#fff', boxShadow: activeTab === 2 ? '0 0 15px rgba(255,255,255,0.6)' : 'none' }}>
                {loading ? '...' : completedVisitCount}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* --- Table --- */}
        <TableContainer component={Paper} sx={{ ...glassPanelStyle, background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(30px)', overflowX: 'auto', animation: `${slideUpFade} 0.7s ease 0.1s backwards` }}>
          
          {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
          
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <TableRow>
                {['Visit ID', 'Customer Name', 'Primary Site Address', 'Email Address', 'Contact Number', 'Actions'].map((head) => (
                  <TableCell key={head} sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: 'none', py: 3 }}>{head}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                    <CircularProgress size={30} sx={{ color: '#fff' }} />
                  </TableCell>
                </TableRow>
              ) : currentData.length > 0 ? (
                currentData.map((row, i) => (
                  <TableRow key={row.lead_id || i} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background-color 0.3s ease', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)', boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.05)' }, '&:last-child': { borderBottom: 'none' } }}>
                    {/* Visit ID */}
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)', borderBottom: 'none' }}>
                      {row.lead_id}
                    </TableCell>
                    
                    {/* Customer Name */}
                    <TableCell sx={{ color: '#fff', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.2)', borderBottom: 'none' }}>
                      {row.lead_name}
                    </TableCell>
                    
                    {/* Address (Formatted) */}
                    <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: 'none', maxWidth: 300 }}>
                      {formatAddress(row)}
                    </TableCell>
                    
                    {/* Email */}
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)', borderBottom: 'none' }}>
                      {row.contact_person_email || row.company_email || '-'}
                    </TableCell>
                    
                    {/* Phone */}
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)', borderBottom: 'none' }}>
                      {row.contact_person_phone || row.company_contact_number || '-'}
                    </TableCell>
                    
                    {/* Actions */}
                    <TableCell sx={{ borderBottom: 'none' }}>
                      {activeTab === 2 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#00ffaa', fontWeight: 700, fontSize: '0.95rem', textShadow: '0 0 12px rgba(0, 255, 170, 0.4)' }}>
                          <CheckCircleOutlineIcon fontSize="small" /> Completed
                        </Box>
                      ) : (
                        <Button 
                          variant="text" 
                          component={Link} 
                          endIcon={<ArrowForwardIcon sx={{ transition: 'transform 0.3s' }} />} 
                          to={`/marketing/technical/customer-profile/${row.lead_id}`} 
                          sx={{ 
                            background: 'rgba(0, 255, 170, 0.1)', 
                            color: '#00ffaa', 
                            borderRadius: '999px', 
                            border: '1px solid rgba(0, 255, 170, 0.3)', 
                            px: 2.5, 
                            textTransform: 'none', 
                            fontWeight: 600, 
                            transition: 'all 0.3s ease', 
                            '&:hover': { background: '#00ffaa', color: '#0f0c29', boxShadow: '0 0 20px rgba(0, 255, 170, 0.6)', transform: 'scale(1.05)', borderColor: '#00ffaa', '& .MuiButton-endIcon': { transform: 'translateX(3px)' } } 
                          }}
                        >
                          View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'rgba(255,255,255,0.5)', borderBottom: 'none' }}>
                    <SearchIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                    <Typography>No visits found matching "{searchQuery}"</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default TechnicalCustomervisit;