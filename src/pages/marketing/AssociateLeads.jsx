// src/pages/marketing/AssociateLeads.jsx
import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Stack, Typography, Tabs, Tab, TextField, IconButton, Button, Chip, Paper, Menu,
  MenuItem, Divider, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Tooltip,
  Autocomplete, FormHelperText, CircularProgress
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

/* ----------------------------- API helpers ----------------------------- */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const getToken = () =>
  localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

const getEmployeeId = () => {
  const direct =
    localStorage.getItem("auth_employee_id") ||
    sessionStorage.getItem("auth_employee_id");
  if (direct) return direct;

  try {
    const rawUser =
      localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");
    if (rawUser) {
      const u = JSON.parse(rawUser);
      return u.employee_id || u.employeeId || u.emp_id || u.id || "";
    }
  } catch {}

  const token = getToken();
  if (token && token.split(".").length === 3) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.employee_id || payload.emp_id || payload.sub || "";
    } catch {}
  }
  return "";
};

/** Map API lead -> row object used by the table */
function mapLead(api) {
  const location = [api.company_city, api.company_state, api.company_country]
    .filter(Boolean)
    .join(", ");

  return {
    id: api.lead_id,
    leadNo: api.lead_id,
    company: api.company_name || "",
    createdAt: api.created_at || "",
    industry: api.industry_type || "",
    contact: api.contact_person_name || "",
    phone: api.contact_person_phone || "",
    email: api.contact_person_email || api.company_email || "",
    leadType: api.lead_requirement || "",
    location,
    department: api.lead_stage || api.department || "",
    createdByName: api.created_by_name || api.created_by || api.creator_name || "",
    follow: {
      note: api.follow_up_reason || "",
      date: api.follow_up_date || "",
      time: api.follow_up_time || "",
    },
    _raw: api,
  };
}

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

/* ---------------------- FREE Country/State/City API hooks ---------------------- */
function useCountries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/iso");
        const json = await res.json();
        if (!ok) return;
        const list = (json?.data || []).map((c) => c.name).sort();
        setCountries(list);
      } catch {
        setErr("Failed to load countries.");
      } finally {
        setLoading(false);
      }
    })();
    return () => { ok = false; };
  }, []);
  return { countries, loading, err };
}
function useStates(country) {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => {
    let ok = true;
    if (!country) {
      setStates([]);
      setErr("");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country }),
        });
        const json = await res.json();
        if (!ok) return;
        const list = (json?.data?.states || []).map((s) => s.name).sort();
        setStates(list);
      } catch {
        setErr("Failed to load states.");
      } finally {
        setLoading(false);
      }
    })();
    return () => { ok = false; };
  }, [country]);
  return { states, loading, err };
}
function useCities(country, state) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => {
    let ok = true;
    if (!country || !state) {
      setCities([]);
      setErr("");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country, state }),
        });
        const json = await res.json();
        if (!ok) return;
        const list = (json?.data || []).slice().sort();
        setCities(list);
      } catch {
        setErr("Failed to load cities.");
      } finally {
        setLoading(false);
      }
    })();
    return () => { ok = false; };
  }, [country, state]);
  return { cities, loading, err };
}

/* ---------------- UI: Mobile header ---------------- */
function MobileHeader({ total, onAdd }) {
  return (
    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1 }}>
      <Box>
        <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>
          Associate <br />Leads
        </Typography>
        <Chip label={`${total} total`} size="small" sx={{ mt: 0.75 }} />
      </Box>
      <Button
        variant="contained"
        startIcon={<AddCircleOutlineOutlinedIcon />}
        sx={{
          borderRadius: 999,
          bgcolor: "error.main",
          px: 1.5,
          py: 0.6,
          fontWeight: 700,
          boxShadow: "none",
          "&:hover": { boxShadow: "none", bgcolor: "error.dark" },
        }}
        onClick={onAdd}
      >
        Add Lead
      </Button>
    </Stack>
  );
}

