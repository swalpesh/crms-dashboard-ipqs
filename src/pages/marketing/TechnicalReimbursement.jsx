import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Stack,
  IconButton,
  InputBase,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  keyframes,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  AccountBalanceWallet as WalletIcon,
  ReceiptLong as ReceiptIcon,
  Description as InvoiceIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Send as SendIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

// --- ANIMATIONS ---
const float = keyframes`
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -30px); }
`;

// --- STYLES CONSTANTS ---

const pageStyle = {
  minHeight: '100vh',
  background: '#0f0c29',
  backgroundImage: `
    radial-gradient(circle at 15% 50%, rgba(76, 29, 149, 0.25) 0%, transparent 50%),
    radial-gradient(circle at 85% 30%, rgba(37, 99, 235, 0.2) 0%, transparent 50%)
  `,
  color: '#ffffff',
  fontFamily: "'Inter', sans-serif",
  position: 'relative',
  overflowX: 'hidden',
  p: { xs: 2, md: 4 },
  display: 'flex',
  justifyContent: 'center',
};

const orbStyle = {
  position: 'fixed',
  borderRadius: '50%',
  filter: 'blur(80px)',
  zIndex: 0,
  animation: `${float} 10s infinite ease-in-out`,
};

// Glass Panel (Container)
const glassPanelStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '24px',
  p: 3,
  width: '100%',
  maxWidth: '1200px',
  zIndex: 1,
  position: 'relative'
};

// Summary Card Style
const summaryCardStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderTop: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '20px',
  p: 3,
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  transition: 'transform 0.2s, background 0.2s',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.07)',
    transform: 'translateY(-2px)',
  }
};

// Icon Box Styles
const iconBoxStyle = (color, bg, shadowColor) => ({
  width: '48px',
  height: '48px',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  color: color,
  background: bg,
  boxShadow: shadowColor ? `0 0 15px ${shadowColor}` : 'none',
});

// Primary Button Style
const primaryBtnStyle = {
  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  color: 'white',
  borderRadius: '30px',
  textTransform: 'none',
  fontWeight: 600,
  px: 3,
  py: 1,
  boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 6px 20px rgba(37, 99, 235, 0.5)',
  }
};

