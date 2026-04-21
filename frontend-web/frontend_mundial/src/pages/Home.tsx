import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Avatar, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { getMatches } from "../api/matchesApi";
import { getMyProfile } from "../api/profileApi";
import { http } from "../api/http";
import { useApp } from "../context/AppContext";
import type { Match } from "../types/match";
import type { Profile } from "../types/profile";
import { bannerImages } from "../theme/bannerImages";

type Preferencia = { id: number; nombre: string };

function hasMatchPreference(
  match: Match,
  favoriteTeams: string[],
  estadios: Preferencia[],
  ciudades: Preferencia[]
) {
  const teams = favoriteTeams.map((t) => t.toLowerCase());
  const estadioNames = estadios.map((e) => e.nombre.toLowerCase());
  const ciudadNames = ciudades.map((c) => c.nombre.toLowerCase());

  const home = match.home.name?.toLowerCase() ?? "";
  const away = match.away.name?.toLowerCase() ?? "";
  const city = match.city?.toLowerCase() ?? "";
  const stadium = match.stadium?.toLowerCase() ?? "";

  return (
    teams.some((t) => home.includes(t) || away.includes(t)) ||
    estadioNames.some((e) => stadium.includes(e)) ||
    ciudadNames.some((c) => city.includes(c))
  );
}

export default function Home() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selecciones, setSelecciones] = useState<Preferencia[]>([]);
  const [estadios, setEstadios] = useState<Preferencia[]>([]);
  const [ciudades, setCiudades] = useState<Preferencia[]>([]);
  const [paginaAgenda, setPaginaAgenda] = useState(10);
  const cargadoRef = useRef<string | null>(null);
useEffect(() => {
  if (!user || cargadoRef.current === user.id) return;
  cargadoRef.current = user.id;

  getMyProfile(user.id, {
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    avatarUrl: user.avatarUrl,
  }).then((p) => {
    setProfile(p);
    setSelecciones(p.favoriteTeams.map((nombre, id) => ({ id, nombre })));
    setCiudades(p.favoriteCities.map((nombre, id) => ({ id, nombre })));
  });

  getMatches().then(setMatches).catch(() => {});
  http.get<Preferencia[]>("/api/usuarios/estadiosFav").then(setEstadios).catch(() => {});
}, [user]);

  const personalizedAgenda = useMemo(() => {
    if (!matches.length) return [];
    if (!selecciones.length && !estadios.length && !ciudades.length) return [];
    return matches.filter((m) =>
      hasMatchPreference(m, selecciones.map((s) => s.nombre), estadios, ciudades)
    );
  }, [matches, selecciones, estadios, ciudades]);

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
          background: `linear-gradient(rgba(4,20,13,.18), rgba(4,20,13,.70)), url(${bannerImages.home})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" sx={{ width: "100%" }}>
          <Avatar
            src={profile.avatarUrl}
            sx={{ width: 92, height: 92, border: "3px solid rgba(255,255,255,.75)", boxShadow: "0 18px 45px rgba(0,0,0,.35)" }}
          >
            {profile.name.charAt(0).toUpperCase()}
          </Avatar>
          <Stack spacing={0.5} sx={{ flex: 1, width: "100%" }}>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              Hola, {profile.name} {profile.lastName} ⚽
            </Typography>
            <Typography>{profile.email || "Correo pendiente"}</Typography>
          </Stack>
          <Button variant="contained" onClick={() => navigate("/profile")}>
            Editar perfil
          </Button>
        </Stack>
      </Paper>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Paper sx={{ p: 2.5, flex: 1 }}>
          <Typography sx={{ fontWeight: 900 }}>Tus favoritos ✨</Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>Equipos</Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
            {selecciones.length === 0 ? (
              <Typography color="text.secondary">Aún no has seleccionado equipos.</Typography>
            ) : (
              selecciones.map((s) => <Chip key={s.id} label={`⭐ ${s.nombre}`} />)
            )}
          </Stack>

          <Typography color="text.secondary" sx={{ mt: 2 }}>Estadios favoritos</Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
            {estadios.length === 0 ? (
              <Typography color="text.secondary">Aún no has seleccionado estadios.</Typography>
            ) : (
              estadios.map((e) => <Chip key={e.id} label={`🏟️ ${e.nombre}`} />)
            )}
          </Stack>

          <Typography color="text.secondary" sx={{ mt: 2 }}>Ciudades favoritas</Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
            {ciudades.length === 0 ? (
              <Typography color="text.secondary">Aún no has seleccionado ciudades.</Typography>
            ) : (
              ciudades.map((c) => <Chip key={c.id} label={`🌆 ${c.nombre}`} />)
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
          {personalizedAgenda.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography color="text.secondary">
                Aún no tienes preferencias configuradas, ve a tu perfil y agrega selecciones, estadios o ciudades favoritas para ver tu agenda personalizada
              </Typography>
            </Paper>
          ) : (
            <>
              {personalizedAgenda.slice(0, paginaAgenda).map((match) => (
                <Paper key={match.id} variant="outlined" sx={{ p: 1.5 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    {match.home.logo
                      ? <img src={match.home.logo} width={24} height={24} loading="lazy" style={{ verticalAlign: "middle" }} />
                      : <Typography sx={{ fontSize: 18 }}>🏳️</Typography>
                    }
                    <Typography sx={{ fontWeight: 700 }}>
                      {match.home.name} vs {match.away.name}
                    </Typography>
                    {match.away.logo
                      ? <img src={match.away.logo} width={24} height={24} loading="lazy" style={{ verticalAlign: "middle" }} />
                      : <Typography sx={{ fontSize: 18 }}>🏳️</Typography>
                    }
                  </Stack>
                  <Typography color="text.secondary">
                    🏟️ {match.city} · {match.stadium}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    🕒 {new Date(match.startTimeISO).toLocaleString("es-CO", { timeZone: "America/Bogota" })}
                  </Typography>
                </Paper>
              ))}
              {personalizedAgenda.length > paginaAgenda && (
                <Button variant="outlined" onClick={() => setPaginaAgenda(p => p + 10)} sx={{ alignSelf: "center" }}>
                  Ver más partidos ({personalizedAgenda.length - paginaAgenda} restantes)
                </Button>
              )}
            </>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}