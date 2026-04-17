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

import { getMatches } from "../api/matchesApi";
import type { Match, MatchStatus } from "../types/match";
import { formatTeam, getTeamFlag } from "../utils/countries";
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
  const [msg, setMsg] = useState<Msg>(null);

  useEffect(() => {
    getMatches()
      .then(setItems)
      .catch(() => {
        setMsg({
          text: "No se pudieron cargar los partidos. Se mostrará el último estado disponible cuando exista caché local.",
          severity: "error",
        });
      });
  }, []);

  const filteredItems = useMemo(() => {
    const team = teamFilter.trim().toLowerCase();
    const place = placeFilter.trim().toLowerCase();

    return items.filter((match) => {
      const matchTeams = `${match.home.name} ${match.home.code ?? ""} ${match.away.name} ${
        match.away.code ?? ""
      }`.toLowerCase();
      const matchPlace = `${match.city} ${match.stadium}`.toLowerCase();

      const matchesTeam = !team || matchTeams.includes(team);
      const matchesPlace = !place || matchPlace.includes(place);
      const matchesStatus = statusFilter === "ALL" || match.status === statusFilter;

      return matchesTeam && matchesPlace && matchesStatus;
    });
  }, [items, placeFilter, statusFilter, teamFilter]);

  const clearFilters = () => {
    setTeamFilter("");
    setPlaceFilter("");
    setStatusFilter("ALL");
  };

  return (
    <Stack spacing={2}>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3 },
          minHeight: 230,
          display: "flex",
          alignItems: "end",
          background:
            `linear-gradient(rgba(4,20,13,.25), rgba(4,20,13,.65)), url(${bannerImages.matches})`,
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
            placeholder="Colombia, ARG, Brasil"
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
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" onClick={clearFilters}>
            Limpiar
          </Button>
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
                  <Typography sx={{ fontWeight: 900, fontSize: 22 }}>
                    {getTeamFlag(match.home)}
                  </Typography>
                  <Typography sx={{ fontWeight: 900 }}>
                    {formatTeam(match.home)} vs {formatTeam(match.away)}
                  </Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: 22 }}>
                    {getTeamFlag(match.away)}
                  </Typography>
                </Stack>
                <Typography color="text.secondary">
                  🏟️ {match.city} · {match.stadium}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  🕒 {new Date(match.startTimeISO).toLocaleString()}
                </Typography>
                {match.score && (
                  <Typography>
                    🥅 Resultado: {match.score.home} - {match.score.away}
                  </Typography>
                )}
              </Stack>

              <Chip label={`✨ ${statusLabels[match.status]}`} variant="outlined" />
            </Stack>
          </Paper>
        ))
      )}
    </Stack>
  );
}
