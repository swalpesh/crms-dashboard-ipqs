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
  Button,
  Stack,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  Chip
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

/* ---------- THEME CONSTANTS ---------- */
const theme = {
  bgDark: '#0f0c29',
  bgGradient: 'radial-gradient(circle at 10% 20%, rgba(91, 33, 182, 0.4) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(30, 58, 138, 0.4) 0%, transparent 40%)',
  glassBg: 'rgba(255, 255, 255, 0.04)',
  glassBorder: '1px solid rgba(255, 255, 255, 0.1)',
  glassHighlight: 'rgba(255, 255, 255, 0.15)',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8', // slate-400
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
  // Search Section (Dark Glass)
  searchCard: {
    background: theme.glassBg,
    backdropFilter: 'blur(16px)',
    border: theme.glassBorder,
    borderTop: `1px solid ${theme.glassHighlight}`,
    borderRadius: '16px',
    p: 2,
    mb: 3,
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
  },
  // Dark Glass Table Container
  tableCard: {
    background: theme.glassBg,
    backdropFilter: 'blur(16px)',
    border: theme.glassBorder,
    borderRadius: '24px',
    p: 0, 
    overflow: 'hidden',
    boxShadow: '0 8px 32px 0 rgba(0,0,0,0.3)',
  },
  darkInput: {
    '& .MuiOutlinedInput-root': {
      color: '#fff',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '12px',
      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
      '&.Mui-focused fieldset': { borderColor: theme.accentBlue },
    },
    '& .MuiInputLabel-root': { color: theme.textSecondary },
    '& .MuiInputLabel-root.Mui-focused': { color: theme.accentBlue },
  },
  tableHead: {
    '& th': {
      bgcolor: '#16162a', // Solid dark color to prevent overlap issues on sticky scroll
      color: '#94a3b8',
      fontWeight: 700,
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      whiteSpace: 'nowrap',
      py: 2.5, 
    }
  },
  tableRow: {
    transition: 'all 0.2s ease',
    '& td': {
      color: '#f1f5f9',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      whiteSpace: 'nowrap',
      fontSize: '0.85rem',
      py: 2, 
    },
    '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' }
  }
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

export default function SavedQuotations() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingId, setFetchingId] = useState(null); // Track which row is loading
  const navigate = useNavigate();

  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const showToast = (message, severity = "success") =>
    setToast({ open: true, message, severity });

  // --- FETCH ALL QUOTATIONS ---
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

  // --- FETCH SINGLE QUOTATION DATA & NAVIGATE ---
  const handleUpdate = async (quotation_id) => {
    try {
      setFetchingId(quotation_id);
      const res = await fetch(`${API_BASE_URL}/api/v1/quotations/${quotation_id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const result = await res.json();
      
      if (res.ok) {
        // Navigate to quotation builder and pass the fetched full data in state
        navigate("/marketing/quotation-builder", { state: { editQuotation: result.data } });
      } else {
        showToast(result.message || "Failed to fetch quotation details", "error");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      showToast("Network error while fetching quotation details", "error");
    } finally {
      setFetchingId(null);
    }
  };

  // --- FILTER BY SEARCH BAR ONLY ---
  const filteredData = useMemo(() => {
    if (!debouncedQuery) return quotations;
    return quotations.filter((q) => {
      const hay = [
        q.quotation_id, 
        q.lead_number, 
        q.company_name, 
        q.contact_person_name, 
        q.grand_total
      ].filter(Boolean).join(" ").toLowerCase();
      
      return hay.includes(debouncedQuery);
    });
  }, [quotations, debouncedQuery]);

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
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
            '&:hover': { bgcolor: '#2563eb' }
          }}
        >
          Refresh Data
        </Button>
      </Stack>

      {/* SEARCH BAR (Dark Glass Style) */}
      <Paper elevation={0} sx={styles.searchCard}>
        <TextField
          fullWidth
          placeholder="Search by ID, Company, or Contact Name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={styles.darkInput}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon sx={{ color: theme.textSecondary }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* DATA TABLE (Dark Theme) */}
      <Paper elevation={0} sx={styles.tableCard}>
        <TableContainer sx={{ maxHeight: 650, '&::-webkit-scrollbar': { width: '8px', height: '8px' }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.2)', borderRadius: '10px' } }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
              <CircularProgress sx={{ color: theme.accentBlue }} />
            </Box>
          ) : (
            <Table stickyHeader sx={{ minWidth: 1000 }}>
              <TableHead sx={styles.tableHead}>
                <TableRow>
                  <TableCell>Quotation ID</TableCell>
                  <TableCell>Lead #</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Contact Person</TableCell>
                  <TableCell>Grand Total</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8, borderBottom: 'none' }}>
                      <Typography variant="body1" color="textSecondary">
                        No quotations found matching your search.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((q) => {
                    const isFetchingThis = fetchingId === q.quotation_id;
                    
                    return (
                      <TableRow key={q.quotation_id} sx={styles.tableRow}>
                        <TableCell sx={{ fontWeight: 700, color: theme.accentBlue }}>{q.quotation_id}</TableCell>
                        <TableCell>
                          <Chip 
                            label={q.lead_number} 
                            size="small" 
                            onClick={() => navigate(`/marketing/lead/${q.lead_number}`)}
                            sx={{ 
                              bgcolor: 'rgba(255,255,255,0.1)', 
                              color: '#fff', 
                              borderRadius: '6px', 
                              cursor: 'pointer', 
                              fontWeight: 600,
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                            }} 
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{q.company_name || "-"}</TableCell>
                        <TableCell>{q.contact_person_name || "-"}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: theme.statusGreen }}>
                          ₹ {q.grand_total ? parseFloat(q.grand_total).toLocaleString('en-IN') : "-"}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={isFetchingThis ? <CircularProgress size={14} color="inherit" /> : <EditOutlinedIcon />}
                            disabled={isFetchingThis}
                            onClick={() => handleUpdate(q.quotation_id)}
                            sx={{
                              textTransform: 'none',
                              color: theme.accentBlue,
                              borderColor: 'rgba(59, 130, 246, 0.4)',
                              borderRadius: '8px',
                              fontWeight: 600,
                              minWidth: '85px',
                              '&:hover': {
                                bgcolor: 'rgba(59, 130, 246, 0.1)',
                                borderColor: theme.accentBlue
                              },
                              '&.Mui-disabled': {
                                color: 'rgba(59, 130, 246, 0.5)',
                                borderColor: 'rgba(59, 130, 246, 0.2)'
                              }
                            }}
                          >
                            {isFetchingThis ? 'Loading' : 'Update'}
                          </Button>
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
          sx={{ width: "100%", boxShadow: '0 4px 12px rgba(0,0,0,0.5)', borderRadius: '12px' }}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}