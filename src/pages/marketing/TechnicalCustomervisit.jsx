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
  Alert,
  Select,
  MenuItem,
  FormControl,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; 
import FilterListIcon from '@mui/icons-material/FilterList';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Link } from 'react-router-dom';

// --- API HELPERS ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
const getUserRole = () => localStorage.getItem("user_role") || ""; 

// --- ANIMATIONS ---
const liquidMove = keyframes`
  0% { transform: translate(0, 0) rotate(0deg) scale(1); border-radius: 40% 60% 50% 50% / 50% 50% 60% 40%; }
  50% { transform: translate(20px, 20px) rotate(10deg) scale(1.1); border-radius: 50% 50% 20% 80% / 25% 80% 20% 75%; }
  100% { transform: translate(-20px, -10px) rotate(-5deg) scale(0.9); border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
`;

const slideUpFade = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- THEME CONSTANTS ---
const themeColors = {
  bgDark: '#0f0c29',
  glassBg: 'rgba(255, 255, 255, 0.03)',
  glassBorder: '1px solid rgba(255, 255, 255, 0.08)',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  accentBlue: '#3b82f6',
  accentOrange: '#f59e0b',
  statusRed: '#ef4444',
  statusYellow: '#f59e0b',
  statusGreen: '#10b981',
};

// --- STYLES CONSTANTS ---
const pageStyle = {
  minHeight: '100vh',
  width: '100%',
  position: 'relative',
  overflowX: 'hidden',
  background: themeColors.bgDark,
  backgroundImage: `
    radial-gradient(circle at 15% 50%, rgba(76, 29, 149, 0.25) 0%, transparent 50%),
    radial-gradient(circle at 85% 30%, rgba(37, 99, 235, 0.2) 0%, transparent 50%)
  `,
  color: themeColors.textPrimary,
  fontFamily: "'Inter', sans-serif",
  p: { xs: 2, md: 4 },
};

const orbStyle = {
  position: 'fixed',
  borderRadius: '50%',
  filter: 'blur(80px)',
  zIndex: 0,
  animation: `${liquidMove} 10s infinite ease-in-out`,
};

const glassPanelStyle = {
  background: themeColors.glassBg,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: themeColors.glassBorder,
  borderRadius: '24px',
  p: 3,
  width: '100%',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.3s ease',
};

