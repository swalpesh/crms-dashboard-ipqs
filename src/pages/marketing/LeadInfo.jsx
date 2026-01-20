import React, { useState } from 'react';
import { 
  Box, Typography, InputBase, IconButton, Avatar, 
  Button, Chip, useTheme, useMediaQuery 
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate

import { 
  MagnifyingGlass, Faders, MapPin, Eye, 
  Fire
} from "@phosphor-icons/react";

const LeadInfo = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate(); // 2. Initialize hook

  // --- Mock Data ---
  const leads = [
    { 
      id: 1, 
      company: "Mahindra & Mahindra", 
      contact: "Mr. Rahul Sharma (Procurement)", 
      location: "Nashik, Maharashtra", 
      type: "Product", 
      status: "Negotiation", 
      creator: "Alex D.", 
      creatorImg: "https://i.pravatar.cc/150?img=59",
      logo: "M", 
      logoColor: "linear-gradient(135deg, #ef4444, #b91c1c)",
      isNew: true 
    },
    { 
      id: 2, 
      company: "Renuka Logistics", 
      contact: "Mrs. Priya Deshmukh", 
      location: "Pune, Maharashtra", 
      type: "Service", 
      status: "New", 
      creator: "Maria G.", 
      creatorImg: "https://i.pravatar.cc/150?img=32",
      logo: "R", 
      logoColor: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      isNew: false 
    },
    { 
      id: 3, 
      company: "Quantum Solutions", 
      contact: "Amit Patel", 
      location: "Mumbai, India", 
      type: "Product", 
      status: "Qualified", 
      creator: "John K.", 
      creatorImg: "https://i.pravatar.cc/150?img=68",
      logo: "Q", 
      logoColor: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
      isNew: false 
    },
    { 
      id: 4, 
      company: "TechSpace Park", 
      contact: "Emily Chen", 
      location: "Bangalore, Karnataka", 
      type: "Service", 
      status: "Urgent", 
      creator: "Alex D.", 
      creatorImg: "https://i.pravatar.cc/150?img=59",
      logo: "T", 
      logoColor: "linear-gradient(135deg, #f97316, #c2410c)",
      isNew: false 
    }
  ];

  // --- Styles ---
  const glassPanel = {
    background: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
    borderRadius: '16px',
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Negotiation': return { color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' };
      case 'New': return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'Qualified': return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'Urgent': return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
      default: return { color: '#fff', bg: 'rgba(255,255,255,0.1)' };
    }
  };

  const getTypeColor = (type) => {
    return type === 'Product' 
      ? { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)' }
      : { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.3)' };
  };

  // 3. Handle Navigation
  const handleViewClick = () => {
    navigate('/marketing/customer-info');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      width: '100%',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      color: '#fff',
      p: { xs: 2, md: 4 },
      fontFamily: "'Inter', sans-serif"
    }}>
      
      <Box sx={{ maxWidth: 1200, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* --- Header --- */}
        <Box sx={{ ...glassPanel, p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 3 }}>
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h5" fontWeight={600}>Company Leads</Typography>
            <Typography variant="body2" sx={{ color: '#a0a0c0' }}>Manage corporate accounts and logistics</Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#a0a0c0', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Accounts</Typography>
                <Typography variant="h6" fontWeight={700}>124</Typography>
              </Box>
              <Box sx={{ width: 1, height: 40, bgcolor: 'rgba(255,255,255,0.1)' }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#a0a0c0', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Fire weight="fill" color="#f97316" /> HOT LEADS
                </Typography>
                <Typography variant="h6" fontWeight={700} color="#f97316">8</Typography>
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', md: 'auto' } }}>
            <Box sx={{ 
              display: 'flex', alignItems: 'center', 
              bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, px: 2, py: 1, 
              border: '1px solid rgba(255,255,255,0.05)', flex: 1
            }}>
              <MagnifyingGlass size={20} color="#a0a0c0" />
              <InputBase 
                placeholder="Search companies..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ ml: 1, color: '#fff', fontSize: 14, width: '100%' }} 
              />
            </Box>
            <IconButton sx={{ 
              bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: 2, color: '#a0a0c0', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' } 
            }}>
              <Faders size={20} />
            </IconButton>
            <Avatar src="https://i.pravatar.cc/150?img=12" sx={{ border: '2px solid rgba(255,255,255,0.2)' }} />
          </Box>
        </Box>

        {/* --- Lead List --- */}
        <Box sx={{ ...glassPanel, p: { xs: 2, md: 3 }, minHeight: 600 }}>
          
          {!isMobile && (
            <Box sx={{ 
              display: 'flex', pb: 2, mb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', 
              color: '#a0a0c0', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase'
            }}>
              <Box sx={{ flex: 2.5, pl: 2 }}>Company Name</Box>
              <Box sx={{ flex: 1.5 }}>Location</Box>
              <Box sx={{ flex: 0.8 }}>Lead Type</Box>
              <Box sx={{ flex: 0.8 }}>Status</Box>
              <Box sx={{ flex: 1.2 }}>Created By</Box>
              <Box sx={{ flex: 0.5, textAlign: 'right', pr: 1 }}>Action</Box>
            </Box>
          )}

          {leads.filter(l => l.company.toLowerCase().includes(searchTerm.toLowerCase())).map((lead) => (
            <Box key={lead.id} sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              p: 2, mb: 1.5, 
              bgcolor: 'rgba(255,255,255,0.02)', 
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.2s ease',
              border: '1px solid transparent',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)', transform: 'translateY(-2px)' }
            }}>
              
              {lead.isNew && (
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: 80, height: 80, overflow: 'hidden' }}>
                  <Box sx={{ 
                    position: 'absolute', top: 12, left: -24, width: 100, 
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)', 
                    color: '#fff', fontSize: 9, fontWeight: 700, textAlign: 'center', 
                    transform: 'rotate(-45deg)', py: 0.5, boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>NEW</Box>
                </Box>
              )}

              <Box sx={{ flex: 2.5, display: 'flex', alignItems: 'center', gap: 2, mb: { xs: 2, md: 0 }, pl: { md: 2 } }}>
                <Box sx={{ 
                  width: 42, height: 42, borderRadius: 2, 
                  background: lead.logoColor, color: '#fff', fontWeight: 700, fontSize: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}>{lead.logo}</Box>
                <Box>
                  <Typography variant="body1" fontWeight={600} sx={{ lineHeight: 1.2 }}>{lead.company}</Typography>
                  <Typography variant="caption" sx={{ color: '#a0a0c0' }}>{lead.contact}</Typography>
                </Box>
              </Box>

              <Box sx={{ flex: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: '#ddd', fontSize: 13, mb: { xs: 2, md: 0 } }}>
                <MapPin weight="fill" color="#a0a0c0" />
                {lead.location}
              </Box>

              <Box sx={{ flex: 0.8, mb: { xs: 2, md: 0 } }}>
                <Chip label={lead.type} size="small" sx={{ 
                  height: 24, fontSize: 11, fontWeight: 500,
                  bgcolor: getTypeColor(lead.type).bg, 
                  color: getTypeColor(lead.type).color,
                  border: `1px solid ${getTypeColor(lead.type).border}`
                }} />
              </Box>

              <Box sx={{ flex: 0.8, mb: { xs: 2, md: 0 } }}>
                <Chip label={lead.status} size="small" sx={{ 
                  height: 24, fontSize: 11, fontWeight: 500,
                  bgcolor: getStatusColor(lead.status).bg, 
                  color: getStatusColor(lead.status).color 
                }} />
              </Box>

              <Box sx={{ flex: 1.2, display: 'flex', alignItems: 'center', gap: 1.5, mb: { xs: 2, md: 0 } }}>
                <Avatar src={lead.creatorImg} sx={{ width: 28, height: 28, border: '1px solid rgba(255,255,255,0.2)' }} />
                <Typography variant="body2" fontSize={13}>{lead.creator}</Typography>
              </Box>

              <Box sx={{ flex: 0.5, textAlign: { xs: 'left', md: 'right' }, width: { xs: '100%', md: 'auto' } }}>
                <Button 
                  onClick={handleViewClick} 
                  variant="outlined" 
                  startIcon={<Eye weight="fill" />}
                  sx={{ 
                    textTransform: 'none', color: '#fff', borderColor: 'rgba(255,255,255,0.1)', 
                    bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, fontSize: 12, px: 2,
                    width: { xs: '100%', md: 'auto' },
                    '&:hover': { bgcolor: '#3b82f6', borderColor: '#3b82f6' }
                  }}
                >
                  View
                </Button>
              </Box>

            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default LeadInfo;