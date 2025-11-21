// src/pages/marketing/FieldMyTeam.jsx

import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  GlobalStyles,
  Grid,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Checkbox,
  CircularProgress,
  ListItemText,
  MenuItem,
  IconButton
} from "@mui/material";

import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";


/* ----------------------------- helpers ----------------------------- */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

const mapLead = (api) => ({
  id: api.lead_id,
  title: api.lead_name || api.company_name || api.lead_requirement || api.lead_id,
  company: api.company_name || "",
  requirement: api.lead_requirement || "",
  assigned_employee: api.assigned_employee ?? "0",
  _raw: api,
});

/* ------------------------------ page ------------------------------- */
export default function FieldMyTeam() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const navigate = useNavigate();

  // ====== API state ======
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState([]);
  const [buckets, setBuckets] = useState({ unassigned: [] });
  const [error, setError] = useState("");

  // Fetch employees + their leads
 // Fetch employees + their leads
async function fetchTeam() {
  const token = getToken();
  if (!token) {
    setTeam([]);
    setBuckets({ unassigned: [] });
    return;
  }
  setLoading(true);
  setError("");
  try {
    const res = await fetch(`${API_BASE_URL}/api/fleads/fieldmarketing/all-leads`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || "Failed to fetch team");

    const employees = Array.isArray(json?.employees) ? json.employees : [];
    const unassignedFromApi = Array.isArray(json?.unassigned_leads)
      ? json.unassigned_leads.map(mapLead)
      : [];

    // Map team info
    const nextTeam = employees.map((e) => ({
      id: e.employee_id,
      name: e.username || e.email || e.employee_id,
      role: e.role_id || "",
      email: e.email || "",
    }));

    // Create buckets
    const nextBuckets = { unassigned: unassignedFromApi };
    nextTeam.forEach((t) => (nextBuckets[t.id] = []));

    // Fill employee buckets
    employees.forEach((emp) => {
      const leads = Array.isArray(emp.leads) ? emp.leads : [];
      leads.forEach((L) => {
        const mapped = mapLead(L);
        const assignee = String(mapped.assigned_employee || "0");
        if (assignee && assignee !== "0" && nextBuckets[assignee]) {
          nextBuckets[assignee].push(mapped);
        } else {
          nextBuckets.unassigned.push(mapped);
        }
      });
    });

    setTeam(nextTeam);
    setBuckets(nextBuckets);
  } catch (e) {
    console.error(e);
    setError(e.message || "Something went wrong");
    setTeam([]);
    setBuckets({ unassigned: [] });
  } finally {
    setLoading(false);
  }
}


  useEffect(() => {
    fetchTeam();
  }, []);

  // Totals
  const totalLeads = useMemo(
    () =>
      Object.values(buckets).reduce(
        (acc, list) => acc + (Array.isArray(list) ? list.length : 0),
        0
      ),
    [buckets]
  );

  /* search */
  const [qEmp, setQEmp] = useState("");
  const filteredTeam = useMemo(() => {
    const q = qEmp.trim().toLowerCase();
    if (!q) return team;
    return team.filter((m) =>
      [m.name, m.role, m.email].join(" ").toLowerCase().includes(q)
    );
  }, [team, qEmp]);

  /* --------- drag & drop + server assignment --------- */
  const dragRef = useRef(null);
  const [highlight, setHighlight] = useState("");
  const [draggingId, setDraggingId] = useState(null);
  const [confirmBack, setConfirmBack] = useState(null);
  const [dndError, setDndError] = useState("");

  const onDragStart = (leadId, fromKey) => (e) => {
    dragRef.current = { leadId, fromKey };
    setDraggingId(leadId);
    e.dataTransfer?.setData("text/plain", leadId);
    if (e.dataTransfer?.setDragImage) {
      const img = new Image();
      img.src =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4=";
      e.dataTransfer.setDragImage(img, 0, 0);
    }
  };
  const onDragEnd = () => {
    setDraggingId(null);
    setHighlight("");
    dragRef.current = null;
  };

  const applyMove = ({ leadId, fromKey, toKey }) => {
    if (fromKey === toKey) return;
    setBuckets((prev) => {
      const src = prev[fromKey] || [];
      const dst = prev[toKey] || [];
      const idx = src.findIndex((l) => l.id === leadId);
      if (idx === -1) return prev;
      const lead = src[idx];
      return {
        ...prev,
        [fromKey]: [...src.slice(0, idx), ...src.slice(idx + 1)],
        [toKey]: [...dst, lead],
      };
    });
  };

