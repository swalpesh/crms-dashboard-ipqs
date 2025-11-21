import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Stack,
  TextField,
  Autocomplete,
} from "@mui/material";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () =>
  localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

export default function FollowupsTab({ leadId }) {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [selectedDepts, setSelectedDepts] = useState([]);

  useEffect(() => {
    async function fetchFollowups() {
      try {
        setLoading(true);
        const token = getToken();
        const res = await fetch(`${API_BASE_URL}/api/leads/${leadId}/followups`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        setFollowups(json.followups || []);

        // extract unique departments for filter
        const deptSet = new Set(json.followups?.map((f) => f.department));
        setDepartments([...deptSet]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (leadId) fetchFollowups();
  }, [leadId]);

  const filteredFollowups =
    selectedDepts.length === 0
      ? followups
      : followups.filter((f) => selectedDepts.includes(f.department));

  if (loading)
    return (
      <Stack alignItems="center" sx={{ py: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 1 }}>Loading follow-up history...</Typography>
      </Stack>
    );

  if (followups.length === 0)
    return (
      <Typography sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
        No follow-up history found.
      </Typography>
    );

  return (
    <Box>
      {/* ✅ Filter */}
      <Autocomplete
        multiple
        options={departments}
        value={selectedDepts}
        onChange={(_, v) => setSelectedDepts(v)}
        renderInput={(params) => (
          <TextField {...params} label="Filter by Department" size="small" />
        )}
        sx={{ mb: 2, width: 300 }}
      />

      <Stack spacing={2}>
        {filteredFollowups.map((fup, i) => (
          <Paper
            key={i}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
            }}
          >
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h6" fontWeight={700}>
                {fup.follow_up_title || "Follow-up"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(fup.created_at).toLocaleString()}
              </Typography>
            </Stack>

            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Next Date: <b>{fup.next_date || "—"}</b> | Next Time:{" "}
              <b>{fup.next_time || "—"}</b>
            </Typography>
            <Typography variant="body2">
              Department: <b>{fup.department || "—"}</b>
            </Typography>
            <Typography variant="body2">
              Followed up by: <b>{fup.followed_by || "—"}</b>
            </Typography>
            <Typography variant="body2">
              Person Name: <b>{fup.person_name || "—"}</b>
            </Typography>
            {fup.reason && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Reason: {fup.reason}
              </Typography>
            )}
            <Chip
              label={fup.stage || "Open"}
              size="small"
              sx={{
                mt: 1,
                bgcolor:
                  fup.stage?.toLowerCase() === "closed" ? "#fee2e2" : "#dcfce7",
                color:
                  fup.stage?.toLowerCase() === "closed" ? "#b91c1c" : "#166534",
                fontWeight: 700,
                width: "fit-content",
              }}
            />
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
