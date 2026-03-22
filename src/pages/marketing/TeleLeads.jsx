import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Stack, Typography, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TableContainer, CircularProgress, Avatar, InputBase, TextField,
  Select, FormControl, Snackbar, Alert, IconButton, Menu, MenuItem, Divider
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useNavigate } from "react-router-dom";

// Phosphor Icons
import {
  CaretRight,
  Trophy,
  Fire,
  Plus,
  MagnifyingGlass,
  DotsThreeVertical
} from "@phosphor-icons/react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

/* ----------------- helpers ----------------- */
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
const getRole = () => localStorage.getItem("auth_role") || sessionStorage.getItem("auth_role") || "";

const getEmployeeId = () => {
  const direct = localStorage.getItem("auth_employee_id") || sessionStorage.getItem("auth_employee_id");
  if (direct) return direct;
  try {
    const rawUser = localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");
    if (rawUser) {
      const u = JSON.parse(rawUser);
      return u.employee_id || u.employeeId || u.emp_id || u.id || "";
    }
  } catch {}
  const token = getToken();
  if (token && token.split(".").length === 3) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.employee_id || payload.emp_id || payload.sub || "";
    } catch {}
  }
  return "";
};

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

function mapLead(api) {
  // Map full location
  const location = [api.company_address, api.company_city, api.company_state, api.company_country].filter(Boolean).join(", ");
  
  return {
    id: api.lead_id,
    leadNo: api.lead_id,
    company: api.company_name,
    createdAt: api.created_at,
    industry: api.industry_type,
    contact: api.contact_person_name,
    phone: api.contact_person_phone,
    email: api.contact_person_email || api.company_email || "",
    leadType: api.lead_type || api.lead_requirement || "N/A", // Adjust based on your API response
    requirement: api.lead_requirement || "Unknown",
    location,
    priority: api.lead_priority || "Medium",
    _raw: api,
  };
}

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

