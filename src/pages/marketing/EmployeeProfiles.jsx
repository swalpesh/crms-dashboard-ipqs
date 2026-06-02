import React from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  Typography, 
  Button, 
  Avatar, 
  TextField,
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';

const glassStyle = {
  background: 'rgba(25, 20, 40, 0.45)', 
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  color: '#fff',
  overflow: 'hidden',
  position: 'relative'
};

const employees = [
  { id: 'EMP-49201', name: 'Sarah Jenkins', dept: 'Sales', claimed: '$34,250.00', rate: '98.5%', color: '#3b82f6' },
  { id: 'EMP-49202', name: 'Michael Chen', dept: 'Engineering', claimed: '$12,840.50', rate: '99.2%', color: '#8b5cf6' },
  { id: 'EMP-49203', name: 'Elena Rodriguez', dept: 'Marketing', claimed: '$18,600.00', rate: '96.8%', color: '#f59e0b' },
  { id: 'EMP-49204', name: 'David Smith', dept: 'Operations', claimed: '$42,100.25', rate: '94.5%', color: '#10b981' },
];

export default function EmployeeProfiles() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4, width: '100%', minHeight: '100vh', background: '#0b0914' }}>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="800" color="#fff" mb={1}>Employee Expense Directory</Typography>
        <Typography variant="body2" color="rgba(255,255,255,0.6)">Select an employee to view detailed reimbursement profiles and analysis.</Typography>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField 
          fullWidth 
          placeholder="Search by name or ID..." 
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'rgba(255,255,255,0.5)' }}/></InputAdornment>,
          }}
          sx={{ 
            maxWidth: 500,
            '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.05)', color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } 
          }} 
        />
        <Button variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>Filter by Dept</Button>
      </Box>

      {/* Employee Grid */}
      <Grid container spacing={3}>
        {employees.map((emp) => (
          <Grid item xs={12} sm={6} md={3} key={emp.id}>
            <Card sx={glassStyle}>
              {/* Colored Top Banner */}
              <Box sx={{ height: 80, background: `linear-gradient(135deg, ${emp.color}88 0%, rgba(25,20,40,0) 100%)` }} />
              
              <Box sx={{ p: 3, pt: 0, mt: -4, textAlign: 'center' }}>
                <Avatar sx={{ width: 72, height: 72, mx: 'auto', border: '4px solid #1a1625', mb: 2, bgcolor: emp.color }}>
                  {emp.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                
                <Typography variant="h6" fontWeight="700">{emp.name}</Typography>
                <Typography variant="caption" sx={{ display: 'inline-block', px: 1, py: 0.5, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1, mt: 1, mb: 3 }}>
                  {emp.dept}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, textAlign: 'left' }}>
                  <Box>
                    <Typography variant="caption" color="rgba(255,255,255,0.5)">TOTAL CLAIMED</Typography>
                    <Typography variant="subtitle1" fontWeight="600" color="#60a5fa">{emp.claimed}</Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="caption" color="rgba(255,255,255,0.5)">APPROVAL RATE</Typography>
                    <Typography variant="subtitle1" fontWeight="600" color="#4ade80">{emp.rate}</Typography>
                  </Box>
                </Box>

                <Button 
                  fullWidth 
                  variant="outlined" 
                  onClick={() => navigate(`/employees/${emp.id}`)}
                  sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  View Profile &rsaquo;
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}