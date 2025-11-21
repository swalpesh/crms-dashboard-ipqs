import {
  Box,
  Stack,
  Card,
  Divider,
  Tabs,
  Tab,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";

export default function LeadTabs({
  activities,
  loadingActivities,
  notes,
  loadingNotes,
  onAddNote,
  apiBase,
  leadId,
}) {
  const [tab, setTab] = useState("activities");

  // Add Note dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  // Follow-Up History
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Filters
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [updatedByFilter, setUpdatedByFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleSubmit = () => {
    if (!title.trim() || !note.trim()) return;
    onAddNote({ title, note, files });
    setTitle("");
    setNote("");
    setFiles([]);
    setDialogOpen(false);
  };

  // 🟢 Fetch Follow-up History
// 🟢 Fetch Follow-up History
useEffect(() => {
  if (tab === "followup" && leadId) {
    const fetchFollowup = async () => {
      try {
        setLoadingHistory(true);
        const res = await fetch(
          `${apiBase}/api/leads/${leadId}/followup-history`
        );
        const data = await res.json();
        setHistory(data.history || []);
        setFilteredHistory(data.history || []);
      } catch (err) {
        console.error("Followup fetch error:", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchFollowup();
  }
}, [tab, leadId, apiBase]);

  // 🧮 Apply filters
  useEffect(() => {
    let filtered = [...history];
    if (departmentFilter)
      filtered = filtered.filter(
        (h) =>
          h.department_name?.toLowerCase() ===
          departmentFilter.toLowerCase()
      );
    if (updatedByFilter)
      filtered = filtered.filter(
        (h) =>
          h.updated_by_emp_id?.toLowerCase() ===
          updatedByFilter.toLowerCase()
      );
    if (dateFrom)
      filtered = filtered.filter(
        (h) => new Date(h.created_at) >= new Date(dateFrom)
      );
    if (dateTo)
      filtered = filtered.filter(
        (h) => new Date(h.created_at) <= new Date(dateTo)
      );
    setFilteredHistory(filtered);
  }, [departmentFilter, updatedByFilter, dateFrom, dateTo, history]);

  // Unique values for dropdowns
  const departmentList = [
    ...new Set(history.map((h) => h.department_name).filter(Boolean)),
  ];
  const updatedByList = [
    ...new Set(history.map((h) => h.updated_by_emp_id).filter(Boolean)),
  ];

  return (
    <Card sx={{ p: 0 }}>
      {/* Tabs Header */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          px: 2,
          "& .MuiTab-root": { textTransform: "none", fontWeight: 800 },
          "& .MuiTabs-indicator": { height: 3 },
        }}
      >
        <Tab value="activities" label="Activities" />
        <Tab value="notes" label="Notes" />
        <Tab value="followup" label="Follow-Up History" />
      </Tabs>
      <Divider />

      <Box sx={{ p: 2.25 }}>
        {/* ==================== ACTIVITIES TAB ==================== */}
        {tab === "activities" ? (
          loadingActivities ? (
            <Stack alignItems="center" sx={{ py: 4 }}>
              <CircularProgress size={28} />
              <Typography sx={{ mt: 1 }}>Loading activities...</Typography>
            </Stack>
          ) : activities.length === 0 ? (
            <Stack alignItems="center" sx={{ py: 4, color: "text.secondary" }}>
              <Typography>No activities found.</Typography>
            </Stack>
          ) : (
            <Stack spacing={2}>
              {activities.map((act) => (
                <Paper
                  key={act.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    borderColor: "divider",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={700}>
                      {act.change_type === "lead_assigned"
                        ? "Lead Assigned"
                        : act.change_type === "lead_stage_changed"
                        ? "Lead Stage Changed"
                        : act.change_type}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(act.change_timestamp).toLocaleString()}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Changed by:{" "}
                    <strong>
                      {act.changed_by_details?.username || act.changed_by}
                    </strong>{" "}
                    ({act.changed_by_role || act.changed_by_department})
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Stage: <b>{act.old_lead_stage}</b> →{" "}
                    <b>{act.new_lead_stage}</b>
                  </Typography>
                  <Typography variant="body2">
                    Employee: <b>{act.old_assigned_employee || "None"}</b> →{" "}
                    <b>{act.new_assigned_employee || "None"}</b>
                  </Typography>
                  {act.reason && act.reason !== "Not provided" && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Reason: {act.reason}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Stack>
          )
        ) : tab === "notes" ? (
          /* ==================== NOTES TAB ==================== */
          loadingNotes ? (
            <Stack alignItems="center" sx={{ py: 4 }}>
              <CircularProgress size={28} />
              <Typography sx={{ mt: 1 }}>Loading notes...</Typography>
            </Stack>
          ) : (
            <Box>
              <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1.5 }}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<AddOutlinedIcon />}
                  onClick={() => setDialogOpen(true)}
                >
                  Add Note
                </Button>
              </Stack>

              {notes.length === 0 ? (
                <Stack
                  alignItems="center"
                  sx={{ py: 3, color: "text.secondary" }}
                >
                  <Typography>No notes yet.</Typography>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  {notes.map((note) => (
                    <Paper
                      key={note.id}
                      elevation={3}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        background:
                          "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          sx={{ color: "red" }}
                        >
                          {note.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontStyle: "italic" }}
                        >
                          {new Date(note.created_at).toLocaleString()}
                        </Typography>
                      </Stack>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {note.note}
                      </Typography>
{note.attachments?.length > 0 && (
  <Box sx={{ mt: 1.5 }}>
    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
      Attachments:
    </Typography>

    <Stack spacing={0.5}>
      {note.attachments.map((a) => {
        // ✅ Force the correct unzipped file path
        const originalPath = a.file_path || "";
        const correctedPath = originalPath.includes("unzipped")
          ? originalPath
          : originalPath.replace(
              "uploads/notes/",
              "uploads/notes/unzipped/"
            );

        const fileUrl = `${apiBase}/${correctedPath}`;

        return (
          <Link
            key={a.id}
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "red",
              textDecoration: "underline",
            }}
          >
            <AttachFileOutlinedIcon fontSize="small" sx={{ color: "red" }} />
            {a.file_name}
          </Link>
        );
      })}
    </Stack>
  </Box>
)}


                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>
          )
        ) : (
          /* ==================== FOLLOW-UP HISTORY TAB ==================== */
          <Box>
            {loadingHistory ? (
              <Stack alignItems="center" sx={{ py: 4 }}>
                <CircularProgress size={28} />
                <Typography sx={{ mt: 1 }}>
                  Loading follow-up history...
                </Typography>
              </Stack>
            ) : filteredHistory.length === 0 ? (
              <Stack alignItems="center" sx={{ py: 4, color: "text.secondary" }}>
                <Typography>No follow-up history found.</Typography>
              </Stack>
            ) : (
              <>
                {/* 🔍 Filter Controls */}
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  sx={{
                    mb: 2,
                    background: "#f9fafb",
                    p: 2,
                    borderRadius: 2,
                    boxShadow: "inset 0 0 6px rgba(0,0,0,0.05)",
                  }}
                >
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={departmentFilter}
                      label="Department"
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      {departmentList.map((d) => (
                        <MenuItem key={d} value={d}>
                          {d}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Updated By</InputLabel>
                    <Select
                      value={updatedByFilter}
                      label="Updated By"
                      onChange={(e) => setUpdatedByFilter(e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      {updatedByList.map((u) => (
                        <MenuItem key={u} value={u}>
                          {u}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    type="date"
                    size="small"
                    label="From Date"
                    InputLabelProps={{ shrink: true }}
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                  <TextField
                    type="date"
                    size="small"
                    label="To Date"
                    InputLabelProps={{ shrink: true }}
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </Stack>

                {/* 🧾 Table */}
                <TableContainer
                  component={Paper}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <Table>
                    <TableHead sx={{ background: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>
                          Previous Follow-up
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>
                          New Follow-up
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>
                          Updated By
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>
                          Department
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Created At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredHistory.map((row, idx) => (
                        <TableRow
                          key={row.id}
                          sx={{
                            "&:hover": { backgroundColor: "#f1f5f9" },
                            transition: "0.2s",
                          }}
                        >
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {row.previous_followup_date
                                ? new Date(
                                    row.previous_followup_date
                                  ).toLocaleDateString()
                                : "—"}{" "}
                              {row.previous_followup_time
                                ? `(${row.previous_followup_time})`
                                : ""}
                            </Typography>
                            {row.previous_followup_reason && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {row.previous_followup_reason}
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {new Date(
                                row.new_followup_date
                              ).toLocaleDateString()}{" "}
                              ({row.new_followup_time})
                            </Typography>
                            {row.new_followup_reason && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {row.new_followup_reason}
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>{row.updated_by_emp_id}</TableCell>
                          <TableCell>{row.department_name}</TableCell>
                          <TableCell>
                            {new Date(row.created_at).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Box>
        )}
      </Box>

      {/* Add Note Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Add New Note</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Title"
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              label="Note"
              multiline
              minRows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button
              variant="outlined"
              startIcon={<AttachFileOutlinedIcon />}
              onClick={() => inputRef.current?.click()}
            >
              Attach Files
            </Button>
            <input
              type="file"
              ref={inputRef}
              hidden
              multiple
              onChange={(e) =>
                setFiles([...files, ...Array.from(e.target.files)])
              }
            />
            {files.map((f, i) => (
              <Typography key={i} variant="caption">
                📎 {f.name}
              </Typography>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
