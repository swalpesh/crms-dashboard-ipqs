// src/pages/marketing/FieldLeads.jsx
import {
  Box,
  Paper,
  Stack,
  Button,
  TextField,
  InputAdornment,
  Typography,
  Tabs,
  Tab,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ======= FIXED SIZES (edit these two lines to your exact needs) ======= */
const TABLE_WIDTH_PX = 1100;     // fixed rendered width of the table viewport
const TABLE_HEIGHT_PX = 520;     // fixed rendered height of the table viewport
const INNER_MIN_WIDTH_PX = 1600; // inner table min-width to force horizontal scroll
/* ===================================================================== */

const ORDER = ["raw", "contacted", "followup", "marketing", "lost"];
const TITLES = {
  raw: "Raw",
  contacted: "Contacted",
  followup: "Follow-up",
  marketing: "Marketing",
  lost: "Lost",
};

const sample = (i) => ({
  id: `L-${500 + i}`,
  source: i % 2 ? "Website" : "Referral",
  person: i % 2 ? "John Adams" : "Ramesh Patil",
  company: i % 3 ? "Acme Co." : "Northwind",
  contact: i % 2 ? "Anita Shah" : "Mahesh Patil",
  phone: i % 2 ? "+91 98989 11111" : "+1 555-111-2222",
  email: i % 2 ? "john@northwind.com" : "ramesh@acme.com",
  req: i % 2 ? "APFC Panel 50kVAR" : "Solar 8kVA",
});

const seed = {
  raw: [sample(1)],
  contacted: [sample(2)],
  followup: [],
  marketing: [],
  lost: [],
};

export default function FieldLeads() {
  const navigate = useNavigate();

  /* data */
  const [cols, setCols] = useState(seed);
  const total = useMemo(
    () => Object.values(cols).reduce((n, arr) => n + arr.length, 0),
    [cols]
  );

  /* ui state */
  const [tab, setTab] = useState("raw");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const all = cols[tab] || [];
    if (!q.trim()) return all;
    const s = q.toLowerCase();
    return all.filter((r) =>
      [r.id, r.source, r.person, r.company, r.contact, r.phone, r.email, r.req]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [cols, tab, q]);

  /* movement helpers */
  const moveTo = (row, toCol) => {
    setCols((prev) => {
      const from = ORDER.find((k) => prev[k].some((x) => x.id === row.id));
      if (!from || from === toCol) return prev;
      const newFrom = prev[from].filter((x) => x.id !== row.id);
      const newTo = [...prev[toCol], row];
      return { ...prev, [from]: newFrom, [toCol]: newTo };
    });
  };

  const prevCol = (k) => ORDER[Math.max(0, ORDER.indexOf(k) - 1)];
  const nextCol = (k) =>
    ORDER[Math.min(ORDER.length - 1, ORDER.indexOf(k) + 1)];
  const currentColOf = (row) =>
    ORDER.find((k) => (cols[k] || []).some((r) => r.id === row.id));

  /* dialogs */
  const [backConfirm, setBackConfirm] = useState(null); // {row, from, to}
  const [followupAsk, setFollowupAsk] = useState(null); // {row}
  const [marketingAsk, setMarketingAsk] = useState(null); // {row}
  const [followupForm, setFollowupForm] = useState({
    reason: "",
    date: "",
    time: "",
  });
  const [mktDept, setMktDept] = useState("Field Marketing");

  const onPrev = (row) => {
    const from = currentColOf(row);
    const to = prevCol(from);
    if (from === to) return;
    setBackConfirm({ row, from, to });
  };
  const onNext = (row) => {
    const from = currentColOf(row);
    const to = nextCol(from);
    if (from === "contacted" && to === "followup") {
      setFollowupForm({ reason: "", date: "", time: "" });
      setFollowupAsk({ row });
      return;
    }
    if (from === "followup" && to === "marketing") {
      setMktDept("Field Marketing");
      setMarketingAsk({ row });
      return;
    }
    moveTo(row, to);
  };

  /* add lead dialog */
  const [openAdd, setOpenAdd] = useState(false);
  const [add, setAdd] = useState({
    source: "",
    person: "",
    company: "",
    contact: "",
    phone: "",
    email: "",
    req: "",
    remarks: "",
    files: null,
  });

  const saveLead = () => {
    const id = `L-${Math.floor(500 + Math.random() * 5000)}`;
    setCols((prev) => ({
      ...prev,
      [tab]: [
        ...prev[tab],
        {
          id,
          source: add.source || "Manual",
          person: add.person || "—",
          company: add.company || "—",
          contact: add.contact || "—",
          phone: add.phone || "—",
          email: add.email || "—",
          req: add.req || "—",
        },
      ],
    }));
    setOpenAdd(false);
  };

  /* ------------------------------- UI ------------------------------- */
  return (
    // Full-viewport root: no page scroll; only inner table area scrolls
    <Box
      sx={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        p: 1,
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 0.5, flex: "0 0 auto" }}
      >
        <Stack direction="row" spacing={1} alignItems="baseline">
          <Typography fontWeight={800} sx={{ fontSize: 20, lineHeight: 1.2 }}>
            Field Marketing Leads
          </Typography>
          <Box
            component="span"
            sx={{
              ml: 0.5,
              px: 1,
              py: "2px",
              borderRadius: 2,
              bgcolor: "grey.100",
              fontSize: 12,
              fontWeight: 700,
              color: "text.secondary",
            }}
          >
            {total} total
          </Box>
        </Stack>

        <Button
          startIcon={<AddCircleOutlineIcon />}
          variant="contained"
          size="small"
          onClick={() => setOpenAdd(true)}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          Add Lead
        </Button>
      </Stack>

      {/* Fixed-size shell (no external scroll) */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          // keep the viewport narrower if screen is very small
          width: `min(${TABLE_WIDTH_PX}px, calc(100vw - 16px))`,
          // center horizontally
          mx: "auto",
          overflow: "hidden",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 1,
            minHeight: 40,
            "& .MuiTab-root": { minHeight: 40, textTransform: "none" },
            flex: "0 0 auto",
          }}
        >
          {ORDER.map((k) => (
            <Tab key={k} value={k} label={TITLES[k]} />
          ))}
        </Tabs>

        <Divider />

        {/* Search */}
        <Box sx={{ p: 1, flex: "0 0 auto" }}>
          <TextField
            fullWidth
            size="small"
            placeholder={`Search in ${TITLES[tab]}…`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Box>

        {/* THE ONLY SCROLL AREA (fixed WxH) */}
        <Box
          sx={{
            px: 1,
            pb: 1,
            display: "flex",
            justifyContent: "center",
            flex: "1 1 auto",
            overflow: "hidden",
          }}
        >
          <TableContainer
            sx={{
              width: `min(${TABLE_WIDTH_PX}px, 100%)`,
              height: TABLE_HEIGHT_PX,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              overflow: "auto", // ← vertical & horizontal scrollbars appear here only
            }}
          >
            <Table
              stickyHeader
              size="medium"
              sx={{
                minWidth: INNER_MIN_WIDTH_PX, // forces horizontal scroll for long rows
                "& th, & td": { whiteSpace: "nowrap" }, // keep everything on one line
                "& th": { bgcolor: "grey.50", fontWeight: 700 },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Lead ID</TableCell>
                  <TableCell>Lead Source / Person</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Contact Person</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Requirement</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow
                    key={r.id}
                    hover
                    onDoubleClick={() =>
                      navigate(`/marketing/field/leads/${r.id}`)
                    }
                  >
                    <TableCell>{r.id}</TableCell>
                    <TableCell>
                      <b>{r.source}</b> — {r.person}
                    </TableCell>
                    <TableCell>{r.company}</TableCell>
                    <TableCell>{r.contact}</TableCell>
                    <TableCell>{r.phone}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.req}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="end">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ChevronLeftRounded />}
                          onClick={() => {
                            const from = currentColOf(r);
                            const to = prevCol(from);
                            if (from !== to)
                              setBackConfirm({ row: r, from, to });
                          }}
                          disabled={currentColOf(r) === "raw"}
                          sx={{ borderRadius: 2 }}
                        >
                          Prev
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          endIcon={<ChevronRightRounded />}
                          onClick={() => {
                            const from = currentColOf(r);
                            const to = nextCol(from);
                            if (from === "contacted" && to === "followup") {
                              setFollowupForm({
                                reason: "",
                                date: "",
                                time: "",
                              });
                              setFollowupAsk({ row: r });
                              return;
                            }
                            if (from === "followup" && to === "marketing") {
                              setMktDept("Field Marketing");
                              setMarketingAsk({ row: r });
                              return;
                            }
                            moveTo(r, to);
                          }}
                          disabled={currentColOf(r) === "lost"}
                          sx={{ borderRadius: 2 }}
                        >
                          Next
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        No leads in “{TITLES[tab]}”.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      {/* Back confirm */}
      <Dialog open={!!backConfirm} onClose={() => setBackConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Move lead back?</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            Move from <b>{TITLES[backConfirm?.from || "raw"]}</b> to{" "}
            <b>{TITLES[backConfirm?.to || "raw"]}</b>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackConfirm(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              moveTo(backConfirm.row, backConfirm.to);
              setBackConfirm(null);
            }}
          >
            Move Back
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contacted -> Follow-up */}
      <Dialog open={!!followupAsk} onClose={() => setFollowupAsk(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Move to Follow-up</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Reason"
              value={followupForm.reason}
              onChange={(e) =>
                setFollowupForm((f) => ({ ...f, reason: e.target.value }))
              }
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={followupForm.date}
                onChange={(e) =>
                  setFollowupForm((f) => ({ ...f, date: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label="Time"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={followupForm.time}
                onChange={(e) =>
                  setFollowupForm((f) => ({ ...f, time: e.target.value }))
                }
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFollowupAsk(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              moveTo(followupAsk.row, "followup");
              setFollowupAsk(null);
            }}
            disabled={!followupForm.reason || !followupForm.date || !followupForm.time}
          >
            Move
          </Button>
        </DialogActions>
      </Dialog>

      {/* Follow-up -> Marketing */}
      <Dialog open={!!marketingAsk} onClose={() => setMarketingAsk(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Send to Marketing</DialogTitle>
        <DialogContent dividers>
          <TextField
            select
            label="Department"
            value={mktDept}
            onChange={(e) => setMktDept(e.target.value)}
            fullWidth
          >
            <MenuItem value="Field Marketing">Field Marketing</MenuItem>
            <MenuItem value="Corporate Marketing">Corporate Marketing</MenuItem>
            <MenuItem value="Associate Marketing">Associate Marketing</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarketingAsk(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              moveTo(marketingAsk.row, "marketing");
              setMarketingAsk(null);
            }}
          >
            Move
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Lead */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Add Lead</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Lead Source / Person"
              placeholder="Referral / Website / Event"
              value={add.source}
              onChange={(e) => setAdd((f) => ({ ...f, source: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Name of Lead Person"
              value={add.person}
              onChange={(e) => setAdd((f) => ({ ...f, person: e.target.value }))}
              fullWidth
            />
            <Divider />
            <TextField
              label="Company Name"
              value={add.company}
              onChange={(e) => setAdd((f) => ({ ...f, company: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Manager / Contact Person"
              value={add.contact}
              onChange={(e) => setAdd((f) => ({ ...f, contact: e.target.value }))}
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Mobile Number"
                value={add.phone}
                onChange={(e) => setAdd((f) => ({ ...f, phone: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Email"
                value={add.email}
                onChange={(e) => setAdd((f) => ({ ...f, email: e.target.value }))}
                fullWidth
              />
            </Stack>
            <TextField
              label="Customer Requirement"
              value={add.req}
              onChange={(e) => setAdd((f) => ({ ...f, req: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Remarks (Internal)"
              value={add.remarks}
              onChange={(e) => setAdd((f) => ({ ...f, remarks: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Attachments"
              type="file"
              InputLabelProps={{ shrink: true }}
              inputProps={{ multiple: true }}
              onChange={(e) => setAdd((f) => ({ ...f, files: e.target.files }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveLead}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
