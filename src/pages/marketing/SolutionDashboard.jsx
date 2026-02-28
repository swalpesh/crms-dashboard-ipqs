import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  AvatarGroup,
  Chip,
  IconButton,
  Link
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

// Custom Theme Colors
const themeColors = {
  bgApp: '#201D41',
  bgSurface: '#2B2853',
  textPrimary: '#FFFFFF',
  textMuted: '#8E8CA7',
  accentGreen: '#22C55E',
  accentBlue: '#3B82F6',
  accentPurple: '#8B5CF6',
  accentLightblue: '#0EA5E9',
  borderLight: 'rgba(255,255,255,0.05)',
};

// Dummy Data Arrays
const statsData = [
  { label: 'TOTAL ACTIVE REQUESTS', value: '24', trend: '↗ 8%', trendColor: themeColors.accentGreen },
  { label: 'SOLUTIONS PROVIDED', value: '18', context: 'this month' },
  { label: 'LEADS GENERATED COUNT', value: '42', trend: '↗ 12%', trendColor: themeColors.accentGreen },
  { label: 'AVG. TURNAROUND TIME', value: '2.5', contextLarge: 'Days' },
];

const tableData = [
  {
    id: 1,
    leadName: 'Cloud Migration Strategy',
    company: 'Retail Dynamics Group',
    avatars: ['#FB923C', '#2DD4BF'],
    priority: 'Critical',
    priorityColor: '#EF4444',
    status: 'REVIEWING',
    statusBg: 'rgba(139, 92, 246, 0.15)',
    statusColor: '#A78BFA',
    date: 'Oct 24, 2023'
  },
  {
    id: 2,
    leadName: 'Security Framework Audit',
    company: 'Apex Global Logistics',
    avatars: ['#9CA3AF'],
    priority: 'High',
    priorityColor: '#F59E0B',
    status: 'PENDING',
    statusBg: 'rgba(142, 140, 167, 0.15)',
    statusColor: '#C4C6E1',
    date: 'Oct 25, 2023'
  },
  {
    id: 3,
    leadName: 'API Integration Design',
    company: 'FinTech Hub',
    avatars: ['#60A5FA', '#A8A29E'],
    priority: 'Medium',
    priorityColor: '#3B82F6',
    status: 'IN PROGRESS',
    statusBg: 'rgba(34, 197, 94, 0.15)',
    statusColor: '#4ADE80',
    date: 'Oct 26, 2023'
  }
];

