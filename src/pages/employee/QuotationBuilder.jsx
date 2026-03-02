import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; 
import {
  Box,
  Stack,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Divider,
  InputAdornment,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  FormControlLabel,
  Checkbox,
  Collapse,
  Alert,
  CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import DownloadIcon from "@mui/icons-material/Download";

/* ---------- THEME CONSTANTS ---------- */
const theme = {
  bgDark: '#0f0c29',
  bgGradient: 'radial-gradient(circle at 10% 20%, rgba(91, 33, 182, 0.4) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(30, 58, 138, 0.4) 0%, transparent 40%)',
  glassBg: 'rgba(255, 255, 255, 0.05)',
  glassBorder: '1px solid rgba(255, 255, 255, 0.1)',
  glassHighlight: 'rgba(255, 255, 255, 0.2)',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  accentBlue: '#3b82f6',
};

const glassStyles = {
  container: {
    minHeight: '100vh',
    bgcolor: theme.bgDark,
    background: `${theme.bgDark} ${theme.bgGradient}`,
    color: theme.textPrimary,
    fontFamily: "'Inter', sans-serif",
    p: { xs: 2, md: 4 },
    width: '100%',
    overflowX: 'hidden',
  },
  glassCard: {
    background: theme.glassBg,
    backdropFilter: 'blur(16px)',
    border: theme.glassBorder,
    borderTop: `1px solid ${theme.glassHighlight}`,
    borderRadius: '24px',
    p: 3,
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
    color: '#fff',
    mb: 2.5,
  },
  input: {
    '& .MuiOutlinedInput-root': {
      color: '#fff',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      borderRadius: '12px',
      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
      '&.Mui-focused fieldset': { borderColor: theme.accentBlue },
    },
    '& .MuiInputLabel-root': { color: theme.textSecondary },
    '& .MuiInputLabel-root.Mui-focused': { color: theme.accentBlue },
    '& .MuiSelect-icon': { color: theme.textSecondary },
    '& .MuiInputAdornment-root .MuiTypography-root': { color: theme.textSecondary },
    '& .MuiAutocomplete-popupIndicator': { color: theme.textSecondary },
    '& .MuiAutocomplete-clearIndicator': { color: theme.textSecondary },
  },
  table: {
    '& th': {
      bgcolor: '#1e1e38',
      color: '#fff',
      fontWeight: 700,
      borderBottom: '2px solid rgba(255,255,255,0.1)',
      whiteSpace: 'nowrap',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    },
    '& td': {
      color: '#fff',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      whiteSpace: 'nowrap'
    },
  },
};

/* ---------- API helpers ---------- */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

/* ---------- Assets ---------- */
const HEADER_BANNER_SRC = "/ipqs-letter-header.png";
const CERTIFICATE_IMG_SRC = "/ipqs-iso9001.png";

/* ---------- Dropdown helpers ---------- */
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const CURRENCIES = ["INR", "USD", "EUR", "GBP"];

/* ---------- Print/Preview CSS ---------- */
const PRINT_CSS = `
  @page { size: A4; margin: 18mm; }

  @media screen {
    .doc { width: 794px; margin: 0 auto; }
    .page { width: 794px; height: 1123px; background: #fff; box-shadow: 0 4px 24px rgba(0,0,0,.08); margin: 0 auto 16px; position: relative; }
  }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .doc { width: auto; }
    .page { width: auto; min-height: calc(297mm - 36mm); break-after: page; page-break-after: always; position: relative; }
    .page:last-child { break-after: auto; page-break-after: auto; }
  }

  .page { padding: 0; overflow: hidden; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; color: #111827; }
  .page-cover .cover-img { width: 100%; height: 100%; object-fit: cover; }
  .page-cover .cover-placeholder { height: 100%; display: grid; place-items: center; color: #9ca3af; border: 1px dashed #d1d5db; font-weight: 700; font-size: 18px; }

  .page-letter, .page-cost, .page-terms, .page-certificate, .page-energy { padding: 14mm 18mm 18mm; }
  .header { display: block; margin-bottom: 6px; }
  .header-banner { width: 100%; }
  .header-banner img { width: 100%; height: auto; display: block; }
  .brand { font-weight: 800; font-size: 18px; letter-spacing: .5px; }

  .meta-bar { display: flex; justify-content: space-between; align-items: flex-end; font-size: 12.5px; color: #374151; margin: 6px 0 10px; }
  .meta-bar .left, .meta-bar .right { display: flex; gap: 14px; }
  .meta-bar .right { text-align: right; flex-direction: column; align-items: flex-end; }

  .page-letter .content { font-size: 13.5px; line-height: 1.45; margin-top: 10px; }
  .page-letter .content .line { margin: 2px 0; }
  .page-letter .content .bold { font-weight: 800; }
  .page-letter .content .subject { font-weight: 700; margin: 12px 0 8px; }
  .page-letter .content .para { margin: 8px 0; }
  .page-letter .content .sign { margin-top: 20px; }

  .section-title { font-weight: 800; margin: 10px 0 8px; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; }

  .price-table, .energy-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 6px; }
  .price-table th, .price-table td,
  .energy-table th, .energy-table td { border: 1px solid #e5e7eb; padding: 8px 10px; }
  .price-table thead th, .energy-table thead th { background: #f8fafc; }
  .right { text-align: right; }
  .bold { font-weight: 700; }
  .big { font-weight: 800; font-size: 15px; }

  .info-line { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 10px; font-size: 12.5px; margin: 8px 0 4px; }

  .footer { position: absolute; left: 18mm; right: 18mm; bottom: 10mm; display: flex; flex-direction: column; align-items: center; font-size: 11.5px; color: #374151; }
  .footer .company { font-weight: 800; letter-spacing: .3px; }
  .footer .line { margin-top: 2px; }

  .terms { font-size: 13.5px; line-height: 1.5; }
  .terms h3 { margin: 6px 0 8px; font-size: 15px; }
  .terms ul { margin: 4px 0 10px 18px; padding: 0; }
  .terms li { margin: 3px 0; }
  .terms .kv { display: grid; grid-template-columns: 150px 1fr; gap: 8px 12px; margin: 8px 0 14px; }
  .terms .kv .k { color: #374151; }
  .terms .kv .v { font-weight: 600; }
  .info-table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
  .info-table th, .info-table td { border: 1px solid #e5e7eb; padding: 8px 10px; vertical-align: top; }
  .info-table th { width: 36%; background: #f8fafc; text-align: left; }

  .certificate-wrap { display: grid; place-items: center; height: calc(100% - 100px); }
  .certificate-wrap img { max-width: 100%; max-height: 100%; object-fit: contain; border: 1px solid #e5e7eb; }

  @media (max-width: 1024px) {
    .preview-shell { max-width: 100%; overflow-x: hidden; }
    .doc.doc--responsive { width: 100% !important; margin: 0; }
    .doc.doc--responsive .page {
      width: 100% !important;
      height: auto !important;
      box-shadow: 0 2px 10px rgba(0,0,0,.06);
    }
    .doc.doc--responsive .page-letter,
    .doc.doc--responsive .page-cost,
    .doc.doc--responsive .page-terms,
    .doc.doc--responsive .page-certificate,
    .doc.doc--responsive .page-energy { padding: 16px 16px 56px; }
    .doc.doc--responsive .meta-bar { font-size: 12px; margin: 6px 0 8px; }
    .doc.doc--responsive .page-letter .content { font-size: 13px; line-height: 1.55; margin-top: 8px; }
    .doc.doc--responsive .footer { left: 16px; right: 16px; bottom: 12px; font-size: 11px; }
  }
`;

/* ---------- Utils ---------- */
function money(n, currency) {
  if (Number.isNaN(+n)) return "";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(+n || 0);
  } catch {
    return `${currency || ""} ${(+n || 0).toFixed(2)}`;
  }
}

