import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import type { Match, MatchStatus } from "../types/match";
import type { Pool } from "../types/pool";
import type { SystemEvent, SystemEventType } from "../types/systemEvent";

import {
  adminCreateMatch,
  adminGetMatches,
  adminPublishResult,
  adminSetMatchStatus,
} from "../api/adminApi";
import { getPools } from "../api/poolsApi";
import { getSystemEvents } from "../api/eventsApi";
import { useApp } from "../context/AppContext";
import { formatTeam } from "../utils/countries";
import { validateRequired, type FieldErrors } from "../utils/validation";
import { bannerImages } from "../theme/bannerImages";

type Msg = { text: string; severity: "success" | "error" | "info" } | null;
type MatchField = "homeName" | "awayName" | "city" | "stadium" | "startLocal";

const statusLabels: Record<MatchStatus, string> = {
  SCHEDULED: "Programado",
  LIVE: "En vivo",
  PENDING_DATA: "Pendiente de datos",
  FINISHED: "Finalizado",
};

const statusColors: Record<MatchStatus, "default" | "success" | "warning" | "info"> = {
  SCHEDULED: "info",
  LIVE: "success",
  PENDING_DATA: "warning",
  FINISHED: "default",
};

const eventLabels: Record<SystemEventType, string> = {
  AUTH_LOGIN: "Inicio de sesión",
  AUTH_LOGOUT: "Cierre de sesión",
  USER_REGISTERED: "Registro",
  PROFILE_UPDATED: "Perfil actualizado",
  MATCH_CREATED: "Partido creado",
  MATCH_STATUS_CHANGED: "Estado de partido",
  MATCH_RESULT_PUBLISHED: "Resultado publicado",
  TICKET_RESERVED: "Entrada reservada",
  TICKET_CANCELLED: "Entrada cancelada",
  PAYMENT_CREATED: "Pago creado",
  PAYMENT_CONFIRMED: "Pago confirmado",
  PAYMENT_FAILED: "Pago fallido",
  PAYMENT_REFUNDED: "Pago reembolsado",
  SUPPORT_REQUEST_CREATED: "Soporte creado",
  SUPPORT_REQUEST_UPDATED: "Soporte actualizado",
};

function toLocalDatetimeInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function fromLocalDatetimeInputToISO(localValue: string) {
  return new Date(localValue).toISOString();
}

function makeTeamCode(name: string) {
  return name
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 3)
    .toUpperCase();
}

function validateScore(value: number, label: string) {
  if (!Number.isInteger(value)) return `${label} debe ser un número entero.`;
  if (value < 0) return `${label} no puede ser negativo.`;
  if (value > 20) return `${label} no puede ser mayor que 20.`;
  return "";
}