export default function SolutionDashboard() {
  return (
    <Box sx={{ backgroundColor: themeColors.bgApp, minHeight: '100vh', p: 4, fontFamily: 'Inter, sans-serif' }}>
      <Box sx={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* Top Stats Row */}
        <Grid container spacing={3}>
          {statsData.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ bgcolor: themeColors.bgSurface, borderRadius: 4, boxShadow: 'none' }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                  <Typography sx={{ color: themeColors.textMuted, fontSize: 11, fontWeight: 600, mb: 1.5, letterSpacing: 0.5 }}>
                    {stat.label}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                    <Typography sx={{ color: themeColors.textPrimary, fontSize: 32, fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                    {stat.trend && (
                      <Typography sx={{ color: stat.trendColor, fontSize: 13, fontWeight: 500 }}>
                        {stat.trend}
                      </Typography>
                    )}
                    {stat.context && (
                      <Typography sx={{ color: themeColors.textMuted, fontSize: 12 }}>
                        {stat.context}
                      </Typography>
                    )}
                    {stat.contextLarge && (
                      <Typography sx={{ color: themeColors.textMuted, fontSize: 16, fontWeight: 500 }}>
                        {stat.contextLarge}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Middle Charts Row */}
        <Grid container spacing={3}>
          {/* Line Chart Placeholder */}
          <Grid item xs={12} md={8}>
            <Card sx={{ bgcolor: themeColors.bgSurface, borderRadius: 4, height: '100%', boxShadow: 'none' }}>
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography sx={{ color: themeColors.textPrimary, fontSize: 16, fontWeight: 600 }}>
                    Solutions Provided
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Chip label="Weekly" size="small" sx={{ bgcolor: themeColors.borderLight, color: themeColors.textPrimary, fontWeight: 500 }} />
                    <IconButton size="small" sx={{ color: themeColors.textMuted }}>
                      <MoreHorizIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'flex-end', borderBottom: `1px solid ${themeColors.borderLight}`, pb: 1.5, minHeight: 200 }}>
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', color: themeColors.textMuted, fontSize: 11, fontWeight: 500 }}>
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                      <span key={day}>{day}</span>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Donut Chart */}
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: themeColors.bgSurface, borderRadius: 4, height: '100%', boxShadow: 'none' }}>
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mb: 4 }}>
                  <Typography sx={{ color: themeColors.textPrimary, fontSize: 16, fontWeight: 600 }}>
                    Leads by Person
                  </Typography>
                </Box>
                
                {/* CSS Donut */}
                <Box sx={{
                  width: 180, height: 180, borderRadius: '50%',
                  background: `conic-gradient(${themeColors.accentBlue} 0% 50%, ${themeColors.accentPurple} 50% 83%, ${themeColors.accentLightblue} 83% 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4
                }}>
                  <Box sx={{
                    width: 144, height: 144, borderRadius: '50%', bgcolor: themeColors.bgSurface,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Typography sx={{ color: themeColors.textPrimary, fontSize: 32, fontWeight: 700, lineHeight: 1 }}>24</Typography>
                    <Typography sx={{ color: themeColors.textMuted, fontSize: 11, fontWeight: 500, letterSpacing: 0.5 }}>ACTIVE</Typography>
                  </Box>
                </Box>

                {/* Legend */}
                <Box sx={{ width: '100%', px: 2 }}>
                  {[
                    { name: 'Sarah Jenkins', val: 12, color: themeColors.accentBlue },
                    { name: 'Marcus Chen', val: 8, color: themeColors.accentPurple },
                    { name: 'Elena Rodriguez', val: 4, color: themeColors.accentLightblue }
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: i !== 2 ? 2 : 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', color: themeColors.textMuted, fontSize: 13 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color, mr: 1.5 }} />
                        {item.name}
                      </Box>
                      <Typography sx={{ color: themeColors.textPrimary, fontSize: 13, fontWeight: 600 }}>{item.val}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Bottom Table Row */}
        <Card sx={{ bgcolor: themeColors.bgSurface, borderRadius: 4, boxShadow: 'none' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ color: themeColors.textPrimary, fontSize: 16, fontWeight: 600 }}>
                Recent Solution Requests (Pending)
              </Typography>
              <Link href="#" underline="hover" sx={{ color: themeColors.accentBlue, fontSize: 13, fontWeight: 500 }}>
                View all history
              </Link>
            </Box>

            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    {['LEAD NAME', 'REQUESTED BY', 'PRIORITY', 'STATUS'].map((head) => (
                      <TableCell key={head} sx={{ color: themeColors.textMuted, fontSize: 11, fontWeight: 600, borderBottom: `1px solid ${themeColors.borderLight}`, py: 2 }}>
                        {head}
                      </TableCell>
                    ))}
                    <TableCell align="right" sx={{ color: themeColors.textMuted, fontSize: 11, fontWeight: 600, borderBottom: `1px solid ${themeColors.borderLight}`, py: 2 }}>
                      DATE
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableData.map((row) => (
                    <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ borderBottom: `1px solid ${themeColors.borderLight}`, py: 2.5 }}>
                        <Typography sx={{ color: themeColors.textPrimary, fontSize: 14, fontWeight: 600, mb: 0.5 }}>{row.leadName}</Typography>
                        <Typography sx={{ color: themeColors.textMuted, fontSize: 12 }}>{row.company}</Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${themeColors.borderLight}`, py: 2.5 }}>
                        <AvatarGroup max={4} sx={{ justifyContent: 'flex-end', width: 'fit-content', '& .MuiAvatar-root': { width: 32, height: 32, border: `2px solid ${themeColors.bgSurface}` } }}>
                          {row.avatars.map((bgColor, idx) => (
                            <Avatar key={idx} sx={{ bgcolor: bgColor }}> </Avatar>
                          ))}
                        </AvatarGroup>
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${themeColors.borderLight}`, py: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: themeColors.textPrimary, fontSize: 13, fontWeight: 500 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: row.priorityColor, mr: 1.5 }} />
                          {row.priority}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${themeColors.borderLight}`, py: 2.5 }}>
                        <Chip 
                          label={row.status} 
                          sx={{ 
                            bgcolor: row.statusBg, 
                            color: row.statusColor, 
                            borderRadius: 1.5, 
                            fontSize: 10, 
                            fontWeight: 700, 
                            height: 24, 
                            letterSpacing: 0.5 
                          }} 
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ color: themeColors.textMuted, fontSize: 13, borderBottom: `1px solid ${themeColors.borderLight}`, py: 2.5 }}>
                        {row.date}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

      </Box>
    </Box>
  );
}