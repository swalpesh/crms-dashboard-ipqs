// src/pages/LockScreen.jsx
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Avatar,
  Stack,
  Link,
} from "@mui/material";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";

export default function LockScreen() {
  const [showPwd, setShowPwd] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
      }}
    >
      {/* Top brand */}
      <Box sx={{ textAlign: "center", mt: 1, mb: 3 }}>
        {/* Replace with your logo file if available */}
        {/* <img src="/logo-crms.svg" height={40} alt="CRMS" /> */}
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#ffb703,#4361ee)",
            }}
          />
          <Typography variant="h5" fontWeight={800}>CRMS</Typography>
        </Stack>
      </Box>

      {/* Center card */}
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Card
          sx={{
            width: "100%",
            maxWidth: 600,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 10px 24px rgba(0,0,0,.08)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <Typography align="center" color="text.secondary" sx={{ mb: 2 }}>
              Welcome back!
            </Typography>

            <Stack alignItems="center" sx={{ mb: 2 }}>
              {/* Replace with your user avatar path */}
              <Avatar
                src="/lock-user.jpg"
                alt="User"
                sx={{ width: 88, height: 88, mb: 1 }}
              />
              <Typography variant="h6" fontWeight={800}>
                Adrian Davies
              </Typography>
            </Stack>

            <TextField
              fullWidth
              placeholder="Enter Your Password"
              type={showPwd ? "text" : "password"}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPwd((p) => !p)} edge="end">
                      {showPwd ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              sx={{
                bgcolor: "#d71914",
                "&:hover": { bgcolor: "#bf1511" },
                py: 1.05,
                borderRadius: 2,
                fontWeight: 700,
              }}
            >
              Log In
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Footer */}
      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Stack
          direction="row"
          spacing={3}
          justifyContent="center"
          alignItems="center"
          sx={{ color: "text.secondary", mb: 1 }}
        >
          <Link href="#" underline="hover" color="inherit">Terms &amp; Condition</Link>
          <Link href="#" underline="hover" color="inherit">Privacy</Link>
          <Link href="#" underline="hover" color="inherit">Help</Link>
          <Link href="#" underline="hover" color="inherit" sx={{ display: "inline-flex", alignItems: "center" }}>
            English <ExpandMoreIcon sx={{ fontSize: 18, ml: 0.5 }} />
          </Link>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Copyright © 2025 – CRMS
        </Typography>
      </Box>
    </Box>
  );
}
