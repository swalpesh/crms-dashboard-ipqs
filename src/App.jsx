import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

// Auth / entry pages
import LoginPage from "./pages/LoginPage.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import TwoStepVerification from "./pages/TwoStepVerification.jsx";
import Lock from "./pages/LockScreen.jsx";
import Logout from "./pages/Logout.jsx";

// Super Admin
import SuperAdminLayout from "./layouts/SuperAdminLayout.jsx";
import SaDashboard from "./pages/superadmin/SaDashboard.jsx";
import SaEmployees from "./pages/superadmin/SaEmployees.jsx";
import SaRoles from "./pages/superadmin/SaRoles.jsx";
import SaDepartments from "./pages/superadmin/SaDepartments.jsx";

// Marketing
import MarketingLayout from "./layouts/MarketingLayout.jsx";
import Contacts from "./pages/marketing/Contacts.jsx";
import Companies from "./pages/marketing/Companies.jsx";
import Leads from "./pages/marketing/Leads.jsx";
import QuotationBuilder from "./pages/employee/QuotationBuilder.jsx";
import LeadDetail from "./pages/marketing/LeadDetail.jsx";
import TechnicalCustomerProfile from "./pages/marketing/TechnicalCustomerProfile.jsx";
import TechnicalVisitPlanner from "./pages/marketing/TechnicalVisitPlanner.jsx";
import TechnicalReimbursement from "./pages/marketing/TechnicalReimbursement.jsx"; 

// Shared Marketing Imports
import TeamInfo from "./pages/marketing/TeamInfo.jsx";
import LeadInfo from "./pages/marketing/LeadInfo.jsx";
import CustomerInfo from "./pages/marketing/CustomerInfo.jsx";
import MyActivity from "./pages/marketing/MyActivity.jsx";
import PendingFollowup from "./pages/marketing/PendingFollowup.jsx"; 
import FieldFollowUps from "./pages/marketing/FieldFollowUps.jsx";
import LeadManager from "./pages/marketing/LeadManager.jsx"; 
import SolarRequests from "./pages/marketing/SolarRequests.jsx"; 

// --- NEW IMPORTS: Reimbursement Department ---
import ReimbursementDashboard from "./pages/marketing/ReimbursementDashboard.jsx"; 
import VouchersList from "./pages/marketing/ReimbursementVouchers.jsx"; 
import VoucherDetail from "./pages/marketing/VoucherDetail.jsx";
import EmployeeProfiles from "./pages/marketing/EmployeeProfiles.jsx";
import EmployeeDetail from "./pages/marketing/EmployeeDetail.jsx";

// Tele
import TeleDashboard from "./pages/marketing/TeleDashboard.jsx";
import TeleLeads from "./pages/marketing/TeleLeads.jsx";
import TeleMyTeam from "./pages/marketing/TeleMyTeam.jsx";
import TeleFollowUps from "./pages/marketing/TeleFollowUps.jsx";

// Field
import FieldDashboard from "./pages/marketing/FieldDashboard.jsx";
import FieldLeads from "./pages/marketing/FieldLeads.jsx";
import FieldMyTeam from "./pages/marketing/FieldMyTeam.jsx";

// Corporate
import CorporateDashboard from "./pages/marketing/CorporateDashboard.jsx";
import CorporateLeads from "./pages/marketing/CorporateLeads.jsx";
import CorporateMyTeam from "./pages/marketing/CorporateMyTeam.jsx";
import CorporateFollowUps from "./pages/marketing/CorporateFollowUps.jsx";
import CorporateLeadinfo from "./pages/marketing/CorporateLeadinfo.jsx";
import CorporateLeadManager from "./pages/marketing/CorporateLeadManager.jsx";
import CorporateMyActivity from "./pages/marketing/CorporateMyActivity.jsx";

