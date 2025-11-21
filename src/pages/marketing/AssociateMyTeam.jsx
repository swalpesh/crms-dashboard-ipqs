// src/pages/marketing/AssociateMyTeam.jsx

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
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ----------------------------- helpers ----------------------------- */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () =>
  localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

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
});

/* ------------------------------ page ------------------------------- */
export default function AssociateMyTeam() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState([]);
  const [buckets, setBuckets] = useState({ unassigned: [] });
  const [error, setError] = useState("");

  /* ---------------- Fetch team + leads ---------------- */
  async function fetchTeam() {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/aleads/associatemarketing/all-leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to fetch team");

      // handle flexible keys (associateEmployees, employees, data)
      const employees =
        json.employees || json.associateEmployees || json.data?.employees || [];
      const unassignedLeads =
        json.unassigned_leads || json.unassignedLeads || json.data?.unassigned_leads || [];

      const nextTeam = employees.map((e) => ({
        id: e.employee_id || e.id,
        name: e.username || e.name || e.email,
        role: e.role_id || e.role_name || "",
        email: e.email || "",
      }));

      const nextBuckets = { unassigned: unassignedLeads.map(mapLead) };
      nextTeam.forEach((t) => (nextBuckets[t.id] = []));

      employees.forEach((emp) => {
        const leads = emp.leads || emp.assigned_leads || [];
        leads.forEach((L) => {
          const mapped = mapLead(L);
          const eid = emp.employee_id || emp.id;
          if (nextBuckets[eid]) nextBuckets[eid].push(mapped);
        });
      });

      setTeam(nextTeam);
      setBuckets(nextBuckets);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTeam();
  }, []);

  const totalLeads = useMemo(
    () => Object.values(buckets).flat().length,
    [buckets]
  );

  /* ---------------- Search teammates ---------------- */
  const [qEmp, setQEmp] = useState("");
  const filteredTeam = useMemo(() => {
    const q = qEmp.trim().toLowerCase();
    if (!q) return team;
    return team.filter((m) =>
      [m.name, m.role, m.email].join(" ").toLowerCase().includes(q)
    );
  }, [team, qEmp]);

  /* ---------------- Drag & Drop ---------------- */
  const dragRef = useRef(null);
  const [highlight, setHighlight] = useState("");
  const [draggingId, setDraggingId] = useState(null);
  const [confirmBack, setConfirmBack] = useState(null);

  const onDragStart = (leadId, fromKey) => (e) => {
    dragRef.current = { leadId, fromKey };
    setDraggingId(leadId);
    e.dataTransfer?.setData("text/plain", leadId);
  };

  const onDragEnd = () => {
    dragRef.current = null;
    setDraggingId(null);
    setHighlight("");
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
    const res = await fetch(`${API_BASE_URL}/api/aleads/assign`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lead_id: leadId, assigned_employee: empId }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "Failed to assign lead");
  }

  const doServerMove = async ({ leadId, fromKey, toKey }) => {
    applyMove({ leadId, fromKey, toKey });
    try {
      await apiAssignLead(leadId, toKey === "unassigned" ? "0" : toKey);
      fetchTeam();
    } catch (e) {
      console.error(e);
      setError(e.message);
      applyMove({ leadId, fromKey: toKey, toKey: fromKey });
    }
  };

  const onDropTo = (toKey) => (e) => {
    e.preventDefault();
    const info = dragRef.current;
    if (!info) return;
    const { leadId, fromKey } = info;
    const isBack = fromKey !== "unassigned" && toKey === "unassigned";
    if (isBack) setConfirmBack({ leadId, fromKey, toKey });
    else doServerMove({ leadId, fromKey, toKey });
    onDragEnd();
  };

  /* ---------------- Assign Modal ---------------- */
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignEmpId, setAssignEmpId] = useState("");
  const [assignLeadIds, setAssignLeadIds] = useState([]);
  const unassigned = buckets.unassigned || [];

  const resetAssign = () => {
    setAssignOpen(false);
    setAssignEmpId("");
    setAssignLeadIds([]);
  };

  const saveAssign = async () => {
    try {
      await Promise.all(
        assignLeadIds.map((id) => apiAssignLead(id, assignEmpId))
      );
      fetchTeam();
      resetAssign();
    } catch (e) {
      console.error(e);
      setError(e.message);
    }
  };

  const goToLead = (id) => navigate(`/marketing/lead/${encodeURIComponent(id)}`);

  /* ---------------- UI ---------------- */
  return (
    <Box>
      <GlobalStyles
        styles={{
          ":root": { "--card-r": "16px" },
          body: { fontFamily: "Inter, system-ui, sans-serif" },
        }}
      />

      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          flexWrap: "wrap",
        }}
      >
        <Typography sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 800 }}>
          Associate • My Team
        </Typography>
        <Chip label={`${team.length} members`} />
        <Chip
          color="primary"
          variant="outlined"
          label={`${totalLeads} total leads`}
        />
        <TextField
          size="small"
          placeholder="Search teammate"
          value={qEmp}
          onChange={(e) => setQEmp(e.target.value)}
          sx={{ ml: "auto", width: { xs: "100%", md: 300 } }}
        />
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchTeam}
        >
          Refresh
        </Button>
        <Button
          variant="contained"
          startIcon={<AssignmentTurnedInOutlinedIcon />}
          onClick={() => setAssignOpen(true)}
        >
          Assign Leads
        </Button>
      </Box>

      {loading ? (
        <Stack alignItems="center" sx={{ py: 6 }}>
          <CircularProgress size={28} />
        </Stack>
      ) : (
        <Grid container spacing={2.5}>
          {/* Employees */}
          <Grid item xs={12} md={7}>
            <Stack spacing={2.5}>
              {filteredTeam.map((emp) => {
                const leads = buckets[emp.id] || [];
                return (
                  <Paper
                    key={emp.id}
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      p: 2,
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar>{initials(emp.name)}</Avatar>
                        <Box>
                          <Typography fontWeight={800}>{emp.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {emp.role} {emp.email && `• ${emp.email}`}
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip
                        label={`${leads.length} leads`}
                        color="primary"
                        variant="outlined"
                      />
                    </Stack>

                    <Box
                      sx={{ mt: 2, display: "grid", gap: 1 }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={onDropTo(emp.id)}
                    >
                      {leads.map((lead) => (
                        <Paper
                          key={lead.id}
                          draggable
                          onDragStart={onDragStart(lead.id, emp.id)}
                          onDragEnd={onDragEnd}
                          sx={{
                            p: 1.5,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            cursor: "grab",
                          }}
                        >
                          <Stack direction="row" spacing={1.25} alignItems="center">
                            <Avatar sx={{ width: 34, height: 34 }}>
                              {initials(lead.company)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography fontWeight={700} noWrap>
                                {lead.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                noWrap
                              >
                                {lead.company}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                            >
                              {lead.requirement}
                            </Typography>
                            <IconButton size="small" onClick={() => goToLead(lead.id)}>
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Paper>
                      ))}
                      {leads.length === 0 && (
                        <Box
                          sx={{
                            py: 3,
                            textAlign: "center",
                            color: "text.secondary",
                            border: "1px dashed",
                            borderColor: "divider",
                            borderRadius: 2,
                          }}
                        >
                          No leads assigned — drop from right to assign.
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
            <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", p: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Groups2OutlinedIcon />
                <Typography fontWeight={800}>Unassigned Leads</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {unassigned.length} leads waiting
              </Typography>

              <Box
                sx={{ mt: 2, display: "grid", gap: 1 }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDropTo("unassigned")}
              >
                {unassigned.map((lead) => (
                  <Paper
                    key={lead.id}
                    draggable
                    onDragStart={onDragStart(lead.id, "unassigned")}
                    onDragEnd={onDragEnd}
                    sx={{
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      cursor: "grab",
                    }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Avatar sx={{ width: 34, height: 34 }}>
                        {initials(lead.company)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={700} noWrap>
                          {lead.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {lead.company}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
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

      {/* Assign Modal */}
      <Dialog open={assignOpen} onClose={resetAssign} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Leads</DialogTitle>
        <DialogContent dividers>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Choose Employee
          </Typography>
          <Select
            fullWidth
            size="small"
            value={assignEmpId}
            onChange={(e) => setAssignEmpId(e.target.value)}
            sx={{ my: 1 }}
          >
            {team.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name} ({t.role})
              </MenuItem>
            ))}
          </Select>

          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Select Leads
          </Typography>
          <Select
            fullWidth
            multiple
            size="small"
            value={assignLeadIds}
            onChange={(e) =>
              setAssignLeadIds(
                typeof e.target.value === "string"
                  ? e.target.value.split(",")
                  : e.target.value
              )
            }
          >
            {unassigned.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                <Checkbox checked={assignLeadIds.includes(u.id)} />
                <ListItemText
                  primary={u.title}
                  secondary={`${u.company} • ${u.requirement}`}
                />
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetAssign}>Cancel</Button>
          <Button
            onClick={saveAssign}
            variant="contained"
            disabled={!assignEmpId || assignLeadIds.length === 0}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
