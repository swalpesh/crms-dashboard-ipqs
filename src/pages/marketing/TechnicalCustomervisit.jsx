import React, { useState } from 'react';
import {
  Box, 
  Typography,
  InputBase,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  keyframes,
  Badge, 
  useMediaQuery,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from 'react-router-dom';

// --- Data  ---
const VISIT_DATA = [
  { id: 'L-001', name: 'Mahindra & Mahindra', address: 'Nashik Maharashtra, India', email: 'Mahindra@gmail.com', phone: '1234567890' },
  { id: 'L-002', name: 'Quantum Solutions', address: 'Uttarpradesh, India', email: 'Quantumsolutions@gmail.com', phone: '9554045784' },
  { id: 'L-003', name: 'Merlin Services', address: 'Ambad MIDC Nashik, Maharashtra', email: 'merlinservices@gmail.com', phone: '8956939031' },
  { id: 'L-004', name: 'Renuka Logistics', address: 'Pathardi Phata Nashik, Maharashtra', email: 'renukalogistics@gmail.com', phone: '98452718927' },
  { id: 'L-005', name: 'Suzlon Energy', address: 'Madhyapradesh India', email: 'suzlonenergy@gmail.com', phone: '8956148712' },
];

// --- Animations ---
const liquidMove = keyframes`
  0% { transform: translate(0, 0) rotate(0deg) scale(1); border-radius: 40% 60% 50% 50% / 50% 50% 60% 40%; }
  50% { transform: translate(20px, 20px) rotate(10deg) scale(1.1); border-radius: 50% 50% 20% 80% / 25% 80% 20% 75%; }
  100% { transform: translate(-20px, -10px) rotate(-5deg) scale(0.9); border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
`;

const slideUpFade = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styles Constants ---
const glassPanelStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px) brightness(1.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderTop: '1px solid rgba(255, 255, 255, 0.5)',
  borderLeft: '1px solid rgba(255, 255, 255, 0.5)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.05)',
  borderRadius: '24px',
};