// Associate
import AssociateDashboard from "./pages/marketing/AssociateDashboard.jsx";
import AssociateLeads from "./pages/marketing/AssociateLeads.jsx";
import AssociateMyTeam from "./pages/marketing/AssociateMyTeam.jsx";
import AssociateFollowUps from "./pages/marketing/AssociateFollowUps.jsx";
import AssociateLeadinfo from "./pages/marketing/AssociateLeadinfo.jsx";
import AssociateLeadManager from "./pages/marketing/AssociateLeadmanager.jsx";
import AssociateMyActivity from "./pages/marketing/AssociateMyactivity.jsx";

// Technical
import TechnicalDashboard from "./pages/marketing/TechnicalDashboard.jsx";
import TechnicalLeads from "./pages/marketing/TechnicalLeads.jsx";
import TechnicalMyTeam from "./pages/marketing/TechnicalMyTeam.jsx";
import TechnicalFollowUps from "./pages/marketing/TechnicalFollowUps.jsx";
import TechnicalCustomerVisit from "./pages/marketing/TechnicalCustomerVisit.jsx"; 

// Solution
import SolutionDashboard from "./pages/marketing/SolutionDashboard.jsx";
import SolutionLeads from "./pages/marketing/SolutionLeads.jsx";
import SolutionMyTeam from "./pages/marketing/SolutionMyTeam.jsx";
import SolutionFollowUps from "./pages/marketing/SolutionFollowUps.jsx";

// Quotation & Payments
import QuotationTeamAllQuotations from "./pages/marketing/Quotations.jsx"; 
import SavedQuotations from "./pages/marketing/SavedQuotations.jsx";
import PurchaseOrder from "./pages/marketing/PurchaseOrder.jsx";
import QuotationTeamDashboard from "./pages/marketing/QuotationDashboard.jsx";

import PaymentsTeamQPayments from "./pages/marketing/Payments.jsx";
import PaymentsTeamQInvoices from "./pages/marketing/Invoices.jsx";

// --- Nagpur Associates ---
import NagpurDashboard from "./pages/marketing/NagpurAssosiatesDashboard.jsx"; 
import NagpurMyLeads from "./pages/marketing/NagpurAssociatesMyLeads.jsx";
import NagpurMyActivity from "./pages/marketing/NagpurAssociatesMyactivity.jsx";
import NagpurPendingFollowUp from "./pages/marketing/NagpurAssociatesPendingFollowUp.jsx";
import NagpurLeadManager from "./pages/marketing/NagpurAssociatesLeadManager.jsx";
import NagpurMyTeam from "./pages/marketing/NagpurAssociatesMyTeam.jsx";

// --- Silverline Associates ---
import SilverlineDashboard from "./pages/marketing/SilverlineAssociatesDashboard.jsx";
import SilverlineMyLeads from "./pages/marketing/SilverlineAssociatesMyLeads.jsx";
import SilverlineMyActivity from "./pages/marketing/SilverlineAssociatesMyactivity.jsx";
import SilverlinePendingFollowUp from "./pages/marketing/SilverlineAssociatesPendingFollowUp.jsx";
import SilverlineLeadManager from "./pages/marketing/SilverlineAssociatesLeadManager.jsx";
import SilverlineMyTeam from "./pages/marketing/SilverlineAssociatesMyTeam.jsx";

// --- Trafo Associates ---
import TrafoDashboard from "./pages/marketing/TrafoAssosiatesDashboard.jsx"; 
import TrafoMyLeads from "./pages/marketing/TrafoAssociatesMyLeads.jsx";
import TrafoMyActivity from "./pages/marketing/TrafoAssociatesMyactivity.jsx"; 
import TrafoPendingFollowUp from "./pages/marketing/TrafoAssociatesPendingFollowUp.jsx";
import TrafoLeadManager from "./pages/marketing/TrafoAssociatesLeadManager.jsx";
import TrafoMyTeam from "./pages/marketing/TrafoAssociatesMyTeam.jsx";

