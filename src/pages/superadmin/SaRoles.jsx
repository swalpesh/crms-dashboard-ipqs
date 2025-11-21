// src/pages/superadmin/SaRoles.jsx
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

/* ------------------------------ utils ------------------------------ */
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
    item?.code ||
    item?.slug ||
    item?._id ||
    item?.department_name?.replace(/\s+/g, "") ||
    item?.name?.replace(/\s+/g, "") ||
    "";
  const name = item?.department_name || item?.name || String(id);
  return { id: String(id), name: String(name) };
}

function normalizeRole(item) {
  const id =
    item?.id ||
    item?.role_id ||
    item?.roleId ||
    item?._id ||
    item?.code ||
    item?.role_name?.replace(/\s+/g, "") ||
    item?.name?.replace(/\s+/g, "") ||
    "";

  const name = item?.role_name || item?.name || String(id);
  const department_id =
    item?.department_id ||
    item?.dept_id ||
    item?.departmentId ||
    item?.department?.id ||
    item?.department?.department_id ||
    item?.department?.code ||
    "";

  const status =
    (item?.status || "active").toLowerCase() === "inactive" ? "inactive" : "active";

  const createdAtRaw =
    item?.createdAt || item?.created_at || item?.created_on || item?.timestamp;
  const createdAt = createdAtRaw
    ? new Date(createdAtRaw).toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return { id: String(id), name: String(name), department_id: String(department_id || ""), status, createdAt };
}

