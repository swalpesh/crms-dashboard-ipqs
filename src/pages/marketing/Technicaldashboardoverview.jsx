import React from 'react';
import { Box, Card, CardContent, Typography, Button, Menu, MenuItem, useTheme, useMediaQuery } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data
const chartData = [
  { name: 'Mon', value: 30 },
  { name: 'Tue', value: 25 },
  { name: 'Wed', value: 30 },
  { name: 'Thu', value: 28 },
  { name: 'Fri', value: 32 },
  { name: 'Sat', value: 15 },
  { name: 'Sun', value: 20 },
];

// Glass Style
const glassCardStyle = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'radial-gradient(circle at top right, rgba(129, 140, 248, 0.2), transparent 60%)', 
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: 0, 
  },

  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 30px rgba(0,0,0,0.5)',
    borderColor: 'rgba(255,255,255,0.2)',
    '&::before': { opacity: 1 },
  },
};

const TechnicalDashboardOverview = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  // Responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  return (
    <Box sx={{ width: '100%', flexGrow: 1 }}> 
      <Typography variant="h5" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
        Technical overview
      </Typography>

      {/* CHANGED: Replaced Grid with Flexbox 
        This forces all 4 items to split the 100% width equally (flex: 1)
      */}
      <Box sx={{ 
        display: 'flex', 
        width: '100%', 
        gap: 3, // Spacing between cards
        mb: 4,
        flexDirection: { xs: 'column', md: 'row' } // Stack on mobile, Row on desktop
      }}>
        
        {/* Card 1 */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Card sx={glassCardStyle}>
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
              <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>Scheduled Visits</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>12</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Card 2 */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Card sx={glassCardStyle}>
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
              <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>Visits in Progress</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>4</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Card 3 */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Card sx={glassCardStyle}>
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>Visits</Typography>
                <Button 
                  size="small" 
                  onClick={handleClick}
                  endIcon={<ArrowDropDownIcon sx={{ fontSize: 12 }} />}
                  sx={{ 
                    color: '#cbd5e1', 
                    background: 'rgba(0,0,0,0.2)', 
                    minWidth: 0, 
                    px: 1.5, 
                    py: 0.5, 
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    zIndex: 10,
                    '&:hover': { background: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  (Today)
                </Button>
                <Menu 
                    anchorEl={anchorEl} 
                    open={open} 
                    onClose={handleClose}
                    PaperProps={{ sx: { bgcolor: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' } }}
                >
                  <MenuItem onClick={handleClose}>Today</MenuItem>
                  <MenuItem onClick={handleClose}>Weekly</MenuItem>
                <MenuItem onClick={handleClose}>Monthly</MenuItem>
                
                </Menu>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>28</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Card 4 */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Card sx={glassCardStyle}>
            <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
              <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>Pending Reports</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>3</Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Chart Section */}
      <Card sx={{ ...glassCardStyle, p: 0, cursor: 'default', display: 'block' }}>
        <Box sx={{ p: 3, pb: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, position: 'relative', zIndex: 1 }}>
                Technical Performance Chart
            </Typography>
        </Box>
        
        <Box sx={{ width: '100%', height: isMobile ? 250 : 350, position: 'relative', zIndex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155' }} 
                itemStyle={{ color: '#818cf8' }} 
              />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                dy={10} 
              />
              <YAxis hide />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#818cf8" 
                strokeWidth={5} // Thicker line
                fill="url(#colorVal)"
                dot={{ r: 6, strokeWidth: 4, stroke: '#818cf8', fill: '#1e1b32' }} // Blue border, dark fill
                activeDot={{ r: 8, strokeWidth: 0, fill: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Card>
    </Box>
  );
};

export default TechnicalDashboardOverview;