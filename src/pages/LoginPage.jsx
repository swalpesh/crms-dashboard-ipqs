// src/pages/LoginPage.jsx
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Button,
  Link,
  Stack,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function readStoredAuth() {
  const ls = window.localStorage;
  const ss = window.sessionStorage;
  const token = ls.getItem("auth_token") || ss.getItem("auth_token");
  const role = ls.getItem("auth_role") || ss.getItem("auth_role");
  const rawUser = ls.getItem("auth_user") || ss.getItem("auth_user");
  let user = null;
  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {}
  return { token, role, user };
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState("employee");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [values, setValues] = useState({
    email: localStorage.getItem("remember_email") || "",
    password: "",
  });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");

  useEffect(() => {
    const { token, role } = readStoredAuth();
    if (token) {
      const isSA = role === "superadmin";
      navigate(isSA ? "/super-admin" : "/marketing", { replace: true });
    }
  }, [navigate]);

  const onChange = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setServerError("");
  };

  const validate = () => {
    const next = { email: "", password: "" };
    if (!values.email.trim()) next.email = "Email is required";
    if (!values.password) next.password = "Password is required";
    setErrors(next);
    return !next.email && !next.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError("");
    setServerSuccess("");

    try {
      const isAdmin = accountType === "admin";
      const endpoint = isAdmin
        ? `${API_BASE_URL}/api/v1/superadmin/login`
        : `${API_BASE_URL}/api/v1/employees/login`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email.trim(),
          password: values.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Login failed");

      const storage = remember ? window.localStorage : window.sessionStorage;
      storage.setItem("auth_token", data.token);
      storage.setItem("auth_user", JSON.stringify(data.data || {}));
      storage.setItem(
        "auth_role",
        isAdmin ? "superadmin" : data.data?.role_id || "employee"
      );

      if (remember) {
        localStorage.setItem("remember_email", values.email.trim());
      } else {
        localStorage.removeItem("remember_email");
      }

      setServerSuccess(data.message || "Login successful");

      setTimeout(() => {
        navigate(isAdmin ? "/super-admin" : "/marketing", { replace: true });
      }, 120);
    } catch (err) {
      setServerError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: { xs: 400, md: "none" },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 2, md: 3 },
          alignItems: "stretch",
          justifyContent: "center",
        }}
      >
        {/* LEFT: form */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            height: { md: "100%" },
            flexBasis: { md: "40%" },
            flexGrow: 0,
            flexShrink: 0,
          }}
        >
          <Card
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 10px 24px rgba(0,0,0,.08)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                display: "flex",
                flexDirection: "column",
                gap: 2.25,
                flex: 1,
                minHeight: 0,
                overflow: { xs: "visible", md: "auto" },
              }}
            >
              {/* Logo */}
              <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-start" }}>
                <img
                  src="/logo.png"
                  alt="IPQS Logo"
                  style={{ width: 130, height: "auto", display: "block" }}
                />
              </Box>

              <Box>
                <Typography
                  variant="h4"
                  sx={{ mb: 1, fontWeight: 800, lineHeight: 1.15 }}
                >
                  Sign In
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Choose account type and enter your credentials.
                </Typography>

                {/* Account type switch */}
                <ToggleButtonGroup
                  value={accountType}
                  exclusive
                  onChange={(_, v) => v && setAccountType(v)}
                  size="small"
                  sx={{ mb: 1 }}
                >
                  <ToggleButton value="employee" aria-label="Employee">
                    <BadgeOutlinedIcon fontSize="small" style={{ marginRight: 6 }} />
                    Employee
                  </ToggleButton>
                  <ToggleButton value="admin" aria-label="Admin">
                    <AdminPanelSettingsIcon fontSize="small" style={{ marginRight: 6 }} />
                    Admin
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {!!serverError && <Alert severity="error">{serverError}</Alert>}
              {!!serverSuccess && <Alert severity="success">{serverSuccess}</Alert>}

              {/* Email */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                  Email Address
                </Typography>
                <TextField
                  name="email"
                  placeholder="you@company.com"
                  type="email"
                  fullWidth
                  value={values.email}
                  onChange={onChange}
                  error={!!errors.email}
                  helperText={errors.email || " "}
                  autoComplete="email"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <MailOutlineIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Password */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                  Password
                </Typography>
                <TextField
                  name="password"
                  placeholder="••••••••"
                  type={showPwd ? "text" : "password"}
                  fullWidth
                  value={values.password}
                  onChange={onChange}
                  error={!!errors.password}
                  helperText={errors.password || " "}
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPwd((p) => !p)}
                          edge="end"
                        >
                          {showPwd ? (
                            <VisibilityOutlinedIcon />
                          ) : (
                            <VisibilityOffOutlinedIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Remember / Forgot */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mt: 0.5 }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Remember Me"
                />
                <Link
                  href="#"
                  underline="hover"
                  sx={{ fontWeight: 700, color: "#d71914" }}
                >
                  Forgot Password?
                </Link>
              </Stack>

              {/* Sign In */}
              <Button
                type="submit"
                size="large"
                variant="contained"
                disabled={submitting}
                sx={{
                  bgcolor: "#d71914",
                  "&:hover": { bgcolor: "#bf1511" },
                  py: 1,
                  borderRadius: 2,
                  fontSize: "0.95rem",
                  fontWeight: 700,
                }}
                startIcon={submitting ? <CircularProgress size={18} /> : null}
              >
                {submitting ? "Signing In..." : "Sign In"}
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: "auto" }}
              >
                Copyright © 2025 – IPQS
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* RIGHT: image column */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flexBasis: { md: "60%" },
            flexGrow: 0,
            flexShrink: 0,
            minWidth: 0,
            height: "100%",
          }}
        >
          <Box sx={{ pr: { md: 0 }, pl: 0, width: "100%", height: "100%" }}>
            <Box
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 10px 24px rgba(0,0,0,.08)",
              }}
            >
              <img
                src="/loginmain.png"
                alt="Working professional"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
