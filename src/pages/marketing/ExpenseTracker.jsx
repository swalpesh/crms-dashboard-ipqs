import React from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button, 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  LinearProgress,
  TableContainer
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';

// Reusable Glass Card Style - Adjusted with box-sizing to prevent overflow
const glassStyle = {
  background: 'rgba(30, 27, 46, 0.7)', 
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  color: '#fff',
  p: 3,
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  overflow: 'hidden'
};

const trackerData = [
  { emp: 'John Doe', site: 'NYC-HQ-Audit', date: 'Oct 12, 2026', travel: '$450.00', hotel: '$320.00', food: '$85.50', misc: '-' },
  { emp: 'Alice Smith', site: 'LON-Tech-Conf', date: 'Oct 14, 2026', travel: '$1,200.00', hotel: '$800.00', food: '$150.00', misc: '$45.00' },
  { emp: 'Sarah Jenkins', site: 'Client-Acq-SF', date: 'Oct 15, 2026', travel: '$350.00', hotel: '$450.00', food: '$210.00', misc: '-' },
];

export default function ExpenseTracker() {
  const [tabValue, setTabValue] = React.useState(0);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: '100%', minHeight: '100vh', background: 'transparent', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" color="#fff" mb={1}>Expense Tracker</Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.6)">Monitor and audit corporate and individual expenditures.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<PictureAsPdfIcon />} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)', textTransform: 'none' }}>PDF</Button>
          <Button variant="outlined" startIcon={<TableChartIcon />} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)', textTransform: 'none' }}>Excel</Button>
        </Box>
      </Box>

      {/* Tabs - Added explicit colors to override global CSS bleed */}
      <Tabs 
        value={tabValue} 
        onChange={(e, v) => setTabValue(v)} 
        sx={{ 
          mb: 4, 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          '& .MuiTab-root': { color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase' }, 
          '& .Mui-selected': { color: '#3b82f6 !important' }, 
          '& .MuiTabs-indicator': { bgcolor: '#3b82f6', height: 3 } 
        }}
      >
        <Tab label="Organization Expense Tracker" />
        <Tab label="Individual Expense Tracker" />
      </Tabs>

      {/* Top Metric Cards - Strict CSS Grid */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, 
          gap: 3, 
          mb: 4 
        }}
      >
        {[
          { title: 'TOTAL YTD EXPENSE', val: '$1,245,890.00', sub: '↑ +12% vs last year', color: '#3b82f6' },
          { title: 'APPROVED (MTD)', val: '$84,230.50', sub: '342 Vouchers processed', color: '#10b981' },
          { title: 'PENDING APPROVAL', val: '$12,450.00', sub: '45 Vouchers awaiting review', color: '#f59e0b' },
          { title: 'REJECTED (MTD)', val: '$3,120.00', sub: '12 Vouchers denied', color: '#ef4444' }
        ].map((metric, i) => (
          <Card key={i} sx={{ ...glassStyle, borderLeft: `4px solid ${metric.color}`, p: 3 }}>
            <Typography variant="caption" color="rgba(255,255,255,0.5)" fontWeight="bold">{metric.title}</Typography>
            <Typography variant="h5" fontWeight="800" mt={1} mb={0.5}>{metric.val}</Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.6)">{metric.sub}</Typography>
          </Card>
        ))}
      </Box>

      {/* Main Content Area - Strict CSS Grid */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, 
          gap: 3 
        }}
      >
        {/* Table Section */}
        <Card sx={{ ...glassStyle, p: 0 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h6" fontWeight="600">Recent Expense Log</Typography>
          </Box>
          <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
            <Table sx={{ minWidth: 600 }}>
              <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
                <TableRow>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>Employee</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>Site/Project</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>Date</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>Travel</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>Hotel</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>Food</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trackerData.map((row, i) => (
                  <TableRow key={i} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                    <TableCell sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>{row.emp}</TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>{row.site}</TableCell>
                    <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>{row.date}</TableCell>
                    <TableCell sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}>{row.travel}</TableCell>
                    <TableCell sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}>{row.hotel}</TableCell>
                    <TableCell sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}>{row.food}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Analytics Section */}
        <Card sx={glassStyle}>
          <Typography variant="h6" fontWeight="600" mb={4}>Category Analysis (YTD)</Typography>
          
          <Box mb={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="#fff">Travel</Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)">45%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={45} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#3b82f6', borderRadius: 3 } }} />
          </Box>

          <Box mb={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="#fff">Hotel & Acc.</Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)">30%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={30} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 3 } }} />
          </Box>

          <Box mb={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="#fff">Meals/Food</Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)">15%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={15} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#f59e0b', borderRadius: 3 } }} />
          </Box>

          <Box sx={{ mt: 'auto', p: 2, bgcolor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 2 }}>
            <Typography variant="caption" color="rgba(255,255,255,0.7)" sx={{ lineHeight: 1.5, display: 'block' }}>
              <strong style={{ color: '#60a5fa' }}>Insight:</strong> Travel expenses are up 8% compared to Q3. Hotel costs remain stable within corporate policy limits.
            </Typography>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}