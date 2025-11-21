// src/pages/superadmin/SaDepartments.jsx
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

/* --- utils --- */
function getAuthToken() {
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
}

async function apiFetch(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `Request failed (${res.status})`);
  }
  return data;
}

function normalizeDepartment(item) {
  const id =
    item?.id ||
    item?.department_id ||
    item?.departmentId ||
    item?.dept_id ||
    item?.slug ||
    item?._id ||
    item?.code ||
    item?.name?.replace(/\s+/g, "") ||
    item?.department_name?.replace(/\s+/g, "") ||
    "";

  const name = item?.department_name || item?.name || String(id) || "";
  const status = (item?.status || "active").toLowerCase() === "inactive" ? "inactive" : "active";
  const createdAtRaw =
    item?.createdAt || item?.created_at || item?.created_on || item?.created || item?.timestamp;

  const createdAt = createdAtRaw
    ? new Date(createdAtRaw).toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return { id: String(id), name: String(name), status, createdAt };
}

export default function SaDepartments() {
  /* data */
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  /* search */
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const created = (r.createdAt || "").toLowerCase();
      const status = (r.status || "").toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        status.includes(q) ||
        created.includes(q)
      );
    });
  }, [rows, query]);

  /* menus & targets */
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const menuOpen = Boolean(menuAnchor);

  const handleOpenMenu = (e, row) => {
    setMenuAnchor(e.currentTarget);
    setMenuRow(row);
  };
  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  /* edit dialog state */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState(null); // <-- the row being edited
  const [form, setForm] = useState({ name: "", status: "active" });
  const [saving, setSaving] = useState(false);

  /* delete confirm dialog state */
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState(null); // <-- the row being deleted

  /* notifications */
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  /* initial fetch */
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/api/v1/departments", { method: "GET" });
        const list = Array.isArray(data) ? data : data?.data || [];
        const mapped = list.map(normalizeDepartment);
        if (!ignore) setRows(mapped);
      } catch (err) {
        if (!ignore) {
          setSnack({ open: true, msg: err.message, severity: "error" });
          setRows([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  /* create */
  const openCreate = () => {
    setEditRow(null);
    setForm({ name: "", status: "active" });
    setDialogOpen(true);
  };

  /* edit */
  const openEdit = () => {
    if (!menuRow) return;
    setEditRow(menuRow); // persist the target row for saving
    setForm({ name: menuRow.name, status: menuRow.status || "active" });
    setDialogOpen(true);
    handleCloseMenu(); // DO NOT clear editRow here
  };

  const saveDepartment = async () => {
    const name = form.name?.trim();
    const status = form.status || "active";
    if (!name) {
      setSnack({ open: true, msg: "Department name is required", severity: "warning" });
      return;
    }

    try {
      setSaving(true);

      if (editRow) {
        // EDIT (PATCH /departments/:id)
        const id = editRow.id; // e.g., "Field"
        await apiFetch(`/api/v1/departments/${encodeURIComponent(id)}`, {
          method: "PATCH",
          body: JSON.stringify({
            department_name: name,
            status,
          }),
        });

        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, name, status } : r))
        );
        setSnack({ open: true, msg: "Department updated", severity: "success" });
      } else {
        // CREATE (POST /departments)
        const created = await apiFetch("/api/v1/departments", {
          method: "POST",
          body: JSON.stringify({
            department_name: name,
            status,
          }),
        });

        const payload = Array.isArray(created) ? created[0] : created?.data || created;
        const newItem = normalizeDepartment(
          payload?.id || payload?.department_name ? payload : { department_name: name, status }
        );
        if (!newItem.id) newItem.id = name.replace(/\s+/g, "");
        if (!newItem.createdAt) {
          newItem.createdAt = new Date().toLocaleString(undefined, {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        }
        setRows((prev) => [...prev, newItem]);
        setSnack({ open: true, msg: "Department created", severity: "success" });
      }

      setDialogOpen(false);
      setEditRow(null);
    } catch (err) {
      setSnack({ open: true, msg: err.message, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  /* delete */
  const confirmDelete = () => {
    if (!menuRow) return;
    setDeleteRow(menuRow); // persist target
    setDeleteOpen(true);
    handleCloseMenu(); // DO NOT clear deleteRow here
  };

  const doDelete = async () => {
    if (!deleteRow) {
      setDeleteOpen(false);
      return;
    }
    try {
      const id = deleteRow.id; // e.g., "Field"
      await apiFetch(`/api/v1/departments/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setRows((prev) => prev.filter((r) => r.id !== id));
      setSnack({ open: true, msg: "Department deleted", severity: "success" });
    } catch (err) {
      setSnack({ open: true, msg: err.message, severity: "error" });
    } finally {
      setDeleteOpen(false);
      setDeleteRow(null);
    }
  };

  return (
    <Box>
      {/* Title & toolbar */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={800}>
          Departments
        </Typography>
        <Chip label={rows.length} size="small" sx={{ fontWeight: 700, bgcolor: "#f3f4f6" }} />
      </Stack>

      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        {/* Top controls */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            size="medium"
            sx={{ maxWidth: 360 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              onClick={openCreate}
              sx={{ borderRadius: 2 }}
            >
              Add New Department
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 1.5 }} />

        {/* Table */}
        <Box sx={{ overflowX: "auto", position: "relative", minHeight: 200 }}>
          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                Loading departments…
              </Typography>
            </Stack>
          ) : (
            <Table
              sx={{
                minWidth: 900,
                "& th": { fontWeight: 700, color: "text.secondary" },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox color="primary" />
                  </TableCell>
                  <TableCell>Department ID</TableCell>
                  <TableCell>Department Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id} hover sx={{ "& td": { borderColor: "divider" } }}>
                    <TableCell padding="checkbox">
                      <Checkbox color="primary" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{row.id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status === "inactive" ? "Inactive" : "Active"}
                        size="small"
                        color={row.status === "inactive" ? "default" : "success"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{row.createdAt}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={(e) => handleOpenMenu(e, row)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 6, textAlign: "center" }}>
                      <Typography color="text.secondary">No departments found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Box>
      </Paper>

      {/* Row actions menu */}
      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={openEdit}>
          <EditOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={confirmDelete} sx={{ color: "error.main" }}>
          <DeleteOutlineOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {editRow ? "Edit Department" : "Add New Department"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              autoFocus
              fullWidth
              label="Department Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel id="dept-status-label">Status</InputLabel>
              <Select
                labelId="dept-status-label"
                label="Status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); setEditRow(null); }} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={saveDepartment} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Delete Department</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{deleteRow?.name || deleteRow?.id}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={doDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
