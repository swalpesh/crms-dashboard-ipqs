import { Box, Paper, Typography } from "@mui/material";

export default function AssociateDashboard() {
  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Associate Marketing Dashboard
      </Typography>
      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography color="text.secondary">
          TODO: tasks, approvals pending, content calendar, daily goals, training progress, etc.
        </Typography>
      </Paper>
    </Box>
  );
}