/* ================================ main page ================================ */
export default function AssociateLeads() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const navigate = useNavigate();
  const goDetail = (lead) =>
    navigate(`/marketing/lead/${encodeURIComponent(lead?.id || lead?.leadNo)}`);

  // Tabs: 0 = New, 1 = Follow-up, 2 = Lost
  const [tab, setTab] = useState(0);

  // Data buckets (loaded from API)
  const [newLeads, setNewLeads] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [lost, setLost] = useState([]);

  // Loading flags
  const [loadingNew, setLoadingNew] = useState(false);
  const [loadingFU, setLoadingFU] = useState(false);
  const [loadingLost, setLoadingLost] = useState(false);

  // Search & filters
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Filter set: Department, Created Person, Location
  const [deptFilter, setDeptFilter] = useState("");
  const [createdByFilter, setCreatedByFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // Menus / dialogs
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeLead, setActiveLead] = useState(null);

  const [followDialogOpen, setFollowDialogOpen] = useState(false);
  const [fuNote, setFuNote] = useState("");
  const [fuDate, setFuDate] = useState("");
  const [fuTime, setFuTime] = useState("");

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignLead, setAssignLead] = useState(null);
  const [assignDept, setAssignDept] = useState("");
  const [assignReason, setAssignReason] = useState("");

  const [backOpen, setBackOpen] = useState(false);
  const [backLead, setBackLead] = useState(null);
  const [backReason, setBackReason] = useState("");

  // Reschedule follow-up
  const [reschedOpen, setReschedOpen] = useState(false);
  const [reschedLead, setReschedLead] = useState(null);
  const [reschedNote, setReschedNote] = useState("");
  const [reschedDate, setReschedDate] = useState("");
  const [reschedTime, setReschedTime] = useState("");

  // ---- Add Lead dialog state ----
  const [addOpen, setAddOpen] = useState(false);

  const initialForm = {
    leadName: "",
    companyName: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    companyPhone: "",
    companyEmail: "",
    companyWebsite: "",
    address: "",
    state: "",
    city: "",
    country: "",
    zip: "",
    industryType: "",
    leadType: "",
    notes: "",
    attachments: [],
  };
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState("");

  // Counts
  const counts = { new: newLeads.length, fu: followUps.length, lost: lost.length };
  const total = counts.new + counts.fu + counts.lost;

  // Current list by tab
  const currentList = tab === 0 ? newLeads : tab === 1 ? followUps : lost;

  // Dropdown options (from live data)
  const allDepartments = Array.from(
    new Set([...newLeads, ...followUps, ...lost].map((l) => l.department))
  ).filter(Boolean);
  const allCreators = Array.from(
    new Set([...newLeads, ...followUps, ...lost].map((l) => l.createdByName))
  ).filter(Boolean);
  const allLocations = Array.from(
    new Set([...newLeads, ...followUps, ...lost].map((l) => l.location))
  ).filter(Boolean);

  // Filter + search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return currentList.filter((l) => {
      const matchesSearch =
        !q ||
        [
          l.leadNo, l.company, l.createdAt, l.industry, l.contact, l.phone, l.email,
          l.leadType, l.location, l.createdByName, l.department,
          l?.follow?.date, l?.follow?.time, l?.follow?.note
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));

      const created = l.createdAt ? new Date(l.createdAt) : null;
      const afterFrom = !dateFrom || (created && created >= new Date(dateFrom));
      const beforeTo = !dateTo || (created && created <= new Date(dateTo));

      const matchesDept = !deptFilter || l.department === deptFilter;
      const matchesCreator = !createdByFilter || l.createdByName === createdByFilter;
      const matchesLocation = !locationFilter || l.location === locationFilter;

      return (
        matchesSearch &&
        afterFrom &&
        beforeTo &&
        matchesDept &&
        matchesCreator &&
        matchesLocation
      );
    });
  }, [currentList, search, dateFrom, dateTo, deptFilter, createdByFilter, locationFilter]);

  const clearFilters = () => {
    setDateFrom(""); setDateTo(""); setDeptFilter(""); setCreatedByFilter(""); setLocationFilter("");
  };

  /* ================== API calls ================== */

  async function fetchLeadsBy(status) {
    const token = getToken();
    if (!token) return [];
    const url = `${API_BASE_URL}/api/aleads/my-leads?lead_status=${encodeURIComponent(status)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || "Failed to fetch");
    const arr = Array.isArray(json?.leads) ? json.leads : [];
    return arr.map(mapLead);
  }

  async function refreshAll() {
    try {
      setLoadingNew(true); setLoadingFU(true); setLoadingLost(true);
      const [n, f, l] = await Promise.all([
        fetchLeadsBy("new"),
        fetchLeadsBy("follow-up"),
        fetchLeadsBy("lost"),
      ]);
      setNewLeads(n); setFollowUps(f); setLost(l);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNew(false); setLoadingFU(false); setLoadingLost(false);
    }
  }
  useEffect(() => { refreshAll(); }, []);

  async function patchStatus(leadId, payload) {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/aleads/${leadId}/status`, {
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

  async function revertLead(leadId) {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/aleads/${leadId}/revert`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || "Failed to revert lead");
    return json;
  }

  // >>> Assign to another department (change stage) <<<
  async function changeStage(leadId, newStage, reason) {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/aleads/change-stage`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lead_id: leadId,
        new_lead_stage: newStage, // e.g., "Associate-Marketing"
        reason: reason || "",
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || "Failed to change stage");
    return json;
  }

  async function createLead(fd) {
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/api/aleads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || "Failed to create lead");
    return json;
  }

  /* ================== Row actions (wire to API) ================== */

  const openMenu = (anchor, lead) => { setMenuAnchor(anchor); setActiveLead(lead); };
  const closeMenu = () => setMenuAnchor(null);

  const startFollowUp = () => { setFollowDialogOpen(true); closeMenu(); };

  const saveFollowUp = async () => {
    if (!activeLead) return;
    try {
      await patchStatus(activeLead.id, {
        lead_status: "follow-up",
        follow_up_reason: fuNote.trim(),
        follow_up_date: fuDate,
        follow_up_time: fuTime,
      });
      setFuNote(""); setFuDate(""); setFuTime("");
      setFollowDialogOpen(false); setActiveLead(null);
      await refreshAll(); setTab(1);
    } catch (e) { console.error(e); }
  };

  const markLost = async () => {
    if (!activeLead) return;
    try {
      await patchStatus(activeLead.id, { lead_status: "lost" });
      setActiveLead(null); setMenuAnchor(null);
      await refreshAll(); setTab(2);
    } catch (e) { console.error(e); }
  };

  const DEPARTMENTS = [
    "Tele Marketing",
    "Associate Marketing",
    "Technical Team",
    "Solutions Team",
    "Quotation Team",
  ];
  const mapDeptToStage = (d) =>
    ({
      "Associate Marketing": "Associate-Marketing",
      "Technical Team": "Technical-Team",
      "Solutions Team": "Solutions-Team",
      "Quotation Team": "Quotation-Team",
    }[d] || d);

  const openAssign = (lead) => { setAssignLead(lead); setAssignDept(""); setAssignReason(""); setAssignOpen(true); };
  const saveAssign = async () => {
    if (!assignLead) return;
    try {
      await changeStage(assignLead.id, mapDeptToStage(assignDept), assignReason.trim());
      setAssignOpen(false); setAssignLead(null);
      await refreshAll();
    } catch (e) { console.error(e); }
  };

  const openBack = (lead) => { setBackLead(lead); setBackReason(""); setBackOpen(true); };
  const saveBack = async () => {
    if (!backLead) return;
    try {
      await revertLead(backLead.id);
      setBackOpen(false); setBackLead(null);
      await refreshAll(); setTab(0);
    } catch (e) { console.error(e); }
  };

  const openReschedule = (lead) => {
    setReschedLead(lead);
    setReschedNote(lead?.follow?.note || "");
    setReschedDate(lead?.follow?.date || "");
    setReschedTime(lead?.follow?.time || "");
    setReschedOpen(true);
  };
  const saveReschedule = async () => {
    if (!reschedLead) return;
    try {
      await patchStatus(reschedLead.id, {
        lead_status: "follow-up",
        follow_up_reason: reschedNote.trim(),
        follow_up_date: reschedDate,
        follow_up_time: reschedTime,
      });
      setReschedOpen(false); setReschedLead(null);
      await refreshAll(); setTab(1);
    } catch (e) { console.error(e); }
  };

  /* ================== Add Lead (multipart) ================== */
  const validateForm = () => {
    const required = {
      leadName: "Lead Name",
      companyName: "Company Name",
      contactPerson: "Contact Person Name",
      contactPhone: "Contact Person Phone",
      contactEmail: "Contact Person Email",
      leadType: "Lead Requirement",
    };
    const missing = Object.entries(required)
      .filter(([k]) => !String(form[k] || "").trim())
      .map(([, label]) => label);
    if (missing.length) return `Please fill required fields: ${missing.join(", ")}.`;
    const emailLike = (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (!emailLike(form.contactEmail)) return "Contact Person Email looks invalid.";
    if (form.companyEmail && !emailLike(form.companyEmail)) return "Company Email looks invalid.";
    if (form.companyWebsite && !/^https?:\/\//i.test(form.companyWebsite)) {
      return "Company Website should start with http:// or https://";
    }
    return "";
  };

  const handleOpenAdd = () => { setForm(initialForm); setTouched({}); setFormError(""); setAddOpen(true); };
  const handleCloseAdd = () => setAddOpen(false);
  const fileInputRef = useRef(null);
  const handleFilesChosen = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setForm((f) => ({ ...f, attachments: [...f.attachments, ...files] }));
    e.target.value = "";
  };
  const removeAttachment = (idx) => {
    setForm((f) => ({ ...f, attachments: f.attachments.filter((_, i) => i !== idx) }));
  };

  const saveLead = async () => {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    try {
      const fd = new FormData();
      fd.append("lead_name", form.leadName.trim());
      fd.append("company_name", form.companyName.trim());
      fd.append("contact_person_name", form.contactPerson.trim());
      fd.append("contact_person_phone", form.contactPhone.trim());
      fd.append("contact_person_email", form.contactEmail.trim());
      fd.append("company_contact_number", form.companyPhone.trim());
      fd.append("company_email", form.companyEmail.trim());
      fd.append("company_website", form.companyWebsite.trim());
      fd.append("company_address", form.address.trim());
      fd.append("company_country", form.country.trim());
      fd.append("company_state", form.state.trim());
      fd.append("company_city", form.city.trim());
      fd.append("zipcode", form.zip.trim());
      fd.append("industry_type", form.industryType || "");
      fd.append("lead_requirement", form.leadType || "");
      fd.append("notes", form.notes || "");

      const creatorId = getEmployeeId() || "0";
      fd.append("assigned_employee", creatorId);
      fd.append("lead_status", "new");
      fd.append("follow_up_reason", "");
      fd.append("follow_up_date", "");
      fd.append("follow_up_time", "");
      fd.append("lead_stage", "Associate-Marketing");

      (form.attachments || []).forEach((file) => {
        fd.append("attachments", file);
      });

      await createLead(fd);
      setAddOpen(false);
      await refreshAll();
      setTab(0);
    } catch (e) {
      console.error(e);
      setFormError(e.message || "Failed to create lead");
    }
  };

  /* ------------------------ responsive table ------------------------ */
  const oneLine = (max = 160) => ({ maxWidth: max, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" });

  // ------------ Country/State/City data (live) ------------
  const { countries, loading: loadingCountries, err: errorCountries } = useCountries();
  const { states, loading: loadingStates, err: errorStates } = useStates(form.country);
  const { cities, loading: loadingCities, err: errorCities } = useCities(form.country, form.state);

  return (
    <Box sx={{ p: { xs: 0.75, md: 1.25 }, height: "100%", display: "flex", flexDirection: "column" }}>
      {!isMdUp && <MobileHeader total={total} onAdd={handleOpenAdd} />}

      <Paper elevation={0} sx={{
        p: { xs: 1, sm: 1.25, md: 2 }, borderRadius: 2, border: "1px solid", borderColor: "divider",
        bgcolor: "background.paper", display: "flex", flexDirection: "column",
        height: { xs: "calc(100vh - 110px)", md: "calc(100vh - 140px)" }, overflow: "hidden",
      }}>
        {/* Header */}
        <Box sx={{ pb: 1, flexShrink: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            {isMdUp && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h5" fontWeight={700}>Associate Leads</Typography>
                <Chip size="small" label={`${total} total`} />
              </Stack>
            )}
            {isMdUp && (
              <Button variant="contained" startIcon={<AddCircleOutlineOutlinedIcon />}
                sx={{ borderRadius: 999, bgcolor: "error.main", px: 1.75, py: 0.75, fontWeight: 700, boxShadow: "none",
                  "&:hover": { boxShadow: "none", bgcolor: "error.dark" }, }}
                onClick={handleOpenAdd}>
                Add Lead
              </Button>
            )}
          </Stack>

          {/* Tabs */}
          <Box sx={{ flex: 1, overflowX: "auto", mb: 1 }}>
            <Tabs value={tab} onChange={(_, v) => { setTab(v); setSearch(""); }}
              variant="scrollable" scrollButtons="auto"
              sx={{ minHeight: 36, "& .MuiTab-root": { textTransform: "none", minHeight: 36, fontWeight: 700 } }}>
              <Tab label={
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Typography>New</Typography>
                  <Chip size="small" label={counts.new} />
                  {loadingNew && <CircularProgress size={12} sx={{ ml: 0.5 } }/>}
                </Stack>
              } />
              <Tab label={
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Typography>Follow-up</Typography>
                  <Chip size="small" label={counts.fu} color="success" />
                  {loadingFU && <CircularProgress size={12} sx={{ ml: 0.5 } }/>}
                </Stack>
              } />
              <Tab label={
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Typography>Lost</Typography>
                  <Chip size="small" label={counts.lost} color="error" />
                  {loadingLost && <CircularProgress size={12} sx={{ ml: 0.5 } }/>}
                </Stack>
              } />
            </Tabs>
          </Box>

          {/* Search & filters */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <TextField placeholder={`Search in ${tab === 0 ? "New" : tab === 1 ? "Follow-up" : "Lost"}`}
              size="small" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ width: { xs: "100%", md: 520 } }}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchOutlinedIcon /></InputAdornment>) }} />
            <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: "none", sm: "flex" } }}>
              <Typography color="text.secondary">{filtered.length} Lead{filtered.length !== 1 ? "s" : ""}</Typography>
              <Button size="small" onClick={refreshAll}>Refresh</Button>
            </Stack>
          </Stack>

          {/* Filters — Dept / Created Person / Location */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={1}
            sx={{ mb: 1, "& .MuiTextField-root": { minWidth: { xs: "100%", md: 200 } } }}>
            <Stack direction="row" spacing={1} sx={{ width: { xs: "100%", md: "auto" } }}>
              <TextField label="Date From" type="date" size="small" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField label="Date To" type="date" size="small" value={dateTo} onChange={(e) => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Stack>
            <TextField label="By Department" size="small" select SelectProps={{ native: true }} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
              <option value="" />
              {allDepartments.map((d) => (<option key={d} value={d}>{d}</option>))}
            </TextField>
            <TextField label="By Created Person" size="small" select SelectProps={{ native: true }} value={createdByFilter} onChange={(e) => setCreatedByFilter(e.target.value)}>
              <option value="" />
              {allCreators.map((c) => (<option key={c} value={c}>{c}</option>))}
            </TextField>
            <TextField label="By Location" size="small" select SelectProps={{ native: true }} value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
              <option value="" />
              {allLocations.map((l) => (<option key={l} value={l}>{l}</option>))}
            </TextField>
            <Box sx={{ display: "flex", gap: 1, ml: { xs: 0, md: "auto" } }}>
              <Button variant="outlined" size="small" onClick={clearFilters}>Clear</Button>
            </Box>
          </Stack>
        </Box>

        {/* TABLE */}
        <TableContainer sx={{
          flex: 1, minHeight: 0, height: "100%", overflowY: "auto", overflowX: "auto",
          WebkitOverflowScrolling: "touch", borderRadius: { xs: 2, md: 2 }, border: "1px solid", borderColor: "divider",
        }}>
          <Table size={isSmUp ? "medium" : "small"} stickyHeader sx={{
            minWidth: isMdUp ? 1280 : isSmUp ? 1100 : 920,
            "& th": { fontWeight: 700, fontSize: { xs: 11.5, sm: 12 }, textTransform: "uppercase", whiteSpace: "nowrap", py: { xs: 0.75, sm: 1 }, bgcolor: "background.paper" },
            "& td": { whiteSpace: "nowrap", fontSize: { xs: 13, sm: 14 }, py: { xs: 0.6, sm: 1 } },
          }}>
            {/* Table head */}
            <TableHead>
              {tab === 1 ? (
                // Follow-up (with Assign)
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
              ) : tab === 0 ? (
                // New (with Assign + Actions)
                <TableRow>
                  <TableCell>Assign</TableCell>
                  <TableCell>Lead #</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Industry</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Lead Type</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              ) : (
                // Lost (NO Assign column, NO Actions)
                <TableRow>
                  <TableCell>Lead #</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Industry</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Lead Type</TableCell>
                </TableRow>
              )}
            </TableHead>

            <TableBody>
              {(tab === 0 && loadingNew) || (tab === 1 && loadingFU) || (tab === 2 && loadingLost) ? (
                <TableRow>
                  <TableCell colSpan={tab === 1 ? 8 : (tab === 0 ? 10 : 8)}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={18} />
                      <Typography color="text.secondary">Loading…</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={tab === 1 ? 8 : (tab === 0 ? 10 : 8)}>
                    <Typography color="text.secondary">No leads here yet.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((lead) => {
                  if (tab === 1) {
                    // FOLLOW-UP rows (with Assign)
                    const nextDate = lead?.follow?.date ? fmtDate(lead.follow.date) : "-";
                    const nextTime = lead?.follow?.time || "-";
                    return (
                      <TableRow key={lead.id} hover>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => openAssign(lead)}
                            sx={{ whiteSpace: "nowrap", px: { xs: 1, sm: 1.5 } }}
                          >
                            {isSmUp ? "Assign to Another Department" : "Assign"}
                          </Button>
                        </TableCell>
                        <TableCell sx={oneLine(110)}>
                          <Button size="small" onClick={() => goDetail(lead)}>
                            {lead.leadNo}
                          </Button>
                        </TableCell>
                        <TableCell sx={oneLine(160)} title={lead.company}>{lead.company}</TableCell>
                        <TableCell sx={oneLine(120)} title={lead.leadType}>{lead.leadType}</TableCell>
                        <TableCell sx={oneLine(140)} title={lead.contact}>{lead.contact}</TableCell>
                        <TableCell sx={oneLine(140)} title={lead.phone}>{lead.phone}</TableCell>
                        <TableCell sx={oneLine(180)} title={`${nextDate} ${nextTime}`}>{nextDate} {nextTime}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="View details">
                              <IconButton size="small" onClick={() => goDetail(lead)}>
                                <VisibilityOutlinedIcon />
                              </IconButton>
                            </Tooltip>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ScheduleOutlinedIcon />}
                              onClick={() => openReschedule(lead)}
                              sx={{ minWidth: { xs: 0, sm: 64 }, px: { xs: 1, sm: 1.5 } }}
                            >
                              {isSmUp ? "Reschedule" : ""}
                            </Button>
                            <Tooltip title="Move back to New">
                              <span>
                                <Button
                                  size="small"
                                  startIcon={<UndoOutlinedIcon />}
                                  onClick={() => openBack(lead)}
                                  sx={{ minWidth: { xs: 0, sm: 64 }, px: { xs: 1, sm: 1.5 } }}
                                >
                                  {isSmUp ? "Back" : ""}
                                </Button>
                              </span>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  }

                  if (tab === 2) {
                    // LOST rows (NO Assign button)
                    return (
                      <TableRow key={lead.id} hover>
                        <TableCell sx={oneLine(110)}>
                          <Button size="small" onClick={() => goDetail(lead)}>
                            {lead.leadNo}
                          </Button>
                        </TableCell>
                        <TableCell sx={oneLine(160)} title={lead.company}>{lead.company}</TableCell>
                        <TableCell sx={oneLine(110)} title={fmtDate(lead.createdAt)}>{fmtDate(lead.createdAt)}</TableCell>
                        <TableCell sx={oneLine(140)} title={lead.industry}>{lead.industry}</TableCell>
                        <TableCell sx={oneLine(140)} title={lead.contact}>{lead.contact}</TableCell>
                        <TableCell sx={oneLine(140)} title={lead.phone}>{lead.phone}</TableCell>
                        <TableCell sx={oneLine(220)} title={lead.email}>{lead.email}</TableCell>
                        <TableCell sx={oneLine(120)} title={lead.leadType}>{lead.leadType}</TableCell>
                      </TableRow>
                    );
                  }

                  // NEW rows (with Assign + Actions)
                  return (
                    <TableRow key={lead.id} hover>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => openAssign(lead)}
                          sx={{ whiteSpace: "nowrap", px: { xs: 1, sm: 1.5 } }}
                        >
                          {isSmUp ? "Assign to Another Department" : "Assign"}
                        </Button>
                      </TableCell>
                      <TableCell sx={oneLine(110)}>
                        <Button size="small" onClick={() => goDetail(lead)}>
                          {lead.leadNo}
                        </Button>
                      </TableCell>
                      <TableCell sx={oneLine(160)} title={lead.company}>{lead.company}</TableCell>
                      <TableCell sx={oneLine(110)} title={fmtDate(lead.createdAt)}>{fmtDate(lead.createdAt)}</TableCell>
                      <TableCell sx={oneLine(140)} title={lead.industry}>{lead.industry}</TableCell>
                      <TableCell sx={oneLine(140)} title={lead.contact}>{lead.contact}</TableCell>
                      <TableCell sx={oneLine(140)} title={lead.phone}>{lead.phone}</TableCell>
                      <TableCell sx={oneLine(220)} title={lead.email}>{lead.email}</TableCell>
                      <TableCell sx={oneLine(120)} title={lead.leadType}>{lead.leadType}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="View details">
                            <IconButton size="small" onClick={() => goDetail(lead)}>
                              <VisibilityOutlinedIcon />
                            </IconButton>
                          </Tooltip>
                          <IconButton onClick={(e) => openMenu(e.currentTarget, lead)}>
                            <MoreVertOutlinedIcon />
                          </IconButton>
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

      {/* Overflow menu (New tab) */}
      <Menu open={Boolean(menuAnchor)} anchorEl={menuAnchor} onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}>
        <MenuItem onClick={startFollowUp}>Add to Follow-ups</MenuItem>
        <Divider />
        <MenuItem onClick={markLost} sx={{ color: "error.main" }}>Mark as Lost</MenuItem>
      </Menu>

      {/* Follow-up dialog */}
      <Dialog open={followDialogOpen} onClose={() => setFollowDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add to Follow-ups</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <TextField label="Reason / Note" multiline minRows={3} value={fuNote} onChange={(e) => setFuNote(e.target.value)} />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <TextField label="Date" type="date" value={fuDate} onChange={(e) => setFuDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label="Time" type="time" value={fuTime} onChange={(e) => setFuTime(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFollowDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveFollowUp} disabled={!fuNote.trim() || !fuDate || !fuTime}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Reschedule dialog */}
      <Dialog open={reschedOpen} onClose={() => setReschedOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Reschedule Follow-up</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <TextField
              label="Reason"
              multiline
              minRows={3}
              value={reschedNote}
              onChange={(e) => setReschedNote(e.target.value)}
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <TextField
                label="Date"
                type="date"
                value={reschedDate}
                onChange={(e) => setReschedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Time"
                type="time"
                value={reschedTime}
                onChange={(e) => setReschedTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReschedOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveReschedule}
            disabled={!reschedNote.trim() || !reschedDate || !reschedTime}
            startIcon={<ScheduleOutlinedIcon />}
          >
            Reschedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign dialog (change stage) */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Assign to Another Department</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <TextField select label="Department" value={assignDept} onChange={(e) => setAssignDept(e.target.value)} SelectProps={{ native: true }} fullWidth>
              <option value="" />
              {DEPARTMENTS.map((d) => (<option key={d} value={d}>{d}</option>))}
            </TextField>
            <TextField label="Reason" multiline minRows={3} value={assignReason} onChange={(e) => setAssignReason(e.target.value)} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveAssign} disabled={!assignDept || !assignReason.trim()}>Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Back dialog */}
      <Dialog open={backOpen} onClose={() => setBackOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Move Back to Previous Stage</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 1 }}>This will move the lead back to <b>New</b>.</Typography>
          <TextField label="Reason" multiline minRows={3} value={backReason} onChange={(e) => setBackReason(e.target.value)} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveBack} disabled={!backReason.trim()}>Move Back</Button>
        </DialogActions>
      </Dialog>

      {/* Add Lead dialog — SINGLE COLUMN with live Country/State/City */}
      <Dialog open={addOpen} onClose={handleCloseAdd} fullWidth maxWidth="sm">
        <DialogTitle>
          Create New Lead
          <Typography variant="body2" color="text.secondary">
            Fill details below. Fields marked * are required.
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 1 }}>
          <Stack spacing={1.25}>
            {/* Lead & Company */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Lead & Company</Typography>
            <TextField
              label="Lead Name *"
              value={form.leadName}
              onChange={(e) => setForm((f) => ({ ...f, leadName: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, leadName: true }))}
              error={touched.leadName && !form.leadName.trim()}
              fullWidth size="small"
            />
            {touched.leadName && !form.leadName.trim() && <FormHelperText error>Lead Name is required.</FormHelperText>}

            <Autocomplete
              freeSolo
              value={form.companyName}
              onChange={(_, v) => setForm((f) => ({ ...f, companyName: v || "" }))}
              onInputChange={(_, v) => setForm((f) => ({ ...f, companyName: v }))}
              options={Array.from(new Set([...newLeads, ...followUps, ...lost].map((l) => l.company))).filter(Boolean)}
              renderInput={(params) => (
                <TextField {...params} label="Company Name *" onBlur={() => setTouched((t) => ({ ...t, companyName: true }))}
                  error={touched.companyName && !form.companyName.trim()} fullWidth size="small" />
              )}
            />
            {touched.companyName && !form.companyName.trim() && <FormHelperText error>Company Name is required.</FormHelperText>}

            <Autocomplete
              freeSolo
              value={form.contactPerson}
              onChange={(_, v) => setForm((f) => ({ ...f, contactPerson: v || "" }))}
              onInputChange={(_, v) => setForm((f) => ({ ...f, contactPerson: v }))}
              options={Array.from(new Set([...newLeads, ...followUps, ...lost].map((l) => l.contact))).filter(Boolean)}
              renderInput={(params) => (
                <TextField {...params} label="Contact Person Name *" onBlur={() => setTouched((t) => ({ ...t, contactPerson: true }))}
                  error={touched.contactPerson && !form.contactPerson.trim()} fullWidth size="small" />
              )}
            />
            {touched.contactPerson && !form.contactPerson.trim() && <FormHelperText error>Contact Person Name is required.</FormHelperText>}

            {/* Contact (Person) */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5 }}>Contact (Person)</Typography>
            <TextField
              label="Contact Person Phone *" value={form.contactPhone}
              onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, contactPhone: true }))}
              error={touched.contactPhone && !form.contactPhone.trim()}
              placeholder="+1 555-555-5555" fullWidth size="small"
            />
            {touched.contactPhone && !form.contactPhone.trim() && <FormHelperText error>Contact phone is required.</FormHelperText>}
            <TextField
              label="Contact Person Email *" type="email" value={form.contactEmail}
              onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, contactEmail: true }))}
              error={touched.contactEmail && !form.contactEmail.trim()}
              placeholder="name@example.com" fullWidth size="small"
            />
            {touched.contactEmail && !form.contactEmail.trim() && <FormHelperText error>Contact email is required.</FormHelperText>}

            {/* Contact (Company) */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5 }}>Contact (Company)</Typography>
            <TextField label="Company Contact Number" value={form.companyPhone} onChange={(e) => setForm((f) => ({ ...f, companyPhone: e.target.value }))} placeholder="+1 555-555-5555" fullWidth size="small" />
            <TextField label="Company Email" type="email" value={form.companyEmail} onChange={(e) => setForm((f) => ({ ...f, companyEmail: e.target.value }))} placeholder="info@company.com" fullWidth size="small" />
            <TextField label="Company Website" value={form.companyWebsite} onChange={(e) => setForm((f) => ({ ...f, companyWebsite: e.target.value }))} placeholder="https://example.com" fullWidth size="small" />

            {/* Address */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5 }}>Address</Typography>
            <TextField label="Address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Street, Area" fullWidth size="small" />

            {/* Country / State / City via FREE API */}
            <Autocomplete
              options={countries}
              loading={loadingCountries}
              value={form.country || null}
              onChange={(_, v) => { setForm((f) => ({ ...f, country: v || "", state: "", city: "" })); }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Country"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingCountries ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  helperText={errorCountries || ""}
                  error={Boolean(errorCountries)}
                />
              )}
            />

            <Autocomplete
              options={states}
              loading={loadingStates}
              value={form.state || null}
              onChange={(_, v) => setForm((f) => ({ ...f, state: v || "", city: "" }))}
              disabled={!form.country || !!errorCountries}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="State"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingStates ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  helperText={errorStates || (!form.country ? "Select country first" : "")}
                  error={Boolean(errorStates)}
                />
              )}
            />

            <Autocomplete
              options={cities}
              loading={loadingCities}
              value={form.city || null}
              onChange={(_, v) => setForm((f) => ({ ...f, city: v || "" }))}
              disabled={!form.country || !form.state || !!errorStates}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="City"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingCities ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  helperText={errorCities || (!form.state ? "Select state first" : "")}
                  error={Boolean(errorCities)}
                />
              )}
            />

            <TextField label="Zip Code" value={form.zip} onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))} fullWidth size="small" />

            {/* Classification */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5 }}>Classification</Typography>
            <TextField
              label="Industry Type"
              value={form.industryType}
              onChange={(e) => setForm((f) => ({ ...f, industryType: e.target.value }))}
              fullWidth size="small"
            />
            <TextField
              label="Lead Requirement *"
              value={form.leadType}
              onChange={(e) => setForm((f) => ({ ...f, leadType: e.target.value }))}
              onBlur={() => setTouched((t) => ({ ...t, leadType: true }))}
              error={touched.leadType && !form.leadType}
              fullWidth size="small"
            />
            {touched.leadType && !form.leadType && <FormHelperText error>Lead Type is required.</FormHelperText>}

            {/* Notes & Attachments */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5 }}>Notes</Typography>
            <TextField label="Notes" multiline minRows={4} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Long text..." fullWidth size="small" />

            {/* <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={handleFilesChosen} />
            <Button variant="outlined" startIcon={<AttachFileOutlinedIcon />} onClick={() => fileInputRef.current?.click()} sx={{ alignSelf: "flex-start" }} size="small">
              Add Attachments
            </Button> */}
            <Stack direction="row" gap={1} flexWrap="wrap">
              {form.attachments.map((f, idx) => (
                <Chip key={idx} label={`${f.name} (${Math.ceil(f.size / 1024)} KB)`} onDelete={() => removeAttachment(idx)} deleteIcon={<CloseOutlinedIcon />} variant="outlined" sx={{ maxWidth: "100%" }} />
              ))}
            </Stack>

            {formError && <Typography color="error" variant="body2">{formError}</Typography>}
            {/* <FormHelperText>Multiple files supported.</FormHelperText> */}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ gap: 1 }}>
          <Button onClick={handleCloseAdd}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveLead}
            disabled={
              !form.leadName.trim() ||
              !form.companyName.trim() ||
              !form.contactPerson.trim() ||
              !form.contactPhone.trim() ||
              !form.contactEmail.trim() ||
              !form.leadType
            }
          >
            Save Lead
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
