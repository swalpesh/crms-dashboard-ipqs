import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button 
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CancelIcon from '@mui/icons-material/Cancel';
import RuleIcon from '@mui/icons-material/Rule';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';

// Reusable Glass Card Style
const glassStyle = {
  background: 'rgba(30, 27, 46, 0.7)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  boxSizing: 'border-box'
};

// --- Mock Data for Charts ---
const monthlyData = [
  { month: 'Jan', expenses: 45000 },
  { month: 'Feb', expenses: 52000 },
  { month: 'Mar', expenses: 38000 },
  { month: 'Apr', expenses: 65000 },
  { month: 'May', expenses: 48000 },
  { month: 'Jun', expenses: 70000 },
];

const categoryData = [
  { name: 'Travel', value: 45000, color: '#3b82f6' }, // Blue
  { name: 'Hotel', value: 30000, color: '#10b981' }, // Green
  { name: 'Food', value: 15000, color: '#f59e0b' }, // Yellow
  { name: 'Misc', value: 10000, color: '#8b5cf6' }, // Purple
];

const topStats = [
  { title: 'Total Employees', value: '1,248', trend: '+2.4%', trendColor: '#4ade80', icon: <PeopleAltIcon /> },
  { title: 'Total Vouchers', value: '4,892', trend: '+12%', trendColor: '#4ade80', icon: <ReceiptIcon /> },
  { title: 'Total Claimed', value: '$1.2M', trend: '+8%', trendColor: '#4ade80', icon: <AttachMoneyIcon /> },
  { title: 'Total Approved', value: '$980K', trend: '-3%', trendColor: '#f87171', icon: <CheckCircleIcon /> },
];

const secondaryStats = [
  { title: 'Pending Approval', value: '342', icon: <HourglassEmptyIcon /> },
  { title: 'Approved', value: '4,120', icon: <ThumbUpIcon /> },
  { title: 'Rejected', value: '185', icon: <CancelIcon /> },
  { title: 'Partial Approved', value: '245', icon: <RuleIcon /> },
];

// Custom tooltip style for Recharts to match the dark theme
const customTooltipStyle = {
  backgroundColor: 'rgba(20, 17, 30, 0.9)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: '#fff',
  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
};

export default function ReimbursementDashboard() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: '100%', minHeight: '100vh', background: 'transparent', boxSizing: 'border-box' }}>
      
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" color="#fff" mb={0.5}>
            Overview
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.6)">
            Financial summary for the current fiscal quarter.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)', textTransform: 'none' }}
          >
            Export
          </Button>
          <Button 
            variant="contained" 
            startIcon={<CalendarTodayIcon />}
            sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, textTransform: 'none' }}
          >
            Q3 2026
          </Button>
        </Box>
      </Box>

      {/* Top Stat Row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        {topStats.map((stat, i) => (
          <Card key={i} sx={glassStyle}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" color="rgba(255,255,255,0.7)">{stat.title}</Typography>
                <Box sx={{ color: 'rgba(255,255,255,0.5)' }}>{stat.icon}</Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                <Typography variant="h4" fontWeight="700">{stat.value}</Typography>
                <Typography variant="body2" fontWeight="600" sx={{ color: stat.trendColor }}>{stat.trend}</Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Secondary Stat Row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {secondaryStats.map((stat, i) => (
          <Card key={i} sx={glassStyle}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" color="rgba(255,255,255,0.7)">{stat.title}</Typography>
                <Box sx={{ color: 'rgba(255,255,255,0.5)' }}>{stat.icon}</Box>
              </Box>
              <Typography variant="h5" fontWeight="600">{stat.value}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Charts Area */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        
        {/* Bar Chart */}
        <Card sx={{ ...glassStyle, minHeight: 400 }}>
          <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="600" mb={3}>Monthly Expense Trend</Typography>
            <Box sx={{ flex: 1, minHeight: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                  <Tooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} formatter={(value) => [`$${value.toLocaleString()}`, 'Expenses']} />
                  <Bar dataKey="expenses" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
        
        {/* Pie Chart */}
        <Card sx={{ ...glassStyle, minHeight: 400 }}>
          <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="600" mb={3}>Category Distribution</Typography>
            <Box sx={{ flex: 1, minHeight: 300, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={customTooltipStyle} itemStyle={{ color: '#fff' }} formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

      </Box>
    </Box>
  );
}