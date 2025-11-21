import {
  Box, Paper, Stack, Typography, Button, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, MenuItem, Autocomplete, Tabs, Tab,
  CircularProgress, Snackbar, Alert,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () =>
  localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

const money = (n, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(n || 0);

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowHHMM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export default function Payments() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const [paymentLeads, setPaymentLeads] = useState([]);
  const [paymentsData, setPaymentsData] = useState([]);
  const [closedQuotes, setClosedQuotes] = useState([]);

  // Filters for tab 1
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Filters for tab 2
  const [searchPay, setSearchPay] = useState("");
  const [fromPay, setFromPay] = useState("");
  const [toPay, setToPay] = useState("");
  const [quoteFilter, setQuoteFilter] = useState("All");
  const [invoiceFilter, setInvoiceFilter] = useState("All");

  // Add Payment dialog
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [payType, setPayType] = useState("Full");
  const [partialAmount, setPartialAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [payDate, setPayDate] = useState(todayISO());
  const [payTime, setPayTime] = useState(nowHHMM());

  const showToast = (msg, severity = "success") =>
    setToast({ open: true, message: msg, severity });

  /* ------------------- API CALLS ------------------- */
  const fetchPaymentsTeamLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/quotations/payments-team/leads`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) setPaymentLeads(data.leads || []);
      else showToast(data.message || "Failed to fetch leads", "error");
    } catch {
      showToast("Error fetching leads", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentsDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/payments/details`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) setPaymentsData(data.payments || []);
      else showToast(data.message || "Failed to fetch payments", "error");
    } catch {
      showToast("Error fetching payments", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async (paymentId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/payments/${paymentId}/generate-invoice`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Invoice generated for ${paymentId}`, "success");
        fetchPaymentsDetails();
      } else showToast(data.message || "Failed to generate invoice", "error");
    } catch {
      showToast("Server error while generating invoice", "error");
    }
  };

  const handleAddPayment = async () => {
    if (!selectedQuote) return showToast("Please select a quotation.", "error");
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      };
      const payload =
        payType === "Partial"
          ? {
              quotation_id: selectedQuote.quotation_id,
              payment_type: "Partial",
              payment_date: payDate,
              payment_time: payTime,
              amount: Number(partialAmount),
              remarks,
            }
          : {
              quotation_no: selectedQuote.quotation_id,
              payment_type: "Full Payment",
              payment_date: payDate,
              payment_time: payTime,
              remarks,
            };

      const res = await fetch(`${API_BASE_URL}/api/v1/payments`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Payment added successfully", "success");
        setOpenAdd(false);
        fetchPaymentsDetails();
      } else showToast(data.message || "Failed to add payment", "error");
    } catch {
      showToast("Server error while adding payment", "error");
    }
  };

  const handleCloseQuote = async (leadId, quotationId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/leads/change-stage`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          lead_id: leadId,
          new_lead_stage: "Closed",
          reason: "All Payments Received by default",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Lead ${leadId} marked as Closed`, "success");
        setClosedQuotes((prev) => [...prev, quotationId]);
        fetchPaymentsTeamLeads();
      } else showToast(data.message || "Failed to close lead", "error");
    } catch {
      showToast("Server error while closing lead", "error");
    }
  };

  useEffect(() => {
    if (tab === 0) fetchPaymentsTeamLeads();
    if (tab === 1) fetchPaymentsDetails();
  }, [tab]);

  /* ------------------- FILTERING ------------------- */
  const filteredLeads = useMemo(() => {
    return paymentLeads.filter((lead) => {
      const approved = lead.approved_quotations || [];
      return approved.some((q) => {
        const matchSearch =
          !search ||
          lead.company_name.toLowerCase().includes(search.toLowerCase()) ||
          lead.lead_id.toLowerCase().includes(search.toLowerCase()) ||
          q.quotation_id.toLowerCase().includes(search.toLowerCase());
        const createdAt = new Date(lead.created_at);
        const matchDate =
          (!fromDate || createdAt >= new Date(fromDate)) &&
          (!toDate || createdAt <= new Date(toDate));
        const isClosed = closedQuotes.includes(q.quotation_id);
        const matchStatus =
          statusFilter === "All" ||
          (statusFilter === "Closed" && isClosed) ||
          (statusFilter === "Open" && !isClosed);
        return matchSearch && matchDate && matchStatus;
      });
    });
  }, [paymentLeads, search, fromDate, toDate, statusFilter, closedQuotes]);

  const filteredPayments = useMemo(() => {
    return paymentsData.filter((p) => {
      const matchSearch =
        !searchPay ||
        p.payment_id.toLowerCase().includes(searchPay.toLowerCase()) ||
        (p.quotation_id || "").toLowerCase().includes(searchPay.toLowerCase()) ||
        (p.remarks || "").toLowerCase().includes(searchPay.toLowerCase());
      const date = new Date(p.payment_date);
      const matchDate =
        (!fromPay || date >= new Date(fromPay)) && (!toPay || date <= new Date(toPay));
      const matchQuote = quoteFilter === "All" || p.quotation_id === quoteFilter;
      const matchInvoice =
        invoiceFilter === "All" ||
        (invoiceFilter === "Generated" && p.invoice_status !== "not_generated") ||
        (invoiceFilter === "Not Generated" && p.invoice_status === "not_generated");
      return matchSearch && matchDate && matchQuote && matchInvoice;
    });
  }, [paymentsData, searchPay, fromPay, toPay, quoteFilter, invoiceFilter]);

  const uniqueQuotationIds = [...new Set(paymentsData.map((p) => p.quotation_id))];

  /* ------------------- UI ------------------- */
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, pb: 6 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={800}>Payments</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => (tab === 0 ? fetchPaymentsTeamLeads() : fetchPaymentsDetails())}>
            Refresh
          </Button>
          <Button variant="outlined" startIcon={<AddOutlinedIcon />} onClick={() => setOpenAdd(true)}>
            Add Payment
          </Button>
        </Stack>
      </Stack>

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          TabIndicatorProps={{ style: { backgroundColor: "#ef4444", height: 3 } }}
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
            "& .Mui-selected": { color: "#ef4444 !important" },
          }}
        >
          <Tab label="Quotation Received for Payments" />
          <Tab label="Payments" />
        </Tabs>

        {/* ---------- TAB 1 ---------- */}
        {tab === 0 && (
          <Box sx={{ width: "100%", overflowX: "auto", p: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
              <TextField
                placeholder="Search by Lead ID, Company or Quotation ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchOutlinedIcon /></InputAdornment>,
                }}
              />
              <TextField label="From" type="date" InputLabelProps={{ shrink: true }} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <TextField label="To" type="date" InputLabelProps={{ shrink: true }} value={toDate} onChange={(e) => setToDate(e.target.value)} />
              <TextField select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </TextField>
            </Stack>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>
            ) : (
              <Table sx={{ minWidth: 1200, "& thead th": { bgcolor: "#fafafa", fontWeight: 700 } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Quotation ID</TableCell>
                    <TableCell>Lead ID</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Contact Person</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Grand Total</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLeads.length === 0 ? (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5 }}>No quotations found.</TableCell></TableRow>
                  ) : (
                    filteredLeads.flatMap((lead) =>
                      (lead.approved_quotations || []).map((q) => (
                        <TableRow key={q.quotation_id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{q.quotation_id}</TableCell>
                          <TableCell>
                            <Button variant="text" color="primary" size="small"
                              sx={{ textTransform: "none", fontWeight: 700, "&:hover": { textDecoration: "underline" } }}
                              onClick={() => navigate(`/marketing/lead/${lead.lead_id}`)}
                            >
                              {lead.lead_id}
                            </Button>
                          </TableCell>
                          <TableCell>{lead.company_name}</TableCell>
                          <TableCell>{lead.contact_person_name}</TableCell>
                          <TableCell>{lead.contact_person_phone}</TableCell>
                          <TableCell>₹ {q.grand_total}</TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="contained"
                              color={closedQuotes.includes(q.quotation_id) ? "success" : "error"}
                              startIcon={<CloseOutlinedIcon />}
                              onClick={() => handleCloseQuote(lead.lead_id, q.quotation_id)}
                              disabled={closedQuotes.includes(q.quotation_id)}
                              sx={{ borderRadius: 999, px: 2.5 }}
                            >
                              {closedQuotes.includes(q.quotation_id) ? "Closed" : "Close"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )
                  )}
                </TableBody>
              </Table>
            )}
          </Box>
        )}

        {/* ---------- TAB 2 ---------- */}
        {tab === 1 && (
          <Box sx={{ width: "100%", overflowX: "auto", p: 2 }}>
            {/* Filters */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
              <TextField
                placeholder="Search by Payment ID, Quotation or Remarks"
                value={searchPay}
                onChange={(e) => setSearchPay(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchOutlinedIcon /></InputAdornment>,
                }}
              />
              <TextField label="From" type="date" InputLabelProps={{ shrink: true }} value={fromPay} onChange={(e) => setFromPay(e.target.value)} />
              <TextField label="To" type="date" InputLabelProps={{ shrink: true }} value={toPay} onChange={(e) => setToPay(e.target.value)} />
              <TextField select label="Quotation" value={quoteFilter} onChange={(e) => setQuoteFilter(e.target.value)} sx={{ minWidth: 160 }}>
                <MenuItem value="All">All</MenuItem>
                {uniqueQuotationIds.map((id) => (
                  <MenuItem key={id} value={id}>{id}</MenuItem>
                ))}
              </TextField>
              <TextField select label="Invoice Status" value={invoiceFilter} onChange={(e) => setInvoiceFilter(e.target.value)} sx={{ minWidth: 180 }}>
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Generated">Generated</MenuItem>
                <MenuItem value="Not Generated">Not Generated</MenuItem>
              </TextField>
            </Stack>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>
            ) : (
              <Table sx={{ minWidth: 1280, "& thead th": { bgcolor: "#fafafa", fontWeight: 700 }, "& td, & th": { whiteSpace: "nowrap" } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Payment ID</TableCell>
                    <TableCell>Quotation ID</TableCell>
                    <TableCell>Payment Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Grand Total</TableCell>
                    <TableCell>Remaining Balance</TableCell>
                    <TableCell>Payment Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Remarks</TableCell>
                    <TableCell>Invoice Status</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow><TableCell colSpan={11} align="center" sx={{ py: 5 }}>No payments found.</TableCell></TableRow>
                  ) : (
                    filteredPayments.map((p) => (
                      <TableRow key={p.payment_id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{p.payment_id}</TableCell>
                        <TableCell>{p.quotation_id}</TableCell>
                        <TableCell>{p.payment_type}</TableCell>
                        <TableCell>{money(p.amount)}</TableCell>
                        <TableCell>{money(p.grand_total)}</TableCell>
                        <TableCell>{money(p.remaining_balance)}</TableCell>
                        <TableCell>{new Date(p.payment_date).toLocaleDateString()}</TableCell>
                        <TableCell>{p.payment_time}</TableCell>
                        <TableCell>{p.remarks}</TableCell>
                        <TableCell>
                          {p.invoice_status === "not_generated" ? (
                            <Chip
                              color="default"
                              variant="outlined"
                              size="small"
                              label="Not Generated"
                              icon={<PendingOutlinedIcon />}
                            />
                          ) : (
                            <Chip
                              color="success"
                              size="small"
                              label="Generated"
                              icon={<CheckCircleOutlineIcon />}
                            />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleGenerateInvoice(p.payment_id)}
                            disabled={p.invoice_status !== "not_generated"}
                            sx={{
                              borderRadius: "50px",
                              px: 2.5,
                              backgroundColor:
                                p.invoice_status === "not_generated"
                                  ? "#ef4444"
                                  : "#d1d5db",
                              color:
                                p.invoice_status === "not_generated"
                                  ? "#fff"
                                  : "#6b7280",
                              fontWeight: 600,
                              "&:hover": {
                                backgroundColor:
                                  p.invoice_status === "not_generated"
                                    ? "#dc2626"
                                    : "#d1d5db",
                              },
                            }}
                          >
                            <ReceiptLongOutlinedIcon sx={{ mr: 1, fontSize: 18 }} />
                            Generate Invoice
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </Box>
        )}
      </Paper>

      {/* ---------------- ADD PAYMENT DIALOG ---------------- */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Payment</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Autocomplete
              options={paymentLeads.flatMap((l) => l.approved_quotations || [])}
              value={selectedQuote}
              onChange={(_, v) => setSelectedQuote(v)}
              getOptionLabel={(o) => (o ? `${o.quotation_id} — ${o.company_name}` : "")}
              renderInput={(params) => <TextField {...params} label="Select Quotation" />}
            />
            <TextField select label="Payment Type" value={payType} onChange={(e) => setPayType(e.target.value)}>
              <MenuItem value="Full">Full Payment</MenuItem>
              <MenuItem value="Partial">Partial Payment</MenuItem>
            </TextField>
            {payType === "Partial" && (
              <TextField
                label="Partial Amount"
                type="number"
                value={partialAmount}
                onChange={(e) => setPartialAmount(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
            )}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="Payment Date" type="date" InputLabelProps={{ shrink: true }} value={payDate} onChange={(e) => setPayDate(e.target.value)} fullWidth />
              <TextField label="Payment Time" type="time" InputLabelProps={{ shrink: true }} value={payTime} onChange={(e) => setPayTime(e.target.value)} fullWidth />
            </Stack>
            <TextField label="Remarks" multiline minRows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddPayment}>Save Payment</Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