// --- YK Associates ---
import YKDashboard from "./pages/marketing/YKAssociatesDashboard.jsx";
import YKMyLeads from "./pages/marketing/YKAssociatesMyLeads.jsx";
import YKMyActivity from "./pages/marketing/YKAssociatesMyactivity.jsx"; 
import YKPendingFollowUp from "./pages/marketing/YKAssociatesPendingFollowUp.jsx";
import YKLeadManager from "./pages/marketing/YKAssociatesLeadManager.jsx";
import YKMyTeam from "./pages/marketing/YKAssociatesMyTeam.jsx";

// --- NEW IMPORTS: Kolhapur Associates ---
import KolhapurDashboard from "./pages/marketing/KolhapurAssociatesDashboard.jsx";
import KolhapurMyLeads from "./pages/marketing/KolhapurAssociateLeadinfo.jsx";
import KolhapurMyActivity from "./pages/marketing/KolhapurAssociatesMyactivity.jsx"; 
import KolhapurPendingFollowUp from "./pages/marketing/KolhapurAssociatesPendingFollowup.jsx";
import KolhapurLeadManager from "./pages/marketing/KolhapurAssociatesLeadManager.jsx";
import KolhapurMyTeam from "./pages/marketing/KolhapurAssociateMyTeam.jsx";

// Employee legacy (optional)
import EmployeeLayout from "./layouts/EmployeeLayout.jsx";
import EmpDashboard from "./pages/employee/EmpDashboard.jsx";
import EmpLeads from "./pages/employee/EmpLeads.jsx";

import TeleLayout from "./layouts/TeleLayout.jsx";
import LegacyTeleDashboard from "./pages/tele/TeleDashboard.jsx";
import LegacyTeleLeads from "./pages/tele/TeleLeads.jsx";
import LeadManagement from "./pages/marketing/leadmanagement.jsx";

/* ---------- helpers ---------- */
function readAuth() {
  const token =
    localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
  const role =
    localStorage.getItem("auth_role") || sessionStorage.getItem("auth_role");
  const rawUser =
    localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");
  let user = null;
  try { user = rawUser ? JSON.parse(rawUser) : null; } catch {}
  return { token, role, user };
}

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
    "reimbursement-team": "reimbursement", // EXACT MATCH FOR REIMBURSEMENT
  };
  if (exact[d]) return exact[d];

  // 1. SPECIFIC ASSOCIATES FIRST
  if (d.includes("nagpur")) return "nagpur";           
  if (d.includes("silverline")) return "silverline";   
  if (d.includes("trafo")) return "trafo";             
  if (d.includes("yk") || d.includes("y-k")) return "yk"; 
  if (d.includes("kolhapur")) return "kolhapur"; 

  // 2. THEN GENERIC CHECKS
  if (d.includes("reimbursement")) return "reimbursement"; // GENERIC CHECK REIMBURSEMENT
  if (d.includes("assoicate") || d.includes("associate") || d.includes("assoc")) return "associate";
  if (d.includes("field")) return "field";
  if (d.includes("corporate")) return "corporate";
  if (d.includes("technical")) return "technical";
  if (d.includes("solution")) return "solution";
  if (d.includes("quotation")) return "quotation-team";
  if (d.includes("payment")) return "payments-team";
  if (d.includes("tele")) return "tele";

  // 3. FALLBACK ROLE CHECKS
  if (r.includes("nagpur")) return "nagpur";           
  if (r.includes("silverline")) return "silverline";   
  if (r.includes("trafo")) return "trafo";             
  if (r.includes("yk") || r.includes("y-k")) return "yk"; 
  if (r.includes("kolhapur")) return "kolhapur"; 

  if (r.includes("reimbursement")) return "reimbursement"; // ROLE CHECK REIMBURSEMENT
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

function isIpqsHead(user) {
  return norm(user?.department_id || user?.department_name) === "ipqshead" &&
         norm(user?.role_id || user?.role_name) === "ipqshead";
}
function isHead(user) {
  return norm(user?.role_id || user?.role_name).includes("-head");
}

function readUserFromToken() {
  const token =
    localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || ""));
    return {
      department_id: payload.department_id,
      department_name: payload.department_name,
      role_id: payload.role_id,
      role_name: payload.role_name,
      email: payload.email,
      username: payload.username,
      employee_id: payload.employee_id || payload.sub,
    };
  } catch {
    return null;
  }
}