/* ------------------------------ component ------------------------------ */
export default function SaRoles() {
  /* data */
  const [departments, setDepartments] = useState([]); // [{id, name}]
  const [deptMap, setDeptMap] = useState({}); // id -> name
  const [rows, setRows] = useState([]); // roles
  const [loading, setLoading] = useState(true);

  /* search */
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const deptName = deptMap[r.department_id] || r.department_id || "";
      return (
        r.id.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        (deptName.toLowerCase().includes(q)) ||
        (r.status || "").toLowerCase().includes(q) ||
        (r.createdAt || "").toLowerCase().includes(q)
      );
    });
  }, [rows, query, deptMap]);

  /* notifications */
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  /* menus & persistent targets */
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRow, setMenuRow] = useState(null); // row whose menu is open
  const menuOpen = Boolean(menuAnchor);
  const handleOpenMenu = (e, row) => {
    setMenuAnchor(e.currentTarget);
    setMenuRow(row);
  };
  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  /* create/edit dialog */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState(null); // if null -> create mode
  const [form, setForm] = useState({
    name: "",
    department_id: "",
    status: "active",
  });
  const [saving, setSaving] = useState(false);

  /* delete dialog */
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState(null);

  /* initial load: departments then roles (can be parallel, but we want deptMap ready) */
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setLoading(true);

        const [deptRes, rolesRes] = await Promise.all([
          apiFetch("/api/v1/departments", { method: "GET" }),
          apiFetch("/api/v1/roles", { method: "GET" }),
        ]);

        // Departments
        const deptList = Array.isArray(deptRes) ? deptRes : deptRes?.data || [];
        const depts = deptList.map(normalizeDepartment);
        const dMap = depts.reduce((acc, d) => {
          acc[d.id] = d.name;
          return acc;
        }, {});
        if (!ignore) {
          setDepartments(depts);
          setDeptMap(dMap);
        }

        // Roles
        const roleList = Array.isArray(rolesRes) ? rolesRes : rolesRes?.data || [];
        const mappedRoles = roleList.map(normalizeRole);
        if (!ignore) setRows(mappedRoles);
      } catch (err) {
        if (!ignore) {
          setSnack({ open: true, msg: err.message, severity: "error" });
          setRows([]);
          setDepartments([]);
          setDeptMap({});
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  /* open dialogs */
  const openCreate = () => {
    setEditRow(null);
    setForm({ name: "", department_id: "", status: "active" });
    setDialogOpen(true);
  };

  const openEdit = () => {
    if (!menuRow) return;
    setEditRow(menuRow); // persist row for PATCH
    setForm({
      name: menuRow.name,
      department_id: menuRow.department_id || "",
      status: menuRow.status || "active",
    });
    setDialogOpen(true);
    handleCloseMenu();
  };

  const confirmDelete = () => {
    if (!menuRow) return;
    setDeleteRow(menuRow);
    setDeleteOpen(true);
    handleCloseMenu();
  };

  /* save (create or edit) */
  const saveRole = async () => {
    const role_name = form.name?.trim();
    const department_id = form.department_id?.trim();
    const status = form.status || "active";

    if (!role_name) {
      setSnack({ open: true, msg: "Role name is required", severity: "warning" });
      return;
    }
    if (!editRow && !department_id) {
      setSnack({ open: true, msg: "Please select a department", severity: "warning" });
      return;
    }

    try {
      setSaving(true);

      if (editRow) {
        // EDIT (PATCH /roles/:id)
        const id = editRow.id;
        await apiFetch(`/api/v1/roles/${encodeURIComponent(id)}`, {
          method: "PATCH",
          body: JSON.stringify({ role_name, status }),
        });

        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, name: role_name, status } : r))
        );
        setSnack({ open: true, msg: "Role updated", severity: "success" });
      } else {
        // CREATE (POST /roles)
        const created = await apiFetch("/api/v1/roles", {
          method: "POST",
          body: JSON.stringify({ role_name, department_id, status }),
        });

        const payload = Array.isArray(created) ? created[0] : created?.data || created;
        const newItem = normalizeRole(
          payload?.id || payload?.role_name ? payload : { role_name, department_id, status }
        );
        if (!newItem.id) newItem.id = role_name.replace(/\s+/g, "");
        if (!newItem.department_id) newItem.department_id = department_id;

        setRows((prev) => [...prev, newItem]);
        setSnack({ open: true, msg: "Role created", severity: "success" });
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
  const doDelete = async () => {
    if (!deleteRow) {
      setDeleteOpen(false);
      return;
    }
    try {
      const id = deleteRow.id;
      await apiFetch(`/api/v1/roles/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setRows((prev) => prev.filter((r) => r.id !== id));
      setSnack({ open: true, msg: "Role deleted", severity: "success" });
    } catch (err) {
      setSnack({ open: true, msg: err.message, severity: "error" });
    } finally {
      setDeleteOpen(false);
      setDeleteRow(null);
    }
  };

  /* table helpers */
  const departmentNameOf = (deptId) => deptMap[deptId] || deptId || "";

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={800}>
          Roles
        </Typography>
        <Chip label={rows.length} size="small" sx={{ fontWeight: 700, bgcolor: "#f3f4f6" }} />
      </Stack>

      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        {/* Toolbar */}
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
            placeholder="Search roles…"
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
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={openCreate}
            sx={{ borderRadius: 2 }}
          >
            Add New Role
          </Button>
        </Stack>

        {/* Table / Loader */}
        <Box sx={{ overflowX: "auto", position: "relative", minHeight: 200 }}>
          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                Loading roles…
              </Typography>
            </Stack>
          ) : (
            <Table sx={{ minWidth: 900, "& th": { fontWeight: 700, color: "text.secondary" } }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox color="primary" />
                  </TableCell>
                  <TableCell>Role ID</TableCell>
                  <TableCell>Role Name</TableCell>
                  <TableCell>Assigned Department</TableCell>
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
                    <TableCell>{departmentNameOf(row.department_id)}</TableCell>
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
                    <TableCell colSpan={7} sx={{ py: 6, textAlign: "center" }}>
                      <Typography color="text.secondary">No roles found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Box>
      </Paper>

      {/* Row actions */}
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
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditRow(null); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {editRow ? "Edit Role" : "Add New Role"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              autoFocus
              fullWidth
              label="Role Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />

            {/* Department: required on create, shown but disabled on edit (per API spec) */}
            <FormControl fullWidth disabled={!!editRow}>
              <InputLabel id="dept-label">Assign Department</InputLabel>
              <Select
                labelId="dept-label"
                label="Assign Department"
                value={form.department_id}
                onChange={(e) => setForm((f) => ({ ...f, department_id: e.target.value }))}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                label="Status"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
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
          <Button variant="contained" onClick={saveRole} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Delete Role</DialogTitle>
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
