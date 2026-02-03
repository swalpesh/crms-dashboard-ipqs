import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Stack,
  Divider,
  TextField,
  IconButton,
  Avatar,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from "@mui/material";
import {
  AttachFile as AttachFileIcon,
  Event as EventIcon,
  PlayArrow as PlayArrowIcon,
  EditCalendar as EditCalendarIcon,
  Description as DescriptionIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as InsertDriveFileIcon
} from "@mui/icons-material";
import { useParams } from "react-router-dom";

/* --- API HELPERS --- */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

/* --- Constant Glass Style --- */
const glassPanel = {
  background: "rgba(255, 255, 255, 0.03)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "16px",
  padding: "24px",
  color: "#fff",
  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
  height: "100%", 
};

// Dark Glass Input Style for Modal
const modalInputStyle = {
  '& .MuiOutlinedInput-root': {
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
  '& input::-webkit-calendar-picker-indicator': { filter: 'invert(1)', cursor: 'pointer' }
};

const TechnicalCustomerProfile = () => {
  const { id } = useParams(); 
  const LEAD_ID = id || "L-052"; 

  const [activeTab, setActiveTab] = useState("discuss");
  const [loading, setLoading] = useState(true);
  const [leadData, setLeadData] = useState(null);
  const [visitStarted, setVisitStarted] = useState(false);
  // New state to track if report is submitted
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  // Notes State
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);

  // Reschedule State
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "", reason: "" });
  const [isScheduledForToday, setIsScheduledForToday] = useState(false);

  // Upload Report State
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [reportData, setReportData] = useState({ title: "", note: "" });
  const [selectedFiles, setSelectedFiles] = useState([]);

  // --- 1. Fetch Lead Details ---
  const fetchLeadDetails = async () => {
    try {
      const token = getToken();
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE_URL}/api/leads/${LEAD_ID}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });

      if (!response.ok) throw new Error("Failed to fetch lead details");

      const data = await response.json();
      const lead = data.lead;
      setLeadData(lead);

      if (lead.lead_status === 'progress') {
        setVisitStarted(true);
      }

      // Check if Date matches Today
      if (lead.technical_visit_date) {
        const visitDate = new Date(lead.technical_visit_date).toDateString();
        const today = new Date().toDateString();
        setIsScheduledForToday(visitDate === today);
      }

    } catch (err) {
      console.error("API Error:", err);
      setToast({ open: true, message: "Error loading lead details", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Fetch Notes ---
  const fetchNotes = async () => {
    setNotesLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/leads/${LEAD_ID}/notes`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });

      if (!response.ok) throw new Error("Failed to fetch notes");

      const data = await response.json();
      setNotes(data.notes || []);
    } catch (err) {
      console.error(err);
      setToast({ open: true, message: "Failed to load notes", severity: "error" });
    } finally {
      setNotesLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadDetails();
  }, [LEAD_ID]);

  useEffect(() => {
    if (activeTab === "notes") {
      fetchNotes();
    }
  }, [activeTab, LEAD_ID]);

  // --- 3. Handle Start Visit ---
  const handleStartVisit = () => {
    if (!navigator.geolocation) {
      setToast({ open: true, message: "Geolocation is not supported by your browser.", severity: "error" });
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationString = `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`;

        try {
          const token = getToken();
          
          await fetch(`${API_BASE_URL}/api/tleads/${LEAD_ID}/visit-location`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ location: locationString })
          });

          const startRes = await fetch(`${API_BASE_URL}/api/tleads/${LEAD_ID}/start-visit`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${token}` }
          });

          if (!startRes.ok) throw new Error("Failed to start visit timer");

          setVisitStarted(true);
          setToast({ open: true, message: "Visit started successfully!", severity: "success" });

        } catch (err) {
          console.error(err);
          setToast({ open: true, message: err.message, severity: "error" });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        setToast({ open: true, message: "Unable to retrieve location. Please allow access.", severity: "error" });
      }
    );
  };

  // --- 4. Handle Reschedule ---
  const handleRescheduleSubmit = async () => {
    if (!rescheduleData.date || !rescheduleData.time || !rescheduleData.reason) {
      setToast({ open: true, message: "Please fill all fields", severity: "warning" });
      return;
    }

    setRescheduleLoading(true);

    try {
      const token = getToken();
      const payload = {
        technical_visit_date: rescheduleData.date,
        technical_visit_time: rescheduleData.time,
        reason: rescheduleData.reason
      };

      const response = await fetch(`${API_BASE_URL}/api/tleads/${LEAD_ID}/reschedule`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reschedule visit");
      }

      setToast({ open: true, message: "Visit rescheduled successfully!", severity: "success" });
      setRescheduleOpen(false);
      setRescheduleData({ date: "", time: "", reason: "" });
      fetchLeadDetails();

    } catch (err) {
      console.error(err);
      setToast({ open: true, message: err.message, severity: "error" });
    } finally {
      setRescheduleLoading(false);
    }
  };

  // --- 5. Handle File Upload (Report) ---
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async () => {
    if (!reportData.title || !reportData.note) {
      setToast({ open: true, message: "Please enter a title and note description.", severity: "warning" });
      return;
    }

    setUploadLoading(true);

    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('title', reportData.title);
      formData.append('note', reportData.note);
      
      selectedFiles.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await fetch(`${API_BASE_URL}/api/leads/${LEAD_ID}/notes`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload report");
      }

      setToast({ open: true, message: "Notes Added Successfully", severity: "success" });
      setUploadOpen(false);
      setReportData({ title: "", note: "" });
      setSelectedFiles([]);
      
      // Enable Mark Complete Button
      setReportSubmitted(true);

      // Refresh notes if tab is active
      if (activeTab === "notes") {
        fetchNotes();
      }

    } catch (err) {
      console.error(err);
      setToast({ open: true, message: err.message, severity: "error" });
    } finally {
      setUploadLoading(false);
    }
  };

  const getFullAddress = () => {
    if (!leadData) return "Loading...";
    return [leadData.company_address, leadData.company_city, leadData.company_state].filter(Boolean).join(", ");
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <Box sx={{
        minHeight: "100vh", width: "100%", background: "radial-gradient(circle at top left, #2e1065, #0f172a 60%, #020617)",
        py: 4, px: { xs: 2, md: 6 }, fontFamily: "'Inter', sans-serif", position: "relative"
    }}>
      
      {(loading || rescheduleLoading || uploadLoading) && (
        <Box sx={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", bgcolor: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <CircularProgress sx={{ color: "#3b82f6" }} />
        </Box>
      )}

      {/* --- HEADER SECTION --- */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#fff", mb: 1 }}>
            Visit Details: {leadData?.lead_name || "Loading..."}
          </Typography>
          <Typography sx={{ color: "#94a3b8", fontSize: "0.95rem" }}>
            Visit ID: {LEAD_ID} | Job Type: Application Visit | Status: 
            <Box component="span" sx={{ color: visitStarted ? "#22c55e" : "#FACC15", ml: 1, fontWeight: 600 }}>
              {visitStarted ? " In Progress (Started)" : " Pending Start"}
            </Box>
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          {!visitStarted && !isScheduledForToday && (
            <Button
              variant="outlined"
              startIcon={<EditCalendarIcon />}
              onClick={() => setRescheduleOpen(true)}
              sx={{ 
                color: "#f59e0b", borderColor: "rgba(245, 158, 11, 0.5)", fontWeight: 700, 
                px: 3, borderRadius: "12px", textTransform: "none",
                '&:hover': { borderColor: "#f59e0b", bgcolor: "rgba(245, 158, 11, 0.1)" }
              }}
            >
              Reschedule
            </Button>
          )}

          <Button 
            variant="contained" 
            startIcon={<PlayArrowIcon />}
            onClick={handleStartVisit}
            disabled={visitStarted || loading || (!visitStarted && !isScheduledForToday)}
            sx={{ 
              bgcolor: visitStarted ? "rgba(255,255,255,0.1)" : "#3b82f6", 
              fontWeight: 700, px: 4, py: 1.5, borderRadius: "12px",
              boxShadow: visitStarted ? "none" : "0 0 20px rgba(59, 130, 246, 0.5)",
              textTransform: "none", color: "#fff",
              '&:hover': { bgcolor: visitStarted ? "rgba(255,255,255,0.1)" : "#2563eb" },
              '&.Mui-disabled': { bgcolor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }
            }}
          >
            {visitStarted ? "Visit Started" : "Start Visit"}
          </Button>
        </Stack>
      </Box>

      {/* --- CONTENT GRID --- */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <div className="row w-100">
          <div className="col-md-6">
            <Box sx={glassPanel}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Overview</Typography>
              <Stack divider={<Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />} spacing={2}>
                {[
                  ["Assigned Technician", leadData?.assigned_employee_details?.username || leadData?.assigned_employee || "Unassigned"],
                  ["Customer Name", leadData?.company_name || "N/A"],
                  ["Site Address", getFullAddress()],
                  ["Contact Number", leadData?.contact_person_phone || leadData?.company_contact_number || "N/A"],
                  ["Contact Person", leadData?.contact_person_name || "N/A"],
                ].map(([label, value]) => (
                  <Box key={label} sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "#94a3b8" }}>{label}</Typography>
                    <Typography sx={{ fontWeight: 500, textAlign: "right" }}>{value}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </div>

          <div className="col-md-6">
            <Stack spacing={3} sx={{ height: "100%" }}>
              <Box sx={{ ...glassPanel, flex: 1 }}> 
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Visit Timeline</Typography>
                <Box sx={{ borderLeft: "2px solid rgba(255,255,255,0.1)", pl: 3, position: "relative", ml: 1 }}>
                  <Box sx={{ mb: 0, position: "relative" }}>
                    <Box sx={{ position: "absolute", left: "-34px", top: "0", bgcolor: "rgba(30,41,59,0.8)", p: 0.5, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)" }}>
                      <EventIcon sx={{ fontSize: "1rem", color: "#cbd5e1" }} />
                    </Box>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>Visit Assigned</Typography>
                    <Typography sx={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                      {leadData?.technical_visit_date 
                        ? new Date(leadData.technical_visit_date).toLocaleDateString() + ' ' + (leadData.technical_visit_time || '')
                        : "Date Pending"
                      }
                    </Typography>
                  </Box>
                  
                  {visitStarted && (
                     <Box sx={{ mt: 4, position: "relative", animation: "fadeIn 0.5s ease" }}>
                      <Box sx={{ position: "absolute", left: "-34px", top: "0", bgcolor: "#3b82f6", p: 0.5, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)" }}>
                        <PlayArrowIcon sx={{ fontSize: "1rem", color: "#fff" }} />
                      </Box>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#3b82f6" }}>Visit Started</Typography>
                      <Typography sx={{ color: "#94a3b8", fontSize: "0.8rem" }}>In Progress</Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Stack direction="row" spacing={2}>
                <Button 
                  fullWidth variant="contained" 
                  disabled={!visitStarted} // Enabled when visit starts
                  onClick={() => setUploadOpen(true)}
                  sx={{ 
                    bgcolor: "#22c55e", py: 1.8, borderRadius: "12px", fontWeight: 700, textTransform: 'none', 
                    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.4)", 
                    '&:hover': { bgcolor: "#16a34a" },
                    '&.Mui-disabled': { bgcolor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" }
                  }}
                >
                  Upload Report
                </Button>
                <Button 
                  fullWidth variant="contained" 
                  // Disabled by default, enabled only after report submitted
                  disabled={!visitStarted || !reportSubmitted} 
                  sx={{ 
                    bgcolor: "#ef4444", py: 1.8, borderRadius: "12px", fontWeight: 700, textTransform: 'none', 
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)", 
                    '&:hover': { bgcolor: "#dc2626" },
                    '&.Mui-disabled': { bgcolor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" }
                  }}
                >
                  Mark Complete
                </Button>
              </Stack>
            </Stack>
          </div>
        </div>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Box sx={glassPanel}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Job Requirements</Typography>
          <Typography sx={{ color: "#cbd5e1", lineHeight: 1.7, fontSize: "0.95rem" }}>
            {leadData?.lead_requirement || "No specific requirements provided."}
          </Typography>
        </Box>
      </Box>

      {/* --- DISCUSSION / NOTES PANEL --- */}
      <Box sx={{ ...glassPanel, p: 0, overflow: "hidden" }}>
        {/* Tabs */}
        <Box sx={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}>
          <Button onClick={() => setActiveTab("discuss")} sx={{ color: activeTab === "discuss" ? "#c084fc" : "#94a3b8", px: 4, py: 2, borderBottom: activeTab === "discuss" ? "3px solid #c084fc" : "none", borderRadius: 0, textTransform: 'none', fontWeight: 600 }}>Discuss</Button>
          <Button onClick={() => setActiveTab("notes")} sx={{ color: activeTab === "notes" ? "#c084fc" : "#94a3b8", px: 4, py: 2, borderBottom: activeTab === "notes" ? "3px solid #c084fc" : "none", borderRadius: 0, textTransform: 'none', fontWeight: 600 }}>Notes</Button>
        </Box>

        {/* Content Area */}
        <Box sx={{ p: 3, height: "300px", overflowY: "auto" }}>
          <Stack spacing={3}>
            {/* Discuss Tab Content (Static for now) */}
            {activeTab === "discuss" && (
              <Box sx={{ display: "flex", gap: 2 }}>
                <Avatar sx={{ bgcolor: "#0ea5e9" }}>MX</Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: "#f1f5f9", fontWeight: 600 }}>Manager • <span style={{color: '#64748b', fontWeight: 400}}>2 hours ago</span></Typography>
                  <Typography sx={{ bgcolor: "rgba(255,255,255,0.05)", p: 1.5, borderRadius: "0 12px 12px 12px", mt: 0.5, fontSize: "0.9rem", color: "#e2e8f0" }}>
                    Please check the site requirements.
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Notes Tab Content (Dynamic API) */}
            {activeTab === "notes" && (
              notesLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> :
              notes.length === 0 ? <Typography color="textSecondary">No notes available.</Typography> :
              notes.map((note) => (
                <Box key={note.note_id} sx={{ display: "flex", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "#f59e0b" }}>{note.created_by_name?.charAt(0) || "U"}</Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: "#f1f5f9", fontWeight: 600 }}>
                      {note.created_by_name} <span style={{fontSize: '0.8rem', color: '#94a3b8'}}>({note.emp_department || 'Unknown'} - {note.emp_role || 'Unknown'})</span> • <span style={{color: '#64748b', fontWeight: 400}}>{formatDate(note.created_at)}</span>
                    </Typography>
                    <Box sx={{ bgcolor: "rgba(255,255,255,0.05)", p: 1.5, borderRadius: "0 12px 12px 12px", mt: 0.5 }}>
                        <Typography sx={{ fontSize: "0.9rem", color: "#e2e8f0", mb: 0.5, fontWeight: 700 }}>{note.title}</Typography>
                        <Typography sx={{ fontSize: "0.9rem", color: "#e2e8f0" }}>{note.note}</Typography>
                        {note.attachments && note.attachments.length > 0 && (
                            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {note.attachments.map(att => (
                                    <Chip 
                                        key={att.id}
                                        icon={<DescriptionIcon sx={{ fontSize: 16 }} />}
                                        label={att.file_name}
                                        size="small"
                                        component="a"
                                        href={att.file_url}
                                        target="_blank"
                                        clickable
                                        sx={{ bgcolor: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', borderColor: 'rgba(59, 130, 246, 0.4)', border: '1px solid' }}
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>
                  </Box>
                </Box>
              ))
            )}
          </Stack>
        </Box>

        {/* Input Bar (Only for Discuss Tab) */}
        {activeTab === "discuss" && (
          <Box sx={{ p: 2, background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 2, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <TextField fullWidth placeholder="Type your message..." variant="standard" InputProps={{ disableUnderline: true, sx: { color: "#fff", px: 1 } }} />
            <IconButton sx={{ color: "#94a3b8" }}><AttachFileIcon /></IconButton>
            <Button variant="contained" sx={{ bgcolor: "#8b5cf6", color: "#fff", '&:hover': { bgcolor: "#7c3aed" }, textTransform: 'none', borderRadius: '8px', px: 3 }}>Send</Button>
          </Box>
        )}
      </Box>

      {/* --- RESCHEDULE DIALOG --- */}
      <Dialog open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#0f0c29', backgroundImage: 'linear-gradient(to bottom right, #1a1a35, #0f0c29)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' } }}>
        <DialogTitle sx={{ color: "#fff", fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Reschedule Visit</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box><InputLabel sx={{ color: "#cbd5e1", mb: 1, fontSize: "0.9rem" }}>New Date</InputLabel><TextField type="date" fullWidth value={rescheduleData.date} onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})} sx={modalInputStyle} /></Box>
            <Box><InputLabel sx={{ color: "#cbd5e1", mb: 1, fontSize: "0.9rem" }}>New Time</InputLabel><TextField type="time" fullWidth value={rescheduleData.time} onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})} sx={modalInputStyle} /></Box>
            <Box><InputLabel sx={{ color: "#cbd5e1", mb: 1, fontSize: "0.9rem" }}>Reason</InputLabel><TextField multiline rows={3} fullWidth placeholder="Reason for rescheduling..." value={rescheduleData.reason} onChange={(e) => setRescheduleData({...rescheduleData, reason: e.target.value})} sx={modalInputStyle} /></Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}><Button onClick={() => setRescheduleOpen(false)} sx={{ color: "#94a3b8" }}>Cancel</Button><Button variant="contained" onClick={handleRescheduleSubmit} disabled={rescheduleLoading} sx={{ bgcolor: "#f59e0b", '&:hover': { bgcolor: "#d97706" } }}>{rescheduleLoading ? "Updating..." : "Confirm Reschedule"}</Button></DialogActions>
      </Dialog>

      {/* --- UPLOAD REPORT DIALOG --- */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#0f0c29', backgroundImage: 'linear-gradient(to bottom right, #1a1a35, #0f0c29)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' } }}>
        <DialogTitle sx={{ color: "#fff", fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Upload Technical Report</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box><InputLabel sx={{ color: "#cbd5e1", mb: 1, fontSize: "0.9rem" }}>Title</InputLabel><TextField fullWidth placeholder="e.g. Initial Site Inspection" value={reportData.title} onChange={(e) => setReportData({...reportData, title: e.target.value})} sx={modalInputStyle} /></Box>
            <Box><InputLabel sx={{ color: "#cbd5e1", mb: 1, fontSize: "0.9rem" }}>Note / Description</InputLabel><TextField multiline rows={3} fullWidth placeholder="Details about the report..." value={reportData.note} onChange={(e) => setReportData({...reportData, note: e.target.value})} sx={modalInputStyle} /></Box>
            
            <Box sx={{ border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '12px', p: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.05)' } }} component="label">
                <input type="file" multiple hidden onChange={handleFileChange} />
                <CloudUploadIcon sx={{ fontSize: 40, color: "#3b82f6", mb: 1 }} />
                <Typography sx={{ color: "#cbd5e1", fontSize: "0.9rem" }}>Click to upload files</Typography>
            </Box>

            {/* File Preview List */}
            {selectedFiles.length > 0 && (
                <List sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    {selectedFiles.map((file, index) => (
                        <ListItem key={index} secondaryAction={<IconButton edge="end" onClick={() => removeFile(index)} sx={{ color: '#ef4444' }}><DeleteIcon /></IconButton>}>
                            <ListItemIcon><InsertDriveFileIcon sx={{ color: '#cbd5e1' }} /></ListItemIcon>
                            <ListItemText primary={file.name} primaryTypographyProps={{ style: { color: '#fff', fontSize: '0.9rem' } }} secondary={`${(file.size / 1024).toFixed(1)} KB`} secondaryTypographyProps={{ style: { color: '#94a3b8' } }} />
                        </ListItem>
                    ))}
                </List>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setUploadOpen(false)} sx={{ color: "#94a3b8" }}>Cancel</Button>
          <Button variant="contained" onClick={handleUploadSubmit} disabled={uploadLoading} sx={{ bgcolor: "#22c55e", '&:hover': { bgcolor: "#16a34a" } }}>
            {uploadLoading ? "Uploading..." : "Submit Report"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={10000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%', borderRadius: '12px' }}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default TechnicalCustomerProfile;