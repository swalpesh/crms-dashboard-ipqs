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
  useMediaQuery,
  TextField,
  MenuItem
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  FilterList,
  SwapVert,
  LocationOn,
  Search,
  AccessTime,
  CalendarMonth
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

  /* ---------- CALENDAR & SCHEDULING STATE ---------- */
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedTime, setSelectedTime] = useState("09:00");

  /* ---------- ASSIGN STATE ---------- */
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("medium");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [assignmentType, setAssignmentType] = useState("specific");

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

  const isDateSelectedInCalendar = (day) =>
    selectedDate === currentMonth.date(day).format("YYYY-MM-DD");

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#0f0c29" }}>
        <Typography color="white">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={pageStyle}>
      {/* Background Orbs */}
      <Box sx={{ ...orbStyle, width: 420, height: 420, background: "rgba(139,92,246,0.15)", top: -80, left: -120 }} />
      <Box sx={{ ...orbStyle, width: 320, height: 320, background: "rgba(59,130,246,0.15)", bottom: 40, right: -80 }} />

      <Box sx={{ maxWidth: 1300, width: "100%", zIndex: 1, margin: "0 auto" }}>
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
                <Stack direction="row" spacing={1} mb={2}>
                    <Button size="small" variant="contained" sx={toggleBtn(true)}>My Schedule</Button>
                    <Button size="small" variant="text" sx={toggleBtn(false)}>Team Schedule</Button>
                </Stack>
              <Box sx={calendarHeader}>
                <IconButton onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))} sx={{ color: "#fff" }}>
                  <ChevronLeft />
                </IconButton>
                <Typography fontWeight={600} sx={{ fontSize: "1.1rem" }}>
                  {currentMonth.format("MMMM YYYY")}
                </Typography>
                <IconButton onClick={() => setCurrentMonth(currentMonth.add(1, "month"))} sx={{ color: "#fff" }}>
                  <ChevronRight />
                </IconButton>
              </Box>

              <Box sx={daysRow}>
                {daysShort.map((d, idx) => (
                  <Typography key={idx} sx={dayLabel}>{d}</Typography>
                ))}
              </Box>

              <Box sx={datesGrid}>
                {[...Array(startDay)].map((_, i) => (
                  <Box key={`e-${i}`} />
                ))}

                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const fullDate = currentMonth.date(day).format("YYYY-MM-DD");
                  return (
                    <Box
                      key={day}
                      onClick={() => setSelectedDate(fullDate)}
                      sx={{
                        ...dateCell,
                        ...(isDateSelectedInCalendar(day) ? dateSelected : {})
                      }}
                    >
                      {day}
                    </Box>
                  );
                })}
              </Box>

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
                <Stack direction="row" spacing={1}>
                  <IconButton size="small" sx={{ color: "#fff" }}><FilterList /></IconButton>
                  <IconButton size="small" sx={{ color: "#fff" }}><SwapVert /></IconButton>
                </Stack>
              </Box>

              <Stack spacing={1.5} sx={{ maxHeight: "300px", overflowY: "auto", pr: 1 }}>
                {unassignedLeads.map((lead) => (
                  <QueueItem
                    key={lead.lead_id}
                    title={lead.company_name}
                    subtitle={lead.company_city}
                    tag={lead.industry_type || "Standard"}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>

          {/* ================= RIGHT COLUMN ================= */}
          <Box sx={glassCard}>
            <Typography fontWeight={600} mb={3}>Assign Visit</Typography>

            {/* Selection Toggles */}
            <Stack direction="row" spacing={1} sx={tabContainer}>
                <Button 
                    fullWidth 
                    sx={assignmentType === 'specific' ? activeToggle : inactiveToggle}
                    onClick={() => setAssignmentType('specific')}
                >
                    Specific Time
                </Button>
            </Stack>

            {/* Date / Time Selection */}
            <Stack direction="row" spacing={2} mt={3}>
              <Box sx={inputWrapper}>
                <Typography sx={label}>Date</Typography>
                <TextField
                  type="date"
                  fullWidth
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  sx={dateTimeInput}
                  InputProps={{ disableUnderline: true }}
                />
              </Box>
              <Box sx={inputWrapper}>
                <Typography sx={label}>Time</Typography>
                <TextField
                  type="time"
                  fullWidth
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  sx={dateTimeInput}
                  InputProps={{ disableUnderline: true }}
                />
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
                    sx={priorityBtn(priority === p, p)}
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
                  <Search fontSize="small" sx={{ color: "rgba(255,255,255,0.5)" }} />
                  <InputBase
                    placeholder="Search other technicians..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ color: "#fff", fontSize: 13, width: "100%" }}
                  />
                </Box>

                <Stack spacing={0.5} p={1} sx={{ maxHeight: "220px", overflowY: "auto" }}>
                  <TechItem 
                    name="Assign to Me (Self)" 
                    initials={<Avatar sx={{ width: 24, height: 24, bgcolor: 'orange' }}><Typography fontSize={10}>★</Typography></Avatar>}
                    load={null}
                    isSpecial
                  />
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
const QueueItem = ({ title, subtitle, tag }) => (
  <Box sx={queueItem}>
    <Checkbox sx={{ color: "rgba(255,255,255,0.3)", '&.Mui-checked': { color: '#4f7df3' } }} />
    <Box flex={1}>
      <Typography fontWeight={600} fontSize="14px">{title}</Typography>
      <Typography fontSize="12px" color="rgba(255,255,255,0.5)" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <LocationOn sx={{ fontSize: 12 }} /> {subtitle}
      </Typography>
    </Box>
    <Box sx={{ alignSelf: 'center' }}>
        <Typography sx={tagStyle(tag)}>{tag}</Typography>
    </Box>
  </Box>
);

const TechItem = ({ name, initials, load, selected, onClick, isSpecial }) => (
  <Box
    onClick={onClick}
    sx={{
      ...techItem,
      background: selected ? "rgba(59,130,246,0.2)" : "transparent",
      border: selected ? "1px solid rgba(59,130,246,0.4)" : "1px solid transparent"
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center">
      {typeof initials === 'string' ? <Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: 'rgba(255,255,255,0.1)' }}>{initials}</Avatar> : initials}
      <Typography fontSize="13px" fontWeight={isSpecial ? 600 : 400}>{name}</Typography>
    </Stack>
    {load && (
        <Box sx={{ fontSize: 10, px: 1, py: 0.2, borderRadius: 12, bgcolor: load.bg, color: load.color, fontWeight: 700 }}>
            Load: {load.text}
        </Box>
    )}
  </Box>
);

const Legend = ({ color, label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
    <Typography fontSize="11px" color="rgba(255,255,255,0.7)">{label}</Typography>
  </Box>
);

/* ================= STYLES ================= */
const pageStyle = {
  minHeight: "100vh",
  background: "#0a091a",
  padding: { xs: 2, md: 4 },
  color: "#fff",
  overflowX: "hidden"
};

const headingStyle = {
  mb: 4,
  fontWeight: 700,
  letterSpacing: -0.5,
  background: "linear-gradient(to right,#fff,#a5b4fc)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent"
};

const orbStyle = {
  position: "fixed",
  borderRadius: "50%",
  filter: "blur(100px)",
  animation: `${float} 15s infinite ease-in-out`
};

const glassCard = {
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(10px)",
  borderRadius: 6,
  padding: 3,
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
};

const toggleBtn = (active) => ({
    textTransform: 'none',
    borderRadius: 2,
    fontSize: 12,
    bgcolor: active ? '#4f7df3' : 'rgba(255,255,255,0.05)',
    color: active ? '#fff' : 'rgba(255,255,255,0.4)',
    '&:hover': { bgcolor: active ? '#4f7df3' : 'rgba(255,255,255,0.1)' }
});

const calendarHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  mb: 3
};

const daysRow = {
  display: "grid",
  gridTemplateColumns: "repeat(7,1fr)",
  textAlign: "center",
  mb: 2
};

const dayLabel = {
  fontSize: "12px",
  fontWeight: 600,
  color: "rgba(255,255,255,0.3)"
};

const datesGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(7,1fr)",
  gap: 1.5
};

const dateCell = {
  height: 40,
  width: 40,
  margin: "0 auto",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: "14px",
  transition: "all 0.2s",
  color: "rgba(255,255,255,0.8)",
  "&:hover": { background: "rgba(255,255,255,0.08)" }
};

const dateSelected = {
  background: "#4f7df3",
  color: "#fff",
  boxShadow: "0 0 20px rgba(79,125,243,0.5)",
  fontWeight: 700
};

const legend = {
  display: "flex",
  justifyContent: "center",
  gap: 4,
  mt: 4
};

const queueHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  mb: 3
};

const queueItem = {
  background: "rgba(255,255,255,0.02)",
  borderRadius: 4,
  padding: 1.5,
  display: "flex",
  gap: 1.5,
  border: "1px solid rgba(255,255,255,0.05)"
};

const tagStyle = (tag) => ({
    fontSize: 10,
    px: 1,
    py: 0.2,
    borderRadius: 1,
    bgcolor: tag === 'VIP/Escalation' ? 'rgba(239,68,68,0.1)' : tag === 'Flexible' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
    color: tag === 'VIP/Escalation' ? '#ef4444' : tag === 'Flexible' ? '#10b981' : 'rgba(255,255,255,0.5)',
    fontWeight: 700,
    border: `1px solid ${tag === 'VIP/Escalation' ? '#ef444433' : tag === 'Flexible' ? '#10b98133' : '#ffffff11'}`
});

const label = {
  fontSize: 12,
  fontWeight: 600,
  color: "rgba(255,255,255,0.4)",
  mb: 1
};

const inputWrapper = {
    flex: 1,
    bgcolor: "rgba(0,0,0,0.2)",
    p: 1.5,
    borderRadius: 3,
    border: "1px solid rgba(255,255,255,0.05)"
};

const dateTimeInput = {
    '& .MuiInputBase-input': { 
        color: '#fff', 
        fontSize: '14px',
        '&::-webkit-calendar-picker-indicator': { filter: 'invert(1)' } 
    },
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
};

const tabContainer = {
    bgcolor: 'rgba(255,255,255,0.03)',
    p: 0.5,
    borderRadius: 3
};

const activeToggle = {
  background: "#4f7df3",
  color: "#fff",
  borderRadius: 2.5,
  textTransform: "none",
  fontWeight: 600,
  fontSize: 13,
  '&:hover': { bgcolor: '#4f7df3' }
};

const inactiveToggle = {
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'none',
    fontSize: 13
};

const priorityBtn = (active, level) => ({
  flex: 1,
  background: active ? (level === 'high' ? '#451a1a' : level === 'medium' ? '#1a2045' : '#1a452d') : "rgba(255,255,255,0.03)",
  color: active ? (level === 'high' ? '#fca5a5' : level === 'medium' ? '#93c5fd' : '#a7f3d0') : "rgba(255,255,255,0.2)",
  border: `1px solid ${active ? (level === 'high' ? '#ef444455' : level === 'medium' ? '#3b82f655' : '#10b98155') : 'transparent'}`,
  textTransform: "none",
  fontSize: 12,
  fontWeight: 600
});

const assignBox = {
  background: "rgba(0,0,0,0.2)",
  borderRadius: 4,
  border: "1px solid rgba(255,255,255,0.05)",
  mt: 1
};

const searchBox = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  padding: 2,
  borderBottom: "1px solid rgba(255,255,255,0.05)"
};

const techItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 1.2,
  borderRadius: 3,
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": { background: "rgba(255,255,255,0.05)" }
};

const actionBtn = {
  mt: 4,
  background: "linear-gradient(135deg,#4f7df3,#2563eb)",
  color: "#fff",
  paddingY: 1.8,
  borderRadius: 4,
  fontWeight: 700,
  textTransform: "none",
  boxShadow: "0 10px 25px rgba(79,125,243,0.4)",
  '&:hover': { background: "linear-gradient(135deg,#4f7df3,#2563eb)", opacity: 0.9 }
};

export default TechnicalVisitPlanner;