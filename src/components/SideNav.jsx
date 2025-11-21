// src/components/SideNav.jsx
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
} from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useMemo } from "react";

import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import WorkspacesOutlinedIcon from "@mui/icons-material/WorkspacesOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";

import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import CorporateFareOutlinedIcon from "@mui/icons-material/CorporateFareOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

// ✅ Import your logo image (adjust the path if needed)
import logoUrl from "../assets/logo.png";

// keep long labels on one line
const SINGLE_LINE_TYPO_SX = {
  fontSize: 14,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

// Generic item. If noBgOnSelect = true -> only text/icon turn red (no bg)
const NavItem = ({ to, icon, label, singleLine = false, noBgOnSelect = false }) => {
  const location = useLocation();
  const active = useMemo(() => location.pathname.startsWith(to), [location, to]);

  return (
    <ListItemButton
      component={NavLink}
      to={to}
      selected={active}
      sx={{
        borderRadius: 2,
        "&.Mui-selected": {
          bgcolor: noBgOnSelect ? "transparent" : "rgba(215,25,20,0.1)",
          "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
            color: "primary.main",
          },
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
      <ListItemText
        primary={label}
        primaryTypographyProps={singleLine ? { sx: SINGLE_LINE_TYPO_SX } : undefined}
      />
    </ListItemButton>
  );
};

export default function SideNav() {
  const location = useLocation();

  const [openSA, setOpenSA] = useState(true);
  const [openDash, setOpenDash] = useState(true);

  // highlight the Dashboard group when any of its children is active
  const dashActive = location.pathname.startsWith("/super-admin/dashboard");

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Brand — use large responsive logo; removed dot + text */}
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
          to="/super-admin/dashboard"
          sx={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
        >
          <Box
            component="img"
            src={logoUrl}
            alt="Company logo"
            loading="lazy"
            sx={{
              height: { xs: 40, sm: 46, md: 54 }, // 👈 tweak sizes as you like
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
        {/* Super Admin group */}
        <ListItemButton onClick={() => setOpenSA((p) => !p)} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <SecurityOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary="Super Admin" />
          {openSA ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openSA}>
          <Box sx={{ pl: 1.5, mt: 0.5 }}>
            {/* Dashboard (group) */}
            <ListItemButton
              onClick={() => setOpenDash((p) => !p)}
              selected={dashActive}
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
              <ListItemIcon sx={{ minWidth: 40 }}>
                <SpaceDashboardOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
              {openDash ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            {/* Sub dashboards — active = red text/icon only, no background */}
            <Collapse in={openDash}>
              <Box sx={{ pl: 4 }}>
                <NavItem
                  to="/super-admin/dashboard/field"
                  icon={<MapOutlinedIcon />}
                  label="Field Marketing"
                  singleLine
                  noBgOnSelect
                />
                <NavItem
                  to="/super-admin/dashboard/corporate"
                  icon={<CorporateFareOutlinedIcon />}
                  label="Corporate Marketing"
                  singleLine
                  noBgOnSelect
                />
                <NavItem
                  to="/super-admin/dashboard/associate"
                  icon={<GroupsOutlinedIcon />}
                  label="Associate Marketing"
                  singleLine
                  noBgOnSelect
                />
              </Box>
            </Collapse>

            {/* Other SA pages */}
            <NavItem to="/super-admin/employees" icon={<GroupOutlinedIcon />} label="Employees" />
            <NavItem to="/super-admin/roles" icon={<WorkspacesOutlinedIcon />} label="Roles" />
            <NavItem to="/super-admin/departments" icon={<ApartmentOutlinedIcon />} label="Departments" />
          </Box>
        </Collapse>
      </List>

      <Box sx={{ flex: 1 }} />
      <Divider />
      <Box sx={{ p: 2, fontSize: 12, color: "text.secondary" }}>© 2025 CRMS</Box>
    </Box>
  );
}
