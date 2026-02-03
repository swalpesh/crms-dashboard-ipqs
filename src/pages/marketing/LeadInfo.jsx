import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, InputBase, Avatar, 
  Button, Chip, useTheme, useMediaQuery,
  Modal, IconButton, TextField, MenuItem,
  Grid, Divider, FormControlLabel, Checkbox,
  InputAdornment, Slider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { 
  MagnifyingGlass, MapPin, Eye, 
  Fire, Plus, X
} from "@phosphor-icons/react";

// --- Custom Animation Component ---
const AnimatedCounter = ({ end, duration = 1500 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <>{count.toLocaleString()}</>;
};

const LeadInfo = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [isHotLead, setIsHotLead] = useState(false); 

  // --- API State for Cascading Select ---
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState({ states: false, cities: false });
  
  const [formValues, setFormValues] = useState({
    website: 'https://www.',
    country: '',
    state: '',
    city: '',
    probability: 50, 
    revenue: ''
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // --- API Integration (CountriesNow API) ---
  useEffect(() => {
    fetch("https://countriesnow.space/api/v0.1/countries/iso")
      .then(res => res.json())
      .then(result => setCountries(result.data || []))
      .catch(err => console.error("Error fetching countries:", err));
  }, []);

  const handleCountryChange = (countryName) => {
    setFormValues({ ...formValues, country: countryName, state: '', city: '' });
    setStates([]);
    setCities([]);
    setLoading(prev => ({ ...prev, states: true }));

    fetch("https://countriesnow.space/api/v0.1/countries/states", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: countryName })
    })
      .then(res => res.json())
      .then(result => {
        setStates(result.data?.states || []);
        setLoading(prev => ({ ...prev, states: false }));
      });
  };

  const handleStateChange = (stateName) => {
    setFormValues({ ...formValues, state: stateName, city: '' });
    setCities([]);
    setLoading(prev => ({ ...prev, cities: true }));

    fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        country: formValues.country,
        state: stateName 
      })
    })
      .then(res => res.json())
      .then(result => {
        setCities(result.data || []);
        setLoading(prev => ({ ...prev, cities: false }));
      });
  };

  const handleWebsiteChange = (e) => {
    const val = e.target.value;
    if (val.startsWith('https://www.')) {
      setFormValues({ ...formValues, website: val });
    }
  };

  const handleProbabilityChange = (event, newValue) => {
    setFormValues({ ...formValues, probability: newValue });
  };

  const leads = [
    { id: 1, company: "Mahindra & Mahindra", contact: "Mr. Rahul Sharma", location: "Nashik, Maharashtra", type: "Product", status: "Negotiation", creator: "Alex D.", creatorImg: "https://i.pravatar.cc/150?img=59", logo: "M", logoColor: "linear-gradient(135deg, #ef4444, #b91c1c)", isNew: true },
    { id: 2, company: "Renuka Logistics", contact: "Mrs. Priya Deshmukh", location: "Pune, Maharashtra", type: "Service", status: "New", creator: "Maria G.", creatorImg: "https://i.pravatar.cc/150?img=32", logo: "R", logoColor: "linear-gradient(135deg, #3b82f6, #1d4ed8)", isNew: false }
  ];

  const glassPanel = { background: 'rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)', borderRadius: '16px' };
  const modalStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '95%', md: 750 }, maxHeight: '90vh', bgcolor: '#12122b', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 40px rgba(0,0,0,0.5)', borderRadius: '24px', overflowY: 'auto', p: 0, color: '#fff' };
  
  const inputStyle = {
    "& .MuiOutlinedInput-root": { color: "#fff", bgcolor: "rgba(255,255,255,0.03)", borderRadius: '12px', "& fieldset": { borderColor: "rgba(255,255,255,0.1)" }, "&:hover fieldset": { borderColor: "#3b82f6" }, "&.Mui-focused fieldset": { borderColor: "#3b82f6" } },
    "& .MuiInputLabel-root": { color: "#a0a0c0", fontSize: '0.9rem' },
    "& .MuiSvgIcon-root": { color: "#3b82f6" }
  };

  const handleViewClick = () => navigate('/marketing/customer-info');
  const handleCreateLead = () => setOpenForm(true);

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: '#fff', p: { xs: 2, md: 4 }, fontFamily: "'Inter', sans-serif" }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* --- Header Component --- */}
        <Box sx={{ ...glassPanel, p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 3 }}>
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}><Typography variant="h5" fontWeight={600}>Company Leads</Typography><Typography variant="body2" sx={{ color: '#a0a0c0' }}>Manage Field Marketing leads </Typography></Box>
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Box sx={{ textAlign: 'center' }}><Typography variant="caption" sx={{ color: '#a0a0c0', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Total Leads</Typography><Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}><AnimatedCounter end={124} /></Typography></Box>
              <Box sx={{ textAlign: 'center' }}><Typography variant="caption" sx={{ color: '#a0a0c0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}><Fire weight="fill" color="#f97316" /> HOT LEADS</Typography><Typography variant="h5" fontWeight={800} color="#f97316" sx={{ mt: 0.5 }}><AnimatedCounter end={8} /></Typography></Box>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', md: 'auto' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, px: 2, py: 1, border: '1px solid rgba(255,255,255,0.05)', flex: 1, minWidth: { md: 200 } }}><MagnifyingGlass size={20} color="#a0a0c0" /><InputBase placeholder="Search companies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ ml: 1, color: '#fff', fontSize: 14, width: '100%' }} /></Box>
            <Button variant="contained" startIcon={<Plus weight="bold" />} onClick={handleCreateLead} sx={{ bgcolor: '#3b82f6', color: '#fff', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 3, py: 1, height: 42, whiteSpace: 'nowrap', '&:hover': { bgcolor: '#2563eb' } }}>Create Lead</Button>
          </Box>
        </Box>

        {/* --- Lead List Component --- */}
        <Box sx={{ ...glassPanel, p: { xs: 2, md: 3 }, maxHeight: '75vh', overflowY: 'auto', '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '10px' } }}>
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', pb: 2, mb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#a0a0c0', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', position: 'sticky', top: 0, zIndex: 2, backdropFilter: 'blur(10px)', background: 'rgba(25, 25, 55, 0.8)' }}>
              <Box sx={{ flex: 2.5, pl: 2 }}>Company Name</Box><Box sx={{ flex: 1.5 }}>Location</Box><Box sx={{ flex: 0.8 }}>Lead Type</Box><Box sx={{ flex: 0.8 }}>Status</Box><Box sx={{ flex: 1.2 }}>Created By</Box><Box sx={{ flex: 0.5, textAlign: 'right', pr: 2 }}>Action</Box>
            </Box>
          )}
          {leads.filter(l => l.company.toLowerCase().includes(searchTerm.toLowerCase())).map((lead) => (
            <Box key={lead.id} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, p: 2, mb: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, position: 'relative', overflow: 'hidden', transition: 'all 0.2s ease', border: '1px solid transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)', transform: 'translateY(-2px)' } }}>
              <Box sx={{ flex: 2.5, display: 'flex', alignItems: 'center', gap: 2, mb: { xs: 2, md: 0 }, pl: { md: 2 } }}><Box sx={{ width: 42, height: 42, borderRadius: 2, background: lead.logoColor, color: '#fff', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{lead.logo}</Box><Box><Typography variant="body1" fontWeight={600} sx={{ lineHeight: 1.2 }}>{lead.company}</Typography><Typography variant="caption" sx={{ color: '#a0a0c0' }}>{lead.contact}</Typography></Box></Box>
              <Box sx={{ flex: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: '#ddd', fontSize: 13, mb: { xs: 2, md: 0 } }}><MapPin weight="fill" color="#a0a0c0" />{lead.location}</Box>
              <Box sx={{ flex: 0.8, mb: { xs: 2, md: 0 } }}><Chip label={lead.type} size="small" sx={{ height: 24, fontSize: 11, fontWeight: 500, bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }} /></Box>
              <Box sx={{ flex: 0.8, mb: { xs: 2, md: 0 } }}><Chip label={lead.status} size="small" sx={{ height: 24, fontSize: 11, fontWeight: 500, bgcolor: 'rgba(249, 115, 22, 0.15)', color: '#f97316' }} /></Box>
              <Box sx={{ flex: 1.2, display: 'flex', alignItems: 'center', gap: 1.5, mb: { xs: 2, md: 0 } }}><Avatar src={lead.creatorImg} sx={{ width: 28, height: 28 }} /><Typography variant="body2" fontSize={13}>{lead.creator}</Typography></Box>
              <Box sx={{ flex: 0.5, textAlign: { xs: 'left', md: 'right' }, pr: { md: 2 } }}><Button onClick={handleViewClick} variant="outlined" startIcon={<Eye weight="fill" />} sx={{ textTransform: 'none', color: '#fff', borderRadius: 2, fontSize: 12 }}>View</Button></Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* --- CREATE LEAD FORM MODAL --- */}
      <Modal open={openForm} onClose={() => setOpenForm(false)}>
        <Box sx={modalStyle}>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h5" fontWeight={700}>Create New Lead</Typography>
            <IconButton onClick={() => setOpenForm(false)} sx={{ color: '#fff' }}><X size={24} /></IconButton>
          </Box>
          <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Grid container spacing={3}>
              <Grid item xs={12}><Typography color="#3b82f6" variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Company Details</Typography></Grid>
              <Grid item xs={12}><TextField fullWidth size="small" label="Lead Name" sx={inputStyle} /></Grid>
              <Grid item xs={12}><TextField fullWidth size="small" label="Company Name" sx={inputStyle} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Company Contact Number" sx={inputStyle} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Company Email" sx={inputStyle} /></Grid>
              <Grid item xs={12}><TextField fullWidth size="small" label="Company Website" sx={inputStyle} value={formValues.website} onChange={handleWebsiteChange} placeholder="https://www.company.com" /></Grid>

              <Grid item xs={12} sx={{ mt: 1 }}><Typography color="#3b82f6" variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Contact Person</Typography></Grid>
              <Grid item xs={12}><TextField fullWidth size="small" label="Person Name" sx={inputStyle} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Person Number" sx={inputStyle} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Person Email" sx={inputStyle} /></Grid>

              {/* LOCATION SECTION - IMPROVED VISIBILITY */}
              <Grid item xs={12} sx={{ mt: 1 }}><Typography color="#3b82f6" variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Location & Industry</Typography></Grid>
              <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Address" sx={inputStyle} /></Grid>
              
              <Grid item xs={12}>
                <TextField select fullWidth size="small" label="Country" sx={inputStyle} value={formValues.country} onChange={(e) => handleCountryChange(e.target.value)}>
                  {countries.map((c) => (<MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>))}
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField select fullWidth size="small" label={loading.states ? "Loading States..." : "State / Province"} sx={inputStyle} value={formValues.state} onChange={(e) => handleStateChange(e.target.value)} disabled={!formValues.country}>
                  {states.map((s, idx) => (<MenuItem key={idx} value={s.name}>{s.name}</MenuItem>))}
                </TextField>
              </Grid>

              {/* Cascading City Selection */}
              <Grid item xs={12}>
                <TextField select fullWidth size="small" label={loading.cities ? "Loading Cities..." : "City"} sx={inputStyle} value={formValues.city} onChange={(e) => setFormValues({...formValues, city: e.target.value})} disabled={!formValues.state}>
                  {cities.map((cty, idx) => (<MenuItem key={idx} value={cty}>{cty}</MenuItem>))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Zipcode" sx={inputStyle} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Industry Type" sx={inputStyle} /></Grid>

              <Grid item xs={12} sx={{ mt: 1 }}><Typography color="#3b82f6" variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Lead Specifics</Typography></Grid>
              <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Lead Requirement" sx={inputStyle} /></Grid>
              <Grid item xs={12} md={4}><TextField select fullWidth size="small" label="Lead Type" sx={inputStyle} defaultValue="Product"><MenuItem value="Product">Product</MenuItem><MenuItem value="Service">Service</MenuItem></TextField></Grid>
              <Grid item xs={12} md={4}><TextField select fullWidth size="small" label="Priority" sx={inputStyle} defaultValue="Medium"><MenuItem value="High">High</MenuItem><MenuItem value="Medium">Medium</MenuItem><MenuItem value="Low">Low</MenuItem></TextField></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth type="date" size="small" label="Expected Closing Date" InputLabelProps={{ shrink: true }} sx={inputStyle} /></Grid>
              
              <Grid item xs={12}>
                <TextField fullWidth size="small" label="Expected Revenue" sx={inputStyle} placeholder="0.00" 
                  InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{color:'#3b82f6', fontWeight:700}}>₹</Typography></InputAdornment> }} />
              </Grid>
              
              {/* PROBABILITY BAR ON NEW LINE */}
              <Grid item xs={12}>
                <Box sx={{ px: 1, py: 2 }}>
                  <Typography variant="caption" sx={{ color: "#a0a0c0", mb: 1, display: 'block', fontWeight: 600 }}>Probability: {formValues.probability}%</Typography>
                  <Slider value={formValues.probability} onChange={handleProbabilityChange} valueLabelDisplay="auto" sx={{ color: '#3b82f6', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #3b82f6' }, '& .MuiSlider-rail': { bgcolor: 'rgba(255,255,255,0.1)' }}} />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ bgcolor: isHotLead ? 'rgba(249, 115, 22, 0.1)' : 'rgba(255,255,255,0.02)', p: 1.5, borderRadius: '12px', border: isHotLead ? '1px solid #f97316' : '1px solid rgba(255,255,255,0.05)', transition: '0.3s' }}>
                   <FormControlLabel control={<Checkbox checked={isHotLead} onChange={(e) => setIsHotLead(e.target.checked)} icon={<Fire size={24} color="#a0a0c0" />} checkedIcon={<Fire weight="fill" size={24} color="#f97316" />} sx={{ color: '#f97316' }} />} label={<Typography sx={{ color: isHotLead ? '#f97316' : '#a0a0c0', fontWeight: 700 }}>MARK AS HOT LEAD</Typography>} />
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 5, mb: 2, display: 'flex', gap: 2, flexDirection: 'column' }}>
              <Button variant="contained" sx={{ bgcolor: '#3b82f6', borderRadius: '12px', py: 1.5, fontWeight: 700, textTransform: 'none' }}>Save Lead</Button>
              <Button onClick={() => setOpenForm(false)} sx={{ color: '#a0a0c0', fontWeight: 600, textTransform: 'none' }}>Cancel</Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default LeadInfo;