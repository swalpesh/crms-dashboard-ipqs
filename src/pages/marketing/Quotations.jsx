import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () =>
  localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

const fmt = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function QuotationTeam() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState([]);
  const [leads, setLeads] = useState([]);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [leadStages, setLeadStages] = useState({});
  const [filter, setFilter] = useState("All"); // 🔴 Filter: All | Move | Moved

  const showToast = (msg, severity = "success") =>
    setToast({ open: true, message: msg, severity });

  /* ----------------------------------------------------------------
     FETCH APPROVED QUOTATIONS
  ------------------------------------------------------------------*/
  const fetchApproved = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/quotations/approved`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) {
        setApproved(data.quotations || []);
        await fetchLeadStages(data.quotations || []);
      } else {
        showToast(data.message || "Failed to fetch approved quotations", "error");
      }
    } catch {
      showToast("Error fetching approved quotations", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------------------------
     FETCH LEAD STAGES FOR ALL QUOTATIONS
  ------------------------------------------------------------------*/
  const fetchLeadStages = async (quotations) => {
    const results = {};
    for (const q of quotations) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/leads/${q.lead_number}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        if (res.ok && data.lead) {
          results[q.quotation_id] = data.lead.lead_stage;
        }
      } catch (err) {
        console.error("Lead fetch failed:", q.lead_number, err);
      }
    }
    setLeadStages(results);
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/quotations/quotation-team`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) setLeads(data.leads || []);
      else showToast(data.message || "Failed to fetch leads", "error");
    } catch {
      showToast("Error fetching leads", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 0) fetchApproved();
    else fetchLeads();
  }, [tab]);

  /* ----------------------------------------------------------------
     MOVE TO PAYMENTS API
  ------------------------------------------------------------------*/
  const handleMoveToPayments = async (quotation) => {
    const { quotation_id, lead_number } = quotation;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/leads/change-stage`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          lead_id: lead_number,
          new_lead_stage: "Payments-Team",
          reason: `Lead ${lead_number} and associated quotation ${quotation_id} has been moved to Payments Team and both lead and quotation have been approved by company and customer.`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`Quotation ${quotation_id} moved to Payments Team`, "success");

        // update local stage
        setLeadStages((prev) => ({ ...prev, [quotation_id]: "Payments-Team" }));
      } else {
        showToast(data.message || "Failed to move to Payments Team", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error moving quotation to Payments Team", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------------------------
     FILTERING + SEARCH
  ------------------------------------------------------------------*/
  const filteredApproved = useMemo(() => {
    let filtered = approved;

    // Apply filter for "Moved" or "Move"
    if (filter === "Moved") {
      filtered = filtered.filter((q) => leadStages[q.quotation_id] === "Payments-Team");
    } else if (filter === "Move") {
      filtered = filtered.filter((q) => leadStages[q.quotation_id] !== "Payments-Team");
    }

    // Search
    const q = query.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((r) =>
        [
          r.quotation_id,
          r.lead_number,
          r.company_name,
          r.contact_person_name,
          r.customer_type,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    return filtered;
  }, [query, approved, filter, leadStages]);

  /* ----------------------------------------------------------------
     RENDER
  ------------------------------------------------------------------*/
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, pb: 6 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={800}>
          Quotation Team
        </Typography>

        <Button
          color="error"
          startIcon={<RefreshOutlinedIcon />}
          onClick={() => (tab === 0 ? fetchApproved() : fetchLeads())}
          sx={{ textTransform: "none" }}
        >
          Refresh
        </Button>
      </Stack>

      <Paper sx={{ p: 0, borderRadius: 3, overflow: "hidden" }}>
        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          TabIndicatorProps={{ style: { backgroundColor: "#ef4444", height: 3 } }}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1rem",
              color: "#555",
            },
            "& .Mui-selected": {
              color: "#ef4444 !important",
            },
          }}
        >
          <Tab label="Approved Quotations" />
          <Tab label="Leads" />
        </Tabs>

        {/* Search + Filter */}
        <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            placeholder={tab === 0 ? "Search approved quotations..." : "Search leads..."}
            size="small"
            fullWidth
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

          {tab === 0 && (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                label="Status Filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="All">All Quotations</MenuItem>
                <MenuItem value="Move">Move to Payments</MenuItem>
                <MenuItem value="Moved">Moved to Payments</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : tab === 0 ? (
          /* -------- Approved Quotations -------- */
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Table
              sx={{
                minWidth: 1300,
                "& thead th": { bgcolor: "#fafafa", fontWeight: 700 },
                "& td, & th": { whiteSpace: "nowrap", verticalAlign: "middle" },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Quotation ID</TableCell>
                  <TableCell>Lead #</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Contact Person</TableCell>
                  <TableCell>Validity (Days)</TableCell>
                  <TableCell>Valid Until</TableCell>
                  <TableCell>Grand Total</TableCell>
                  <TableCell>Customer Type</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredApproved.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                      No quotations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApproved.map((r) => {
                    const isMoved = leadStages[r.quotation_id] === "Payments-Team";
                    return (
                      <TableRow key={r.quotation_id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{r.quotation_id}</TableCell>
                        <TableCell>
                          <Chip
                            label={r.lead_number}
                            variant="outlined"
                            color="error"
                            size="small"
                            sx={{ fontWeight: 600 }}
                            onClick={() =>
                              navigate(`/marketing/lead/${r.lead_number}`)
                            }
                          />
                        </TableCell>
                        <TableCell>{r.company_name || "-"}</TableCell>
                        <TableCell>{r.contact_person_name || "-"}</TableCell>
                        <TableCell>{r.validity_days || "-"}</TableCell>
                        <TableCell>
                          {r.valid_until
                            ? new Date(r.valid_until).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>₹ {r.total_amount || "-"}</TableCell>
                        <TableCell>{r.customer_type || "-"}</TableCell>
                        <TableCell>{fmt(r.created_at)}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="contained"
                            color={isMoved ? "success" : "error"}
                            startIcon={<PaymentsOutlinedIcon />}
                            endIcon={<ArrowForwardIosRoundedIcon sx={{ fontSize: 16 }} />}
                            onClick={() => handleMoveToPayments(r)}
                            sx={{
                              borderRadius: 999,
                              px: 2.2,
                              whiteSpace: "nowrap",
                              opacity: isMoved ? 0.7 : 1,
                              cursor: isMoved ? "not-allowed" : "pointer",
                            }}
                            disabled={isMoved}
                          >
                            {isMoved ? "Moved to Payments" : "Move to Payments"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Box>
        ) : (
          /* -------- Leads Tab -------- */
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Table
              sx={{
                minWidth: 1300,
                "& thead th": { bgcolor: "#fafafa", fontWeight: 700 },
                "& td, & th": { whiteSpace: "nowrap", verticalAlign: "middle" },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Lead ID</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Contact Person</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Created At</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                      No leads found in Quotation-Team.
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((r) => (
                    <TableRow key={r.lead_id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{r.lead_id}</TableCell>
                      <TableCell>{r.company_name}</TableCell>
                      <TableCell>{r.contact_person_name}</TableCell>
                      <TableCell>{r.contact_person_phone}</TableCell>
                      <TableCell>{r.contact_person_email}</TableCell>
                      <TableCell>{r.company_address}</TableCell>
                      <TableCell>{r.company_city}</TableCell>
                      <TableCell>{r.company_state}</TableCell>
                      <TableCell>{r.company_country}</TableCell>
                      <TableCell>{fmt(r.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

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
