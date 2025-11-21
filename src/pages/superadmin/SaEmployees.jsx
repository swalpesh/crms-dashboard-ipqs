// src/pages/superadmin/SaEmployees.jsx
import {
  Box,
  Paper,
  Button,
  Stack,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Typography,
} from "@mui/material";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { useMemo, useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

export default function SaEmployees() {
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({});
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoCache, setPhotoCache] = useState({}); // employee_id -> blob URL
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("auth_token");
  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const toDateOnly = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");

  // --------- Fetchers ----------
  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchLocations();
    return () => {
      // revoke blob urls on unmount
      Object.values(photoCache).forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API}/api/v1/employees`, authHeaders());
      const employees = res.data?.data || [];
      setRows(employees);
      employees.forEach((emp) => {
        if (emp.has_photo) fetchPhoto(emp.employee_id);
      });
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  };

  const fetchPhoto = async (id) => {
    try {
      const res = await axios.get(`${API}/api/v1/employees/${id}/photo`, {
        ...authHeaders(),
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      setPhotoCache((prev) => ({ ...prev, [id]: url }));
    } catch (err) {
      console.error("Failed to fetch photo", id, err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API}/api/v1/departments`, authHeaders());
      setDepartments(res.data?.data || []);
    } catch {}
  };

  const fetchRoles = async (deptId) => {
    if (!deptId) {
      setRoles([]);
      return;
    }
    try {
      const res = await axios.get(
        `${API}/api/v1/roles/departments/${deptId}/roles`,
        authHeaders()
      );
      setRoles(res.data?.data || []);
    } catch {}
  };

  const fetchLocations = async () => {
    try {
      // Simple free cities list for India
      const res = await axios.get(
        "https://countriesnow.space/api/v0.1/countries/cities",
        { params: { country: "India" } }
      );
      setLocations(res.data?.data || []);
    } catch {}
  };

  // --------- Table helpers ----------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [
        r.employee_id,
        r.first_name,
        r.last_name,
        r.email,
        r.department_name,
        r.role_name,
        r.location,
        r.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

  // --------- Menu ----------
  const openMenu = Boolean(anchorEl);
  const handleOpenMenu = (e, row) => {
    setAnchorEl(e.currentTarget);
    setActiveRow(row);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveRow(null);
  };

  // --------- Form helpers ----------
  const emptyForm = {
    employee_id: "",
    first_name: "",
    last_name: "",
    email: "",
    dob: "",
    contact_number: "",
    address: "",
    username: "",
    password: "",
    confirm_password: "",
    department_id: "",
    role_id: "",
    location: "",
    status: "active",
    photo: "",
  };

  const openCreate = () => {
    setIsEdit(false);
    setForm(emptyForm);
    setPhotoPreview("");
    setDialogOpen(true);
  };

  // Guarantee the employee location is present in options
  const ensureLocationOption = (loc) => {
    if (!loc) return;
    setLocations((prev) => (prev.includes(loc) ? prev : [...prev, loc]));
  };

  const openEdit = async () => {
    if (!activeRow) return;
    setIsEdit(true);
    try {
      const res = await axios.get(
        `${API}/api/v1/employees/${activeRow.employee_id}`,
        authHeaders()
      );
      const emp = res.data?.data;
      await fetchRoles(emp.department_id);
      ensureLocationOption(emp.location); // ✅ make sure value is in <Select> list

      setForm({
        employee_id: emp.employee_id,
        first_name: emp.first_name || "",
        last_name: emp.last_name || "",
        email: emp.email || "",
        dob: emp.dob ? toDateOnly(emp.dob) : "",
        contact_number: emp.contact_number || "",
        address: emp.address || "",
        username: emp.username || "",
        password: "",
        confirm_password: "",
        department_id: emp.department_id || "",
        role_id: emp.role_id || "",
        location: emp.location || "",
        status: emp.status || "inactive",
        photo: "",
      });

      if (emp.has_photo) {
        await fetchPhoto(emp.employee_id);
        setPhotoPreview((p) => photoCache[emp.employee_id] || p || "");
      } else {
        setPhotoPreview("");
      }

      setDialogOpen(true);
    } catch (err) {
      console.error("Failed to fetch employee", err);
    }
    handleCloseMenu();
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, photo: file }));
    setPhotoPreview(URL.createObjectURL(file));
  };

  const saveEmployee = async () => {
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v);
      });

      if (isEdit) {
        await axios.patch(
          `${API}/api/v1/employees/${form.employee_id}`,
          fd,
          authHeaders()
        );
      } else {
        await axios.post(`${API}/api/v1/employees`, fd, authHeaders());
      }
      setDialogOpen(false);
      fetchEmployees();
    } catch (err) {
      console.error("Save failed:", err.response?.data || err);
    }
  };

  const deleteRow = async () => {
    if (!activeRow) return;
    try {
      await axios.delete(
        `${API}/api/v1/employees/${activeRow.employee_id}`,
        authHeaders()
      );
      fetchEmployees();
    } catch (err) {
      console.error("Delete failed", err);
    }
    handleCloseMenu();
  };

  // --------- UI ----------
  return (
    <Box>
      {/* Top bar (title + search + add) */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        spacing={2}
        mb={2}
      >
        <Typography variant="h6">Employees</Typography>
        <TextField
          placeholder="Search Keyword"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ maxWidth: 520 }}
          size="small"
        />
        <Button
          variant="contained"
          color="error"
          startIcon={<AddCircleOutlineIcon />}
          onClick={openCreate}
          sx={{ borderRadius: 2 }}
        >
          Add User
        </Button>
      </Stack>

      {/* Table (matches your screenshot) */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.employee_id} hover>
                  <TableCell>{r.employee_id}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar src={photoCache[r.employee_id]}>
                        {r.first_name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={600}>
                          {r.first_name} {r.last_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {r.department_name} • {r.role_name}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={r.status}
                      sx={{
                        fontWeight: 700,
                        textTransform: "capitalize",
                        bgcolor:
                          r.status === "active"
                            ? "rgba(16,185,129,.12)"
                            : "rgba(239,68,68,.12)",
                        color:
                          r.status === "active" ? "#059669" : "#dc2626",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(r.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => handleOpenMenu(e, r)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No employees found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Row menu */}
      <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}>
        <MenuItem onClick={openEdit}>
          <EditOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={deleteRow} sx={{ color: "error.main" }}>
          <DeleteOutlineOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Add / Edit dialog (matches your form layout) */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{isEdit ? "Edit Employee" : "Add New Employee"}</DialogTitle>
        <DialogContent dividers>
          {/* Identity */}
          <Typography variant="subtitle2" gutterBottom>
            Identity
          </Typography>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Employee ID"
                size="small"
                value={form.employee_id || ""}
                onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))}
                disabled={isEdit}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="First Name"
                size="small"
                value={form.first_name || ""}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Last Name"
                size="small"
                value={form.last_name || ""}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                size="small"
                value={form.email || ""}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={form.dob || ""}
                onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Contact Number"
                size="small"
                value={form.contact_number || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contact_number: e.target.value }))
                }
              />
            </Grid>

            <Grid item xs={12} sm={9}>
              <TextField
                fullWidth
                label="Address"
                size="small"
                value={form.address || ""}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ height: "100%" }}>
                <Avatar src={photoPreview}>{form.first_name?.[0]}</Avatar>
                <Button component="label" color="error" variant="outlined" size="small">
                  Upload Photo
                  <input type="file" hidden accept="image/*" onChange={handlePhoto} />
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {/* Account */}
          <Typography variant="subtitle2" gutterBottom>
            Account
          </Typography>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Username"
                size="small"
                value={form.username || ""}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              />
            </Grid>
            {/* Keep password fields visible but optional (screenshot shows them) */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="password"
                label="Password"
                size="small"
                value={form.password || ""}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="password"
                label="Confirm Password"
                size="small"
                value={form.confirm_password || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, confirm_password: e.target.value }))
                }
              />
            </Grid>
          </Grid>

          {/* Assignment */}
          <Typography variant="subtitle2" gutterBottom>
            Assignment
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  native
                  value={form.department_id || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((f) => ({ ...f, department_id: val, role_id: "" }));
                    fetchRoles(val);
                  }}
                >
                  <option value=""></option>
                  {departments.map((d) => (
                    <option key={d.department_id} value={d.department_id}>
                      {d.department_name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select
                  native
                  value={form.role_id || ""}
                  onChange={(e) => setForm((f) => ({ ...f, role_id: e.target.value }))}
                >
                  <option value=""></option>
                  {roles.map((r) => (
                    <option key={r.role_id} value={r.role_id}>
                      {r.role_name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Location</InputLabel>
                <Select
                  native
                  value={form.location || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                >
                  <option value=""></option>
                  {locations.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  native
                  value={form.status || "active"}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="error">
            Cancel
          </Button>
          <Button variant="contained" onClick={saveEmployee}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
