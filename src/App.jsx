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
import SavedQuotations from "./pages/marketing/SavedQuotations.jsx"
import LeadDetail from "./pages/marketing/LeadDetail.jsx";

// Tele
import TeleDashboard from "./pages/marketing/TeleDashboard.jsx";
import TeleLeads from "./pages/marketing/TeleLeads.jsx";
import TeleMyTeam from "./pages/marketing/TeleMyTeam.jsx";
import TeleFollowUps from "./pages/marketing/TeleFollowUps.jsx";

// Field
import FieldDashboard from "./pages/marketing/FieldDashboard.jsx";
import FieldLeads from "./pages/marketing/FieldLeads.jsx";
import FieldMyTeam from "./pages/marketing/FieldMyTeam.jsx";
import FieldFollowUps from "./pages/marketing/FieldFollowUps.jsx";

// Corporate
import CorporateDashboard from "./pages/marketing/CorporateDashboard.jsx";
import CorporateLeads from "./pages/marketing/CorporateLeads.jsx";
import CorporateMyTeam from "./pages/marketing/CorporateMyTeam.jsx";
import CorporateFollowUps from "./pages/marketing/CorporateFollowUps.jsx";

// Associate
import AssociateDashboard from "./pages/marketing/AssociateDashboard.jsx";
import AssociateLeads from "./pages/marketing/AssociateLeads.jsx";
import AssociateMyTeam from "./pages/marketing/AssociateMyTeam.jsx";
import AssociateFollowUps from "./pages/marketing/AssociateFollowUps.jsx";

// Technical
import TechnicalDashboard from "./pages/marketing/TechnicalDashboard.jsx";
import TechnicalLeads from "./pages/marketing/TechnicalLeads.jsx";
import TechnicalMyTeam from "./pages/marketing/TechnicalMyTeam.jsx";
import TechnicalFollowUps from "./pages/marketing/TechnicalFollowUps.jsx";

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

/** normalize: lowercase + collapse non-alphanum to single '-' and trim edges */
const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** ✅ single source of truth: robust dept/role -> team slug
 * - Handles exacts
 * - Handles common typos (e.g., "Assoicate")
 * - Falls back to role if dept is unknown
 */
function detectTeamSlug(dept, role) {
  const d = norm(dept);
  const r = norm(role);

  // exact dept names
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

  // forgiving dept contains (order matters)
  if (d.includes("assoicate") || d.includes("associate") || d.includes("assoc"))
    return "associate";
  if (d.includes("field")) return "field";
  if (d.includes("corporate")) return "corporate";
  if (d.includes("technical")) return "technical";
  if (d.includes("solution")) return "solution";
  if (d.includes("quotation")) return "quotation-team";
  if (d.includes("payment")) return "payments-team";
  if (d.includes("tele")) return "tele";

  // fallback to role string if dept unknown / typo
  if (r.includes("associate")) return "associate";
  if (r.includes("field")) return "field";
  if (r.includes("corporate")) return "corporate";
  if (r.includes("technical")) return "technical";
  if (r.includes("solution")) return "solution";
  if (r.includes("quotation")) return "quotation-team";
  if (r.includes("payment")) return "payments-team";
  if (r.includes("tele")) return "tele";

  // final fallback
  return "tele";
}

function isIpqsHead(user) {
  return norm(user?.department_id || user?.department_name) === "ipqshead" &&
         norm(user?.role_id || user?.role_name) === "ipqshead";
}
function isHead(user) {
  return norm(user?.role_id || user?.role_name).includes("-head");
}

/* JWT fallback if auth_user missing */
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

/** Require any authenticated user; if missing token -> /logout */
function RequireAuth() {
  const { token } = readAuth();
  if (!token) return <Navigate to="/logout" replace />;
  return <Outlet />;
}

/** Employee-only area (super admin blocked) */
function RequireEmployee() {
  const { token, role, user } = readAuth();
  if (!token) return <Navigate to="/logout" replace />;
  const isSA =
    role === "superadmin" || user?.role === "superadmin" || user?.is_superadmin;
  if (isSA) return <Navigate to="/super-admin" replace />;
  return <Outlet />;
}

/** Super-admin-only area */
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

/** Only allow the user's own department (IpqsHead can access all) */
function RequireDeptAccess({ slug, redirectTo }) {
  const { token, user } = readAuth();
  if (!token) return <Navigate to="/logout" replace />;
  const u = user || readUserFromToken();
  if (isIpqsHead(u)) return <Outlet />; // org head: all
  const userSlug = detectTeamSlug(u?.department_id || u?.department_name, u?.role_id || u?.role_name);
  if (userSlug !== slug) {
    return <Navigate to={redirectTo || defaultDeptLanding(u)} replace />;
  }
  return <Outlet />;
}

/** Only allow heads (IpqsHead or role contains 'head') */
function RequireHead({ redirectTo }) {
  const { token, user } = readAuth();
  if (!token) return <Navigate to="/logout" replace />;
  const u = user || readUserFromToken();
  if (isIpqsHead(u) || isHead(u)) return <Outlet />;
  return <Navigate to={redirectTo || defaultDeptLanding(u)} replace />;
}

/** /marketing index:
 * - IpqsHead stays at /marketing
 * - Others -> dept landing
 */
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
        {/* default -> login */}
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
          {/* MARKETING (employees only) */}
          <Route element={<RequireEmployee />}>
            <Route path="/marketing" element={<MarketingLayout />}>
              <Route index element={<MarketingIndex />} />

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
                <Route element={<RequireHead redirectTo="/marketing/field/dashboard" />}>
                  <Route path="field/my-team" element={<FieldMyTeam />} />
                </Route>
                <Route path="field/follow-ups" element={<FieldFollowUps />} />
              </Route>

              {/* Associate */}
              <Route element={<RequireDeptAccess slug="associate" />}>
                <Route path="associate/dashboard" element={<AssociateDashboard />} />
                <Route path="associate/leads" element={<AssociateLeads />} />
                <Route element={<RequireHead redirectTo="/marketing/associate/dashboard" />}>
                  <Route path="associate/my-team" element={<AssociateMyTeam />} />
                </Route>
                <Route path="associate/follow-ups" element={<AssociateFollowUps />} />
              </Route>

              {/* Corporate */}
              <Route element={<RequireDeptAccess slug="corporate" />}>
                <Route path="corporate/dashboard" element={<CorporateDashboard />} />
                <Route path="corporate/leads" element={<CorporateLeads />} />
                <Route element={<RequireHead redirectTo="/marketing/corporate/dashboard" />}>
                  <Route path="corporate/my-team" element={<CorporateMyTeam />} />
                </Route>
                <Route path="corporate/follow-ups" element={<CorporateFollowUps />} />
              </Route>

              {/* Technical */}
              <Route element={<RequireDeptAccess slug="technical" />}>
                <Route path="technical/dashboard" element={<TechnicalDashboard />} />
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

              {/* Tools (always accessible inside Marketing) */}
              <Route path="contacts" element={<Contacts />} />
              <Route path="companies" element={<Companies />} />
              <Route path="quotation-builder" element={<QuotationBuilder />} />
              <Route path="saved-quotations" element={<SavedQuotations />} />

              {/* Shared */}
              <Route path="lead/:id" element={<LeadDetail />} />
              <Route path="masterleads" element={<Leads />} />
            </Route>
          </Route>

          {/* EMPLOYEE legacy (optional) */}
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

          {/* SUPER ADMIN (strictly) */}
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
