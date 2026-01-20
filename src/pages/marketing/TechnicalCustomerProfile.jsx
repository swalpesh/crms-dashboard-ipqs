import React, { useState } from "react";
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
} from "@mui/material";
import {
  AttachFile as AttachFileIcon,
  Event as EventIcon,
} from "@mui/icons-material";

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
};

const TechnicalCustomerProfile = () => {
  const [activeTab, setActiveTab] = useState("discuss");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background: "radial-gradient(circle at top left, #2e1065, #0f172a 60%, #020617)",
        py: 4,
        px: { xs: 2, md: 6 },
        fontFamily: "'Inter', sans-serif",
      }}
    >
    
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#fff", mb: 1 }}>
          Visit Details: Mahindra & Mahindra
        </Typography>
        <Typography sx={{ color: "#94a3b8", fontSize: "0.95rem" }}>
          Visit ID: L-005 | Job Type: Application Visit | Status: 
          <Box component="span" sx={{ color: "#FACC15", ml: 1, fontWeight: 600 }}>In Progress</Box>
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* --- LEFT COLUMN --- */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            
            {/* Overview Card */}
            <Box sx={glassPanel}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Overview</Typography>
              <Stack divider={<Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />} spacing={2}>
                {[
                  ["Assigned Technician", "Akshay Thorbole"],
                  ["Customer Name", "Mahindra & Mahindra"],
                  ["Site Address", "Nashik, Maharashtra"],
                  ["Contact Number", "9554045784"],
                  ["Contact Person", "Bhayankar Bhide"],
                ].map(([label, value]) => (
                  <Box key={label} sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "#94a3b8" }}>{label}</Typography>
                    <Typography sx={{ fontWeight: 500 }}>{value}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

{/* Job Description & Requirements Card (Added here) */}
            <Box sx={glassPanel}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Job Description & Requirements
              </Typography>
              <Typography sx={{ color: "#cbd5e1", lineHeight: 1.7, fontSize: "0.95rem" }}>
                Install new electrical panel and wiring for the server room. Ensure all connections are secure and meet safety standards. Required tools: Wire strippers, multimeter, safety gloves.
              </Typography>
            </Box>
            
            {/* Discussion Panel */}
            <Box sx={{ ...glassPanel, p: 0, overflow: "hidden" }}>
              <Box sx={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}>
                <Button 
                  onClick={() => setActiveTab("discuss")}
                  sx={{ color: activeTab === "discuss" ? "#c084fc" : "#94a3b8", px: 4, py: 2, borderBottom: activeTab === "discuss" ? "3px solid #c084fc" : "none", borderRadius: 0, textTransform: 'none' }}
                >
                  Discuss
                </Button>
                <Button 
                  onClick={() => setActiveTab("notes")}
                  sx={{ color: activeTab === "notes" ? "#c084fc" : "#94a3b8", px: 4, py: 2, borderBottom: activeTab === "notes" ? "3px solid #c084fc" : "none", borderRadius: 0, textTransform: 'none' }}
                >
                  Notes
                </Button>
              </Box>

              <Box sx={{ p: 3, height: "300px", overflowY: "auto" }}>
                <Stack spacing={3}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "#0ea5e9" }}>MX</Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: "#f1f5f9" }}>Amit Verma (Manager) • <small>2 hours ago</small></Typography>
                      <Typography sx={{ bgcolor: "rgba(255,255,255,0.03)", p: 1.5, borderRadius: "0 12px 12px 12px", mt: 0.5, fontSize: "0.9rem" }}>
                        @Rahul, please confirm if the technical specs for the 500kVA transformer are attached.
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ p: 2, background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 1 }}>
                <TextField 
                  fullWidth 
                  placeholder="Send a message..." 
                  variant="standard"
                  InputProps={{ disableUnderline: true, sx: { color: "#fff", px: 1 } }}
                />
                <IconButton sx={{ color: "#94a3b8" }}><AttachFileIcon /></IconButton>
                <Button sx={{ bgcolor: "#8b5cf6", color: "#fff", '&:hover': { bgcolor: "#7c3aed" }, textTransform: 'none' }}>Send</Button>
              </Box>
            </Box>
          </Stack>
        </Grid>

        {/* --- RIGHT COLUMN --- */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Timeline */}
            <Box sx={glassPanel}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Visit Timeline</Typography>
              <Box sx={{ borderLeft: "2px solid rgba(255,255,255,0.1)", pl: 3, position: "relative" }}>
                <Box sx={{ mb: 4, position: "relative" }}>
                  <Box sx={{ position: "absolute", left: "-33px", top: "0", bgcolor: "rgba(30,41,59,0.8)", p: 0.5, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)" }}>
                    <EventIcon sx={{ fontSize: "1rem", color: "#cbd5e1" }} />
                  </Box>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>Visit Assigned</Typography>
                  <Typography sx={{ color: "#94a3b8", fontSize: "0.8rem" }}>10 November, 2025, 09:00 AM</Typography>
                </Box>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2}>
              <Button fullWidth variant="contained" sx={{ bgcolor: "#22c55e", py: 1.5, fontWeight: 600, textTransform: 'none' }}>Submit Report</Button>
              <Button fullWidth variant="contained" sx={{ bgcolor: "#ef4444", py: 1.5, fontWeight: 600, textTransform: 'none' }}>Mark Complete</Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TechnicalCustomerProfile;