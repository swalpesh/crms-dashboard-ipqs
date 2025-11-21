import { Box, Paper, Typography } from "@mui/material";

export default function FieldDashboard() {
  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Field Marketing Dashboard
      </Typography>
      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography color="text.secondary">
          Coming Soon...
        </Typography>
      </Paper>
    </Box>
  );
}
