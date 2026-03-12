import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Button, Grid, Stack, IconButton, InputBase,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, keyframes, useTheme, useMediaQuery, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, InputAdornment,
  Divider, CircularProgress, Snackbar, Alert, Checkbox, ListItemText,
  Select, FormControl, InputLabel, Chip
} from '@mui/material';
import {
  Add as AddIcon, AccountBalanceWallet as WalletIcon, ReceiptLong as ReceiptIcon,
  PieChart as PieChartIcon, Close as CloseIcon, CloudUpload as CloudUploadIcon,
  Receipt as ReceiptIcon2, Visibility as ViewIcon, Info as InfoIcon, Search as SearchIcon
} from '@mui/icons-material';

// --- API HELPERS ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
const getAuthRole = () => localStorage.getItem("auth_role") || sessionStorage.getItem("auth_role");
const getAuthUser = () => {
  const userStr = localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");
  try { return userStr ? JSON.parse(userStr) : null; } catch (e) { return null; }
};

// --- ANIMATIONS ---
const float = keyframes`
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -30px); }
`;

// --- NEW COMPONENT: ANIMATED COUNTER (01234 Style) ---
const AnimatedCounter = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const startValue = count;
    const endValue = parseFloat(value) || 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentCount = progress * (endValue - startValue) + startValue;
      setCount(currentCount);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value]);

  return <span>₹{count.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
};

// --- STYLES CONSTANTS ---
const pageStyle = {
  minHeight: '100vh',
  background: '#0f0c29',
  backgroundImage: `radial-gradient(circle at 15% 50%, rgba(76, 29, 149, 0.25) 0%, transparent 50%), radial-gradient(circle at 85% 30%, rgba(37, 99, 235, 0.2) 0%, transparent 50%)`,
  color: '#ffffff',
  fontFamily: "'Inter', sans-serif",
  p: { xs: 2, md: 4 },
  display: 'flex',
  justifyContent: 'center',
  position: 'relative',
  overflowX: 'hidden',
};

const orbStyle = {
  position: 'fixed',
  borderRadius: '50%',
  filter: 'blur(80px)',
  zIndex: 0,
  animation: `${float} 10s infinite ease-in-out`,
};

const glassPanelStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '24px',
  p: { xs: 2, sm: 3 },
  width: '100%',
  maxWidth: '1200px',
  zIndex: 1,
  position: 'relative'
};

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

const iconBoxStyle = (color, bg) => ({
  width: '48px', height: '48px', borderRadius: '14px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '20px', color: color, background: bg,
});

const inputStyle = {
  '& .MuiOutlinedInput-root': { 
      color: '#fff', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '12px', 
      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, 
      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' }, 
      '&.Mui-focused fieldset': { borderColor: '#3b82f6' } 
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
  '& input::-webkit-calendar-picker-indicator': { filter: 'invert(1)', cursor: 'pointer' },
  '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.5)' }
};

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

const secondaryBtnStyle = {
  borderColor: 'rgba(59, 130, 246, 0.5)',
  color: '#60a5fa',
  borderRadius: '30px',
  textTransform: 'none',
  fontWeight: 600,
  px: 3,
  py: 1,
  '&:hover': {
    borderColor: '#3b82f6',
    background: 'rgba(59, 130, 246, 0.1)',
  }
};

const statusStyle = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'completed') return { background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', border: '1px solid rgba(34, 197, 94, 0.3)' };
    if (s === 'complications') return { background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)' };
    return { background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)' };
};

