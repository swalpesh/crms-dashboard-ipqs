import React, { useState, useEffect } from 'react';
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
  Chip,
  IconButton,
  Link,
  CircularProgress
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { 
  DotsThree, 
  Pulse, 
  Lightbulb, 
  Clock, 
  Users 
} from '@phosphor-icons/react';

// --- API HELPERS ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

// Helper to format date & time nicely (e.g. 28 Feb 2026 19:07:56)
const formatTableDateTime = (dateStr, timeStr) => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year} ${timeStr || ''}`.trim();
  } catch {
    return dateStr;
  }
};

// Custom Theme Colors - Premium Dark Mode
const themeColors = {
  bgApp: '#131127', 
  bgSurface: '#1F1D36',
  textPrimary: '#FFFFFF',
  textMuted: '#8E8CA7',
  accentGreen: '#10B981',
  accentBlue: '#3B82F6',
  accentPurple: '#8B5CF6',
  accentLightblue: '#0EA5E9',
  borderLight: 'rgba(255,255,255,0.06)',
  cardShadow: '0 12px 40px rgba(0, 0, 0, 0.25)', 
};

// Dummy Chart Data (Fallback for the Solutions Provided graph)
const fallbackChartData = [
  { name: 'Mon', provided: 0 },
  { name: 'Tue', provided: 0 },
  { name: 'Wed', provided: 0 },
  { name: 'Thu', provided: 0 },
  { name: 'Fri', provided: 0 },
  { name: 'Sat', provided: 3 },
  { name: 'Sun', provided: 0 },
];

// --- SUB-COMPONENTS ---
function StatCard({ label, value, trend, trendColor, context, contextLarge, icon: Icon, color }) {
  return (
    <Card
      sx={{
        bgcolor: themeColors.bgSurface,
        borderRadius: 4,
        boxShadow: themeColors.cardShadow,
        border: `1px solid ${themeColors.borderLight}`,
        transition: 'all 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        '&:hover': { transform: 'translateY(-4px)', borderColor: `${color}50`, boxShadow: `0 12px 40px ${color}20` },
      }}
    >
      <CardContent sx={{ p: 3, pb: '24px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ p: 1.2, borderRadius: 3, bgcolor: `${color}15`, color: color, display: 'flex' }}>
            <Icon size={24} weight="duotone" />
          </Box>
          {trend && (
            <Chip 
              label={trend} 
              size="small" 
              sx={{ bgcolor: `${trendColor}15`, color: trendColor, fontWeight: 700, fontSize: '0.75rem', height: 24 }} 
            />
          )}
        </Box>
        
        <Typography sx={{ color: themeColors.textMuted, fontSize: 11, fontWeight: 700, mb: 0.5, letterSpacing: 0.8 }}>
          {label}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography sx={{ color: themeColors.textPrimary, fontSize: 32, fontWeight: 800 }}>
            {value}
          </Typography>

          {context && (
            <Typography sx={{ color: themeColors.textMuted, fontSize: 13, fontWeight: 500 }}>
              {context}
            </Typography>
          )}

          {contextLarge && (
            <Typography sx={{ color: themeColors.textMuted, fontSize: 15, fontWeight: 600 }}>
              {contextLarge}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, dataKey, dataName, lineColor, data }) {
  return (
    <Card
      sx={{
        bgcolor: themeColors.bgSurface,
        borderRadius: 4,
        boxShadow: themeColors.cardShadow,
        border: `1px solid ${themeColors.borderLight}`,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 }, pb: '24px !important', display: 'flex', flexDirection: 'column', flex: 1, width: '100%', boxSizing: 'border-box' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography sx={{ color: themeColors.textPrimary, fontSize: 17, fontWeight: 700 }}>
            {title}
          </Typography>
          <Chip
            label="Weekly"
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: themeColors.textPrimary, fontWeight: 600 }}
          />
        </Box>

        <Box sx={{ width: '100%', flex: 1, minHeight: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke={themeColors.textMuted} tick={{ fill: themeColors.textMuted, fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis allowDecimals={false} stroke={themeColors.textMuted} tick={{ fill: themeColors.textMuted, fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip contentStyle={{ backgroundColor: '#1E1B3A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', color: '#fff' }} itemStyle={{ fontWeight: 600 }} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: themeColors.textPrimary, paddingBottom: '20px' }} />
              <Line type="monotone" name={dataName} dataKey={dataKey} stroke={lineColor} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: themeColors.bgSurface }} activeDot={{ r: 6, strokeWidth: 0, fill: lineColor }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

// --- MAIN DASHBOARD COMPONENT ---
export default function SolutionDashboard() {
  const [loading, setLoading] = useState(true);
  
  // Dashboard API States
  const [stats, setStats] = useState({
    activeRequests: 0,
    solutionsProvided: 0,
    turnaroundTime: 0,
    leadsGenerated: 0
  });

  // Table Data State
  const [tableData, setTableData] = useState([]);

  // Chart Data States
  const [incomingChartData, setIncomingChartData] = useState([]);
  const [providedChartData, setProvidedChartData] = useState([]);

  // Fetch all API data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) return;

        // Fetch All APIs concurrently
        const [leadsRes, statsRes, solutionsRes, weeklyRes, weeklyCompletedRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/sleads/my-leads?lead_status=new`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/sleads/solutions/stats/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/sleads/solutions`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/sleads/solutions/stats/weekly`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/sleads/solutions/stats/weekly-completed`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        // Process New Leads (For Active Requests Stat)
        let activeCount = 0;
        if (leadsRes.ok) {
          const leadsData = await leadsRes.json();
          activeCount = leadsData.total || 0;
        }

        // Process Stats Dashboard
        let solProvided = 0;
        let turnTime = 0;
        let leadsGen = 0;

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          solProvided = statsData.data?.solutions_this_month || 0;
          turnTime = statsData.data?.average_turnaround_time_days || 0;
          leadsGen = statsData.data?.total_solutions_provided || 0;
        }

        setStats({
          activeRequests: activeCount,
          solutionsProvided: solProvided,
          turnaroundTime: turnTime,
          leadsGenerated: leadsGen
        });

        // Process Table Data
        if (solutionsRes.ok) {
          const solutionsData = await solutionsRes.json();
          setTableData(solutionsData.data || []);
        }

        // Process Weekly Incoming Chart Data (Solutions Generated)
        if (weeklyRes.ok) {
          const weeklyData = await weeklyRes.json();
          if (weeklyData.data) {
             const formattedChartData = weeklyData.data.map(item => ({
               name: item.day.substring(0, 3), // Convert "Monday" to "Mon"
               incoming: item.incoming_leads_count
             }));
             setIncomingChartData(formattedChartData);
          }
        }

        // Process Weekly Completed Chart Data (Solutions Provided)
        if (weeklyCompletedRes.ok) {
          const weeklyCompletedData = await weeklyCompletedRes.json();
          if (weeklyCompletedData.data) {
             const formattedProvidedData = weeklyCompletedData.data.map(item => ({
               name: item.day.substring(0, 3), // Convert "Monday" to "Mon"
               provided: item.solutions_provided_count
             }));
             setProvidedChartData(formattedProvidedData);
          }
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: themeColors.bgApp,
        minHeight: '100vh',
        width: '100%',
        p: { xs: 2, md: 4 },
        boxSizing: 'border-box',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* REMOVED maxWidth: 1400 
        SET width: '100%' so it completely fills the available horizontal space 
      */}
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        {loading && (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress sx={{ color: themeColors.accentPurple }} />
          </Box>
        )}

        {/* --- TOP SECTION: 4 Stats in one Row --- */}
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              label="ACTIVE REQUESTS" 
              value={stats.activeRequests} 
              icon={Pulse} 
              color={themeColors.accentBlue} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              label="SOLUTIONS PROVIDED" 
              value={stats.solutionsProvided} 
              context="this month" 
              icon={Lightbulb} 
              color={themeColors.accentPurple} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              label="TURNAROUND TIME" 
              value={stats.turnaroundTime} 
              contextLarge="Days" 
              icon={Clock} 
              color={themeColors.accentLightblue} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              label="LEADS GENERATED" 
              value={stats.leadsGenerated} 
              icon={Users} 
              color={themeColors.accentGreen} 
            />
          </Grid>
        </Grid>

        {/* --- MIDDLE SECTION: Two Side-by-Side Charts --- */}
      
          <div className="row">
            <div className="col-md-6">
              <ChartCard 
              title="Solutions Generated" 
              dataKey="incoming" 
              dataName="Generated Leads" 
              lineColor={themeColors.accentLightblue} 
              data={incomingChartData}
            />
            </div>
            <div className="col-md-6">
              <ChartCard 
              title="Solutions Provided" 
              dataKey="provided" 
              dataName="Provided Solutions" 
              lineColor={themeColors.accentPurple} 
              data={providedChartData.length > 0 ? providedChartData : fallbackChartData}
            />
            </div>
          </div>
          
          
 

        {/* --- BOTTOM SECTION: API Mapped Table --- */}
        <Card
          sx={{
            bgcolor: themeColors.bgSurface,
            borderRadius: 4,
            boxShadow: themeColors.cardShadow,
            border: `1px solid ${themeColors.borderLight}`,
            width: '100%',
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 4 }, pb: '16px !important' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ color: themeColors.textPrimary, fontSize: 18, fontWeight: 700 }}>
                Recent Solutions Log
              </Typography>
              <Link href="#" underline="hover" sx={{ color: themeColors.accentBlue, fontSize: 14, fontWeight: 600 }}>
                View all history
              </Link>
            </Box>

            <TableContainer>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    {['LEAD & COMPANY', 'PROVIDED BY', 'SOLUTION SNIPPET', 'STATUS'].map((head) => (
                      <TableCell
                        key={head}
                        sx={{
                          color: themeColors.textMuted,
                          fontSize: 11,
                          fontWeight: 700,
                          borderBottom: `1px solid ${themeColors.borderLight}`,
                          py: 2,
                          letterSpacing: 1,
                        }}
                      >
                        {head}
                      </TableCell>
                    ))}
                    <TableCell
                      align="right"
                      sx={{
                        color: themeColors.textMuted,
                        fontSize: 11,
                        fontWeight: 700,
                        borderBottom: `1px solid ${themeColors.borderLight}`,
                        py: 2,
                        letterSpacing: 1,
                      }}
                    >
                      DATE & TIME
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {tableData.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: themeColors.textMuted, border: 0 }}>
                        No solutions logged yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {tableData.map((row) => (
                    <TableRow
                      key={row.solution_id}
                      sx={{
                        transition: 'background-color 0.2s',
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                      }}
                    >
                      {/* Lead & Company Name */}
                      <TableCell sx={{ borderBottom: `1px solid ${themeColors.borderLight}`, py: 2.5 }}>
                        <Typography sx={{ color: themeColors.textPrimary, fontSize: 14, fontWeight: 700, mb: 0.5 }}>
                          {row.lead_name}
                        </Typography>
                        <Typography sx={{ color: themeColors.textMuted, fontSize: 13, fontWeight: 500 }}>
                          {row.company_name}
                        </Typography>
                      </TableCell>

                      {/* Provided By */}
                      <TableCell sx={{ borderBottom: `1px solid ${themeColors.borderLight}`, py: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar 
                            src={`https://ui-avatars.com/api/?name=${row.provided_by_name}&background=random`} 
                            sx={{ width: 30, height: 30, fontSize: 12, fontWeight: 600 }}
                          />
                          <Typography sx={{ color: themeColors.textPrimary, fontSize: 13, fontWeight: 600 }}>
                            {row.provided_by_name}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Solution Snippet */}
                      <TableCell sx={{ borderBottom: `1px solid ${themeColors.borderLight}`, py: 2.5, maxWidth: 250 }}>
                        <Typography noWrap sx={{ color: themeColors.textMuted, fontSize: 13, fontWeight: 500 }}>
                          {row.solution_provided}
                        </Typography>
                      </TableCell>

                      {/* Hardcoded Status for Solutions */}
                      <TableCell sx={{ borderBottom: `1px solid ${themeColors.borderLight}`, py: 2.5 }}>
                        <Chip
                          label="DELIVERED"
                          sx={{
                            bgcolor: 'rgba(16, 185, 129, 0.15)', // Green subtle bg
                            color: themeColors.accentGreen,
                            borderRadius: 1.5,
                            fontSize: 10,
                            fontWeight: 800,
                            height: 26,
                            letterSpacing: 0.5,
                            border: `1px solid ${themeColors.accentGreen}40`,
                          }}
                        />
                      </TableCell>

                      {/* Formatted Date & Time */}
                      <TableCell
                        align="right"
                        sx={{
                          color: themeColors.textMuted,
                          fontSize: 13,
                          fontWeight: 500,
                          borderBottom: `1px solid ${themeColors.borderLight}`,
                          py: 2.5,
                        }}
                      >
                        {formatTableDateTime(row.date, row.time)}
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