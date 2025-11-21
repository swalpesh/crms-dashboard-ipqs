import { useEffect, useState, useRef } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Link,
  Backdrop,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import LeadPipelineStatus from "./LeadPipelineStatus";
import LeadTabs from "./LeadTabs";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () =>
  localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

const PIPELINE_STAGES = [
  { id: "tele-marketing", label: "Tele Marketing", color: "#4F46E5" },
  { id: "field-marketing", label: "Field Marketing", color: "#F4B42A" },
  { id: "associate-marketing", label: "Associate Marketing", color: "#2563eb" },
  { id: "corporate-marketing", label: "Corporate Marketing", color: "#9333ea" },
  { id: "technical-team", label: "Technical Team", color: "#E26032" },
  { id: "solutions-team", label: "Solution Team", color: "#D23A8A" },
  { id: "quotation-team", label: "Quotation Team", color: "#7C3AED" },
  { id: "payments-team", label: "Payments Team", color: "#0f766e" },
];

const Card = (props) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 3,
      p: 2.5,
      border: "1px solid",
      borderColor: "divider",
      background: "white",
      ...props.sx,
    }}
    {...props}
  />
);

export default function LeadDetail() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  useEffect(() => {
    async function fetchLead() {
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE_URL}/api/leads/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        setLead(json.lead);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchLead();
  }, [id]);

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoadingActivities(true);
        const token = getToken();
        const res = await fetch(`${API_BASE_URL}/api/leads/${id}/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        setActivities(json.activities || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingActivities(false);
      }
    }
    if (id) fetchActivities();
  }, [id]);

  useEffect(() => {
    async function fetchNotes() {
      try {
        setLoadingNotes(true);
        const token = getToken();
        const res = await fetch(`${API_BASE_URL}/api/leads/${id}/notes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        setNotes(json.notes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingNotes(false);
      }
    }
    if (id) fetchNotes();
  }, [id]);

  const handleAddNote = async ({ title, note, files }) => {
    try {
      setUploading(true);
      const token = getToken();
      const formData = new FormData();
      formData.append("title", title);
      formData.append("note", note);
      files.forEach((f) => formData.append("attachments", f));

      const res = await fetch(`${API_BASE_URL}/api/leads/${id}/notes`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      const refetch = await fetch(`${API_BASE_URL}/api/leads/${id}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const refetched = await refetch.json();
      setNotes(refetched.notes || []);
    } catch (err) {
      console.error("Add note error:", err);
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
        <CircularProgress />
      </Stack>
    );

  if (!lead)
    return (
      <Typography color="error" sx={{ p: 3 }}>
        Failed to load lead.
      </Typography>
    );

  const normalize = (str = "") =>
    str.toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-").trim();

  const normalizedStage = normalize(lead.lead_stage);
  const marketingStages = [
    "field-marketing",
    "associate-marketing",
    "corporate-marketing",
  ];

  let activeIndex = PIPELINE_STAGES.findIndex(
    (s) => normalize(s.id) === normalizedStage
  );
  let filteredStages = PIPELINE_STAGES;
  if (marketingStages.includes(normalizedStage)) {
    filteredStages = PIPELINE_STAGES.filter(
      (s) =>
        !(
          marketingStages.includes(normalize(s.id)) &&
          normalize(s.id) !== normalizedStage
        )
    );
  }
  const finalIndex = activeIndex === -1 ? 0 : activeIndex;

  return (
    <Box sx={{ p: { xs: 1, md: 1.5 }, pb: 4 }}>
      <Backdrop
        open={uploading}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: "column",
        }}
      >
        <CircularProgress color="inherit" />
        <Typography sx={{ mt: 2, fontWeight: 600 }}>
          Files are being uploaded, please wait...
        </Typography>
      </Backdrop>

      <Card sx={{ p: { xs: 3, md: 4 }, mb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                bgcolor: "#e0f2fe",
                color: "#0369a1",
                border: "2px solid #0369a1",
                width: 68,
                height: 68,
                fontWeight: 900,
              }}
            >
              {initials(lead.lead_name || lead.company_name)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={900}>
                {lead.lead_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {lead.company_name} • {lead.company_city}, {lead.company_state}
              </Typography>
            </Box>
          </Stack>
          <Chip label={lead.status} color="primary" variant="outlined" />
        </Stack>
      </Card>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
        <Box sx={{ width: { xs: "100%", md: "25%" } }}>
          <LeftColumn lead={lead} />
        </Box>

        <Box sx={{ width: { xs: "100%", md: "75%" } }}>
          <Stack spacing={2}>
            <LeadPipelineStatus
              expanded={expanded}
              onToggle={() => setExpanded(!expanded)}
              stages={filteredStages}
              activeIndex={finalIndex}
            />
            {/* ✅ Pass real lead ID here */}
            <LeadTabs
              activities={activities}
              loadingActivities={loadingActivities}
              notes={notes}
              loadingNotes={loadingNotes}
              onAddNote={handleAddNote}
              apiBase={API_BASE_URL}
              leadId={lead.lead_id}
            />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

function LeftColumn({ lead }) {
  return (
    <Stack spacing={2}>
      <Card>
        <Typography fontWeight={900} sx={{ mb: 1.25 }}>
          Lead Information
        </Typography>
        <List dense disablePadding>
          <InfoRow k="Lead ID" v={lead.lead_id} />
          <InfoRow k="Lead Name" v={lead.lead_name} />
          <InfoRow k="Lead Stage" v={lead.lead_stage} />
          <InfoRow k="Lead Requirement" v={lead.lead_requirement} />
          <InfoRow k="Status" v={lead.status} />
          <InfoRow k="Created By" v={lead.created_by} />
          <InfoRow k="Created At" v={new Date(lead.created_at).toLocaleString()} />
          <InfoRow k="Updated At" v={new Date(lead.updated_at).toLocaleString()} />
        </List>
      </Card>

      <Card>
        <Typography fontWeight={900} sx={{ mb: 1.25 }}>
          Contact Details
        </Typography>
        <List dense disablePadding>
          <InfoRow k="Contact Person" v={lead.contact_person_name} />
          <InfoRow k="Phone" v={lead.contact_person_phone} />
          <InfoRow k="Email" v={lead.contact_person_email} />
          <InfoRow k="Company" v={lead.company_name} />
          <InfoRow k="Company Phone" v={lead.company_contact_number} />
          <InfoRow k="Company Email" v={lead.company_email} />
          <InfoRow k="Website" v={lead.company_website} />
          <InfoRow k="Address" v={lead.company_address} />
          <InfoRow k="City" v={lead.company_city} />
          <InfoRow k="State" v={lead.company_state} />
          <InfoRow k="Country" v={lead.company_country} />
          <InfoRow k="Zipcode" v={lead.zipcode} />
        </List>
      </Card>

      <Card>
        <Typography fontWeight={900} sx={{ mb: 1.25 }}>
          Assigned Employee
        </Typography>
        <List dense disablePadding>
          <InfoRow
            k="Employee ID"
            v={lead.assigned_employee_details?.employee_id}
          />
          <InfoRow
            k="Employee Name"
            v={lead.assigned_employee_details?.username}
          />
          <InfoRow k="Email" v={lead.assigned_employee_details?.email} />
          <InfoRow k="Role" v={lead.assigned_employee_details?.role_id} />
          <InfoRow
            k="Department"
            v={lead.assigned_employee_details?.department_id}
          />
        </List>
      </Card>
    </Stack>
  );
}

function InfoRow({ k, v }) {
  if (!v) v = "—";
  return (
    <ListItem sx={{ px: 0 }}>
      <ListItemText
        primary={<Typography variant="body2" color="text.secondary">{k}</Typography>}
        secondary={<Typography variant="body2" fontWeight={700}>{v}</Typography>}
      />
    </ListItem>
  );
}

function initials(name = "") {
  const parts = name.trim().split(" ");
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
}
