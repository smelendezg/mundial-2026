import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Alert, Button, Chip, Paper, Stack, TextField, Typography,
} from "@mui/material";

import { useApp } from "../context/AppContext";
import type { Pool } from "../types/pool";
import type { Prediction } from "../types/prediction";
import type { Match } from "../types/match";
import { obtenerApuesta, obtenerRanking } from "../api/poolsApi";
import { getMyPredictions, editarPronostico, eliminarPronostico } from "../api/predictionsApi";
import { getMatches } from "../api/matchesApi";
import { http } from "../api/http";

type Msg = { text: string; severity: "success" | "error" } | null;

interface RankingItem {
  usuarioId: number;
  puntos: number;
  posicionRanking?: number;
}

interface UsuarioDTO {
  id: number;
  nombre: string;
  apellido: string;
}

export default function PollInfo() {
  const { id } = useParams();
  const { user } = useApp();
  const navigate = useNavigate();

  const [pool, setPool] = useState<Pool | null>(null);
  const [mine, setMine] = useState<Prediction[]>([]);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [nombresUsuarios, setNombresUsuarios] = useState<Map<number, string>>(new Map());
  const [msg, setMsg] = useState<Msg>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ hs: number; as: number }>({ hs: 0, as: 0 });

  const load = async () => {
    if (!id || !user) return;
    const apuestaId = Number(id);

    const [poolData, misProns, rankingData, allMatches] = await Promise.all([
      obtenerApuesta(apuestaId),
      getMyPredictions(String(apuestaId), user.id),
      obtenerRanking(apuestaId),
getMatches(),
    ]);

    setPool(poolData);
    setMine(misProns);
    setRanking(rankingData);
    setMatches(allMatches);

    const nombresMap = new Map<number, string>();
    await Promise.all(
      rankingData.map(async (r) => {
        try {
          const u = await http.get<UsuarioDTO>(`/api/usuarios/${r.usuarioId}`);
          nombresMap.set(r.usuarioId, `${u.nombre} ${u.apellido}`);
        } catch {
          nombresMap.set(r.usuarioId, `Usuario ${r.usuarioId}`);
        }
      })
    );
    setNombresUsuarios(nombresMap);
  };

  useEffect(() => {
    load().catch(() =>
      setMsg({ text: "No se pudo cargar la info de la polla.", severity: "error" })
    );
  }, [id, user?.id]);

  
  const getMatchName = (matchId: string) => {
    const m = matches.find((m) => String(m.id) === String(matchId));
    if (!m) return `Partido ${matchId}`;
    return `${m.home.name} vs ${m.away.name}`;
  };

  const onEditar = (pred: Prediction) => {
    setEditingId(pred.id);
    setEditDraft({ hs: pred.homeScore, as: pred.awayScore });
  };

  const onGuardarEdicion = async (pred: Prediction) => {
    try {
      setLoading(true);
      setMsg(null);
      await editarPronostico(pred.id, editDraft.hs, editDraft.as);
      setEditingId(null);
      setMsg({ text: "Pronóstico editado correctamente.", severity: "success" });
      await load();
    } catch (e) {
      setMsg({ text: (e as Error).message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onEliminar = async (pronosticoId: string) => {
    if (!confirm("¿Seguro que quieres eliminar este pronóstico?")) return;
    try {
      setLoading(true);
      setMsg(null);
      await eliminarPronostico(pronosticoId);
      setMsg({ text: "Pronóstico eliminado.", severity: "success" });
      await load();
    } catch (e) {
      setMsg({ text: (e as Error).message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!pool) return <Alert severity="info">Cargando info de la polla...</Alert>;
  if (!user) return <Alert severity="warning">Inicia sesión.</Alert>;

  const esCerrada = pool.estado === "CERRADA";

  return (
    <Stack spacing={2}>
      {/* Header */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
          <Typography variant="h5">{pool.name}</Typography>
          <Chip
            label={esCerrada ? "CERRADA" : "ABIERTA"}
            color={esCerrada ? "default" : "success"}
            size="small"
          />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Código: {pool.code}
        </Typography>
        {pool.fechaCierre && (
          <Typography variant="caption" color="text.secondary">
            Cierra: {new Date(pool.fechaCierre).toLocaleString()}
          </Typography>
        )}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="outlined" size="small" onClick={() => navigate("/pools")}>
            ← Volver
          </Button>
          {!esCerrada && (
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate(`/pools/${id}/pronostico`)}
            >
              Registrar pronóstico
            </Button>
          )}
        </Stack>
      </Paper>

      {msg && <Alert severity={msg.severity}>{msg.text}</Alert>}

      {/* Mis pronósticos */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Mis pronósticos
        </Typography>

        {mine.length === 0 ? (
          <Typography color="text.secondary">
            Aún no tienes pronósticos en esta polla.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {mine.map((pred) => (
              <Paper key={pred.id} variant="outlined" sx={{ p: 2 }}>
                <Typography fontWeight={600}>
                  {getMatchName(pred.matchId)}
                </Typography>

                {editingId === pred.id ? (
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <TextField
                      label="Local"
                      type="number"
                      size="small"
                      value={editDraft.hs}
                      onChange={(e) =>
                        setEditDraft((prev) => ({ ...prev, hs: Number(e.target.value) }))
                      }
                      slotProps={{ htmlInput: { min: 0, max: 20 } }}
                      sx={{ width: 80 }}
                    />
                    <TextField
                      label="Visitante"
                      type="number"
                      size="small"
                      value={editDraft.as}
                      onChange={(e) =>
                        setEditDraft((prev) => ({ ...prev, as: Number(e.target.value) }))
                      }
                      slotProps={{ htmlInput: { min: 0, max: 20 } }}
                      sx={{ width: 80 }}
                    />
                    <Button variant="contained" size="small" disabled={loading}
                      onClick={() => onGuardarEdicion(pred)}>
                      Guardar
                    </Button>
                    <Button variant="text" size="small" onClick={() => setEditingId(null)}>
                      Cancelar
                    </Button>
                  </Stack>
                ) : (
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Typography>
                      {pred.homeScore} - {pred.awayScore}
                    </Typography>
                    {pred.points !== undefined && pred.points > 0 && (
                      <Chip label={`${pred.points} pts`} size="small" color="primary" />
                    )}
                    {!esCerrada && (
                      <>
                        <Button size="small" variant="outlined"
                          onClick={() => onEditar(pred)} disabled={loading}>
                          Editar
                        </Button>
                        <Button size="small" variant="outlined" color="error"
                          onClick={() => onEliminar(pred.id)} disabled={loading}>
                          Eliminar
                        </Button>
                      </>
                    )}
                  </Stack>
                )}
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>

      {/* Ranking */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {esCerrada ? "🏆 Ranking Final" : "🔄 Ranking Parcial"}
        </Typography>

        {ranking.length === 0 ? (
          <Typography color="text.secondary">Sin datos de ranking aún.</Typography>
        ) : (
          <Stack spacing={0.5}>
            {ranking.map((r, i) => (
              <Typography key={r.usuarioId}>
                {i + 1}. {nombresUsuarios.get(r.usuarioId) ?? `Usuario ${r.usuarioId}`}: {r.puntos} pts
              </Typography>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}