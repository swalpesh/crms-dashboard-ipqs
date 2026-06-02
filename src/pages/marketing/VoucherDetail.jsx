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
  TableContainer,
  TextField,
  Chip,
  IconButton
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

// Reusable Glass Card Style
const glassStyle = {
  background: 'rgba(30, 27, 46, 0.7)', 
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  color: '#fff',
  p: 3,
  mb: 4,
  boxSizing: 'border-box'
};

const expenseEntries = [
  { id: 1, date: 'Oct 12, 2026', category: 'Travel', desc: 'Roundtrip flights to Chicago (ORD)', amount: '$1,245.00' },
  { id: 2, date: 'Oct 12, 2026', category: 'Hotel', desc: 'Marriott Downtown - 2 Nights', amount: '$580.00' },
  { id: 3, date: 'Oct 13, 2026', category: 'Food', desc: 'Client Dinner - Ruth\'s Chris', amount: '$315.50' },
];

export default function VoucherDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: '100%', minHeight: '100vh', background: 'transparent', boxSizing: 'border-box' }}>
      
      {/* Header & Back Navigation */}
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/marketing/reimbursement/vouchers')}
        sx={{ color: 'rgba(255,255,255,0.7)', mb: 2, textTransform: 'none' }}
      >
        BACK TO ALL VOUCHERS
      </Button>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Typography variant="h3" fontWeight="800" color="#fff">
          #{id || 'VCH-2026-089'}
        </Typography>
        <Chip label="Pending Review" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
      </Box>

      {/* Trip Information Card */}
      <Card sx={glassStyle}>
        <Typography variant="h6" fontWeight="600" mb={3}>Trip Information</Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
          <Box>
            <Typography variant="caption" color="rgba(255,255,255,0.5)">Trip Name</Typography>
            <Typography variant="body1">Annual Client Meet - Q3</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="rgba(255,255,255,0.5)">Created By</Typography>
            <Typography variant="body1">John Doe</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="rgba(255,255,255,0.5)">Number of People</Typography>
            <Typography variant="body1">4</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="rgba(255,255,255,0.5)">Visit Purpose</Typography>
            <Typography variant="body1">Marketing Visit</Typography>
          </Box>
        </Box>

        <Typography variant="caption" color="rgba(255,255,255,0.5)">Customer Problem / Context</Typography>
        <Box sx={{ p: 2, mt: 1, mb: 3, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, border: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="body2">Discussed the integration challenges with the legacy CRM system. The client required an on-site technical workshop to map out data migration strategies for Q4 rollout.</Typography>
        </Box>

        <Typography variant="caption" color="rgba(255,255,255,0.5)">Supporting Documents (MOM)</Typography>
        <Box sx={{ mt: 1 }}>
          <Button variant="outlined" endIcon={<DownloadIcon />} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)', textTransform: 'none' }}>
            Client_Meet_MOM_Q3.pdf
          </Button>
        </Box>
      </Card>

      {/* Expense Entries Card */}
      <Card sx={{ ...glassStyle, p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="h6" fontWeight="600">Expense Entries</Typography>
        </Box>
        <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
              <TableRow>
                <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>DATE</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>CATEGORY</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>DESCRIPTION</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>AMOUNT</TableCell>
                {/* NEW BILL/PROOF COLUMN HEADER */}
                <TableCell align="center" sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>BILL / PROOF</TableCell>
                <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenseEntries.map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>{row.date}</TableCell>
                  <TableCell sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <Chip label={row.category} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#a78bfa' }} />
                  </TableCell>
                  <TableCell sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}>{row.desc}</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>{row.amount}</TableCell>
                  
                  {/* NEW EYE BUTTON CELL */}
                  <TableCell align="center" sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <IconButton size="small" sx={{ color: '#60a5fa', bgcolor: 'rgba(59,130,246,0.1)', '&:hover': { bgcolor: 'rgba(59,130,246,0.2)' } }}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </TableCell>

                  <TableCell align="right" sx={{ borderColor: 'rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
                    <Button size="small" variant="outlined" color="error" startIcon={<CloseIcon />} sx={{ mr: 1, textTransform: 'none' }}>Reject</Button>
                    <Button size="small" variant="contained" color="success" startIcon={<CheckIcon />} sx={{ textTransform: 'none' }}>Approve</Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                {/* Adjusted colSpan from 3 to 4 to account for the new column */}
                <TableCell colSpan={4} align="right" sx={{ color: 'rgba(255,255,255,0.7)', borderBottom: 'none' }}>Total Reimbursement</TableCell>
                <TableCell colSpan={2} sx={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', borderBottom: 'none' }}>$2,140.50</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      
      {/* Final Action */}
      <Card sx={glassStyle}>
        <Typography variant="h6" fontWeight="600" mb={2}>Final Verification Action</Typography>
        <TextField 
          fullWidth 
          multiline 
          rows={3} 
          placeholder="Add optional notes regarding this decision..." 
          sx={{ 
            mb: 3, 
            '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.05)', color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } 
          }} 
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" color="error" size="large" sx={{ textTransform: 'none' }}>Reject Entire Voucher</Button>
          <Button variant="contained" size="large" sx={{ bgcolor: '#3b82f6', textTransform: 'none' }}>Approve Voucher</Button>
        </Box>
      </Card>
    </Box>
  );
}