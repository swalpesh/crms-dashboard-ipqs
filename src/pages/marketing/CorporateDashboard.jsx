import { Box, Paper, Typography } from "@mui/material";

export default function CorporateDashboard() {
  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Corporate Marketing Dashboard
      </Typography>
      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography color="text.secondary">
          TODO: brand KPIs, campaign ROAS, website metrics, content pipeline, spend vs budget, etc.
        </Typography>
      </Paper>
    </Box>
  );
}
