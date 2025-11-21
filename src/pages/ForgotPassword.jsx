// src/pages/ForgotPassword.jsx
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Divider,
  Link as MUILink,
  Stack,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";
import { Link as RouterLink } from "react-router-dom";

export default function ForgotPassword() {
  // keep image's internal left padding equal to the card padding on md+
  const PAD_MD = 5; // theme.spacing(5) = 40px

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

              {/* heading & copy (same tone as login) */}
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                  Forgot Password?
                </Typography>
                <Typography color="text.secondary">
                  If you forgot your password, we’ll email you instructions to reset it.
                </Typography>
              </Box>

              {/* email field */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                  Email Address
                </Typography>
                <TextField
                  placeholder="you@company.com"
                  type="email"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <MailOutlineIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* submit */}
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
                Submit
              </Button>

              {/* return to login */}
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
            {/* left inset so visual padding matches the card */}
            <Box sx={{ height: "100%", width: "100%" }}>
              <img
                src="/forgot.png"  // put your image in /public/forgot.jpg
                alt="Reset password visual"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
