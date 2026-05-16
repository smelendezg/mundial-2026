import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Alert, Button, Paper, Stack, TextField, Typography,
} from "@mui/material";

import { useApp } from "../context/AppContext";
import type { Pool } from "../types/pool";
import type { Match } from "../types/match";
import { obtenerApuesta } from "../api/poolsApi";
import { getMatches } from "../api/matchesApi";
import { upsertPrediction, getMyPredictions, CLOSE_MINUTES_BEFORE } from "../api/predictionsApi";

type Msg = { text: string; severity: "success" | "error" } | null;

function isClosed(match: Match) {
  const start = new Date(match.startTimeISO).getTime();
  const lockAt = start - CLOSE_MINUTES_BEFORE * 60_000;
  return Date.now() >= lockAt || match.status === "LIVE" || match.status === "FINISHED";
}

export default function PollPronostico() {
  const { id } = useParams();
  const { user } = useApp();
  const navigate = useNavigate();

  const [pool, setPool] = useState<Pool | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [misPronosticosIds, setMisPronosticosIds] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<Record<string, { hs: number; as: number }>>({});
  const [msg, setMsg] = useState<Msg>(null);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const load = async () => {
    if (!id || !user) return;
    const [poolData, allMatches, misProns] = await Promise.all([
      obtenerApuesta(Number(id)),
     getMatches(),
      getMyPredictions(String(id), user.id),
    ]);
    setPool(poolData);

    // filtrar partidos ya pronosticados
    const idsPronosticados = new Set(misProns.map((p) => String(p.matchId)));
    setMisPronosticosIds(idsPronosticados);

    // solo mostrar partidos sin pronosticar
    const sinPronosticar = allMatches.filter((m) => !idsPronosticados.has(String(m.id)));
    setMatches(sinPronosticar);
  };

  useEffect(() => {
    load().catch(() =>
      setMsg({ text: "No se pudo cargar la información.", severity: "error" })
    );
  }, [id, user?.id]);

  const onGuardar = async (matchId: string) => {
    if (!pool || !user) return;
    const d = draft[matchId] ?? { hs: 0, as: 0 };
    const homeScore = Number(d.hs);
    const awayScore = Number(d.as);

    if (
      !Number.isInteger(homeScore) ||
      !Number.isInteger(awayScore) ||
      homeScore < 0 || awayScore < 0 ||
      homeScore > 20 || awayScore > 20
    ) {
      setMsg({ text: "El marcador debe tener números enteros entre 0 y 20.", severity: "error" });
      return;
    }

    try {
      setLoading(true);
      setMsg(null);
      await upsertPrediction(String(pool.id), user.id, matchId, homeScore, awayScore);

      // marcar como guardado y quitar de la lista
      setSavedIds((prev) => new Set(prev).add(matchId));
      setMisPronosticosIds((prev) => new Set(prev).add(matchId));
      setMatches((prev) => prev.filter((m) => String(m.id) !== matchId));

      setMsg({ text: "Pronóstico guardado. Puedes editarlo desde Info polla.", severity: "success" });
    } catch (e) {
      setMsg({ text: (e as Error).message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!pool) return <Alert severity="info">Cargando partidos...</Alert>;
  if (!user) return <Alert severity="warning">Inicia sesión.</Alert>;
  if (pool.estado === "CERRADA") {
    return (
      <Stack spacing={2}>
        <Alert severity="warning">
          Esta polla está cerrada. No se pueden registrar pronósticos.
        </Alert>
        <Button variant="outlined" onClick={() => navigate(`/pools/${id}/info`)}>
          ← Ver info polla
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">Registrar pronóstico</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {pool.name} — pronósticos cierran {CLOSE_MINUTES_BEFORE} min antes del partido
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="outlined" size="small" onClick={() => navigate(`/pools/${id}/info`)}>
            ← Ver mis pronósticos
          </Button>
        </Stack>
      </Paper>

      {msg && <Alert severity={msg.severity}>{msg.text}</Alert>}

      {matches.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">
            Ya tienes pronósticos en todos los partidos disponibles. Para editarlos ve a Info polla.
          </Typography>
          <Button
            variant="contained"
            size="small"
            sx={{ mt: 2 }}
            onClick={() => navigate(`/pools/${id}/info`)}
          >
            Ver mis pronósticos
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {matches.map((m) => {
            const closed = isClosed(m);
            const d = draft[m.id] ?? { hs: 0, as: 0 };
            const saved = savedIds.has(m.id);

            return (
              <Paper key={m.id} variant="outlined" sx={{ p: 2 }}>
                <Typography fontWeight={700}>
                  {m.home.name} vs {m.away.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(m.startTimeISO).toLocaleString("es-CO", { timeZone: "America/Bogota" })}
                  {closed ? " • CERRADO" : " • ABIERTO"}
                  {m.status ? ` • ${m.status}` : ""}
                </Typography>

                {m.score && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Resultado: {m.score.home} - {m.score.away}
                  </Typography>
                )}

                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
                  <TextField
                    label="Local"
                    type="number"
                    size="small"
                    value={d.hs}
                    disabled={closed || loading}
                    slotProps={{ htmlInput: { min: 0, max: 20 } }}
                    sx={{ width: 80 }}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        [m.id]: { hs: Number(e.target.value), as: prev[m.id]?.as ?? 0 },
                      }))
                    }
                  />
                  <TextField
                    label="Visitante"
                    type="number"
                    size="small"
                    value={d.as}
                    disabled={closed || loading}
                    slotProps={{ htmlInput: { min: 0, max: 20 } }}
                    sx={{ width: 80 }}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        [m.id]: { hs: prev[m.id]?.hs ?? 0, as: Number(e.target.value) },
                      }))
                    }
                  />
                  <Button
                    variant="contained"
                    size="small"
                    disabled={closed || loading || saved}
                    onClick={() => onGuardar(String(m.id))}
                  >
                    Guardar
                  </Button>
                  {saved && (
                    <Typography variant="caption" color="success.main">
                      ✓ Guardado
                    </Typography>
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}