function defaultDeptLanding(u) {
  const dept = u?.department_id || u?.department_name;
  const role = u?.role_id || u?.role_name;
  const slug = detectTeamSlug(dept, role);
  
  if (slug === "tele") return "/marketing/tele/leads";
  if (slug === "quotation-team") return "/marketing/quotation-team/dashboard";
  if (slug === "payments-team") return "/marketing/payments-team/q-payments";
  if (slug === "ipqshead") return "/marketing";
  
  return `/marketing/${slug}/dashboard`;
}

function marketingHome() {
  const { user } = readAuth();
  const u = user || readUserFromToken();
  if (!u) return "/logout";
  return defaultDeptLanding(u);
}

function RequireAuth() {
  const { token } = readAuth();
  if (!token) return <Navigate to="/logout" replace />;
  return <Outlet />;
}

function RequireEmployee() {
  const { token, role, user } = readAuth();
  if (!token) return <Navigate to="/logout" replace />;
  const isSA =
    role === "superadmin" || user?.role === "superadmin" || user?.is_superadmin;
  if (isSA) return <Navigate to="/super-admin" replace />;
  return <Outlet />;
}

function RequireSuperAdmin() {
  const { token, role, user } = readAuth();
  if (!token) return <Navigate to="/logout" replace />;
  const isSA =
    role === "superadmin" || user?.role === "superadmin" || user?.is_superadmin;
  if (!isSA) {
    const u = user || readUserFromToken();
    return <Navigate to={defaultDeptLanding(u)} replace />;
  }
  return <Outlet />;
}

function RequireDeptAccess({ slug, redirectTo }) {
  const { token, user } = readAuth();
  if (!token) return <Navigate to="/logout" replace />;
  const u = user || readUserFromToken();
  if (isIpqsHead(u)) return <Outlet />;
  const userSlug = detectTeamSlug(u?.department_id || u?.department_name, u?.role_id || u?.role_name);
  if (userSlug !== slug) {
    return <Navigate to={redirectTo || defaultDeptLanding(u)} replace />;
  }
  return <Outlet />;
}

function RequireHead({ redirectTo }) {
  const { token, user } = readAuth();
  if (!token) return <Navigate to="/logout" replace />;
  const u = user || readUserFromToken();
  if (isIpqsHead(u) || isHead(u)) return <Outlet />;
  return <Navigate to={redirectTo || defaultDeptLanding(u)} replace />;
}

