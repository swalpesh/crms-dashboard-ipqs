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
import SavedQuotations from "./pages/marketing/SavedQuotations.jsx";
import LeadDetail from "./pages/marketing/LeadDetail.jsx";
import TechnicalCustomerProfile from "./pages/marketing/TechnicalCustomerProfile.jsx";
import TechnicalVisitPlanner from "./pages/marketing/TechnicalVisitPlanner.jsx";
import TechnicalReimbursement from "./pages/marketing/TechnicalReimbursement.jsx"; 

// --- NEW IMPORTS ---
import TeamInfo from "./pages/marketing/TeamInfo.jsx";
import LeadInfo from "./pages/marketing/LeadInfo.jsx";
import CustomerInfo from "./pages/marketing/CustomerInfo.jsx";
import MyActivity from "./pages/marketing/MyActivity.jsx";
import PendingFollowup from "./pages/marketing/PendingFollowup.jsx"; 
import FieldFollowUps from "./pages/marketing/FieldFollowUps.jsx";
import LeadManager from "./pages/marketing/LeadManager.jsx"; 

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

// Associate
import AssociateDashboard from "./pages/marketing/AssociateDashboard.jsx";
import AssociateLeads from "./pages/marketing/AssociateLeads.jsx";
import AssociateMyTeam from "./pages/marketing/AssociateMyTeam.jsx";
import AssociateFollowUps from "./pages/marketing/AssociateFollowUps.jsx";
import AssociateLeadinfo from "./pages/marketing/AssociateLeadinfo.jsx";
import AssociateLeadManager from "./pages/marketing/AssociateLeadmanager.jsx";

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
import PaymentsTeamQPayments from "./pages/marketing/Payments.jsx";
import PaymentsTeamQInvoices from "./pages/marketing/Invoices.jsx";

// Employee legacy (optional)
import EmployeeLayout from "./layouts/EmployeeLayout.jsx";
import EmpDashboard from "./pages/employee/EmpDashboard.jsx";
import EmpLeads from "./pages/employee/EmpLeads.jsx";

