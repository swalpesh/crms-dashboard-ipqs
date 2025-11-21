// src/pages/marketing/FieldFollowUps.jsx
import { useMemo, useState, useEffect } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";

// ---------------- Constants & Helpers ----------------
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

const DEPARTMENTS = [
  "Tele Marketing",
  "Field Marketing",
  "Technical Team",
  "Solutions Team",
];

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "-";

const mapLead = (api) => ({
  id: api.lead_id,
  leadNo: api.lead_id,
  company: api.company_name,
  industry: api.industry_type,
  contact: api.contact_person_name,
  phone: api.contact_person_phone,
  email: api.contact_person_email || api.company_email || "",
  leadType: api.lead_requirement,
  location: [api.company_city, api.company_state, api.company_country].filter(Boolean).join(", "),
  follow: {
    note: api.follow_up_reason || "",
    date: api.follow_up_date || "",
    time: api.follow_up_time || "",
  },
  _raw: api,
});

// ---------------- Component ----------------
export default function FieldFollowUps() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & filters
  const [search, setSearch] = useState("");
  const [personFilter, setPersonFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [leadTypeFilter, setLeadTypeFilter] = useState("");

  // Assign dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignLead, setAssignLead] = useState(null);
  const [assignDept, setAssignDept] = useState("");
  const [assignReason, setAssignReason] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  // Back dialog
  const [backOpen, setBackOpen] = useState(false);
  const [backLead, setBackLead] = useState(null);
  const [backReason, setBackReason] = useState("");
  const [backLoading, setBackLoading] = useState(false);

  // Reschedule dialog
  const [reschedOpen, setReschedOpen] = useState(false);
  const [reschedLead, setReschedLead] = useState(null);
  const [reschedNote, setReschedNote] = useState("");
  const [reschedDate, setReschedDate] = useState("");
  const [reschedTime, setReschedTime] = useState("");
  const [reschedLoading, setReschedLoading] = useState(false);

  // ---------------- API CALLS ----------------

  // Fetch all today's follow-ups
  async function fetchFollowUps() {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/fleads/my-leads/today-followups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to fetch follow-ups");

      const arr = Array.isArray(json?.leads) ? json.leads.map(mapLead) : [];
      setFollowUps(arr);
    } catch (err) {
      console.error("Error fetching follow-ups:", err);
      setFollowUps([]);
    } finally {
      setLoading(false);
    }
  }

  // PATCH - Update follow-up (reschedule)
  async function patchStatus(leadId, payload) {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/fleads/${leadId}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || "Failed to update status");
    return json;
  }

  // PATCH - Revert lead (move back to New)
  async function revertLead(leadId, reason) {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/fleads/${leadId}/revert`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || "Failed to revert lead");
    return json;
  }

  // PATCH - Assign to another department
  async function assignToDepartment(leadId, department, reason) {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/fleads/change-stage`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lead_id: leadId,
        new_lead_stage: department.replace(/\s+/g, "-"),
        reason: reason.trim(),
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || "Failed to assign to another department");
    return json;
  }

  useEffect(() => {
    fetchFollowUps();
  }, []);

  // ---------------- FILTERS ----------------
  const allContacts = Array.from(new Set(followUps.map((l) => l.contact))).filter(Boolean);
  const allLeadTypes = Array.from(new Set(followUps.map((l) => l.leadType))).filter(Boolean);
  const allCompanies = Array.from(new Set(followUps.map((l) => l.company))).filter(Boolean);
  const allLocations = Array.from(new Set(followUps.map((l) => l.location))).filter(Boolean);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return followUps.filter((l) => {
      const matchesSearch =
        !q ||
        [
          l.leadNo,
          l.company,
          l.industry,
          l.contact,
          l.phone,
          l.email,
          l.leadType,
          l.location,
          l?.follow?.date,
          l?.follow?.time,
          l?.follow?.note,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));

      const matchesPerson = !personFilter || l.contact === personFilter;
      const matchesCompany = !companyFilter || l.company === companyFilter;
      const matchesLocation = !locationFilter || l.location === locationFilter;
      const matchesLeadType = !leadTypeFilter || l.leadType === leadTypeFilter;

      return matchesSearch && matchesPerson && matchesCompany && matchesLocation && matchesLeadType;
    });
  }, [followUps, search, personFilter, companyFilter, locationFilter, leadTypeFilter]);

  const clearFilters = () => {
    setPersonFilter("");
    setCompanyFilter("");
    setLocationFilter("");
    setLeadTypeFilter("");
  };

  // ---------------- HANDLERS ----------------

  // Assign handlers
  const openAssign = (lead) => {
    setAssignLead(lead);
    setAssignDept("");
    setAssignReason("");
    setAssignOpen(true);
  };

  const saveAssign = async () => {
    if (!assignLead || !assignDept || !assignReason.trim()) return;
    setAssignLoading(true);
    try {
      await assignToDepartment(assignLead.id, assignDept, assignReason);
      setAssignOpen(false);
      await fetchFollowUps();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setAssignLoading(false);
    }
  };

  // Back handlers
  const openBack = (lead) => {
    setBackLead(lead);
    setBackReason("");
    setBackOpen(true);
  };

  const saveBack = async () => {
    if (!backLead || !backReason.trim()) return;
    setBackLoading(true);
    try {
      await revertLead(backLead.id, backReason);
      setBackOpen(false);
      await fetchFollowUps();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setBackLoading(false);
    }
  };

  // Reschedule handlers
  const openReschedule = (lead) => {
    setReschedLead(lead);
    setReschedNote(lead?.follow?.note || "");
    setReschedDate(lead?.follow?.date || "");
    setReschedTime(lead?.follow?.time || "");
    setReschedOpen(true);
  };

  const saveReschedule = async () => {
    if (!reschedLead || !reschedNote.trim() || !reschedDate || !reschedTime) return;
    setReschedLoading(true);
    try {
      await patchStatus(reschedLead.id, {
        lead_status: "follow-up",
        follow_up_reason: reschedNote.trim(),
        follow_up_date: reschedDate,
        follow_up_time: reschedTime,
      });
      setReschedOpen(false);
      await fetchFollowUps();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setReschedLoading(false);
    }
  };

  // Table styling
  const oneLine = (max = 160) => ({
    maxWidth: max,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  });

  const total = followUps.length;

  // ---------------- UI ----------------
  return (
    <Box sx={{ p: { xs: 0.75, md: 1.25 }, height: "100%", display: "flex", flexDirection: "column" }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1, sm: 1.25, md: 2 },
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          height: { xs: "calc(100vh - 110px)", md: "calc(100vh - 140px)" },
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box sx={{ pb: 1, flexShrink: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h5" fontWeight={700}>
                Field Marketing Follow-ups
              </Typography>
              <Chip size="small" label={`${total} total`} />
              {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
            </Stack>
            <Button variant="outlined" size="small" onClick={fetchFollowUps}>
              Refresh
            </Button>
          </Stack>

          {/* Search */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <TextField
              placeholder="Search in Follow-up"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: { xs: "100%", md: 520 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Typography color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
              {filtered.length} Lead{filtered.length !== 1 ? "s" : ""}
            </Typography>
          </Stack>

          {/* Filters */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            sx={{ mb: 1, "& .MuiTextField-root": { minWidth: { xs: "100%", md: 180 } } }}
          >
            <TextField select label="By Person" size="small" SelectProps={{ native: true }} value={personFilter} onChange={(e) => setPersonFilter(e.target.value)}>
              <option value="" />
              {allContacts.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </TextField>
            <TextField select label="By Company" size="small" SelectProps={{ native: true }} value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}>
              <option value="" />
              {allCompanies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </TextField>
            <TextField select label="By Location" size="small" SelectProps={{ native: true }} value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
              <option value="" />
              {allLocations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </TextField>
            <TextField select label="By Lead Type" size="small" SelectProps={{ native: true }} value={leadTypeFilter} onChange={(e) => setLeadTypeFilter(e.target.value)}>
              <option value="" />
              {allLeadTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </TextField>
            <Box sx={{ display: "flex", gap: 1, ml: { xs: 0, md: "auto" } }}>
              <Button variant="outlined" size="small" onClick={clearFilters}>
                Clear
              </Button>
            </Box>
          </Stack>
        </Box>

        {/* TABLE */}
        <TableContainer
          sx={{
            flex: 1,
            minHeight: 0,
            height: "100%",
            overflowY: "auto",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            borderRadius: { xs: 2, md: 2 },
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Table
            size={isSmUp ? "medium" : "small"}
            stickyHeader
            sx={{
              minWidth: isMdUp ? 1200 : isSmUp ? 1050 : 900,
              "& th": { fontWeight: 700, textTransform: "uppercase", bgcolor: "background.paper" },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Assign</TableCell>
                <TableCell>Lead #</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Lead Type</TableCell>
                <TableCell>Contact Person</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Next Follow-up</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={20} />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary">No follow-ups here yet.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((lead) => {
                  const nextDate = lead?.follow?.date ? fmtDate(lead.follow.date) : "-";
                  const nextTime = lead?.follow?.time || "-";
                  return (
                    <TableRow key={lead.id} hover>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => openAssign(lead)}
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          Assign to Another Department
                        </Button>
                      </TableCell>
                      <TableCell sx={oneLine(90)}>{lead.leadNo}</TableCell>
                      <TableCell sx={oneLine(160)}>{lead.company}</TableCell>
                      <TableCell sx={oneLine(120)}>{lead.leadType}</TableCell>
                      <TableCell sx={oneLine(140)}>{lead.contact}</TableCell>
                      <TableCell sx={oneLine(140)}>{lead.phone}</TableCell>
                      <TableCell sx={oneLine(180)}>
                        {nextDate} {nextTime}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ScheduleOutlinedIcon />}
                            onClick={() => openReschedule(lead)}
                          >
                            Reschedule
                          </Button>
                          <Tooltip title="Move back to New">
                            <span>
                              <Button
                                size="small"
                                startIcon={<UndoOutlinedIcon />}
                                onClick={() => openBack(lead)}
                              >
                                Back
                              </Button>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ---------------- Assign Dialog ---------------- */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Assign to Another Department</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <TextField select label="Department" value={assignDept} onChange={(e) => setAssignDept(e.target.value)} SelectProps={{ native: true }} fullWidth>
              <option value="" />
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </TextField>
            <TextField label="Reason" multiline minRows={3} value={assignReason} onChange={(e) => setAssignReason(e.target.value)} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveAssign} disabled={!assignDept || !assignReason.trim() || assignLoading}>
            {assignLoading ? "Assigning..." : "Assign"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------------- Back Dialog ---------------- */}
      <Dialog open={backOpen} onClose={() => setBackOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Move Back to Previous Stage</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 1 }}>
            This will move the lead back to <b>New</b> and remove it from this list.
          </Typography>
          <TextField label="Reason" multiline minRows={3} value={backReason} onChange={(e) => setBackReason(e.target.value)} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveBack} disabled={!backReason.trim() || backLoading}>
            {backLoading ? "Moving..." : "Move Back"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------------- Reschedule Dialog ---------------- */}
      <Dialog open={reschedOpen} onClose={() => setReschedOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Reschedule Follow-up</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <TextField label="Reason" multiline minRows={3} value={reschedNote} onChange={(e) => setReschedNote(e.target.value)} fullWidth />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <TextField label="Date" type="date" value={reschedDate} onChange={(e) => setReschedDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label="Time" type="time" value={reschedTime} onChange={(e) => setReschedTime(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReschedOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveReschedule} disabled={!reschedNote.trim() || !reschedDate || !reschedTime || reschedLoading}>
            {reschedLoading ? "Saving..." : "Reschedule"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
