import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, InputBase, Avatar, 
  Button, Chip, useTheme, useMediaQuery,
  Snackbar, Alert, CircularProgress, Tooltip,
  Stack, Grid, TextField, MenuItem 
} from '@mui/material'; // MUI for Page Layout
import { useNavigate } from 'react-router-dom';

import { 
  MagnifyingGlass, MapPin, Eye, 
  Fire, Plus, Funnel, X
} from "@phosphor-icons/react";

// --- API HELPERS ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

const getAuthUser = () => {
  const userStr = localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");
  try { return userStr ? JSON.parse(userStr) : null; } catch (e) { return null; }
};

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const AnimatedCounter = ({ end, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return <>{count.toLocaleString()}</>;
};

const LeadInfo = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false); 
  const [isHotLead, setIsHotLead] = useState(false); 
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  // Data & Filters
  const [leads, setLeads] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState({ total: 0, hot: 0 });

  const [filterType, setFilterType] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterCountry, setFilterCountry] = useState("All");
  const [filterState, setFilterState] = useState("All");
  const [filterCity, setFilterCity] = useState("All");

  // --- Form Data State (For Create Lead Modal) ---
  const [countries, setCountries] = useState([]); // External API Countries for Modal
  const [formStates, setFormStates] = useState([]);
  const [formCities, setFormCities] = useState([]);
  const [loadingFormLoc, setLoadingFormLoc] = useState({ states: false, cities: false });
  
  const [formData, setFormData] = useState({
    lead_name: '', company_name: '', company_contact_number: '', company_email: '',
    company_website: 'https://www.', contact_person_name: '', contact_person_phone: '',
    contact_person_email: '', company_address: '', company_country: 'India', 
    company_state: '', company_city: '', zipcode: '', industry_type: '', 
    lead_requirement: '', lead_type: 'Product', lead_priority: 'Medium'
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // --- 1. FETCH LEADS ---
  const fetchLeads = async () => {
    setLoadingData(true);
    try {
        const token = getToken();
        if(!token) return;
        const response = await fetch(`${API_BASE_URL}/api/fleads/my-leads`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            setLeads(data.leads || []);
            setStats({ total: data.total_leads || 0, hot: data.hot_leads_count || 0 });
        }
    } catch (error) { console.error("API Error:", error); } finally { setLoadingData(false); }
  };

  useEffect(() => { fetchLeads(); }, []);

  // --- 2. Initialize External Countries (Only for Modal) ---
  useEffect(() => {
    fetch("https://countriesnow.space/api/v0.1/countries/iso")
      .then(res => res.json())
      .then(result => {
          setCountries(result.data || []);
          // Preload India states if modal opens
          if(showModal) handleFormCountryChange("India");
      }).catch(err => console.error(err));
  }, [showModal]);


  // ==========================================
  //  🔍 DYNAMIC FILTER LOGIC (Derived from Leads)
  // ==========================================
  
  // 1. Get unique Countries from existing leads
  const uniqueCountries = useMemo(() => {
    const allCountries = leads.map(l => l.company_country).filter(Boolean); // Get valid countries
    return [...new Set(allCountries)].sort(); // Unique & Sorted
  }, [leads]);

  // 2. Get unique States based on selected Filter Country
  const uniqueStates = useMemo(() => {
    if (filterCountry === "All") return [];
    const relevantLeads = leads.filter(l => l.company_country === filterCountry);
    const allStates = relevantLeads.map(l => l.company_state).filter(Boolean);
    return [...new Set(allStates)].sort();
  }, [leads, filterCountry]);

  // 3. Get unique Cities based on selected Filter State
  const uniqueCities = useMemo(() => {
    if (filterState === "All") return [];
    // Filter by Country AND State to be safe
    const relevantLeads = leads.filter(l => 
        (filterCountry === "All" || l.company_country === filterCountry) && 
        l.company_state === filterState
    );
    const allCities = relevantLeads.map(l => l.company_city).filter(Boolean);
    return [...new Set(allCities)].sort();
  }, [leads, filterCountry, filterState]);

  // --- Filter Handlers ---
  const handleFilterCountryChange = (val) => {
    setFilterCountry(val);
    setFilterState("All"); // Reset sub-filters
    setFilterCity("All");
  };

  const handleFilterStateChange = (val) => {
    setFilterState(val);
    setFilterCity("All"); // Reset sub-filter
  };


  // ==========================================
  //  📝 CREATE FORM HANDLERS (External API)
  // ==========================================
  
  const handleFormCountryChange = (countryName) => {
    setFormData(prev => ({ ...prev, company_country: countryName, company_state: '', company_city: '' }));
    setFormStates([]); setFormCities([]);
    if(!countryName) return;

    setLoadingFormLoc(prev => ({ ...prev, states: true }));
    fetch("https://countriesnow.space/api/v0.1/countries/states", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: countryName })
    }).then(res => res.json()).then(result => {
        setFormStates(result.data?.states || []);
        setLoadingFormLoc(prev => ({ ...prev, states: false }));
    });
  };

  const handleFormStateChange = (stateName) => {
    setFormData(prev => ({ ...prev, company_state: stateName, company_city: '' }));
    setFormCities([]);
    if(!stateName) return;

    setLoadingFormLoc(prev => ({ ...prev, cities: true }));
    fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: formData.company_country, state: stateName })
    }).then(res => res.json()).then(result => {
        setFormCities(result.data || []);
        setLoadingFormLoc(prev => ({ ...prev, cities: false }));
    });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!formData.company_name || !formData.lead_name) {
        setToast({ open: true, message: "Lead Name and Company Name are required", severity: "warning" });
        return;
    }
    setSubmitting(true);
    try {
        const token = getToken();
        const currentUser = getAuthUser();
        const assignedEmpId = currentUser?.employee_id || "0"; 

        const payload = {
            ...formData,
            assigned_employee: assignedEmpId, 
            lead_status: "new",
            lead_stage: "Field-Marketing",
            expected_closing_date: null, expected_revenue: 0, probability: 50,           
            mark_as_hot_lead: isHotLead, follow_up_reason: null, follow_up_date: null, follow_up_time: null, notes: null
        };

        const response = await fetch(`${API_BASE_URL}/api/fleads`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            setToast({ open: true, message: "Lead Created Successfully!", severity: "success" });
            setShowModal(false);
            fetchLeads(); 
            setFormData({
                lead_name: '', company_name: '', company_contact_number: '', company_email: '',
                company_website: 'https://www.', contact_person_name: '', contact_person_phone: '',
                contact_person_email: '', company_address: '', company_country: 'India', company_state: '',
                company_city: '', zipcode: '', industry_type: '', lead_requirement: '',
                lead_type: 'Product', lead_priority: 'Medium'
            });
            setIsHotLead(false);

            setTimeout(async () => {
                try {
                    await fetch(`${API_BASE_URL}/api/notifications/send`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to_emp_id: assignedEmpId, title: "New Lead Created",
                            message: `You have created a new lead: ${payload.lead_name}`
                        })
                    });
                } catch (e) { console.error(e); }
            }, 2000);
        } else {
            throw new Error(data.message || "Failed to create lead");
        }
    } catch (error) {
        setToast({ open: true, message: error.message, severity: "error" });
    } finally {
        setSubmitting(false);
    }
  };

  // --- Filtering Logic (Matches the Dropdown selections) ---
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
        const matchesSearch = (lead.company_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || (lead.lead_name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        
        const matchesType = filterType === "All" || lead.lead_type === filterType;
        const matchesPriority = filterPriority === "All" || lead.lead_priority === filterPriority;
        const matchesCountry = filterCountry === "All" || lead.company_country === filterCountry;
        const matchesState = filterState === "All" || lead.company_state === filterState;
        const matchesCity = filterCity === "All" || lead.company_city === filterCity;

        return matchesSearch && matchesType && matchesPriority && matchesCountry && matchesState && matchesCity;
    });
  }, [leads, searchTerm, filterType, filterPriority, filterCountry, filterState, filterCity]);

  // Styles
  const glassPanel = { background: 'rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)', borderRadius: '16px' };
  
  // Custom Dark Dropdown Style for Filters
  const filterInputStyle = {
    "& .MuiOutlinedInput-root": { 
        color: "#fff", 
        bgcolor: "rgba(0,0,0,0.2)", 
        borderRadius: '8px',
        height: '40px',
        fontSize: '0.85rem',
        "& fieldset": { borderColor: "rgba(255,255,255,0.1)" }, 
        "&:hover fieldset": { borderColor: "#3b82f6" }, 
        "&.Mui-focused fieldset": { borderColor: "#3b82f6" } 
    },
    "& .MuiInputLabel-root": { color: "#a0a0c0", fontSize: '0.8rem', top: '-4px' }, // Adjusted label position
    "& .MuiSvgIcon-root": { color: "#3b82f6" }
  };

  const getPriorityColor = (p) => {
    switch(p?.toLowerCase()) {
        case 'high': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' };
        case 'medium': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' };
        case 'low': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' };
        default: return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' };
    }
  };

  const handleViewClick = (id) => {
    navigate(`/marketing/customer-info/${id}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: '#fff', p: { xs: 2, md: 4 }, fontFamily: "'Inter', sans-serif" }}>
      
      {/* --- CSS INJECTION FOR SEXY FORMS --- */}
      <style>{`
        /* Sexy Modal Base */
        .modal-content { 
            background: #0f1028 !important; 
            border: 1px solid rgba(59, 130, 246, 0.3); 
            border-radius: 16px; 
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.8); 
        }
        .modal-header { 
            border-bottom: 1px solid rgba(255,255,255,0.08); 
            padding: 1.5rem; 
        }
        .modal-body { 
            padding: 2rem; 
        }

        /* Sexy Inputs */
        .sexy-input {
            background-color: rgba(30, 32, 55, 0.7) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            color: #f1f5f9 !important;
            border-radius: 10px !important;
            padding: 12px 16px !important;
            font-size: 0.95rem !important;
            transition: all 0.25s ease;
        }
        .sexy-input:focus {
            background-color: rgba(30, 32, 55, 1) !important;
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
            outline: none;
        }
        .sexy-input::placeholder {
            color: rgba(255, 255, 255, 0.3) !important;
        }

        /* Sexy Labels */
        .sexy-label {
            color: #94a3b8;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 6px;
            display: block;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Section Titles */
        .sexy-header {
            color: #3b82f6;
            font-size: 0.85rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            margin-top: 30px;
            margin-bottom: 15px;
            border-bottom: 1px solid rgba(59, 130, 246, 0.2);
            padding-bottom: 5px;
            display: inline-block;
        }

        /* Dropdown Fix for Dark Mode */
        .sexy-input option {
            background-color: #1a1a2e;
            color: #fff;
            padding: 10px;
        }

        /* Hot Lead Box */
        .hot-lead-box {
            background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.05));
            border: 1px solid rgba(249, 115, 22, 0.4);
            border-radius: 12px;
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 25px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(249, 115, 22, 0.1);
        }

        /* Buttons */
        .btn-sexy-primary {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            border: none;
            border-radius: 10px;
            padding: 12px 24px;
            color: white;
            font-weight: 600;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
            transition: all 0.2s ease;
        }
        .btn-sexy-primary:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4); 
        }
        .btn-sexy-secondary {
            background: transparent;
            border: 1px solid rgba(255,255,255,0.2);
            color: #cbd5e1;
            border-radius: 10px;
            padding: 12px 24px;
            font-weight: 600;
            transition: all 0.2s ease;
        }
        .btn-sexy-secondary:hover { 
            background: rgba(255,255,255,0.05); 
            color: #fff; 
            border-color: #fff;
        }

        /* Custom Scrollbar */
        .modal-body::-webkit-scrollbar { width: 6px; }
        .modal-body::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.3); border-radius: 10px; }
        .modal-body::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
      `}</style>

      {/* --- Bootstrap Modal --- */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1300 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-white fs-4">Create New Lead</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  
                  {/* Section 1 */}
                  <div className="sexy-header mt-0">Company Details</div>
                  <div className="mb-3">
                    <label className="sexy-label">Lead Name <span className="text-danger">*</span></label>
                    <input type="text" className="form-control sexy-input" name="lead_name" value={formData.lead_name} onChange={handleChange} placeholder="Give Your Lead a Name" required />
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">Company Name <span className="text-danger">*</span></label>
                    <input type="text" className="form-control sexy-input" name="company_name" value={formData.company_name} onChange={handleChange} placeholder="Company Name" required />
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">Company Contact Number</label>
                    <input type="text" className="form-control sexy-input" name="company_contact_number" value={formData.company_contact_number} onChange={handleChange} placeholder="Direct Line" />
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">Company Email</label>
                    <input type="email" className="form-control sexy-input" name="company_email" value={formData.company_email} onChange={handleChange} placeholder="info@company.com" />
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">Company Website</label>
                    <input type="text" className="form-control sexy-input" name="company_website" value={formData.company_website} onChange={handleChange} placeholder="https://www.company.com" />
                  </div>

                  {/* Section 2 */}
                  <div className="sexy-header">Contact Person</div>
                  <div className="mb-3">
                    <label className="sexy-label">Person Name</label>
                    <input type="text" className="form-control sexy-input" name="contact_person_name" value={formData.contact_person_name} onChange={handleChange} placeholder="John Doe" />
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">Person Phone</label>
                    <input type="text" className="form-control sexy-input" name="contact_person_phone" value={formData.contact_person_phone} onChange={handleChange} placeholder="Direct line" />
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">Person Email</label>
                    <input type="email" className="form-control sexy-input" name="contact_person_email" value={formData.contact_person_email} onChange={handleChange} placeholder="john@company.com" />
                  </div>

                  {/* Section 3 */}
                  <div className="sexy-header">Location & Industry</div>
                  <div className="mb-3">
                    <label className="sexy-label">Address</label>
                    <textarea className="form-control sexy-input" rows="2" name="company_address" value={formData.company_address} onChange={handleChange} placeholder="Full street address"></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">Country</label>
                    <select className="form-select sexy-input" name="company_country" value={formData.company_country} onChange={(e) => handleFormCountryChange(e.target.value)}>
                        {countries.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">{loadingFormLoc.states ? "Loading States..." : "State"}</label>
                    <select className="form-select sexy-input" name="company_state" value={formData.company_state} onChange={(e) => handleFormStateChange(e.target.value)} disabled={!formData.company_country}>
                        <option value="">Select State</option>
                        {formStates.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">{loadingFormLoc.cities ? "Loading Cities..." : "City"}</label>
                    <select className="form-select sexy-input" name="company_city" value={formData.company_city} onChange={(e) => setFormData({...formData, company_city: e.target.value})} disabled={!formData.company_state}>
                        <option value="">Select City</option>
                        {formCities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">Zipcode</label>
                    <input type="text" className="form-control sexy-input" name="zipcode" value={formData.zipcode} onChange={handleChange} placeholder="123456" />
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">Industry Type</label>
                    <input type="text" className="form-control sexy-input" name="industry_type" value={formData.industry_type} onChange={handleChange} placeholder="e.g. Manufacturing" />
                  </div>

                  {/* Section 4 */}
                  <div className="sexy-header">Lead Specifics</div>
                  <div className="mb-3">
                    <label className="sexy-label">Requirement</label>
                    <textarea className="form-control sexy-input" rows="3" name="lead_requirement" value={formData.lead_requirement} onChange={handleChange} placeholder="Describe the client requirement..."></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">Lead Type</label>
                    <select className="form-select sexy-input" name="lead_type" value={formData.lead_type} onChange={handleChange}>
                        <option value="Product">Product</option>
                        <option value="Service">Service</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">Priority</label>
                    <select className="form-select sexy-input" name="lead_priority" value={formData.lead_priority} onChange={handleChange}>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                  </div>

                  {/* Hot Lead Switch */}
                  <div className="hot-lead-box">
                    <div>
                        <div className="text-warning fw-bold mb-1" style={{ fontSize: '0.9rem' }}><Fire weight="fill" style={{ marginRight: '8px' }} /> Mark as Hot Lead</div>
                        <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Prioritize this lead for immediate attention</div>
                    </div>
                    <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" role="switch" style={{ width: '3.5em', height: '1.8em', cursor: 'pointer', backgroundColor: isHotLead ? '#f97316' : '#475569', borderColor: 'transparent' }} checked={isHotLead} onChange={(e) => setIsHotLead(e.target.checked)} />
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="d-grid gap-3 d-md-flex justify-content-md-end mt-4 pt-3 border-top border-secondary">
                    <button type="button" className="btn btn-sexy-secondary px-4" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-sexy-primary px-5" disabled={submitting}>
                      {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : 'Save Lead'}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Main Content (MUI for List) --- */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ ...glassPanel, p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 3 }}>
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}><Typography variant="h5" fontWeight={600}>Company Leads</Typography><Typography variant="body2" sx={{ color: '#a0a0c0' }}>Manage Field Marketing leads </Typography></Box>
          {!isMobile && (<Box sx={{ display: 'flex', alignItems: 'center', gap: 6 }}><Box sx={{ textAlign: 'center' }}><Typography variant="caption" sx={{ color: '#a0a0c0', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Total Leads</Typography><Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}><AnimatedCounter end={stats.total} /></Typography></Box><Box sx={{ textAlign: 'center' }}><Typography variant="caption" sx={{ color: '#a0a0c0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}><Fire weight="fill" color="#f97316" /> HOT LEADS</Typography><Typography variant="h5" fontWeight={800} color="#f97316" sx={{ mt: 0.5 }}><AnimatedCounter end={stats.hot} /></Typography></Box></Box>)}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', md: 'auto' } }}><Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, px: 2, py: 1, border: '1px solid rgba(255,255,255,0.05)', flex: 1, minWidth: { md: 200 } }}><MagnifyingGlass size={20} color="#a0a0c0" /><InputBase placeholder="Search companies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ ml: 1, color: '#fff', fontSize: 14, width: '100%' }} /></Box><Button variant="contained" startIcon={<Plus weight="bold" />} onClick={() => setShowModal(true)} sx={{ bgcolor: '#3b82f6', color: '#fff', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 3, py: 1, height: 42, whiteSpace: 'nowrap', '&:hover': { bgcolor: '#2563eb' } }}>Create Lead</Button></Box>
        </Box>

        {/* --- Filters (Dynamic & HIDDEN ON MOBILE) --- */}
        <Box sx={{ ...glassPanel, p: 2, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', display: { xs: 'none', md: 'block' } }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                <Box display="flex" alignItems="center" gap={1.5} color="#a0a0c0" minWidth={100}><Funnel size={22} weight="duotone" color="#3b82f6" /><Typography variant="body2" fontWeight={600} letterSpacing={0.5} sx={{textTransform: 'uppercase', fontSize: '0.75rem'}}>Filters:</Typography></Box>
                <Grid container spacing={2} sx={{ width: '100%' }}>
                    <Grid item xs={6} md={2.4}><TextField select fullWidth size="small" label="Lead Type" value={filterType} onChange={(e) => setFilterType(e.target.value)} sx={filterInputStyle}><MenuItem value="All">All Types</MenuItem><MenuItem value="Product">Product</MenuItem><MenuItem value="Service">Service</MenuItem></TextField></Grid>
                    <Grid item xs={6} md={2.4}><TextField select fullWidth size="small" label="Priority" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} sx={filterInputStyle}><MenuItem value="All">All Priorities</MenuItem><MenuItem value="High">High</MenuItem><MenuItem value="Medium">Medium</MenuItem><MenuItem value="Low">Low</MenuItem></TextField></Grid>
                    
                    {/* DYNAMIC FILTER MENUS */}
                    <Grid item xs={6} md={2.4}>
                        <TextField select fullWidth size="small" label="Country" value={filterCountry} onChange={(e) => handleFilterCountryChange(e.target.value)} sx={filterInputStyle}>
                            <MenuItem value="All">All Countries</MenuItem>
                            {uniqueCountries.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={6} md={2.4}>
                        <TextField select fullWidth size="small" label="State" value={filterState} onChange={(e) => handleFilterStateChange(e.target.value)} sx={filterInputStyle} disabled={filterCountry === "All"}>
                            <MenuItem value="All">All States</MenuItem>
                            {uniqueStates.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={6} md={2.4}>
                        <TextField select fullWidth size="small" label="City" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} sx={filterInputStyle} disabled={filterState === "All"}>
                            <MenuItem value="All">All Cities</MenuItem>
                            {uniqueCities.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                        </TextField>
                    </Grid>
                </Grid>
            </Stack>
        </Box>

        {/* --- LEADS TABLE --- */}
        <Box sx={{ ...glassPanel, p: { xs: 2, md: 3 }, maxHeight: '75vh', overflowY: 'auto', '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '10px' } }}>
          {!isMobile && (<Box sx={{ display: 'grid', gridTemplateColumns: '3fr 2fr 1fr 1fr 2fr 0.6fr', alignItems: 'center', pb: 2, mb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#a0a0c0', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', position: 'sticky', top: 0, zIndex: 2, backdropFilter: 'blur(10px)', background: 'rgba(25, 25, 55, 0.9)' }}><Box sx={{ pl: 2 }}>Company & Contact</Box><Box>Location</Box><Box>Type</Box><Box>Priority</Box><Box>Created By</Box><Box sx={{ textAlign: 'right', pr: 2 }}>Action</Box></Box>)}
          {loadingData ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box> : filteredLeads.length === 0 ? <Box sx={{ textAlign: 'center', p: 5, color: '#a0a0c0' }}>No leads found matching your filters.</Box> : filteredLeads.map((lead) => {
                const priorityStyle = getPriorityColor(lead.lead_priority);
                return (
                    <Box key={lead.lead_id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 2fr 1fr 1fr 2fr 0.6fr' }, alignItems: 'center', gap: { xs: 1, md: 0 }, p: 2, mb: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, transition: 'all 0.2s ease', border: '1px solid transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)', transform: 'translateY(-2px)' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pl: { md: 2 } }}><Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16, fontWeight: 700, width: 36, height: 36 }}>{lead.company_name?.charAt(0).toUpperCase()}</Avatar><Box overflow="hidden"><Typography variant="body2" fontWeight={600} noWrap>{lead.company_name}</Typography><Typography variant="caption" sx={{ color: '#a0a0c0', display: 'block' }} noWrap>{lead.contact_person_name}</Typography></Box></Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#ddd', fontSize: 13 }}><MapPin weight="fill" color="#a0a0c0" /><Typography variant="body2" noWrap sx={{ fontSize: 13 }}>{lead.company_city}, {lead.company_state}</Typography></Box>
                        <Box><Chip label={lead.lead_type} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 600, bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' }} /></Box>
                        <Box><Chip label={lead.lead_priority || 'Medium'} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 600, bgcolor: priorityStyle.bg, color: priorityStyle.text }} /></Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Avatar sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 700, bgcolor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.4)' }}>{getInitials(lead.created_by_name)}</Avatar><Typography variant="body2" fontSize={13} color="#e2e8f0">{lead.created_by_name || "Unknown"}</Typography></Box>
                        <Box sx={{ textAlign: { xs: 'left', md: 'right' }, pr: { md: 2 } }}><Button onClick={() => handleViewClick(lead.lead_id)} variant="outlined" size="small" sx={{ minWidth: 0, p: '4px 10px', textTransform: 'none', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.3)', borderRadius: 2, fontSize: 12, '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)' } }}>View</Button></Box>
                    </Box>
                )
             })}
        </Box>
      </Box>

      <Snackbar open={toast.open} autoHideDuration={6000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}><Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: '12px', width: '100%' }}>{toast.message}</Alert></Snackbar>
    </Box>
  );
};

export default LeadInfo;