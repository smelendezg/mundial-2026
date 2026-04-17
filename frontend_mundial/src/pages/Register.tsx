import { useMemo, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  FormHelperText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { registerApi } from "../api/authApi";
import { useApp } from "../context/AppContext";
import {
  getPasswordRules,
  validateAvatar,
  validateEmail,
  validatePassword,
  validatePersonName,
  type FieldErrors,
} from "../utils/validation";
import { bannerImages } from "../theme/bannerImages";

type RegisterField = "name" | "lastName" | "email" | "password" | "avatar";

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [errors, setErrors] = useState<FieldErrors<RegisterField>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const passwordRules = useMemo(() => getPasswordRules(password), [password]);

  const validateForm = () => {
    const nextErrors: FieldErrors<RegisterField> = {
      name: validatePersonName(name, "El nombre"),
      lastName: validatePersonName(lastName, "El apellido"),
      email: validateEmail(email),
      password: validatePassword(password),
    };

    Object.keys(nextErrors).forEach((key) => {
      const typedKey = key as RegisterField;
      if (!nextErrors[typedKey]) delete nextErrors[typedKey];
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onAvatarChange = (file?: File) => {
    if (!file) return;

    const avatarError = validateAvatar(file);
    if (avatarError) {
      setAvatarUrl("");
      setErrors((current) => ({ ...current, avatar: avatarError }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(String(reader.result));
      setErrors((current) => {
        const { avatar, ...rest } = current;
        void avatar;
        return rest;
      });
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError("");

      const response = await registerApi({
        name: name.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        avatarUrl,
      });

      setUser(response.user);
      navigate("/home", { replace: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo crear la cuenta.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 1080, mx: "auto" }}>
      <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="stretch">
          <Box
            sx={{
              flex: 0.9,
              minHeight: { xs: 250, md: 620 },
              borderRadius: 2,
              p: 3,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background:
                `linear-gradient(rgba(4,20,13,.18), rgba(4,20,13,.45)), url(${bannerImages.register})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "1px solid rgba(255,255,255,.18)",
            }}
          >
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1 }}>
                Crea tu perfil mundialista
              </Typography>
              <Typography sx={{ mt: 1.5, maxWidth: 360 }}>
                Guarda tus equipos favoritos, arma tu agenda y entra al juego con tu avatar.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {["🏟️ Estadios", "🎟️ Entradas", "🏆 Pollas", "✨ Álbum"].map((item) => (
                <Chip
                  key={item}
                  label={item}
                  sx={{
                    bgcolor: "rgba(0,0,0,.38)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,.22)",
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Stack spacing={2.5} sx={{ flex: 1.1, justifyContent: "center" }}>
          <Box>
            <Typography variant="h4">Crear cuenta 🌎</Typography>
            <Typography color="text.secondary">
              Completa tus datos para entrar a la plataforma del Mundial 2026.
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={Boolean(errors.name)}
              helperText={errors.name}
              disabled={saving}
              fullWidth
            />
            <TextField
              label="Apellido"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={Boolean(errors.lastName)}
              helperText={errors.lastName}
              disabled={saving}
              fullWidth
            />
          </Stack>

          <TextField
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={Boolean(errors.email)}
            helperText={errors.email}
            disabled={saving}
            fullWidth
          />

          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={Boolean(errors.password)}
            helperText={errors.password || "Debe ser una contraseña buena y difícil de adivinar."}
            disabled={saving}
            fullWidth
          />

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {passwordRules.map((rule) => (
              <Chip
                key={rule.label}
                label={rule.label}
                color={rule.valid ? "success" : "default"}
                variant={rule.valid ? "filled" : "outlined"}
                size="small"
              />
            ))}
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <Avatar src={avatarUrl} sx={{ width: 72, height: 72 }}>
              {name.trim().charAt(0).toUpperCase() || "U"}
            </Avatar>

            <Box sx={{ flex: 1, width: "100%" }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={(e) => onAvatarChange(e.target.files?.[0])}
              />
              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
              >
                Subir avatar
              </Button>
              <FormHelperText error={Boolean(errors.avatar)}>
                {errors.avatar || "Opcional. Usa una imagen JPG, PNG o WEBP menor a 1 MB."}
              </FormHelperText>
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button variant="contained" onClick={onSubmit} disabled={saving}>
              {saving ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
            <Button component={RouterLink} to="/login" color="inherit" disabled={saving}>
              Ya tengo cuenta
            </Button>
          </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
