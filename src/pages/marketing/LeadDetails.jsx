import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Divider,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const TITLES = {
  raw: "Raw",
  contacted: "Contacted",
  followup: "Follow-up",
  marketing: "Marketing",
  lost: "Lost",
};

export default function LeadDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Prefer row from navigation state, else read from sessionStorage
  const row = useMemo(() => {
    if (location.state?.row) return location.state.row;
    const cached = sessionStorage.getItem("leadsData");
    if (!cached) return null;
    const lists = JSON.parse(cached);
    for (const stage of Object.keys(lists)) {
      const hit = (lists[stage] || []).find((r) => r.id === id);
      if (hit) return { ...hit, stage };
    }
    return null;
  }, [id, location.state]);

  if (!row) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>
        <Typography variant="h6">Lead not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1.25} alignItems="baseline">
          <Typography variant="h5" fontWeight={800}>
            Lead #{row.id}
          </Typography>
          <Chip size="small" label={row.stage ? TITLES[row.stage] : "—"} />
        </Stack>

        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} variant="outlined">
          Back
        </Button>
      </Stack>

      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Section title="Summary">
          <KV k="Lead Source" v={row.leadSource} />
          <KV k="Lead Person" v={row.leadPersonName} />
          <KV k="Company" v={row.company} />
          <KV k="Contact Person" v={row.contactPerson} />
          <KV k="Phone" v={row.phone} />
          <KV k="Email" v={row.email} />
          <KV k="Address" v={row.address} />
          <KV k="Requirement" v={row.requirement} />
          <KV k="Remarks (Internal)" v={row.remarks} />
        </Section>

        <Divider sx={{ my: 2 }} />

        <Section title="Attachments">
          <Typography>
            {row.attachments?.length
              ? row.attachments.map((f) => f.name || f).join(", ")
              : "—"}
          </Typography>
        </Section>

        <Divider sx={{ my: 2 }} />

        <Section title="History">
          {(row.history || []).length === 0 ? (
            <Typography color="text.secondary">No history yet.</Typography>
          ) : (
            <Stack spacing={0.5}>
              {row.history.map((h, i) => (
                <Typography key={i} variant="body2">
                  • {h}
                </Typography>
              ))}
            </Stack>
          )}
        </Section>
      </Paper>
    </Box>
  );
}

function Section({ title, children }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="overline" sx={{ letterSpacing: 0.6 }}>
        {title}
      </Typography>
      <Box sx={{ mt: 1 }}>{children}</Box>
    </Box>
  );
}

function KV({ k, v }) {
  return (
    <Stack direction="row" spacing={2} sx={{ my: 0.25 }}>
      <Typography sx={{ width: 200 }} color="text.secondary">
        {k}
      </Typography>
      <Typography sx={{ flex: 1 }}>{v || "—"}</Typography>
    </Stack>
  );
}
