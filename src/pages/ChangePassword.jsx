// src/pages/ChangePassword.jsx
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Link as MUILink,
  Stack,
} from "@mui/material";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";

export default function ChangePassword() {
  // keep image's left inset equal to card padding on md+
  const PAD_MD = 5; // theme.spacing(5)
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showOld, setShowOld] = useState(false); // if you want "current password"; else use for third field

  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "#f5f5f5",
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 2, md: 3 },
          alignItems: "stretch",
        }}
      >
        {/* LEFT: content (40%) */}
        <Box
          sx={{
            flexBasis: { md: "40%" },
            flexGrow: 0,
            flexShrink: 0,
            height: { md: "100%" },
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
          }}
        >
          <Box
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
            <Box
              sx={{
                p: { xs: 3, sm: 4, md: PAD_MD },
                display: "flex",
                flexDirection: "column",
                gap: 2.25,
                flex: 1,
                minHeight: 0,
                overflow: { xs: "visible", md: "auto" },
              }}
            >
              {/* brand */}
              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 0.5 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#ffb703,#4361ee)",
                  }}
                />
                <Typography variant="h6" fontWeight={800}>
                  CRMS
                </Typography>
              </Stack>

              {/* heading & copy */}
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                  Reset Password?
                </Typography>
                <Typography color="text.secondary">
                  Enter New Password &amp; Confirm Password to get inside
                </Typography>
              </Box>

              {/* New Password */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                  Password
                </Typography>
                <TextField
                  placeholder="Enter new password"
                  type={showNew ? "text" : "password"}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowNew((p) => !p)} edge="end">
                          {showNew ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Confirm Password */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                  Confirm Password
                </Typography>
                <TextField
                  placeholder="Re-enter new password"
                  type={showConfirm ? "text" : "password"}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirm((p) => !p)} edge="end">
                          {showConfirm ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              
              {/* Change button */}
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  bgcolor: "#d71914",
                  "&:hover": { bgcolor: "#bf1511" },
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 700,
                }}
              >
                Change Password
              </Button>

              {/* back to login */}
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Return to{" "}
                <MUILink component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 800 }}>
                  Login
                </MUILink>
              </Typography>

              {/* footer */}
              <Typography variant="caption" color="text.secondary" sx={{ mt: "auto" }}>
                Copyright © 2025 – CRMS
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* RIGHT: image (60%) with matching left inset */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            flexBasis: { md: "60%" },
            flexGrow: 0,
            flexShrink: 0,
            minWidth: 0,
            height: "100%",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 10px 24px rgba(0,0,0,.08)",
              bgcolor: "#fff",
            }}
          >
            {/* left inset to match card padding */}
            <Box sx={{ height: "100%", width: "100%" }}>
              <img
                src="/change.png" // place your image in /public/change.jpg
                alt="Change password visual"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
