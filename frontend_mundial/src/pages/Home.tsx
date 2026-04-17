import { useEffect, useMemo, useState } from "react";
import { Alert, Avatar, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { getMatches } from "../api/matchesApi";
import { getMyProfile } from "../api/profileApi";
import { useApp } from "../context/AppContext";
import type { Match } from "../types/match";
import type { Profile } from "../types/profile";
import { formatTeam } from "../utils/countries";
import { bannerImages } from "../theme/bannerImages";

function hasMatchPreference(match: Match, profile: Profile) {
  const teams = profile.favoriteTeams.map((team) => team.toLowerCase());
  const cities = profile.favoriteCities.map((city) => city.toLowerCase());
  const home = match.home.name.toLowerCase();
  const away = match.away.name.toLowerCase();
  const city = match.city.toLowerCase();
  const stadium = match.stadium.toLowerCase();

  return (
    teams.some((team) => home.includes(team) || away.includes(team)) ||
    cities.some((item) => city.includes(item) || stadium.includes(item))
  );
}

export default function Home() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    if (!user) return;

    getMyProfile(user.id, {
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      avatarUrl: user.avatarUrl,
    }).then(setProfile);

    getMatches().then(setMatches);
  }, [user]);

  const personalizedAgenda = useMemo(() => {
    if (!profile) return [];

    const preferredMatches = matches.filter((match) => hasMatchPreference(match, profile));
    return preferredMatches.length > 0 ? preferredMatches : matches.slice(0, 3);
  }, [matches, profile]);

  if (!user) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5">Inicio</Typography>
        <Alert severity="warning">Debes iniciar sesión.</Alert>
      </Stack>
    );
  }

  if (!profile) return <Alert severity="info">Cargando perfil...</Alert>;

  return (
    <Stack spacing={2}>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3 },
          minHeight: 300,
          display: "flex",
          alignItems: "end",
          background:
            `linear-gradient(rgba(4,20,13,.18), rgba(4,20,13,.70)), url(${bannerImages.home})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" sx={{ width: "100%" }}>
          <Avatar
            src={profile.avatarUrl}
            sx={{
              width: 92,
              height: 92,
              border: "3px solid rgba(255,255,255,.75)",
              boxShadow: "0 18px 45px rgba(0,0,0,.35)",
            }}
          >
            {profile.name.charAt(0).toUpperCase()}
          </Avatar>

          <Stack spacing={0.5} sx={{ flex: 1, width: "100%" }}>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              Hola, {profile.name} {profile.lastName} ⚽
            </Typography>
            <Typography>{profile.email || "Correo pendiente"}</Typography>
            <Typography variant="caption" color="text.secondary">
              Última actualización: {new Date(profile.updatedAt).toLocaleString()}
            </Typography>
          </Stack>

          <Button variant="contained" onClick={() => navigate("/profile")}>
            Editar perfil
          </Button>
        </Stack>
      </Paper>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
      <Paper sx={{ p: 2.5, flex: 1 }}>
        <Typography sx={{ fontWeight: 900 }}>Tus favoritos ✨</Typography>

        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Equipos
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
          {profile.favoriteTeams.length === 0 ? (
            <Typography color="text.secondary">Aún no has seleccionado equipos.</Typography>
          ) : (
            profile.favoriteTeams.map((team) => <Chip key={team} label={`⭐ ${team}`} />)
          )}
        </Stack>

        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Ciudades o estadios
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
          {profile.favoriteCities.length === 0 ? (
            <Typography color="text.secondary">Aún no has seleccionado ubicaciones.</Typography>
          ) : (
            profile.favoriteCities.map((city) => <Chip key={city} label={`🏟️ ${city}`} />)
          )}
        </Stack>
      </Paper>

      <Paper sx={{ p: 2.5, flex: 1 }}>
        <Typography sx={{ fontWeight: 900 }}>Estado de alertas 🔔</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {profile.notificationsEnabled
            ? "Te avisaremos sobre partidos, reservas y novedades importantes."
            : "Tus notificaciones están pausadas."}
        </Typography>
      </Paper>
      </Stack>

      <Paper sx={{ p: 2.5 }}>
        <Typography sx={{ fontWeight: 900 }}>Agenda personalizada 🗓️</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Próximos partidos priorizados según tus equipos, ciudades y estadios favoritos.
        </Typography>

        <Stack spacing={1.2} sx={{ mt: 2 }}>
          {personalizedAgenda.map((match) => (
            <Paper key={match.id} variant="outlined" sx={{ p: 1.5 }}>
              <Typography sx={{ fontWeight: 700 }}>
                {formatTeam(match.home)} vs {formatTeam(match.away)}
              </Typography>
              <Typography color="text.secondary">
                🏟️ {match.city} · {match.stadium}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                🕒 {new Date(match.startTimeISO).toLocaleString()}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}
