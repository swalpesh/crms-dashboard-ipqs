import {
  Box, List, ListItemButton, ListItemIcon, ListItemText, Collapse, Divider, Typography
} from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";

// --- EXISTING ICONS ---
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import CorporateFareOutlinedIcon from "@mui/icons-material/CorporateFareOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'; 

// --- NEW ICONS FOR TECHNICAL TEAM ---
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined"; 
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined"; 
import PostAddOutlinedIcon from "@mui/icons-material/PostAddOutlined"; 
import SnippetFolderOutlinedIcon from "@mui/icons-material/SnippetFolderOutlined"; 

import logoUrl from "../assets/logo.png";

/* helpers */
const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function detectTeamSlug(dept, role) {
  const d = norm(dept);
  const r = norm(role);

  const exact = {
    "ipqshead": "ipqshead",
    "tele-marketing": "tele",
    "field-marketing": "field",
    "associate-marketing": "associate",
    "corporate-marketing": "corporate",
    "technical-team": "technical",
    "solution-team": "solution",
    "solutions-team": "solution",
    "quotation-team": "quotation-team",
    "payments-team": "payments-team",
  };
  if (exact[d]) return exact[d];

  if (d.includes("assoicate") || d.includes("associate") || d.includes("assoc"))
    return "associate";
  if (d.includes("field")) return "field";
  if (d.includes("corporate")) return "corporate";
  if (d.includes("technical")) return "technical";
  if (d.includes("solution")) return "solution";
  if (d.includes("quotation")) return "quotation-team";
  if (d.includes("payment")) return "payments-team";
  if (d.includes("tele")) return "tele";

  if (r.includes("associate")) return "associate";
  if (r.includes("field")) return "field";
  if (r.includes("corporate")) return "corporate";
  if (r.includes("technical")) return "technical";
  if (r.includes("solution")) return "solution";
  if (r.includes("quotation")) return "quotation-team";
  if (r.includes("payment")) return "payments-team";
  if (r.includes("tele")) return "tele";

  return "tele";
}
const isIpqsHead = (u) =>
  norm(u?.department_id || u?.department_name) === "ipqshead" &&
  norm(u?.role_id || u?.role_name) === "ipqshead";
const isHead = (u) => norm(u?.role_id || u?.role_name).includes("-head");