const TechnicalCustomervisit = () => {
  const [activeTab, setActiveTab] = useState(0); // 0: New, 1: Pending, 2: Completed
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        // Deep rich background
        background: 'linear-gradient(to right, #24243e, #302b63, #0f0c29)',
        color: '#fff',
        fontFamily: "'Inter', sans-serif",
        p: { xs: 2, md: 4 },
      }}
    >
      {/* --- Background Shapes (Animated Blobs) --- */}
      <Box sx={{
        position: 'fixed', top: '-10%', left: '-10%', width: '600px', height: '600px',
        background: 'linear-gradient(180deg, #715161 0%, #33033c 100%)',
        filter: 'blur(60px)', opacity: 0.7, zIndex: 0,
        animation: `${liquidMove} 15s infinite alternate`,
      }} />
      <Box sx={{
        position: 'fixed', bottom: '-10%', right: '-5%', width: '500px', height: '500px',
        background: 'linear-gradient(180deg, #5d0d64 0%, #082b0b 100%)',
        filter: 'blur(60px)', opacity: 0.7, zIndex: 0,
        animation: `${liquidMove} 20s infinite alternate-reverse`,
      }} />

      {/* --- Main Content Container --- */}
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '1400px', mx: 'auto' }}>
        
        {/* Header Row */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          flexWrap: 'wrap', 
          gap: 2, 
          mb: 4 
        }}>
          <Box>
            <Typography variant="h1" sx={{ 
              fontSize: { xs: '2rem', md: '2.75rem' }, 
              fontWeight: 800, 
              background: 'linear-gradient(to right, #fff, #c0c0c0)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              mb: 0.5
            }}>
              Customer Visits Dashboard
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem' }}>
              Manage and view all customer accounts
            </Typography>
          </Box>

          {/* Search & Filter */}
          <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
            {/* Search Bar */}
            <Box sx={{ 
              position: 'relative', 
              flexGrow: 1,
              width: { xs: '100%', md: '300px' }
            }}>
              <Box sx={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)', pointerEvents: 'none' }}>
                <SearchIcon fontSize="small" />
              </Box>
              <InputBase
                placeholder="Search..."
                sx={{
                  width: '100%',
                  padding: '10px 16px 10px 48px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '16px',
                  color: '#fff',
                  transition: 'all 0.3s',
                  '&:focus-within': {
                    background: 'rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.6)'
                  }
                }}
              />
            </Box>

            {/* Filter Button */}
            <Button
              endIcon={<ArrowDropDownIcon sx={{ color: 'rgba(255,255,255,0.6)' }} />}
              sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderTop: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '16px',
                color: '#fff',
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                whiteSpace: 'nowrap',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                }
              }}
            >
              Filter
            </Button>
          </Box>
        </Box>

        {/* --- Tabs (The Liquid Glider) --- */}
        <Box sx={{ mb: 4, ...glassPanelStyle, padding: '0.5rem', animation: `${slideUpFade} 0.7s ease` }}>
          <Box sx={{ position: 'relative', display: 'flex', width: '100%' }}>
            
            {/* The Glider (Background Bubble) */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '54px',
                width: '33.33%',
                background: 'rgba(255, 255, 255, 0.15)',
                boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.6), inset 0 -1px 1px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: '18px',
                zIndex: 1,
                transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: `translateX(${activeTab * 100}%)`,
              }}
            />

            {/* Tab Buttons */}
            {['New Visits', 'Pending Visits', 'Completed Visits'].map((label, index) => (
              <Box
                key={index}
                onClick={() => setActiveTab(index)}
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '54px',
                  zIndex: 2,
                  cursor: 'pointer',
                  fontSize: { xs: '0.8rem', md: '1rem' },
                  fontWeight: 600,
                  color: activeTab === index ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                  textShadow: activeTab === index ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {label}
                {index === 0 && (
                  <Box component="span" sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '1.6rem', height: '1.6rem', ml: 1, borderRadius: '50%',
                    fontSize: '0.8rem', fontWeight: 700,
                    backdropFilter: 'blur(5px)',
                    transition: '0.3s ease',
                    bgcolor: activeTab === 0 ? '#fff' : 'rgba(255,255,255,0.1)',
                    color: activeTab === 0 ? '#2563eb' : '#fff',
                    boxShadow: activeTab === 0 ? '0 0 15px rgba(255,255,255,0.6)' : 'none',
                  }}>
                    2
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* --- Table Section --- */}
        <TableContainer component={Paper} sx={{
          ...glassPanelStyle,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(30px)',
          overflowX: 'auto',
          animation: `${slideUpFade} 0.7s ease 0.1s backwards`
        }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <TableRow>
                {['Visit ID', 'Customer Name', 'Primary Site Address', 'Email Address', 'Contact Number', 'Actions'].map((head) => (
                  <TableCell key={head} sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    borderBottom: 'none',
                    py: 3
                  }}>
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {VISIT_DATA.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    transition: 'background-color 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.05)'
                    },
                    '&:last-child': { borderBottom: 'none' }
                  }}
                >
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)', borderBottom: 'none' }}>{row.id}</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.2)', borderBottom: 'none' }}>{row.name}</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: 'none' }}>{row.address}</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)', borderBottom: 'none' }}>{row.email}</TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.9)', borderBottom: 'none' }}>{row.phone}</TableCell>
                  <TableCell sx={{ borderBottom: 'none' }}>
                    <Button
                      variant="text"
                      component={Link} /* This line is crucial for navigation */
                      endIcon={<ArrowForwardIcon sx={{ transition: 'transform 0.3s' }} />}
                      to="/marketing/technical/customer-profile"
                      sx={{
                        background: 'rgba(0, 255, 170, 0.1)',
                        color: '#00ffaa',
                        borderRadius: '999px',
                        border: '1px solid rgba(0, 255, 170, 0.3)',
                        px: 2.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: '#00ffaa',
                          color: '#0f0c29',
                          boxShadow: '0 0 20px rgba(0, 255, 170, 0.6)',
                          transform: 'scale(1.05)',
                          borderColor: '#00ffaa',
                          '& .MuiButton-endIcon': { transform: 'translateX(3px)' }
                        }
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

      </Box>
    </Box>
  );
};

export default TechnicalCustomervisit;