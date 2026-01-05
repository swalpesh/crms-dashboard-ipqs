import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Avatar,
  InputBase,
  Checkbox,
  Button,
  keyframes,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  FilterList,
  SwapVert,
  LocationOn,
  Search
} from "@mui/icons-material";

/* ================= ANIMATION ================= */
const float = keyframes`
  0%, 100% { transform: translate(0,0); }
  50% { transform: translate(30px,-30px); }
`;

const daysShort = ["S", "M", "T", "W", "T", "F", "S"];

/* ================= MAIN COMPONENT ================= */
const TechnicalVisitPlanner = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  /* ---------- DATA STATE ---------- */
  const [unassignedLeads, setUnassignedLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- CALENDAR STATE ---------- */
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());

  /* ---------- ASSIGN STATE ---------- */
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("medium");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  /* ================= API ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const res = await axios.get(
          "https://bcrm.ipqspl.com/api/tleads/technicalteam/all-leads",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setUnassignedLeads(res.data.unassigned_leads || []);
        setEmployees(res.data.employees || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ================= HELPERS ================= */
  const getLoad = (count) => {
    if (count <= 1) return { text: "Low", bg: "#bbf7d0", color: "#065f46" };
    if (count <= 3) return { text: "Medium", bg: "#fde047", color: "#713f12" };
    return { text: "High", bg: "#fca5a5", color: "#7f1d1d" };
  };

  const filteredEmployees = employees.filter((e) =>
    e.username.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= CALENDAR LOGIC ================= */
  const startOfMonth = currentMonth.startOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const startDay = startOfMonth.day();

  const isSelected = (day) =>
    selectedDate.format("YYYY-MM-DD") ===
    currentMonth.date(day).format("YYYY-MM-DD");

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography color="white">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={pageStyle}>
      {/* Background Orbs */}
      <Box sx={{ ...orbStyle, width: 420, height: 420, background: "rgba(139,92,246,0.15)", top: -80, left: -120 }} />
      <Box sx={{ ...orbStyle, width: 320, height: 320, background: "rgba(59,130,246,0.15)", bottom: 40, right: -80 }} />

      <Box sx={{ maxWidth: 1300, width: "100%", zIndex: 1 }}>
        <Typography variant="h4" sx={headingStyle}>
          Visit Planner & Team Manager
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.8fr 1.2fr",
            gap: 3
          }}
        >
          {/* ================= LEFT COLUMN ================= */}
          <Stack spacing={3}>
            {/* -------- CALENDAR -------- */}
            <Box sx={glassCard}>
              <Box sx={calendarHeader}>
                <IconButton onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))} sx={{ color: "#fff" }}>
                  <ChevronLeft />
                </IconButton>

                <Typography fontWeight={600}>
                  {currentMonth.format("MMMM YYYY")}
                </Typography>

                <IconButton onClick={() => setCurrentMonth(currentMonth.add(1, "month"))} sx={{ color: "#fff" }}>
                  <ChevronRight />
                </IconButton>
              </Box>

              {/* Days */}
              <Box sx={daysRow}>
                {daysShort.map((d) => (
                  <Typography key={d} sx={dayLabel}>{d}</Typography>
                ))}
              </Box>

              {/* Dates */}
              <Box sx={datesGrid}>
                {[...Array(startDay)].map((_, i) => (
                  <Box key={`e-${i}`} />
                ))}

                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  return (
                    <Box
                      key={day}
                      onClick={() => setSelectedDate(currentMonth.date(day))}
                      sx={{
                        ...dateCell,
                        ...(isSelected(day) ? dateSelected : {})
                      }}
                    >
                      {day}
                    </Box>
                  );
                })}
              </Box>

              {/* Legend */}
              <Box sx={legend}>
                <Legend color="#3b82f6" label="You" />
                <Legend color="#9ca3af" label="Others" />
                <Legend color="#ef4444" label="Conflict" />
              </Box>
            </Box>

            {/* -------- PENDING VISITS -------- */}
            <Box sx={glassCard}>
              <Box sx={queueHeader}>
                <Typography fontWeight={600}>Pending Visits Queue</Typography>
                <Stack direction="row">
                  <IconButton size="small"><FilterList /></IconButton>
                  <IconButton size="small"><SwapVert /></IconButton>
                </Stack>
              </Box>

              <Stack spacing={1.5}>
                {unassignedLeads.map((lead) => (
                  <QueueItem
                    key={lead.lead_id}
                    title={lead.company_name}
                    subtitle={lead.company_city}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>

          {/* ================= RIGHT COLUMN ================= */}
          <Box sx={glassCard}>
            <Typography fontWeight={600} mb={3}>Assign Visit</Typography>

            {/* Specific Time Only */}
            <Button fullWidth sx={activeToggle}>Specific Time</Button>

            {/* Date / Time Display */}
            <Stack direction="row" spacing={2} mt={3}>
              <Box sx={infoBox}>
                <Typography sx={label}>Date</Typography>
                <Typography>{selectedDate.format("DD/MM/YYYY")}</Typography>
              </Box>
              <Box sx={infoBox}>
                <Typography sx={label}>Time</Typography>
                <Typography>09:00 AM</Typography>
              </Box>
            </Stack>

            {/* Priority */}
            <Box mt={3}>
              <Typography sx={label}>Priority</Typography>
              <Stack direction="row" spacing={1}>
                {["high", "medium", "low"].map((p) => (
                  <Button
                    key={p}
                    onClick={() => setPriority(p)}
                    sx={priorityBtn(priority === p)}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Button>
                ))}
              </Stack>
            </Box>

            {/* Assign Technician */}
            <Box mt={4}>
              <Typography sx={label}>Assign Technical Person</Typography>

              <Box sx={assignBox}>
                <Box sx={searchBox}>
                  <Search fontSize="small" />
                  <InputBase
                    placeholder="Search other technician"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ color: "#fff", fontSize: 13, width: "100%" }}
                  />
                </Box>

                <Stack spacing={0.5} p={1}>
                  {filteredEmployees.map((emp) => {
                    const load = getLoad(emp.total_leads);
                    return (
                      <TechItem
                        key={emp.employee_id}
                        name={emp.username}
                        initials={emp.username.slice(0, 2).toUpperCase()}
                        load={load}
                        selected={selectedEmployee === emp.employee_id}
                        onClick={() => setSelectedEmployee(emp.employee_id)}
                      />
                    );
                  })}
                </Stack>
              </Box>
            </Box>

            <Button fullWidth sx={actionBtn} mt={4}>
              Complete Action
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

/* ================= SUB COMPONENTS ================= */
const QueueItem = ({ title, subtitle }) => (
  <Box sx={queueItem}>
    <Checkbox />
    <Box flex={1}>
      <Typography fontWeight={600}>{title}</Typography>
      <Typography fontSize="12px" color="gray">
        <LocationOn fontSize="12px" /> {subtitle}
      </Typography>
    </Box>
  </Box>
);

const TechItem = ({ name, initials, load, selected, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      ...techItem,
      background: selected ? "rgba(59,130,246,0.2)" : "transparent"
    }}
  >
    <Box sx={{ display: "flex", gap: 1.5 }}>
      <Avatar>{initials}</Avatar>
      <Typography fontSize="13px">{name}</Typography>
    </Box>
    <Box sx={{ fontSize: 11, px: 1.2, py: 0.4, borderRadius: 12, bgcolor: load.bg, color: load.color }}>
      Load: {load.text}
    </Box>
  </Box>
);

