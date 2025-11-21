import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChartOutlined";
import PeopleIcon from "@mui/icons-material/PeopleOutline";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOnOutlined";
import SubscriptionsIcon from "@mui/icons-material/RssFeedOutlined";
import ApartmentIcon from "@mui/icons-material/ApartmentOutlined";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";

const statCard = (title, value, delta, icon, color = "default") => (
  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Box>
        <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
        <Typography variant="h6" fontWeight={800}>{value}</Typography>
        <Typography variant="body2" color={delta.startsWith("-") ? "error.main" : "success.main"}>
          {delta} from last month
        </Typography>
      </Box>
      <Chip icon={icon} label="" sx={{ bgcolor: `${color}.50`, "& .MuiChip-icon": { color: `${color}.main` } }} />
    </Stack>
  </Paper>
);

const dataCompanies = [
  { name: "Mon", companies: 40 },
  { name: "Tue", companies: 60 },
  { name: "Wed", companies: 30 },
  { name: "Thu", companies: 70 },
  { name: "Fri", companies: 50 },
  { name: "Sat", companies: 80 },
  { name: "Sun", companies: 65 },
];

const revenue = [
  { name: "Jan", rev: 80, },
  { name: "Feb", rev: 95, },
  { name: "Mar", rev: 70, },
  { name: "Apr", rev: 110, },
  { name: "May", rev: 90, },
  { name: "Jun", rev: 125, },
  { name: "Jul", rev: 115, },
];

export default function SaDashboard() {
  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Dashboard
      </Typography>

      {/* Welcome banner */}
      <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "grey.900", color: "common.white", mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h5" fontWeight={800}>Welcome Back, Adrian</Typography>
            <Typography color="grey.400">14 New Companies Subscribed Today !!!</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" color="primary">Companies</Button>
            <Button variant="outlined" sx={{ color: "common.white", borderColor: "grey.700" }}>All Packages</Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Stat cards */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} md={6} lg={3}>
          {statCard("Total Companies", "5468", "+5.62%", <ApartmentIcon />, "warning")}
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          {statCard("Active Companies", "4598", "-12%", <PeopleIcon />, "success")}
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          {statCard("Total Subscribers", "5468", "+6%", <SubscriptionsIcon />, "warning")}
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          {statCard("Total Earnings", "$89,878.58", "-16%", <MonetizationOnIcon />, "error")}
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2.5, borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="h6">Companies</Typography>
              <Button size="small" variant="outlined" startIcon={<BarChartIcon />}>This Week</Button>
            </Stack>
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataCompanies}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="companies" fill="#d71914" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2.5, borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="h6">Revenue</Typography>
              <Button size="small" variant="outlined" startIcon={<SettingsIcon />}>2025</Button>
            </Stack>
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenue}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="rev" stroke="#d71914" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
