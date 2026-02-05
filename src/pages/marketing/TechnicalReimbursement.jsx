import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Stack,
  IconButton,
  InputBase,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  keyframes,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  InputAdornment,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  AccountBalanceWallet as WalletIcon,
  ReceiptLong as ReceiptIcon,
  Description as InvoiceIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  CurrencyRupee as RupeeIcon,
  PieChart as PieChartIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Map as MapIcon,
  LocationOn as LocationIcon,
  CreditCard as CardIcon,
  Place as PlaceIcon,
  Receipt as ReceiptIcon2,
  Send as SendIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon
} from '@mui/icons-material';

// --- API HELPERS ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
const EMPLOYEE_ID = "IPQS-H25010"; // Placeholder ID

// --- ANIMATIONS ---
const float = keyframes`
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -30px); }
`;

// --- STYLES CONSTANTS ---

const pageStyle = {
  minHeight: '100vh',
  background: '#0f0c29',
  backgroundImage: `
    radial-gradient(circle at 15% 50%, rgba(76, 29, 149, 0.25) 0%, transparent 50%),
    radial-gradient(circle at 85% 30%, rgba(37, 99, 235, 0.2) 0%, transparent 50%)
  `,
  color: '#ffffff',
  fontFamily: "'Inter', sans-serif",
  position: 'relative',
  overflowX: 'hidden',
  p: { xs: 2, md: 4 },
  display: 'flex',
  justifyContent: 'center',
};

const orbStyle = {
  position: 'fixed',
  borderRadius: '50%',
  filter: 'blur(80px)',
  zIndex: 0,
  animation: `${float} 10s infinite ease-in-out`,
};

// Glass Panel (Container)
const glassPanelStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '24px',
  p: 3,
  width: '100%',
  maxWidth: '1200px',
  zIndex: 1,
  position: 'relative'
};

// Summary Card Style
const summaryCardStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderTop: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '20px',
  p: 3,
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  transition: 'transform 0.2s, background 0.2s',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.07)',
    transform: 'translateY(-2px)',
  }
};

// Icon Box Styles
const iconBoxStyle = (color, bg, shadowColor) => ({
  width: '48px',
  height: '48px',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  color: color,
  background: bg,
  boxShadow: shadowColor ? `0 0 15px ${shadowColor}` : 'none',
});

// Primary Button Style
const primaryBtnStyle = {
  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  color: 'white',
  borderRadius: '30px',
  textTransform: 'none',
  fontWeight: 600,
  px: 3,
  py: 1,
  boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 6px 20px rgba(37, 99, 235, 0.5)',
  }
};

