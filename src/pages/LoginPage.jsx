// src/pages/LoginPage.jsx
import {
  Box,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

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

// --- THEME CONSTANTS ---
const themeColors = {
  bgGradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
  glassBg: 'rgba(25, 25, 55, 0.65)',
  glassBorder: '1px solid rgba(255, 255, 255, 0.1)',
  textSecondary: '#a0a0c0',
  blue: '#3b82f6',
  brandRed: '#d71914',
  brandRedHover: '#bf1511'
};

const inputStyle = {
  "& .MuiOutlinedInput-root": { 
      color: "#fff", 
      bgcolor: "rgba(0,0,0,0.3)", 
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      "& fieldset": { borderColor: "rgba(255,255,255,0.1)" }, 
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" }, 
      "&.Mui-focused": {
        bgcolor: "rgba(0,0,0,0.5)",
      },
      "&.Mui-focused fieldset": { 
        borderColor: themeColors.blue,
        borderWidth: '1px',
        boxShadow: `0 0 0 3px rgba(59, 130, 246, 0.2)`
      } 
  },
  "& .MuiInputLabel-root": { color: themeColors.textSecondary }, 
  "& .MuiSvgIcon-root": { color: themeColors.textSecondary, transition: 'color 0.3s ease' },
  "& .MuiOutlinedInput-root.Mui-focused .MuiSvgIcon-root": { color: themeColors.blue }
};

export default function LoginPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  // --- Core States ---
  const [loginStep, setLoginStep] = useState("initial"); // 'initial' | 'profiles'
  const [accountType, setAccountType] = useState("employee");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  
  // --- Form States ---
  const [values, setValues] = useState({
    email: localStorage.getItem("remember_email") || "",
    password: "",
  });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  
  // --- Admin Profile States ---
  const [adminToken, setAdminToken] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profilePwdModalOpen, setProfilePwdModalOpen] = useState(false);
  const [profilePassword, setProfilePassword] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [showProfilePwd, setShowProfilePwd] = useState(false);

  // --- Splash Screen ---
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const { token, role } = readStoredAuth();
    if (token) {
      // If true superadmin it goes to /super-admin, otherwise ipqsHead and employees go to /marketing
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

  // --- STEP 1: INITIAL LOGIN ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError("");

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

      // --- CHECK IF IT'S THE SPECIAL IPQSADMIN EMAIL ---
      if (accountType === "employee" && values.email.trim().toLowerCase() === "ipqsadmin@ipqspl.com") {
        setAdminToken(data.token);
        
        const profRes = await fetch(`${API_BASE_URL}/api/adminprofiles/list`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${data.token}` }
        });
        
        const profData = await profRes.json();
        
        if (!profRes.ok) throw new Error(profData?.message || "Failed to fetch admin profiles.");
        
        setProfiles(profData.data || []);
        setLoginStep("profiles");
        setSubmitting(false);
        return; // Stop execution here, wait for profile selection
      }

      // --- STANDARD FLOW: Normal Employee Routing ---
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

      setShowSplash(true);

      setTimeout(() => {
        navigate(isAdmin ? "/super-admin" : "/marketing", { replace: true });
      }, 2500);

    } catch (err) {
      setServerError(err.message || "Something went wrong");
      setSubmitting(false);
    }
  };

  // --- STEP 2: PROFILE LOGIN ---
  const handleProfileLogin = async (e) => {
    e.preventDefault();
    if (!profilePassword) {
      setProfileError("Password is required");
      return;
    }

    setProfileError("");
    setProfileSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/adminprofiles/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}` // Using the initial employee token securely
        },
        body: JSON.stringify({
          profile_id: selectedProfile.profile_id,
          password: profilePassword
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Incorrect profile password");

      // Success -> Store Tokens, Profile info, and route as IPQS Head
      const storage = remember ? window.localStorage : window.sessionStorage;
      
      // Inject the profile name as the username, AND force the department/role to 'ipqsHead' 
      // so the router & sidebar do not default to 'tele' marketing.
      const authUserObj = {
        ...(data.data || selectedProfile),
        username: selectedProfile.profile_name,
        email: values.email.trim(),
        department_id: "ipqsHead",
        department_name: "ipqsHead",
        role_id: "ipqsHead",
        role_name: "ipqsHead"
      };

      storage.setItem("auth_token", data.token || adminToken);
      storage.setItem("auth_user", JSON.stringify(authUserObj)); 
      storage.setItem("auth_profile", JSON.stringify(selectedProfile)); 
      
      // Explicitly store the profile name directly in local storage
      storage.setItem("profile_name", selectedProfile.profile_name);
      
      // FIX: Explicitly assign the ipqsHead role instead of superadmin
      storage.setItem("auth_role", "ipqsHead"); 

      if (remember) localStorage.setItem("remember_email", values.email.trim());
      else localStorage.removeItem("remember_email");

      setProfilePwdModalOpen(false);
      setShowSplash(true);

      setTimeout(() => {
        // Specifically routes to /marketing which will render the Engage Sidebar
        navigate("/marketing", { replace: true });
      }, 2500);

    } catch (err) {
      setProfileError(err.message || "Login failed");
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    setLoginStep("initial");
    setAdminToken("");
    setProfiles([]);
    setProfilePassword("");
  };

  return (
    <>
      {/* CSS For Sexy Splash Animations */}
      <style>{`
        @keyframes splashBgFadeIn {
          0% { opacity: 0; backdrop-filter: blur(0px); }
          100% { opacity: 1; backdrop-filter: blur(25px); }
        }
        @keyframes spotlightPulse {
          0% { transform: scale(0.5); opacity: 0; }
          20% { transform: scale(1.2); opacity: 1; }
          50% { transform: scale(1); opacity: 0.85; }
          85% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.5); opacity: 0; }
        }
        @keyframes logoScaleUp {
          0% { transform: scale(0.85); opacity: 0; }
          20% { transform: scale(1.05); opacity: 1; }
          50% { transform: scale(1); opacity: 1; }
          85% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes textSlideFade {
          0% { opacity: 0; transform: translateY(15px); }
          20% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-15px); }
        }
        @keyframes spinnerFadeOut {
          0% { opacity: 0; }
          20% { opacity: 1; }
          85% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* SPLASH SCREEN OVERLAY */}
      {showSplash && (
        <Box
          sx={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999,
            background: 'rgba(10, 10, 22, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'splashBgFadeIn 0.4s ease-out forwards'
          }}
        >
          <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '120px' }}>
            <Box sx={{
              position: 'absolute',
              width: { xs: '280px', md: '350px' },
              height: '140px',
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(59,130,246,0.6) 45%, rgba(0,0,0,0) 75%)',
              filter: 'blur(25px)',
              zIndex: 0,
              animation: 'spotlightPulse 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            }} />
            <Box
              component="img"
              src="/logo.png"
              alt="Engage Logo"
              sx={{
                width: { xs: 160, md: 220 },
                zIndex: 1,
                position: 'relative',
                filter: 'drop-shadow(0px 4px 15px rgba(0,0,0,0.5))',
                animation: 'logoScaleUp 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards'
              }}
            />
          </Box>

          <Typography 
            variant="h5" 
            sx={{ 
                mt: 5, 
                color: '#fff', 
                fontWeight: 700, 
                letterSpacing: '1px',
                animation: 'textSlideFade 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            }}
          >
            Welcome back{selectedProfile ? `, ${selectedProfile.profile_name}` : values.email ? `, ${values.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ')}` : ''}
          </Typography>
          
          <CircularProgress size={30} thickness={5} sx={{ mt: 4, color: themeColors.blue, animation: 'spinnerFadeOut 2.5s ease-in-out forwards' }} />
        </Box>
      )}

      {/* MAIN LOGIN PAGE */}
      <Box
        sx={{
          minHeight: "100vh",
          background: themeColors.bgGradient,
          px: { xs: 2, md: 4 },
          py: { xs: 2, md: 3 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', sans-serif",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <Box sx={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)', zIndex: 0 }} />
        <Box sx={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(215, 25, 20, 0.1) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: 0 }} />

        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: 450, md: 1000 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "stretch",
            justifyContent: "center",
            background: themeColors.glassBg,
            backdropFilter: 'blur(20px)',
            border: themeColors.glassBorder,
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            overflow: "hidden",
            zIndex: 1
          }}
        >
          {/* LEFT CONTENT */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexBasis: { md: "50%" }, p: { xs: 4, md: 6 } }}>
            <Box sx={{ width: '100%', maxWidth: '380px' }}>
              
              <Box sx={{ mb: 4 }}>
                <img src="/logo.png" alt="IPQS Logo" style={{ width: 140, height: "auto", display: "block", filter: "brightness(0) invert(1) drop-shadow(0 0 10px rgba(255, 255, 255, 0.2))" }} />
              </Box>

              {/* RENDER STEP 1: INITIAL LOGIN FORM */}
              {loginStep === "initial" && (
                <Box component="form" onSubmit={handleSubmit}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ mb: 1.5, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Welcome Back</Typography>
                    <Typography variant="body2" sx={{ color: themeColors.textSecondary, fontSize: '0.95rem' }}>Log in to access your dashboard.</Typography>
                  </Box>

                  <Box sx={{ mb: 4, p: 0.5, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '12px', display: 'flex', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Button fullWidth disableElevation onClick={() => setAccountType('employee')} sx={{ borderRadius: '10px', py: 1, textTransform: 'none', fontWeight: 600, color: accountType === 'employee' ? '#fff' : themeColors.textSecondary, bgcolor: accountType === 'employee' ? 'rgba(255,255,255,0.1)' : 'transparent', '&:hover': { bgcolor: accountType === 'employee' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)' } }}>
                          <BadgeOutlinedIcon fontSize="small" sx={{ mr: 1, opacity: 0.8 }} /> Employee
                      </Button>
                      <Button fullWidth disableElevation onClick={() => setAccountType('admin')} sx={{ borderRadius: '10px', py: 1, textTransform: 'none', fontWeight: 600, color: accountType === 'admin' ? '#fff' : themeColors.textSecondary, bgcolor: accountType === 'admin' ? 'rgba(255,255,255,0.1)' : 'transparent', '&:hover': { bgcolor: accountType === 'admin' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)' } }}>
                          <AdminPanelSettingsIcon fontSize="small" sx={{ mr: 1, opacity: 0.8 }} /> Admin
                      </Button>
                  </Box>

                  {!!serverError && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px', bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', '& .MuiAlert-icon': { color: '#ef4444' } }}>{serverError}</Alert>}

                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: themeColors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>Email Address</Typography>
                    <TextField name="email" placeholder="Enter your email" type="email" fullWidth value={values.email} onChange={onChange} error={!!errors.email} helperText={errors.email || " "} autoComplete="email" sx={inputStyle} InputProps={{ endAdornment: (<InputAdornment position="end"><MailOutlineIcon fontSize="small" /></InputAdornment>) }} />
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: themeColors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>Password</Typography>
                    <TextField name="password" placeholder="••••••••" type={showPwd ? "text" : "password"} fullWidth value={values.password} onChange={onChange} error={!!errors.password} helperText={errors.password || " "} autoComplete="current-password" sx={inputStyle} InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPwd((p) => !p)} edge="end" sx={{ color: themeColors.textSecondary, '&:hover': { color: '#fff' } }}>{showPwd ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}</IconButton></InputAdornment>) }} />
                  </Box>

                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
                    <FormControlLabel control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} size="small" sx={{ color: themeColors.textSecondary, '&.Mui-checked': { color: themeColors.blue } }} />} label={<Typography variant="body2" sx={{ color: themeColors.textSecondary, fontWeight: 500 }}>Remember Me</Typography>} />
                    <Link href="#" underline="none" sx={{ fontWeight: 600, color: themeColors.blue, fontSize: '0.85rem', '&:hover': { color: '#60a5fa' } }}>Forgot Password?</Link>
                  </Stack>

                  <Button type="submit" fullWidth size="large" variant="contained" disabled={submitting} sx={{ background: `linear-gradient(135deg, ${themeColors.blue}, #2563eb)`, color: '#fff', py: 1.5, borderRadius: '12px', fontSize: "1rem", fontWeight: 700, textTransform: 'none', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)', transition: 'all 0.3s ease', "&:hover": { transform: 'translateY(-2px)', boxShadow: '0 12px 25px rgba(59, 130, 246, 0.4)' }, "&.Mui-disabled": { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' } }} startIcon={submitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : null}>
                    {submitting ? "Authenticating..." : "Sign In to Account"}
                  </Button>
                </Box>
              )}

              {/* RENDER STEP 2: ADMIN PROFILES SELECTION */}
              {loginStep === "profiles" && (
                <Box>
                  <Button startIcon={<ArrowBackIcon fontSize="small"/>} onClick={handleBackToLogin} sx={{ mb: 2, color: themeColors.textSecondary, textTransform: 'none', pl: 0, '&:hover': { color: '#fff', background: 'transparent' } }}>
                    Back to Login
                  </Button>
                  <Typography variant="h4" sx={{ mb: 1, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
                    Select Profile
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 4, color: themeColors.textSecondary, fontSize: '0.95rem' }}>
                    Choose an administrator profile to continue.
                  </Typography>

                  <Stack spacing={2}>
                    {profiles.map(p => (
                      <ListItemButton 
                        key={p.profile_id} 
                        onClick={() => { 
                          setSelectedProfile(p); 
                          setProfilePassword(""); 
                          setProfileError(""); 
                          setProfilePwdModalOpen(true); 
                        }} 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.03)', 
                          borderRadius: '16px', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          p: 2,
                          transition: 'all 0.2s',
                          '&:hover': { 
                            bgcolor: 'rgba(59,130,246,0.1)', 
                            borderColor: themeColors.blue,
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 15px rgba(59,130,246,0.15)'
                          } 
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'rgba(59,130,246,0.2)', color: themeColors.blue, fontWeight: 700 }}>
                            {p.profile_name.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={p.profile_name} 
                          secondary={`Employee ID: ${p.employee_id}`} 
                          primaryTypographyProps={{ color: '#fff', fontWeight: 600, fontSize: '1.05rem' }}
                          secondaryTypographyProps={{ color: 'rgba(255,255,255,0.5)', mt: 0.5, fontSize: '0.8rem' }} 
                        />
                      </ListItemButton>
                    ))}
                  </Stack>
                </Box>
              )}

              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 4, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                Copyright © 2025 – IPQS
              </Typography>
            </Box>
          </Box>

          {/* RIGHT: image column */}
          <Box sx={{ display: { xs: "none", md: "flex" }, flexBasis: { md: "50%" }, position: 'relative', bgcolor: '#0a0a16', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to right, rgba(10,10,22,1) 0%, rgba(10,10,22,0.4) 50%, rgba(10,10,22,0.1) 100%)', zIndex: 1 }} />
            <img src="/loginmain.png" alt="Working professional" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0.8 }} />
          </Box>

        </Box>
      </Box>

      {/* --- MODAL: PROFILE PASSWORD PROMPT --- */}
      <Dialog 
        open={profilePwdModalOpen} 
        onClose={() => !profileSubmitting && setProfilePwdModalOpen(false)}
        PaperProps={{
          sx: {
            background: 'rgba(20, 20, 35, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            color: '#fff',
            minWidth: { xs: '90vw', sm: '400px' }
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3, px: 3, fontWeight: 800, fontSize: '1.25rem' }}>
          Profile Authentication
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 2 }}>
          <Typography variant="body2" sx={{ color: themeColors.textSecondary, mb: 3 }}>
            Please enter the password for <strong style={{ color: '#fff' }}>{selectedProfile?.profile_name}</strong> to continue.
          </Typography>

          {!!profileError && (
             <Alert severity="error" sx={{ mb: 3, borderRadius: '10px', bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', '& .MuiAlert-icon': { color: '#ef4444' } }}>
               {profileError}
             </Alert>
          )}

          <form id="profile-login-form" onSubmit={handleProfileLogin}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: themeColors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
              Profile Password
            </Typography>
            <TextField
              fullWidth
              placeholder="••••••••"
              type={showProfilePwd ? "text" : "password"}
              value={profilePassword}
              onChange={(e) => {
                setProfilePassword(e.target.value);
                setProfileError("");
              }}
              autoFocus
              sx={inputStyle}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowProfilePwd((p) => !p)}
                      edge="end"
                      sx={{ color: themeColors.textSecondary, '&:hover': { color: '#fff' } }}
                    >
                      {showProfilePwd ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button 
            onClick={() => setProfilePwdModalOpen(false)} 
            disabled={profileSubmitting}
            sx={{ color: themeColors.textSecondary, textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            form="profile-login-form"
            variant="contained" 
            disabled={profileSubmitting}
            sx={{ 
              bgcolor: themeColors.blue, 
              color: '#fff', 
              textTransform: 'none', 
              fontWeight: 700,
              borderRadius: '10px',
              px: 3,
              '&:hover': { bgcolor: '#2563eb' },
              '&.Mui-disabled': { bgcolor: 'rgba(59,130,246,0.3)', color: 'rgba(255,255,255,0.5)' }
            }}
          >
            {profileSubmitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : "Access Profile"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}