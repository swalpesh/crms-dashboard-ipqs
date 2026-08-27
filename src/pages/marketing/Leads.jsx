import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Chip, CircularProgress, Avatar, InputBase, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, FormControl, MenuItem, Checkbox, Tooltip
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

// Phosphor Icons
import { CaretRight, MagnifyingGlass, Trash, Plus, Fire } from "@phosphor-icons/react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

const getAuthUser = () => {
  const userStr = localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");
  try { return userStr ? JSON.parse(userStr) : null; } catch (e) { return null; }
};

function mapLead(api) {
  const location = [api.company_address, api.company_city, api.company_state, api.company_country].filter(Boolean).join(", ");

  return {
    id: api.lead_id,
    leadNo: api.lead_id,
    company: api.company_name,
    contact: api.contact_person_name,
    phone: api.contact_person_phone,
    leadType: api.lead_type || api.lead_requirement || "N/A",
    requirement: api.lead_requirement || "Unknown",
    location,
    priority: api.lead_priority || "Medium",
    stage: api.lead_stage || "Unassigned",
    leadStatus: api.lead_status || "new", // Track status for follow-up and new
    poConfirmed: api.po_confirmed === "Yes" || api.po_confirmed === true, // NEW: PO confirmation flag
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
  textSecondary: '#a0a0c0',
  blue: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6', // NEW: PO Confirmed color
};

const glassPanel = {
  background: 'rgba(255, 255, 255, 0.04)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  borderRadius: '16px'
};

// PERFECT ALIGNMENT GRID
const tableGridCols = { xs: '1fr', md: '50px 110px 80px 2fr 2fr 100px 100px 2.5fr' };

/* ================================ main page ================================ */
export default function MasterLeads() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const authUser = getAuthUser();

  // Data buckets
  const [newLeads, setNewLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); // STATUS FILTER

  // Selection & Bulk Delete State
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Assign Modal State
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignLead, setAssignLead] = useState(null);
  const [assignDept, setAssignDept] = useState("");
  const [assignReason, setAssignReason] = useState("");
  const [assignSaving, setAssignSaving] = useState(false);

  // --- Create Lead Modal State ---
  const [showModal, setShowModal] = useState(false);
  const [isHotLead, setIsHotLead] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });

  const allDepartments = useMemo(() => {
    return Array.from(new Set(newLeads.map(l => l.stage))).filter(Boolean).sort();
  }, [newLeads]);

  // COMBINED FILTERING LOGIC
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return newLeads.filter((l) => {
      // 1. Text Search
      const matchesSearch = !q || [l.leadNo, l.company, l.contact, l.phone, l.leadType, l.location, l.requirement]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));

      // 2. Department Filter
      const matchesDept = deptFilter === "All" || !deptFilter || l.stage === deptFilter;

      // 3. Status Filter (New, Follow-Up, Closed, PO-Confirmed)
      let matchesStatus = true;
      if (statusFilter === "New") {
        matchesStatus = l.leadStatus?.toLowerCase() === "new" && l.stage !== "Won" && l.stage !== "Lost";
      } else if (statusFilter === "Follow-Up") {
        matchesStatus = l.leadStatus?.toLowerCase() === "follow-up" && l.stage !== "Won" && l.stage !== "Lost";
      } else if (statusFilter === "Closed") {
        matchesStatus = l.stage === "Won" || l.stage === "Lost";
      } else if (statusFilter === "PO-Confirmed") {
        matchesStatus = l.poConfirmed === true;
      }

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [newLeads, search, deptFilter, statusFilter]);

  /* ================== API FETCHING ================== */
  async function fetchAllLeads() {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/leads/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch");

      const json = await res.json();
      const arr = Array.isArray(json?.leads) ? json.leads : [];
      setNewLeads(arr.map(mapLead));

      setSelectedLeadIds([]);
    } catch (e) {
      console.error(e);
      setNewLeads([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAllLeads(); }, []);

  // --- Initialize External Countries (Only for Modal) ---
  useEffect(() => {
    fetch("https://countriesnow.space/api/v0.1/countries/iso")
      .then(res => res.json())
      .then(result => {
          setCountries(result.data || []);
          if(showModal) handleFormCountryChange("India");
      }).catch(err => console.error(err));
  }, [showModal]);

  // --- CREATE FORM HANDLERS ---
  const handleLeadNameChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, lead_name: val, company_name: val }));
  };

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

  const handleCreateChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.lead_name) {
        setSnack({ open: true, msg: "Lead Name and Company Name are required", type: "error" });
        return;
    }
    setSubmitting(true);
    try {
        const token = getToken();

        // Extract profile_name from local storage to inject into the creation reason
        const profileName = localStorage.getItem("profile_name") || "Admin";
        const creationReason = `New Lead Created Show Admin Profile : ${profileName}`;

        const payload = {
            ...formData,
            assigned_employee: "0",
            lead_status: "new",
            lead_stage: "IpqsHead",
            expected_closing_date: null,
            expected_revenue: 0,
            probability: 50,
            mark_as_hot_lead: isHotLead,
            follow_up_reason: null,
            follow_up_date: null,
            follow_up_time: null,
            notes: null,
            reason: creationReason // <-- Added dynamic reason string
        };

        const response = await fetch(`${API_BASE_URL}/api/adminprofiles/create-lead`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            setSnack({ open: true, msg: "Lead Created Successfully!", type: "success" });
            setShowModal(false);
            fetchAllLeads();
            setFormData({
                lead_name: '', company_name: '', company_contact_number: '', company_email: '',
                company_website: 'https://www.', contact_person_name: '', contact_person_phone: '',
                contact_person_email: '', company_address: '', company_country: 'India', company_state: '',
                company_city: '', zipcode: '', industry_type: '', lead_requirement: '',
                lead_type: 'Product', lead_priority: 'Medium'
            });
            setIsHotLead(false);
        } else {
            throw new Error(data.message || "Failed to create lead");
        }
    } catch (error) {
        setSnack({ open: true, msg: error.message, type: "error" });
    } finally {
        setSubmitting(false);
    }
  };

  // --- Actions ---
  const goDetail = (lead) => navigate(`/marketing/customer-info/${encodeURIComponent(lead?.id || lead?.leadNo)}`);

  const openAssign = (lead) => {
    setAssignLead(lead);
    setAssignDept("");
    setAssignReason("");
    setAssignOpen(true);
  };

  const saveAssign = async () => {
    if (!assignLead) return;
    const token = getToken();
    try {
      setAssignSaving(true);

      // 1. Determine Target Employee ID based on Department FIRST
      let targetEmpId = "";
      if (assignDept === "Field-Marketing") targetEmpId = "IPQS-H25002";
      else if (assignDept === "Associate-Marketing") targetEmpId = "IPQS-H25003";
      else if (assignDept === "Corporate-Marketing") targetEmpId = "IPQS-H25019";
      else if (assignDept === "Technical-Team") targetEmpId = "IPQS-H25030";
      else if (assignDept === "Solutions-Team") targetEmpId = "IPQS-H5000";
      else if (assignDept === "Nagpur-Associates") targetEmpId = "IPQS-E25004";
      else if (assignDept === "Silverline-Associates") targetEmpId = "IPQS-H25009";
      else if (assignDept === "Trafo-Associates") targetEmpId = "IPQS-H25007";
      else if (assignDept === "Y-k-Enterprises-Associates") targetEmpId = "IPQS-H25008";
      else if (assignDept === "Kolhapur-Associates") targetEmpId = "IPQS-H25010";

      // Dynamically extract Profile Name from local storage, default to 'Admin' if null
      const profileName = localStorage.getItem("profile_name") || "Admin";
      const formattedReason = `Updated by Admin: ${profileName} - ${assignReason.trim()}`;

      // 2. Assign the lead
      const res = await fetch(`${API_BASE_URL}/api/leads/change-stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          lead_id: assignLead.id,
          new_lead_stage: assignDept,
          assigned_employee: targetEmpId,
          reason: formattedReason // <-- Sent with Dynamic Admin Prefix
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to change lead stage");

      // 3. Trigger Notification based on Department
      if (targetEmpId) {
        setTimeout(async () => {
          try {
            await fetch(`${API_BASE_URL}/api/notifications/send`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to_emp_id: targetEmpId,
                title: "New Lead Assigned",
                message: `Lead ${assignLead.leadNo} (${assignLead.company}) has been assigned to your department.`
              })
            });
          } catch (e) { console.error("Failed to send notification", e); }
        }, 1000);
      }

      await fetchAllLeads(); // Refresh table
      setSnack({ open: true, type: "success", msg: `Lead successfully moved to ${assignDept.replace("-", " ")}.` });
      setAssignOpen(false);
      setAssignLead(null);
    } catch (e) {
      setSnack({ open: true, type: "error", msg: e.message || "Failed to change stage" });
    } finally {
      setAssignSaving(false);
    }
  };

  // --- MULTIPLE DELETE LOGIC ---
  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedLeadIds(filtered.map(l => l.id));
    else setSelectedLeadIds([]);
  };

  const handleSelectOne = (id) => {
    setSelectedLeadIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (selectedLeadIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedLeadIds.length} selected lead(s)? This action cannot be undone.`)) return;

    const token = getToken();
    setIsDeleting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/leads/bulk-delete`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ lead_ids: selectedLeadIds }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to delete leads");

      const deletedCount = selectedLeadIds.length;
      setSelectedLeadIds([]);
      await fetchAllLeads();

      setSnack({ open: true, type: "success", msg: `Successfully deleted ${deletedCount} lead(s).` });
    } catch (error) {
      setSnack({ open: true, type: "error", msg: error.message || "An error occurred while deleting leads." });
    } finally {
      setIsDeleting(false);
    }
  };

  // --- STYLING HELPERS ---
  const getPriorityColor = (p) => {
    switch(p?.toLowerCase()) {
        case 'high': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' };
        case 'medium': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' };
        case 'low': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' };
        default: return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' };
    }
  };

  const filterInputStyle = {
    "& .MuiOutlinedInput-root": {
        color: "#fff", bgcolor: "rgba(0,0,0,0.2)", borderRadius: '8px', height: '40px', fontSize: '0.85rem',
        "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
        "&:hover fieldset": { borderColor: "#3b82f6" },
        "&.Mui-focused fieldset": { borderColor: "#3b82f6" }
    },
    "& .MuiInputLabel-root": { color: "#a0a0c0", fontSize: '0.8rem', top: '-4px' },
    "& .MuiSvgIcon-root": { color: "#3b82f6" }
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
        .sexy-label { color: #94a3b8; font-size: 0.8rem; font-weight: 600; margin-bottom: 6px; display: block; text-transform: uppercase; letter-spacing: 0.5px; }
        .sexy-input option { background-color: #1a1a2e; color: #fff; padding: 10px; }
        .btn-sexy-primary { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: none; border-radius: 10px; padding: 12px 24px; color: white; font-weight: 600; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3); transition: all 0.2s ease; }
        .btn-sexy-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4); }
        .btn-sexy-secondary { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #cbd5e1; border-radius: 10px; padding: 12px 24px; font-weight: 600; transition: all 0.2s ease; }
        .btn-sexy-secondary:hover { background: rgba(255,255,255,0.05); color: #fff; border-color: #fff; }

        .hot-lead-box { background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.05)); border: 1px solid rgba(249, 115, 22, 0.4); border-radius: 12px; padding: 16px; display: flex; align-items: center; justify-content: space-between; margin-top: 25px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.1); }
      `}</style>

      {/* --- ASSIGN DEPT MODAL --- */}
      {assignOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1300 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-white fs-5">Assign to Department</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setAssignOpen(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="sexy-label">Select Department</label>
                  <select className="form-select sexy-input" value={assignDept} onChange={(e) => setAssignDept(e.target.value)}>
                    <option value="">Choose a department...</option>
                    <option value="Field-Marketing">Field Marketing</option>
                    <option value="Associate-Marketing">Associate Marketing</option>
                    <option value="Corporate-Marketing">Corporate Marketing</option>
                    <option value="Technical-Team">Technical Team</option>
                    <option value="Solutions-Team">Solutions Team</option>
                    <option value="Nagpur-Associates">Nagpur Associates</option>
                    <option value="Silverline-Associates">Silverline Associates</option>
                    <option value="Trafo-Associates">Trafo Associates</option>
                    <option value="Y-k-Enterprises-Associates">Y-k Enterprises Associates</option>
                    <option value="Kolhapur-Associates">Kolhapur Associates</option>
                    <option value="Lost">Lost</option>
                    <option value="Won">Won</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="sexy-label">Reason / Notes</label>
                  <textarea className="form-control sexy-input" rows="3" value={assignReason} onChange={(e) => setAssignReason(e.target.value)} placeholder="Provide a reason for assignment..."></textarea>
                </div>
                <div className="d-grid gap-3 d-md-flex justify-content-md-end border-top border-secondary pt-4">
                  <button type="button" className="btn btn-sexy-secondary px-4" onClick={() => setAssignOpen(false)} disabled={assignSaving}>Cancel</button>
                  <button type="button" className="btn btn-sexy-primary px-4" onClick={saveAssign} disabled={!assignDept || !assignReason.trim() || assignSaving}>
                    {assignSaving ? "Assigning..." : "Assign Lead"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <form onSubmit={handleCreateSubmit}>

                  {/* Section 1 */}
                  <div className="sexy-header mt-0">Company Details</div>
                  <div className="mb-3">
                    <label className="sexy-label">Lead Name <span className="text-danger">*</span></label>
                    <input type="text" className="form-control sexy-input" name="lead_name" value={formData.lead_name} onChange={handleLeadNameChange} placeholder="Give Your Lead a Name" required />
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">Company Name <span className="text-danger">*</span></label>
                    <input type="text" className="form-control sexy-input" name="company_name" value={formData.company_name} onChange={handleCreateChange} placeholder="Auto-fills from Lead Name" required disabled />
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">Company Contact Number</label>
                    <input type="text" className="form-control sexy-input" name="company_contact_number" value={formData.company_contact_number} onChange={handleCreateChange} placeholder="Direct Line" />
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">Company Email</label>
                    <input type="email" className="form-control sexy-input" name="company_email" value={formData.company_email} onChange={handleCreateChange} placeholder="info@company.com" />
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">Company Website</label>
                    <input type="text" className="form-control sexy-input" name="company_website" value={formData.company_website} onChange={handleCreateChange} placeholder="https://www.company.com" />
                  </div>

                  {/* Section 2 */}
                  <div className="sexy-header">Contact Person</div>
                  <div className="mb-3">
                    <label className="sexy-label">Person Name</label>
                    <input type="text" className="form-control sexy-input" name="contact_person_name" value={formData.contact_person_name} onChange={handleCreateChange} placeholder="John Doe" />
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">Person Phone</label>
                    <input type="text" className="form-control sexy-input" name="contact_person_phone" value={formData.contact_person_phone} onChange={handleCreateChange} placeholder="Direct line" />
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">Person Email</label>
                    <input type="email" className="form-control sexy-input" name="contact_person_email" value={formData.contact_person_email} onChange={handleCreateChange} placeholder="john@company.com" />
                  </div>

                  {/* Section 3 */}
                  <div className="sexy-header">Location & Industry</div>
                  <div className="mb-3">
                    <label className="sexy-label">Address</label>
                    <textarea className="form-control sexy-input" rows="2" name="company_address" value={formData.company_address} onChange={handleCreateChange} placeholder="Full street address"></textarea>
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
                    <input type="text" className="form-control sexy-input" name="zipcode" value={formData.zipcode} onChange={handleCreateChange} placeholder="123456" />
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">Industry Type</label>
                    <input type="text" className="form-control sexy-input" name="industry_type" value={formData.industry_type} onChange={handleCreateChange} placeholder="e.g. Manufacturing" />
                  </div>

                  {/* Section 4 */}
                  <div className="sexy-header">Lead Specifics</div>
                  <div className="mb-3">
                    <label className="sexy-label">Requirement</label>
                    <textarea className="form-control sexy-input" rows="3" name="lead_requirement" value={formData.lead_requirement} onChange={handleCreateChange} placeholder="Describe the client requirement..."></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">Lead Type</label>
                    <select className="form-select sexy-input" name="lead_type" value={formData.lead_type} onChange={handleCreateChange}>
                        <option value="Product">Product</option>
                        <option value="Service">Service</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="sexy-label">Priority</label>
                    <select className="form-select sexy-input" name="lead_priority" value={formData.lead_priority} onChange={handleCreateChange}>
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

      <Box sx={{ maxWidth: 1400, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* DASHBOARD HEADER */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeColors.textSecondary }}>
            <Typography variant="body2">Dashboard</Typography>
            <CaretRight size={14} />
            <Typography variant="body2" color="#fff" fontWeight={600}>Master Leads</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(255,255,255,0.1)', py: 0.5, px: 1, borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Avatar src={`https://ui-avatars.com/api/?name=${authUser?.username || 'User'}&background=0984e3&color=fff`} sx={{ width: 28, height: 28 }} />
            <Typography variant="body2" fontWeight={600} sx={{ display: { xs: 'none', sm: 'block' } }}>{authUser?.username || 'User'}</Typography>
          </Box>
        </Box>

        {/* STATS & ACTIONS ROW */}
        <Box sx={{ ...glassPanel, p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 3 }}>
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h5" fontWeight={600}>Master Leads</Typography>
            <Typography variant="body2" sx={{ color: '#a0a0c0' }}>Manage and assign departmental leads</Typography>
          </Box>
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#a0a0c0', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Total Leads</Typography>
                <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}><AnimatedCounter end={filtered.length} /></Typography>
              </Box>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', md: 'auto' }, flexDirection: { xs: 'column', sm: 'row' } }}>

            {/* BULK DELETE BUTTON */}
            {selectedLeadIds.length > 0 && (
              <Tooltip title={`Delete ${selectedLeadIds.length} Selected`}>
                <Button
                  variant="contained"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  sx={{
                    minWidth: '40px',
                    width: '40px',
                    height: '40px',
                    p: 0,
                    borderRadius: '8px',
                    bgcolor: 'rgba(239, 68, 68, 0.15)',
                    color: themeColors.danger,
                    border: `1px solid rgba(239, 68, 68, 0.3)`,
                    '&:hover': { bgcolor: themeColors.danger, color: '#fff' }
                  }}
                >
                  {isDeleting ? <CircularProgress size={18} color="inherit" /> : <Trash size={20} weight="fill" />}
                </Button>
              </Tooltip>
            )}

            {/* DEPARTMENT FILTER */}
            <TextField
                select
                size="small"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                sx={{ minWidth: { xs: '100%', sm: 180 }, ...filterInputStyle }}
            >
                <MenuItem value="All">All Departments</MenuItem>
                {allDepartments.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>

            {/* STATUS FILTER */}
            <TextField
                select
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ minWidth: { xs: '100%', sm: 140 }, ...filterInputStyle }}
            >
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="Follow-Up">Follow-Up</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
                <MenuItem value="PO-Confirmed">PO Confirmed</MenuItem>
            </TextField>

            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, px: 2, py: 1, border: '1px solid rgba(255,255,255,0.05)', flex: 1, minWidth: { md: 250 }, width: '100%' }}>
              <MagnifyingGlass size={20} color="#a0a0c0" />
              <InputBase placeholder="Search leads by name, company, etc..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ ml: 1, color: '#fff', fontSize: 14, width: '100%' }} />
            </Box>

            {/* CREATE LEAD BUTTON */}
            <Button
              variant="contained"
              startIcon={<Plus weight="bold" />}
              onClick={() => setShowModal(true)}
              sx={{
                bgcolor: '#3b82f6',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '16px',
                px: 3,
                height: 42,
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: '#2563eb' }
              }}
            >
              Create
            </Button>
          </Box>
        </Box>

        {/* TABLE ROW */}
        <Box sx={{ ...glassPanel, p: 0, maxHeight: '65vh', overflowY: 'auto', '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '10px' } }}>

            {/* TABLE HEADER */}
            {!isMobile && (
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: tableGridCols.md,
                    alignItems: 'center', pb: 2, mb: 2, pt: 2,
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    color: '#a0a0c0', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
                    position: 'sticky', top: 0, zIndex: 2, backdropFilter: 'blur(10px)', background: 'rgba(25, 25, 55, 0.9)', pl: 2, pr: 2
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Checkbox
                        size="small"
                        sx={{ color: 'rgba(255,255,255,0.5)', '&.Mui-checked': { color: themeColors.blue } }}
                        checked={filtered.length > 0 && selectedLeadIds.length === filtered.length}
                        indeterminate={selectedLeadIds.length > 0 && selectedLeadIds.length < filtered.length}
                        onChange={handleSelectAll}
                      />
                    </Box>
                    <Box>Assign</Box>
                    <Box>Lead ID</Box>
                    <Box>Company & Contact</Box>
                    <Box>Location</Box>
                    <Box>Lead Type</Box>
                    <Box>Priority</Box>
                    <Box>Requirements</Box>
                </Box>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
            ) : filtered.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 5, color: '#a0a0c0' }}>No leads found matching your search.</Box>
            ) : (
                filtered.map(lead => {
                    const priorityStyle = getPriorityColor(lead.priority);
                    const isChecked = selectedLeadIds.includes(lead.id);
                    const isWon = lead.stage === "Won" || lead.stage === "Lost";
                    const isFollowUp = lead.leadStatus?.toLowerCase() === "follow-up";
                    const isPoConfirmed = lead.poConfirmed === true; // NEW
                    const disableAssign = isWon || isFollowUp || isPoConfirmed; // UPDATED

                    return (
                        <Box key={lead.id} sx={{
                            display: 'grid',
                            gridTemplateColumns: tableGridCols,
                            alignItems: 'center', gap: { xs: 2, md: 2 }, p: { xs: 2, md: '8px 16px' }, mb: 1, mx: { md: 2 },
                            bgcolor: isChecked ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)',
                            borderRadius: 3, transition: 'all 0.2s ease',
                            border: isChecked ? `1px solid ${themeColors.blue}` : '1px solid transparent',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': { bgcolor: isChecked ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.08)', borderColor: isChecked ? themeColors.blue : 'rgba(255,255,255,0.2)' }
                        }}>

                            {/* --- CLOSED BANNER --- */}
                            {isWon && (
                                <Box sx={{
                                    position: 'absolute',
                                    top: '12px',
                                    left: '-32px',
                                    width: '120px',
                                    textAlign: 'center',
                                    bgcolor: lead.stage === 'Won' ? '#10b981' : '#ef4444',
                                    color: '#fff',
                                    fontSize: '9px',
                                    fontWeight: 900,
                                    py: 0.5,
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                    transform: 'rotate(-45deg)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                    zIndex: 10,
                                    pointerEvents: 'none'
                                }}>
                                    {lead.stage}
                                </Box>
                            )}

                            {/* --- PO CONFIRMED BANNER (takes precedence over Follow-Up, not over Won/Lost) --- */}
                            {isPoConfirmed && !isWon && (
                                <Box sx={{
                                    position: 'absolute',
                                    top: '12px',
                                    left: '-32px',
                                    width: '120px',
                                    textAlign: 'center',
                                    bgcolor: themeColors.purple,
                                    color: '#fff',
                                    fontSize: '9px',
                                    fontWeight: 900,
                                    py: 0.5,
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                    transform: 'rotate(-45deg)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                    zIndex: 10,
                                    pointerEvents: 'none'
                                }}>
                                    PO Confirmed
                                </Box>
                            )}

                            {/* --- FOLLOW-UP BANNER --- */}
                            {isFollowUp && !isWon && !isPoConfirmed && (
                                <Box sx={{
                                    position: 'absolute',
                                    top: '12px',
                                    left: '-32px',
                                    width: '120px',
                                    textAlign: 'center',
                                    bgcolor: '#f59e0b', // Warning/Yellow
                                    color: '#fff',
                                    fontSize: '9px',
                                    fontWeight: 900,
                                    py: 0.5,
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                    transform: 'rotate(-45deg)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                    zIndex: 10,
                                    pointerEvents: 'none'
                                }}>
                                    Follow-Up
                                </Box>
                            )}

                            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'center' }, zIndex: 11 }}>
                              <Checkbox
                                size="small"
                                sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: themeColors.blue } }}
                                checked={isChecked}
                                onChange={() => handleSelectOne(lead.id)}
                              />
                            </Box>

                            <Box>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => openAssign(lead)}
                                  disabled={disableAssign}
                                  sx={{
                                    color: themeColors.blue,
                                    borderColor: 'rgba(59,130,246,0.3)',
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    whiteSpace: 'nowrap',
                                    py: 0.5,
                                    px: 1,
                                    '&.Mui-disabled': { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }
                                  }}
                                >
                                    Assign Dept
                                </Button>
                            </Box>

                            <Box>
                                <Button size="small" onClick={() => goDetail(lead)} sx={{ color: themeColors.blue, fontWeight: 700, p: 0, minWidth: 0, justifyContent: 'flex-start' }}>
                                    {lead.leadNo}
                                </Button>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16, fontWeight: 700, width: 36, height: 36 }}>
                                    {lead.company?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'normal', wordWrap: 'break-word', lineHeight: 1.2, mb: 0.5 }}>{lead.company}</Typography>
                                    <Typography variant="caption" sx={{ color: '#a0a0c0', display: 'block', whiteSpace: 'normal', wordWrap: 'break-word' }}>{lead.contact} • {lead.phone}</Typography>
                                </Box>
                            </Box>

                            <Box sx={{ color: '#ddd' }}>
                                <Typography variant="body2" sx={{ fontSize: 13, whiteSpace: 'normal', wordWrap: 'break-word', lineHeight: 1.4 }}>
                                  {lead.location || '-'}
                                </Typography>
                            </Box>

                            <Box>
                                <Chip label={lead.leadType || 'N/A'} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 600, bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                            </Box>

                            <Box>
                                <Chip label={lead.priority} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 600, bgcolor: priorityStyle.bg, color: priorityStyle.text }} />
                            </Box>

                            <Box>
                                <Typography variant="body2" fontSize={13} color="#e2e8f0" sx={{ whiteSpace: 'normal', wordWrap: 'break-word', lineHeight: 1.4 }}>
                                    {lead.requirement || '-'}
                                </Typography>
                            </Box>

                        </Box>
                    );
                })
            )}
        </Box>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.type === "error" ? "error" : "success"} onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: '12px', width: '100%', border: '1px solid rgba(255,255,255,0.1)' }} variant="filled">{snack.msg}</Alert>
      </Snackbar>

    </Box>
  );
}