// --- HELPER: Calculate Date Range ---
const getDateRange = (expenses) => {
    if (!expenses || expenses.length === 0) return "-";
    const dates = expenses.map(e => new Date(e.date));
    const minDate = new Date(Math.min.apply(null, dates));
    const maxDate = new Date(Math.max.apply(null, dates));

    if (minDate.getTime() === maxDate.getTime()) {
        return minDate.toLocaleDateString();
    }
    return `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;
};

// --- HELPER: Get Status Style ---
const statusStyle = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'approved' || s === 'reimbursed') {
        return { bg: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', border: 'rgba(16, 185, 129, 0.3)' };
    }
    if (s === 'pending') {
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d', border: 'rgba(245, 158, 11, 0.3)' };
    }
    return { bg: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', border: 'rgba(59, 130, 246, 0.3)' };
};

// --- TRIP MAP DIALOG COMPONENT ---
const TripMapDialog = ({ open, onClose, trip }) => {
  const [activeExpense, setActiveExpense] = useState(trip?.details?.expenses[0] || null);

  React.useEffect(() => {
    if (trip && trip.details && trip.details.expenses.length > 0) {
        setActiveExpense(trip.details.expenses[0]);
    }
  }, [trip]);

  if (!trip || !activeExpense) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          bgcolor: '#1a1625',
          border: '1px solid rgba(255,255,255,0.1)',
          height: '650px', 
          backgroundImage: 'linear-gradient(to bottom right, #1a1625, #0f0c29)',
          overflow: 'hidden'
        }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', bgcolor: 'rgba(26, 22, 37, 0.95)', zIndex: 10 }}>
        <Box>
            <Typography variant="h6" color="white" fontWeight={600}>{trip.company}</Typography>
            <Typography variant="caption" color="grey.500">Trip Expenses Overview</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'grey.500', '&:hover': { color: 'white' } }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, position: 'relative', height: '100%', display: 'flex' }}>
        <Box sx={{ flexGrow: 1, height: '100%', position: 'relative', zIndex: 1 }}>
            <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                style={{ border: 0, opacity: 0.8, filter: 'grayscale(20%) contrast(1.2)' }}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(activeExpense.coords)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                title="Map Location"
            />
            <Box sx={{ position: 'absolute', bottom: 30, right: 30, width: 300, bgcolor: 'rgba(15, 12, 41, 0.9)', backdropFilter: 'blur(16px)', p: 2.5, borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                <Typography variant="overline" color="#3b82f6" fontWeight={700} fontSize="11px" letterSpacing={1}>SELECTED LOCATION</Typography>
                <Typography variant="h6" color="white" fontWeight={700} lineHeight={1.2} mb={0.5}>{activeExpense.category}</Typography>
                <Typography variant="body2" color="grey.400" mb={2}>{activeExpense.desc}</Typography>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 1.5 }} />
                <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="grey.500">{activeExpense.date} • {activeExpense.time}</Typography>
                    <Typography variant="body2" color="white" fontWeight={700}>{activeExpense.amount}</Typography>
                </Stack>
            </Box>
        </Box>

        <Box sx={{ width: 340, height: '100%', bgcolor: 'rgba(15, 12, 41, 0.85)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.1)', overflowY: 'auto', position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 5, display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography variant="subtitle2" color="white" fontWeight={600}>Expenses List</Typography>
                <Typography variant="caption" color="grey.500">Select an item to view on map</Typography>
            </Box>
            <List sx={{ p: 2 }}>
                {trip.details.expenses.map((exp, index) => (
                    <ListItem key={index} button selected={activeExpense === exp} onClick={() => setActiveExpense(exp)} sx={{ mb: 1.5, borderRadius: '16px', border: activeExpense === exp ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.05)', bgcolor: activeExpense === exp ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.02)', transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', transform: 'translateX(4px)' } }}>
                        <ListItemIcon sx={{ minWidth: 40 }}><Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: activeExpense === exp ? '#3b82f6' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeExpense === exp ? 'white' : 'grey.500' }}><PlaceIcon sx={{ fontSize: 18 }} /></Box></ListItemIcon>
                        <ListItemText primary={<Typography variant="body2" color="white" fontWeight={600}>{exp.category}</Typography>} secondary={<Typography variant="caption" color="grey.400" display="block" noWrap>{exp.desc}</Typography>} />
                        <Typography variant="caption" color={activeExpense === exp ? "white" : "grey.600"} fontWeight={600}>{exp.amount}</Typography>
                    </ListItem>
                ))}
            </List>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// --- SINGLE EXPENSE MAP DIALOG ---
const SingleMapDialog = ({ open, onClose, location }) => (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '20px', bgcolor: '#1a1625', border: '1px solid rgba(255,255,255,0.1)' } }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Box display="flex" alignItems="center" gap={1}><LocationIcon sx={{ color: '#10b981' }} /><Typography variant="h6" color="white">Expense Location</Typography></Box>
        <IconButton onClick={onClose} sx={{ color: 'grey.500' }}><CloseIcon /></IconButton>
      </Box>
      <DialogContent sx={{ p: 0, height: '400px', bgcolor: '#000' }}>
        <iframe width="100%" height="100%" frameBorder="0" style={{ border: 0, opacity: 0.8 }} src={`https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=14&ie=UTF8&iwloc=&output=embed`} title="Map Location" />
      </DialogContent>
    </Dialog>
);

const TechnicalReimbursement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // --- State ---
  const [reimbursements, setReimbursements] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // --- Modal States ---
  const [open, setOpen] = useState(false); // Start Trip
  const [viewOpen, setViewOpen] = useState(false); // View Details
  const [tripMapOpen, setTripMapOpen] = useState(false); // All Expenses Map
  const [singleMapOpen, setSingleMapOpen] = useState(false); // Single Expense Map (Inside View Details)
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [mapLocation, setMapLocation] = useState('');
  
  // --- Form Data ---
  const [formData, setFormData] = useState({ 
    companyName: '', 
    lead_id: '',
    category: '', 
    date: '', 
    time: '', 
    amount: '', 
    invoice: null 
  });
  
  // --- Company Dropdown State ---
  const [companies, setCompanies] = useState([]);

  // --- FETCH REIMBURSEMENTS (Grouped) ---
  const fetchReimbursements = async () => {
    setLoadingData(true);
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/reimbursements/employee/${EMPLOYEE_ID}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to fetch reimbursements");
      const data = await response.json();
      // Expecting { data: [ { company_name, expenses: [] }, ... ] }
      setReimbursements(data.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setToast({ open: true, message: "Error loading expenses", severity: "error" });
    } finally {
      setLoadingData(false);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchReimbursements();
  }, []);

  // --- CALCULATE SUMMARY TOTALS ---
  const totalExpenseAmount = reimbursements.reduce((acc, curr) => acc + (parseFloat(curr.total_claimed_amount) || 0), 0);
  const totalReceivedAmount = 0; // Hardcoded as requested
  const totalRemainingAmount = totalExpenseAmount - totalReceivedAmount;

  // --- FETCH COMPANIES FOR DROPDOWN ---
  const fetchCompanies = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/tleads/technicalteam/completed-visits`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to fetch companies");

      const data = await response.json();
      
      if (data.leads) {
        const uniqueCompaniesMap = new Map();
        data.leads.forEach(lead => {
            if(!uniqueCompaniesMap.has(lead.company_name)) {
                uniqueCompaniesMap.set(lead.company_name, lead.lead_id);
            }
        });
        
        const companyList = Array.from(uniqueCompaniesMap, ([name, id]) => ({ name, id }));
        setCompanies(companyList);
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  // --- Handlers ---
  const handleOpen = () => {
    fetchCompanies(); // Fetch companies when modal opens
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
    setFormData({ companyName: '', lead_id: '', category: '', date: '', time: '', amount: '', invoice: null });
  };

  // --- Adapter: Convert API Grouped Data to Modal Format ---
  const adaptGroupedDataToTrip = (groupedData) => {
    const expenseList = groupedData.expenses.map(e => ({
        id: e.reimbursement_id,
        date: new Date(e.date).toLocaleDateString(),
        time: e.time,
        category: e.category,
        desc: e.category, // Using Category as desc as well per prompt simplicity or use company name
        lead_id: e.lead_id, 
        amount: `₹${e.amount}`,
        coords: e.location // Lat,Long string
    }));

    // Determine aggregate status (if any pending, show pending)
    const statuses = groupedData.expenses.map(e => e.status);
    const overallStatus = statuses.includes('Pending') ? 'Pending' : (statuses.includes('Approved') ? 'Approved' : 'Completed');

    // Get submission date (earliest)
    const submissionDate = groupedData.expenses.length > 0 ? new Date(groupedData.expenses[0].created_at).toLocaleDateString() : '-';

    return {
        company: groupedData.company_name,
        date: getDateRange(groupedData.expenses),
        amount: `₹${groupedData.total_claimed_amount}`,
        status: overallStatus,
        details: {
            total: `₹${groupedData.total_claimed_amount}`,
            advance: '₹0.00',
            submissionDate: submissionDate,
            expenses: expenseList
        }
    };
  };

  const handleViewOpen = (groupedData) => {
    setSelectedTrip(adaptGroupedDataToTrip(groupedData));
    setViewOpen(true);
  };
  const handleViewClose = () => {
    setViewOpen(false);
    setSelectedTrip(null);
  };

  const handleTripMapOpen = (groupedData) => {
    setSelectedTrip(adaptGroupedDataToTrip(groupedData));
    setTripMapOpen(true);
  }
  const handleTripMapClose = () => {
    setTripMapOpen(false);
    setSelectedTrip(null);
  }

  const handleSingleMapOpen = (coords) => {
    setMapLocation(coords);
    setSingleMapOpen(true);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCompanyChange = (e) => {
    const selectedName = e.target.value;
    const selectedCompany = companies.find(c => c.name === selectedName);
    setFormData({
        ...formData,
        companyName: selectedName,
        lead_id: selectedCompany ? selectedCompany.id : ''
    });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, invoice: e.target.files[0] });
  };

  // --- SUBMIT CLAIM (POST) ---
  const handleSubmit = () => {
    if (!formData.companyName || !formData.amount || !formData.date) {
        setToast({ open: true, message: "Please fill required fields", severity: "error" });
        return;
    }

    setSubmitting(true);

    const submitToApi = async (locationData) => {
        try {
            const token = getToken();
            const submitData = new FormData();
            submitData.append('company_name', formData.companyName);
            submitData.append('lead_id', formData.lead_id);
            submitData.append('category', formData.category);
            submitData.append('date', formData.date);
            submitData.append('time', formData.time);
            submitData.append('amount', formData.amount);
            
            const locString = locationData ? `${locationData.latitude},${locationData.longitude}` : '';
            submitData.append('location', locString);

            if (formData.invoice) {
                submitData.append('file', formData.invoice);
            }

            const response = await fetch(`${API_BASE_URL}/api/reimbursements/create`, {
                method: 'POST',
                headers: { "Authorization": `Bearer ${token}` },
                body: submitData
            });

            const result = await response.json();
            
            if (response.ok) {
                setToast({ open: true, message: "Expense created successfully!", severity: "success" });
                handleClose();
                fetchReimbursements(); // Refresh list
            } else {
                setToast({ open: true, message: "Failed: " + (result.message || "Unknown error"), severity: "error" });
            }

        } catch (err) {
            setToast({ open: true, message: "Network Error: " + err.message, severity: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const loc = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        submitToApi(loc);
      }, (error) => {
        console.error("Location error:", error);
        submitToApi(null);
      });
    } else {
        submitToApi(null);
    }
  };

  // Glass Input Style
  const inputStyle = {
    '& .MuiOutlinedInput-root': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '12px', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' }, '&.Mui-focused fieldset': { borderColor: '#3b82f6' } },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }, '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' }, '& input::-webkit-calendar-picker-indicator': { filter: 'invert(1)', cursor: 'pointer' },
    '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.5)' }
  };

  // --- Filtering Logic ---
  const filteredReimbursements = reimbursements.filter((item) => {
    const query = searchQuery.toLowerCase();
    // Safely access fields
    const companyName = item.company_name?.toLowerCase() || '';
    
    // Check if status exists in the first expense object, if any
    const status = (item.expenses && item.expenses[0] && item.expenses[0].status) 
        ? item.expenses[0].status.toLowerCase() 
        : '';

    const amount = item.total_claimed_amount ? item.total_claimed_amount.toString() : '';

    return (
      companyName.includes(query) ||
      status.includes(query) ||
      amount.includes(query)
    );
  });

  return (
    <Box sx={pageStyle}>
      <Box sx={{ ...orbStyle, width: '500px', height: '500px', background: 'rgba(139, 92, 246, 0.15)', top: '-100px', left: '-100px' }} />
      <Box sx={{ ...orbStyle, width: '400px', height: '400px', background: 'rgba(59, 130, 246, 0.15)', bottom: '-100px', right: '-100px', animationDelay: '-5s' }} />

      <Box sx={glassPanelStyle}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5, background: 'linear-gradient(to right, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Reimbursements
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
              Manage your travel expenses and claims
            </Typography>
          </Box>
          <Button startIcon={<AddIcon />} onClick={handleOpen} sx={primaryBtnStyle}>
            Start a New Trip
          </Button>
        </Box>

        {/* Accounts Summary */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 500, mb: 2, pl: 1 }}>Accounts Overview</Typography>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={4}>
              <Box sx={summaryCardStyle}>
                <Box sx={iconBoxStyle('#fca5a5', 'rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)')}><ReceiptIcon /></Box>
                <Box>
                    <Typography sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', mb: 0.5 }}>Expense Amount</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#fca5a5' }}>₹{totalExpenseAmount.toFixed(2)}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={summaryCardStyle}>
                <Box sx={iconBoxStyle('#6ee7b7', 'rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)')}><WalletIcon /></Box>
                <Box>
                    <Typography sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', mb: 0.5 }}>Received Amount</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#6ee7b7' }}>₹{totalReceivedAmount.toFixed(2)}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={summaryCardStyle}>
                <Box sx={iconBoxStyle('#e5e7eb', 'rgba(255, 255, 255, 0.1)')}><PieChartIcon /></Box>
                <Box>
                    <Typography sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', mb: 0.5 }}>Remaining Amount</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#ffffff' }}>₹{totalRemainingAmount.toFixed(2)}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', mt: 2, pl: 1, display: 'flex', alignItems: 'center', gap: 1 }}><InfoIcon sx={{ fontSize: 16 }} /> Data is updated monthly. Contact IT for discrepancies.</Typography>
        </Box>

        {/* All Trips Table */}
        <Box sx={{ background: 'rgba(20, 20, 40, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', p: 3, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" fontWeight={600}>All Trips</Typography>
            <Box sx={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
              <SearchIcon sx={{ color: 'rgba(255,255,255,0.6)' }} />
              <InputBase 
                placeholder="Search trips..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                sx={{ color: '#fff', fontSize: '14px', width: { xs: '100%', sm: '200px' } }} 
              />
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  {['Company Name', 'Date Range', 'Total Expenses', 'Status', 'Actions'].map((head, index) => (
                    <TableCell key={head} align={index === 4 ? 'right' : 'left'} sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.08)', py: 2 }}>{head}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingData ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{py: 4}}><CircularProgress size={30} /></TableCell></TableRow>
                ) : filteredReimbursements.length > 0 ? (
                  filteredReimbursements.map((row, index) => {
                    const status = row.expenses[0]?.status || 'Pending';
                    const statusConfig = statusStyle(status);
                    return (
                        <TableRow key={index} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }, '& td': { borderBottom: index === filteredReimbursements.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)' } }}>
                        <TableCell sx={{ py: 2 }}>
                            <Box>
                            <Typography sx={{ fontWeight: 500, fontSize: '14px', color: '#fff' }}>{row.company_name}</Typography>
                            <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>{row.total_entries} Entries</Typography>
                            </Box>
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                            {getDateRange(row.expenses)}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '14px', color: '#fff' }}>₹{row.total_claimed_amount}</TableCell>
                        
                        <TableCell>
                            <Box component="span" sx={{ fontSize: '12px', fontWeight: 500, padding: '6px 12px', borderRadius: '20px', background: statusConfig.bg, color: statusConfig.color, border: `1px solid ${statusConfig.border}`, display: 'inline-block' }}>
                                {status}
                            </Box>
                        </TableCell>
                        
                        <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1.5 }}>
                            <Button 
                                variant="outlined" 
                                startIcon={<ViewIcon sx={{ fontSize: 16 }} />} 
                                onClick={() => handleViewOpen(row)}
                                sx={{ borderColor: 'rgba(59, 130, 246, 0.3)', color: '#3b82f6', borderRadius: '20px', textTransform: 'none', fontSize: '13px', py: 0.5, px: 2, '&:hover': { borderColor: '#60a5fa', bgcolor: 'rgba(59, 130, 246, 0.1)' } }}>
                                View
                            </Button>
                            <IconButton 
                                size="small" 
                                onClick={() => handleTripMapOpen(row)}
                                sx={{ color: '#60a5fa', bgcolor: 'rgba(59, 130, 246, 0.1)', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' } }}
                            >
                                <MapIcon fontSize="small" />
                            </IconButton>
                            </Box>
                        </TableCell>
                        </TableRow>
                    );
                  })
                ) : (
                  <TableRow><TableCell colSpan={5} align="center" sx={{py: 4, color: 'grey.500'}}>No reimbursements found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* --- START NEW TRIP MODAL --- */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#1a1625', backgroundImage: 'linear-gradient(to bottom right, #1a1625, #0f0c29)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' } }}>
        <DialogTitle sx={{ color: '#fff', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Start a New Trip
          <IconButton onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.5)' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <TextField 
                select 
                label="Select Company Name" 
                name="companyName" 
                value={formData.companyName} 
                onChange={handleCompanyChange} 
                fullWidth 
                sx={inputStyle}
                SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#131129', color: '#fff', '& .MuiMenuItem-root:hover': { bgcolor: 'rgba(255,255,255,0.1)' }, '& .Mui-selected': { bgcolor: 'rgba(59,130,246,0.3) !important' } } } } }}
            >
              {companies.length > 0 ? (
                companies.map((company, index) => (
                    <MenuItem key={index} value={company.name}>{company.name}</MenuItem>
                ))
              ) : (
                <MenuItem disabled>No companies available</MenuItem>
              )}
            </TextField>
            <TextField label="Category" name="category" placeholder="e.g. Travel, Food" value={formData.category} onChange={handleChange} fullWidth sx={inputStyle} />
            <Stack direction="row" spacing={2}>
              <TextField type="date" label="Date" name="date" value={formData.date} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} sx={inputStyle} />
              <TextField type="time" label="Time" name="time" value={formData.time} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} sx={inputStyle} />
            </Stack>
            <TextField type="number" label="Amount" name="amount" value={formData.amount} onChange={handleChange} fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><Typography color="white">₹</Typography></InputAdornment> }} sx={inputStyle} />
            <Box sx={{ border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '12px', p: 3, textAlign: 'center', cursor: 'pointer', transition: '0.3s', '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.05)' } }} component="label">
                <input type="file" hidden onChange={handleFileChange} />
                <CloudUploadIcon sx={{ fontSize: 40, color: "#3b82f6", mb: 1 }} />
                <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>{formData.invoice ? formData.invoice.name : "Click to upload Invoice"}</Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.6)' }}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} variant="contained" sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}>
            {submitting ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : "Submit Claim"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- VIEW TRIP DETAILS MODAL --- */}
      {selectedTrip && (
        <Dialog 
          open={viewOpen} 
          onClose={handleViewClose} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: '#131129',
              backgroundImage: 'linear-gradient(to bottom right, #131129, #1a1625)',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.7)',
              maxWidth: '1100px'
            }
          }}
        >
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                        <ReceiptIcon2 />
                    </Box>
                    <Box>
                        <Typography variant="h6" color="white" fontWeight={600}>{selectedTrip.company}</Typography>
                        <Typography variant="body2" color="rgba(255,255,255,0.6)" display="flex" alignItems="center" gap={0.5}>
                             {selectedTrip.date}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={handleViewClose} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' } }}><CloseIcon /></IconButton>
            </Box>

            <DialogContent sx={{ p: 0 }}>
                <Grid container sx={{ height: '100%' }}>
                    {/* Left: Expenses List */}
                    <Grid item xs={12} md={8} sx={{ p: 3, borderRight: { md: '1px solid rgba(255,255,255,0.1)' } }}>
                        <Typography variant="subtitle1" color="white" fontWeight={600} mb={3}>Trip Expenses</Typography>
                        
                        <TableContainer sx={{ maxHeight: 400 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        {['Date', 'Time', 'Category', 'Lead ID', 'Amount', 'Map'].map(h => (
                                            <TableCell key={h} sx={{ bgcolor: '#131129', color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>{h}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedTrip.details.expenses.map((exp, i) => (
                                        <TableRow key={i} sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 2 } }}>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>{exp.date}</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{exp.time}</TableCell>
                                            <TableCell sx={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}>{exp.category}</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{exp.lead_id}</TableCell>
                                            <TableCell sx={{ color: '#fff', fontWeight: 600, fontSize: '13px' }}>{exp.amount}</TableCell>
                                            <TableCell>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleSingleMapOpen(exp.coords)}
                                                    sx={{ color: '#60a5fa', bgcolor: 'rgba(59, 130, 246, 0.1)', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' } }}>
                                                    <MapIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {/* Total Row */}
                                    <TableRow>
                                        <TableCell colSpan={4} align="right" sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: 'none', pt: 3 }}>Total Expenses Made:</TableCell>
                                        <TableCell colSpan={2} sx={{ color: '#fff', fontWeight: 700, fontSize: '16px', borderBottom: 'none', pt: 3 }}>{selectedTrip.amount}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>

                    {/* Right: Summary & Timeline */}
                    <Grid item xs={12} md={4} sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
                        
                        {/* Status Card */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle1" color="white" fontWeight={600} mb={2}>Reimbursement Status</Typography>
                            <Stack spacing={1.5} sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="rgba(255,255,255,0.6)" fontSize="13px">Total Amount</Typography>
                                    <Typography color="white" fontWeight={600} fontSize="13px">{selectedTrip.details.total}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="rgba(255,255,255,0.6)" fontSize="13px">Amount Received</Typography>
                                    <Typography color="white" fontWeight={600} fontSize="13px">{selectedTrip.details.advance}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography color="rgba(255,255,255,0.6)" fontSize="13px">Current Status</Typography>
                                    <Typography color={selectedTrip.status === 'Pending' ? '#fcd34d' : 'white'} fontSize="13px" fontWeight={600}>
                                        {selectedTrip.status}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />

                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="rgba(255,255,255,0.6)" fontSize="13px">Approved Amount</Typography>
                                    <Typography color="#10b981" fontWeight={700} fontSize="13px">₹0.00</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="rgba(255,255,255,0.6)" fontSize="13px">Pending Amount</Typography>
                                    <Typography color="#f59e0b" fontWeight={700} fontSize="13px">₹0.00</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="rgba(255,255,255,0.6)" fontSize="13px">Rejected Amount</Typography>
                                    <Typography color="#ef4444" fontWeight={700} fontSize="13px">₹0.00</Typography>
                                </Box>
                            </Stack>
                        </Box>

                        {/* Timeline */}
                        <Box sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '16px', p: 2, flexGrow: 1 }}>
                            <Typography variant="subtitle1" color="white" fontWeight={600} mb={2}>Timeline</Typography>
                            
                            <Stack spacing={0}>
                                {/* Step 1: Submitted */}
                                <Box sx={{ position: 'relative', pb: 3, pl: 3, borderLeft: '2px solid #3b82f6' }}>
                                    <Box sx={{ position: 'absolute', left: '-5px', top: 0, width: 8, height: 8, borderRadius: '50%', bgcolor: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }} />
                                    <Typography color="white" fontSize="13px" fontWeight={500} lineHeight={1}>Reimbursement Submitted</Typography>
                                    <Typography color="rgba(255,255,255,0.5)" fontSize="11px">{selectedTrip.details.submissionDate}</Typography>
                                </Box>

                                {/* Step 2: Approved */}
                                <Box sx={{ position: 'relative', pb: 3, pl: 3, borderLeft: `2px solid ${selectedTrip.status === 'Approved' || selectedTrip.status === 'Completed' ? '#10b981' : 'rgba(255,255,255,0.1)'}` }}>
                                    <Box sx={{ position: 'absolute', left: '-5px', top: 0, width: 8, height: 8, borderRadius: '50%', bgcolor: selectedTrip.status === 'Approved' || selectedTrip.status === 'Completed' ? '#10b981' : 'transparent', border: `2px solid ${selectedTrip.status === 'Approved' || selectedTrip.status === 'Completed' ? '#10b981' : 'rgba(255,255,255,0.3)'}` }} />
                                    <Typography color={selectedTrip.status === 'Approved' || selectedTrip.status === 'Completed' ? "white" : "rgba(255,255,255,0.5)"} fontSize="13px" fontWeight={500} lineHeight={1}>Approved</Typography>
                                </Box>

                                {/* Step 3: Credited */}
                                <Box sx={{ position: 'relative', pl: 3 }}>
                                    <Box sx={{ position: 'absolute', left: '-5px', top: 0, width: 8, height: 8, borderRadius: '50%', bgcolor: selectedTrip.status === 'Completed' ? '#10b981' : 'transparent', border: `2px solid ${selectedTrip.status === 'Completed' ? '#10b981' : 'rgba(255,255,255,0.3)'}` }} />
                                    <Typography color={selectedTrip.status === 'Completed' ? "white" : "rgba(255,255,255,0.5)"} fontSize="13px" fontWeight={500} lineHeight={1}>Credited</Typography>
                                </Box>
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
      )}

      {/* --- ALL EXPENSES MAP DIALOG --- */}
      <TripMapDialog open={tripMapOpen} onClose={handleTripMapClose} trip={selectedTrip} />

      {/* --- SINGLE EXPENSE MAP DIALOG --- */}
      <SingleMapDialog open={singleMapOpen} onClose={() => setSingleMapOpen(false)} location={mapLocation} />

      {/* --- TOAST NOTIFICATION --- */}
      <Snackbar open={toast.open} autoHideDuration={10000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ borderRadius: '12px', width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
            {toast.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default TechnicalReimbursement;