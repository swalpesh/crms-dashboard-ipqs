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
  MenuItem,
  Popover
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
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

  /* ---------- LOGGED IN EMPLOYEE ---------- */
  const [loggedInEmployeeId, setLoggedInEmployeeId] = useState(null);

  /* ---------- SELECTION ---------- */
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  /* ---------- SCHEDULE VIEW ---------- */
  const [scheduleView, setScheduleView] = useState("my"); // my | team

  /* ---------- CALENDAR VISITS ---------- */
  const [calendarVisits, setCalendarVisits] = useState({ my: {}, team: {} });

  /* ---------- POPOVER ---------- */
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverVisits, setPopoverVisits] = useState([]);

  /* ---------- CALENDAR ---------- */
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedTime, setSelectedTime] = useState("09:00");

  /* ---------- ASSIGN STATE ---------- */
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("medium");

  /* ================= API ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const myEmpId = localStorage.getItem("employee_id");
        setLoggedInEmployeeId(myEmpId);

        const res = await axios.get(
          "https://bcrm.ipqspl.com/api/tleads/technicalteam/all-leads",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUnassignedLeads(res.data.unassigned_leads || []);
        setEmployees(res.data.employees || []);

        /* ---------- BUILD CALENDAR MAPS ---------- */
        const visitMap = {};

        res.data.employees.forEach((emp) => {
          emp.leads.forEach((lead) => {
            if (!lead.technical_visit_date) return;

            const dateKey = dayjs(lead.technical_visit_date).format("YYYY-MM-DD");

            if (!visitMap[dateKey]) visitMap[dateKey] = [];

            visitMap[dateKey].push({
              lead_name: lead.company_name,
              employee: emp.username,
              time: lead.technical_visit_time,
              priority: lead.technical_visit_priority
            });
          });
        });

        setCalendarVisits(visitMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ================= ASSIGN API ================= */
  const handleAssignVisit = async () => {
    if (!selectedLeadId || !selectedEmployee) {
      alert("Please select lead and technician");
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");

      await axios.patch(
        "https://bcrm.ipqspl.com/api/tleads/assign",
        {
          lead_id: selectedLeadId,
          assigned_employee: selectedEmployee,
          technical_visit_date: selectedDate,
          technical_visit_time: selectedTime,
          technical_visit_priority:
            priority.charAt(0).toUpperCase() + priority.slice(1),
          technical_visit_type: "Specific",
          reason: "Technical Visit Scheduled"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Visit assigned successfully");

      setUnassignedLeads((prev) =>
        prev.filter((l) => l.lead_id !== selectedLeadId)
      );
      setSelectedLeadId(null);
      setSelectedEmployee(null);
    } catch (err) {
      console.error(err);
      alert("Assignment failed");
    }
  };

  /* ================= CALENDAR LOGIC ================= */
 const startOfMonth = currentMonth.startOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const startDay = startOfMonth.day();

  const handleDateClick = (e, date) => {
    setSelectedDate(date);

    if (calendarVisits[date]) {
      setPopoverVisits(calendarVisits[date]);
      setAnchorEl(e.currentTarget);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography color="white">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={pageStyle}>
      <Typography variant="h4" sx={headingStyle}>
        Visit Planner & Team Manager
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.8fr 1.2fr", gap: 3 }}>
        {/* ================= LEFT ================= */}
        <Stack spacing={3}>
          {/* -------- CALENDAR -------- */}
          <Box sx={glassCard}>
            <Box sx={calendarHeader}>
              <IconButton onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}>
                <ChevronLeft />
              </IconButton>
              <Typography>{currentMonth.format("MMMM YYYY")}</Typography>
              <IconButton onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}>
                <ChevronRight />
              </IconButton>
            </Box>

            <Box sx={daysRow}>
              {daysShort.map((d) => (
                <Typography key={d} sx={dayLabel}>{d}</Typography>
              ))}
            </Box>

            <Box sx={datesGrid}>
              {[...Array(startDay)].map((_, i) => <Box key={i} />)}

              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const date = currentMonth.date(day).format("YYYY-MM-DD");
                const hasVisit = calendarVisits[date];

                return (
                  <Box
                    key={day}
                    sx={{ ...dateCell, position: "relative" }}
                    onClick={(e) => handleDateClick(e, date)}
                  >
                    {day}
                    {hasVisit && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 5,
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#4f7df3"
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* -------- UNASSIGNED LEADS -------- */}
          <Box sx={glassCard}>
            <Typography fontWeight={600} mb={2}>Pending Visits Queue</Typography>
            <Stack spacing={1.5}>
              {unassignedLeads.map((lead) => (
                <QueueItem
                  key={lead.lead_id}
                  title={lead.company_name}
                  subtitle={lead.company_city}
                  checked={selectedLeadId === lead.lead_id}
                  onCheck={() => setSelectedLeadId(lead.lead_id)}
                />
              ))}
            </Stack>
          </Box>
        </Stack>

        {/* ================= RIGHT ================= */}
        <Box sx={glassCard}>
          <Typography fontWeight={600} mb={3}>Assign Visit</Typography>

          <Stack direction="row" spacing={2}>
            <TextField type="date" fullWidth value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            <TextField type="time" fullWidth value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} />
          </Stack>

          <Box mt={3}>
            <Typography sx={label}>Priority</Typography>
            <Stack direction="row" spacing={1}>
              {["high", "medium", "low"].map((p) => (
                <Button key={p} sx={priorityBtn(priority === p, p)} onClick={() => setPriority(p)}>
                  {p}
                </Button>
              ))}
            </Stack>
          </Box>

          <Box mt={4}>
            <Typography sx={label}>Assign Technical Person</Typography>
            <Stack spacing={1}>
              {employees.map((emp) => (
                <TechItem
                  key={emp.employee_id}
                  name={emp.username}
                  initials={emp.username.slice(0, 2).toUpperCase()}
                  selected={selectedEmployee === emp.employee_id}
                  onClick={() => setSelectedEmployee(emp.employee_id)}
                />
              ))}
            </Stack>
          </Box>

          <Button fullWidth sx={actionBtn} onClick={handleAssignVisit}>
            Complete Action
          </Button>
        </Box>
      </Box>

      {/* -------- POPUP -------- */}
      <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
        <Box sx={{ p: 2 }}>
          {popoverVisits.map((v, i) => (
            <Box key={i} mb={1}>
              <Typography fontWeight={600}>{v.lead_name}</Typography>
              <Typography fontSize={12}>{v.employee}</Typography>
              <Typography fontSize={12}>{v.time} | {v.priority}</Typography>
            </Box>
          ))}
        </Box>
      </Popover>
    </Box>
  );
};

/* ================= SUB COMPONENTS ================= */
const QueueItem = ({ title, subtitle, checked, onCheck }) => (
  <Box sx={queueItem}>
    <Checkbox checked={checked} onChange={onCheck} />
    <Box>
      <Typography>{title}</Typography>
      <Typography fontSize={12}>{subtitle}</Typography>
    </Box>
  </Box>
);

const TechItem = ({ name, initials, selected, onClick }) => (
  <Box sx={{ ...techItem, background: selected ? "rgba(59,130,246,0.2)" : "transparent" }} onClick={onClick}>
    <Avatar>{initials}</Avatar>
    <Typography>{name}</Typography>
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