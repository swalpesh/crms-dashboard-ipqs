import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  listItemTextClasses,
} from '@mui/material';

// MUI Icons equivalents to Phosphor icons in HTML
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import PieChartIcon from '@mui/icons-material/PieChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import CallIcon from '@mui/icons-material/Call';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// --- Constants & Styled Components ---

// Theme colors based on CSS variables
const colors = {
  bgGradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0c0',
  accent: '#3b82f6', // blue
  purple: '#8b5cf6',
  green: '#10b981',
  orange: '#f97316',
  red: '#ef4444',
};

// Reusable Glass Panel Style
const glassPanelStyle = {
  background: 'rgba(255, 255, 255, 0.04)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  borderRadius: '16px',
  color: colors.textPrimary,
  height: '100%',
  transition: 'transform 0.3s ease, border-color 0.3s ease',
  '&:hover': {
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
};

// Reusable KPI Card Component
const KpiCard = ({ title, value, icon, iconBg, trend, trendLabel, trendColor }) => (
  <Card sx={glassPanelStyle}>
    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.85rem' }}>
          {title}
        </Typography>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: iconBg,
            color: '#fff',
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, fontSize: '1.5rem' }}>
        {value}
      </Typography>
      {trend && (
        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: trendColor }}>
          <TrendingUpIcon sx={{ fontSize: '1rem' }} /> {trend}
          <Box component="span" sx={{ color: colors.textSecondary, ml: 0.5 }}>
            {trendLabel}
          </Box>
        </Typography>
      )}
      {!trend && trendLabel && (
        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
          {trendLabel}
        </Typography>
      )}
    </CardContent>
  </Card>
);

