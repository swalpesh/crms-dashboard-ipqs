import React from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  Typography, 
  Button, 
  Avatar, 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';

const glassStyle = {
  background: 'rgba(25, 20, 40, 0.45)', 
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  color: '#fff',
  p: 3
};

const recentVisits = [
  { id: 'PRJ-2026-88A', site: 'Nexus Facility Audit', date: 'Oct 12 - Oct 15', purpose: 'Q3 Compliance Review', amt: '$1,245.50', status: 'Pending' },
  { id: 'OP-MGR-44', site: 'Seattle HQ Integration', date: 'Sep 28 - Oct 02', purpose: 'System Migration Support', amt: '$2,875.00', status: 'Approved' },
];

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4, width: '100%', minHeight: '100vh', background: '#0b0914' }}>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/employees')} sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Back to Profiles
        </Button>
        <Button variant="outlined" startIcon={<DownloadIcon />} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
          Export Report
        </Button>
      </Box>

      {/* Main Profile Header */}
      <Card sx={{ ...glassStyle, display: 'flex', alignItems: 'center', gap: 4, mb: 4 }}>
        <Avatar sx={{ width: 100, height: 100, bgcolor: '#3b82f6', fontSize: '2rem' }}>SJ</Avatar>
        <Box flex={1}>
          <Typography variant="h3" fontWeight="800">Sarah Jenkins</Typography>
          <Typography variant="h6" color="rgba(255,255,255,0.7)">Senior Regional Auditor • {id}</Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Chip label="Dept: Compliance & Audit" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
            <Chip label="Active Field Status" size="small" sx={{ bgcolor: 'rgba(59,130,246,0.2)', color: '#60a5fa' }} />
          </Box>
        </Box>
        
        {/* Quick Stats in Header */}
        <Box sx={{ display: 'flex', gap: 3, borderLeft: '1px solid rgba(255,255,255,0.2)', pl: 4 }}>
          <Box textAlign="center">
            <Typography variant="caption" color="rgba(255,255,255,0.5)">Total YTD Visits</Typography>
            <Typography variant="h4" fontWeight="bold">42</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="caption" color="rgba(255,255,255,0.5)">Total Claimed (YTD)</Typography>
            <Typography variant="h4" fontWeight="bold">$34,250.00</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="caption" color="rgba(255,255,255,0.5)">Approval Rate</Typography>
            <Typography variant="h4" fontWeight="bold" color="#3b82f6">98.5%</Typography>
          </Box>
        </Box>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        {['This Month', 'YTD Travel Costs', 'YTD Accommodation', 'YTD Meals'].map((title, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={glassStyle}>
              <Typography variant="caption" color="rgba(255,255,255,0.5)">{title}</Typography>
              <Typography variant="h5" fontWeight="bold" mt={1}>
                {i === 0 ? '$4,120.50' : i === 1 ? '$15,412.00' : i === 2 ? '$10,960.00' : '$6,165.00'}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tables & Charts Placeholder */}
      <Card sx={{ ...glassStyle, p: 0 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="h6" fontWeight="600">Recent Site Visits & Claims</Typography>
        </Box>
        <Table>
          <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
            <TableRow>
              <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>Site / Project Name</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>Visit Date</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>Primary Purpose</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>Claimed Amt</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentVisits.map((row, i) => (
              <TableRow key={i}>
                <TableCell sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Typography variant="body2">{row.site}</Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.5)">{row.id}</Typography>
                </TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>{row.date}</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>{row.purpose}</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>{row.amt}</TableCell>
                <TableCell sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Chip label={row.status} size="small" sx={{ bgcolor: row.status === 'Approved' ? 'rgba(74,222,128,0.2)' : 'rgba(59,130,246,0.2)', color: row.status === 'Approved' ? '#4ade80' : '#60a5fa' }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}