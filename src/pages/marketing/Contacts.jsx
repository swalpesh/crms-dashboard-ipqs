// src/pages/marketing/Contacts.jsx
import {
  Box,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import IosShareOutlinedIcon from "@mui/icons-material/IosShareOutlined";
import AlternateEmailOutlinedIcon from "@mui/icons-material/AlternateEmailOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";

import { useMemo, useState } from "react";

/* -------------------------------- helpers ------------------------------- */
const initials = (first = "", last = "") =>
  `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

const COMPANY_OPTIONS = [
  "Acme Co.",
  "Initech",
  "Hooli",
  "Globex",
  "Umbrella",
  "Northwind",
  "Stark Industries",
];

const SEED = [
  {
    id: 1,
    firstName: "Darlee",
    lastName: "Robertson",
    designation: "Facility Manager",
    email: "robertson@example.com",
    phone: "1234567890",
    company: "Acme Co.",
    country: "Germany",
    notes: "",
    pic: "https://i.pravatar.cc/100?img=12",
    tags: ["Collab", "VIP"],
  },
  {
    id: 2,
    firstName: "Sharon",
    lastName: "Roy",
    designation: "Installer",
    email: "sharon@example.com",
    phone: "+1 989757485",
    company: "Hooli",
    country: "India",
    notes: "",
    pic: "https://i.pravatar.cc/100?img=15",
    tags: ["Collab", "Rated"],
  },
  {
    id: 3,
    firstName: "Vaughan",
    lastName: "Lewis",
    designation: "Senior Manager",
    email: "vaughan12@example.com",
    phone: "+1 546555455",
    company: "Initech",
    country: "India",
    notes: "",
    pic: "https://i.pravatar.cc/100?img=5",
    tags: ["Collab", "Rated"],
  },
];

/* --------------------------------- card -------------------------------- */
function ContactCard({ c }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: { xs: "0 2px 8px rgba(0,0,0,.04)", sm: "0 10px 24px rgba(0,0,0,.06)" },
        transition: "transform .15s ease, box-shadow .15s ease",
        "&:hover": {
          transform: { sm: "translateY(-2px)" },
          boxShadow: { sm: "0 14px 30px rgba(0,0,0,.08)" },
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Avatar
            src={c.pic}
            alt={`${c.firstName} ${c.lastName}`}
            sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}
          >
            {initials(c.firstName, c.lastName)}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              noWrap
              sx={{
                fontWeight: 800,
                fontSize: { xs: 14.5, sm: 16 },
                lineHeight: 1.2,
              }}
            >
              {c.firstName} {c.lastName}
            </Typography>

            <Stack direction="row" spacing={0.75} alignItems="center" minWidth={0}>
              <WorkOutlineIcon fontSize="inherit" sx={{ opacity: 0.7 }} />
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{ fontSize: { xs: 12.5, sm: 13 } }}
              >
                {c.designation}
              </Typography>
            </Stack>
          </Box>

          <IconButton size="small" sx={{ ml: 0.5 }}>
            <MoreVertOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Details */}
        <Stack spacing={1} sx={{ mt: { xs: 1.25, sm: 2 } }}>
          <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
            <AlternateEmailOutlinedIcon fontSize="small" />
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              title={c.email}
              sx={{ fontSize: { xs: 12.5, sm: 13 } }}
            >
              {c.email}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <LocalPhoneOutlinedIcon fontSize="small" />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: 12.5, sm: 13 } }}
            >
              {c.phone}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
            <PlaceOutlinedIcon fontSize="small" />
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              title={`${c.company}${c.country ? " • " + c.country : ""}`}
              sx={{ fontSize: { xs: 12.5, sm: 13 } }}
            >
              {c.company}
              {c.country ? ` • ${c.country}` : ""}
            </Typography>
          </Stack>
        </Stack>

        {/* Tags */}
        {!!(c.tags && c.tags.length) && (
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ mt: 1.25, flexWrap: "wrap", rowGap: 0.75 }}
          >
            {c.tags.map((t) => (
              <Chip
                key={t}
                size="small"
                label={t}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: 11.5,
                  height: 24,
                  borderColor:
                    t === "VIP" ? "warning.light" : t === "Rated" ? "info.light" : "success.light",
                }}
              />
            ))}
          </Stack>
        )}

        <Divider sx={{ my: { xs: 1.25, sm: 1.75 } }} />

        {/* Quick actions */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: { xs: 0.5, sm: 0 } }}
        >
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Email">
              <IconButton size="small">
                <AlternateEmailOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Call">
              <IconButton size="small">
                <LocalPhoneOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Chat">
              <IconButton size="small">
                <ChatBubbleOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="LinkedIn">
              <IconButton size="small">
                <LinkedInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Hide trailing avatar on phones for space */}
          <Avatar
            src={c.pic}
            sx={{
              width: 24,
              height: 24,
              display: { xs: "none", sm: "inline-flex" },
            }}
          >
            {initials(c.firstName, c.lastName)}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* --------------------------------- page -------------------------------- */
export default function Contacts() {
  const [contacts, setContacts] = useState(SEED);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const count = contacts.length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) =>
      [
        c.firstName,
        c.lastName,
        c.designation,
        c.email,
        c.phone,
        c.company,
        c.country,
        c.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [contacts, query]);

  // Add dialog form
  const emptyForm = {
    firstName: "",
    lastName: "",
    designation: "",
    phone: "",
    email: "",
    company: "",
    notes: "",
  };
  const [form, setForm] = useState(emptyForm);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const saveContact = () => {
    const { firstName, lastName, email } = form;
    if (!firstName || !lastName || !email) {
      setOpen(false);
      return;
    }
    setContacts((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...form,
        pic: "",
        tags: [],
      },
    ]);
    setForm(emptyForm);
    setOpen(false);
  };

  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 3 },
        background:
          "linear-gradient(180deg, rgba(249,250,251,1) 0%, rgba(255,255,255,1) 120px)",
        minHeight: "100%",
      }}
    >
      {/* Header (responsive) */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        spacing={1.25}
        sx={{ mb: 1.5 }}
      >
        <Stack spacing={0.25}>
          <Stack direction="row" spacing={1} alignItems="baseline">
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: 20, sm: 22, md: 26 },
                lineHeight: 1.15,
              }}
            >
              Contacts
            </Typography>
            <Chip
              label={count}
              color="error"
              size="small"
              sx={{ fontWeight: 700, height: 22 }}
            />
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: 12.5, sm: 13 } }}
          >
            Home › Contacts
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          justifyContent={{ xs: "flex-start", md: "flex-end" }}
        >
          <Button
            startIcon={<IosShareOutlinedIcon />}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Export
          </Button>
          <Button
            startIcon={<AddOutlinedIcon />}
            variant="contained"
            size="small"
            sx={{ borderRadius: 2 }}
            onClick={() => setOpen(true)}
          >
            Add Contact
          </Button>
        </Stack>
      </Stack>

      {/* Search */}
      <TextField
        placeholder="Search contacts…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        fullWidth
        size="small"
        sx={{
          mb: { xs: 1.5, sm: 2 },
          "& .MuiOutlinedInput-root": { borderRadius: 2 },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Cards grid */}
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
        {filtered.map((c) => (
          <Grid key={c.id} item xs={12} sm={6} md={4} lg={3}>
            <ContactCard c={c} />
          </Grid>
        ))}
        {filtered.length === 0 && (
          <Grid item xs={12}>
            <Box
              sx={{
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 3,
                p: { xs: 4, sm: 6 },
                textAlign: "center",
                color: "text.secondary",
                fontSize: { xs: 14, sm: 16 },
              }}
            >
              No contacts found.
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Add Contact Dialog (full screen on phones) */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={fullScreen}
      >
        <DialogTitle sx={{ fontWeight: 800, pr: 3 }}>
          Add Contact
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                label="First Name"
                fullWidth
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                label="Last Name"
                fullWidth
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                size="small"
                label="Designation"
                fullWidth
                value={form.designation}
                onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                label="Phone Number"
                fullWidth
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                label="Email"
                type="email"
                fullWidth
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel id="company-lbl">Company</InputLabel>
                <Select
                  labelId="company-lbl"
                  label="Company"
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Choose company…</em>
                  </MenuItem>
                  {COMPANY_OPTIONS.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                size="small"
                label="Notes"
                fullWidth
                multiline
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveContact}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