const Legend = ({ color, label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
    <Typography fontSize="11px">{label}</Typography>
  </Box>
);

/* ================= STYLES ================= */
const pageStyle = {
  minHeight: "100vh",
  background: "#0f0c29",
  padding: 4,
  color: "#fff",
  overflow: "hidden"
};

const headingStyle = {
  mb: 4,
  fontWeight: 600,
  background: "linear-gradient(to right,#fff,#a5b4fc)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent"
};

const orbStyle = {
  position: "fixed",
  borderRadius: "50%",
  filter: "blur(80px)",
  animation: `${float} 10s infinite ease-in-out`
};

const glassCard = {
  background: "rgba(255,255,255,0.05)",
  borderRadius: 24,
  padding: 3,
  border: "1px solid rgba(255,255,255,0.1)"
};

const calendarHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  mb: 2
};

const daysRow = {
  display: "grid",
  gridTemplateColumns: "repeat(7,1fr)",
  textAlign: "center",
  mb: 1
};

const dayLabel = {
  fontSize: "12px",
  color: "rgba(255,255,255,0.5)"
};

const datesGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(7,1fr)",
  gap: 1
};

const dateCell = {
  height: 36,
  width: 36,
  margin: "0 auto",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: "13px",
  color: "#c7d2fe",
  "&:hover": { background: "rgba(255,255,255,0.1)" }
};

const dateSelected = {
  background: "linear-gradient(135deg,#60a5fa,#3b82f6)",
  color: "#fff",
  boxShadow: "0 4px 15px rgba(59,130,246,0.6)"
};

const legend = {
  display: "flex",
  justifyContent: "center",
  gap: 3,
  mt: 3
};

const queueHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  mb: 2
};

const queueItem = {
  background: "rgba(255,255,255,0.03)",
  borderRadius: 12,
  padding: 2,
  display: "flex",
  gap: 2
};

const label = {
  fontSize: 12,
  color: "#9ca3af",
  mb: 1
};

const infoBox = {
  flex: 1,
  background: "rgba(0,0,0,0.3)",
  borderRadius: 8,
  padding: 1.5
};

const priorityBtn = (active) => ({
  flex: 1,
  background: active ? "#312e81" : "rgba(255,255,255,0.05)",
  color: active ? "#93c5fd" : "#9ca3af",
  textTransform: "none"
});

const assignBox = {
  background: "rgba(0,0,0,0.3)",
  borderRadius: 12,
  mt: 1
};

const searchBox = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  padding: 1.5,
  borderBottom: "1px solid rgba(255,255,255,0.1)"
};

const techItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 1,
  borderRadius: 8,
  cursor: "pointer",
  "&:hover": { background: "rgba(255,255,255,0.05)" }
};

const activeToggle = {
  background: "#4f7df3",
  color: "#fff",
  borderRadius: 2,
  textTransform: "none"
};

const actionBtn = {
  mt: 4,
  background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
  color: "#fff",
  paddingY: 1.5,
  borderRadius: 2,
  fontWeight: 600,
  textTransform: "none"
};

export default TechnicalVisitPlanner;