/* ---------- Lazy-load html2canvas + jsPDF ---------- */
async function ensurePdfLibs() {
  const needH2C = !window.html2canvas;
  const needJSPDF = !(window.jspdf && window.jspdf.jsPDF);
  const load = (src) =>
    new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = res;
      s.onerror = () => rej(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });
  if (needH2C)
    await load("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
  if (needJSPDF)
    await load("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
}

/* ================================ MAIN ================================ */
export default function QuotationBuilder() {
  const location = useLocation();
  const navigate = useNavigate(); 
  
  // Extracts data based on where user is navigating from
  const passedLead = location.state?.lead || null; 
  const editQuotation = location.state?.editQuotation || null; 

  /* ------------------- Local state ------------------- */
  const [coverFile, setCoverFile] = useState(null);
  const [coverUrl, setCoverUrl] = useState(""); // preview
  const [quote, setQuote] = useState({
    quoteNo: "QT-0001",
    refNo: "",
    date: new Date().toISOString().slice(0, 10),
    validityDays: 30,
    currency: "INR",
    taxRate: 18,
    discountEnabled: false,
    discountAmount: 0,
  });

  const [leadId, setLeadId] = useState("");

  const [recipient, setRecipient] = useState({
    company: "",
    attention: "",
    address: "",
    subject: "Power Factor Improvement Quotation",
    body: "Dear Sir/Madam,\n\nPlease find attached quotation...\n\nRegards,\nIPQS Private Limited",
  });

  const [items, setItems] = useState([
    { description: "APFC Panel 25 KVAR Hybrid System", qty: 1, rate: 108500 },
  ]);

  const [isSaved, setIsSaved] = useState(false); 
  const [saving, setSaving] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // Used for Update flow download state
  const [saveError, setSaveError] = useState("");

  // Energy section toggle (collapsed by default)
  const [energySectionEnabled, setEnergySectionEnabled] = useState(false);

  // Energy extra fields
  const [customerType, setCustomerType] = useState(""); // LT/HT
  const [billMonth, setBillMonth] = useState("");       // Jan..Dec
  const [billDuration, setBillDuration] = useState(""); // 6 months / 12 months

  // Energy inputs
  const [energyIn, setEnergyIn] = useState({
    kwh: 0,
    kvah: 0,
    pfTarget: "0.99",
    perUnit: 0,
    perUnitWithTax: 0,
    demandRate: 0,
    kvaMD: 0,
    kwMD: 0,
  });

  // ==============================================================
  //  PATCH DATA (Handles BOTH fresh lead creation & Edit Updates)
  // ==============================================================
  useEffect(() => {
    if (editQuotation) {
      // --- If updating from SavedQuotations ---
      setLeadId(editQuotation.lead_number || "");
      
      setRecipient({
        company: editQuotation.company_name || "",
        attention: editQuotation.contact_person_name || "",
        address: editQuotation.address || "",
        subject: editQuotation.subject || "Power Factor Improvement Quotation",
        body: editQuotation.cover_body || "Dear Sir/Madam,\n\nPlease find attached quotation...\n\nRegards,\nIPQS Private Limited",
      });

      const dateStr = editQuotation.quotation_date 
        ? new Date(editQuotation.quotation_date).toISOString().split('T')[0] 
        : new Date().toISOString().slice(0, 10);
      
      const discAmt = Number(editQuotation.discount_amount || 0);

      setQuote({
        quoteNo: editQuotation.quotation_no || "QT-0001",
        refNo: editQuotation.reference_no || "",
        date: dateStr,
        validityDays: editQuotation.validity_days || 30,
        currency: editQuotation.currency || "INR",
        taxRate: Number(editQuotation.tax_rate || 18),
        discountEnabled: discAmt > 0,
        discountAmount: discAmt,
      });

      if (editQuotation.items && Array.isArray(editQuotation.items)) {
        setItems(editQuotation.items.map(item => ({
          description: item.particulars || "",
          qty: Number(item.qty || 1),
          rate: Number(item.rate || 0)
        })));
      }

      if (editQuotation.customer_type || editQuotation.existing_kwh) {
        setEnergySectionEnabled(true);
        setCustomerType(editQuotation.customer_type || "");
        setBillMonth(editQuotation.bill_reference || "");
        
        let dur = "";
        if (String(editQuotation.period) === "6") dur = "6 months";
        if (String(editQuotation.period) === "12") dur = "12 months";
        setBillDuration(dur);

        setEnergyIn({
          kwh: Number(editQuotation.existing_kwh || 0),
          kvah: Number(editQuotation.existing_kvah || 0),
          pfTarget: editQuotation.effective_pf || "0.99",
          perUnit: Number(editQuotation.per_unit_rate || 0),
          perUnitWithTax: Number(editQuotation.per_unit_rate_with_taxes || 0),
          demandRate: Number(editQuotation.demand_rate || 0),
          kvaMD: Number(editQuotation.existing_kva_demand || 0),
          kwMD: Number(editQuotation.existing_kw_demand || 0),
        });
      }

    } else if (passedLead) {
      // --- If creating a fresh quote from Lead Details ---
      setLeadId(passedLead.lead_id || "");
      setRecipient((r) => ({
        ...r,
        company: passedLead.company_name || "",
        attention: passedLead.contact_person_name || "",
        address: [
            passedLead.company_address, 
            passedLead.company_city, 
            passedLead.company_state, 
            passedLead.company_country
        ].filter(Boolean).join(", ") || "",
      }));
    }
  }, [passedLead, editQuotation]);

  useEffect(() => {
    if (saveError || isSaved) {
      const timer = setTimeout(() => {
        setSaveError("");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [saveError, isSaved]);

  /* ------------------- Derived totals ------------------- */
  const subtotal = useMemo(() => items.reduce((s, r) => s + (r.qty || 0) * (r.rate || 0), 0), [items]);
  const discount = useMemo(() => (quote.discountEnabled ? Math.max(0, +quote.discountAmount || 0) : 0), [quote.discountEnabled, quote.discountAmount]);
  const taxableBase = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);
  const tax = useMemo(() => (taxableBase * (+quote.taxRate || 0)) / 100, [taxableBase, quote.taxRate]);
  const grand_total = useMemo(() => taxableBase + tax, [taxableBase, tax]);

  const energyCalc = useMemo(() => {
    const kwh = +energyIn.kwh || 0;
    const kvah = +energyIn.kvah || 0;
    const perUnit = +energyIn.perUnit || 0;
    const perUnitTax = +energyIn.perUnitWithTax || 0;
    const demandRate = +energyIn.demandRate || 0;
    const kvaMD = +energyIn.kvaMD || 0;
    const kwMD = +energyIn.kwMD || 0;

    const existingPF = kvah ? kwh / kvah : 0;
    const diffKvahKwh = Math.max(0, kvah - kwh);
    const savKvah = diffKvahKwh * perUnit;
    const savKvahTax = diffKvahKwh * perUnitTax;
    const savingDemand = Math.max(0, kvaMD - kwMD);
    const savMD = savingDemand * demandRate;
    const monthly = savMD + savKvahTax;
    const yearly = monthly * 12;
    const investment = grand_total;
    const months = monthly > 0 ? investment / monthly : 0;
    const days = months * 30;
    const fiveYearRupees = yearly * 5;

    return { existingPF, diffKvahKwh, savKvah, savKvahTax, savingDemand, savMD, monthly, yearly, investment, months, days, fiveYearRupees };
  }, [energyIn, grand_total]);

  /* ------------------- Handlers ------------------- */
  const onPickCover = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCoverFile(f);
    setCoverUrl(URL.createObjectURL(f));
    setIsSaved(false);
  };

  /* ---------- Build Bulletproof PDF File ---------- */
  const generateBulletproofPdfFile = async (fileName) => {
    const docRoot = document.querySelector(".doc");
    if (!docRoot) throw new Error("Could not find document root for PDF generation");
    
    await ensurePdfLibs();
    const h2c = window.html2canvas;
    const { jsPDF } = window.jspdf;
    const nodes = Array.from(docRoot.querySelectorAll(".page"));
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    
    let first = true;
    for (const n of nodes) {
      const canvas = await h2c(n, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        scrollY: -window.scrollY 
      });
      const img = canvas.toDataURL("image/jpeg", 1.0);
      if (!first) pdf.addPage();
      pdf.addImage(img, "JPEG", 0, 0, 210, 297, undefined, "FAST");
      first = false;
    }
    
    const pdfBase64 = pdf.output('datauristring');
    const base64Data = pdfBase64.split(',')[1];
    
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    
    return new File([byteArray], fileName, { type: 'application/pdf' });
  };

  /* ------------------- SAVE / UPDATE -> API ------------------- */
  const onSave = async () => {
    setSaveError("");
    try {
      setSaving(true);
      const token = getToken();
      if (!token) throw new Error("Missing auth token");

      const isEditing = editQuotation && editQuotation.quotation_id;
      let res;

      if (isEditing) {
        // --- ✏️ UPDATE EXISTING (PUT with JSON) ---
        const payload = {
          lead_number: leadId,
          company_name: recipient.company,
          contact_person_name: recipient.attention,
          address: recipient.address,
          reference_no: quote.refNo || "",
          quotation_date: quote.date || "",
          validity_days: Number(quote.validityDays || 0),
          currency: quote.currency || "INR",
          tax_rate: Number(quote.taxRate || 0),
          discount_amount: Number(quote.discountEnabled ? (quote.discountAmount || 0) : 0),
          subject: recipient.subject || "",
          cover_body: recipient.body || "",
          grand_total: Number(grand_total || 0),
          
          // ✅ FIX: Use null instead of "" for ENUM columns if disabled or empty
          customer_type: (energySectionEnabled && customerType) ? customerType : null,
          bill_reference: (energySectionEnabled && billMonth) ? billMonth : null,
          period: (energySectionEnabled && billDuration) ? (billDuration === "6 months" ? "6" : "12") : null,
          
          existing_kwh: energySectionEnabled ? Number(energyIn.kwh || 0) : null,
          existing_kvah: energySectionEnabled ? Number(energyIn.kvah || 0) : null,
          effective_pf: energySectionEnabled ? String(energyIn.pfTarget || "") : null,
          per_unit_rate: energySectionEnabled ? Number(energyIn.perUnit || 0) : null,
          per_unit_rate_with_taxes: energySectionEnabled ? Number(energyIn.perUnitWithTax || 0) : null,
          demand_rate: energySectionEnabled ? Number(energyIn.demandRate || 0) : null,
          existing_kva_demand: energySectionEnabled ? Number(energyIn.kvaMD || 0) : null,
          existing_kw_demand: energySectionEnabled ? Number(energyIn.kwMD || 0) : null,
          quotation_status: "saved",
          items: items.map((i, index) => ({
            position: index + 1,
            particulars: i.description,
            qty: Number(i.qty || 0),
            rate: Number(i.rate || 0),
            amount: Number((i.qty || 0) * (i.rate || 0)),
          }))
        };

        res = await fetch(`${API_BASE_URL}/api/v1/quotations/${editQuotation.quotation_id}`, {
          method: "PUT",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

      } else {
        // --- 🆕 CREATE NEW (POST with FormData) ---
        const form = new FormData();
        if (coverFile) form.append("cover_photo", coverFile);

        form.append("lead_number", leadId);
        form.append("company_name", recipient.company);
        form.append("contact_person_name", recipient.attention);
        form.append("address", recipient.address);
        form.append("reference_no", quote.refNo || "");
        form.append("quotation_date", quote.date || "");
        form.append("validity_days", String(quote.validityDays || 0));
        form.append("currency", quote.currency || "INR");
        form.append("tax_rate", String(quote.taxRate || 0));
        form.append("discount_amount", String(quote.discountEnabled ? (quote.discountAmount || 0) : 0));
        form.append("subject", recipient.subject || "");
        form.append("cover_body", recipient.body || "");

        form.append("items", JSON.stringify(items.map((i, index) => ({
              position: index + 1, 
              particulars: i.description,
              qty: Number(i.qty || 0),
              rate: Number(i.rate || 0),
              amount: Number((i.qty || 0) * (i.rate || 0)),
            }))
          )
        );

        form.append("grand_total", String(grand_total || 0));
        
        // ✅ FIX: Use "" for FormData if empty (Backend controller handles "" to null conversion)
        form.append("customer_type", (energySectionEnabled && customerType) ? customerType : "");
        form.append("bill_reference", (energySectionEnabled && billMonth) ? billMonth : "");
        form.append("period", (energySectionEnabled && billDuration) ? (billDuration === "6 months" ? "6" : "12") : "");
        
        form.append("existing_kwh", energySectionEnabled ? String(energyIn.kwh || 0) : "");
        form.append("existing_kvah", energySectionEnabled ? String(energyIn.kvah || 0) : "");
        form.append("effective_pf", energySectionEnabled ? String(energyIn.pfTarget || "") : "");
        form.append("per_unit_rate", energySectionEnabled ? String(energyIn.perUnit || 0) : "");
        form.append("per_unit_rate_with_taxes", energySectionEnabled ? String(energyIn.perUnitWithTax || 0) : "");
        form.append("demand_rate", energySectionEnabled ? String(energyIn.demandRate || 0) : "");
        form.append("existing_kva_demand", energySectionEnabled ? String(energyIn.kvaMD || 0) : "");
        form.append("existing_kw_demand", energySectionEnabled ? String(energyIn.kwMD || 0) : "");
        form.append("quotation_status", "saved");

        res = await fetch(`${API_BASE_URL}/api/v1/quotations`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || `Save failed (HTTP ${res.status})`);

      // ✅ FIX: INSTANTLY SYNC REVENUE AND PROBABILITY (Fires for both Save & Update)
      if (leadId) {
        const resUpdate = await fetch(`${API_BASE_URL}/api/leads/quotation-created`, {
            method: "PUT",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                lead_id: leadId,
                expected_revenue: Number(grand_total || 0)
            })
        });
        if (!resUpdate.ok) console.warn("Could not sync lead revenue to CRM database.");
      }

      setIsSaved(true);
      alert(`✅ Quotation ${isEditing ? 'updated' : 'created'} successfully! ${isEditing ? 'You can now download the PDF.' : 'You can now attach it to the lead\'s notes.'}`);
    } catch (err) {
      console.error(err);
      setSaveError(err.message || "Save failed");
      setIsSaved(false);
    } finally {
      setSaving(false);
    }
  };

  /* ------------------- ADD TO NOTES LOGIC (Used when Creating New) ------------------- */
  const handleAddNote = async () => {
    if (!leadId) {
        alert("Lead ID is missing. Cannot add note.");
        return;
    }
    
    try {
        setIsAddingNote(true);
        const token = getToken();
        if (!token) throw new Error("Missing auth token");

        const fileName = `Quotation-${quote.quoteNo || "IPQS"}.pdf`;
        const pdfFile = await generateBulletproofPdfFile(fileName);
        
        if (!pdfFile || pdfFile.size === 0) throw new Error("Failed to generate a valid PDF file. Please try again.");

        const notesForm = new FormData();
        notesForm.append("title", "Quotation Created");
        notesForm.append("note", "Please Find the attached quotation for your reference");
        notesForm.append("attachments", pdfFile);

        const resNotes = await fetch(`${API_BASE_URL}/api/leads/${leadId}/notes`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }, 
            body: notesForm,
        });

        if (!resNotes.ok) {
            const errData = await resNotes.json();
            throw new Error(errData?.message || "Failed to add quotation to notes.");
        }

        alert("✅ Quotation successfully attached to notes!");
        navigate("/marketing/quotation-team/leads");

    } catch (err) {
        console.error(err);
        alert(err.message || "Failed to process the request.");
    } finally {
        setIsAddingNote(false);
    }
  };

  /* ------------------- DOWNLOAD PDF LOGIC (Used when Updating) ------------------- */
  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      const fileName = `Quotation-${quote.quoteNo || "IPQS"}.pdf`;
      const pdfFile = await generateBulletproofPdfFile(fileName);
      
      // Create a blob link and trigger an automatic click to download it
      const url = URL.createObjectURL(pdfFile);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF Download error:", err);
      alert("Failed to download PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const footerLine = "Email: sales@ipqspl.com • Website: www.ipqspl.com • Cell: 9158418924";

  return (
    <Box sx={glassStyles.container}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', letterSpacing: -1 }}>Quotation Builder</Typography>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveOutlinedIcon />}
            onClick={onSave}
            disabled={saving || isAddingNote || isDownloading}
            sx={{ borderRadius: '12px', bgcolor: theme.accentBlue }}
          >
            {saving ? "Saving..." : editQuotation ? "Update Quotation" : "Save Quotation"}
          </Button>

          {/* DYNAMIC SUCCESS BUTTON - Shows Download if Updating, Shows Add Note if Creating */}
          {isSaved && (
             editQuotation ? (
                <Button
                  variant="contained"
                  startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  sx={{ 
                    borderRadius: '12px', 
                    bgcolor: '#f59e0b', // Amber/Orange color for downloading
                    '&:hover': { bgcolor: '#d97706' } 
                  }}
               >
                  {isDownloading ? "Generating PDF..." : "Download Quotation"}
               </Button>
             ) : (
               <Button
                  variant="contained"
                  startIcon={isAddingNote ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfOutlinedIcon />}
                  onClick={handleAddNote}
                  disabled={isAddingNote}
                  sx={{ 
                    borderRadius: '12px', 
                    bgcolor: '#10b981', // Green color to distinguish from save
                    '&:hover': { bgcolor: '#059669' } 
                  }}
               >
                  {isAddingNote ? "Processing..." : "Add to Notes"}
               </Button>
             )
          )}
        </Stack>
      </Stack>

      {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}

      <Grid container spacing={2.5} alignItems="flex-start">
        {/* LEFT — FORM */}
        <Grid item xs={12} lg={7}>
          {/* ===== Customer ===== */}
          <Paper sx={glassStyles.glassCard}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Customer</Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
                gap: 2,
              }}
            >
              {/* Lead Number */}
              <TextField
                label="Lead Number"
                value={leadId}
                onChange={(e) => { setLeadId(e.target.value); setIsSaved(false); }}
                fullWidth
                sx={glassStyles.input}
              />

              {/* Company */}
              <TextField
                label="Company / Customer"
                value={recipient.company}
                onChange={(e) => { setRecipient((f) => ({ ...f, company: e.target.value })); setIsSaved(false); }}
                fullWidth
                sx={glassStyles.input}
              />

              {/* Attention */}
              <TextField
                label="Attention (Contact Person)"
                value={recipient.attention}
                onChange={(e) => { setRecipient((f) => ({ ...f, attention: e.target.value })); setIsSaved(false); }}
                fullWidth
                sx={glassStyles.input}
              />

              {/* Upload Cover Image */}
              <Button
                component="label"
                startIcon={<ImageOutlinedIcon />}
                variant="outlined"
                fullWidth
                sx={{ height: 56, justifySelf: "stretch", borderColor: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: '12px' }}
              >
                {coverFile ? "Replace Cover Image" : "Upload Cover Image"}
                <input type="file" accept="image/*" hidden onChange={onPickCover} />
              </Button>
            </Box>

            {/* Address */}
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Address"
                multiline
                minRows={4}
                value={recipient.address}
                onChange={(e) => {
                  setRecipient((f) => ({ ...f, address: e.target.value }));
                  setIsSaved(false);
                }}
                fullWidth
                sx={glassStyles.input}
              />
            </Box>
          </Paper>

          {/* ===== Quote details ===== */}
          <Paper sx={glassStyles.glassCard}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Quote Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField label="Quote #" fullWidth value={quote.quoteNo}
                  onChange={(e) => { setQuote((q) => ({ ...q, quoteNo: e.target.value })); setIsSaved(false); }} sx={glassStyles.input} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Reference #" fullWidth value={quote.refNo}
                  onChange={(e) => { setQuote((q) => ({ ...q, refNo: e.target.value })); setIsSaved(false); }} sx={glassStyles.input} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={quote.date}
                  onChange={(e) => { setQuote((q) => ({ ...q, date: e.target.value })); setIsSaved(false); }} sx={glassStyles.input} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Validity (days)" type="number" fullWidth value={quote.validityDays}
                  onChange={(e) => { setQuote((q) => ({ ...q, validityDays: Number(e.target.value || 0) })); setIsSaved(false); }} sx={glassStyles.input} />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField label="Cur." select fullWidth value={quote.currency}
                  onChange={(e) => { setQuote((q) => ({ ...q, currency: e.target.value })); setIsSaved(false); }} sx={glassStyles.input}>
                  {CURRENCIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Tax %" type="number" fullWidth value={quote.taxRate}
                  onChange={(e) => { setQuote((q) => ({ ...q, taxRate: Number(e.target.value || 0) })); setIsSaved(false); }} sx={glassStyles.input} />
              </Grid>

              {/* Discount toggle + value */}
              <Grid item xs={12} md={3} sx={{ display: "flex", alignItems: "center" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      sx={{ color: theme.textSecondary, '&.Mui-checked': { color: theme.accentBlue } }}
                      checked={quote.discountEnabled}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        setQuote((q) => ({ ...q, discountEnabled: enabled }));
                        setIsSaved(false);
                      }}
                    />
                  }
                  label={<Typography color={theme.textSecondary}>Add discount</Typography>}
                />
              </Grid>

              {quote.discountEnabled && (
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Discount Amount"
                    type="number"
                    fullWidth
                    value={quote.discountAmount}
                    onChange={(e) => {
                      const v = e.target.value;
                      setQuote((q) => ({ ...q, discountAmount: v }));
                      setIsSaved(false);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start"><Typography color={theme.textSecondary}>{quote.currency}</Typography></InputAdornment>
                      ),
                      inputProps: { min: 0, step: "0.01" },
                    }}
                    helperText="Applied before tax"
                    sx={glassStyles.input}
                  />
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* ===== Cover Letter (Subject & Body) ===== */}
          <Paper sx={glassStyles.glassCard}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
              Cover Letter (Subject &amp; Body)
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
                gap: 2,
                alignItems: "start",
              }}
            >
              {/* Subject */}
              <TextField
                label="Subject"
                value={recipient.subject}
                onChange={(e) => {
                  setRecipient((f) => ({ ...f, subject: e.target.value }));
                  setIsSaved(false);
                }}
                fullWidth
                sx={glassStyles.input}
              />

              {/* Letter Body */}
              <TextField
                label="Letter Body"
                multiline
                minRows={18}
                value={recipient.body}
                onChange={(e) => {
                  setRecipient((f) => ({ ...f, body: e.target.value }));
                  setIsSaved(false);
                }}
                fullWidth
                sx={{ "& .MuiInputBase-root": { overflow: "auto", ...glassStyles.input['& .MuiOutlinedInput-root'] }, ...glassStyles.input }}
              />
            </Box>
          </Paper>

          {/* ===== Cost table ===== */}
          <Paper sx={glassStyles.glassCard}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6" fontWeight={800}>Cost Estimation</Typography>
              <Button startIcon={<AddIcon />} variant="outlined"
                sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: '12px' }}
                onClick={() => { setItems((r) => [...r, { description: "", qty: 1, rate: 0 }]); setIsSaved(false); }}>
                Add Item
              </Button>
            </Stack>

            <Box sx={{ width: "100%", overflowX: { xs: "auto", md: "visible" }, WebkitOverflowScrolling: "touch" }}>
              <Table size="small" sx={{ minWidth: { xs: 720, sm: 760, md: 0 }, ...glassStyles.table }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: { xs: 360, md: "45%" } }}>Particulars</TableCell>
                    <TableCell sx={{ width: { xs: 80, md: 120 } }}>Qty</TableCell>
                    <TableCell sx={{ width: { xs: 120, md: 180 } }}>Rate</TableCell>
                    <TableCell sx={{ width: { xs: 140, md: 180 } }}>Amount</TableCell>
                    <TableCell align="right" sx={{ width: 60 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <TextField
                          placeholder="Description"
                          fullWidth
                          value={r.description}
                          onChange={(e) => {
                            setItems((rows) => rows.map((row, idx) => (idx === i ? { ...row, description: e.target.value } : row)));
                            setIsSaved(false);
                          }}
                          sx={glassStyles.input}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          fullWidth
                          value={r.qty}
                          onChange={(e) => {
                            setItems((rows) => rows.map((row, idx) => (idx === i ? { ...row, qty: +e.target.value } : row)));
                            setIsSaved(false);
                          }}
                          InputProps={{ inputProps: { min: 0 } }}
                          sx={glassStyles.input}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          fullWidth
                          value={r.rate}
                          onChange={(e) => {
                            setItems((rows) => rows.map((row, idx) => (idx === i ? { ...row, rate: +e.target.value } : row)));
                            setIsSaved(false);
                          }}
                          InputProps={{ startAdornment: (<InputAdornment position="start"><Typography color={theme.textSecondary}>{quote.currency}</Typography></InputAdornment>) }}
                          sx={glassStyles.input}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {money((r.qty || 0) * (r.rate || 0), quote.currency)}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Remove">
                          <IconButton onClick={() => { setItems((rows) => rows.filter((_, idx) => idx !== i)); setIsSaved(false); }} size="small" sx={{ color: theme.textSecondary }}>
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableRow>
                    <TableCell rowSpan={quote.discountEnabled ? 4 : 3} />
                    <TableCell colSpan={2} sx={{ fontWeight: 700 }}>Subtotal</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{money(subtotal, quote.currency)}</TableCell>
                    <TableCell />
                  </TableRow>

                  {quote.discountEnabled && (
                    <TableRow>
                      <TableCell colSpan={2} sx={{ fontWeight: 700 }}>Discount</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {money(-discount, quote.currency)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  )}

                  <TableRow>
                    <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                      Tax ({quote.taxRate}%)
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{money(tax, quote.currency)}</TableCell>
                    <TableCell />
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} sx={{ fontWeight: 900, fontSize: 16 }}>Grand Total</TableCell>
                    <TableCell sx={{ fontWeight: 900, fontSize: 16 }}>{money(grand_total, quote.currency)}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
            <Typography variant="body2" color={theme.textSecondary}>
              * Prices are exclusive of taxes. Validity of this quotation is {quote.validityDays} days from date of issue.
            </Typography>
          </Paper>

          {/* ===== Energy toggle (collapsed by default) ===== */}
          <FormControlLabel
            sx={{ mb: 1 }}
            control={
              <Checkbox
                sx={{ color: theme.textSecondary, '&.Mui-checked': { color: theme.accentBlue } }}
                checked={energySectionEnabled}
                onChange={(e) => { setEnergySectionEnabled(e.target.checked); setIsSaved(false); }}
              />
            }
            label={<Typography color={theme.textSecondary}>Enable Energy & Cost Saving Calculations</Typography>}
          />

          {/* ===== ENERGY & COST SAVING (inputs + computed) — Collapsible ===== */}
          <Collapse in={energySectionEnabled} timeout="auto" unmountOnExit>
            <Paper sx={glassStyles.glassCard}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
                Energy &amp; Cost Saving Calculations (Inputs)
              </Typography>

              <Grid container spacing={2}>
                {/* NEW: Customer Type */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Customer Type"
                    select
                    fullWidth
                    value={customerType}
                    onChange={(e) => { setCustomerType(e.target.value); setIsSaved(false); }}
                    sx={glassStyles.input}
                  >
                    <MenuItem value="LT Customer">LT Customer</MenuItem>
                    <MenuItem value="HT Customer">HT Customer</MenuItem>
                  </TextField>
                </Grid>

                {/* NEW: Bill Reference Month */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Bill Reference (Month)"
                    select
                    fullWidth
                    value={billMonth}
                    onChange={(e) => { setBillMonth(e.target.value); setBillDuration(""); setIsSaved(false); }}
                    sx={glassStyles.input}
                  >
                    {MONTHS.map((m) => (
                      <MenuItem key={m} value={m}>{m}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* NEW: Duration after month selection */}
                {billMonth && (
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Duration"
                      select
                      fullWidth
                      value={billDuration}
                      onChange={(e) => { setBillDuration(e.target.value); setIsSaved(false); }}
                      sx={glassStyles.input}
                    >
                      <MenuItem value="6 months">6 months</MenuItem>
                      <MenuItem value="12 months">12 months</MenuItem>
                    </TextField>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <TextField label="Existing KWH Consumption" type="number" fullWidth
                    value={energyIn.kwh}
                    onChange={(e) => { setEnergyIn((s) => ({ ...s, kwh: e.target.value })); setIsSaved(false); }} sx={glassStyles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Existing KVAH Consumption" type="number" fullWidth
                    value={energyIn.kvah}
                    onChange={(e) => { setEnergyIn((s) => ({ ...s, kvah: e.target.value })); setIsSaved(false); }} sx={glassStyles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Effective Power Factor can be achieved at" fullWidth
                    value={energyIn.pfTarget} disabled sx={glassStyles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Per Unit rate" type="number" fullWidth
                    value={energyIn.perUnit}
                    onChange={(e) => { setEnergyIn((s) => ({ ...s, perUnit: e.target.value })); setIsSaved(false); }}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><Typography color={theme.textSecondary}>{quote.currency}</Typography></InputAdornment>) }} sx={glassStyles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Per Unit rate with taxes" type="number" fullWidth
                    value={energyIn.perUnitWithTax}
                    onChange={(e) => { setEnergyIn((s) => ({ ...s, perUnitWithTax: e.target.value })); setIsSaved(false); }}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><Typography color={theme.textSecondary}>{quote.currency}</Typography></InputAdornment>) }} sx={glassStyles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Demand Rate" type="number" fullWidth
                    value={energyIn.demandRate}
                    onChange={(e) => { setEnergyIn((s) => ({ ...s, demandRate: e.target.value })); setIsSaved(false); }}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><Typography color={theme.textSecondary}>{quote.currency}</Typography></InputAdornment>) }} sx={glassStyles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Existing KVA Demand (KVA (MD))" type="number" fullWidth
                    value={energyIn.kvaMD}
                    onChange={(e) => { setEnergyIn((s) => ({ ...s, kvaMD: e.target.value })); setIsSaved(false); }} sx={glassStyles.input} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Existing KW Demand (KW MD)" type="number" fullWidth
                    value={energyIn.kwMD}
                    onChange={(e) => { setEnergyIn((s) => ({ ...s, kwMD: e.target.value })); setIsSaved(false); }} sx={glassStyles.input} />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />

              <Typography fontWeight={800} sx={{ mb: 1 }}>
                Results (Auto-calculated)
              </Typography>

              {/* Info line showing the new selections */}
              <Box className="info-line" sx={{ color: '#000' }}>
                <b>Customer Type:</b> {customerType || "—"} &nbsp; | &nbsp;
                <b>Bill Reference:</b> {billMonth ? `${billMonth} (${billDuration || "—"})` : "—"}
              </Box>

              <Box sx={{ overflowX: "auto" }}>
                <Table size="small" className="energy-table" sx={{ minWidth: 720, ...glassStyles.table }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Parameters from Electricity Bill</TableCell>
                      <TableCell sx={{ fontWeight: 800, width: 120 }}>UOM</TableCell>
                      <TableCell sx={{ fontWeight: 800, width: 200 }}>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <Row k="Existing KWH Consumption" uom="KWH" v={energyIn.kwh} />
                    <Row k="Existing KVAH Consumption" uom="KVAH" v={energyIn.kvah} />
                    <Row k="Existing Power Factor (C = A / B)" uom="PF" v={energyCalc.existingPF.toFixed(3)} />
                    <Row k="Difference between KWH & KVAH (D = B - A)" uom="-" v={energyCalc.diffKvahKwh} />
                    <Row k="Effective Power Factor can be achieved at" uom="PF" v={energyIn.pfTarget} />
                    <Row k="Commercial Savings in KVAH Energy Charges" uom="Rs." v={money(energyCalc.savKvah, quote.currency)} />
                    <Row k="Commercial Savings in KVAH Energy Charges with all the taxes" uom="Rs." v={money(energyCalc.savKvahTax, quote.currency)} />

                    <Row k="Existing KVA Demand (KVA (MD))" uom="KVA" v={energyIn.kvaMD} />
                    <Row k="Existing KW Demand (KW MD)" uom="KW" v={energyIn.kwMD} />
                    <Row k="Saving in Demand" uom="" v={energyCalc.savingDemand} />
                    <Row k="Commercial Savings in KVA (MD) Charges" uom="Rs." v={money(energyCalc.savMD, quote.currency)} />

                    <tr>
                      <td colSpan={2} className="bold">Total MONTHLY Savings (Approx.) based on last Electricity bills provided, as per above calculation</td>
                      <td className="bold">{money(energyCalc.monthly, quote.currency)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="bold">Total YEARLY Savings (Approx.) based on last Electricity bills provided, as per above calculation</td>
                      <td className="bold">{money(energyCalc.yearly, quote.currency)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="bold">Investment required as per Proposed System. Total Value of Quotation submitted</td>
                      <td className="bold">{money(energyCalc.investment, quote.currency)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="bold">NUMBER OF DAYS:</td>
                      <td>{energyCalc.days ? energyCalc.days.toFixed(0) : "—"}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="bold">NUMBER OF MONTHS:</td>
                      <td>{energyCalc.months ? energyCalc.months.toFixed(1) : "—"}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="bold">Savings on Investment in 5 years (in Lakhs)</td>
                      <td className="bold">{money(energyCalc.fiveYearRupees)}</td>
                    </tr>
                  </TableBody>
                </Table>
              </Box>
            </Paper>
          </Collapse>
        </Grid>

        {/* RIGHT — PREVIEW */}
        <Grid item xs={12} lg={5}>
          <Box sx={{ position: { lg: "sticky" }, top: { lg: 16 }, maxHeight: { lg: "calc(100vh - 32px)" }, overflow: { lg: "auto" } }}>
            <Paper sx={glassStyles.glassCard}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>Preview</Typography>
              <Box className="preview-shell" sx={{ mt: 1 }}>
                <PrintStyles />
                <div className="doc doc--responsive">
                  {/* COVER */}
                  <div className="page page-cover">
                    {coverUrl ? (
                      <img src={coverUrl} alt="Cover" className="cover-img" />
                    ) : (
                      <div className="cover-placeholder"><div>Cover Image</div></div>
                    )}
                  </div>

                  {/* LETTER pages */}
                  <LetterPages quote={quote} recipient={recipient} footerLine={footerLine} bannerSrc={HEADER_BANNER_SRC} />

                  {/* COST page */}
                  <div className="page page-cost">
                    <Header bannerSrc={HEADER_BANNER_SRC} />
                    <MetaBar quote={quote} />
                    <div className="section-title">Commercial Offer</div>
                    <table className="price-table">
                      <thead>
                        <tr>
                          <th style={{ width: "8%" }}>Sr.</th>
                          <th>Particular</th>
                          <th style={{ width: "12%" }}>Qty</th>
                          <th style={{ width: "18%" }}>Rate</th>
                          <th style={{ width: "20%" }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((r, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{r.description || "—"}</td>
                            <td>{r.qty || 0}</td>
                            <td>{money(r.rate, quote.currency)}</td>
                            <td>{money((r.qty || 0) * (r.rate || 0), quote.currency)}</td>
                          </tr>
                        ))}
                        <tr><td colSpan={4} className="right bold">Subtotal</td><td className="bold">{money(subtotal, quote.currency)}</td></tr>
                        {quote.discountEnabled && (
                          <tr><td colSpan={4} className="right bold">Discount</td><td className="bold">{money(-discount, quote.currency)}</td></tr>
                        )}
                        <tr><td colSpan={4} className="right bold">Tax ({quote.taxRate}%)</td><td className="bold">{money(tax, quote.currency)}</td></tr>
                        <tr><td colSpan={4} className="right big">Grand Total</td><td className="big">{money(grand_total, quote.currency)}</td></tr>
                      </tbody>
                    </table>
                    <Footer line={footerLine} />
                  </div>

                  {/* ENERGY page — only when enabled */}
                  {energySectionEnabled && (
                    <div className="page page-energy">
                      <Header bannerSrc={HEADER_BANNER_SRC} />
                      <MetaBar quote={quote} />
                      <div className="section-title">Energy &amp; Cost Saving Calculations</div>

                      <div className="info-line">
                        <b>Customer Type:</b> {customerType || "—"} &nbsp; | &nbsp;
                        <b>Bill Reference:</b> {billMonth ? `${billMonth} (${billDuration || "—"})` : "—"}
                      </div>

                      <table className="energy-table">
                        <thead>
                          <tr>
                            <th>PARAMETERS FROM ELECTRICITY BILL</th>
                            <th style={{ width: "14%" }}>UOM</th>
                            <th style={{ width: "24%" }}>Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          <Tr k="Existing KWH Consumption" u="KWH" v={energyIn.kwh} />
                          <Tr k="Existing KVAH Consumption" u="KVAH" v={energyIn.kvah} />
                          <Tr k="Existing Power Factor (C = A / B)" u="PF" v={energyCalc.existingPF.toFixed(3)} />
                          <Tr k="Difference between KWH & KVAH (D = B - A)" u="-" v={energyCalc.diffKvahKwh} />
                          <Tr k="Effective Power Factor can be achieved at" u="PF" v={energyIn.pfTarget} />
                          <Tr k="Commercial Savings in KVAH Energy Charges" u="Rs." v={money(energyCalc.savKvah, quote.currency)} />
                          <Tr k="Commercial Savings in KVAH Energy Charges with all the taxes" uom="Rs." v={money(energyCalc.savKvahTax, quote.currency)} />

                          <Tr k="Existing KVA Demand (KVA (MD))" u="KVA" v={energyIn.kvaMD} />
                          <Tr k="Existing KW Demand (KW MD)" u="KW" v={energyIn.kwMD} />
                          <Tr k="Saving in Demand" u="" v={energyCalc.savingDemand} />
                          <Tr k="Commercial Savings in KVA (MD) Charges" u="Rs." v={money(energyCalc.savMD, quote.currency)} />

                          <tr>
                            <td colSpan={2} className="bold">Total MONTHLY Savings (Approx.) based on last Electricity bills provided, as per above calculation</td>
                            <td className="bold">{money(energyCalc.monthly, quote.currency)}</td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="bold">Total YEARLY Savings (Approx.) based on last Electricity bills provided, as per above calculation</td>
                            <td className="bold">{money(energyCalc.yearly, quote.currency)}</td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="bold">Investment required as per Proposed System. Total Value of Quotation submitted</td>
                            <td className="bold">{money(energyCalc.investment, quote.currency)}</td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="bold">NUMBER OF DAYS:</td>
                            <td>{energyCalc.days ? energyCalc.days.toFixed(0) : "—"}</td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="bold">NUMBER OF MONTHS:</td>
                            <td>{energyCalc.months ? energyCalc.months.toFixed(1) : "—"}</td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="bold">Savings on Investment in 5 years (in Lakhs)</td>
                            <td className="bold">{money(energyCalc.fiveYearRupees)}</td>
                          </tr>
                        </tbody>
                      </table>
                      <Footer line={footerLine} />
                    </div>
                  )}

                  {/* TERMS & CONDITIONS page */}
                  <TermsAndConditionsPage bannerSrc={HEADER_BANNER_SRC} footerLine={footerLine} />

                  {/* CERTIFICATE page */}
                  <CertificatePage bannerSrc={HEADER_BANNER_SRC} footerLine={footerLine} imgSrc={CERTIFICATE_IMG_SRC} />
                </div>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

/* ---------- Small helper row components for tables ---------- */
function Row({ k, uom, v }) {
  return (
    <TableRow>
      <TableCell>{k}</TableCell>
      <TableCell>{uom || ""}</TableCell>
      <TableCell>{v}</TableCell>
    </TableRow>
  );
}
function Tr({ k, u, v }) {
  return (
    <tr>
      <td>{k}</td>
      <td>{u}</td>
      <td className="right">{typeof v === "string" || typeof v === "number" ? v : v}</td>
    </tr>
  );
}

/* ---------- Header / Meta / Footer for preview ---------- */
function Header({ bannerSrc }) {
  return (
    <div className="header">
      {bannerSrc ? (
        <div className="header-banner"><img src={bannerSrc} alt="IPQS header" /></div>
      ) : (
        <div className="brand">IPQS PRIVATE LIMITED</div>
      )}
    </div>
  );
}
function MetaBar({ quote }) {
  return (
    <div className="meta-bar">
      <div className="left">{quote.refNo ? <div>Reference: <b>{quote.refNo}</b></div> : <div>&nbsp;</div>}</div>
      <div className="right">
        <div>Date: <b>{new Date(quote.date).toLocaleDateString()}</b></div>
        <div>Quote #: <b>{quote.quoteNo}</b></div>
      </div>
    </div>
  );
}
function Footer({ line }) {
  return (
    <div className="footer">
      <div className="company">IPQS PRIVATE LIMITED</div>
      <div className="line">{line}</div>
    </div>
  );
}

/* ---------- Auto-paginated letter for preview ---------- */
function LetterPages({ quote, recipient, footerLine, bannerSrc }) {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    const page = document.createElement("div");
    page.className = "page page-letter";
    page.style.position = "absolute";
    page.style.visibility = "hidden";
    page.style.left = "-10000px";

    const header = document.createElement("div");
    header.className = "header";
    if (bannerSrc) {
      const hb = document.createElement("div");
      hb.className = "header-banner";
      const img = document.createElement("img");
      img.src = bannerSrc;
      hb.appendChild(img);
      header.appendChild(hb);
    } else {
      const brand = document.createElement("div");
      brand.className = "brand";
      brand.textContent = "IPQS PRIVATE LIMITED";
      header.appendChild(brand);
    }

    const meta = document.createElement("div");
    meta.className = "meta-bar";
    meta.innerHTML = `
      <div class="left">${quote.refNo ? `Reference: <b>${quote.refNo}</b>` : "&nbsp;"}</div>
      <div class="right">
        <div>Date: <b>${new Date(quote.date).toLocaleDateString()}</b></div>
        <div>Quote #: <b>${quote.quoteNo}</b></div>
      </div>`;

    const content = document.createElement("div");
    content.className = "content";

    page.appendChild(header);
    page.appendChild(meta);
    page.appendChild(content);
    document.body.appendChild(page);

    const pageHeight = page.getBoundingClientRect().height || 1123;
    const headerH = header.getBoundingClientRect().height;
    const metaH = meta.getBoundingClientRect().height;
    const reservedFooter = 90;
    const available = pageHeight - headerH - metaH - reservedFooter - 48;

    const makeDiv = (txt, cls = "para") => {
      const el = document.createElement("div");
      el.className = cls;
      el.textContent = txt;
      return el;
    };

    const blocks = [];
    blocks.push(makeDiv("To,", "line"));
    blocks.push(makeDiv(recipient.company || "—", "bold line"));
    if (recipient.attention) blocks.push(makeDiv(`Attn: ${recipient.attention}`, "line"));
    (recipient.address || "—")
      .split("\n")
      .filter(Boolean)
      .forEach((l) => blocks.push(makeDiv(l, "line")));
    blocks.push(makeDiv(`Subject: ${recipient.subject || "—"}`, "subject"));

    const paras = (recipient.body || "")
      .split(/\n{2,}/g)
      .map((p) => p.trim())
      .filter(Boolean);
    paras.forEach((p) => blocks.push(makeDiv(p, "para")));

    const sign = document.createElement("div");
    sign.className = "sign";
    sign.innerHTML = `<div>Thanks & Regards,</div>
       <div class="bold">For IPQS PRIVATE LIMITED</div>
       <div style="height:48px"></div>
       <div class="bold">Authorised Signatory</div>`;

    const pagesHtml = [];
    let cursor = 0;

    while (cursor < blocks.length) {
      content.innerHTML = "";
      while (cursor < blocks.length) {
        content.appendChild(blocks[cursor]);
        if (content.scrollHeight > available) {
          content.removeChild(blocks[cursor]);
          break;
        }
        cursor += 1;
      }

      if (cursor >= blocks.length) {
        content.appendChild(sign);
        if (content.scrollHeight > available) {
          content.removeChild(sign);
          pagesHtml.push(content.innerHTML);
          content.innerHTML = "";
          content.appendChild(sign);
        }
      }
      pagesHtml.push(content.innerHTML);
    }

    document.body.removeChild(page);
    setPages(pagesHtml);
  }, [quote, recipient, bannerSrc]);

  if (pages.length === 0) return null;

  return (
    <>
      {pages.map((html, idx) => (
        <div className="page page-letter" key={idx}>
          <Header bannerSrc={bannerSrc} />
          <MetaBar quote={quote} />
          <div className="content" dangerouslySetInnerHTML={{ __html: html }} />
          <Footer line={footerLine} />
        </div>
      ))}
    </>
  );
}

/* ---------- TERMS PAGE ---------- */
function TermsAndConditionsPage({ bannerSrc, footerLine }) {
  return (
    <div className="page page-terms">
      <Header bannerSrc={bannerSrc} />
      <div className="section-title">A. Terms and Conditions</div>
      <div className="terms">
        <h3>Payment Terms</h3>
        <ul>
          <li>70% Basic Amount Advance with Techno-commercially Cleared Purchase Order.</li>
          <li>30% Basic Amount against Proforma invoice and material readiness before Dispatch.</li>
          <li>Both advance and final payments will be subject to 100% taxes as applicable.</li>
        </ul>

        <div className="kv">
          <div className="k">Taxes &amp; Duties</div><div className="v">Prevailing GST Tax rate is extra as applicable. (Presently 9% CGST + 9% SGST)</div>
          <div className="k">Mode of transport</div><div className="v">By Road</div>
          <div className="k">Freight</div><div className="v">Extra at actual</div>
          <div className="k">Insurance</div><div className="v">To be arranged by you, if required</div>
          <div className="k">Consign to</div><div className="v">As advised by you.</div>
          <div className="k">Invoice to</div><div className="v">As advised by you.</div>
          <div className="k">Packing charges</div><div className="v">Standard Packing with Wrapping is Inclusive. However, Wooden packing charges will be Extra at actual.</div>
        </div>

        <div className="section-title" style={{ marginTop: 16 }}>A. Company Details</div>
        <table className="info-table">
          <tbody>
            <tr><th>Name of Company</th><td>IPQS PRIVATE LIMITED</td></tr>
            <tr><th>Address</th><td>209, Gangamai Industrial Complex, M.I.D.C. Ambad, 422010, Maharashtra, India.</td></tr>
            <tr><th>CIN</th><td>U31909MH2022PTC395396</td></tr>
            <tr><th>GST</th><td>27AAGCI9596L1ZM</td></tr>
          </tbody>
        </table>

        <div className="section-title" style={{ marginTop: 16 }}>B. Bank Details</div>
        <table className="info-table">
          <tbody>
            <tr><th>Name of Account</th><td>IPQS PRIVATE LIMITED</td></tr>
            <tr><th>Bank</th><td>HDFC BANK LTD</td></tr>
            <tr><th>Account Number</th><td>99909158418924</td></tr>
            <tr><th>IFSC Code</th><td>HDFC0000878</td></tr>
          </tbody>
        </table>
      </div>
      <Footer line={footerLine} />
    </div>
  );
}

/* ---------- CERTIFICATE PAGE ---------- */
function CertificatePage({ bannerSrc, footerLine, imgSrc }) {
  return (
    <div className="page page-certificate">
      <Header bannerSrc={bannerSrc} />
      <div className="section-title">Certificate of Registration</div>
      <div className="certificate-wrap">
        <img src={imgSrc} alt="ISO 9001:2015 Certificate - IPQS Private Limited" />
      </div>
      <Footer line={footerLine} />
    </div>
  );
}

/* ---------- Inject preview CSS ---------- */
function PrintStyles() {
  return <style>{PRINT_CSS}</style>;
}