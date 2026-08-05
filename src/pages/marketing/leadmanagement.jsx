import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Chip, CircularProgress, Avatar, InputBase, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, FormControl, MenuItem, Checkbox, Tooltip
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

// Phosphor Icons
import { CaretRight, MagnifyingGlass } from "@phosphor-icons/react";

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
    status: api.lead_status || "", // Added lead_status mapping here
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
};

const glassPanel = { 
  background: 'rgba(255, 255, 255, 0.04)', 
  backdropFilter: 'blur(16px)', 
  border: '1px solid rgba(255, 255, 255, 0.1)', 
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)', 
  borderRadius: '16px' 
};

// PERFECT ALIGNMENT GRID
const tableGridCols = { xs: '1fr', md: '130px 80px 2fr 2fr 100px 100px 2.5fr' };

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

/* ================================ main page ================================ */
export default function LeadManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const authUser = getAuthUser();

  // Data buckets 
  const [allLeads, setAllLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Filters (Dept is hardcoded to Tele-Marketing)
  const [search, setSearch] = useState("");
  const DEFAULT_DEPT = "Tele-Marketing";

  // Assign Modal State
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignLead, setAssignLead] = useState(null);
  const [assignDept, setAssignDept] = useState("");
  const [assignReason, setAssignReason] = useState("");
  const [assignSaving, setAssignSaving] = useState(false);

  const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });

  // Dynamic Filtering (Search Text + Default Department + Status New)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allLeads.filter((l) => {
      // 1. Text Search
      const matchesSearch = !q || [l.leadNo, l.company, l.contact, l.phone, l.leadType, l.location, l.requirement]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
      
      // 2. Exact Department Match
      const matchesDept = l.stage === DEFAULT_DEPT;

      // 3. Status is new Match
      const matchesStatus = l.status?.toLowerCase() === "new";

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [allLeads, search]);

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
      setAllLeads(arr.map(mapLead)); 
    } catch (e) { 
      console.error(e); 
      setAllLeads([]);
    } finally { 
      setLoading(false); 
    }
  }

  useEffect(() => { fetchAllLeads(); }, []);

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
      
      // Dynamically extract Profile Name from local storage, default to 'Admin' if null
      const profileName = localStorage.getItem("profile_name") || "Admin";
      const formattedReason = `Updated by Admin: ${profileName} - ${assignReason.trim()}`;

      // 1. Assign the lead
      const res = await fetch(`${API_BASE_URL}/api/leads/change-stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          lead_id: assignLead.id, 
          new_lead_stage: assignDept, 
          reason: formattedReason // <-- Sent with Dynamic Admin Prefix
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to change lead stage");

      // 2. Trigger Notification based on Department
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
        .sexy-label { color: #94a3b8; font-size: 0.8rem; font-weight: 600; margin-bottom: 6px; display: block; text-transform: uppercase; letter-spacing: 0.5px; }
        .sexy-input option { background-color: #1a1a2e; color: #fff; padding: 10px; }
        .btn-sexy-primary { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: none; border-radius: 10px; padding: 12px 24px; color: white; font-weight: 600; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3); transition: all 0.2s ease; }
        .btn-sexy-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4); }
        .btn-sexy-secondary { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #cbd5e1; border-radius: 10px; padding: 12px 24px; font-weight: 600; transition: all 0.2s ease; }
        .btn-sexy-secondary:hover { background: rgba(255,255,255,0.05); color: #fff; border-color: #fff; }
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
                  </select>
                </div>₹
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

      <Box sx={{ maxWidth: 1400, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* DASHBOARD HEADER */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeColors.textSecondary }}>
            <Typography variant="body2">Dashboard</Typography>
            <CaretRight size={14} />
            <Typography variant="body2" color="#fff" fontWeight={600}>Lead Management</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(255,255,255,0.1)', py: 0.5, px: 1, borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Avatar src={`https://ui-avatars.com/api/?name=${authUser?.username || 'User'}&background=0984e3&color=fff`} sx={{ width: 28, height: 28 }} />
            <Typography variant="body2" fontWeight={600} sx={{ display: { xs: 'none', sm: 'block' } }}>{authUser?.username || 'User'}</Typography>
          </Box>
        </Box>

        {/* STATS & ACTIONS ROW */}
        <Box sx={{ ...glassPanel, p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 3 }}>
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h5" fontWeight={600}>Lead Management</Typography>
            <Typography variant="body2" sx={{ color: '#a0a0c0' }}>Manage and assign Tele departmental leads</Typography>
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
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, px: 2, py: 1, border: '1px solid rgba(255,255,255,0.05)', flex: 1, minWidth: { md: 300 }, width: '100%' }}>
              <MagnifyingGlass size={20} color="#a0a0c0" />
              <InputBase placeholder="Search leads by name, company, etc..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ ml: 1, color: '#fff', fontSize: 14, width: '100%' }} />
            </Box>
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
                    return (
                        <Box key={lead.id} sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: tableGridCols, 
                            alignItems: 'center', gap: { xs: 2, md: 2 }, p: 2, mb: 1, mx: { md: 2 },
                            bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, transition: 'all 0.2s ease', border: '1px solid transparent', 
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' } 
                        }}>
                            
                            {/* Assign Dept Button */}
                            <Box>
                                <Button variant="outlined" size="small" onClick={() => openAssign(lead)} sx={{ color: themeColors.blue, borderColor: 'rgba(59,130,246,0.3)', textTransform: 'none', borderRadius: 2, whiteSpace: 'nowrap', py: 0.5, px: 1 }}>
                                    Assign Dept
                                </Button>
                            </Box>

                            {/* Lead ID */}
                            <Box>
                                <Button size="small" onClick={() => goDetail(lead)} sx={{ color: themeColors.blue, fontWeight: 700, p: 0, minWidth: 0, justifyContent: 'flex-start' }}>
                                    {lead.leadNo}
                                </Button>
                            </Box>

                            {/* Company & Contact */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16, fontWeight: 700, width: 36, height: 36 }}>
                                    {lead.company?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'normal', wordWrap: 'break-word', lineHeight: 1.2, mb: 0.5 }}>{lead.company}</Typography>
                                    <Typography variant="caption" sx={{ color: '#a0a0c0', display: 'block', whiteSpace: 'normal', wordWrap: 'break-word' }}>{lead.contact} • {lead.phone}</Typography>
                                </Box>
                            </Box>

                            {/* Location */}
                            <Box sx={{ color: '#ddd' }}>
                                <Typography variant="body2" sx={{ fontSize: 13, whiteSpace: 'normal', wordWrap: 'break-word', lineHeight: 1.4 }}>
                                  {lead.location || '-'}
                                </Typography>
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