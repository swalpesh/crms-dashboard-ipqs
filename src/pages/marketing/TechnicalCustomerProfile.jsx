import React from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Stack,
  useTheme,
} from "@mui/material";
import {
  PictureAsPdf,
  Image as ImageIcon,
  Add as AddIcon,
  CalendarToday,
  Person,
  LocationOn,
} from "@mui/icons-material";

/* --------------------- Shared Card Styling --------------------- */
const glassPanelStyle = {
  background: "rgba(30, 41, 59, 0.7)",
  backdropFilter: "blur(22px)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "20px",
  padding: "28px",
  color: "#fff",
};

/* --------------------- Button Styles --------------------- */
const greenBtnStyle = {
  background: "linear-gradient(135deg, #10b981, #059669)",
  color: "#fff",
  fontWeight: 600,
  borderRadius: "10px",
  textTransform: "none",
  px: 4,
  py: 1.5,
  fontSize: "1rem",
};

const orangeBtnStyle = {
  background: "linear-gradient(135deg, #f97316, #ea580c)",
  color: "#fff",
  fontWeight: 600,
  borderRadius: "10px",
  textTransform: "none",
  px: 4,
  py: 1.5,
  fontSize: "1rem",
};

/* --------------------- Mock Data --------------------- */
const OVERVIEW_DATA = [
  { label: "Assigned Technician", value: "Akshay Thorbole" },
  { label: "Customer Name", value: "Mahindra & Mahindra" },
  { label: "Site Address", value: "Nashik, Maharashtra" },
  { label: "Contact Number", value: "9554045784" },
  { label: "Contact Person", value: "Bhayankar Bhide" },
  { label: "Visit Assigned", value: "10 November, 2025, 9:00 AM" },
  { label: "Visit Start Time", value: "15 November, 2025, 11:15 AM" },
  { label: "Actual End Time", value: "N/A" },
];

const TIMELINE_DATA = [
  {
    title: "Visit Assigned",
    time: "10 November, 2025, 09:00 AM",
    icon: <CalendarToday />,
  },
  {
    title: "Technical Person Assigned",
    time: "13 November, 2025, 2:00 PM",
    icon: <Person />,
  },
  {
    title: "Technician Arrived On-Site",
    time: "15 November, 2025, 12:15 PM",
    icon: <LocationOn />,
  },
];

const DOCUMENTS = [
  { name: "Site_Plan_v2.pdf", size: "2.4 MB", type: "pdf" },
  { name: "Panel_Photo.jpg", size: "1.1 MB", type: "image" },
];

/* --------------------- Main Component --------------------- */
const TechnicalCustomerprofile = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background:
          "radial-gradient(circle at top left, #1e1b4b, #0f172a 60%, #020617)",
        color: "#fff",
        pb: 8,
      }}
    >
      {/* MAIN CONTAINER */}
      <Box
        sx={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: 3,
        }}
      >
        {/* ---------------- Header ---------------- */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{ fontWeight: 800, mb: 1, lineHeight: 1.2 }}
            >
              Visit Details: Mahindra & Mahindra
            </Typography>

            <Typography sx={{ color: "#cbd5e1", fontSize: "1.05rem" }}>
              Visit ID: L-005 | Job Type: Application Visit | Status:{" "}
              <span style={{ color: "#fbbf24", fontWeight: 700 }}>
                In Progress
              </span>
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button sx={orangeBtnStyle}>Schedule Visit</Button>
            <Button sx={greenBtnStyle}>Start Visit</Button>
          </Stack>
        </Box>

        {/* ---------------- 2-COLUMN GRID ---------------- */}
        <Grid
          container
          spacing={3}
        >
          {/* ---------------- LEFT COLUMN (65%) ---------------- */}
          <Grid
            item
            xs={12}
            md={7}
          >
            {/* Overview Card */}
            <Box sx={{ ...glassPanelStyle, mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Overview
              </Typography>

              {OVERVIEW_DATA.map((item, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 2,
                    borderBottom:
                      i !== OVERVIEW_DATA.length - 1
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "none",
                  }}
                >
                  <Typography sx={{ color: "#cbd5e1" }}>
                    {item.label}
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>{item.value}</Typography>
                </Box>
              ))}
            </Box>

            {/* Job Description */}
            <Box sx={{ ...glassPanelStyle, mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Job Description & Requirements
              </Typography>

              <Typography sx={{ color: "#cbd5e1", lineHeight: 1.7 }}>
                Install new electrical panel and wiring for the server room.
                Ensure all connections are secure and meet safety standards.
                Required tools: Wire strippers, multimeter, safety gloves.
                Safety instructions: Disconnect power before starting work.
              </Typography>
            </Box>

            {/* Documents */}
            <Box sx={glassPanelStyle}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Important Documents
              </Typography>

              <Grid container spacing={2}>
                {DOCUMENTS.map((doc, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        padding: 2,
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "14px",
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "12px",
                          background: "rgba(255,255,255,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {doc.type === "pdf" ? <PictureAsPdf /> : <ImageIcon />}
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          {doc.name}
                        </Typography>
                        <Typography
                          sx={{ fontSize: "0.85rem", color: "#94a3b8" }}
                        >
                          {doc.size}
                        </Typography>
                      </Box>

                      <Button variant="outlined" sx={{ borderRadius: "10px" }}>
                        View
                      </Button>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* ---------------- RIGHT COLUMN (35%) ---------------- */}
          <Grid
            item
            xs={12}
            md={5}
          >
            {/* Timeline Card */}
            <Box sx={{ ...glassPanelStyle, mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Visit Timeline
              </Typography>

              {TIMELINE_DATA.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    gap: 2,
                    mb: index !== TIMELINE_DATA.length - 1 ? 4 : 0,
                  }}
                >
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      border: "1px solid rgba(255,255,255,0.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                      {item.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Buttons */}
            <Stack spacing={2}>
              <Button fullWidth sx={greenBtnStyle}>
                Submit Report
              </Button>
              <Button fullWidth sx={orangeBtnStyle}>
                Mark as Complete
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TechnicalCustomerprofile;