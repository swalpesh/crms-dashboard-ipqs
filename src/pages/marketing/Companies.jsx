// src/pages/marketing/Companies.jsx
import {
  Box,
  Stack,
  Typography,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
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
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import IosShareOutlinedIcon from "@mui/icons-material/IosShareOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import AlternateEmailOutlinedIcon from "@mui/icons-material/AlternateEmailOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import AttachmentOutlinedIcon from "@mui/icons-material/AttachmentOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

import { useMemo, useState } from "react";

/* ------------------------------ demo data ------------------------------ */
const CONTACT_PEOPLE = [
  "Darlee Robertson",
  "Sharon Roy",
  "Vaughan Lewis",
  "Jessica Louise",
  "Carol Thomas",
];

const SEED = [
  {
    id: 1,
    name: "NovaWave LLC",
    email: "robertson@example.com",
    phone: "+1 875455453",
    website: "novawave.io",
    industry: "Manufacturing",
    address: "Berlin, Germany",
    contactPerson: "Darlee Robertson",
    rating: 4.2,
    logo: "https://api.iconify.design/solar/leaf-bold.svg?color=%230c6&width=28&height=28",
    tags: ["Collab", "Rated"],
  },
  {
    id: 2,
    name: "BlueSky Industries",
    email: "sharon@example.com",
    phone: "+1 989757485",
    website: "bluesky.com",
    industry: "Technology",
    address: "Austin, USA",
    contactPerson: "Sharon Roy",
    rating: 5.0,
    logo: "https://api.iconify.design/solar/planet-2-bold.svg?color=%23007aff&width=28&height=28",
    tags: ["Collab", "Rated"],
  },
  {
    id: 3,
    name: "Summit Peak",
    email: "jessica13@gmail.com",
    phone: "+1 89316-83167",
    website: "summitpeak.co",
    industry: "Retail",
    address: "Pune, India",
    contactPerson: "Jessica Louise",
    rating: 4.5,
    logo: "https://api.iconify.design/solar/mountain-bold.svg?color=%23e11d48&width=28&height=28",
    tags: ["Collab", "Rated"],
  },
];

/* ------------------------------ components ----------------------------- */
function CompanyCard({ c }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: { xs: "0 2px 8px rgba(0,0,0,.04)", md: "0 10px 24px rgba(0,0,0,.06)" },
        transition: "transform .15s ease, box-shadow .15s ease",
        "&:hover": {
          transform: { md: "translateY(-2px)" },
          boxShadow: { md: "0 14px 30px rgba(0,0,0,.08)" },
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1.75, sm: 2.25 } }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Avatar
            src={c.logo}
            alt={c.name}
            sx={{
              width: { xs: 40, sm: 46 },
              height: { xs: 40, sm: 46 },
              bgcolor: "grey.100",
            }}
          >
            <BusinessOutlinedIcon fontSize="small" />
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
              {c.name}
            </Typography>

            <Stack direction="row" spacing={0.75} alignItems="center">
              <StarRoundedIcon
                fontSize="inherit"
                sx={{ color: "#f59e0b", fontSize: 16, mt: "1px" }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: 12.5, sm: 13 } }}
              >
                {c.rating?.toFixed(1)}
              </Typography>
            </Stack>
          </Box>

          <IconButton size="small">
            <MoreVertOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Details */}
        <Divider sx={{ my: 1.25 }} />

        <Stack spacing={1}>
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
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 12.5, sm: 13 } }}>
              {c.phone}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
            <PlaceOutlinedIcon fontSize="small" />
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              title={c.address}
              sx={{ fontSize: { xs: 12.5, sm: 13 } }}
            >
              {c.address}
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
                  borderColor: t === "Rated" ? "warning.light" : "success.light",
                }}
              />
            ))}
          </Stack>
        )}

        <Divider sx={{ my: 1.25 }} />

        {/* Quick actions */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
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
            <Tooltip title="Website">
              <IconButton size="small">
                <LanguageOutlinedIcon fontSize="small" />
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

          {/* contact person as tiny avatar initials (hidden on xs to avoid crowding) */}
          <Avatar
            sx={{
              width: 24,
              height: 24,
              display: { xs: "none", sm: "inline-flex" },
              bgcolor: "grey.100",
              color: "text.primary",
              fontSize: 12,
              fontWeight: 700,
            }}
            title={c.contactPerson}
          >
            {c.contactPerson?.split(" ").map(s => s[0]).join("").slice(0,2).toUpperCase()}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* ---------------------------------- page --------------------------------- */
export default function Companies() {
  const [companies, setCompanies] = useState(SEED);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const count = companies.length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) =>
      [
        c.name,
        c.email,
        c.phone,
        c.website,
        c.industry,
        c.address,
        c.contactPerson,
        c.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [companies, query]);

  // Add dialog state
  const emptyForm = {
    name: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
    notes: "",
    address: "",
    contactPerson: "",
    documentName: "",
  };
  const [form, setForm] = useState(emptyForm);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleDoc = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, documentName: file.name }));
  };

  const saveCompany = () => {
    const { name, email } = form;
    if (!name || !email) {
      setOpen(false);
      return;
    }
    setCompanies((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...form,
        rating: 4.8,
        logo: "", // could be uploaded in future
        tags: ["Collab"],
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
      {/* Header */}
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
              Companies
            </Typography>
            <Chip label={count} color="error" size="small" sx={{ fontWeight: 700, height: 22 }} />
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: 12.5, sm: 13 } }}
          >
            Home › Companies
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
            Add Company
          </Button>
        </Stack>
      </Stack>

      {/* Search */}
      <TextField
        placeholder="Search"
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

      {/* Cards */}
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
        {filtered.map((c) => (
          <Grid key={c.id} item xs={12} sm={6} md={4}>
            <CompanyCard c={c} />
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
              No companies found.
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Add Company Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={fullScreen}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Add Company</DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                size="small"
                label="Company Name"
                fullWidth
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                label="Company Email"
                type="email"
                fullWidth
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
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
                label="Website"
                fullWidth
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LanguageOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                label="Industry"
                fullWidth
                value={form.industry}
                onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                size="small"
                label="Address"
                fullWidth
                multiline
                rows={2}
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel id="cp-lbl">Contact Person</InputLabel>
                <Select
                  labelId="cp-lbl"
                  label="Contact Person"
                  value={form.contactPerson}
                  onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Choose contact…</em>
                  </MenuItem>
                  {CONTACT_PEOPLE.map((p) => (
                    <MenuItem key={p} value={p}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PersonOutlineIcon fontSize="small" />
                        <span>{p}</span>
                      </Stack>
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

            <Grid item xs={12}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  startIcon={<AttachmentOutlinedIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Upload Company Document
                  <input type="file" hidden onChange={handleDoc} />
                </Button>
                {form.documentName && (
                  <Chip
                    size="small"
                    label={form.documentName}
                    sx={{ maxWidth: 280 }}
                  />
                )}
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveCompany}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
