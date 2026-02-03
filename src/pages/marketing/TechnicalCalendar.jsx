import React, { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import dayjs from "dayjs";

const daysShort = ["S", "M", "T", "W", "T", "F", "S"];

const TechnicalCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");

  const startDay = startOfMonth.day();
  const daysInMonth = endOfMonth.date();

  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

  const isSelected = (day) =>
    selectedDate.format("YYYY-MM-DD") ===
    currentMonth.date(day).format("YYYY-MM-DD");

  return (
    <Box
      sx={{
        background: "rgba(255,255,255,0.05)",
        borderRadius: "24px",
        padding: 3,
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <IconButton onClick={prevMonth} sx={{ color: "#fff" }}>
          <ChevronLeft />
        </IconButton>

        <Typography fontWeight={600} fontSize="16px">
          {currentMonth.format("MMMM YYYY")}
        </Typography>

        <IconButton onClick={nextMonth} sx={{ color: "#fff" }}>
          <ChevronRight />
        </IconButton>
      </Box>

      {/* DAYS HEADER */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          textAlign: "center",
          mb: 1,
        }}
      >
        {daysShort.map((d) => (
          <Typography
            key={d}
            sx={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      {/* CALENDAR GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 1,
        }}
      >
        {/* EMPTY CELLS */}
        {[...Array(startDay)].map((_, i) => (
          <Box key={`empty-${i}`} />
        ))}

        {/* DAYS */}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          return (
            <Box
              key={day}
              onClick={() =>
                setSelectedDate(currentMonth.date(day))
              }
              sx={{
                height: 36,
                width: 36,
                mx: "auto",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "13px",
                background: isSelected(day)
                  ? "linear-gradient(135deg,#60a5fa,#3b82f6)"
                  : "transparent",
                color: isSelected(day) ? "#fff" : "#c7d2fe",
                boxShadow: isSelected(day)
                  ? "0 4px 15px rgba(59,130,246,0.6)"
                  : "none",
                "&:hover": {
                  background: "rgba(255,255,255,0.1)",
                },
              }}
            >
              {day}
            </Box>
          );
        })}
      </Box>

      {/* LEGEND */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 3,
          mt: 3,
          fontSize: "11px",
          color: "rgba(255,255,255,0.6)",
        }}
      >
        <Legend color="#3b82f6" label="You" />
        <Legend color="#9ca3af" label="Others" />
        <Legend color="#ef4444" label="Conflict" />
      </Box>
    </Box>
  );
};

const Legend = ({ color, label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: color,
      }}
    />
    {label}
  </Box>
);

export default TechnicalCalendar;
