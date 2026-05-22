import React, { useState } from 'react';
import { Box, Typography, Button, Avatar } from '@mui/material';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

// Mock data reflecting the Solar Consultation form inputs
const mockSolarRequests = [
  {
    id: 'SR-185',
    fullName: 'test from trafo',
    phone: '1234567890',
    email: 'test@trafo.com',
    pincode: '422010',
    location: 'kjad, Anantnag, Jammu and Kashmir, India',
    priority: 'Medium',
    billAmount: '5000',
    hasFile: true
  },
  {
    id: 'SR-186',
    fullName: 'Rahul Sharma',
    phone: '9876543210',
    email: 'rahul.s@email.com',
    pincode: '411001',
    location: 'Pune, Maharashtra, India',
    priority: 'High',
    billAmount: '8500',
    hasFile: false
  },
  {
    id: 'SR-187',
    fullName: 'Amit Kumar',
    phone: '9988776655',
    email: 'amit.k88@domain.in',
    pincode: '110001',
    location: 'New Delhi, Delhi, India',
    priority: 'Low',
    billAmount: '3200',
    hasFile: true
  }
];

const getInitials = (name) => {
  if (!name) return 'U';
  return name.charAt(0).toUpperCase();
};

export default function SolarRequests() {
  const [requests, setRequests] = useState(mockSolarRequests);

  return (
    <Box 
      sx={{ 
        p: 3, 
        minHeight: '100vh', 
        background: 'linear-gradient(to bottom right, #131129, #1a1625)', 
        color: '#ffffff',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 600, 
          mb: 3, 
          color: '#fff', 
          textShadow: '0 0 10px rgba(138, 43, 226, 0.3)' 
        }}
      >
        Solar Consultation Requests
      </Typography>

      {/* Header Row */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: '120px 100px 2fr 1.5fr 1.5fr 1fr', 
          gap: 2, 
          px: 3, 
          py: 2, 
          mb: 1.5, 
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
          fontSize: '12px', 
          fontWeight: 700, 
          letterSpacing: '1px', 
          color: 'rgba(255, 255, 255, 0.5)', 
          textTransform: 'uppercase' 
        }}
      >
        <Box>ASSIGN</Box>
        <Box>LEAD ID</Box>
        <Box>COMPANY & CONTACT</Box>
        <Box>LOCATION</Box>
        <Box>TYPE / PRIORITY</Box>
        <Box>REQUIREMENTS / BILL</Box>
      </Box>

      {/* Data Rows */}
      <Box>
        {requests.map((req) => (
          <Box 
            key={req.id} 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: '120px 100px 2fr 1.5fr 1.5fr 1fr', 
              gap: 2, 
              alignItems: 'center',
              background: 'rgba(30, 26, 60, 0.4)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '100px',
              px: 3, 
              py: 1.5, 
              mb: 1.5,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
              '&:hover': {
                background: 'rgba(45, 35, 80, 0.6)',
                borderColor: 'rgba(138, 43, 226, 0.4)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(138, 43, 226, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            {/* 1. Assign Button */}
            <Box>
              <Button 
                variant="outlined" 
                sx={{ 
                  borderRadius: '20px', 
                  textTransform: 'none', 
                  fontWeight: 600, 
                  fontSize: '13px',
                  borderColor: 'rgba(59, 130, 246, 0.5)',
                  color: '#3b82f6',
                  '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)'
                  }
                }}
              >
                Assign Dept
              </Button>
            </Box>

            {/* 2. Lead ID */}
            <Box sx={{ color: '#3b82f6', fontWeight: 700, fontSize: '14px' }}>
              {req.id}
            </Box>

            {/* 3. Company & Contact (Now with Email) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.1)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  width: 40, 
                  height: 40,
                  fontWeight: 600 
                }}
              >
                {getInitials(req.fullName)}
              </Avatar>
              <Box>
                <Typography sx={{ color: '#fff', fontSize: '14px', fontWeight: 600, lineHeight: 1.2 }}>
                  {req.fullName}
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', mt: 0.5 }}>
                  t • {req.phone}
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', mt: 0.2 }}>
                  e • {req.email}
                </Typography>
              </Box>
            </Box>

            {/* 4. Location */}
            <Box>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                {req.location}
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', mt: 0.5 }}>
                PIN: {req.pincode}
              </Typography>
            </Box>

            {/* 5. Static "Solar" Badge & Priority */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box 
                sx={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  px: 1.5, 
                  py: 0.5, 
                  borderRadius: '12px', 
                  fontSize: '11px',
                  color: '#fff'
                }}
              >
                Solar
              </Box>
              <Box 
                sx={{ 
                  color: req.priority === 'High' ? '#ef4444' : req.priority === 'Medium' ? '#f59e0b' : '#10b981',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                {req.priority}
              </Box>
            </Box>

            {/* 6. Requirements (Avg Bill & File) */}
            <Box>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', mb: 0.5 }}>
                Avg Bill: <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '14px', color: '#e2e8f0', background: 'rgba(0, 0, 0, 0.2)', px: 1, py: 0.5, borderRadius: 1 }}>₹{req.billAmount}</Box>
              </Typography>
              
              {req.hasFile ? (
                <Button 
                  variant="text" 
                  startIcon={<InsertDriveFileOutlinedIcon fontSize="small" />}
                  sx={{ 
                    color: '#06b6d4', 
                    p: 0, 
                    minWidth: 'auto', 
                    textTransform: 'none', 
                    fontSize: '13px',
                    '&:hover': { background: 'transparent', color: '#fff', textShadow: '0 0 8px rgba(6, 182, 212, 0.6)' }
                  }}
                >
                  View Bill
                </Button>
              ) : (
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '13px' }}>
                  No file uploaded
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}