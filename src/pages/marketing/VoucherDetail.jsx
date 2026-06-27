import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  TableContainer,
  TextField,
  Chip,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  InputAdornment
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- API HELPERS ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
const getAuthRole = () => localStorage.getItem("auth_role") || sessionStorage.getItem("auth_role");

// Reusable Glass Card Style
const glassStyle = {
  background: 'rgba(30, 27, 46, 0.7)', 
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  color: '#fff',
  p: 3,
  mb: 4,
  boxSizing: 'border-box'
};

// Custom TextField styling for glass theme modals
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

// Helper function to safely encode file paths
const formatFileUrl = (path) => {
  if (!path) return '#';
  if (path.startsWith('http')) return path;
  
  const cleanPath = path.replace(/\\/g, '/').replace(/^\//, '');
  const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');
  
  return `${API_BASE_URL.replace(/\/$/, '')}/${encodedPath}`;
};

const fetchImageAsBase64 = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error fetching image for PDF:', error);
    return null;
  }
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function VoucherDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const role = getAuthRole() || "";

  const [voucherData, setVoucherData] = useState(null);
  const [advanceAmount, setAdvanceAmount] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Processing States
  const [expenseStates, setExpenseStates] = useState({});
  const [globalNotes, setGlobalNotes] = useState("");

  // --- Add Expense Modal States ---
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);
  const [teamEmployees, setTeamEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  
  const [expenseFormData, setExpenseFormData] = useState({
    category: '',
    reason: '',
    date: '',
    time: '',
    amount: '',
    invoice: null
  });

  // --- FETCH ADVANCE AMOUNT API ---
  const fetchAdvanceAmount = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/reimbursements/${id}/advance`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) {
        setAdvanceAmount(parseFloat(json.advance_amount || 0));
      }
    } catch (err) {
      console.error("Fetch Advance Error:", err);
    }
  }, [id]);

  // --- FETCH VOUCHER DETAILS API ---
  const fetchVoucherDetails = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/reimbursements/${id}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setVoucherData(result.data);
        
        // Immediately load the voucher owner into the teamEmployees list as a guaranteed fallback
        if (result.data.employee_id) {
          setTeamEmployees([{
            employee_id: result.data.employee_id,
            first_name: result.data.employee_name?.split(" ")[0] || "Unknown",
            last_name: result.data.employee_name?.split(" ").slice(1).join(" ") || ""
          }]);
        }

        // Initialize individual expense states
        const initialStates = {};
        if (result.data.expenses) {
          result.data.expenses.forEach(exp => {
            initialStates[exp.expense_id] = {
              status: exp.expense_status || 'Pending', 
              amount: parseFloat(exp.amount || 0)
            };
          });
        }
        setExpenseStates(initialStates);

      } else {
        throw new Error(result.message || "Failed to load voucher details");
      }
    } catch (err) {
      console.error(err);
      setToast({ open: true, message: err.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchVoucherDetails();
      fetchAdvanceAmount(); // Fetch the advance amount simultaneously
    }
  }, [id, fetchVoucherDetails, fetchAdvanceAmount]);

  // --- FETCH EMPLOYEES API (For Dropdown) ---
  const fetchTeamEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const token = getToken();
      let endpoint = "/api/v1/employees/department/field-marketing"; // Default Fallback

      if (role.includes("Field-Marketing")) endpoint = "/api/v1/employees/department/field-marketing";
      else if (role.includes("Associate-Marketing")) endpoint = "/api/v1/employees/department/associate-marketing";
      else if (role.includes("Corporate-Marketing")) endpoint = "/api/v1/employees/department/corporate-marketing";
      else if (role.includes("Technical-Team")) endpoint = "/api/v1/employees/department/technical-team";
      else if (role.includes("Solutions-Team")) endpoint = "/api/v1/employees/department/solution-team";
      else if (role.includes("Quotation-Team")) endpoint = "/api/v1/employees/department/quotation-team";
      else if (role.includes("Kolhapur-Associates")) endpoint = "/api/v1/employees/department/kolhapur-associates";
      else if (role.includes("Nagpur-Associates")) endpoint = "/api/v1/employees/department/nagpur-associates";
      else if (role.includes("Silverline-Associates")) endpoint = "/api/v1/employees/department/silverline-associates";
      else if (role.includes("Trafo-Associates")) endpoint = "/api/v1/employees/department/trafo-associates";
      else if (role.includes("Y-k-Enterprises-Associates")) endpoint = "/api/v1/employees/department/y-k-enterprises-associates";
      else endpoint = "/api/v1/employees/all"; // Global fallback

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.status === 404) return; // Silent fallback handled by initial mount

      const json = await res.json();
      if (res.ok) {
        let fetchedEmps = json.data || json.employees || [];
        
        // Guarantee the voucher owner is always at the top of the list
        if (voucherData && voucherData.employee_id) {
          fetchedEmps = fetchedEmps.filter(e => e.employee_id !== voucherData.employee_id);
          fetchedEmps.unshift({
            employee_id: voucherData.employee_id,
            first_name: voucherData.employee_name?.split(" ")[0] || "Unknown",
            last_name: voucherData.employee_name?.split(" ").slice(1).join(" ") || ""
          });
        }
        
        setTeamEmployees(fetchedEmps);
      }
    } catch (err) {
      console.error("Fetch Employees Error:", err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // --- MODAL & FORM HANDLERS ---
  const handleExpenseModalOpen = () => {
    if (voucherData && voucherData.employee_id) {
      setSelectedEmployees([voucherData.employee_id]);
    } else {
      setSelectedEmployees([]);
    }
    setExpenseFormData({ category: '', reason: '', date: '', time: '', amount: '', invoice: null });
    setExpenseModalOpen(true);
    fetchTeamEmployees();
  };

  const handleExpenseModalClose = () => {
    setExpenseModalOpen(false);
    setSelectedEmployees([]);
    setExpenseFormData({ category: '', reason: '', date: '', time: '', amount: '', invoice: null });
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

  // --- ADD EXPENSE API SUBMISSION ---
  const handleAddExpenseSubmit = async () => {
    if (!expenseFormData.category || !expenseFormData.reason || !expenseFormData.amount || !expenseFormData.date || selectedEmployees.length === 0) {
      setToast({ open: true, message: "Please fill all required fields and ensure an employee is selected.", severity: "error" });
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

      submitData.append('reimbursement_id', voucherData.reimbursement_id);
      submitData.append('description', expenseFormData.category);
      submitData.append('reason', expenseFormData.reason);
      submitData.append('expense_date', expenseFormData.date);

      let timeVal = expenseFormData.time;
      if (timeVal && timeVal.length === 5) {
        timeVal += ':00'; // Ensure HH:MM:SS format
      }
      submitData.append('expense_time', timeVal);
      submitData.append('amount', expenseFormData.amount);
      
      submitData.append('associated_employees', JSON.stringify(selectedEmployees));
      submitData.append('file', expenseFormData.invoice);

      const response = await fetch(`${API_BASE_URL}/api/reimbursements/expenses`, {
        method: 'POST',
        headers: { "Authorization": `Bearer ${token}` },
        body: submitData
      });

      if (response.status === 403) {
        throw new Error("403 Forbidden: You do not have backend permission to add expenses.");
      }

      const result = await response.json();

      if (response.ok) {
        setToast({ open: true, message: "Expense added successfully!", severity: "success" });
        handleExpenseModalClose();
        fetchVoucherDetails();
      } else {
        setToast({ open: true, message: "Failed: " + (result.message || "Unknown error"), severity: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ open: true, message: err.message, severity: "error" });
    } finally {
      setExpenseSubmitting(false);
    }
  };

  // --- ROW ACTION HANDLER ---
  const handleRowAction = (expenseId, statusAction, originalAmount) => {
    setExpenseStates(prev => ({
      ...prev,
      [expenseId]: {
        status: statusAction,
        amount: statusAction === 'Approved' ? parseFloat(originalAmount) : 0
      }
    }));
  };

  // Calculate dynamic approved amount based on admin toggle clicks
  const totalApprovedAmount = useMemo(() => {
    if (!voucherData || !voucherData.expenses) return 0;
    return voucherData.expenses.reduce((sum, exp) => {
      const state = expenseStates[exp.expense_id];
      if (state && state.status !== 'Rejected') {
        return sum + parseFloat(exp.amount || 0);
      }
      return sum;
    }, 0);
  }, [voucherData, expenseStates]);

  // Calculate the difference between requested expenses and advance amount
  const tripRemainingDifference = useMemo(() => {
    // For final verification logic, calculate difference based on the actual Admin Approved Total
    return totalApprovedAmount - advanceAmount;
  }, [totalApprovedAmount, advanceAmount]);

  // --- SUBMIT FINAL VOUCHER PROCESSING API ---
  const handleProcessVoucher = async (finalAction) => {
    setIsProcessing(true);
    try {
      const token = getToken();
      
      // 1. Process Expenses
      const processedExpenses = voucherData.expenses.map(exp => {
        const state = expenseStates[exp.expense_id];
        
        const finalStatus = finalAction === 'Rejected' ? 'Rejected' : (state.status !== 'Pending' ? state.status : 'Approved');
        const finalAmount = finalAction === 'Rejected' ? 0 : (finalStatus === 'Rejected' ? 0 : parseFloat(exp.amount));

        return {
          expense_id: exp.expense_id,
          expense_status: finalStatus,
          approved_amount: finalAmount,
          admin_comments: globalNotes.trim() || (finalStatus === 'Rejected' ? "Rejected by Admin" : "Approved")
        };
      });

      const payload = {
        reimbursement_id: voucherData.reimbursement_id,
        final_trip_status: finalAction === 'Rejected' ? 'Rejected' : 'Completed', 
        expenses: processedExpenses
      };

      const response = await fetch(`${API_BASE_URL}/api/reimbursements/process-expenses`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 403) throw new Error("403 Forbidden: You do not have permission to process expenses.");
      if (response.status === 404) throw new Error("404 Not Found: Ensure 'PUT /process-expenses' is defined correctly in backend.");

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Failed to process expenses");

      // 2. Submit Final Approved Amount (Positive Difference ONLY, else 0)
      const finalApprovedAmountToSend = tripRemainingDifference > 0 ? tripRemainingDifference : 0;
      
      await fetch(`${API_BASE_URL}/api/reimbursements/${voucherData.reimbursement_id}/approve-amount`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ approved_amount: finalApprovedAmountToSend })
      });

      setToast({ open: true, message: `Voucher successfully ${finalAction.toLowerCase()}!`, severity: "success" });
      setTimeout(() => navigate('/marketing/reimbursement/vouchers'), 1500);

    } catch (err) {
      console.error(err);
      setToast({ open: true, message: err.message, severity: "error" });
      setIsProcessing(false);
    }
  };

  // --- UI Helpers & Calculations ---
  const getStatusColor = (statusText) => {
    switch(statusText) {
      case 'Completed':
      case 'Approved': return { bgcolor: 'rgba(74, 222, 128, 0.2)', color: '#4ade80' };
      case 'Rejected': return { bgcolor: 'rgba(248, 113, 113, 0.2)', color: '#f87171' };
      default: return { bgcolor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' };
    }
  };

  // Calculate total requested expenses
  const tripTotalAmount = useMemo(() => {
    if (!voucherData || !voucherData.expenses) return 0;
    return voucherData.expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  }, [voucherData]);

  if (loading) {
    return (
      <Box sx={{ p: 4, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: '#3b82f6' }} />
      </Box>
    );
  }

  if (!voucherData) {
    return (
      <Box sx={{ p: 4, minHeight: '100vh', color: 'white', textAlign: 'center' }}>
        <Typography variant="h5">Voucher not found.</Typography>
        <Button onClick={() => navigate('/marketing/reimbursement/vouchers')} sx={{ mt: 2, color: '#3b82f6' }}>Go Back</Button>
      </Box>
    );
  }

  const statusStyles = getStatusColor(voucherData.status);
  const isVoucherProcessed = voucherData.status === 'Completed' || voucherData.status === 'Rejected';

  const associatedEmployees = new Set();
  voucherData.expenses?.forEach(exp => {
    if (exp.associated_employees) exp.associated_employees.forEach(emp => associatedEmployees.add(emp));
  });
  const numberOfPeople = Math.max(1, associatedEmployees.size);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: '100%', minHeight: '100vh', background: 'transparent', boxSizing: 'border-box' }}>
      
      {/* Header & Back Navigation */}
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/marketing/reimbursement/vouchers')}
        sx={{ color: 'rgba(255,255,255,0.7)', mb: 2, textTransform: 'none', '&:hover': { color: '#fff' } }}
      >
        BACK TO ALL VOUCHERS
      </Button>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Typography variant="h3" fontWeight="800" color="#fff">
          #{voucherData.reimbursement_id}
        </Typography>
        <Chip 
          label={voucherData.status || "Pending Review"} 
          sx={{ bgcolor: statusStyles.bgcolor, color: statusStyles.color, border: `1px solid ${statusStyles.color}55`, fontWeight: 600 }} 
        />
      </Box>

      {/* Trip Information Card */}
      <Card sx={glassStyle}>
        <Typography variant="h6" fontWeight="600" mb={3}>Trip Information</Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
          <Box>
            <Typography variant="caption" color="rgba(255,255,255,0.5)">Trip Name / Company</Typography>
            <Typography variant="body1" fontWeight={500}>{voucherData.company_name || 'N/A'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="rgba(255,255,255,0.5)">Submitted By</Typography>
            <Typography variant="body1" fontWeight={500}>
              {voucherData.employee_name} <Typography component="span" variant="caption" color="rgba(255,255,255,0.5)">({voucherData.employee_id})</Typography>
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="rgba(255,255,255,0.5)">Number of People</Typography>
            <Typography variant="body1" fontWeight={500}>{numberOfPeople}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="rgba(255,255,255,0.5)">Trip Dates</Typography>
            <Typography variant="body1" fontWeight={500}>
              {voucherData.start_date ? new Date(voucherData.start_date).toLocaleDateString('en-GB') : 'N/A'} 
              {voucherData.end_date ? ` - ${new Date(voucherData.end_date).toLocaleDateString('en-GB')}` : ''}
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Expense Entries Card */}
      <Card sx={{ ...glassStyle, p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="600">Expense Entries</Typography>
          
          {/* --- ADD EXPENSE BUTTON --- */}
          {!isVoucherProcessed && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleExpenseModalOpen}
              sx={{ 
                borderColor: 'rgba(59, 130, 246, 0.5)', 
                color: '#60a5fa', 
                borderRadius: '30px', 
                textTransform: 'none', 
                px: 2, 
                '&:hover': { borderColor: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' } 
              }}
            >
              Add Expense
            </Button>
          )}
        </Box>

        <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
              <TableRow>
                <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)', fontSize: '0.8rem', fontWeight: 600 }}>DATE & TIME</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)', fontSize: '0.8rem', fontWeight: 600 }}>CATEGORY</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)', fontSize: '0.8rem', fontWeight: 600 }}>DESCRIPTION</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)', fontSize: '0.8rem', fontWeight: 600 }}>AMOUNT</TableCell>
                <TableCell align="center" sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)', fontSize: '0.8rem', fontWeight: 600 }}>BILL / PROOF</TableCell>
                <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)', fontSize: '0.8rem', fontWeight: 600 }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {voucherData.expenses && voucherData.expenses.length > 0 ? (
                voucherData.expenses.map((row) => {
                  const state = expenseStates[row.expense_id] || {};
                  const isApproved = state.status === 'Approved';
                  const isRejected = state.status === 'Rejected';

                  return (
                    <TableRow key={row.expense_id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }, opacity: isRejected ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                      <TableCell sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
                        {row.expense_date ? new Date(row.expense_date).toLocaleDateString('en-GB') : 'N/A'}
                        <Typography variant="caption" display="block" color="rgba(255,255,255,0.5)">
                          {row.expense_time || ''}
                        </Typography>
                      </TableCell>
                      
                      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Chip label={row.description || 'Other'} size="small" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', fontWeight: 500 }} />
                      </TableCell>
                      
                      <TableCell sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}>
                        {row.reason || '-'}
                      </TableCell>
                      
                      <TableCell sx={{ color: '#fff', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Box sx={{ textDecoration: isRejected ? 'line-through' : 'none', color: isRejected ? 'rgba(255,255,255,0.5)' : '#fff' }}>
                          ₹{parseFloat(row.amount || 0).toFixed(2)}
                        </Box>
                      </TableCell>
                      
                      <TableCell align="center" sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        {row.receipt_path ? (
                          <IconButton 
                            size="small" 
                            component="a"
                            href={formatFileUrl(row.receipt_path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: '#60a5fa', bgcolor: 'rgba(59,130,246,0.1)', '&:hover': { bgcolor: 'rgba(59,130,246,0.2)' } }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        ) : (
                          <Typography variant="caption" color="rgba(255,255,255,0.4)">No File</Typography>
                        )}
                      </TableCell>

                      <TableCell align="right" sx={{ borderColor: 'rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
                        <Button 
                          size="small" 
                          variant={isRejected ? "contained" : "outlined"} 
                          color="error" 
                          disabled={isVoucherProcessed || isProcessing}
                          onClick={() => handleRowAction(row.expense_id, 'Rejected', row.amount)}
                          sx={{ mr: 1, textTransform: 'none', borderRadius: '8px', boxShadow: 'none' }}
                        >
                          Reject
                        </Button>
                        <Button 
                          size="small" 
                          variant={isApproved ? "contained" : "outlined"} 
                          color="success" 
                          disabled={isVoucherProcessed || isProcessing}
                          onClick={() => handleRowAction(row.expense_id, 'Approved', row.amount)}
                          sx={{ textTransform: 'none', borderRadius: '8px', boxShadow: 'none' }}
                        >
                          Approve
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'rgba(255,255,255,0.5)', borderBottom: 'none' }}>
                    No expense entries found for this trip.
                  </TableCell>
                </TableRow>
              )}
              
              {/* Dynamic Totals Row */}
              <TableRow>
                <TableCell colSpan={3} align="right" sx={{ color: 'rgba(255,255,255,0.5)', borderBottom: 'none', py: 3 }}>
                  <Typography variant="body2">Requested Total: ₹{parseFloat(voucherData.total_trip_cost || 0).toFixed(2)}</Typography>
                  <Typography variant="subtitle1" fontWeight={600} color="rgba(255,255,255,0.8)" mt={0.5}>Total Expenses Made:</Typography>
                </TableCell>
                <TableCell colSpan={3} sx={{ color: '#fff', fontWeight: '600', fontSize: '1.2rem', borderBottom: 'none', py: 3 }}>
                  ₹{tripTotalAmount.toFixed(2)}
                </TableCell>
              </TableRow>
              
              <TableRow>
                <TableCell colSpan={3} align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', pt: 1, pb: 2, color: 'rgba(255,255,255,0.6)' }}>
                  Advance Amount Received:
                </TableCell>
                <TableCell colSpan={3} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', pt: 1, pb: 2, color: '#6ee7b7', fontWeight: 600, fontSize: '15px' }}>
                  - ₹{advanceAmount.toFixed(2)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={3} align="right" sx={{ borderBottom: 'none', pt: 2, pb: 1, color: '#fff', fontWeight: 600, fontSize: '14px' }}>
                  {tripRemainingDifference > 0 
                    ? 'Company Owes You:' 
                    : tripRemainingDifference < 0 
                      ? 'You Owe Company:' 
                      : 'Settled (No Dues):'}
                </TableCell>
                <TableCell colSpan={3} sx={{ borderBottom: 'none', pt: 2, pb: 1, color: tripRemainingDifference >= 0 ? '#10B981' : '#EF4444', fontWeight: 800, fontSize: '18px' }}>
                  ₹{Math.abs(tripRemainingDifference).toFixed(2)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={3} align="right" sx={{ color: 'rgba(255,255,255,0.8)', borderBottom: 'none', py: 3, fontWeight: 600 }}>
                  Admin Approved Total:
                </TableCell>
                <TableCell colSpan={3} sx={{ color: '#10b981', fontWeight: '800', fontSize: '1.4rem', borderBottom: 'none', py: 3 }}>
                  ₹{totalApprovedAmount.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      
      {/* Final Action - Hides if already processed */}
      {!isVoucherProcessed && (
        <Card sx={glassStyle}>
          <Typography variant="h6" fontWeight="600" mb={2}>Final Verification Action</Typography>
          <TextField 
            fullWidth 
            multiline 
            rows={3} 
            value={globalNotes}
            onChange={(e) => setGlobalNotes(e.target.value)}
            placeholder="Add optional notes regarding this decision (These will be attached to the processed expenses)..." 
            sx={{ 
              mb: 3, 
              '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: '12px', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&:hover fieldset': { borderColor: '#3b82f6' } } 
            }} 
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="outlined" 
              color="error" 
              size="large" 
              disabled={isProcessing}
              onClick={() => handleProcessVoucher('Rejected')}
              sx={{ textTransform: 'none', borderRadius: '12px', px: 4 }}
            >
              Reject Entire Voucher
            </Button>
            <Button 
              variant="contained" 
              size="large" 
              disabled={isProcessing}
              onClick={() => handleProcessVoucher('Completed')}
              sx={{ bgcolor: '#3b82f6', textTransform: 'none', borderRadius: '12px', px: 4, boxShadow: '0 4px 14px rgba(59,130,246,0.4)', '&:hover': { bgcolor: '#2563eb' } }}
            >
              {isProcessing ? <CircularProgress size={24} color="inherit" /> : 'Process & Approve Voucher'}
            </Button>
          </Box>
        </Card>
      )}

      {/* Show static info if already processed */}
      {isVoucherProcessed && (
        <Card sx={{ ...glassStyle, textAlign: 'center', borderColor: statusStyles.color }}>
          <Typography variant="h6" color={statusStyles.color} fontWeight="600">
            This voucher was marked as {voucherData.status}.
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.6)" mt={1}>
            No further actions can be taken on this claim.
          </Typography>
        </Card>
      )}

      {/* --- ADD EXPENSE MODAL --- */}
      <Dialog 
        open={expenseModalOpen} 
        onClose={handleExpenseModalClose} 
        maxWidth="sm" 
        fullWidth 
        PaperProps={{ 
          sx: { 
            bgcolor: '#1a1625', 
            backgroundImage: 'linear-gradient(to bottom right, #1a1625, #0f0c29)', 
            borderRadius: '24px', 
            border: '1px solid rgba(255,255,255,0.1)', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 
            zIndex: 9999 
          } 
        }}
      >
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
                        // Fallback label if the user was dynamically inserted
                        const label = emp 
                          ? `${emp.first_name} ${emp.last_name}` 
                          : (value === voucherData?.employee_id ? voucherData?.employee_name : value);
                        return <Chip key={value} label={label} sx={{ bgcolor: 'rgba(59,130,246,0.2)', color: '#fff', borderRadius: '8px' }} size="small" />;
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

            {/* EXPENSE DESCRIPTION INPUT */}
            <TextField
              label="Expense Description"
              name="reason"
              value={expenseFormData.reason}
              onChange={handleExpenseChange}
              placeholder="Enter expense details"
              fullWidth
              sx={inputStyle}
            />

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

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: '12px', width: '100%', border: '1px solid rgba(255,255,255,0.1)' }} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}