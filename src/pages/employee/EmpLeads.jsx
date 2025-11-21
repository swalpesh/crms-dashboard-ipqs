// src/pages/marketing/FieldLeads.jsx
import {
  Box,
  Paper,
  Stack,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Grid,
  Avatar,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  GlobalStyles,
  useTheme,
  useMediaQuery,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { useMemo, useRef, useState } from "react";

/* ----------------------------- helpers ----------------------------- */

const fmtMoney = (n, cur) => `${cur} ${Number(n || 0).toLocaleString("en-IN")}`;
const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

const ORDER = ["contacted", "notContacted", "closed", "lost"];
const COLUMNS = {
  contacted: { title: "Contacted", dot: "#f59e0b", bar: "#f59e0b" },
  notContacted: { title: "Not Contacted", dot: "#3b82f6", bar: "#3b82f6" },
  closed: { title: "Closed", dot: "#16a34a", bar: "#16a34a" },
  lost: { title: "Lost", dot: "#ef4444", bar: "#ef4444" },
};

/* ------------------------------ page ------------------------------- */

export default function FieldLeads() {
  const theme = useTheme();
  // Use table view on tablets/phones (<= lg)
  const compact = useMediaQuery(theme.breakpoints.down("lg"));

  // Seed data
  const [cols, setCols] = useState({
    contacted: [
      {
        id: "L-101",
        name: "Schumm",
        company: "Acme Co.",
        currency: "₹",
        value: 3050000,
        email: "darleeo@example.com",
        phone: "+1 12445-47878",
        location: "Newyork, United States",
        engagementType: "Organization",
        industry: "Manufacturing",
        assignedTo: "Kiran V.",
      },
      {
        id: "L-105",
        name: "Collins",
        company: "Pied Piper",
        currency: "₹",
        value: 2100000,
        email: "collins@example.com",
        phone: "+91 98333-12345",
        location: "Mumbai, India",
        engagementType: "Organization",
        industry: "Software",
        assignedTo: "Team A",
      },
    ],
    notContacted: [
      {
        id: "L-106",
        name: "Adams",
        company: "Northwind",
        currency: "$",
        value: 2450002,
        email: "vaughan12@example.com",
        phone: "+1 17392-27846",
        location: "London, United Kingdom",
        engagementType: "In-person",
        industry: "Services",
        assignedTo: "Ritu B.",
      },
    ],
    closed: [
      {
        id: "L-102",
        name: "Wizosk",
        company: "Hooli",
        currency: "$",
        value: 1170000,
        email: "wizosk@example.com",
        phone: "+1 14422-22222",
        location: "Paris, France",
        engagementType: "Organization",
        industry: "Retail",
        assignedTo: "Me",
      },
      {
        id: "L-107",
        name: "Walter",
        company: "Initrode",
        currency: "$",
        value: 3953859,
        email: "walter@example.com",
        phone: "+1 11223-34455",
        location: "Austin, United States",
        engagementType: "Organization",
        industry: "Hardware",
        assignedTo: "Ops",
      },
    ],
    lost: [
      {
        id: "L-104",
        name: "Steve",
        company: "Initech",
        currency: "$",
        value: 1489543,
        email: "sidney@example.com",
        phone: "+1 11739-38135",
        location: "Manchester, United Kingdom",
        engagementType: "In-person",
        industry: "Retail",
        assignedTo: "Me",
      },
    ],
  });

  // TOTAL (all leads)
  const totalLeads = useMemo(
    () => Object.values(cols).reduce((acc, arr) => acc + arr.length, 0),
    [cols]
  );

  // search
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    if (!query.trim()) return cols;
    const q = query.toLowerCase();
    const out = {};
    for (const k of Object.keys(cols)) {
      out[k] = cols[k].filter((l) =>
        [l.id, l.name, l.company, l.email, l.phone, l.location, l.industry, l.assignedTo]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    return out;
  }, [cols, query]);

  const totals = useMemo(() => {
    const t = {};
    Object.keys(filtered).forEach((k) => {
      const leads = filtered[k];
      t[k] = {
        count: leads.length,
        sum: leads.reduce((acc, l) => acc + (Number(l.value) || 0), 0),
        cur: leads[0]?.currency || "₹",
      };
    });
    return t;
  }, [filtered]);

  /* ---------------------------- Drag & Drop ---------------------------- */

  const dragRef = useRef(null); // { id, fromCol }
  const [draggingId, setDraggingId] = useState(null);
  const [highlight, setHighlight] = useState("");

  const onDragStart = (id, fromCol) => (e) => {
    dragRef.current = { id, fromCol };
    setDraggingId(id);
    if (e.dataTransfer?.setDragImage) {
      const img = new Image();
      img.src =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4=";
      e.dataTransfer.setDragImage(img, 0, 0);
      e.dataTransfer.dropEffect = "move";
      e.dataTransfer.effectAllowed = "move";
    }
  };
  const onDragEnd = () => {
    setDraggingId(null);
    setHighlight("");
    dragRef.current = null;
  };

  const [confirm, setConfirm] = useState(null); // {id, fromCol, toCol}
  const applyMove = ({ id, fromCol, toCol }) => {
    setCols((prev) => {
      const from = prev[fromCol] || [];
      const to = prev[toCol] || [];
      const idx = from.findIndex((l) => l.id === id);
      if (idx === -1) return prev;
      const moved = from[idx];
      const newFrom = [...from.slice(0, idx), ...from.slice(idx + 1)];
      const newTo = [...to, moved];
      return { ...prev, [fromCol]: newFrom, [toCol]: newTo };
    });
  };

  const onDropTo = (toCol) => (e) => {
    e.preventDefault();
    setHighlight("");
    const info = dragRef.current;
    if (!info) return;
    const { id, fromCol } = info;
    if (fromCol === toCol) return onDragEnd();

    const fromIdx = ORDER.indexOf(fromCol);
    const toIdx = ORDER.indexOf(toCol);

    if (toIdx < fromIdx) {
      setConfirm({ id, fromCol, toCol });
    } else {
      applyMove({ id, fromCol, toCol });
    }
    onDragEnd();
  };

  /* ------------------------------ Add Lead ------------------------------ */

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    engagementType: "Organization",
    company: "",
    currency: "₹",
    industry: "",
    leadType: "contacted",
    assignedTo: "",
    notes: "",
    attachment: null,
    value: "",
    email: "",
    phone: "",
    location: "",
  });

  const saveLead = () => {
    const id = "L-" + Math.floor(Math.random() * 100000);
    setCols((prev) => {
      const list = prev[form.leadType] ?? [];
      return {
        ...prev,
        [form.leadType]: [
          ...list,
          {
            id,
            name: form.name || "New Lead",
            company: form.company || "",
            currency: form.currency || "₹",
            value: Number(form.value) || 0,
            email: form.email || "",
            phone: form.phone || "",
            location: form.location || "",
            engagementType: form.engagementType,
            industry: form.industry || "",
            assignedTo: form.assignedTo || "",
            notes: form.notes || "",
            attachment: form.attachment?.name || "",
          },
        ],
      };
    });
    setOpen(false);
    setForm({
      name: "",
      engagementType: "Organization",
      company: "",
      currency: "₹",
      industry: "",
      leadType: "contacted",
      assignedTo: "",
      notes: "",
      attachment: null,
      value: "",
      email: "",
      phone: "",
      location: "",
    });
  };

  /* --------------------------- Table utilities -------------------------- */

  const flatLeads = useMemo(() => {
    const out = [];
    for (const col of ORDER) {
      for (const l of filtered[col] || []) {
        out.push({ ...l, colKey: col });
      }
    }
    return out;
  }, [filtered]);

  const moveNext = (row) => {
    const fromCol = row.colKey;
    const fromIdx = ORDER.indexOf(fromCol);
    if (fromIdx === ORDER.length - 1) return;
    const toCol = ORDER[fromIdx + 1];
    applyMove({ id: row.id, fromCol, toCol });
  };
  const movePrev = (row) => {
    const fromCol = row.colKey;
    const fromIdx = ORDER.indexOf(fromCol);
    if (fromIdx === 0) return;
    const toCol = ORDER[fromIdx - 1];
    setConfirm({ id: row.id, fromCol, toCol });
  };

  /* ------------------------------- UI ------------------------------- */

  return (
    <Box>
      {/* global font/rounding tweaks (modern look) */}
      <GlobalStyles
        styles={{
          ":root": { "--radius-card": "16px" },
          body: {
            fontFamily:
              'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
          },
        }}
      />

      {/* Heading + total */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1.5 }}
      >
        <Stack direction="row" spacing={1.25} alignItems="baseline">
          <Typography
            fontWeight={800}
            sx={{
              fontSize: { xs: 22, sm: 24 }, // smaller heading as requested
              lineHeight: 1.25,
            }}
          >
            Leads
          </Typography>
          <Chip size="small" label={`${totalLeads} total`} sx={{ fontWeight: 700 }} />
        </Stack>

        {!compact && (
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setOpen(true)}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Add Lead
          </Button>
        )}
      </Stack>

      {/* Top bar (search + add on compact) */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <TextField
          placeholder="Search leads"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          size="small"
          fullWidth
          sx={{ maxWidth: 520, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        {compact && (
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setOpen(true)}
            sx={{ borderRadius: 2, fontWeight: 700, alignSelf: { xs: "flex-end", sm: "auto" } }}
          >
            Add Lead
          </Button>
        )}
      </Stack>

      {/* Views */}
      {compact ? (
        // ---------- TABLE VIEW (tablet/phone) ----------
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
          <TableContainer>
            <Table size="medium" sx={{ "& th": { bgcolor: "#fafafa" } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Stage</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Lead</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Company</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Budget</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {flatLeads.map((row) => {
                  const meta = COLUMNS[row.colKey];
                  const fromIdx = ORDER.indexOf(row.colKey);
                  return (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: meta.dot,
                            }}
                          />
                          <Typography variant="body2" fontWeight={700}>
                            {meta.title}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          <Avatar sx={{ width: 36, height: 36 }}>{initials(row.name)}</Avatar>
                          <Box>
                            <Typography fontWeight={700} sx={{ lineHeight: 1.1 }}>
                              {row.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {row.industry || "—"}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>{row.company || "—"}</TableCell>
                      <TableCell>
                        {row.value ? (
                          <Chip
                            size="small"
                            label={fmtMoney(row.value, row.currency)}
                            sx={{ fontWeight: 700 }}
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.25}>
                          {row.email && (
                            <Typography variant="body2" sx={{ display: "block" }}>
                              {row.email}
                            </Typography>
                          )}
                          {row.phone && (
                            <Typography variant="caption" color="text.secondary">
                              {row.phone}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => movePrev(row)}
                            disabled={fromIdx === 0}
                            sx={{ borderRadius: 2 }}
                          >
                            Prev
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => moveNext(row)}
                            disabled={fromIdx === ORDER.length - 1}
                            sx={{ borderRadius: 2 }}
                          >
                            Next
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {flatLeads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 6, textAlign: "center" }}>
                      <Typography color="text.secondary">No leads found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        // ---------- BOARD VIEW (desktop, drag & drop) ----------
        <Grid container spacing={2.5}>
          {ORDER.map((key) => {
            const meta = COLUMNS[key];
            const list = filtered[key] || [];
            const stat = totals[key] || { count: 0, sum: 0, cur: "₹" };
            const isHighlight = highlight === key;

            return (
              <Grid key={key} item xs={12} md={6} lg={3}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: isHighlight ? "primary.main" : "divider",
                    transition: "border-color .15s ease",
                    p: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  {/* Column header */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack spacing={0.25}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: meta.dot }} />
                        <Typography variant="h6" fontWeight={800}>
                          {meta.title}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                        {stat.count} Leads • {fmtMoney(stat.sum, stat.cur)}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Add lead to this stage">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setOpen(true);
                            setForm((f) => ({ ...f, leadType: key }));
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <IconButton size="small">
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>

                  {/* Drop zone */}
                  <Box
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={() => setHighlight(key)}
                    onDrop={onDropTo(key)}
                    sx={{ mt: 2, display: "grid", gap: 2, minHeight: 24 }}
                  >
                    {list.map((lead) => (
                      <Paper
                        key={lead.id}
                        elevation={0}
                        draggable
                        onDragStart={onDragStart(lead.id, key)}
                        onDragEnd={onDragEnd}
                        sx={{
                          p: 2,
                          borderRadius: "var(--radius-card)",
                          border: "1px solid",
                          borderColor: "divider",
                          cursor: "grab",
                          opacity: draggingId === lead.id ? 0.6 : 1,
                          transition:
                            "opacity .15s ease, box-shadow .15s ease, transform .12s ease",
                          "&:hover": { boxShadow: 2, transform: "translateY(-1px)" },
                        }}
                      >
                        <Box sx={{ height: 4, bgcolor: meta.bar, borderRadius: 99, mb: 1.25 }} />

                        <Stack direction="row" spacing={1.25} alignItems="center">
                          <Avatar sx={{ width: 40, height: 40 }}>{initials(lead.name)}</Avatar>
                          <Box>
                            <Typography fontWeight={700} sx={{ lineHeight: 1.1 }}>
                              {lead.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.1 }}>
                              {lead.company || "—"}
                            </Typography>
                          </Box>
                        </Stack>

                        <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                          {lead.value ? (
                            <Stack direction="row" spacing={1.25} alignItems="center">
                              <Typography variant="body2" color="text.secondary">
                                Budget
                              </Typography>
                              <Chip
                                size="small"
                                label={fmtMoney(lead.value, lead.currency)}
                                sx={{ fontWeight: 700 }}
                              />
                            </Stack>
                          ) : null}

                          {lead.email && (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <EmailOutlinedIcon fontSize="small" />
                              <Typography variant="body2">{lead.email}</Typography>
                            </Stack>
                          )}
                          {lead.phone && (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <LocalPhoneOutlinedIcon fontSize="small" />
                              <Typography variant="body2">{lead.phone}</Typography>
                            </Stack>
                          )}
                          {lead.location && (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <PlaceOutlinedIcon fontSize="small" />
                              <Typography variant="body2">{lead.location}</Typography>
                            </Stack>
                          )}
                        </Stack>

                        <Divider sx={{ my: 1 }} />
                        <Stack direction="row" spacing={1.25} justifyContent="flex-end">
                          <Tooltip title="Trigger">
                            <IconButton size="small">
                              <BoltOutlinedIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Copy link">
                            <IconButton size="small">
                              <LinkOutlinedIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Share">
                            <IconButton size="small">
                              <ShareOutlinedIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Paper>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Confirm move back dialog */}
      <Dialog open={Boolean(confirm)} onClose={() => setConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Move lead back?</DialogTitle>
        <DialogContent dividers sx={{ pb: 1 }}>
          <Typography>
            Are you sure you want to move this lead to a <strong>previous stage</strong>?
          </Typography>
          {confirm && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {COLUMNS[confirm.fromCol].title} → {COLUMNS[confirm.toCol].title}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirm(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (confirm) applyMove(confirm);
              setConfirm(null);
            }}
          >
            Move Back
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add / Create Lead (structured) */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Add Lead</DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant="overline" sx={{ letterSpacing: 0.6 }}>
            Lead Info
          </Typography>
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid item xs={12} md={7}>
              <TextField
                label="Lead Name"
                fullWidth
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                select
                label="Engagement Type"
                fullWidth
                value={form.engagementType}
                onChange={(e) => setForm((f) => ({ ...f, engagementType: e.target.value }))}
              >
                <MenuItem value="Organization">Organization</MenuItem>
                <MenuItem value="In-person">In-person</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Typography variant="overline" sx={{ letterSpacing: 0.6 }}>
            Company & Deal
          </Typography>
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Company Name"
                fullWidth
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                select
                label="Currency"
                fullWidth
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              >
                {["₹", "$", "€", "£"].map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                label="Deal Value"
                type="number"
                fullWidth
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">{form.currency}</InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Industry"
                fullWidth
                value={form.industry}
                onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
              >
                {["Software", "Manufacturing", "Retail", "Services", "Other"].map((i) => (
                  <MenuItem key={i} value={i}>
                    {i}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Lead Stage (Column)"
                fullWidth
                value={form.leadType}
                onChange={(e) => setForm((f) => ({ ...f, leadType: e.target.value }))}
              >
                <MenuItem value="contacted">Contacted</MenuItem>
                <MenuItem value="notContacted">Not Contacted</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Typography variant="overline" sx={{ letterSpacing: 0.6 }}>
            Contact
          </Typography>
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                fullWidth
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Phone"
                fullWidth
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Location"
                fullWidth
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </Grid>
          </Grid>

          <Typography variant="overline" sx={{ letterSpacing: 0.6 }}>
            Assignment
          </Typography>
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Assigned Person"
                fullWidth
                value={form.assignedTo}
                onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Attachment"
                type="file"
                fullWidth
                InputLabelProps={{ shrink: true }}
                onChange={(e) =>
                  setForm((f) => ({ ...f, attachment: e.target.files?.[0] || null }))
                }
              />
            </Grid>
          </Grid>

          <Typography variant="overline" sx={{ letterSpacing: 0.6 }}>
            Notes
          </Typography>
          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={3}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveLead}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