const inputStyle = {
    width: '100%',
    padding: '10px 16px 10px 48px', 
    background: 'rgba(255, 255, 255, 0.05)', 
    backdropFilter: 'blur(10px)', 
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    borderRadius: '16px', 
    color: '#fff', 
    transition: 'all 0.3s', 
    height: '45px',
    '&:hover': { border: '1px solid rgba(255,255,255,0.3)' },
    '&:focus-within': { background: 'rgba(255, 255, 255, 0.1)', boxShadow: `0 0 20px ${themeColors.accentBlue}33`, borderColor: themeColors.accentBlue }
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

  // Filter State (for Head)
  const [selectedEmployee, setSelectedEmployee] = useState("All");
  const [employeeList, setEmployeeList] = useState([]);
  const [isHead, setIsHead] = useState(false); // Validated State for Head Role

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const theme = useTheme();

  // --- Fetch Data ---
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

        // Parallel Fetch
        const [newRes, pendingRes, completedRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/tleads/my-leads?lead_status=new`, { method: 'GET', headers }),
          fetch(`${API_BASE_URL}/api/tleads/my-leads?lead_status=progress`, { method: 'GET', headers }),
          fetch(`${API_BASE_URL}/api/tleads/technicalteam/completed-visits`, { method: 'GET', headers })
        ]);

        const newData = await newRes.json();
        const pendingData = await pendingRes.json();
        const completedData = await completedRes.json();

        // Update Visits State
        setNewVisits(newData.leads || []);
        setNewVisitCount(newData.total || 0);

        setPendingVisits(pendingData.leads || []);
        setPendingVisitCount(pendingData.total || 0);

        setCompletedVisits(completedData.leads || []);
        setCompletedVisitCount(completedData.total || 0);

        // --- Role & Filter Logic ---
        const storedRole = getUserRole();
        const apiIndicatesHead = completedData.view_mode === 'All Team Data' || completedData.accessed_by === 'Technical-Team-Head';

        if (storedRole === 'Technical-Team-Head' || apiIndicatesHead) {
            setIsHead(true);
            const uniqueEmployees = [...new Set(completedData.leads.map(lead => lead.completed_by_name).filter(Boolean))];
            setEmployeeList(uniqueEmployees);
        }

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
    ].filter(Boolean);
    return parts.join(', ') || 'N/A';
  };

  // --- Filtering Logic ---
  const currentData = useMemo(() => {
    let sourceData = [];
    if (activeTab === 0) sourceData = newVisits;
    else if (activeTab === 1) sourceData = pendingVisits;
    else sourceData = completedVisits;

    return sourceData.filter((item) => {
      const lowerQuery = searchQuery.toLowerCase();
      const matchesSearch = (
        (item.lead_name && item.lead_name.toLowerCase().includes(lowerQuery)) ||
        (item.lead_id && item.lead_id.toLowerCase().includes(lowerQuery)) ||
        (item.contact_person_email && item.contact_person_email.toLowerCase().includes(lowerQuery)) ||
        (item.company_email && item.company_email.toLowerCase().includes(lowerQuery))
      );

      let matchesEmployee = true;
      if (activeTab === 2 && isHead && selectedEmployee !== 'All') {
        matchesEmployee = item.completed_by_name === selectedEmployee;
      }

      return matchesSearch && matchesEmployee;
    });
  }, [searchQuery, activeTab, newVisits, pendingVisits, completedVisits, selectedEmployee, isHead]);

  return (
    <Box sx={pageStyle}>
      {/* --- Background Shapes --- */}
      <Box sx={{ ...orbStyle, width: '600px', height: '600px', background: 'rgba(91, 33, 182, 0.25)', top: '-10%', left: '-10%', animation: `${liquidMove} 15s infinite alternate` }} />
      <Box sx={{ ...orbStyle, width: '500px', height: '500px', background: 'rgba(59, 130, 246, 0.2)', bottom: '-10%', right: '-5%', animation: `${liquidMove} 20s infinite alternate-reverse` }} />

      {/* --- Main Content --- */}
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '1400px', mx: 'auto', animation: `${slideUpFade} 0.8s ease-out` }}>
        
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} mb={1} sx={{ background: 'linear-gradient(to right, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
              Customer Visits Dashboard
            </Typography>
            <Typography sx={{ color: themeColors.textSecondary, fontSize: '1rem' }}>
              Manage and view all technical visits
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' }, alignItems: 'center' }}>
            
            {/* --- EMPLOYEE FILTER DROPDOWN (Glassy Style) --- */}
            {activeTab === 2 && isHead && (
                <FormControl variant="standard" sx={{ minWidth: 220 }}>
                    <Select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        displayEmpty
                        disableUnderline
                        IconComponent={(props) => <FilterListIcon {...props} sx={{ color: '#fff !important' }} />}
                        sx={{
                            color: '#fff',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '16px',
                            padding: '10px 16px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            height: '45px',
                            backdropFilter: 'blur(10px)',
                            display: 'flex', alignItems: 'center',
                            '& .MuiSelect-select': { 
                                paddingRight: '32px !important', 
                                display: 'flex', alignItems: 'center' 
                            },
                            '&:hover': { background: 'rgba(255, 255, 255, 0.1)', borderColor: '#fff' }
                        }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    bgcolor: '#1a1625',
                                    color: '#fff',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    mt: 1,
                                    maxHeight: 300,
                                    backgroundImage: 'linear-gradient(to bottom right, #1a1625, #0f0c29)',
                                    '& .MuiMenuItem-root': { padding: '10px 16px' },
                                    '& .MuiMenuItem-root:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                                    '& .Mui-selected': { bgcolor: 'rgba(59, 130, 246, 0.3) !important' }
                                }
                            }
                        }}
                    >
                        <MenuItem value="All">
                            <Typography sx={{ fontWeight: 600 }}>All Employees</Typography>
                        </MenuItem>
                        {employeeList.map((emp, i) => (
                            <MenuItem key={i} value={emp}>{emp}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {/* --- SEARCH BAR --- */}
            <Box sx={{ position: 'relative', flexGrow: 1, width: { xs: '100%', md: '300px' } }}>
              <Box sx={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)', pointerEvents: 'none' }}><SearchIcon fontSize="small" /></Box>
              <InputBase
                placeholder="Search visits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={inputStyle}
              />
            </Box>
          </Box>
        </Box>

        {/* --- Tabs --- */}
        <Box sx={{ mb: 4, ...glassPanelStyle, padding: '0.5rem', animation: `${slideUpFade} 0.7s ease` }}>
          <Box sx={{ position: 'relative', display: 'flex', width: '100%' }}>
            {/* Sliding Background */}
            <Box sx={{ 
                position: 'absolute', top: 0, left: 0, height: '54px', width: '33.33%', 
                background: 'rgba(59, 130, 246, 0.15)', // Blue tint
                border: '1px solid rgba(59, 130, 246, 0.3)',
                backdropFilter: 'blur(10px)', borderRadius: '18px', zIndex: 1, 
                transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)', 
                transform: `translateX(${activeTab * 100}%)` 
            }} />
            
            {/* New Visits Tab */}
            <Box onClick={() => setActiveTab(0)} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '54px', zIndex: 2, cursor: 'pointer', fontSize: { xs: '0.8rem', md: '1rem' }, fontWeight: 600, color: activeTab === 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.6)', textShadow: activeTab === 0 ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none', transition: 'all 0.3s ease' }}>
              New Visits
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.6rem', height: '1.6rem', ml: 1, borderRadius: '50%', fontSize: '0.8rem', fontWeight: 700, backdropFilter: 'blur(5px)', transition: '0.3s ease', bgcolor: activeTab === 0 ? themeColors.accentBlue : 'rgba(255,255,255,0.1)', color: '#fff', boxShadow: activeTab === 0 ? '0 0 10px rgba(59, 130, 246, 0.6)' : 'none' }}>
                {loading ? '...' : newVisitCount}
              </Box>
            </Box>

            {/* Pending Visits Tab */}
            <Box onClick={() => setActiveTab(1)} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '54px', zIndex: 2, cursor: 'pointer', fontSize: { xs: '0.8rem', md: '1rem' }, fontWeight: 600, color: activeTab === 1 ? '#ffffff' : 'rgba(255, 255, 255, 0.6)', textShadow: activeTab === 1 ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none', transition: 'all 0.3s ease' }}>
              Pending Visits
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.6rem', height: '1.6rem', ml: 1, borderRadius: '50%', fontSize: '0.8rem', fontWeight: 700, backdropFilter: 'blur(5px)', transition: '0.3s ease', bgcolor: activeTab === 1 ? themeColors.accentBlue : 'rgba(255,255,255,0.1)', color: '#fff', boxShadow: activeTab === 1 ? '0 0 10px rgba(59, 130, 246, 0.6)' : 'none' }}>
                {loading ? '...' : pendingVisitCount}
              </Box>
            </Box>

            {/* Completed Visits Tab */}
            <Box onClick={() => setActiveTab(2)} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '54px', zIndex: 2, cursor: 'pointer', fontSize: { xs: '0.8rem', md: '1rem' }, fontWeight: 600, color: activeTab === 2 ? '#ffffff' : 'rgba(255, 255, 255, 0.6)', textShadow: activeTab === 2 ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none', transition: 'all 0.3s ease' }}>
              Completed Visits
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.6rem', height: '1.6rem', ml: 1, borderRadius: '50%', fontSize: '0.8rem', fontWeight: 700, backdropFilter: 'blur(5px)', transition: '0.3s ease', bgcolor: activeTab === 2 ? themeColors.accentBlue : 'rgba(255,255,255,0.1)', color: '#fff', boxShadow: activeTab === 2 ? '0 0 10px rgba(59, 130, 246, 0.6)' : 'none' }}>
                {loading ? '...' : completedVisitCount}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* --- Table --- */}
        <TableContainer component={Paper} sx={{ ...glassPanelStyle, overflowX: 'auto', p: 0, animation: `${slideUpFade} 0.7s ease 0.1s backwards` }}>
          
          {error && <Alert severity="error" sx={{ m: 2, borderRadius: '12px' }}>{error}</Alert>}
          
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <TableRow>
                {['Visit ID', 'Customer Name', 'Primary Site Address', 'Email Address', 'Contact Number', 'Actions'].map((head) => (
                  <TableCell key={head} sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em', borderBottom: 'none', py: 2.5 }}>{head}</TableCell>
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
                  <TableRow key={row.lead_id || i} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background-color 0.3s ease', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.03)', boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.02)' }, '&:last-child': { borderBottom: 'none' } }}>
                    {/* Visit ID */}
                    <TableCell sx={{ color: 'rgba(255,255,255,0.9)', borderBottom: 'none', fontSize: '0.9rem' }}>
                      {row.lead_id}
                    </TableCell>
                    
                    {/* Customer Name */}
                    <TableCell sx={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', borderBottom: 'none' }}>
                      {row.lead_name}
                      {/* Show Completed By details if Head or Filter Active */}
                      {activeTab === 2 && row.completed_by_name && (
                        <Typography variant="caption" display="block" color="rgba(255,255,255,0.5)" sx={{ mt: 0.5 }}>
                          By: {row.completed_by_name}
                        </Typography>
                      )}
                    </TableCell>
                    
                    {/* Address (Formatted) */}
                    <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: 'none', maxWidth: 300, fontSize: '0.85rem' }}>
                      {formatAddress(row)}
                    </TableCell>
                    
                    {/* Email */}
                    <TableCell sx={{ color: 'rgba(255,255,255,0.8)', borderBottom: 'none', fontSize: '0.9rem' }}>
                      {row.contact_person_email || row.company_email || '-'}
                    </TableCell>
                    
                    {/* Phone */}
                    <TableCell sx={{ color: 'rgba(255,255,255,0.8)', borderBottom: 'none', fontSize: '0.9rem' }}>
                      {row.contact_person_phone || row.company_contact_number || '-'}
                    </TableCell>
                    
                    {/* Actions */}
                    <TableCell sx={{ borderBottom: 'none' }}>
                      {activeTab === 2 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeColors.statusGreen, fontWeight: 700, fontSize: '0.85rem', bgcolor: 'rgba(16, 185, 129, 0.1)', py: 0.5, px: 1.5, borderRadius: '20px', width: 'fit-content' }}>
                          <CheckCircleOutlineIcon fontSize="small" /> Completed
                        </Box>
                      ) : (
                        <Button 
                          variant="outlined" 
                          component={Link} 
                          endIcon={<ArrowForwardIcon sx={{ transition: 'transform 0.3s' }} />} 
                          to={`/marketing/technical/customer-profile/${row.lead_id}`} 
                          sx={{ 
                            borderColor: 'rgba(59, 130, 246, 0.3)', 
                            color: '#3b82f6', 
                            borderRadius: '20px', 
                            textTransform: 'none', 
                            fontSize: '0.85rem', 
                            fontWeight: 600, 
                            py: 0.5, px: 2, 
                            '&:hover': { 
                                borderColor: '#60a5fa', 
                                bgcolor: 'rgba(59, 130, 246, 0.1)', 
                                '& .MuiButton-endIcon': { transform: 'translateX(3px)' } 
                            } 
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