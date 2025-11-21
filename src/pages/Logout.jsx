import { useEffect } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      // clear both local & session
      ["localStorage", "sessionStorage"].forEach((store) => {
        const s = window[store];
        s.removeItem("auth_token");
        s.removeItem("auth_user");
        s.removeItem("auth_role");
      });
    } catch {}
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "#f6f7f9",
        px: 2,
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Typography variant="h5" fontWeight={800}>
          You’ve been signed out
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 420, textAlign: "center" }}>
          Your session is not active. Please sign in again to continue.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/login", { replace: true })}
          sx={{ bgcolor: "#d71914", "&:hover": { bgcolor: "#bf1511" }, px: 4 }}
        >
          Go to Login
        </Button>
      </Stack>
    </Box>
  );
}