import TeleLayout from "./layouts/TeleLayout.jsx";
import LegacyTeleDashboard from "./pages/tele/TeleDashboard.jsx";
import LegacyTeleLeads from "./pages/tele/TeleLeads.jsx";

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
  };
  if (exact[d]) return exact[d];

  if (d.includes("assoicate") || d.includes("associate") || d.includes("assoc")) return "associate";
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
  if (slug === "quotation-team") return "/marketing/quotation-team/all-quotations";
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
              <Route path="contacts" element={<Contacts />} />
              <Route path="companies" element={<Companies />} />
              <Route path="quotation-builder" element={<QuotationBuilder />} />
              <Route path="saved-quotations" element={<SavedQuotations />} />

              {/* Tele */}
              <Route element={<RequireDeptAccess slug="tele" />}>
                <Route path="tele/dashboard" element={<TeleDashboard />} />
                <Route path="tele/leads" element={<TeleLeads />} />
                <Route element={<RequireHead redirectTo="/marketing/tele/dashboard" />}>
                  <Route path="tele/my-team" element={<TeleMyTeam />} />
                </Route>
                <Route path="tele/follow-ups" element={<TeleFollowUps />} />
              </Route>

              {/* Field */}
              <Route element={<RequireDeptAccess slug="field" />}>
                <Route path="field/dashboard" element={<FieldDashboard />} />
                <Route path="field/leads" element={<FieldLeads />} />
                <Route path="field/leadinfo" element={<LeadInfo />} />
                <Route path="field/my-activity" element={<MyActivity />} />
                
                {/* --- Routes for Follow ups --- */}
                <Route path="field/pending-followup" element={<PendingFollowup />} /> 
                <Route path="field/follow-ups" element={<FieldFollowUps />} />
                
                {/* --- New Lead Manager Route --- */}
                <Route path="field/lead-manager" element={<LeadManager />} /> 
                
                <Route element={<RequireHead redirectTo="/marketing/field/dashboard" />}>
                  <Route path="field/my-team" element={<FieldMyTeam />} />
                </Route>
              </Route>

              {/* Associate */}
              <Route element={<RequireDeptAccess slug="associate" />}>
                <Route path="associate/dashboard" element={<AssociateDashboard />} />
                <Route path="associate/leads" element={<AssociateLeads />} />
                <Route element={<RequireHead redirectTo="/marketing/associate/dashboard" />}>

                  <Route path="associate/my-team" element={<AssociateMyTeam />} />
                </Route>
                <Route path="associate/leadinfo" element={<AssociateLeadinfo />} />
                <Route path="associate/follow-ups" element={<AssociateFollowUps />} />
                <Route path="associate/lead-manager" element={<AssociateLeadManager />} /> 
              </Route>

              {/* Corporate */}
              <Route element={<RequireDeptAccess slug="corporate" />}>
                <Route path="corporate/dashboard" element={<CorporateDashboard />} />
                <Route path="corporate/leads" element={<CorporateLeads />} />
                <Route element={<RequireHead redirectTo="/marketing/corporate/dashboard" />}>
                  <Route path="corporate/my-team" element={<CorporateMyTeam />} />
                </Route>
                <Route path="corporate/leadinfo" element={<CorporateLeadinfo />} />
                <Route path="corporate/lead-manager" element={<CorporateLeadManager />} /> 
                <Route path="corporate/follow-ups" element={<CorporateFollowUps />} />
              </Route>

              {/* Technical */}
              <Route element={<RequireDeptAccess slug="technical" />}>
                <Route path="technical/dashboard" element={<TechnicalDashboard />} />
                
                {/* UPDATED ROUTE: 
                   Changed from exact path to allow optional :id parameter 
                   so the View button navigation works correctly.
                */}
                {/* <Route path="technical/customer-profile" element={<TechnicalCustomerProfile />} /> */}
                <Route path="technical/customer-profile/:id" element={<TechnicalCustomerProfile />} />

                <Route path="technical/customer-visit" element={<TechnicalCustomerVisit />} />
                <Route path="technical/visit-planner" element={<TechnicalVisitPlanner />} />
                <Route path="technical/team-manager" element={<TeamInfo />} />
                <Route path="technical/reimbursement" element={<TechnicalReimbursement />} />
                <Route path="technical/leads" element={<TechnicalLeads />} />
                <Route element={<RequireHead redirectTo="/marketing/technical/dashboard" />}>
                  <Route path="technical/my-team" element={<TechnicalMyTeam />} />
                </Route>
                <Route path="technical/follow-ups" element={<TechnicalFollowUps />} />
              </Route>

              {/* Solution */}
              <Route element={<RequireDeptAccess slug="solution" />}>
                <Route path="solution/dashboard" element={<SolutionDashboard />} />
                <Route path="solution/leads" element={<SolutionLeads />} />
                <Route element={<RequireHead redirectTo="/marketing/solution/dashboard" />}>
                  <Route path="solution/my-team" element={<SolutionMyTeam />} />
                </Route>
                <Route path="solution/follow-ups" element={<SolutionFollowUps />} />
              </Route>

              {/* Quotation Team */}
              <Route element={<RequireDeptAccess slug="quotation-team" />}>
                <Route path="quotation-team/all-quotations" element={<QuotationTeamAllQuotations />} />
              </Route>

              {/* Payments Team */}
              <Route element={<RequireDeptAccess slug="payments-team" />}>
                <Route path="payments-team/q-payments" element={<PaymentsTeamQPayments />} />
                <Route path="payments-team/q-invoices" element={<PaymentsTeamQInvoices />} />
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
              <Route path="dashboard/field" element={<FieldDashboard />} />
              <Route path="dashboard/corporate" element={<CorporateDashboard />} />
              <Route path="dashboard/associate" element={<AssociateDashboard />} />
            </Route>
          </Route>
        </Route>

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}