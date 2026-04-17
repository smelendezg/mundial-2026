import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  FormHelperText,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useApp } from "../context/AppContext";
import { getMyProfile, updateMyProfile } from "../api/profileApi";
import type { Profile } from "../types/profile";
import {
  splitCommaValues,
  validateAvatar,
  validateEmail,
  validatePersonName,
  type FieldErrors,
} from "../utils/validation";

type ProfileField = "name" | "lastName" | "email" | "avatar" | "teams" | "cities";

export default function ProfilePage() {
  const { user, setUser } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [teams, setTeams] = useState("");
  const [cities, setCities] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [errors, setErrors] = useState<FieldErrors<ProfileField>>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const fallbackProfile = useMemo(
    () => ({
      name: user?.name,
      lastName: user?.lastName,
      email: user?.email,
      avatarUrl: user?.avatarUrl,
    }),
    [user?.avatarUrl, user?.email, user?.lastName, user?.name]
  );

  useEffect(() => {
    if (!user) return;

    getMyProfile(user.id, fallbackProfile).then((p) => {
      setProfile(p);
      setName(p.name);
      setLastName(p.lastName);
      setEmail(p.email);
      setAvatarUrl(p.avatarUrl ?? "");
      setTeams(p.favoriteTeams.join(", "));
      setCities(p.favoriteCities.join(", "));
      setNotificationsEnabled(p.notificationsEnabled);
    });
  }, [fallbackProfile, user]);

  if (!user) return <Alert severity="warning">Debes iniciar sesión.</Alert>;
  if (!profile) return <Alert severity="info">Cargando perfil...</Alert>;

  const validateForm = () => {
    const favoriteTeams = splitCommaValues(teams);
    const favoriteCities = splitCommaValues(cities);
    const nextErrors: FieldErrors<ProfileField> = {
      name: validatePersonName(name, "El nombre"),
      lastName: validatePersonName(lastName, "El apellido"),
      email: validateEmail(email),
      teams: favoriteTeams.length > 5 ? "Selecciona máximo 5 equipos favoritos." : "",
      cities: favoriteCities.length > 5 ? "Selecciona máximo 5 ciudades favoritas." : "",
    };

    Object.keys(nextErrors).forEach((key) => {
      const typedKey = key as ProfileField;
      if (!nextErrors[typedKey]) delete nextErrors[typedKey];
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onAvatarChange = (file?: File) => {
    if (!file) return;

    const avatarError = validateAvatar(file);
    if (avatarError) {
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

  const onSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setMessage("");

      const updated = await updateMyProfile(
        user.id,
        {
          name: name.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          avatarUrl,
          favoriteTeams: splitCommaValues(teams),
          favoriteCities: splitCommaValues(cities),
          notificationsEnabled,
        },
        fallbackProfile
      );

      setProfile(updated);
      setUser({
        ...user,
        name: updated.name,
        lastName: updated.lastName,
        email: updated.email,
        avatarUrl: updated.avatarUrl,
      });
      setMessage("Perfil actualizado correctamente.");
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "No se pudo actualizar el perfil.";
      setMessage(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 820, mx: "auto" }}>
      <Box>
        <Typography variant="h5">Editar perfil</Typography>
        <Typography color="text.secondary">
          Mantén tus datos y preferencias actualizadas para personalizar la agenda del torneo.
        </Typography>
      </Box>

      {message && (
        <Alert severity={message.includes("correctamente") ? "success" : "error"}>{message}</Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2.5}>
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
                Cambiar avatar
              </Button>
              <FormHelperText error={Boolean(errors.avatar)}>
                {errors.avatar || "Opcional. La imagen debe pesar menos de 1 MB."}
              </FormHelperText>
            </Box>
          </Stack>

          <TextField
            label="Equipos favoritos"
            value={teams}
            onChange={(e) => setTeams(e.target.value)}
            placeholder="Colombia, Argentina"
            error={Boolean(errors.teams)}
            helperText={errors.teams || "Sepáralos por coma. Máximo 5 equipos."}
            disabled={saving}
            fullWidth
          />

          <TextField
            label="Ciudades o estadios de interés"
            value={cities}
            onChange={(e) => setCities(e.target.value)}
            placeholder="Bogotá, Ciudad de México, MetLife Stadium"
            error={Boolean(errors.cities)}
            helperText={errors.cities || "Sepáralos por coma. Máximo 5 intereses."}
            disabled={saving}
            fullWidth
          />

          <Stack direction="row" spacing={1} alignItems="center">
            <Switch
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              disabled={saving}
            />
            <Typography>Recibir notificaciones</Typography>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button variant="contained" onClick={onSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
            <Button color="inherit" onClick={() => navigate("/home")} disabled={saving}>
              Volver
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
