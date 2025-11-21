import { useEffect, useMemo, useState } from "react";
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () =>
  localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

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

  // Approve quotation + move lead
  const handleApprove = async (quotation) => {
  const { quotation_id, lead_number } = quotation;
  try {
    setLoading(true);

    // Step 1️⃣ Approve the quotation
    const approveRes = await fetch(`${API_BASE_URL}/api/v1/quotations/${quotation_id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status: "approved" }),
    });

    const approveData = await approveRes.json();

    if (!approveRes.ok) {
      showToast(approveData.message || "Quotation approval failed", "error");
      return;
    }

    showToast(`Quotation ${quotation_id} approved successfully`, "success");

    // Step 2️⃣ Update lead stage only after approval succeeds
    const leadRes = await fetch(`${API_BASE_URL}/api/leads/change-stage`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        lead_id: lead_number,
        new_lead_stage: "Quotation-Team",
        reason: `Quotation for ${lead_number} has been approved and moved to Quotation Department`,
      }),
    });

    const leadData = await leadRes.json();
    if (leadRes.ok) {
      showToast(`Lead ${lead_number} moved to Quotation Department`, "info");
    } else {
      showToast(leadData.message || "Lead stage update failed", "error");
    }

    // Refresh list after both are done
    fetchQuotations();
  } catch (err) {
    console.error(err);
    showToast("Error approving quotation or updating lead stage", "error");
  } finally {
    setLoading(false);
  }
};


  // Reject quotation
  const handleReject = (quotation) => {
    setSelectedQuotation(quotation);
    setRejectDialog(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) return showToast("Enter a reason for rejection", "error");
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/api/v1/quotations/${selectedQuotation.quotation_id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            status: "rejected",
            reason: rejectReason,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        showToast(`Quotation ${selectedQuotation.quotation_id} rejected`, "warning");
        setRejectDialog(false);
        setRejectReason("");
        setSelectedQuotation(null);
        fetchQuotations();
      } else showToast(data.message || "Rejection failed", "error");
    } catch (err) {
      showToast("Error rejecting quotation", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete quotation
  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete quotation ${id}?`)) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/quotations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Quotation ${id} deleted`, "info");
        fetchQuotations();
      } else showToast(data.message || "Delete failed", "error");
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

  // Filter + Search
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
      const hay = [
        q.quotation_id,
        q.lead_number,
        q.company_name,
        q.contact_person_name,
        q.customer_type,
        q.status,
        q.grand_total,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(debouncedQuery);
    });
  }, [quotations, filters, debouncedQuery]);

  // UI
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#f8f8f8", minHeight: "100vh" }}>
      <Paper elevation={0} sx={{ borderRadius: 4, p: 3, bgcolor: "#fff" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" fontWeight={600}>
              Saved Quotations
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                bgcolor: "#f0f0f0",
                px: 1.2,
                py: 0.2,
                borderRadius: 1,
              }}
            >
              {filteredData.length} total
            </Typography>
          </Stack>
          <Button
            onClick={fetchQuotations}
            color="error"
            variant="text"
            startIcon={<RefreshOutlinedIcon />}
            sx={{ textTransform: "none" }}
          >
            Refresh
          </Button>
        </Stack>

        {/* Filters */}
        <Stack spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search in quotations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon />
                </InputAdornment>
              ),
            }}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="From Date"
              type="date"
              size="small"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="To Date"
              type="date"
              size="small"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label="Customer Type"
              size="small"
              value={filters.customerType}
              onChange={(e) => setFilters({ ...filters, customerType: e.target.value })}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="LT Customer">LT Customer</MenuItem>
              <MenuItem value="HT Customer">HT Customer</MenuItem>
            </TextField>
            <TextField
              label="Period"
              size="small"
              type="number"
              value={filters.period}
              onChange={(e) => setFilters({ ...filters, period: e.target.value })}
              placeholder="e.g. 6"
              sx={{ minWidth: 120 }}
            />
            <TextField
              select
              label="Status"
              size="small"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
            <Button
              variant="outlined"
              color="error"
              startIcon={<ClearOutlinedIcon />}
              onClick={handleClearFilters}
              sx={{ textTransform: "none" }}
            >
              Clear
            </Button>
          </Stack>
        </Stack>

        {/* Table */}
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflowX: "auto" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table sx={{ minWidth: 1300, "& td, & th": { whiteSpace: "nowrap", fontSize: 14 } }}>
              <TableHead sx={{ bgcolor: "#fafafa" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Quotation ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Lead #</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Contact Person</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Validity (Days)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Valid Until</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Grand Total</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Customer Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Period</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ py: 5 }}>
                      No quotations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((q) => {
                    const isDisabled = q.status === "approved" || q.status === "rejected";
                    return (
                      <TableRow key={q.quotation_id}>
                        <TableCell>{q.quotation_id}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            endIcon={<ChevronRightOutlinedIcon fontSize="small" />}
                            sx={{
                              borderColor: "#ef4444",
                              color: "#ef4444",
                              fontWeight: 600,
                              textTransform: "none",
                            }}
                            onClick={() => navigate(`/marketing/lead/${q.lead_number}`)}
                          >
                            {q.lead_number}
                          </Button>
                        </TableCell>
                        <TableCell>{q.company_name || "-"}</TableCell>
                        <TableCell>{q.contact_person_name || "-"}</TableCell>
                        <TableCell>{q.validity_days || "-"}</TableCell>
                        <TableCell>
                          {q.valid_until ? new Date(q.valid_until).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>₹ {q.grand_total || "-"}</TableCell>
                        <TableCell>{q.customer_type || "-"}</TableCell>
                        <TableCell>
                          <Chip
                            label={q.status || "Pending"}
                            size="small"
                            sx={{
                              color:
                                q.status === "approved"
                                  ? "green"
                                  : q.status === "rejected"
                                  ? "red"
                                  : "#eab308",
                              fontWeight: 600,
                              textTransform: "capitalize",
                              bgcolor:
                                q.status === "approved"
                                  ? "#ecfdf5"
                                  : q.status === "rejected"
                                  ? "#fef2f2"
                                  : "#fefce8",
                            }}
                          />
                        </TableCell>
                        <TableCell>{q.period || "-"}</TableCell>
                        <TableCell>
                          {q.created_at ? new Date(q.created_at).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <IconButton
                              color="success"
                              size="small"
                              disabled={isDisabled}
                              onClick={() => handleApprove(q)}
                            >
                              <CheckCircleOutlineIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              disabled={isDisabled}
                              onClick={() => handleReject(q)}
                            >
                              <CancelOutlinedIcon />
                            </IconButton>
                            <IconButton
                              color="default"
                              size="small"
                              onClick={() => handleDelete(q.quotation_id)}
                            >
                              <DeleteOutlineIcon />
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
          <Typography variant="body2" sx={{ mb: 1 }}>
            Provide a reason for rejecting quotation{" "}
            <strong>{selectedQuotation?.quotation_id}</strong>:
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
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast({ ...toast, open: false })}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
