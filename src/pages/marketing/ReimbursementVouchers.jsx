import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button, 
  TextField, 
  MenuItem, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  TableContainer,
  Chip,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- API HELPERS ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

// Reusable Glass Card Style
const glassStyle = {
  background: 'rgba(30, 27, 46, 0.7)', 
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  color: '#fff',
  boxSizing: 'border-box'
};

const glassInput = {
  '& .MuiOutlinedInput-root': {
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6)' },
  '& input::-webkit-calendar-picker-indicator': { filter: 'invert(1)', cursor: 'pointer' },
  '& .MuiSelect-icon': { color: 'rgba(255, 255, 255, 0.5)' }
};

// --- FILE PATH & IMAGE HELPERS ---
const formatFileUrl = (path) => {
  if (!path) return '#';
  if (path.startsWith('http')) return path;
  const cleanPath = path.replace(/\\/g, '/').replace(/^\//, '');
  const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');
  return `${API_BASE_URL.replace(/\/$/, '')}/${encodedPath}`;
};

const fetchImageAsBase64 = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error fetching image for PDF:', error);
    return null;
  }
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function VouchersList() {
  const navigate = useNavigate();
  
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const [selectedVouchers, setSelectedVouchers] = useState([]);
  const [empSearch, setEmpSearch] = useState('');
  const [department, setDepartment] = useState('All Departments');
  const [status, setStatus] = useState('All');
  const [dateRange, setDateRange] = useState('');
  const [siteSearch, setSiteSearch] = useState('');

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/reimbursements/admin/all`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (response.ok) {
        setVouchers(result.data || []);
        setSelectedVouchers([]); 
      } else {
        throw new Error(result.message || "Failed to load vouchers");
      }
    } catch (err) {
      console.error(err);
      setToast({ open: true, message: err.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const allDepartments = useMemo(() => {
    const depts = vouchers.map(v => v.department_name).filter(Boolean);
    return [...new Set(depts)].sort();
  }, [vouchers]);

  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      const qEmp = empSearch.toLowerCase();
      const matchEmp = !qEmp || 
        (v.employee_name && v.employee_name.toLowerCase().includes(qEmp)) || 
        (v.employee_id && v.employee_id.toLowerCase().includes(qEmp));

      const qSite = siteSearch.toLowerCase();
      const matchSite = !qSite || 
        (v.company_name && v.company_name.toLowerCase().includes(qSite));

      let matchStatus = true;
      if (status !== 'All') {
        if (status === 'Pending Approval') matchStatus = v.status === 'Pending';
        else if (status === 'Approved') matchStatus = v.status === 'Approved' || v.status === 'Completed';
        else matchStatus = v.status === status;
      }

      const matchDate = !dateRange || (v.start_date && v.start_date.startsWith(dateRange));
      const matchDept = department === 'All Departments' || v.department_name === department;
      
      return matchEmp && matchSite && matchStatus && matchDate && matchDept;
    });
  }, [vouchers, empSearch, siteSearch, status, dateRange, department]);

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedVouchers(filteredVouchers.map(v => v.reimbursement_id));
    else setSelectedVouchers([]);
  };

  const handleSelectOne = (id) => {
    setSelectedVouchers(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleClearFilters = () => {
    setEmpSearch(''); setDepartment('All Departments'); setStatus('All'); setDateRange(''); setSiteSearch(''); setSelectedVouchers([]);
  };

  const getStatusChip = (apiStatus) => {
    const displayStatus = apiStatus === 'Completed' ? 'Approved' : apiStatus;
    switch(displayStatus) {
      case 'Approved': return <Chip label="Approved" size="small" sx={{ bgcolor: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.5)' }} />;
      case 'Rejected': return <Chip label="Rejected" size="small" sx={{ bgcolor: 'rgba(248, 113, 113, 0.2)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.5)' }} />;
      default: return <Chip label="Pending" size="small" sx={{ bgcolor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.5)' }} />;
    }
  };

  // =======================================================================
  // DELETE LOGIC
  // =======================================================================
  const handleDeleteClick = () => {
    if (selectedVouchers.length === 0) {
      setToast({ open: true, message: "Please select at least one voucher to delete.", severity: "warning" });
      return;
    }
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    setDeleting(true);

    const token = getToken();
    const results = await Promise.allSettled(
      selectedVouchers.map(id =>
        fetch(`${API_BASE_URL}/api/reimbursements/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        }).then(async res => {
          const json = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(json.message || `Failed to delete ${id}`);
          return id;
        })
      )
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').map(r => r.value);
    const failed = results.filter(r => r.status === 'rejected');

    if (succeeded.length > 0) {
      setVouchers(prev => prev.filter(v => !succeeded.includes(v.reimbursement_id)));
      setSelectedVouchers(prev => prev.filter(id => !succeeded.includes(id)));
    }

    if (failed.length === 0) {
      setToast({ 
        open: true, 
        message: `Successfully deleted ${succeeded.length} voucher${succeeded.length > 1 ? 's' : ''}.`, 
        severity: "success" 
      });
    } else if (succeeded.length === 0) {
      setToast({ 
        open: true, 
        message: `Failed to delete voucher${failed.length > 1 ? 's' : ''}. Please try again.`, 
        severity: "error" 
      });
    } else {
      setToast({ 
        open: true, 
        message: `Deleted ${succeeded.length} voucher${succeeded.length > 1 ? 's' : ''}. ${failed.length} failed.`, 
        severity: "warning" 
      });
    }

    setDeleting(false);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  // =======================================================================
  // ADVANCED FLAWLESS PDF EXPORT LOGIC
  // =======================================================================
  const handleExportPDF = async () => {
    if (selectedVouchers.length === 0) {
      setToast({ open: true, message: "Please select a voucher to export.", severity: "warning" });
      return;
    }
    if (selectedVouchers.length > 1) {
      setToast({ open: true, message: "Please select only one voucher to export at a time.", severity: "warning" });
      return;
    }

    const voucherId = selectedVouchers[0];
    setExporting(true);

    try {
      const token = getToken();
      
      // 1. Fetch Voucher Details
      const response = await fetch(`${API_BASE_URL}/api/reimbursements/${voucherId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to fetch voucher details");
      const data = result.data;

      // 2. Fetch Advance Amount Dynamically
      let advanceValue = 0;
      try {
        const advRes = await fetch(`${API_BASE_URL}/api/reimbursements/${voucherId}/advance`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (advRes.ok) {
          const advJson = await advRes.json();
          advanceValue = parseFloat(advJson.advance_amount || 0);
        }
      } catch (e) {
        console.error("Failed to fetch advance amount", e);
      }
      
      const associatedEmployees = new Set();
      let totalAmount = 0;
      data.expenses?.forEach(exp => {
        if (exp.expense_status !== 'Rejected') totalAmount += parseFloat(exp.amount || 0);
        if (exp.associated_employees) exp.associated_employees.forEach(emp => associatedEmployees.add(emp));
      });
      const numPeople = Math.max(1, associatedEmployees.size);
      const remainingDiff = totalAmount - advanceValue;
      
      const validImageExts = ['.png', '.jpg', '.jpeg', '.webp'];
      const imageExpenses = data.expenses?.filter(e => e.receipt_path && validImageExts.some(ext => e.receipt_path.toLowerCase().endsWith(ext))) || [];
      const totalDocs = data.expenses?.filter(e => e.receipt_path).length || 0;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // --- COVER PAGE ---
      doc.setFillColor(15, 12, 41);
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("ENGAGE", 14, 13);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(22);
      doc.text("Voucher Cover Sheet", 14, 35);
      
      doc.setTextColor(59, 130, 246);
      doc.setFontSize(26);
      doc.text(`#${data.reimbursement_id}`, 14, 48);

      const displayStatus = data.status === 'Completed' ? 'APPROVED & VERIFIED' : data.status.toUpperCase();
      doc.setFontSize(12);
      doc.setTextColor(16, 185, 129);
      doc.text(`✓ ${displayStatus}`, 14, 60);

      doc.setDrawColor(200, 200, 200);
      doc.line(14, 65, pageWidth - 14, 65);

      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("TRIP / PROJECT NAME", 14, 75);
      doc.text("TOTAL EXPENSE CLAIMED", 140, 75);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(data.company_name || "N/A", 14, 82, { maxWidth: 100 });
      doc.text(`Rs. ${totalAmount.toFixed(2)}`, 140, 82);

      autoTable(doc, {
        startY: 100,
        head: [['DEPARTMENT', 'NUMBER OF PEOPLE', 'TOTAL DOCS']],
        body: [[data.department_name || 'N/A', numPeople.toString(), `${totalDocs} Attachments`]],
        theme: 'plain',
        headStyles: { textColor: [100, 100, 100], fontStyle: 'bold', fontSize: 10 },
        bodyStyles: { textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 12 },
        margin: { left: 14 }
      });

      let finalY = doc.lastAutoTable.finalY + 15;

      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text("CONTEXT / DESCRIPTION", 14, finalY);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("Reimbursement claimed for standard operating expenses as recorded in the granular entries table.", 14, finalY + 7, { maxWidth: pageWidth - 28 });

      finalY += 40;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("PRESENTED BY", 14, finalY);
      doc.text("CHECKED & VERIFIED BY", pageWidth / 2 - 20, finalY);
      doc.text("APPROVED BY", pageWidth - 45, finalY);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${data.employee_name}`, 14, finalY + 7);
      doc.text("Satyam Singh", pageWidth / 2 - 20, finalY + 7);
      doc.text("General Manager", pageWidth - 45, finalY + 7);

      // --- EXPENSES PAGE ---
      doc.addPage();
      doc.setFillColor(15, 12, 41); 
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text("ENGAGE", 14, 13);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(22);
      doc.text("Granular Entries", 14, 35);
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Breakdown for #${data.reimbursement_id}`, 14, 43);

      const tableBody = (data.expenses || []).map(exp => [
        formatDateShort(exp.expense_date),
        exp.description || 'Other',
        exp.reason || '-',
        `Rs. ${parseFloat(exp.amount || 0).toFixed(2)}`
      ]);

      // --- DYNAMIC MATH FOOTER IN PDF ---
      let remainingLabel = 'Settled (No Dues):';
      let remainingColor = [0, 0, 0]; // Black
      if (remainingDiff > 0) {
        remainingLabel = 'Company Owes You:';
        remainingColor = [16, 185, 129]; // Green (#10b981)
      } else if (remainingDiff < 0) {
        remainingLabel = 'You Owe Company:';
        remainingColor = [239, 68, 68]; // Red (#ef4444)
      }

      tableBody.push([{ content: 'Total Expenses Made:', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', textColor: [50, 50, 50] } }, { content: `Rs. ${totalAmount.toFixed(2)}`, styles: { fontStyle: 'bold' } }]);
      tableBody.push([{ content: 'Advance Amount Received:', colSpan: 3, styles: { halign: 'right', fontStyle: 'normal', textColor: [100, 100, 100] } }, { content: `- Rs. ${advanceValue.toFixed(2)}`, styles: { fontStyle: 'bold', textColor: [16, 185, 129] } }]);
      tableBody.push([{ content: remainingLabel, colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', textColor: [0, 0, 0] } }, { content: `Rs. ${Math.abs(remainingDiff).toFixed(2)}`, styles: { fontStyle: 'bold', textColor: remainingColor, fontSize: 13 } }]);

      autoTable(doc, {
        startY: 50,
        head: [['DATE', 'CATEGORY', 'DESCRIPTION', 'AMOUNT']],
        body: tableBody,
        theme: 'striped',
        headStyles: { fillColor: [15, 12, 41], textColor: [255, 255, 255] },
        bodyStyles: { textColor: [0, 0, 0] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 }
      });

      // --- IMAGES PAGE ---
      if (imageExpenses.length > 0) {
        doc.addPage();
        doc.setFillColor(15, 12, 41); 
        doc.rect(0, 0, pageWidth, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("ENGAGE", 14, 13);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(22);
        doc.text("Payment Screenshots", 14, 35);
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        doc.text(`Supporting documentation for #${data.reimbursement_id}`, 14, 43);

        let imgCount = 0;
        let yOffset = 55;

        for (let i = 0; i < imageExpenses.length; i++) {
          const exp = imageExpenses[i];
          const fullUrl = formatFileUrl(exp.receipt_path);
          const base64Img = await fetchImageAsBase64(fullUrl);

          if (base64Img) {
            const pageIndex = imgCount % 4;
            if (imgCount > 0 && pageIndex === 0) {
              doc.addPage();
              yOffset = 20;
            }

            const col = pageIndex % 2;
            const row = Math.floor(pageIndex / 2);

            const imgW = 85;
            const imgH = 110;
            const xPos = col === 0 ? 14 : 110;
            const yPos = yOffset + (row * (imgH + 15));

            let ext = 'JPEG';
            if (exp.receipt_path.toLowerCase().endsWith('.png')) ext = 'PNG';
            else if (exp.receipt_path.toLowerCase().endsWith('.webp')) ext = 'WEBP';

            try {
              doc.setDrawColor(200, 200, 200);
              doc.rect(xPos, yPos, imgW, imgH);
              doc.addImage(base64Img, ext, xPos, yPos, imgW, imgH);
              doc.setFontSize(9);
              doc.setTextColor(50, 50, 50);
              doc.text(`Rs. ${exp.amount} - ${exp.description}`, xPos, yPos + imgH + 5, { maxWidth: imgW });
            } catch(e) {
              console.error("Could not embed image into PDF", e);
            }

            imgCount++;
          }
        }
      }

      doc.save(`Voucher_${data.reimbursement_id}.pdf`);
      setToast({ open: true, message: "PDF Exported Successfully!", severity: "success" });

    } catch (err) {
      console.error(err);
      setToast({ open: true, message: "Failed to export PDF: " + err.message, severity: "error" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: '100%', minHeight: '100vh', background: 'transparent', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" color="#fff">Voucher Management</Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.6)">Review and approve departmental expense claims.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>

          {/* DELETE BUTTON — only visible when vouchers are selected */}
          {selectedVouchers.length > 0 && (
            <Button
              variant="contained"
              startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
              onClick={handleDeleteClick}
              disabled={deleting}
              sx={{
                bgcolor: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: 'rgba(239, 68, 68, 0.25)',
                  borderColor: '#f87171',
                  boxShadow: '0 0 12px rgba(239,68,68,0.3)'
                },
                '&.Mui-disabled': {
                  color: 'rgba(248,113,113,0.4)',
                  borderColor: 'rgba(239,68,68,0.2)'
                }
              }}
            >
              {deleting ? 'Deleting...' : `Delete (${selectedVouchers.length})`}
            </Button>
          )}

          {/* EXPORT BUTTON */}
          <Button 
            variant="outlined" 
            startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />} 
            onClick={handleExportPDF}
            disabled={exporting}
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)', textTransform: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
        </Box>
      </Box>

      {/* Advanced Filters Card */}
      <Card sx={{ ...glassStyle, p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" display="flex" alignItems="center" gap={1}>
            <FilterListIcon /> Advanced Filters
          </Typography>
          <Button onClick={handleClearFilters} size="small" sx={{ color: '#60a5fa', textTransform: 'none' }}>Clear All</Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
          <TextField 
            fullWidth label="Employee Name or ID" placeholder="e.g. John Doe, EMP-042" 
            size="small" value={empSearch} onChange={(e) => setEmpSearch(e.target.value)} sx={glassInput} 
          />
          
          <TextField 
            select fullWidth label="Department" size="small" value={department} 
            onChange={(e) => setDepartment(e.target.value)} sx={glassInput}
            SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#131129', color: '#fff' } } } }}
          >
            <MenuItem value="All Departments">All Departments</MenuItem>
            {allDepartments.map((dept) => (
              <MenuItem key={dept} value={dept}>{dept}</MenuItem>
            ))}
          </TextField>
          
          <TextField 
            select fullWidth label="Status" size="small" value={status} 
            onChange={(e) => setStatus(e.target.value)} sx={glassInput}
            SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#131129', color: '#fff' } } } }}
          >
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="Pending Approval">Pending Approval</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </TextField>
          
          <TextField 
            type="date" fullWidth label="Date Range" size="small" 
            value={dateRange} onChange={(e) => setDateRange(e.target.value)}
            InputLabelProps={{ shrink: true }} sx={glassInput} 
          />
          
          <TextField 
            fullWidth label="Site/Project" placeholder="e.g. Project Alpha" size="small" 
            value={siteSearch} onChange={(e) => setSiteSearch(e.target.value)} sx={glassInput} 
          />
          
          <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button fullWidth variant="contained" sx={{ bgcolor: '#3b82f6', height: '40px', textTransform: 'none' }}>
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Data Table */}
      <Card sx={{ ...glassStyle, p: 0 }}>
        <TableContainer sx={{ width: '100%', overflowX: 'auto', maxHeight: '65vh', '&::-webkit-scrollbar': { height: '8px', width: '8px' }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '10px' } }}>
          <Table sx={{ minWidth: 900 }} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ bgcolor: '#131129', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Checkbox 
                    size="small"
                    sx={{ color: 'rgba(255,255,255,0.5)', '&.Mui-checked': { color: '#3b82f6' } }}
                    checked={filteredVouchers.length > 0 && selectedVouchers.length === filteredVouchers.length}
                    indeterminate={selectedVouchers.length > 0 && selectedVouchers.length < filteredVouchers.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell sx={{ bgcolor: '#131129', color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>Voucher #</TableCell>
                <TableCell sx={{ bgcolor: '#131129', color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>Employee</TableCell>
                <TableCell sx={{ bgcolor: '#131129', color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>Department</TableCell>
                <TableCell sx={{ bgcolor: '#131129', color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>Site / Project</TableCell>
                <TableCell sx={{ bgcolor: '#131129', color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>Date Range</TableCell>
                <TableCell sx={{ bgcolor: '#131129', color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>Amount</TableCell>
                <TableCell sx={{ bgcolor: '#131129', color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>Status</TableCell>
                <TableCell sx={{ bgcolor: '#131129', color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    <CircularProgress sx={{ color: '#3b82f6' }} />
                  </TableCell>
                </TableRow>
              ) : filteredVouchers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5, color: 'rgba(255,255,255,0.5)' }}>
                    No vouchers found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredVouchers.map((row) => {
                  const isChecked = selectedVouchers.includes(row.reimbursement_id);
                  
                  return (
                    <TableRow 
                      key={row.reimbursement_id} 
                      sx={{ 
                        bgcolor: isChecked ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        '&:hover': { bgcolor: isChecked ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.02)' } 
                      }}
                    >
                      <TableCell padding="checkbox" sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Checkbox 
                          size="small"
                          sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: '#3b82f6' } }}
                          checked={isChecked}
                          onChange={() => handleSelectOne(row.reimbursement_id)}
                        />
                      </TableCell>

                      <TableCell sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.1)', fontWeight: 600 }}>
                        {row.reimbursement_id}
                      </TableCell>
                      
                      <TableCell sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(59,130,246,0.3)', fontSize: '0.875rem' }}>
                            {row.employee_name ? row.employee_name.charAt(0).toUpperCase() : 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">{row.employee_name || 'Unknown Employee'}</Typography>
                            <Typography variant="caption" color="rgba(255,255,255,0.5)">{row.employee_id}</Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Typography variant="body2">{row.department_name || 'N/A'}</Typography>
                      </TableCell>
                      
                      <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Typography variant="body2">{row.company_name}</Typography>
                      </TableCell>
                      
                      <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Typography variant="body2">
                          {formatDateShort(row.start_date)} {row.end_date ? ` - ${formatDateShort(row.end_date)}` : ''}
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.5)">
                          Submitted: {formatDateShort(row.submitted_on)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell sx={{ color: '#fff', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>
                        ₹{parseFloat(row.total_trip_cost || 0).toFixed(2)}
                      </TableCell>
                      
                      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        {getStatusChip(row.status)}
                      </TableCell>
                      
                      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          sx={{ color: '#60a5fa', borderColor: 'rgba(96,165,250,0.5)', '&:hover': { borderColor: '#60a5fa', bgcolor: 'rgba(59,130,246,0.1)' }, textTransform: 'none' }}
                          onClick={() => navigate(`/marketing/reimbursement/vouchers/${row.reimbursement_id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            background: 'rgba(19, 17, 41, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            color: '#fff',
            minWidth: 360
          }
        }}
      >
        <DialogTitle sx={{ color: '#f87171', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteIcon fontSize="small" />
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255,255,255,0.75)' }}>
            You are about to permanently delete{' '}
            <strong style={{ color: '#fff' }}>
              {selectedVouchers.length} voucher{selectedVouchers.length > 1 ? 's' : ''}
            </strong>
            . This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={handleDeleteCancel}
            sx={{
              color: 'rgba(255,255,255,0.6)',
              borderColor: 'rgba(255,255,255,0.15)',
              textTransform: 'none',
              border: '1px solid',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              bgcolor: '#ef4444',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: '#dc2626' }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: '12px', width: '100%', border: '1px solid rgba(255,255,255,0.1)' }} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}