// Custom Funnel Bar Component
const FunnelBar = ({ label, count, percentage, color, width }) => (
  <Box sx={{ mb: 2.5 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, fontSize: '0.85rem' }}>
      <Typography variant="body2">{label}</Typography>
      <Typography variant="caption" sx={{ color: colors.textSecondary }}>{count}</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', height: 28 }}>
      <Box
        sx={{
          flexGrow: 1,
          height: '100%',
          bgcolor: 'rgba(255,255,255,0.05)',
          borderRadius: '6px',
          position: 'relative',
          mr: 1,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: width,
            bgcolor: color,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            pl: 1.5,
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          {percentage}
        </Box>
      </Box>
      {/* SVG Arrow approximation */}
      <svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M0 0H12L20 14L12 28H0V0Z" fill={color} fillOpacity="0.3"/>
      </svg>
    </Box>
  </Box>
);


// --- Main Component ---
const FieldDashboard = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: colors.bgGradient,
        p: { xs: 2, md: 3 },
        fontFamily: "'Inter', sans-serif",
        color: colors.textPrimary,
      }}
    >
      <Grid container spacing={3}>
        {/* ================= KPIs ================= */}
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Estimated Leads Value"
            value="₹ 24.5 Lakhs"
            icon={<CurrencyRupeeIcon fontSize="small" />}
            iconBg="linear-gradient(135deg, #3b82f6, #2563eb)"
            trend="+12%"
            trendLabel="vs last month"
            trendColor={colors.green}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="New Leads"
            value="145"
            icon={<GroupIcon fontSize="small" />}
            iconBg="linear-gradient(135deg, #8b5cf6, #6d28d9)"
            trendLabel="Avg. 5 per day"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Conversion Rate"
            value="18%"
            icon={<PieChartIcon fontSize="small" />}
            iconBg="linear-gradient(135deg, #3b82f6, #2563eb)"
          />
          <Box sx={{ mt: -2, px: 3, pb: 3 }}>
             <LinearProgress variant="determinate" value={18} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: colors.accent } }} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            title="Closed Revenue"
            value="₹ 8.2 Lakhs"
            icon={<CheckCircleIcon fontSize="small" />}
            iconBg="linear-gradient(135deg, #10b981, #059669)"
            trendLabel="Q3 Goal Met"
            trendColor={colors.green}
          />
        </Grid>

        {/* ================= ROW 2: Charts ================= */}
        
        {/* Funnel Chart */}
        <Grid item xs={12} lg={6}>
          <Card sx={glassPanelStyle}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>Sales Funnel Health</Typography>
                <IconButton size="small" sx={{ color: colors.textSecondary }}>
                  <MoreHorizIcon />
                </IconButton>
              </Box>
              
              <FunnelBar label="Leads" count="145 Inquiries" percentage="100%" color={colors.accent} width="100%" />
              <FunnelBar label="Site Visits" count="60 Scheduled" percentage="41%" color={colors.purple} width="41%" />
              <FunnelBar label="Quotations" count="35 Sent" percentage="24%" color="#a78bfa" width="24%" />
              <FunnelBar label="Closed Won" count="12 Deals" percentage="8%" color={colors.green} width="8%" />
            </CardContent>
          </Card>
        </Grid>

        {/* Donut Chart Source */}
        <Grid item xs={12} lg={6}>
          <Card sx={glassPanelStyle}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
              
              {/* CSS Conic Gradient Donut approximation */}
              <Box
                sx={{
                  position: 'relative',
                  width: 180,
                  height: 180,
                  borderRadius: '50%',
                  background: `conic-gradient(
                    ${colors.accent} 0% 40%,
                    #0ea5e9 40% 70%,
                    ${colors.purple} 70% 90%,
                    ${colors.orange} 90% 100%
                  )`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)'
                }}
              >
                {/* Inner Circle */}
                <Box sx={{
                    width: 130,
                    height: 130,
                    bgcolor: '#24243e', // Matches dark part of gradient bg roughly
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 5px 15px rgba(0,0,0,0.5)'
                }}>
                   <Typography variant="caption" sx={{ color: colors.textSecondary }}>Total Leads</Typography>
                   <Typography variant="h5" sx={{ fontWeight: 700 }}>145</Typography>
                </Box>
              </Box>

              {/* Legend */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                 {[
                   { label: 'Referral', pct: '40%', color: colors.accent },
                   { label: 'Website', pct: '30%', color: '#0ea5e9' },
                   { label: 'Cold Call', pct: '20%', color: colors.purple },
                   { label: 'Social', pct: '10%', color: colors.orange },
                 ].map((item, index) => (
                   <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '0.85rem' }}>
                     <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                     <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                       {item.label} <Box component="span" sx={{ color: colors.textPrimary, fontWeight: 600 }}>({item.pct})</Box>
                     </Typography>
                   </Box>
                 ))}
              </Box>

            </CardContent>
          </Card>
        </Grid>

        {/* ================= ROW 3: Tables & Lists ================= */}

        {/* Hot Leads Table */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ ...glassPanelStyle, p: 0, overflow: 'hidden' }}>
            <Box sx={{ p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                 <WhatshotIcon sx={{ color: colors.orange }} />
                 <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>Hot Leads</Typography>
               </Box>
               <Button size="small" endIcon={<ChevronRightIcon />} sx={{ color: colors.accent, textTransform: 'none' }}>
                 View all
               </Button>
            </Box>

            <TableContainer>
              <Table sx={{ '& .MuiTableCell-root': { borderBottom: '1px solid rgba(255,255,255,0.05)', color: colors.textPrimary } }}>
                <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ color: colors.textSecondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>Client</TableCell>
                    <TableCell sx={{ color: colors.textSecondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>Value</TableCell>
                    <TableCell sx={{ color: colors.textSecondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { name: 'Mahindra Auto', contact: 'Rahul M.', value: '₹ 1.5 L', initial: 'MA', color: colors.purple },
                    { name: 'TechSpace Park', contact: 'Sarah L.', value: '₹ 50 k', initial: 'TS', color: colors.accent },
                  ].map((row, index) => (
                    <TableRow key={index} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02) !important' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: row.color, width: 36, height: 36, fontSize: '0.85rem', fontWeight: 600 }}>
                            {row.initial}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>{row.contact}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.value}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<CallIcon sx={{ fontSize: '1rem !important' }} />}
                          sx={{
                            bgcolor: colors.accent,
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            py: 0.5,
                            '&:hover': { bgcolor: '#2563eb' }
                          }}
                        >
                          Call
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Top Performers List */}
        <Grid item xs={12} lg={6}>
           <Card sx={glassPanelStyle}>
             <CardContent sx={{ p: 3 }}>
               <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 2 }}>Top Performers</Typography>
               
               <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 0 }}>
                  {/* Performer 1 (Winner) */}
                  <ListItem
                    sx={{
                      bgcolor: 'rgba(255, 206, 0, 0.1)',
                      border: '1px solid rgba(255, 206, 0, 0.2)',
                      borderRadius: '12px',
                      p: 1.5
                    }}
                    secondaryAction={
                      <Box sx={{ textAlign: 'right' }}>
                         <Typography variant="body2" sx={{ fontWeight: 700, color: colors.textPrimary }}>₹ 4.0L</Typography>
                         <EmojiEventsIcon sx={{ color: '#ffce00', fontSize: '1.1rem' }} />
                      </Box>
                    }
                  >
                     <Typography variant="h6" sx={{ color: '#ffce00', mr: 2, fontWeight: 700, width: 20, textAlign: 'center' }}>1</Typography>
                     <ListItemAvatar>
                       <Avatar src="https://i.pravatar.cc/150?img=68" />
                     </ListItemAvatar>
                     <ListItemText
                       primary="Amit V."
                       secondary="Sales Executive"
                       primaryTypographyProps={{ fontWeight: 600 }}
                       secondaryTypographyProps={{ color: colors.textSecondary, fontSize: '0.75rem' }}
                       sx={{ [`& .${listItemTextClasses.primary}`]: { color: colors.textPrimary } }}
                     />
                  </ListItem>

                  {/* Performer 2 */}
                  <ListItem
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '12px',
                      p: 1.5
                    }}
                    secondaryAction={
                      <Typography variant="body2" sx={{ fontWeight: 700, color: colors.textPrimary }}>₹ 2.5L</Typography>
                    }
                  >
                     <Typography variant="h6" sx={{ color: colors.textSecondary, mr: 2, fontWeight: 600, width: 20, textAlign: 'center' }}>2</Typography>
                     <ListItemAvatar>
                       <Avatar src="https://i.pravatar.cc/150?img=44" />
                     </ListItemAvatar>
                     <ListItemText
                       primary="Sarah L."
                       secondary="Senior Executive"
                       primaryTypographyProps={{ fontWeight: 600 }}
                       secondaryTypographyProps={{ color: colors.textSecondary, fontSize: '0.75rem' }}
                       sx={{ [`& .${listItemTextClasses.primary}`]: { color: colors.textPrimary } }}
                     />
                  </ListItem>
               </List>

             </CardContent>
           </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default FieldDashboard;