async function apiAssignLead(leadId, empId) {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/api/fleads/assign`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lead_id: leadId,
      assigned_employee: empId,
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error || json?.message || "Failed to assign lead");
  }
  return json;
}


  const doServerMove = async ({ leadId, fromKey, toKey }) => {
    if (fromKey === toKey) return;
    setDndError("");
    const assigned = toKey === "unassigned" ? "0" : toKey;

    applyMove({ leadId, fromKey, toKey });

    try {
      await apiAssignLead(leadId, assigned);
      await fetchTeam();
    } catch (e) {
      console.error(e);
      setDndError(e.message || "Assignment failed.");
      applyMove({ leadId, fromKey: toKey, toKey: fromKey });
    }
  };

  const onDropTo = (toKey) => (e) => {
    e.preventDefault();
    setHighlight("");
    const info = dragRef.current;
    if (!info) return;
    const { leadId, fromKey } = info;
    const isBack = fromKey !== "unassigned" && toKey === "unassigned";
    if (isBack) setConfirmBack({ leadId, fromKey, toKey });
    else doServerMove({ leadId, fromKey, toKey });
    onDragEnd();
  };

  /* assign dialog */
  const unassigned = buckets.unassigned || [];
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignEmpId, setAssignEmpId] = useState("");
  const [assignLeadIds, setAssignLeadIds] = useState([]);
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignError, setAssignError] = useState("");

  const resetAssign = () => {
    setAssignOpen(false);
    setAssignEmpId("");
    setAssignLeadIds([]);
    setAssignError("");
    setAssignSaving(false);
  };

const saveAssign = async () => {
  if (!assignEmpId || assignLeadIds.length === 0) return;
  setAssignError("");
  setAssignSaving(true);

  try {
    // Instantly update UI
    assignLeadIds.forEach((id) =>
      applyMove({ leadId: id, fromKey: "unassigned", toKey: assignEmpId })
    );

    // Fire API requests
    await Promise.all(
      assignLeadIds.map((id) =>
        apiAssignLead(id, assignEmpId)
          .then(() => console.log(`✅ Lead ${id} assigned to ${assignEmpId}`))
          .catch((err) => console.error(`❌ Failed to assign ${id}:`, err))
      )
    );

    // Small delay before refetch to ensure DB sync
    setTimeout(() => fetchTeam(), 800);

    resetAssign();
  } catch (e) {
    console.error(e);
    setAssignError(e.message || "Failed to assign one or more leads.");
    setAssignSaving(false);
  }
};

  const goToLead = (id) => navigate(`/marketing/lead/${encodeURIComponent(id)}`);



  const countFor = (empId) => (buckets[empId] || []).length;

  return (
    <Box>
      <GlobalStyles
        styles={{
          ":root": { "--card-r": "16px" },
          body: {
            fontFamily:
              'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
          },
        }}
      />

      {/* ---------- Header ---------- */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          flexWrap: { xs: "wrap", md: "nowrap" },
        }}
      >
        <Typography sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 800, lineHeight: 1.25 }}>
          Field • My Team
        </Typography>

        <Chip size="small" label={`${team.length} members`} sx={{ fontWeight: 700 }} />
        <Chip size="small" color="primary" variant="outlined" label={`${totalLeads} total leads`} sx={{ fontWeight: 700 }} />

        <TextField
          size="small"
          placeholder="Search teammate"
          value={qEmp}
          onChange={(e) => setQEmp(e.target.value)}
          sx={{
            ml: { xs: 0, md: "auto" },
            width: { xs: "100%", md: 340 },
            minWidth: { md: 220 },
            "& .MuiOutlinedInput-root": { borderRadius: 2 },
          }}
        />

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchTeam}
          sx={{ ml: { xs: 0, md: 1 } }}
        >
          Refresh
        </Button>

        <Button
          variant="contained"
          startIcon={<AssignmentTurnedInOutlinedIcon />}
          sx={{ borderRadius: 2, fontWeight: 700, flexShrink: 0 }}
          onClick={() => setAssignOpen(true)}
        >
          Assign Leads
        </Button>
      </Box>

      {(error || dndError) && (
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            p: 1.25,
            border: "1px solid",
            borderColor: "error.light",
            bgcolor: "error.lighter",
            color: "error.main",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2">{error || dndError}</Typography>
        </Paper>
      )}

      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 6, color: "text.secondary" }}>
          <CircularProgress size={24} sx={{ mb: 1 }} />
          <Typography>Loading team & leads…</Typography>
        </Stack>
      ) : (
        <Grid container spacing={2.5}>
          {/* Employees */}
          <Grid item xs={12} md={7}>
            <Stack spacing={2.5}>
              {filteredTeam.map((m) => {
                const list = buckets[m.id] || [];
                return (
                  <Paper
                    key={m.id}
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: highlight === m.id ? "primary.main" : "divider",
                      p: 2,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar sx={{ width: 40, height: 40 }}>{initials(m.name)}</Avatar>
                        <Box>
                          <Typography fontWeight={800} sx={{ lineHeight: 1.1 }}>
                            {m.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {m.role}
                            {m.email ? ` • ${m.email}` : ""}
                          </Typography>
                        </Box>
                      </Stack>

                      <Chip
                        size="small"
                        color="primary"
                        variant="outlined"
                        label={`${list.length} leads`}
                        sx={{ fontWeight: 700 }}
                      />
                    </Stack>

                    <Box
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnter={() => setHighlight(m.id)}
                      onDrop={onDropTo(m.id)}
                      sx={{ mt: 2, display: "grid", gap: 1.25 }}
                    >
                      {list.map((lead) => (
                        <Paper
                          key={lead.id}
                          elevation={0}
                          draggable
                          onDragStart={onDragStart(lead.id, m.id)}
                          onDragEnd={onDragEnd}
                          sx={{
                            p: 1.5,
                            borderRadius: "var(--card-r)",
                            border: "1px solid",
                            borderColor: "divider",
                            cursor: "grab",
                            opacity: draggingId === lead.id ? 0.6 : 1,
                            "&:hover": { boxShadow: 2 },
                          }}
                        >
                          <Stack direction="row" spacing={1.25} alignItems="center">
                            <Avatar sx={{ width: 34, height: 34 }}>{initials(lead.company)}</Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography fontWeight={700} noWrap title={lead.title}>
                                {lead.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap title={lead.company}>
                                {lead.company}
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1 }} />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                              title={lead.requirement}
                              sx={{ maxWidth: 260 }}
                            >
                              {lead.requirement}
                            </Typography>
                            <IconButton size="small" onClick={() => goToLead(lead.id)}>
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                          </Stack>
                        </Paper>
                      ))}
                      {list.length === 0 && (
                        <Box
                          sx={{
                            py: 3,
                            textAlign: "center",
                            border: "1px dashed",
                            borderColor: "divider",
                            borderRadius: 2,
                            color: "text.secondary",
                          }}
                        >
                          No leads assigned — drop from the right column to assign.
                        </Box>
                      )}
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          </Grid>

          {/* Unassigned */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: highlight === "unassigned" ? "primary.main" : "divider",
                p: 2,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack spacing={0.25}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Groups2OutlinedIcon fontSize="small" />
                    <Typography fontWeight={800}>Unassigned Leads</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {unassigned.length} leads waiting
                  </Typography>
                </Stack>
              </Stack>

              <Box
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setHighlight("unassigned")}
                onDrop={onDropTo("unassigned")}
                sx={{ mt: 2, display: "grid", gap: 1.25 }}
              >
                {unassigned.map((lead) => (
                  <Paper
                    key={lead.id}
                    elevation={0}
                    draggable
                    onDragStart={onDragStart(lead.id, "unassigned")}
                    onDragEnd={onDragEnd}
                    sx={{
                      p: 1.5,
                      borderRadius: "var(--card-r)",
                      border: "1px solid",
                      borderColor: "divider",
                      cursor: "grab",
                      opacity: draggingId === lead.id ? 0.6 : 1,
                      "&:hover": { boxShadow: 2 },
                    }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Avatar sx={{ width: 34, height: 34 }}>{initials(lead.company)}</Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={700} noWrap title={lead.title}>
                          {lead.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap title={lead.company}>
                          {lead.company}
                        </Typography>
                        
                      </Box>
                      <Box sx={{ flex: 1 }} />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        title={lead.requirement}
                        sx={{ maxWidth: 260 }}
                      >
                        {lead.requirement}
                      </Typography>
                      <IconButton size="small" onClick={() => goToLead(lead.id)}>
                                              <VisibilityOutlinedIcon fontSize="small" />
                                            </IconButton>
                    </Stack>
                  </Paper>
                ))}
                {unassigned.length === 0 && (
                  <Box
                    sx={{
                      py: 3,
                      textAlign: "center",
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: 2,
                      color: "text.secondary",
                    }}
                  >
                    All good — nothing unassigned.
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Confirm Back-to-Unassigned */}
      <Dialog open={Boolean(confirmBack)} onClose={() => setConfirmBack(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Move lead back to Unassigned?</DialogTitle>
        <DialogContent dividers>
          <Typography>You’re moving this lead back from a teammate. Continue?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmBack(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<SwapHorizIcon />}
            onClick={async () => {
              if (confirmBack) await doServerMove(confirmBack);
              setConfirmBack(null);
            }}
          >
            Move Back
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Leads Modal */}
      <Dialog open={assignOpen} onClose={assignSaving ? undefined : resetAssign} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Assign Leads</DialogTitle>
        <DialogContent dividers sx={{ display: "grid", gap: 2 }}>
          <Stack spacing={1}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
              Employee
            </Typography>
            <Select
              size="small"
              value={assignEmpId}
              onChange={(e) => setAssignEmpId(e.target.value)}
              displayEmpty
              disabled={assignSaving}
              renderValue={(val) => (val ? team.find((t) => t.id === val)?.name : "Choose employee…")}
            >
              {team.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ width: 24, height: 24 }}>{initials(m.name)}</Avatar>
                    <ListItemText primary={m.name} secondary={m.role} />
                    <Chip size="small" label={`${countFor(m.id)}`} />
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
              Leads to assign (unassigned)
            </Typography>
            <Select
              multiple
              size="small"
              value={assignLeadIds}
              onChange={(e) =>
                setAssignLeadIds(
                  typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value
                )
              }
              displayEmpty
              disabled={assignSaving}
              renderValue={(selected) => (selected.length ? `${selected.length} selected` : "Choose lead(s)…")}
            >
              {unassigned.map((l) => (
                <MenuItem key={l.id} value={l.id}>
                  <Checkbox checked={assignLeadIds.indexOf(l.id) > -1} />
                  <ListItemText primary={l.title} secondary={`${l.company} • ${l.requirement}`} />
                </MenuItem>
              ))}
              {unassigned.length === 0 && (
                <MenuItem disabled>
                  <ListItemText primary="No unassigned leads" />
                </MenuItem>
              )}
            </Select>
          </Stack>

          {assignError && (
            <Typography variant="body2" color="error">
              {assignError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={resetAssign} disabled={assignSaving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<AssignmentTurnedInOutlinedIcon />}
            disabled={!assignEmpId || assignLeadIds.length === 0 || assignSaving}
            onClick={saveAssign}
          >
            {assignSaving ? "Assigning…" : "Assign"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