export default function Admin() {
  const { user } = useApp();

  const [tab, setTab] = useState(0);
  const [msg, setMsg] = useState<Msg>(null);
  const [loading, setLoading] = useState(false);

  const [matches, setMatches] = useState<Match[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [events, setEvents] = useState<SystemEvent[]>([]);

  const [homeName, setHomeName] = useState("");
  const [awayName, setAwayName] = useState("");
  const [city, setCity] = useState("");
  const [stadium, setStadium] = useState("");
  const [startLocal, setStartLocal] = useState(() =>
    toLocalDatetimeInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
  );
  const [assignToAllPools, setAssignToAllPools] = useState(true);
  const [errors, setErrors] = useState<FieldErrors<MatchField>>({});

  const [eventFilter, setEventFilter] = useState<SystemEventType | "ALL">("ALL");
  const [draft, setDraft] = useState<Record<string, { h: number; a: number }>>({});
  const [scoreErrors, setScoreErrors] = useState<Record<string, string>>({});

  const refresh = async () => {
    try {
      const [ms, ps, evs] = await Promise.all([
        adminGetMatches(),
        getPools(),
        getSystemEvents(),
      ]);

      setMatches(ms.slice().sort((a, b) => a.startTimeISO.localeCompare(b.startTimeISO)));
      setPools(ps);
      setEvents(evs);
    } catch {
      setMsg({ text: "No se pudo cargar la información del panel.", severity: "error" });
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const stats = useMemo(() => {
    const live = matches.filter((match) => match.status === "LIVE").length;
    const scheduled = matches.filter((match) => match.status === "SCHEDULED").length;
    const pending = matches.filter((match) => match.status === "PENDING_DATA").length;
    const members = pools.reduce((sum, pool) => sum + pool.members.length, 0);

    return [
      { label: "Partidos", value: matches.length },
      { label: "En vivo", value: live },
      { label: "Programados", value: scheduled },
      { label: "Por revisar", value: pending },
      { label: "Pollas", value: pools.length },
      { label: "Participantes", value: members },
    ];
  }, [matches, pools]);

  const poolsSorted = useMemo(
    () => pools.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [pools]
  );

  const eventsFiltered = useMemo(() => {
    if (eventFilter === "ALL") return events;
    return events.filter((event) => event.type === eventFilter);
  }, [events, eventFilter]);

  const eventTypes = useMemo(
    () => Array.from(new Set(events.map((event) => event.type))).sort(),
    [events]
  );

  const validateMatchForm = () => {
    const nextErrors: FieldErrors<MatchField> = {
      homeName: validateRequired(homeName, "El equipo local", 2),
      awayName: validateRequired(awayName, "El equipo visitante", 2),
      city: validateRequired(city, "La ciudad", 3),
      stadium: validateRequired(stadium, "El estadio", 3),
      startLocal: validateRequired(startLocal, "La fecha y hora"),
    };

    if (homeName.trim() && awayName.trim() && homeName.trim() === awayName.trim()) {
      nextErrors.awayName = "El visitante debe ser diferente al local.";
    }

    if (startLocal && new Date(startLocal).getTime() <= Date.now()) {
      nextErrors.startLocal = "La fecha debe ser futura para crear el partido.";
    }

    Object.keys(nextErrors).forEach((key) => {
      const typedKey = key as MatchField;
      if (!nextErrors[typedKey]) delete nextErrors[typedKey];
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onCreateMatch = async () => {
    if (!validateMatchForm()) return;

    try {
      setLoading(true);
      setMsg(null);

      const cleanHome = homeName.trim();
      const cleanAway = awayName.trim();

      await adminCreateMatch({
        home: {
          id: `team_${Date.now()}_home`,
          name: cleanHome,
          code: makeTeamCode(cleanHome),
        },
        away: {
          id: `team_${Date.now()}_away`,
          name: cleanAway,
          code: makeTeamCode(cleanAway),
        },
        city: city.trim(),
        stadium: stadium.trim(),
        startTimeISO: fromLocalDatetimeInputToISO(startLocal),
        status: "SCHEDULED",
        assignToAllPools,
      });

      setHomeName("");
      setAwayName("");
      setCity("");
      setStadium("");
      setStartLocal(
        toLocalDatetimeInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
      );
      setMsg({ text: "Partido creado y disponible para las pollas.", severity: "success" });
      await refresh();
    } catch (e) {
      setMsg({ text: (e as Error).message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onPublish = async (match: Match) => {
    const current = draft[match.id] ?? {
      h: match.score?.home ?? 0,
      a: match.score?.away ?? 0,
    };
    const error =
      validateScore(current.h, "El marcador local") ||
      validateScore(current.a, "El marcador visitante");

    if (error) {
      setScoreErrors((prev) => ({ ...prev, [match.id]: error }));
      return;
    }

    try {
      setLoading(true);
      setMsg(null);
      setScoreErrors((prev) => ({ ...prev, [match.id]: "" }));

      await adminPublishResult(match.id, current.h, current.a);
      setMsg({ text: "Resultado publicado y rankings recalculados.", severity: "success" });
      await refresh();
    } catch (e) {
      setMsg({ text: (e as Error).message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onStatus = async (matchId: string, status: MatchStatus) => {
    try {
      setLoading(true);
      setMsg(null);

      await adminSetMatchStatus(matchId, status);
      setMsg({ text: `Estado cambiado a ${statusLabels[status]}.`, severity: "success" });
      await refresh();
    } catch (e) {
      setMsg({ text: (e as Error).message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3.5 },
          overflow: "hidden",
          position: "relative",
          background:
            `linear-gradient(135deg, rgba(13,91,63,.94), rgba(24,122,78,.82)), url(${bannerImages.admin})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Stack spacing={2} sx={{ maxWidth: 920 }}>
          <Chip label="Operación Mundial 2026" sx={{ alignSelf: "flex-start" }} />
          <Typography variant="h4" sx={{ fontWeight: 950 }}>
            Panel administrativo
          </Typography>
          <Typography sx={{ color: "rgba(234,242,255,.84)", maxWidth: 760 }}>
            Gestiona partidos, publica marcadores y revisa cómo quedan las pollas después de cada
            resultado.
          </Typography>
          {user && (
            <Typography variant="caption" sx={{ color: "rgba(234,242,255,.74)" }}>
              Sesión operativa: {user.name}
            </Typography>
          )}
        </Stack>
      </Paper>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1.5 }}>
        {stats.map((stat) => (
          <Paper key={stat.label} sx={{ p: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 950 }}>
              {stat.value}
            </Typography>
            <Typography color="text.secondary">{stat.label}</Typography>
          </Paper>
        ))}
      </Box>

      {msg && <Alert severity={msg.severity}>{msg.text}</Alert>}

      <Paper sx={{ p: 1 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
          <Tab label="Calendario" />
          <Tab label="Pollas y ranking" />
          <Tab label="Auditoría" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Stack spacing={2}>
          <Paper sx={{ p: 2.5 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
              <Box>
                <Typography variant="h6">Crear partido</Typography>
                <Typography color="text.secondary">
                  Todos los campos validan antes de enviarse al servicio de partidos.
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={assignToAllPools}
                    onChange={(event) => setAssignToAllPools(event.target.checked)}
                    disabled={loading}
                  />
                }
                label="Asignar a todas las pollas"
              />
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(5, 1fr)" },
                gap: 1.5,
                mt: 2,
              }}
            >
              <TextField
                label="Equipo local"
                value={homeName}
                onChange={(event) => setHomeName(event.target.value)}
                error={Boolean(errors.homeName)}
                helperText={errors.homeName || "Ejemplo: Colombia"}
                disabled={loading}
              />
              <TextField
                label="Equipo visitante"
                value={awayName}
                onChange={(event) => setAwayName(event.target.value)}
                error={Boolean(errors.awayName)}
                helperText={errors.awayName || "Ejemplo: México"}
                disabled={loading}
              />
              <TextField
                label="Ciudad"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                error={Boolean(errors.city)}
                helperText={errors.city || "Ciudad sede"}
                disabled={loading}
              />
              <TextField
                label="Estadio"
                value={stadium}
                onChange={(event) => setStadium(event.target.value)}
                error={Boolean(errors.stadium)}
                helperText={errors.stadium || "Nombre oficial"}
                disabled={loading}
              />
              <TextField
                label="Fecha y hora"
                type="datetime-local"
                value={startLocal}
                onChange={(event) => setStartLocal(event.target.value)}
                error={Boolean(errors.startLocal)}
                helperText={errors.startLocal || "Debe ser futura"}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Button variant="contained" onClick={onCreateMatch} disabled={loading} sx={{ mt: 2 }}>
              Crear partido
            </Button>
          </Paper>

          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6">Gestión de partidos</Typography>
            {matches.length === 0 ? (
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Todavía no hay partidos cargados.
              </Typography>
            ) : (
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {matches.map((match) => {
                  const current = draft[match.id] ?? {
                    h: match.score?.home ?? 0,
                    a: match.score?.away ?? 0,
                  };
                  const canPublish = match.status === "FINISHED" || match.status === "PENDING_DATA";

                  return (
                    <Paper key={match.id} variant="outlined" sx={{ p: 2 }}>
                      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                            <Typography sx={{ fontWeight: 900 }}>
                              {formatTeam(match.home)} vs {formatTeam(match.away)}
                            </Typography>
                            <Chip
                              size="small"
                              color={statusColors[match.status]}
                              label={statusLabels[match.status]}
                            />
                          </Stack>
                          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                            {new Date(match.startTimeISO).toLocaleString()} · {match.city} · {match.stadium}
                          </Typography>
                          {match.score && (
                            <Typography sx={{ mt: 0.5, fontWeight: 800 }}>
                              Marcador actual: {match.score.home} - {match.score.away}
                            </Typography>
                          )}
                        </Box>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <Button
                              key={value}
                              size="small"
                              variant={match.status === value ? "contained" : "outlined"}
                              onClick={() => onStatus(match.id, value as MatchStatus)}
                              disabled={loading}
                            >
                              {label}
                            </Button>
                          ))}
                        </Stack>
                      </Stack>

                      <Divider sx={{ my: 2 }} />

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "flex-start" }}>
                        <TextField
                          label="Goles local"
                          type="number"
                          size="small"
                          value={current.h}
                          inputProps={{ min: 0, max: 20 }}
                          onChange={(event) =>
                            setDraft((prev) => ({
                              ...prev,
                              [match.id]: { h: Number(event.target.value), a: current.a },
                            }))
                          }
                          disabled={loading}
                        />
                        <TextField
                          label="Goles visitante"
                          type="number"
                          size="small"
                          value={current.a}
                          inputProps={{ min: 0, max: 20 }}
                          onChange={(event) =>
                            setDraft((prev) => ({
                              ...prev,
                              [match.id]: { h: current.h, a: Number(event.target.value) },
                            }))
                          }
                          disabled={loading}
                        />
                        <Button
                          variant="contained"
                          disabled={!canPublish || loading}
                          onClick={() => onPublish(match)}
                        >
                          Publicar resultado
                        </Button>
                      </Stack>
                      <Typography variant="caption" color={scoreErrors[match.id] ? "error" : "text.secondary"} sx={{ mt: 1, display: "block" }}>
                        {scoreErrors[match.id] ||
                          "Publica cuando el partido esté finalizado o pendiente de datos."}
                      </Typography>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Stack>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 2.5 }}>
          <Typography variant="h6">Pollas y ranking</Typography>
          <Typography color="text.secondary">
            Revisa miembros, códigos y partidos asignados.
          </Typography>

          {poolsSorted.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              No hay pollas registradas.
            </Typography>
          ) : (
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {poolsSorted.map((pool) => (
                <Paper key={pool.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                    <Box>
                      <Typography sx={{ fontWeight: 900 }}>{pool.name}</Typography>
                      <Typography color="text.secondary">
                        Código {pool.code} · {pool.matchIds.length} partidos · {pool.members.length} miembros
                      </Typography>
                    </Box>
                    <Chip label={`${pool.members.reduce((sum, member) => sum + (member.points ?? 0), 0)} puntos`} />
                  </Stack>

                  <Stack spacing={0.75} sx={{ mt: 1.5 }}>
                    {pool.members
                      .slice()
                      .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
                      .map((member, index) => (
                        <Box
                          key={member.user.id}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 2,
                            py: 0.75,
                            borderBottom: "1px solid rgba(234,242,255,0.08)",
                          }}
                        >
                          <Typography>
                            {index + 1}. {member.user.name}
                          </Typography>
                          <Typography sx={{ fontWeight: 900 }}>{member.points ?? 0} pts</Typography>
                        </Box>
                      ))}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      )}

      {tab === 2 && (
        <Paper sx={{ p: 2.5 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
            <Box>
              <Typography variant="h6">Auditoría del sistema</Typography>
              <Typography color="text.secondary">
                Movimientos recientes de autenticación, partidos, pagos y soporte.
              </Typography>
            </Box>
            <TextField
              select
              label="Filtrar evento"
              value={eventFilter}
              onChange={(event) => setEventFilter(event.target.value as SystemEventType | "ALL")}
              sx={{ minWidth: 240 }}
            >
              <MenuItem value="ALL">Todos</MenuItem>
              {eventTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {eventLabels[type]}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {eventsFiltered.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              No hay eventos para este filtro.
            </Typography>
          ) : (
            <Stack spacing={1} sx={{ mt: 2 }}>
              {eventsFiltered.map((event) => (
                <Paper key={event.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
                    <Box>
                      <Typography sx={{ fontWeight: 900 }}>
                        {eventLabels[event.type] ?? event.type}
                      </Typography>
                      <Typography color="text.secondary">{event.message}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(event.createdAt).toLocaleString()}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                    {event.actorName && <Chip size="small" label={`Actor: ${event.actorName}`} />}
                    {event.entityType && <Chip size="small" label={`Entidad: ${event.entityType}`} variant="outlined" />}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      )}
    </Stack>
  );
}