// --- MAIN COMPONENT ---
const TechnicalReimbursement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const currentUser = getAuthUser();
  const EMPLOYEE_ID = currentUser?.employee_id || ""; 
  const role = getAuthRole() || "";

  // --- State ---
  const [reimbursements, setReimbursements] = useState([]);
  const [summaryData, setSummaryData] = useState({ totalExpense: 0, totalReceived: 0 });
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // --- Modal States ---
  const [open, setOpen] = useState(false); // Start Trip
  const [viewOpen, setViewOpen] = useState(false); // View Details (Put Claims)
  const [expenseModalOpen, setExpenseModalOpen] = useState(false); // Add Expense
  
  const [submitting, setSubmitting] = useState(false);
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  
  const [selectedTrip, setSelectedTrip] = useState(null);
  
  // Trip Expenses Data State
  const [tripExpenses, setTripExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  // --- Start Trip Form Data ---
  const [formData, setFormData] = useState({ 
    companyName: '', 
    start_date: '', 
    end_date: '' 
  });

  // --- Add Expense Form Data ---
  const [expenseFormData, setExpenseFormData] = useState({
    category: '',
    description: '',
    date: '',
    time: '',
    amount: '',
    invoice: null
  });

  // Add Expense Multi-Select State
  const [teamEmployees, setTeamEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Expense Categories for dropdown
  const expenseCategories = [
    'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Travel', 'Accommodation', 'Other'
  ];

  // --- HELPER: CHECK IF CLAIM IS EXPIRED (>24 HRS AFTER END DATE) ---
  const isClaimExpired = (endDateStr) => {
    if (!endDateStr) return false; 
    
    const [year, month, day] = endDateStr.split('-');
    const endDate = new Date(year, month - 1, day);
    endDate.setHours(23, 59, 59, 999);
    
    const deadline = new Date(endDate.getTime() + (24 * 60 * 60 * 1000));
    return new Date() > deadline;
  };

  // --- FETCH SUMMARY API ---
  const fetchSummary = async () => {
    setLoadingData(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/reimbursements/summary`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const json = await response.json();
      if (response.ok) {
        const total = (json.data || []).reduce((acc, curr) => acc + (parseFloat(curr.total_expense_amount) || 0), 0);
        setSummaryData(prev => ({ ...prev, totalExpense: total }));
        setReimbursements(json.data || []);
      }
    } catch (err) {
      console.error("Summary Fetch Error:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // --- FETCH EXPENSES FOR SPECIFIC TRIP ---
  const fetchTripExpenses = async (reimbursementId) => {
    setLoadingExpenses(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/reimbursements/${reimbursementId}/expenses`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      const json = await res.json();
      if (res.ok) {
        setTripExpenses(json.data || []);
      } else {
        setTripExpenses([]);
      }
    } catch (err) {
      console.error("Fetch Trip Expenses Error:", err);
      setTripExpenses([]);
    } finally {
      setLoadingExpenses(false);
    }
  };

  // Dynamically calculate total expenses based on fetched data
  const tripTotalAmount = useMemo(() => {
    return tripExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  }, [tripExpenses]);

  // --- FETCH TEAM EMPLOYEES (Based on Role) ---
  const fetchTeamEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const token = getToken();
      let endpoint = "/api/v1/employees/department/field-marketing"; // Default Fallback

      if (role.includes("Field-Marketing")) {
        endpoint = "/api/v1/employees/department/field-marketing";
      } else if (role.includes("Associate-Marketing")) {
        endpoint = "/api/v1/employees/department/associate-marketing";
      } else if (role.includes("Corporate-Marketing")) {
        endpoint = "/api/v1/employees/department/corporate-marketing";
      } else if (role.includes("Technical-Team")) {
        endpoint = "/api/v1/employees/department/technical-team";
      } else if (role.includes("Solutions-Team")) {
        endpoint = "/api/v1/employees/department/solution-team";
      } else if (role.includes("Quotation-Team")) {
        endpoint = "/api/v1/employees/department/quotation-team";
      }

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      const json = await res.json();
      if (res.ok) {
        setTeamEmployees(json.data || []);
      } else {
        throw new Error(json.message || "Failed to fetch team members");
      }
    } catch (err) {
      console.error("Fetch Employees Error:", err);
      setToast({ open: true, message: "Could not load employees list.", severity: "error" });
    } finally {
      setLoadingEmployees(false);
    }
  };

  // --- CALCULATE SUMMARY TOTALS ---
  const totalRemainingAmount = summaryData.totalExpense - summaryData.totalReceived;

  // --- Handlers ---
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
    setFormData({ companyName: '', start_date: '', end_date: '' });
  };

  const handleExpenseModalOpen = () => {
    fetchTeamEmployees();
    setExpenseModalOpen(true);
  };

  const handleExpenseModalClose = () => {
    setExpenseModalOpen(false);
    setSelectedEmployees([]);
    setExpenseFormData({ category: '', description: '', date: '', time: '', amount: '', invoice: null });
  };

  const handleEmployeeChange = (event) => {
    const { target: { value } } = event;
    setSelectedEmployees(typeof value === 'string' ? value.split(',') : value);
  };

  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setExpenseFormData({ ...expenseFormData, [name]: value });
  };

  const handleExpenseFileChange = (e) => {
    setExpenseFormData({ ...expenseFormData, invoice: e.target.files[0] });
  };

  // --- SUBMIT NEW EXPENSE API (Inside Put Claims Modal) ---
  const handleAddExpenseSubmit = async () => {
    const finalDescription = expenseFormData.category === 'Other' ? expenseFormData.description : expenseFormData.category;

    if (!expenseFormData.category || (expenseFormData.category === 'Other' && !expenseFormData.description) || !expenseFormData.amount || !expenseFormData.date || selectedEmployees.length === 0) {
        setToast({ open: true, message: "Please fill all required fields and select employees", severity: "error" });
        return;
    }

    if (!expenseFormData.invoice) {
        setToast({ open: true, message: "Receipt upload is mandatory.", severity: "error" });
        return;
    }

    setExpenseSubmitting(true);
    
    try {
        const token = getToken();
        const submitData = new FormData();
        
        submitData.append('reimbursement_id', selectedTrip.id);
        submitData.append('description', finalDescription);
        submitData.append('expense_date', expenseFormData.date);
        
        let timeVal = expenseFormData.time;
        if (timeVal && timeVal.length === 5) {
            timeVal += ':00';
        }
        submitData.append('expense_time', timeVal);
        submitData.append('amount', expenseFormData.amount);
        submitData.append('associated_employees', JSON.stringify(selectedEmployees));

        if (expenseFormData.invoice) {
            submitData.append('file', expenseFormData.invoice);
        }

        const response = await fetch(`${API_BASE_URL}/api/reimbursements/expenses`, {
            method: 'POST',
            headers: { 
              "Authorization": `Bearer ${token}` 
            },
            body: submitData
        });

        const result = await response.json();
        
        if (response.ok) {
            setToast({ open: true, message: "Expense added successfully!", severity: "success" });
            handleExpenseModalClose();
            fetchTripExpenses(selectedTrip.id);
            fetchSummary();
        } else {
            setToast({ open: true, message: "Failed: " + (result.message || "Unknown error"), severity: "error" });
        }
    } catch (err) {
        console.error(err);
        setToast({ open: true, message: "Network Error: " + err.message, severity: "error" });
    } finally {
        setExpenseSubmitting(false);
    }
  };

  // --- Adapter: Convert API Data to Modal Format ---
  const adaptGroupedDataToTrip = (row) => {
    return {
        id: row.reimbursement_id, 
        company: row.company_name,
        date: row.start_date,
        status: row.res_status || 'Pending',
        details: {
            advance: '₹0.00',
            submissionDate: row.created_at ? new Date(row.created_at).toLocaleDateString('en-GB') : '-'
        }
    };
  };

  const handleViewOpen = (row) => {
    setSelectedTrip(adaptGroupedDataToTrip(row));
    setViewOpen(true);
    fetchTripExpenses(row.reimbursement_id);
  };
  
  const handleViewClose = () => {
    setViewOpen(false);
    setSelectedTrip(null);
    setTripExpenses([]); 
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- SUBMIT CLAIM / NEW TRIP (POST) ---
  const handleSubmit = async () => {
    if (!formData.companyName || !formData.start_date || !formData.end_date) {
        setToast({ open: true, message: "Please fill all required fields", severity: "error" });
        return;
    }

    setSubmitting(true);

    try {
        const token = getToken();

        const response = await fetch(`${API_BASE_URL}/api/reimbursements`, {
            method: 'POST',
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                company_name: formData.companyName,
                start_date: formData.start_date,
                end_date: formData.end_date
            })
        });

        const result = await response.json();
        
        if (response.ok) {
            setToast({ open: true, message: "Trip created successfully!", severity: "success" });
            handleClose();
            fetchSummary(); 
        } else {
            setToast({ open: true, message: "Failed: " + (result.message || "Unknown error"), severity: "error" });
        }

    } catch (err) {
        setToast({ open: true, message: "Network Error: " + err.message, severity: "error" });
    } finally {
        setSubmitting(false);
    }
  };

  // --- Filtering Logic ---
  const filteredReimbursements = reimbursements.filter((item) => {
    const query = searchQuery.toLowerCase();
    const companyName = item.company_name?.toLowerCase() || '';
    const rId = item.reimbursement_id?.toLowerCase() || '';
    const status = item.res_status?.toLowerCase() || '';

    return (
      companyName.includes(query) ||
      rId.includes(query) ||
      status.includes(query)
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
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen} sx={primaryBtnStyle}>
              Start a New Trip
            </Button>
          </Box>
        </Box>

        {/* Accounts Summary */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 500, mb: 2, pl: 1 }}>Accounts Overview</Typography>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={4}>
              <Box sx={summaryCardStyle}>
                <Box sx={iconBoxStyle('#fca5a5', 'rgba(239, 68, 68, 0.2)')}><ReceiptIcon /></Box>
                <Box>
                    <Typography sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', mb: 0.5 }}>Expense Amount</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#fca5a5' }}>
                        <AnimatedCounter value={summaryData.totalExpense} />
                    </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={summaryCardStyle}>
                <Box sx={iconBoxStyle('#6ee7b7', 'rgba(16, 185, 129, 0.2)')}><WalletIcon /></Box>
                <Box>
                    <Typography sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', mb: 0.5 }}>Received Amount</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#6ee7b7' }}>
                        <AnimatedCounter value={summaryData.totalReceived} />
                    </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={summaryCardStyle}>
                <Box sx={iconBoxStyle('#fff', 'rgba(255, 255, 255, 0.1)')}><PieChartIcon /></Box>
                <Box>
                    <Typography sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', mb: 0.5 }}>Remaining Balance</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
                        <AnimatedCounter value={totalRemainingAmount} />
                    </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', mt: 2, pl: 1, display: 'flex', alignItems: 'center', gap: 1 }}><InfoIcon sx={{ fontSize: 16 }} /> Data is updated monthly. Contact IT for discrepancies.</Typography>
        </Box>

        {/* All Trips Table */}
        <Box sx={{ background: 'rgba(20, 20, 40, 0.4)', borderRadius: '24px', p: 3, border: '1px solid rgba(255,255,255,0.08)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" fontWeight={600}>All Trips</Typography>
            <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '12px', px: 2, display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
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
                  {['Trip ID', 'Company', 'Date', 'Amount', 'Status', 'Actions'].map((head, index) => (
                    <TableCell key={head} align={index === 5 ? 'right' : 'left'} sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.08)', py: 2 }}>{head}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingData ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{py: 4}}><CircularProgress size={30} /></TableCell></TableRow>
                ) : filteredReimbursements.length > 0 ? (
                  filteredReimbursements.map((row, index) => {
                    const status = row.res_status || 'Pending';
                    const statusConfig = statusStyle(status);
                    const isExpired = isClaimExpired(row.end_date); // Check 24hr expiration

                    return (
                        <TableRow key={index} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }, '& td': { borderBottom: index === filteredReimbursements.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)' } }}>
                        
                        <TableCell sx={{ color: '#3b82f6', fontWeight: 600 }}>{row.reimbursement_id}</TableCell>
                        
                        <TableCell sx={{ py: 2 }}>
                            <Typography sx={{ fontWeight: 500, fontSize: '14px', color: '#fff' }}>{row.company_name}</Typography>
                        </TableCell>
                        
                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                            {row.start_date ? new Date(row.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </TableCell>
                        
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>₹{row.total_expense_amount}</TableCell>
                        
                        <TableCell>
                            <Box component="span" sx={{ fontSize: '12px', fontWeight: 600, padding: '6px 12px', borderRadius: '20px', background: statusConfig.background, color: statusConfig.color, border: statusConfig.border, display: 'inline-block' }}>
                                {status}
                            </Box>
                        </TableCell>
                        
                        <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1.5 }}>
                            <Button 
                                variant="outlined" 
                                size="small"
                                disabled={isExpired}
                                onClick={() => handleViewOpen(row)}
                                sx={{ 
                                  borderRadius: '20px', 
                                  textTransform: 'none',
                                  ...(isExpired ? {
                                      borderColor: 'rgba(255,255,255,0.1) !important',
                                      color: 'rgba(255,255,255,0.3) !important',
                                  } : {
                                      borderColor: 'rgba(59, 130, 246, 0.5)',
                                      color: '#60a5fa',
                                      '&:hover': {
                                          borderColor: '#3b82f6',
                                          background: 'rgba(59, 130, 246, 0.1)',
                                      }
                                  })
                                }}>
                                Put Claims
                            </Button>
                            </Box>
                        </TableCell>
                        </TableRow>
                    );
                  })
                ) : (
                  <TableRow><TableCell colSpan={6} align="center" sx={{py: 4, color: 'grey.500'}}>No reimbursements found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* --- START NEW TRIP MODAL --- */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#1a1625', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', backgroundImage: 'linear-gradient(to bottom right, #1a1625, #0f0c29)' } }}>
        <DialogTitle sx={{ color: '#fff', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Start a New Trip
          <IconButton onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.5)' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Stack spacing={3}>
            <TextField 
                label="Company Name" 
                name="companyName" 
                value={formData.companyName} 
                onChange={handleChange} 
                placeholder="Enter Company Name"
                fullWidth 
                sx={inputStyle}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField type="date" label="Start Date" name="start_date" value={formData.start_date} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} sx={inputStyle} />
              <TextField type="date" label="End Date" name="end_date" value={formData.end_date} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} sx={inputStyle} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} variant="contained" sx={{ bgcolor: '#3b82f6', borderRadius: '20px', textTransform: 'none', px: 3 }}>
            {submitting ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : "Create Trip"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- VIEW TRIP DETAILS MODAL (PUT CLAIMS) --- */}
      {selectedTrip && (
        <Dialog 
          open={viewOpen} 
          onClose={handleViewClose} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: '#131129',
              backgroundImage: 'linear-gradient(to bottom right, #131129, #1a1625)',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.7)'
            }
          }}
        >
            {/* Header */}
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                        <ReceiptIcon2 />
                    </Box>
                    <Box>
                        <Typography variant="h6" color="white" fontWeight={600}>{selectedTrip.company}</Typography>
                        <Typography variant="body2" color="rgba(255,255,255,0.6)" display="flex" alignItems="center" gap={0.5}>
                             {selectedTrip.date ? new Date(selectedTrip.date).toLocaleDateString('en-GB') : '-'}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={handleViewClose} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' } }}><CloseIcon /></IconButton>
            </Box>

            <DialogContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                
                {/* Top Status Card - Full Width Row Layout */}
                <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '16px', p: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography variant="subtitle1" color="white" fontWeight={600} mb={2}>Reimbursement Status</Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <Typography color="rgba(255,255,255,0.6)" fontSize="13px" mb={0.5}>Total Amount</Typography>
                            <Typography color="white" fontWeight={600} fontSize="16px">₹{tripTotalAmount.toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography color="rgba(255,255,255,0.6)" fontSize="13px" mb={0.5}>Amount Received</Typography>
                            <Typography color="white" fontWeight={600} fontSize="16px">{selectedTrip.details.advance}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography color="rgba(255,255,255,0.6)" fontSize="13px" mb={0.5}>Current Status</Typography>
                            <Typography 
                              color={selectedTrip.status === 'Pending' ? '#EF4444' : selectedTrip.status === 'Complications' ? '#F59E0B' : '#10B981'} 
                              fontSize="16px" 
                              fontWeight={600}
                            >
                                {selectedTrip.status}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography color="rgba(255,255,255,0.6)" fontSize="13px" mb={0.5}>Approved Amount</Typography>
                            <Typography color="#10b981" fontWeight={700} fontSize="16px">₹0.00</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography color="rgba(255,255,255,0.6)" fontSize="13px" mb={0.5}>Rejected Amount</Typography>
                            <Typography color="#EF4444" fontWeight={700} fontSize="16px">₹0.00</Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Expenses Table & Add Expense Button */}
                <Box sx={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', p: 3, bgcolor: 'rgba(255,255,255,0.02)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
                        <Typography variant="subtitle1" color="white" fontWeight={600}>Trip Expenses</Typography>
                        <Button 
                            variant="outlined" 
                            size="small"
                            startIcon={<AddIcon />} 
                            onClick={handleExpenseModalOpen} 
                            sx={{ ...secondaryBtnStyle, py: 0.5, px: 2, fontSize: '13px' }}
                        >
                            Add Expense
                        </Button>
                    </Box>

                    <TableContainer sx={{ maxHeight: 300 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    {['Date', 'Time', 'Description', 'Amount', 'Receipt'].map(h => (
                                        <TableCell key={h} sx={{ bgcolor: '#131129', color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loadingExpenses ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ borderBottom: 'none', py: 4 }}>
                                            <CircularProgress size={24} sx={{ color: '#3b82f6' }} />
                                        </TableCell>
                                    </TableRow>
                                ) : tripExpenses && tripExpenses.length > 0 ? (
                                    tripExpenses.map((exp, i) => (
                                        <TableRow key={i} sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 2 } }}>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
                                                {exp.expense_date ? new Date(exp.expense_date).toLocaleDateString('en-GB') : '-'}
                                            </TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{exp.expense_time || '-'}</TableCell>
                                            <TableCell sx={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}>{exp.description || '-'}</TableCell>
                                            <TableCell sx={{ color: '#fff', fontWeight: 600, fontSize: '13px' }}>₹{exp.amount || '0'}</TableCell>
                                            
                                            {/* RECEIPT VIEW BUTTON COLUMN */}
                                            <TableCell>
                                                {exp.receipt_path ? (
                                                    <IconButton
                                                        size="small"
                                                        component="a"
                                                        href={exp.receipt_path.startsWith('http') ? exp.receipt_path : `${API_BASE_URL.replace(/\/$/, '')}/${exp.receipt_path.replace(/\\/g, '/').replace(/^\//, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        sx={{ 
                                                            color: '#60a5fa', 
                                                            bgcolor: 'rgba(59, 130, 246, 0.1)', 
                                                            borderRadius: '8px',
                                                            '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' } 
                                                        }}
                                                    >
                                                        <ViewIcon fontSize="small" />
                                                    </IconButton>
                                                ) : (
                                                    <Typography variant="caption" color="rgba(255,255,255,0.4)">-</Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ borderBottom: 'none', py: 5, color: 'grey.600' }}>
                                            No expenses added yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {/* Total Row */}
                                <TableRow>
                                    <TableCell colSpan={3} align="right" sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: 'none', pt: 3 }}>Total Expenses Made:</TableCell>
                                    <TableCell colSpan={2} sx={{ color: '#fff', fontWeight: 700, fontSize: '16px', borderBottom: 'none', pt: 3 }}>₹{tripTotalAmount.toFixed(2)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Timeline */}
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '16px', p: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography variant="subtitle1" color="white" fontWeight={600} mb={3}>Timeline</Typography>
                    
                    <Stack spacing={0}>
                        {/* Step 1: Submitted */}
                        <Box sx={{ position: 'relative', pb: 3, pl: 3, borderLeft: '2px solid #3b82f6' }}>
                            <Box sx={{ position: 'absolute', left: '-5px', top: 0, width: 8, height: 8, borderRadius: '50%', bgcolor: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }} />
                            <Typography color="white" fontSize="13px" fontWeight={500} lineHeight={1}>Reimbursement Created</Typography>
                            <Typography color="rgba(255,255,255,0.5)" fontSize="11px" mt={0.5}>{selectedTrip.details.submissionDate}</Typography>
                        </Box>

                        {/* Step 2: Approved / Completed */}
                        <Box sx={{ position: 'relative', pb: 3, pl: 3, borderLeft: `2px solid ${selectedTrip.status === 'Completed' ? '#10b981' : 'rgba(255,255,255,0.1)'}` }}>
                            <Box sx={{ position: 'absolute', left: '-5px', top: 0, width: 8, height: 8, borderRadius: '50%', bgcolor: selectedTrip.status === 'Completed' ? '#10b981' : 'transparent', border: `2px solid ${selectedTrip.status === 'Completed' ? '#10b981' : 'rgba(255,255,255,0.3)'}` }} />
                            <Typography color={selectedTrip.status === 'Completed' ? "white" : "rgba(255,255,255,0.5)"} fontSize="13px" fontWeight={500} lineHeight={1}>Completed</Typography>
                        </Box>

                        {/* Step 3: Credited */}
                        <Box sx={{ position: 'relative', pl: 3 }}>
                            <Box sx={{ position: 'absolute', left: '-5px', top: 0, width: 8, height: 8, borderRadius: '50%', bgcolor: 'transparent', border: '2px solid rgba(255,255,255,0.3)' }} />
                            <Typography color="rgba(255,255,255,0.5)" fontSize="13px" fontWeight={500} lineHeight={1}>Credited</Typography>
                        </Box>
                    </Stack>
                </Box>

            </DialogContent>
        </Dialog>
      )}

      {/* --- ADD EXPENSE MODAL (MULTI-SELECT & DROPDOWN) --- */}
      <Dialog open={expenseModalOpen} onClose={handleExpenseModalClose} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#1a1625', backgroundImage: 'linear-gradient(to bottom right, #1a1625, #0f0c29)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', zIndex: 9999 } }}>
        <DialogTitle sx={{ color: '#fff', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Add New Expense
          <IconButton onClick={handleExpenseModalClose} sx={{ color: 'rgba(255,255,255,0.5)' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={3}>
            {loadingEmployees ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} sx={{ color: '#3b82f6' }} />
              </Box>
            ) : (
              <FormControl fullWidth sx={inputStyle}>
                <InputLabel id="demo-multiple-checkbox-label">Select Employees</InputLabel>
                <Select
                  labelId="demo-multiple-checkbox-label"
                  id="demo-multiple-checkbox"
                  multiple
                  value={selectedEmployees}
                  onChange={handleEmployeeChange}
                  label="Select Employees"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const emp = teamEmployees.find(e => e.employee_id === value);
                        return <Chip key={value} label={emp ? `${emp.first_name} ${emp.last_name}` : value} sx={{ bgcolor: 'rgba(59,130,246,0.2)', color: '#fff', borderRadius: '8px' }} size="small" />;
                      })}
                    </Box>
                  )}
                  MenuProps={{ PaperProps: { sx: { bgcolor: '#131129', color: '#fff', '& .MuiMenuItem-root:hover': { bgcolor: 'rgba(255,255,255,0.1)' } } } }}
                >
                  {teamEmployees.map((emp) => (
                    <MenuItem key={emp.employee_id} value={emp.employee_id}>
                      <Checkbox 
                        checked={selectedEmployees.indexOf(emp.employee_id) > -1} 
                        sx={{ color: 'rgba(255,255,255,0.5)', '&.Mui-checked': { color: '#3b82f6' } }}
                      />
                      <ListItemText primary={`${emp.first_name} ${emp.last_name}`} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            {/* EXPENSE CATEGORY DROPDOWN */}
            <FormControl fullWidth sx={inputStyle}>
              <InputLabel id="expense-category-label">Expense Category</InputLabel>
              <Select
                labelId="expense-category-label"
                name="category"
                value={expenseFormData.category}
                onChange={handleExpenseChange}
                label="Expense Category"
                MenuProps={{ PaperProps: { sx: { bgcolor: '#131129', color: '#fff', '& .MuiMenuItem-root:hover': { bgcolor: 'rgba(255,255,255,0.1)' }, '& .Mui-selected': { bgcolor: 'rgba(59,130,246,0.3) !important' } } } }}
              >
                {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Travel', 'Accommodation', 'Other'].map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* MANUAL DESCRIPTION INPUT (Only shows if 'Other' is selected) */}
            {expenseFormData.category === 'Other' && (
              <TextField 
                label="Please specify details" 
                name="description" 
                value={expenseFormData.description} 
                onChange={handleExpenseChange} 
                placeholder="Enter custom description" 
                fullWidth 
                sx={inputStyle} 
              />
            )}
            
            <Stack direction="row" spacing={2}>
              <TextField type="date" label="Date" name="date" value={expenseFormData.date} onChange={handleExpenseChange} fullWidth InputLabelProps={{ shrink: true }} sx={inputStyle} />
              <TextField type="time" label="Time" name="time" value={expenseFormData.time} onChange={handleExpenseChange} fullWidth InputLabelProps={{ shrink: true }} sx={inputStyle} />
            </Stack>

            <TextField type="number" label="Amount" name="amount" value={expenseFormData.amount} onChange={handleExpenseChange} fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><Typography color="white">₹</Typography></InputAdornment> }} sx={inputStyle} />
            
            <Box sx={{ border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '12px', p: 3, textAlign: 'center', cursor: 'pointer', transition: '0.3s', '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.05)' } }} component="label">
                <input type="file" hidden onChange={handleExpenseFileChange} />
                <CloudUploadIcon sx={{ fontSize: 40, color: "#3b82f6", mb: 1 }} />
                <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
                    {expenseFormData.invoice ? expenseFormData.invoice.name : "Click to upload Receipt"}
                </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button onClick={handleExpenseModalClose} sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddExpenseSubmit} disabled={expenseSubmitting} sx={{ bgcolor: '#3b82f6', borderRadius: '20px', textTransform: 'none', px: 3 }}>
              {expenseSubmitting ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : "Submit Expense"}
          </Button>
        </DialogActions>
      </Dialog>

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