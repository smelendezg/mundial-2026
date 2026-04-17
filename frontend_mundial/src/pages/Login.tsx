import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { useApp } from "../context/AppContext";
import { bannerImages } from "../theme/bannerImages";

export default function Login() {
  const { user, login, authLoading } = useApp();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => username.trim().length >= 2 && password.length > 0,
    [password, username]
  );

  useEffect(() => {
    if (authLoading || !user) return;
    if (user.role === "admin") navigate("/admin", { replace: true });
    else if (user.role === "support") navigate("/support", { replace: true });
    else navigate("/home", { replace: true });
  }, [authLoading, navigate, user]);

  const onSubmit = async () => {
    const cleanUsername = username.trim();

    if (cleanUsername.length < 2) {
      setError("Escribe tu usuario o correo.");
      return;
    }

    if (!password) {
      setError("Escribe tu contraseña.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await login(cleanUsername, password);
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo iniciar sesión.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 980, mx: "auto" }}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, minHeight: 520 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="stretch">
          <Box
            sx={{
              flex: 1,
              minHeight: { xs: 260, md: 470 },
              borderRadius: 2,
              p: 3,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background:
                `linear-gradient(rgba(4,20,13,.20), rgba(4,20,13,.40)), url(${bannerImages.login})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "1px solid rgba(255,255,255,.18)",
            }}
          >
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1 }}>
                Mundial 2026
              </Typography>
              <Typography sx={{ mt: 1, maxWidth: 360 }}>
                Tu agenda, tus entradas, tus pollas y tu álbum en un solo lugar.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {["🇨🇴 Colombia", "🇦🇷 Argentina", "🇧🇷 Brasil", "🇲🇽 México"].map((item) => (
                <Box
                  key={item}
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 2,
                    bgcolor: "rgba(0,0,0,.35)",
                    border: "1px solid rgba(255,255,255,.18)",
                  }}
                >
                  {item}
                </Box>
              ))}
            </Stack>
          </Box>

          <Stack spacing={2} sx={{ flex: 0.9, justifyContent: "center" }}>
            <Box>
              <Typography variant="h4">Iniciar sesión ⚽</Typography>
              <Typography color="text.secondary">
                Entra con tu usuario y contraseña.
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Usuario o correo"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={submitting}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSubmit && !submitting) onSubmit();
            }}
            fullWidth
          />

          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSubmit && !submitting) onSubmit();
            }}
            fullWidth
          />

          <Button variant="contained" onClick={onSubmit} disabled={!canSubmit || submitting}>
            {submitting ? "Entrando..." : "Entrar"}
          </Button>

          <Button component={RouterLink} to="/register" color="inherit" disabled={submitting}>
            Crear cuenta
          </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
