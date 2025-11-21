import { Box, Paper, Typography } from "@mui/material";

export default function EmpDashboard() {
  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Employee Dashboard
      </Typography>

      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography color="text.secondary">
          TODO: show employee KPIs — today’s tasks, meetings, targets, conversions, recent activity, etc.
        </Typography>
      </Paper>
    </Box>
  );
}
