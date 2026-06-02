import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button, 
  TextField, 
  MenuItem, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  TableContainer,
  Chip,
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';

// Reusable Glass Card Style - Added boxSizing to prevent layout collapse
const glassStyle = {
  background: 'rgba(30, 27, 46, 0.7)', 
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  color: '#fff',
  boxSizing: 'border-box'
};

// Custom TextField styling for glass theme
const glassInput = {
  '& .MuiOutlinedInput-root': {
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
};

const mockVouchers = [
  { id: 'VCH-2026-089', name: 'John Doe', empId: 'EMP-1042', dept: 'Field Engineering', site: 'Site Alpha-Omega', date: 'Oct 12 - Oct 15', amount: '$1,245.50', status: 'Pending' },
  { id: 'VCH-2026-090', name: 'Sarah Wong', empId: 'EMP-2105', dept: 'Enterprise Sales', site: 'Client: Acme Corp HQ', date: 'Oct 18', amount: '$340.00', status: 'Approved' },
  { id: 'VCH-2026-091', name: 'Marcus Reed', empId: 'EMP-0881', dept: 'IT Support', site: 'Datacenter B', date: 'Oct 20 - Oct 21', amount: '$85.20', status: 'Rejected' },
  { id: 'VCH-2026-092', name: 'Satyam Singh', empId: 'EMP-1001', dept: 'Development', site: 'IPQS HQ', date: 'Oct 25', amount: '$120.00', status: 'Pending' },
];

export default function VouchersList() {
  const navigate = useNavigate();
  const [department, setDepartment] = useState('All Departments');
  const [status, setStatus] = useState('Pending Approval');

  const getStatusChip = (statusText) => {
    switch(statusText) {
      case 'Approved':
        return <Chip label="Approved" size="small" sx={{ bgcolor: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.5)' }} />;
      case 'Rejected':
        return <Chip label="Rejected" size="small" sx={{ bgcolor: 'rgba(248, 113, 113, 0.2)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.5)' }} />;
      default:
        return <Chip label="Pending" size="small" sx={{ bgcolor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.5)' }} />;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: '100%', minHeight: '100vh', background: 'transparent', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" color="#fff">Voucher Management</Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.6)">Review and approve departmental expense claims.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadIcon />} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)', textTransform: 'none' }}>
          Export
        </Button>
      </Box>

      {/* Advanced Filters Card */}
      <Card sx={{ ...glassStyle, p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" display="flex" alignItems="center" gap={1}>
            <FilterListIcon /> Advanced Filters
          </Typography>
          <Button size="small" sx={{ color: '#60a5fa', textTransform: 'none' }}>Clear All</Button>
        </Box>

        {/* Strict CSS Grid to prevent overlap */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
          <TextField fullWidth label="Employee Name or ID" placeholder="e.g. John Doe, EMP-042" size="small" sx={glassInput} />
          
          <TextField select fullWidth label="Department" size="small" value={department} onChange={(e) => setDepartment(e.target.value)} sx={glassInput}>
            <MenuItem value="All Departments">All Departments</MenuItem>
            <MenuItem value="Development">Development</MenuItem>
            <MenuItem value="Sales">Sales</MenuItem>
          </TextField>
          
          <TextField select fullWidth label="Status" size="small" value={status} onChange={(e) => setStatus(e.target.value)} sx={glassInput}>
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="Pending Approval">Pending Approval</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
          </TextField>
          
          <TextField type="date" fullWidth label="Date Range" size="small" InputLabelProps={{ shrink: true }} sx={glassInput} />
          
          <TextField fullWidth label="Site/Project" placeholder="e.g. Project Alpha" size="small" sx={glassInput} />
          
          <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button fullWidth variant="contained" sx={{ bgcolor: '#3b82f6', height: '40px', textTransform: 'none' }}>Apply Filters</Button>
          </Box>
        </Box>
      </Card>

      {/* Data Table */}
      <Card sx={{ ...glassStyle, p: 0 }}>
        <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
              <TableRow>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>Voucher #</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>Employee</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>Department</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>Site / Date</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>Amount</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>Status</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockVouchers.map((row) => (
                <TableRow key={row.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}>{row.id}</TableCell>
                  <TableCell sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(59,130,246,0.3)', fontSize: '0.875rem' }}>
                        {row.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{row.name}</Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.5)">{row.empId}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>{row.dept}</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <Typography variant="body2">{row.site}</Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.5)">{row.date}</Typography>
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>{row.amount}</TableCell>
                  <TableCell sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>{getStatusChip(row.status)}</TableCell>
                  <TableCell sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    {/* FIXED ROUTING PATH HERE */}
                    <Button 
                      size="small" 
                      variant="outlined" 
                      sx={{ color: '#60a5fa', borderColor: 'rgba(96,165,250,0.5)', '&:hover': { borderColor: '#60a5fa' }, textTransform: 'none' }}
                      onClick={() => navigate(`/marketing/reimbursement/vouchers/${row.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}