// Status Pill Style
const statusStyle = (type) => {
  const styles = {
    progress: { bg: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', border: 'rgba(16, 185, 129, 0.3)' },
    reimbursed: { bg: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', border: 'rgba(59, 130, 246, 0.3)' },
    pending: { bg: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d', border: 'rgba(245, 158, 11, 0.3)' },
  };
  const s = styles[type] || styles.pending;
  return {
    fontSize: '12px',
    fontWeight: 500,
    padding: '6px 12px',
    borderRadius: '20px',
    background: s.bg,
    color: s.color,
    border: `1px solid ${s.border}`,
    display: 'inline-block'
  };
};

// Table Data
const TRIPS_DATA = [
  { name: 'Q4 Client Visit', sub: 'Client Meeting', date: 'Oct 26 - Oct 28, 2023', amount: '$380.75', status: 'In Progress', statusKey: 'progress' },
  { name: 'Project Alpha Kickoff', sub: 'Internal Project', date: 'Sep 12 - Sep 15, 2023', amount: '$1,245.50', status: 'Reimbursed', statusKey: 'reimbursed' },
  { name: 'Annual Tech Conference', sub: 'Learning & Dev', date: 'Aug 05 - Aug 07, 2023', amount: '$980.00', status: 'Reimbursed', statusKey: 'reimbursed' },
  { name: 'Sales Training Workshop', sub: 'Training', date: 'Jul 20 - Jul 21, 2023', amount: '$450.25', status: 'Pending', statusKey: 'pending' },
];

const TechnicalReimbursement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={pageStyle}>
      {/* Background Orbs */}
      <Box sx={{ ...orbStyle, width: '500px', height: '500px', background: 'rgba(139, 92, 246, 0.15)', top: '-100px', left: '-100px' }} />
      <Box sx={{ ...orbStyle, width: '400px', height: '400px', background: 'rgba(59, 130, 246, 0.15)', bottom: '-100px', right: '-100px', animationDelay: '-5s' }} />

      {/* Main Container */}
      <Box sx={glassPanelStyle}>
        
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 600, 
              mb: 0.5, 
              background: 'linear-gradient(to right, #fff, #a5b4fc)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent' 
            }}>
              Reimbursements
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
              Manage your travel expenses and claims
            </Typography>
          </Box>
          <Button startIcon={<AddIcon />} sx={primaryBtnStyle}>
            Start a New Trip
          </Button>
        </Box>

        {/* Accounts Summary Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 500, mb: 2, pl: 1 }}>
            Accounts Overview
          </Typography>
          
          <Grid container spacing={2.5}>
            {/* Card 1 */}
            <Grid item xs={12} md={4}>
              <Box sx={summaryCardStyle}>
                <Box sx={iconBoxStyle('#6ee7b7', 'rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)')}>
                  <WalletIcon />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', mb: 0.5 }}>Advance Received</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#6ee7b7' }}>$500.00</Typography>
                </Box>
              </Box>
            </Grid>

            {/* Card 2 */}
            <Grid item xs={12} md={4}>
              <Box sx={summaryCardStyle}>
                <Box sx={iconBoxStyle('#fca5a5', 'rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)')}>
                  <ReceiptIcon />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', mb: 0.5 }}>Expense Amount</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#fca5a5' }}>$3,056.50</Typography>
                </Box>
              </Box>
            </Grid>

            {/* Card 3 */}
            <Grid item xs={12} md={4}>
              <Box sx={summaryCardStyle}>
                <Box sx={iconBoxStyle('#e5e7eb', 'rgba(255, 255, 255, 0.1)')}>
                  <InvoiceIcon />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', mb: 0.5 }}>Reimbursed Amount</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#ffffff' }}>$2,125.75</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', mt: 2, pl: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon sx={{ fontSize: 16 }} /> Data is updated monthly. Contact IT for discrepancies.
          </Typography>
        </Box>

        {/* All Trips Section (Table) */}
        <Box sx={{ 
          background: 'rgba(20, 20, 40, 0.4)', 
          backdropFilter: 'blur(20px)', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '24px', 
          p: 3, 
          overflow: 'hidden' 
        }}>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" fontWeight={600}>All Trips</Typography>
            <Box sx={{ 
              background: 'rgba(0, 0, 0, 0.2)', 
              border: '1px solid rgba(255, 255, 255, 0.08)', 
              borderRadius: '12px', 
              px: 2, py: 1, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              width: { xs: '100%', sm: 'auto' }
            }}>
              <SearchIcon sx={{ color: 'rgba(255,255,255,0.6)' }} />
              <InputBase placeholder="Search trips..." sx={{ color: '#fff', fontSize: '14px', width: { xs: '100%', sm: '200px' } }} />
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  {['Trip Name', 'Date Range', 'Total Expenses', 'Status', 'Actions'].map((head, index) => (
                    <TableCell key={head} align={index === 4 ? 'right' : 'left'} sx={{ 
                      color: 'rgba(255,255,255,0.6)', 
                      fontWeight: 600, 
                      fontSize: '12px', 
                      textTransform: 'uppercase', 
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      py: 2
                    }}>
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {TRIPS_DATA.map((row, index) => (
                  <TableRow key={index} sx={{ 
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                    '& td': { borderBottom: index === TRIPS_DATA.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)' }
                  }}>
                    
                    {/* Trip Info */}
                    <TableCell sx={{ py: 2 }}>
                      <Box>
                        <Typography sx={{ fontWeight: 500, fontSize: '14px', color: '#fff' }}>{row.name}</Typography>
                        <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>{row.sub}</Typography>
                      </Box>
                    </TableCell>

                    {/* Date */}
                    <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{row.date}</TableCell>

                    {/* Amount */}
                    <TableCell sx={{ fontWeight: 600, fontSize: '14px', color: '#fff' }}>{row.amount}</TableCell>

                    {/* Status */}
                    <TableCell>
                      <Box component="span" sx={statusStyle(row.statusKey)}>{row.status}</Box>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1.5 }}>
                        <Button variant="outlined" startIcon={<ViewIcon sx={{ fontSize: 16 }} />} sx={{ 
                          borderColor: 'rgba(59, 130, 246, 0.3)', 
                          color: '#3b82f6', 
                          borderRadius: '20px', 
                          textTransform: 'none', 
                          fontSize: '13px', 
                          py: 0.5, 
                          px: 2,
                          '&:hover': { borderColor: '#60a5fa', bgcolor: 'rgba(59, 130, 246, 0.1)' } 
                        }}>
                          View
                        </Button>

                        {/* Contextual Action Button */}
                        {row.statusKey === 'progress' && (
                          <IconButton size="small" title="Apply" sx={{ color: 'rgba(255,255,255,0.6)', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: '#fff', color: '#0f0c29' } }}>
                            <SendIcon fontSize="small" />
                          </IconButton>
                        )}
                        {row.statusKey === 'reimbursed' && (
                          <IconButton size="small" disabled sx={{ color: 'rgba(255,255,255,0.2)', bgcolor: 'rgba(255,255,255,0.05)' }}>
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        )}
                        {row.statusKey === 'pending' && (
                          <IconButton size="small" title="Edit" sx={{ color: 'rgba(255,255,255,0.6)', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: '#fff', color: '#0f0c29' } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

        </Box>

      </Box>
    </Box>
  );
};

export default TechnicalReimbursement;