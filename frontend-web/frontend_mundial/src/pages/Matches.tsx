import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { getMatches, getMatchesByDate, getLiveMatches } from "../api/matchesApi";
import type { Match, MatchStatus } from "../types/match";
import { bannerImages } from "../theme/bannerImages";

type Msg = { text: string; severity: "success" | "error" | "info" } | null;

const statusLabels: Record<MatchStatus, string> = {
  SCHEDULED: "Programado",
  LIVE: "En juego",
  FINISHED: "Finalizado",
  PENDING_DATA: "Pendiente",
};

export default function Matches() {
  const [items, setItems] = useState<Match[]>([]);
  const [teamFilter, setTeamFilter] = useState("");
  const [placeFilter, setPlaceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<MatchStatus | "ALL">("ALL");
  const [fechaFilter, setFechaFilter] = useState("");
  const [msg, setMsg] = useState<Msg>(null);

  useEffect(() => {
    getMatches()
      .then(setItems)
      .catch(() => {
        setMsg({
          text: "No se pudieron cargar los partidos.",
          severity: "error",
        });
      });
  }, []);

  const buscarPorFecha = async () => {
    if (!fechaFilter) return;
    try {
      const res = await getMatchesByDate(fechaFilter);
      setItems(res);
      setMsg(null);
    } catch {
      setMsg({ text: "No se pudieron cargar los partidos de esa fecha.", severity: "error" });
    }
  };

  const buscarEnVivo = async () => {
    try {
      const res = await getLiveMatches();
      setItems(res);
      setMsg(res.length === 0 ? { text: "No hay partidos en vivo ahora mismo.", severity: "info" } : null);
    } catch {
      setMsg({ text: "No se pudieron cargar los partidos en vivo.", severity: "error" });
    }
  };

  const clearFilters = () => {
    setTeamFilter("");
    setPlaceFilter("");
    setStatusFilter("ALL");
    setFechaFilter("");
    getMatches().then(setItems).catch(() => {});
  };

  const filteredItems = useMemo(() => {
    const team = teamFilter.trim().toLowerCase();
    const place = placeFilter.trim().toLowerCase();

    return items.filter((match) => {
      const matchTeams = `${match.home.name} ${match.home.code ?? ""} ${match.away.name} ${match.away.code ?? ""}`.toLowerCase();
      const matchPlace = `${match.city} ${match.stadium}`.toLowerCase();
      const matchesTeam = !team || matchTeams.includes(team);
      const matchesPlace = !place || matchPlace.includes(place);
      const matchesStatus = statusFilter === "ALL" || match.status === statusFilter;
      return matchesTeam && matchesPlace && matchesStatus;
    });
  }, [items, placeFilter, statusFilter, teamFilter]);

  return (
    <Stack spacing={2}>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3 },
          minHeight: 230,
          display: "flex",
          alignItems: "end",
          background: `linear-gradient(rgba(4,20,13,.25), rgba(4,20,13,.65)), url(${bannerImages.matches})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Partidos del Mundial ⚽
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 620, mt: 1 }}>
            Filtra por selección, estadio o ciudad y mira cada cruce con sus banderas.
          </Typography>
        </Box>
      </Paper>

      {msg && <Alert severity={msg.severity}>{msg.text}</Alert>}

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField
            label="Selección"
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            placeholder="Colombia, Mexico"
            fullWidth
          />
          <TextField
            label="Ciudad o estadio"
            value={placeFilter}
            onChange={(e) => setPlaceFilter(e.target.value)}
            placeholder="Ciudad de México, Azteca"
            fullWidth
          />
          <TextField
            select
            label="Estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as MatchStatus | "ALL")}
            sx={{ minWidth: { md: 190 } }}
          >
            <MenuItem value="ALL">Todos</MenuItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </TextField>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 1.5 }}>
          <TextField
            label="Filtrar por fecha"
            type="date"
            value={fechaFilter}
            onChange={(e) => setFechaFilter(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 200 }}
          />
          <Button variant="outlined" onClick={buscarPorFecha}>Buscar por fecha</Button>
          <Button variant="outlined" color="warning" onClick={buscarEnVivo}>
            🔴 En vivo
          </Button>
          <Button variant="outlined" onClick={clearFilters}>Limpiar</Button>
        </Stack>
      </Paper>

      {filteredItems.length === 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary">No hay partidos con esos filtros.</Typography>
        </Paper>
      ) : (
        filteredItems.map((match) => (
          <Paper key={match.id} variant="outlined" sx={{ p: 2.5 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "center" }}
              spacing={2}
            >
              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
                  {match.home.logo
                    ? <img src={match.home.logo} width={28} height={28} style={{ verticalAlign: "middle" }} />
                    : <Typography sx={{ fontSize: 22 }}>🏳️</Typography>
                  }
                  <Typography sx={{ fontWeight: 900 }}>
                    {match.home.name} vs {match.away.name}
                  </Typography>
                  {match.away.logo
                    ? <img src={match.away.logo} width={28} height={28} style={{ verticalAlign: "middle" }} />
                    : <Typography sx={{ fontSize: 22 }}>🏳️</Typography>
                  }
                </Stack>
                <Typography color="text.secondary">
                  🏟️ {match.city} · {match.stadium}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  🕒 {new Date(match.startTimeISO).toLocaleString("es-CO", { timeZone: "America/Bogota" })}
                </Typography>
                {match.score && (
                  <Typography>
                    🥅 Resultado: {match.score.home} - {match.score.away}
                  </Typography>
                )}
              </Stack>
              <Chip
                label={`✨ ${statusLabels[match.status]}`}
                variant="outlined"
                color={match.status === "LIVE" ? "error" : "default"}
              />
            </Stack>
          </Paper>
        ))
      )}
    </Stack>
  );
}