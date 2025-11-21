// src/components/TeleSideNav.jsx
import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";

import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import PermContactCalendarOutlinedIcon from "@mui/icons-material/PermContactCalendarOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";

// ✅ Import your logo (adjust path if needed)
import logoUrl from "../assets/logo.png";

export default function TeleSideNav({ onNavigate = () => {} }) {
  const location = useLocation();

  const Item = ({ to, icon, label }) => (
    <ListItemButton
      component={NavLink}
      to={to}
      onClick={onNavigate} // closes temporary drawer on mobile
      selected={location.pathname.startsWith(to)}
      sx={{
        borderRadius: 2,
        "&.Mui-selected": {
          bgcolor: "rgba(215,25,20,0.1)",
          "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
            color: "primary.main",
          },
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  );

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Brand — big responsive logo */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <Box
          component={NavLink}
          to="/employee/dashboard"
          sx={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
        >
          <Box
            component="img"
            src={logoUrl}
            alt="Company logo"
            loading="lazy"
            sx={{
              height: { xs: 40, sm: 46, md: 54 }, // tweak sizes as you like
              width: "auto",
              maxWidth: "100%",
              display: "block",
              objectFit: "contain",
            }}
          />
        </Box>
      </Box>

      <Divider />

      <Box sx={{ px: 2, pt: 1, color: "text.secondary", fontSize: 12, fontWeight: 700 }}>
        MAIN MENU
      </Box>

      <List sx={{ px: 1 }}>
        <Item
          to="/tele/dashboard"
          icon={<SpaceDashboardOutlinedIcon />}
          label="Tele Dashboard"
        />
        <Item
          to="/tele/leads"
          icon={<AssignmentTurnedInOutlinedIcon />}
          label="Leads"
        />
        <Item
          to="/tele/contacts"
          icon={<PermContactCalendarOutlinedIcon />}
          label="Contacts"
        />
        <Item
          to="/tele/companies"
          icon={<BusinessOutlinedIcon />}
          label="Companies"
        />
        
      </List>

      <Box sx={{ flex: 1 }} />
      <Divider />
      <Box sx={{ p: 2, fontSize: 12, color: "text.secondary" }}>© 2025 CRMS</Box>
    </Box>
  );
}