// --- THEME CONSTANTS ---
const themeColors = {
  bgGradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  glassBg: 'rgba(255, 255, 255, 0.03)',
  glassBorder: '1px solid rgba(255, 255, 255, 0.08)',
  textSecondary: '#a0a0c0',
  blue: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

/* ================================ main page ================================ */
export default function TeleLeads() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const authUser = getAuthUser();

  // Data buckets (Only fetching "New" leads)
  const [newLeads, setNewLeads] = useState([]);
  const [loadingNew, setLoadingNew] = useState(false);

  // Search
  const [search, setSearch] = useState("");

  // Add Lead Modal State
  const [showModal, setShowModal] = useState(false);
  const [isHotLead, setIsHotLead] = useState(false); 
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const [countries, setCountries] = useState([]); 
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

  // Dynamic Filtering (Only searching text)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return newLeads.filter((l) => {
      if (!q) return true;
      return [l.leadNo, l.company, l.contact, l.phone, l.email, l.leadType, l.location, l.requirement]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [newLeads, search]);

  /* ================== API FETCHING ================== */
  async function fetchLeadsBy(status) {
    const token = getToken();
    if (!token) return [];
    const url = `${API_BASE_URL}/api/leads/my-leads?lead_status=${encodeURIComponent(status)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Failed to fetch");
    const json = await res.json();
    return (Array.isArray(json?.leads) ? json.leads : []).map(mapLead);
  }

  async function refreshAll() {
    try {
      setLoadingNew(true); 
      const n = await fetchLeadsBy("new");
      setNewLeads(n); 
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoadingNew(false); 
    }
  }

  useEffect(() => { refreshAll(); }, []);

  // Countries Initializer
  useEffect(() => {
    fetch("https://countriesnow.space/api/v0.1/countries/iso")
      .then(res => res.json())
      .then(result => {
          setCountries(result.data || []);
          if(showModal) handleFormCountryChange("India");
      }).catch(err => console.error(err));
  }, [showModal]);

  /* ================== ADD LEAD FORM ================== */
  const handleFormCountryChange = (countryName) => {
    setFormData(prev => ({ ...prev, company_country: countryName, company_state: '', company_city: '' }));
    setFormStates([]); setFormCities([]);
    if(!countryName) return;
    setLoadingFormLoc(prev => ({ ...prev, states: true }));
    fetch("https://countriesnow.space/api/v0.1/countries/states", {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ country: countryName })
    }).then(res => res.json()).then(result => { setFormStates(result.data?.states || []); setLoadingFormLoc(prev => ({ ...prev, states: false })); });
  };

  const handleFormStateChange = (stateName) => {
    setFormData(prev => ({ ...prev, company_state: stateName, company_city: '' }));
    setFormCities([]);
    if(!stateName) return;
    setLoadingFormLoc(prev => ({ ...prev, cities: true }));
    fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ country: formData.company_country, state: stateName })
    }).then(res => res.json()).then(result => { setFormCities(result.data || []); setLoadingFormLoc(prev => ({ ...prev, cities: false })); });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const submitNewLead = async (e) => {
    e.preventDefault(); 
    if (!formData.company_name || !formData.lead_name) {
        setToast({ open: true, message: "Lead Name and Company Name are required", severity: "warning" });
        return;
    }
    setSubmitting(true);
    try {
        const token = getToken();
        const empId = getEmployeeId();
        const currentUser = getAuthUser(); 
        
        const fd = new FormData();
        fd.append("lead_name", formData.lead_name);
        fd.append("company_name", formData.company_name);
        fd.append("contact_person_name", formData.contact_person_name);
        fd.append("contact_person_phone", formData.contact_person_phone);
        fd.append("contact_person_email", formData.contact_person_email);
        fd.append("company_contact_number", formData.company_contact_number);
        fd.append("company_email", formData.company_email);
        fd.append("company_website", formData.company_website);
        fd.append("company_address", formData.company_address);
        fd.append("company_country", formData.company_country);
        fd.append("company_state", formData.company_state);
        fd.append("company_city", formData.company_city);
        fd.append("zipcode", formData.zipcode);
        fd.append("industry_type", formData.industry_type);
        fd.append("lead_requirement", formData.lead_requirement);
        fd.append("lead_type", formData.lead_type);
        fd.append("lead_priority", formData.lead_priority);
        fd.append("mark_as_hot_lead", isHotLead ? 1 : 0);
        fd.append("assigned_employee", empId || "0");
        fd.append("lead_status", "new");
        fd.append("lead_stage", "Tele-Marketing");

        const response = await fetch(`${API_BASE_URL}/api/leads`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }, 
            body: fd
        });

        const data = await response.json().catch(() => ({}));
        if (response.ok) {
            setToast({ open: true, message: "Lead Created Successfully!", severity: "success" });
            setShowModal(false);
            refreshAll(); 
            setFormData({
                lead_name: '', company_name: '', company_contact_number: '', company_email: '',
                company_website: 'https://www.', contact_person_name: '', contact_person_phone: '',
                contact_person_email: '', company_address: '', company_country: 'India', company_state: '',
                company_city: '', zipcode: '', industry_type: '', lead_requirement: '',
                lead_type: 'Product', lead_priority: 'Medium'
            });
            setIsHotLead(false);

            // --- NOTIFICATION TO TELEMARKETING HEAD ---
            setTimeout(async () => {
                try {
                    const notificationPayload = {
                        to_emp_id: "IPQS-H25001",
                        title: "New Lead Created",
                        message: `Lead ${formData.lead_name} created by Tele Marketing department (${currentUser?.username || 'Employee'}). Needs to be assigned.`
                    };

                    await fetch(`${API_BASE_URL}/api/notifications/send`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify(notificationPayload)
                    });
                } catch (e) {
                    console.error("Error sending notification:", e);
                }
            }, 1500);

            // Force navigation just in case
            navigate('/marketing/tele/leads');

        } else {
            throw new Error(data.message || "Failed to create lead");
        }
    } catch (error) {
        setToast({ open: true, message: error.message, severity: "error" });
    } finally {
        setSubmitting(false);
    }
  };

  // --- Styles ---
  const glassPanel = { background: 'rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)', borderRadius: '16px' };
  
  const getPriorityColor = (p) => {
    switch(p?.toLowerCase()) {
        case 'high': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' };
        case 'medium': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' };
        case 'low': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' };
        default: return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' };
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', background: themeColors.bgGradient, color: '#fff', p: { xs: 1, md: 4 }, fontFamily: "'Inter', sans-serif" }}>
      
      {/* --- INJECTED CSS FOR MODAL --- */}
      <style>{`
        .modal-content { background: #0f1028 !important; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 16px; box-shadow: 0 0 40px rgba(0, 0, 0, 0.8); }
        .modal-header { border-bottom: 1px solid rgba(255,255,255,0.08); padding: 1.5rem; }
        .modal-body { padding: 2rem; }
        .sexy-input { background-color: rgba(30, 32, 55, 0.7) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; color: #f1f5f9 !important; border-radius: 10px !important; padding: 12px 16px !important; font-size: 0.95rem !important; transition: all 0.25s ease; }
        .sexy-input:focus { background-color: rgba(30, 32, 55, 1) !important; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important; outline: none; }
        .sexy-input::placeholder { color: rgba(255, 255, 255, 0.3) !important; }
        .sexy-label { color: #94a3b8; font-size: 0.8rem; font-weight: 600; margin-bottom: 6px; display: block; text-transform: uppercase; letter-spacing: 0.5px; }
        .sexy-header { color: #3b82f6; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid rgba(59, 130, 246, 0.2); padding-bottom: 5px; display: inline-block; }
        .sexy-input option { background-color: #1a1a2e; color: #fff; padding: 10px; }
        .hot-lead-box { background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.05)); border: 1px solid rgba(249, 115, 22, 0.4); border-radius: 12px; padding: 16px; display: flex; align-items: center; justify-content: space-between; margin-top: 25px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.1); }
        .btn-sexy-primary { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: none; border-radius: 10px; padding: 12px 24px; color: white; font-weight: 600; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3); transition: all 0.2s ease; }
        .btn-sexy-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4); }
        .btn-sexy-secondary { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #cbd5e1; border-radius: 10px; padding: 12px 24px; font-weight: 600; transition: all 0.2s ease; }
        .btn-sexy-secondary:hover { background: rgba(255,255,255,0.05); color: #fff; border-color: #fff; }
        .modal-body::-webkit-scrollbar { width: 6px; }
        .modal-body::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.3); border-radius: 10px; }
      `}</style>

      {/* --- CREATE LEAD MODAL --- */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1300 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-white fs-4">Create New Lead</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={submitNewLead}>
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

      {/* --- DASHBOARD HEADER --- */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeColors.textSecondary }}>
            <Typography variant="body2">Dashboard</Typography>
            <CaretRight size={14} />
            <Typography variant="body2" color="#fff" fontWeight={600}>Tele Marketing Leads</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(255,255,255,0.1)', py: 0.5, px: 1, borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Avatar src={`https://ui-avatars.com/api/?name=${authUser?.username || 'User'}&background=0984e3&color=fff`} sx={{ width: 28, height: 28 }} />
            <Typography variant="body2" fontWeight={600} sx={{ display: { xs: 'none', sm: 'block' } }}>
              {authUser?.username || 'User'}
            </Typography>
          </Box>
        </Box>

        {/* --- STATS & ACTIONS ROW --- */}
        <Box sx={{ ...glassPanel, p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 3 }}>
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h5" fontWeight={600}>Tele Marketing Leads</Typography>
            <Typography variant="body2" sx={{ color: '#a0a0c0' }}>Manage new tele marketing leads</Typography>
          </Box>
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#a0a0c0', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Total New Leads</Typography>
                <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}><AnimatedCounter end={filtered.length} /></Typography>
              </Box>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', md: 'auto' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, px: 2, py: 1, border: '1px solid rgba(255,255,255,0.05)', flex: 1, minWidth: { md: 200 } }}>
              <MagnifyingGlass size={20} color="#a0a0c0" />
              <InputBase placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ ml: 1, color: '#fff', fontSize: 14, width: '100%' }} />
            </Box>
            <Button variant="contained" startIcon={<Plus weight="bold" />} onClick={() => setShowModal(true)} sx={{ bgcolor: themeColors.danger, color: '#fff', textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 3, py: 1, height: 42, whiteSpace: 'nowrap', '&:hover': { bgcolor: '#dc2626' } }}>
              Add Lead
            </Button>
          </Box>
        </Box>

        {/* --- DYNAMIC TABLE --- */}
        <TableContainer sx={{ ...glassPanel, p: 0, maxHeight: '65vh', overflowY: 'auto', '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '10px' } }}>
            {!isMobile && (
                <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 3fr 2.5fr 1fr 1fr 2fr', 
                    alignItems: 'center', pb: 2, mb: 2, 
                    borderBottom: '1px solid rgba(255,255,255,0.1)', 
                    color: '#a0a0c0', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', 
                    position: 'sticky', top: 0, zIndex: 2, backdropFilter: 'blur(10px)', background: 'rgba(25, 25, 55, 0.9)', pl: 2 
                }}>
                    <Box>Lead ID</Box>
                    <Box>Company & Contact</Box>
                    <Box>Location</Box>
                    <Box>Lead Type</Box>
                    <Box>Priority</Box>
                    <Box>Requirements</Box>
                </Box>
            )}
            
            {loadingNew ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
            ) : filtered.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 5, color: '#a0a0c0' }}>No leads found matching your search.</Box>
            ) : (
                filtered.map(lead => {
                    const priorityStyle = getPriorityColor(lead.priority);
                    return (
                        <Box key={lead.id} sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: { xs: '1fr', md: '1fr 3fr 2.5fr 1fr 1fr 2fr' }, 
                            alignItems: 'center', gap: { xs: 1, md: 0 }, p: 2, mb: 1.5, 
                            bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, transition: 'all 0.2s ease', border: '1px solid transparent', 
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)', transform: 'translateY(-2px)' } 
                        }}>
                            
                            {/* Lead ID */}
                            <Box>
                                <Button size="small"  sx={{ color: themeColors.blue, fontWeight: 700, p: 0, minWidth: 0, ml: {md: 2} }}>{lead.leadNo}</Button>
                            </Box>

                            {/* Company & Contact */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pr: 2 }}>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16, fontWeight: 700, width: 36, height: 36 }}>
                                    {lead.company?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box overflow="hidden">
                                    <Typography variant="body2" fontWeight={600} noWrap>{lead.company}</Typography>
                                    <Typography variant="caption" sx={{ color: '#a0a0c0', display: 'block' }} noWrap>{lead.contact} • {lead.phone}</Typography>
                                </Box>
                            </Box>

                            {/* Location */}
                            <Box sx={{ color: '#ddd', fontSize: 13, pr: 2 }}>
                                <Typography variant="body2" noWrap sx={{ fontSize: 13 }}>{lead.location || '-'}</Typography>
                            </Box>

                            {/* Lead Type */}
                            <Box>
                                <Chip label={lead.leadType || 'N/A'} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 600, bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                            </Box>

                            {/* Priority */}
                            <Box>
                                <Chip label={lead.priority} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 600, bgcolor: priorityStyle.bg, color: priorityStyle.text }} />
                            </Box>

                            {/* Requirements (Clean Text Only) */}
                            <Box sx={{ pr: 2 }}>
                                <Typography variant="body2" fontSize={13} color="#e2e8f0" sx={{ whiteSpace: 'normal', wordWrap: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                    {lead.requirement || '-'}
                                </Typography>
                            </Box>

                        </Box>
                    );
                })
            )}
        </TableContainer>

      </Box>

      <Snackbar open={toast.open} autoHideDuration={6000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: '12px', width: '100%', border: '1px solid rgba(255,255,255,0.1)' }} variant="filled">{toast.message}</Alert>
      </Snackbar>

    </Box>
  );
}