function MarketingIndex() {
  const { token, user } = readAuth();
  if (!token) return <Navigate to="/logout" replace />;
  const u = user || readUserFromToken();
  if (isIpqsHead(u)) return null;
  return <Navigate to={defaultDeptLanding(u)} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Navigate to="/login" replace />} />

        {/* PUBLIC */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/two-step" element={<TwoStepVerification />} />
        <Route path="/lock" element={<Lock />} />
        <Route path="/logout" element={<Logout />} />

        {/* PROTECTED */}
        <Route element={<RequireAuth />}>
          {/* MARKETING */}
          <Route element={<RequireEmployee />}>
            <Route path="/marketing" element={<MarketingLayout />}>
              <Route index element={<MarketingIndex />} />

              {/* SHARED ROUTES */}
              <Route path="customer-info/:id" element={<CustomerInfo />} />
              <Route path="my-activity" element={<MyActivity />} />
              <Route path="lead/:id" element={<LeadDetail />} />
              <Route path="masterleads" element={<Leads />} />
              <Route path="lead-management" element={<LeadManagement />} />
              <Route path="quote-followups" element={<SolarRequests />} /> 
              <Route path="contacts" element={<Contacts />} />
              <Route path="companies" element={<Companies />} />
              <Route path="quotation-builder" element={<QuotationBuilder />} />
              <Route path="saved-quotations" element={<SavedQuotations />} />

              {/* --- NEW: Reimbursement Department --- */}
              <Route element={<RequireDeptAccess slug="reimbursement" />}>
                <Route path="reimbursement/dashboard" element={<ReimbursementDashboard />} />
                <Route path="reimbursement/vouchers" element={<VouchersList />} />
                <Route path="reimbursement/vouchers/:id" element={<VoucherDetail />} />
                <Route path="reimbursement/employees" element={<EmployeeProfiles />} />
                <Route path="reimbursement/employees/:id" element={<EmployeeDetail />} />
              </Route>

              {/* Tele */}
              <Route element={<RequireDeptAccess slug="tele" />}>
                <Route path="tele/dashboard" element={<TeleDashboard />} />
                <Route path="tele/leads" element={<TeleLeads />} />
                <Route path="tele/follow-ups" element={<TeleFollowUps />} />
                <Route element={<RequireHead redirectTo="/marketing/tele/leads" />}>
                  <Route path="tele/my-team" element={<TeleMyTeam />} />
                </Route>
              </Route>

              {/* Field */}
              <Route element={<RequireDeptAccess slug="field" />}>
                <Route path="field/dashboard" element={<FieldDashboard />} />
                <Route path="field/leads" element={<FieldLeads />} />
                <Route path="field/leadinfo" element={<LeadInfo />} />
                <Route path="field/my-activity" element={<MyActivity />} />
                <Route path="field/pending-followup" element={<PendingFollowup />} /> 
                <Route path="field/follow-ups" element={<FieldFollowUps />} />
                <Route path="field/reimbursement" element={<TechnicalReimbursement />} />
                <Route element={<RequireHead redirectTo="/marketing/field/dashboard" />}>
                  <Route path="field/lead-manager" element={<LeadManager />} /> 
                  <Route path="field/my-team" element={<FieldMyTeam />} />
                </Route>
              </Route>

              {/* Associate */}
              <Route element={<RequireDeptAccess slug="associate" />}>
                <Route path="associate/dashboard" element={<AssociateDashboard />} />
                <Route path="associate/leads" element={<AssociateLeads />} />
                <Route path="associate/my-activity" element={<AssociateMyActivity />} />
                <Route path="associate/leadinfo" element={<AssociateLeadinfo />} />
                <Route path="associate/pending-followup" element={<AssociateFollowUps />} />
                <Route path="associate/reimbursement" element={<TechnicalReimbursement />} />
                <Route element={<RequireHead redirectTo="/marketing/associate/dashboard" />}>
                  <Route path="associate/lead-manager" element={<AssociateLeadManager />} /> 
                  <Route path="associate/my-team" element={<AssociateMyTeam />} />
                </Route>
              </Route>

              {/* Corporate */}
              <Route element={<RequireDeptAccess slug="corporate" />}>
                <Route path="corporate/dashboard" element={<CorporateDashboard />} />
                <Route path="corporate/leads" element={<CorporateLeads />} />
                <Route path="corporate/my-activity" element={<CorporateMyActivity />} />
                <Route path="corporate/leadinfo" element={<CorporateLeadinfo />} />
                <Route path="corporate/pending-followup" element={<CorporateFollowUps />} />
                <Route path="corporate/reimbursement" element={<TechnicalReimbursement />} />
                <Route element={<RequireHead redirectTo="/marketing/corporate/dashboard" />}>
                  <Route path="corporate/lead-manager" element={<CorporateLeadManager />} /> 
                  <Route path="corporate/my-team" element={<CorporateMyTeam />} />
                </Route>
              </Route>

              {/* Technical */}
              <Route element={<RequireDeptAccess slug="technical" />}>
                <Route path="technical/dashboard" element={<TechnicalDashboard />} />
                <Route path="technical/customer-profile/:id" element={<TechnicalCustomerProfile />} />
                <Route path="technical/customer-visit" element={<TechnicalCustomerVisit />} />
                <Route path="technical/reimbursement" element={<TechnicalReimbursement />} />
                <Route path="technical/leads" element={<TechnicalLeads />} />
                <Route path="technical/follow-ups" element={<TechnicalFollowUps />} />
                <Route element={<RequireHead redirectTo="/marketing/technical/dashboard" />}>
                  <Route path="technical/visit-planner" element={<TechnicalVisitPlanner />} />
                  <Route path="technical/team-manager" element={<TeamInfo />} />
                  <Route path="technical/my-team" element={<TechnicalMyTeam />} />
                </Route>
              </Route>

              {/* Solution */}
              <Route element={<RequireDeptAccess slug="solution" />}>
                <Route path="solution/dashboard" element={<SolutionDashboard />} />
                <Route path="solution/leads" element={<SolutionLeads />} />
                <Route path="solution/follow-ups" element={<SolutionFollowUps />} />
                <Route path="solution/reimbursement" element={<TechnicalReimbursement />} />
                <Route element={<RequireHead redirectTo="/marketing/solution/dashboard" />}>
                  <Route path="solution/my-team" element={<SolutionMyTeam />} />
                </Route>
              </Route>

              {/* Quotation Team */}
              <Route element={<RequireDeptAccess slug="quotation-team" />}>
                <Route path="quotation-team/dashboard" element={<QuotationTeamDashboard />} />
                <Route path="quotation-team/leads" element={<QuotationTeamAllQuotations />} />
                <Route path="quotation-team/purchase-orders" element={<PurchaseOrder />} />
                <Route path="quotation-team/saved-quotations" element={<SavedQuotations />} />
                <Route path="quotation-team/reimbursement" element={<TechnicalReimbursement />} />
              </Route>

              {/* Payments Team */}
              <Route element={<RequireDeptAccess slug="payments-team" />}>
                <Route path="payments-team/q-payments" element={<PaymentsTeamQPayments />} />
                <Route path="payments-team/q-invoices" element={<PaymentsTeamQInvoices />} />
              </Route>

              {/* --- Nagpur Associates (HIDDEN AS REQUESTED) --- */}
              {/* <Route element={<RequireDeptAccess slug="nagpur" />}>
                <Route path="nagpur/dashboard" element={<NagpurDashboard />} />
                <Route path="nagpur/leadinfo" element={<NagpurMyLeads />} />
                <Route path="nagpur/my-leads" element={<NagpurMyLeads />} />
                <Route path="nagpur/my-activity" element={<NagpurMyActivity />} />
                <Route path="nagpur/pending-followup" element={<NagpurPendingFollowUp />} />
                <Route path="nagpur/reimbursement" element={<TechnicalReimbursement />} />
                <Route element={<RequireHead redirectTo="/marketing/nagpur/dashboard" />}>
                  <Route path="nagpur/lead-manager" element={<NagpurLeadManager />} />
                  <Route path="nagpur/my-team" element={<NagpurMyTeam />} />
                </Route>
              </Route>
              */}

              {/* --- Silverline Associates (HIDDEN AS REQUESTED) --- */}
              {/*
              <Route element={<RequireDeptAccess slug="silverline" />}>
                <Route path="silverline/dashboard" element={<SilverlineDashboard />} />
                <Route path="silverline/leadinfo" element={<SilverlineMyLeads />} />
                <Route path="silverline/my-leads" element={<SilverlineMyLeads />} />
                <Route path="silverline/my-activity" element={<SilverlineMyActivity />} />
                <Route path="silverline/pending-followup" element={<SilverlinePendingFollowUp />} />
                <Route path="silverline/reimbursement" element={<TechnicalReimbursement />} />
                <Route element={<RequireHead redirectTo="/marketing/silverline/dashboard" />}>
                  <Route path="silverline/lead-manager" element={<SilverlineLeadManager />} />
                  <Route path="silverline/my-team" element={<SilverlineMyTeam />} />
                </Route>
              </Route>
              */}
              
              {/* --- Trafo Associates --- */}
              <Route element={<RequireDeptAccess slug="trafo" />}>
                <Route path="trafo/dashboard" element={<TrafoDashboard />} />
                <Route path="trafo/leadinfo" element={<TrafoMyLeads />} />
                <Route path="trafo/my-leads" element={<TrafoMyLeads />} />
                <Route path="trafo/my-activity" element={<TrafoMyActivity />} />
                <Route path="trafo/pending-followup" element={<TrafoPendingFollowUp />} />
                <Route path="trafo/reimbursement" element={<TechnicalReimbursement />} />
                <Route element={<RequireHead redirectTo="/marketing/trafo/dashboard" />}>
                  <Route path="trafo/lead-manager" element={<TrafoLeadManager />} />
                  <Route path="trafo/my-team" element={<TrafoMyTeam />} />
                </Route>
              </Route>

              {/* --- YK Associates (HIDDEN AS REQUESTED) --- */}
              {/*
              <Route element={<RequireDeptAccess slug="yk" />}>
                <Route path="yk/dashboard" element={<YKDashboard />} />
                <Route path="yk/leadinfo" element={<YKMyLeads />} />
                <Route path="yk/my-leads" element={<YKMyLeads />} />
                <Route path="yk/my-activity" element={<YKMyActivity />} />
                <Route path="yk/pending-followup" element={<YKPendingFollowUp />} />
                <Route path="yk/reimbursement" element={<TechnicalReimbursement />} />
                <Route element={<RequireHead redirectTo="/marketing/yk/dashboard" />}>
                  <Route path="yk/lead-manager" element={<YKLeadManager />} />
                  <Route path="yk/my-team" element={<YKMyTeam />} />
                </Route>
              </Route>
              */}

              {/* --- NEW: Kolhapur Associates --- */}
              <Route element={<RequireDeptAccess slug="kolhapur" />}>
                <Route path="kolhapur/dashboard" element={<KolhapurDashboard />} />
                <Route path="kolhapur/leadinfo" element={<KolhapurMyLeads />} />
                <Route path="kolhapur/my-leads" element={<KolhapurMyLeads />} />
                <Route path="kolhapur/my-activity" element={<KolhapurMyActivity />} />
                <Route path="kolhapur/pending-followup" element={<KolhapurPendingFollowUp />} />
                <Route path="kolhapur/reimbursement" element={<TechnicalReimbursement />} />
                <Route element={<RequireHead redirectTo="/marketing/kolhapur/dashboard" />}>
                  <Route path="kolhapur/lead-manager" element={<KolhapurLeadManager />} />
                  <Route path="kolhapur/my-team" element={<KolhapurMyTeam />} />
                </Route>
              </Route>

            </Route>
          </Route>

          {/* EMPLOYEE legacy */}
          <Route element={<RequireEmployee />}>
            <Route path="/employee" element={<EmployeeLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<EmpDashboard />} />
              <Route path="leads" element={<EmpLeads />} />
              <Route path="quotation-builder" element={<QuotationBuilder />} />
              <Route path="companies" element={<Companies />} />
              <Route path="contacts" element={<Contacts />} />
            </Route>

            <Route path="/tele" element={<TeleLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<LegacyTeleDashboard />} />
              <Route path="leads" element={<LegacyTeleLeads />} />
              <Route path="companies" element={<Companies />} />
              <Route path="contacts" element={<Contacts />} />
            </Route>
          </Route>

          {/* SUPER ADMIN */}
          <Route element={<RequireSuperAdmin />}>
            <Route path="/super-admin" element={<SuperAdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SaDashboard />} />
              <Route path="employees" element={<SaEmployees />} />
              <Route path="roles" element={<SaRoles />} />
              <Route path="departments" element={<SaDepartments />} />
              
              {/* Additions to Admin Profile */}
              <Route path="dashboard/field" element={<FieldDashboard />} />
              <Route path="dashboard/corporate" element={<CorporateDashboard />} />
              <Route path="dashboard/associate" element={<AssociateDashboard />} />
              <Route path="dashboard/solution" element={<SolutionDashboard />} />
              <Route path="dashboard/quotation" element={<QuotationTeamDashboard />} />
            </Route>
          </Route>
        </Route>

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}