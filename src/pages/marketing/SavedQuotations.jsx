import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  CircularProgress,
  IconButton,
  Button,
  Stack,
  TextField,
  MenuItem,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Chip,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";

/* ---------- THEME CONSTANTS ---------- */
const theme = {
  bgDark: '#0f0c29',
  bgGradient: 'radial-gradient(circle at 10% 20%, rgba(91, 33, 182, 0.4) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(30, 58, 138, 0.4) 0%, transparent 40%)',
  glassBg: 'rgba(255, 255, 255, 0.05)',
  glassBorder: '1px solid rgba(255, 255, 255, 0.1)',
  glassHighlight: 'rgba(255, 255, 255, 0.2)',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  accentBlue: '#3b82f6',
  statusGreen: '#10b981',
  statusRed: '#ef4444',
  statusYellow: '#f59e0b',
};

const styles = {
  container: {
    minHeight: '100vh',
    bgcolor: theme.bgDark,
    background: `${theme.bgDark} ${theme.bgGradient}`,
    color: theme.textPrimary,
    fontFamily: "'Inter', sans-serif",
    p: { xs: 2, md: 4 },
    width: '100%',
    overflowX: 'hidden',
  },
  // Filter Section (Dark Glass)
  filterCard: {
    background: theme.glassBg,
    backdropFilter: 'blur(16px)',
    border: theme.glassBorder,
    borderTop: `1px solid ${theme.glassHighlight}`,
    borderRadius: '24px',
    p: 3,
    mb: 3,
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
  },
  // Table Section (White Card for Black Text)
  tableCard: {
    bgcolor: '#ffffff',
    borderRadius: '24px',
    p: 0, 
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  // Dark Inputs for Filter Section
  darkInput: {
    '& .MuiOutlinedInput-root': {
      color: '#fff',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
      '&.Mui-focused fieldset': { borderColor: theme.accentBlue },
    },
    '& .MuiInputLabel-root': { color: theme.textSecondary },
    '& .MuiInputLabel-root.Mui-focused': { color: theme.accentBlue },
    '& .MuiSelect-icon': { color: theme.textSecondary },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': { color: theme.textSecondary },
    '& input::-webkit-calendar-picker-indicator': { filter: 'invert(1)', cursor: 'pointer' }
  },
  // Table Styles (Black Text)
  tableHead: {
    bgcolor: '#f8fafc', // Light gray header
    '& th': {
      color: '#111827', // Black text
      fontWeight: 700,
      fontSize: '0.85rem',
      textTransform: 'uppercase',
      borderBottom: '2px solid #e5e7eb',
      whiteSpace: 'nowrap',
      py: 2, // Spacious
    }
  },
  tableRow: {
    '& td': {
      color: '#374151', // Dark grey/black text
      borderBottom: '1px solid #f3f4f6',
      whiteSpace: 'nowrap',
      fontSize: '0.9rem',
      py: 2.5, // Spacious rows
    },
    '&:hover': { bgcolor: '#f9fafb' } // Hover effect
  }
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

export default function SavedQuotations() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    customerType: "",
    period: "",
    status: "",
  });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const showToast = (message, severity = "success") =>
    setToast({ open: true, message, severity });

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/quotations/my`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) setQuotations(data.quotations || []);
      else showToast(data.message || "Failed to fetch quotations", "error");
    } catch (err) {
      console.error("Fetch error:", err);
      showToast("Network error while fetching quotations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleApprove = async (quotation) => {
    const { quotation_id, lead_number } = quotation;
    try {
      setLoading(true);
      const approveRes = await fetch(`${API_BASE_URL}/api/v1/quotations/${quotation_id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ status: "approved" }),
      });
      if (!approveRes.ok) {
        const approveData = await approveRes.json();
        showToast(approveData.message || "Quotation approval failed", "error");
        return;
      }
      showToast(`Quotation ${quotation_id} approved successfully`, "success");

      const leadRes = await fetch(`${API_BASE_URL}/api/leads/change-stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          lead_id: lead_number,
          new_lead_stage: "Quotation-Team",
          reason: `Quotation for ${lead_number} has been approved and moved to Quotation Department`,
        }),
      });
      if (leadRes.ok) {
        showToast(`Lead ${lead_number} moved to Quotation Department`, "info");
      }
      fetchQuotations();
    } catch (err) {
      console.error(err);
      showToast("Error approving quotation or updating lead stage", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = (quotation) => {
    setSelectedQuotation(quotation);
    setRejectDialog(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) return showToast("Enter a reason for rejection", "error");
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/quotations/${selectedQuotation.quotation_id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ status: "rejected", reason: rejectReason }),
      });
      if (res.ok) {
        showToast(`Quotation ${selectedQuotation.quotation_id} rejected`, "warning");
        setRejectDialog(false);
        setRejectReason("");
        setSelectedQuotation(null);
        fetchQuotations();
      } else {
        const data = await res.json();
        showToast(data.message || "Rejection failed", "error");
      }
    } catch (err) {
      showToast("Error rejecting quotation", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete quotation ${id}?`)) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/quotations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        showToast(`Quotation ${id} deleted`, "info");
        fetchQuotations();
      } else {
        const data = await res.json();
        showToast(data.message || "Delete failed", "error");
      }
    } catch (err) {
      showToast("Error deleting quotation", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({ from: "", to: "", customerType: "", period: "", status: "" });
    setQuery("");
  };

  const filteredData = useMemo(() => {
    const byFilters = quotations.filter((q) => {
      const createdAt = q.created_at ? new Date(q.created_at) : null;
      const fromOk = filters.from ? (createdAt ? createdAt >= new Date(filters.from) : false) : true;
      const toOk = filters.to ? (createdAt ? createdAt <= new Date(filters.to) : false) : true;
      const typeOk = filters.customerType ? q.customer_type === filters.customerType : true;
      const periodOk = filters.period ? String(q.period ?? "") === String(filters.period) : true;
      const statusOk = filters.status ? q.status === filters.status.toLowerCase() : true;
      return fromOk && toOk && typeOk && periodOk && statusOk;
    });

    if (!debouncedQuery) return byFilters;
    return byFilters.filter((q) => {
      const hay = [q.quotation_id, q.lead_number, q.company_name, q.contact_person_name, q.customer_type, q.status, q.grand_total].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(debouncedQuery);
    });
  }, [quotations, filters, debouncedQuery]);

  return (
    <Box sx={styles.container}>
      
      {/* HEADER SECTION */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', letterSpacing: -1, mb: 0.5 }}>
            Saved Quotations
          </Typography>
          <Typography variant="body2" sx={{ color: theme.textSecondary }}>
            Manage and track all your quotation history
          </Typography>
        </Box>
        <Button
          onClick={fetchQuotations}
          variant="contained"
          startIcon={<RefreshOutlinedIcon />}
          sx={{ 
            bgcolor: theme.accentBlue, 
            textTransform: "none", 
            borderRadius: '12px',
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
          }}
        >
          Refresh Data
        </Button>
      </Stack>

      {/* FILTER BAR (Dark Glass Style) */}
      <Paper elevation={0} sx={styles.filterCard}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            placeholder="Search by ID, Company, or Contact Name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={styles.darkInput}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="From Date"
                type="date"
                fullWidth
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={styles.darkInput}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="To Date"
                type="date"
                fullWidth
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={styles.darkInput}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                label="Type"
                fullWidth
                value={filters.customerType}
                onChange={(e) => setFilters({ ...filters, customerType: e.target.value })}
                sx={styles.darkInput}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="LT Customer">LT Customer</MenuItem>
                <MenuItem value="HT Customer">HT Customer</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Period"
                type="number"
                fullWidth
                value={filters.period}
                onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                placeholder="e.g. 6"
                sx={styles.darkInput}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                label="Status"
                fullWidth
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                sx={styles.darkInput}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ClearOutlinedIcon />}
                onClick={handleClearFilters}
                sx={{ 
                  height: '54px',
                  textTransform: "none", 
                  color: theme.statusRed, 
                  borderColor: 'rgba(239, 68, 68, 0.5)',
                  borderRadius: '12px',
                  '&:hover': { borderColor: theme.statusRed, bgcolor: 'rgba(239, 68, 68, 0.1)' }
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Stack>
      </Paper>

      {/* DATA TABLE (White Style for Black Text) */}
      <Paper elevation={0} sx={styles.tableCard}>
        <TableContainer sx={{ maxHeight: 650 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
              <CircularProgress sx={{ color: theme.accentBlue }} />
            </Box>
          ) : (
            <Table stickyHeader sx={{ minWidth: 1200 }}>
              <TableHead sx={styles.tableHead}>
                <TableRow>
                  <TableCell>Quotation ID</TableCell>
                  <TableCell>Lead #</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Contact Person</TableCell>
                  <TableCell>Validity</TableCell>
                  <TableCell>Valid Until</TableCell>
                  <TableCell>Grand Total</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="textSecondary">
                        No quotations found matching your criteria.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((q) => {
                    const isDisabled = q.status === "approved" || q.status === "rejected";
                    return (
                      <TableRow key={q.quotation_id} sx={styles.tableRow}>
                        <TableCell sx={{ fontWeight: 700, color: theme.accentBlue }}>{q.quotation_id}</TableCell>
                        <TableCell>
                          <Chip 
                            label={q.lead_number} 
                            size="small" 
                            variant="outlined" 
                            onClick={() => navigate(`/marketing/lead/${q.lead_number}`)}
                            sx={{ borderRadius: '6px', cursor: 'pointer', borderColor: '#e5e7eb', fontWeight: 600 }} 
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{q.company_name || "-"}</TableCell>
                        <TableCell>{q.contact_person_name || "-"}</TableCell>
                        <TableCell>{q.validity_days ? `${q.validity_days} days` : "-"}</TableCell>
                        <TableCell>
                          {q.valid_until ? new Date(q.valid_until).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>₹ {q.grand_total || "-"}</TableCell>
                        <TableCell>{q.customer_type || "-"}</TableCell>
                        <TableCell>
                          <Chip
                            label={q.status || "Pending"}
                            size="small"
                            sx={{
                              color: q.status === "approved" ? '#065f46' : q.status === "rejected" ? '#991b1b' : '#92400e',
                              bgcolor: q.status === "approved" ? '#d1fae5' : q.status === "rejected" ? '#fee2e2' : '#fef3c7',
                              fontWeight: 700,
                              textTransform: "capitalize",
                              borderRadius: '6px',
                              height: '24px',
                            }}
                          />
                        </TableCell>
                        <TableCell>{q.period || "-"}</TableCell>
                        <TableCell sx={{ color: '#6b7280', fontSize: '0.85rem' }}>
                          {q.created_at ? new Date(q.created_at).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <IconButton
                              sx={{ color: theme.statusGreen, bgcolor: '#f0fdf4' }}
                              size="small"
                              disabled={isDisabled}
                              onClick={() => handleApprove(q)}
                            >
                              <CheckCircleOutlineIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              sx={{ color: theme.statusRed, bgcolor: '#fef2f2' }}
                              size="small"
                              disabled={isDisabled}
                              onClick={() => handleReject(q)}
                            >
                              <CancelOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              sx={{ color: '#6b7280', bgcolor: '#f3f4f6' }}
                              size="small"
                              onClick={() => handleDelete(q.quotation_id)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reject Quotation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Provide a reason for rejecting quotation <strong>{selectedQuotation?.quotation_id}</strong>:
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            size="small"
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmReject}>
            Confirm Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast({ ...toast, open: false })}
          sx={{ width: "100%", boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}