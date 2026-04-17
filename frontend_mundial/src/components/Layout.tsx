// src/components/Layout.tsx
import { Outlet, Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Stack,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Chip,
  Divider,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";

import { useApp } from "../context/AppContext";

type NavItem = { label: string; to: string };

export default function Layout() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const isSupport = user?.role === "support";
  const isUser = !!user && !isAdmin && !isSupport;

  const navItems: NavItem[] = useMemo(() => {
    if (isAdmin) {
      return [
        { label: "Panel admin", to: "/admin" },
      ];
    }

    if (isSupport) return [{ label: "Soporte", to: "/support" }];

    if (!isUser) return [];

    return [
      { label: "Inicio", to: "/home" },
      { label: "Partidos", to: "/matches" },
      { label: "Perfil", to: "/profile" },
      { label: "Pollas", to: "/pools" },
      { label: "Grupos", to: "/friends" },
      { label: "Álbum", to: "/album" },
      { label: "Mercado", to: "/marketplace" },
      { label: "Intercambios", to: "/trades" },
      { label: "Entradas", to: "/tickets" },
      { label: "Pagos", to: "/payments" },
      { label: "Notificaciones", to: "/notifications" },
      { label: "Soporte", to: "/support" },
      { label: "Mapas", to: "/maps" },
    ];
  }, [isAdmin, isSupport, isUser]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (to: string) => {
    if (location.pathname === to) return true;
    if (to !== "/" && location.pathname.startsWith(to + "/")) return true;
    return false;
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: "blur(14px)",
          backgroundColor: "rgba(8, 18, 36, 0.55)",
          borderBottom: "1px solid rgba(234,242,255,0.10)",
        }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          <IconButton
            onClick={() => setOpen(true)}
            sx={{ display: { xs: "inline-flex", md: "none" }, color: "text.primary" }}
            aria-label="Abrir menú"
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(135deg, rgba(46,229,157,.42) 0%, rgba(255,209,102,.28) 100%)",
                border: "1px solid rgba(234,242,255,0.14)",
                boxShadow: "0 12px 30px rgba(0,0,0,.35)",
              }}
            >
              ⚽
            </Box>

            <Box>
              <Typography variant="h6" sx={{ lineHeight: 1.1, fontWeight: 900 }}>
                Mundial 2026
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Mundial 2026
              </Typography>
            </Box>
          </Box>

          {user && (
            <Stack direction="row" spacing={1} sx={{ display: { xs: "none", md: "flex" } }}>
              {isAdmin && <Chip icon={<ShieldRoundedIcon />} label="Gestión" size="small" />}
              <Chip label={user.name} size="small" />
            </Stack>
          )}

          <Stack direction="row" spacing={0.75} sx={{ display: { xs: "none", md: "flex" } }}>
            {navItems.map((item) => {
              const active = isActive(item.to);
              return (
                <Button
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  color="inherit"
                  size="small"
                  sx={{
                    px: 1,
                    borderRadius: 2,
                    whiteSpace: "nowrap",
                    ...(active
                      ? {
                          backgroundColor: "rgba(108,124,155,0.20)",
                          border: "1px solid rgba(108,124,155,0.35)",
                        }
                      : {
                          border: "1px solid rgba(234,242,255,0.08)",
                        }),
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>

          {!user ? (
            <Tooltip title="Iniciar sesión">
              <Button
                variant="outlined"
                color="inherit"
                component={RouterLink}
                to="/login"
                startIcon={<LoginRoundedIcon />}
              >
                Login
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Cerrar sesión">
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleLogout}
                startIcon={<LogoutRoundedIcon />}
              >
                Salir
              </Button>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 280, p: 2 }}>
          <Stack spacing={1.2}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Mundial 2026
            </Typography>

            <Divider />

            <List disablePadding>
              {navItems.map((item) => (
                <ListItemButton
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  selected={isActive(item.to)}
                  onClick={() => setOpen(false)}
                  sx={{ borderRadius: 2, mb: 0.5 }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ))}
            </List>

            <Divider />

            {!user ? (
              <Button
                variant="contained"
                component={RouterLink}
                to="/login"
                onClick={() => setOpen(false)}
                startIcon={<LoginRoundedIcon />}
              >
                Login
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="inherit"
                onClick={async () => {
                  setOpen(false);
                  await handleLogout();
                }}
                startIcon={<LogoutRoundedIcon />}
              >
                Salir
              </Button>
            )}
          </Stack>
        </Box>
      </Drawer>

      <Container sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </>
  );
}