function readAuthUser() {
  const raw =
    window.localStorage.getItem("auth_user") ||
    window.sessionStorage.getItem("auth_user");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

const GROUP_LABEL_TYPO_SX = { fontSize: 13, fontWeight: 700, letterSpacing: '0.5px', whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

const LS_KEYS = {
  all: "msn-openAll",
  tele: "msn-openTele",
  field: "msn-openField",
  assoc: "msn-openAssoc",
  corp: "msn-openCorp",
  tech: "msn-openTech",
  sol: "msn-openSol",
  qteam: "msn-openQTeam",
  payteam: "msn-openPayTeam",
};
const getLSBool = (k, fallback) => {
  const v = window.localStorage.getItem(k);
  return v === null ? fallback : v === "true";
};
const setLSBool = (k, v) => window.localStorage.setItem(k, String(v));

// --- STYLING CONSTANTS ---
const activeGradient = "linear-gradient(90deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.8) 100%)";
const activeShadow = "0 4px 20px rgba(37, 99, 235, 0.4)";
const hoverBg = "rgba(255, 255, 255, 0.05)";
const textSecondary = "rgba(255, 255, 255, 0.6)";
const borderLight = "rgba(255, 255, 255, 0.08)";

/* ------------ NavItem ------------ */
const NavItem = ({ to, icon, label, noBgOnSelect = false, onNavigate }) => {
  const location = useLocation();
  const active = useMemo(() => location.pathname.startsWith(to), [location, to]);

  return (
    <ListItemButton
      component={NavLink}
      to={to}
      onClick={onNavigate}
      selected={active}
      sx={{
        borderRadius: '12px',
        mb: 0.8,
        mx: 1.5,
        color: textSecondary,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: 'relative',
        overflow: 'hidden',
        "&:hover": {
          bgcolor: hoverBg,
          color: "#fff",
          "& .MuiListItemIcon-root": { color: "#fff", transform: "translateX(3px)" }
        },
        "&.Mui-selected": {
          background: noBgOnSelect ? "transparent" : activeGradient,
          color: "#fff",
          boxShadow: noBgOnSelect ? "none" : activeShadow,
          backdropFilter: 'blur(5px)',
          "& .MuiListItemIcon-root": { color: "#fff" },
          "&:hover": {
            background: noBgOnSelect ? "transparent" : activeGradient,
          },
          "& .MuiListItemText-primary": { fontWeight: 600 }
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 40, color: 'inherit', transition: 'transform 0.2s' }}>{icon}</ListItemIcon>
      <ListItemText primary={label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
    </ListItemButton>
  );
};

/* ------------ Collapsible Group ------------ */
const Group = ({ title, icon, basePath, open, setOpen, selected, onNavigate, items }) => (
  <>
    <ListItemButton
      onClick={() => setOpen((p) => !p)}
      selected={selected}
      sx={{
        borderRadius: '12px',
        mb: 0.5,
        mx: 1,
        color: textSecondary,
        transition: "all 0.2s",
        "&:hover": {
          bgcolor: hoverBg,
          color: "#fff",
          "& .MuiListItemIcon-root": { color: "#fff" }
        },
        "&.Mui-selected": {
          bgcolor: "rgba(59, 130, 246, 0.1)",
          color: "#60a5fa",
          "& .MuiListItemIcon-root": { color: "#60a5fa" },
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{icon}</ListItemIcon>
      <ListItemText primary={title} primaryTypographyProps={GROUP_LABEL_TYPO_SX} />
      {open ? <ExpandLess sx={{ opacity: 0.7 }} /> : <ExpandMore sx={{ opacity: 0.7 }} />}
    </ListItemButton>

    <Collapse in={open}>
      <Box sx={{ pl: 1, position: 'relative' }}>
        {/* Thread line visual */}
        <Box sx={{ 
            position: 'absolute', left: '29px', top: '4px', bottom: '15px', 
            width: '2px', bgcolor: 'rgba(255,255,255,0.05)', zIndex: 0, borderRadius: '4px'
        }} />
        {items.map(({ path, icon: itemIcon, label }) => (
          <NavItem key={path} to={`${basePath}${path}`} icon={itemIcon} label={label} noBgOnSelect={false} onNavigate={onNavigate} />
        ))}
      </Box>
    </Collapse>
  </>
);

/* =============================================== */
export default function MarketingSideNav({ onNavigate = () => {} }) {
  const location = useLocation();
  const { pathname } = location;

  const user = readAuthUser() || {};
  const userSlug = detectTeamSlug(user?.department_id || user?.department_name, user?.role_id || user?.role_name);
  const showAll = isIpqsHead(user);
  const userIsHead = isHead(user) || showAll;

  // active checks
  const teleActive = /\/marketing\/tele\//.test(pathname);
  const fieldActive = /\/marketing\/field\//.test(pathname);
  const assocActive = /\/marketing\/associate\//.test(pathname);
  const corpActive = /\/marketing\/corporate\//.test(pathname);
  const techActive = /\/marketing\/technical\//.test(pathname);
  const solActive = /\/marketing\/solution\//.test(pathname);
  const qTeamActive = pathname.startsWith("/marketing/quotation-team/");
  const payTeamActive = pathname.startsWith("/marketing/payments-team/");
  const quoteBuilderActive = pathname.startsWith("/marketing/quotation-builder");
  const savedQuotesActive = pathname.startsWith("/marketing/saved-quotations");

  const anyAllActive =
    teleActive || fieldActive || assocActive || corpActive || techActive || solActive ||
    qTeamActive || payTeamActive || quoteBuilderActive || savedQuotesActive;

  // open state
  const [openAll, setOpenAll] = useState(() => getLSBool(LS_KEYS.all, anyAllActive || true));
  const [openTele, setOpenTele] = useState(() => getLSBool(LS_KEYS.tele, teleActive));
  const [openField, setOpenField] = useState(() => getLSBool(LS_KEYS.field, fieldActive));
  const [openAssoc, setOpenAssoc] = useState(() => getLSBool(LS_KEYS.assoc, assocActive));
  const [openCorp, setOpenCorp] = useState(() => getLSBool(LS_KEYS.corp, corpActive));
  const [openTech, setOpenTech] = useState(() => getLSBool(LS_KEYS.tech, techActive));
  const [openSol, setOpenSol] = useState(() => getLSBool(LS_KEYS.sol, solActive));
  const [openQTeam, setOpenQTeam] = useState(() => getLSBool(LS_KEYS.qteam, qTeamActive));
  const [openPayTeam, setOpenPayTeam] = useState(() => getLSBool(LS_KEYS.payteam, payTeamActive));

  useEffect(() => setLSBool(LS_KEYS.all, openAll), [openAll]);
  useEffect(() => setLSBool(LS_KEYS.tele, openTele), [openTele]);
  useEffect(() => setLSBool(LS_KEYS.field, openField), [openField]);
  useEffect(() => setLSBool(LS_KEYS.assoc, openAssoc), [openAssoc]);
  useEffect(() => setLSBool(LS_KEYS.corp, openCorp), [openCorp]);
  useEffect(() => setLSBool(LS_KEYS.tech, openTech), [openTech]);
  useEffect(() => setLSBool(LS_KEYS.sol, openSol), [openSol]);
  useEffect(() => setLSBool(LS_KEYS.qteam, openQTeam), [openQTeam]);
  useEffect(() => setLSBool(LS_KEYS.payteam, openPayTeam), [openPayTeam]);

  useEffect(() => {
    setOpenAll((prev) => prev || anyAllActive);
    setOpenTele((prev) => prev || teleActive);
    setOpenField((prev) => prev || fieldActive);
    setOpenAssoc((prev) => prev || assocActive);
    setOpenCorp((prev) => prev || corpActive);
    setOpenTech((prev) => prev || techActive);
    setOpenSol((prev) => prev || solActive);
    setOpenQTeam((prev) => prev || qTeamActive);
    setOpenPayTeam((prev) => prev || payTeamActive);
  }, [anyAllActive, teleActive, fieldActive, assocActive, corpActive, techActive, solActive, qTeamActive, payTeamActive]);

  // --- STANDARD ITEMS ---
  const mkTeamItems = (includeMyTeam) => {
    const items = [
      { path: "/dashboard", icon: <SpaceDashboardOutlinedIcon />, label: "Dashboard" },
      { path: "/leads", icon: <AssignmentTurnedInOutlinedIcon />, label: "Leads" },
      { path: "/follow-ups", icon: <AssignmentTurnedInOutlinedIcon />, label: "Follow-Up's" },
    ];
    if (includeMyTeam) {
      items.splice(2, 0, { path: "/my-team", icon: <GroupOutlinedIcon />, label: "My Team" });
    }
    return items;
  };
  
  const stdItemsForUser = mkTeamItems(userIsHead);

  // --- CUSTOM TECHNICAL TEAM ITEMS ---
  // UPDATED: Now "Visit Planner" is hidden for regular employees (isHeadView = false)
  const techTeamItems = (isHeadView) => [
    { path: "/dashboard", icon: <SpaceDashboardOutlinedIcon />, label: "Dashboard" },
    ...(isHeadView ? [
      { path: "/team-manager", icon: <GroupsOutlinedIcon />, label: "Team Manager" },
      { path: "/visit-planner", icon: <EditCalendarOutlinedIcon />, label: "Visit Planner" }
    ] : []),
    { path: "/customer-visit", icon: <FactCheckOutlinedIcon />, label: "Customer Visit" },
    { path: "/reimbursement", icon: <ReceiptLongOutlinedIcon />, label: "Reimbursement" },
  ];

  // --- CUSTOM FIELD MARKETING ITEMS ---
  const fieldTeamItems = (isHeadView) => [
    { path: "/dashboard", icon: <SpaceDashboardOutlinedIcon />, label: "Dashboard" },
    { path: "/leadinfo", icon: <DescriptionOutlinedIcon />, label: "My Leads" },
    { path: "/my-activity", icon: <DescriptionOutlinedIcon />, label: "My Activity" },
    { path: "/pending-followup", icon: <AssignmentTurnedInOutlinedIcon />, label: "Pending Follow-up" },
    { path: "/lead-manager", icon: <ManageAccountsIcon />, label: "Lead Manager" }, 
    ...mkTeamItems(isHeadView).filter(i => i.path !== "/dashboard" && i.path !== "/follow-ups")
  ];

  const hideQuotationBuilder =
    norm(user?.role_id || "").includes("quotation-team-head") ||
    norm(user?.role_id || "").includes("payments-team-head") ||
    userSlug === "technical";

  return (
    <Box 
      sx={{ 
        height: "100%", 
        display: "flex", 
        flexDirection: "column",
        background: "linear-gradient(to bottom right, #131129, #1a1625)",
        borderRight: `1px solid ${borderLight}`,
        color: "#fff",
        overflowY: "auto",
        "&::-webkit-scrollbar": { width: "4px" },
        "&::-webkit-scrollbar-track": { background: "transparent" },
        "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.15)", borderRadius: "4px" }
      }}
    >
      {/* Header / Logo */}
      <Box sx={{ px: 3, py: 3, display: "flex", alignItems: "center", justifyContent: "flex-start", position: 'relative' }}>
        {/* Glow effect behind logo */}
        <Box sx={{
           position: 'absolute', top: '20px', left: '20px', width: '60px', height: '60px',
           background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(0,0,0,0) 70%)',
           filter: 'blur(20px)', zIndex: 0
        }} />
        <Box component={NavLink} to="/marketing" onClick={onNavigate}
             sx={{ display: "inline-flex", alignItems: "center", textDecoration: "none", zIndex: 1 }}>
          <Box component="img" src={logoUrl} alt="Company logo" loading="lazy"
               sx={{ 
                 height: { xs: 40, sm: 46, md: 50 }, 
                 width: "auto", 
                 maxWidth: "100%", 
                 display: "block", 
                 objectFit: "contain", 
                 filter: "brightness(0) invert(1) drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))" 
               }} />
        </Box>
      </Box>

      <Divider sx={{ borderColor: borderLight, mb: 2, mx: 2 }} />

      <Box sx={{ px: 3, pb: 1, color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
        Main Menu
      </Box>

      <List sx={{ px: 1 }}>
        {userSlug === "payments-team" && (
          <Group title="Payments Team" icon={<PaidOutlinedIcon />} basePath="/marketing/payments-team"
                 open={openPayTeam} setOpen={setOpenPayTeam} selected={pathname.startsWith("/marketing/payments-team/")}
                 onNavigate={onNavigate} items={[
                   { path: "/q-payments", icon: <PaidOutlinedIcon />, label: "All Payments" },
                   { path: "/q-invoices", icon: <ReceiptLongOutlinedIcon />, label: "Invoices" },
                 ]} />
        )}

        {userSlug === "quotation-team" && (
          <Group title="Quotation Team" icon={<DescriptionOutlinedIcon />} basePath="/marketing/quotation-team"
                 open={openQTeam} setOpen={setOpenQTeam} selected={pathname.startsWith("/marketing/quotation-team/")}
                 onNavigate={onNavigate} items={[
                   { path: "/all-quotations", icon: <RequestQuoteOutlinedIcon />, label: "All Quotations" },
                 ]} />
        )}

        {isIpqsHead(user) ? (
          <>
            <ListItemButton 
              onClick={() => setOpenAll((p) => !p)} 
              sx={{ 
                borderRadius: '12px', mb: 0.5, mx: 1, color: textSecondary, 
                "&:hover": { bgcolor: hoverBg, color: "#fff" } 
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}><CampaignOutlinedIcon /></ListItemIcon>
              <ListItemText primary="All Departments" primaryTypographyProps={{fontWeight: 700, fontSize: '0.9rem'}} />
              {openAll ? <ExpandLess sx={{ color: 'rgba(255,255,255,0.5)' }} /> : <ExpandMore sx={{ color: 'rgba(255,255,255,0.5)' }} />}
            </ListItemButton>

            <NavItem to="/marketing/masterleads" icon={<AssignmentTurnedInOutlinedIcon />} label="Master Leads" onNavigate={onNavigate} />

            <Collapse in={openAll}>
              <Box sx={{ pl: 0 }}> 
                <Group title="Tele Marketing" icon={<SupportAgentOutlinedIcon />} basePath="/marketing/tele"
                      open={openTele} setOpen={setOpenTele} selected={/\/marketing\/tele\//.test(pathname)}
                      onNavigate={onNavigate} items={mkTeamItems(true)} />
                
                <Group title="Field Marketing" icon={<MapOutlinedIcon />} basePath="/marketing/field"
                      open={openField} setOpen={setOpenField} selected={/\/marketing\/field\//.test(pathname)}
                      onNavigate={onNavigate} items={fieldTeamItems(true)} />

                <Group title="Associate Marketing" icon={<GroupsOutlinedIcon />} basePath="/marketing/associate"
                      open={openAssoc} setOpen={setOpenAssoc} selected={/\/marketing\/associate\//.test(pathname)}
                      onNavigate={onNavigate} items={fieldTeamItems(true)} />

                <Group title="Corporate Marketing" icon={<CorporateFareOutlinedIcon />} basePath="/marketing/corporate"
                      open={openCorp} setOpen={setOpenCorp} selected={/\/marketing\/corporate\//.test(pathname)}
                      onNavigate={onNavigate} items={fieldTeamItems(true)} />
                
                <Group title="Technical Team" icon={<BuildOutlinedIcon />} basePath="/marketing/technical"
                      open={openTech} setOpen={setOpenTech} selected={/\/marketing\/technical\//.test(pathname)}
                      onNavigate={onNavigate} items={techTeamItems(true)} />
                
                <Group title="Solution Team" icon={<LightbulbOutlinedIcon />} basePath="/marketing/solution"
                      open={openSol} setOpen={setOpenSol} selected={/\/marketing\/solution\//.test(pathname)}
                      onNavigate={onNavigate} items={mkTeamItems(true)} />

                {!hideQuotationBuilder && (
                  <>
                    <NavItem to="/marketing/quotation-builder" icon={<RequestQuoteOutlinedIcon />} label="Quotation Builder" onNavigate={onNavigate} />
                    <NavItem to="/marketing/saved-quotations" icon={<DescriptionOutlinedIcon />} label="Saved Quotations" onNavigate={onNavigate} />
                  </>
                )}

                <Group title="Quotation Team" icon={<DescriptionOutlinedIcon />} basePath="/marketing/quotation-team"
                      open={openQTeam} setOpen={setOpenQTeam} selected={pathname.startsWith("/marketing/quotation-team/")}
                      onNavigate={onNavigate} items={[{ path: "/all-quotations", icon: <RequestQuoteOutlinedIcon />, label: "All Quotations" }]} />

                <Group title="Payments Team" icon={<PaidOutlinedIcon />} basePath="/marketing/payments-team"
                      open={openPayTeam} setOpen={setOpenPayTeam} selected={pathname.startsWith("/marketing/payments-team/")}
                      onNavigate={onNavigate} items={[
                        { path: "/q-payments", icon: <PaidOutlinedIcon />, label: "Q-Payments" },
                        { path: "/q-invoices", icon: <ReceiptLongOutlinedIcon />, label: "Q-Invoices" },
                      ]} />
              </Box>
            </Collapse>
          </>
        ) : (
          <>
            {userSlug === "tele" && (
              <Group title="Tele Marketing" icon={<SupportAgentOutlinedIcon />} basePath="/marketing/tele"
                     open={openTele} setOpen={setOpenTele} selected={/\/marketing\/tele\//.test(pathname)}
                     onNavigate={onNavigate} items={stdItemsForUser} />
            )}

            {userSlug === "field" && (
              <Group title="Field Marketing" icon={<MapOutlinedIcon />} basePath="/marketing/field"
                     open={openField} setOpen={setOpenField} selected={/\/marketing\/field\//.test(pathname)}
                     onNavigate={onNavigate} items={fieldTeamItems(userIsHead)} />
            )}

            {userSlug === "associate" && (
              <Group title="Associate Marketing" icon={<GroupsOutlinedIcon />} basePath="/marketing/associate"
                     open={openAssoc} setOpen={setOpenAssoc} selected={/\/marketing\/associate\//.test(pathname)}
                     onNavigate={onNavigate} items={fieldTeamItems(userIsHead)} />
            )}
            {userSlug === "corporate" && (
              <Group title="Corporate Marketing" icon={<CorporateFareOutlinedIcon />} basePath="/marketing/corporate"
                     open={openCorp} setOpen={setOpenCorp} selected={/\/marketing\/corporate\//.test(pathname)}
                     onNavigate={onNavigate} items={fieldTeamItems(userIsHead)} />
            )}
            
            {userSlug === "technical" && (
              <Group title="Technical Team" icon={<BuildOutlinedIcon />} basePath="/marketing/technical"
                     open={openTech} setOpen={setOpenTech} selected={/\/marketing\/technical\//.test(pathname)}
                     onNavigate={onNavigate} items={techTeamItems(userIsHead)} />
            )}
            
            {userSlug === "solution" && (
              <Group title="Solution Team" icon={<LightbulbOutlinedIcon />} basePath="/marketing/solution"
                     open={openSol} setOpen={setOpenSol} selected={/\/marketing\/solution\//.test(pathname)}
                     onNavigate={onNavigate} items={stdItemsForUser} />
            )}

            {!hideQuotationBuilder && (
              <>
                <NavItem to="/marketing/quotation-builder" icon={<RequestQuoteOutlinedIcon />} label="Quotation Builder" onNavigate={onNavigate} />
                <NavItem to="/marketing/saved-quotations" icon={<DescriptionOutlinedIcon />} label="Saved Quotations" onNavigate={onNavigate} />
              </>
            )}
          </>
        )}
      </List>

      <Box sx={{ flex: 1 }} />
      <Divider sx={{ borderColor: borderLight, mx: 2 }} />
      <Box sx={{ p: 2, fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: 'center', letterSpacing: '0.5px' }}>© 2025 CRMS v2.0</Box>
    </Box>
  );
}