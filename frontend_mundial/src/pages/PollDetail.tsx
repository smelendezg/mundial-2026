import { useParams } from "react-router-dom"; 

import { useEffect, useMemo, useState } from "react"; 

import { Alert, Button, Paper, Stack, TextField, Typography } from "@mui/material"; 

 

import { useApp } from "../context/AppContext"; 

import type { Pool } from "../types/pool"; 

import type { Match } from "../types/match"; 

import type { Prediction } from "../types/prediction"; 

 

import { getPools } from "../api/poolsApi"; 
import { getMatches } from "../api/matchesApi";

 

import { 

  getPredictionsByPool, 

  getMyPredictions, 

  upsertPrediction, 

  CLOSE_MINUTES_BEFORE, 

} from "../api/predictionsApi"; 

 

type Msg = { text: string; severity: "success" | "error" | "info" } | null; 

 

function isClosed(match: Match) { 

  const start = new Date(match.startTimeISO).getTime(); 

  const lockAt = start - CLOSE_MINUTES_BEFORE * 60_000; 

  return Date.now() >= lockAt; 

} 

 

export default function PoolDetail() { 

  const { code } = useParams(); 

  const { user } = useApp(); 

 

  const [pool, setPool] = useState<Pool | null>(null); 

  const [matches, setMatches] = useState<Match[]>([]); 

  const [mine, setMine] = useState<Prediction[]>([]); 

  const [allPreds, setAllPreds] = useState<Prediction[]>([]); 

  const [msg, setMsg] = useState<Msg>(null); 

 

  const [draft, setDraft] = useState<Record<string, { hs: number; as: number }>>({}); 

 

  const refresh = async (p: Pool, currentUserId?: string) => { 

    const allMatches = await getMatches();
    const ms = allMatches.filter((m) => p.matchIds.includes(m.id)); 

    setMatches(ms); 

 

    // mis preds 

    if (currentUserId) { 

      const my = await getMyPredictions(p.id, currentUserId); 

      setMine(my); 

 

      const nextDraft: Record<string, { hs: number; as: number }> = {}; 

      for (const m of ms) { 

        const pr = my.find((x) => x.matchId === m.id); 

        nextDraft[m.id] = { hs: pr?.homeScore ?? 0, as: pr?.awayScore ?? 0 }; 

      } 

      setDraft(nextDraft); 

    } else { 

      setMine([]); 

      setDraft({}); 

    } 

 

    const ap = await getPredictionsByPool(p.id); 

    setAllPreds(ap); 

  }; 

 

  useEffect(() => { 

    const load = async () => { 

      const pools = await getPools(); 

      const found = pools.find((p) => p.code === code) ?? null; 

      setPool(found); 

      if (found) await refresh(found, user?.id); 

    }; 

    load(); 

  }, [code, user?.id]); 

 

  const myMap = useMemo(() => { 

    const m = new Map<string, Prediction>(); 

    mine.forEach((p) => m.set(p.matchId, p)); 

    return m; 

  }, [mine]); 

 

  const nameById = useMemo(() => { 

    const map = new Map<string, string>(); 

    if (!pool) return map; 

    pool.members.forEach((mem) => map.set(mem.user.id, mem.user.name)); 

    return map; 

  }, [pool]); 

 

  const ranking = useMemo(() => { 

    if (!pool) return []; 

    return pool.members 

      .slice() 

      .map((mem) => ({ user: mem.user, points: mem.points })) 

      .sort((a, b) => b.points - a.points); 

  }, [pool]); 

 

  if (!pool) return <Alert severity="error">Polla no encontrada</Alert>; 

  if (!user) return <Alert severity="warning">Inicia sesión para pronosticar.</Alert>; 

 

  const onSave = async (matchId: string) => { 

    try { 

      setMsg(null); 

      const d = draft[matchId] ?? { hs: 0, as: 0 }; 
      const homeScore = Number(d.hs);
      const awayScore = Number(d.as);

      if (
        !Number.isInteger(homeScore) ||
        !Number.isInteger(awayScore) ||
        homeScore < 0 ||
        awayScore < 0 ||
        homeScore > 20 ||
        awayScore > 20
      ) {
        setMsg({
          text: "El marcador debe tener números enteros entre 0 y 20.",
          severity: "error",
        });
        return;
      }

      await upsertPrediction(pool.id, user.id, matchId, homeScore, awayScore); 

 

      setMsg({ text: "Pronóstico guardado correctamente.", severity: "success" }); 

 

      const pools = await getPools(); 

      const updated = pools.find((p) => p.code === code) ?? pool; 

      setPool(updated); 

      await refresh(updated, user.id); 

    } catch (e) { 

      setMsg({ text: (e as Error).message, severity: "error" }); 

 

      const pools = await getPools(); 

      const updated = pools.find((p) => p.code === code) ?? pool; 

      setPool(updated); 

      await refresh(updated, user.id);

    } 

  }; 

 

  return ( 

    <Stack spacing={2}> 

      <Paper sx={{ p: 3 }}> 

        <Typography variant="h5">{pool.name}</Typography> 

        <Typography sx={{ mt: 1 }}>Código: {pool.code}</Typography> 

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}> 

          Cierre de pronóstico: {CLOSE_MINUTES_BEFORE} min antes del partido. 

        </Typography> 

      </Paper> 

 

      {msg && <Alert severity={msg.severity}>{msg.text}</Alert>} 

 

      <Paper sx={{ p: 3 }}> 

        <Typography variant="h6">Pronósticos</Typography> 

 

        {matches.length === 0 ? ( 

          <Typography color="text.secondary" sx={{ mt: 1 }}> 

            Esta polla aún no tiene partidos asignados. 

          </Typography> 

        ) : ( 

          <Stack spacing={2} sx={{ mt: 2 }}> 

            {matches.map((m) => { 

              const my = myMap.get(m.id); 

              const closed = isClosed(m); 

              const d = draft[m.id] ?? { hs: my?.homeScore ?? 0, as: my?.awayScore ?? 0 }; 

 

              const predsForMatch = allPreds.filter((p) => p.matchId === m.id); 

 

              return ( 

                <Paper key={m.id} variant="outlined" sx={{ p: 2 }}> 

                  <Typography sx={{ fontWeight: 700 }}> 

                    {m.home.name} vs {m.away.name} 

                  </Typography> 

 

                  <Typography color="text.secondary"> 

                    {new Date(m.startTimeISO).toLocaleString()} 

                    {closed ? " • CERRADO" : " • ABIERTO"} 

                    {m.status ? ` • ${m.status}` : ""} 

                  </Typography> 

 

                  {m.score && ( 

                    <Typography sx={{ mt: 1 }}> 

                      Resultado final: {m.score.home} - {m.score.away} 

                    </Typography> 

                  )} 

 

                  <Stack direction="row" spacing={1} sx={{ mt: 2 }} alignItems="center"> 

                    <TextField 

                      label="Local" 

                      type="number" 

                      size="small" 

                      value={d.hs} 

                      disabled={closed} 

                      inputProps={{ min: 0, max: 20 }} 

                      onChange={(e) => 

                        setDraft((prev) => ({ 

                          ...prev, 

                          [m.id]: { hs: Number(e.target.value), as: prev[m.id]?.as ?? d.as }, 

                        })) 

                      } 

                    /> 

                    <TextField 

                      label="Visitante" 

                      type="number" 

                      size="small" 

                      value={d.as} 

                      disabled={closed} 

                      inputProps={{ min: 0, max: 20 }} 

                      onChange={(e) => 

                        setDraft((prev) => ({ 

                          ...prev, 

                          [m.id]: { hs: prev[m.id]?.hs ?? d.hs, as: Number(e.target.value) }, 

                        })) 

                      } 

                    /> 

 

                    <Button variant="contained" disabled={closed} onClick={() => onSave(m.id)}> 

                      Guardar 

                    </Button> 

                  </Stack> 

 

                  {my && ( 

                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}> 

                      Evidencia: creado {new Date(my.createdAt).toLocaleString()} 

                      {my.updatedAt ? ` • editado ${new Date(my.updatedAt).toLocaleString()}` : ""} 

                      {my.locked ? ` • LOCKED${my.lockedAt ? ` (${new Date(my.lockedAt).toLocaleString()})` : ""}` : ""} 

                    </Typography> 

                  )} 

 

                  <Typography variant="caption" sx={{ display: "block", mt: 1 }}> 

                    <b>Evidencia del grupo:</b> 

                  </Typography> 

 

                  {predsForMatch.length === 0 ? ( 

                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}> 

                      Sin pronósticos del grupo todavía. 

                    </Typography> 

                  ) : ( 

                    <Stack sx={{ mt: 0.5 }} spacing={0.5}> 

                      {predsForMatch.map((pr) => ( 

                        <Typography key={pr.id} variant="caption" color="text.secondary"> 

                          • {nameById.get(pr.userId) ?? pr.userId}: {pr.homeScore}-{pr.awayScore} · creado{" "} 

                          {new Date(pr.createdAt).toLocaleString()} 

                          {pr.updatedAt ? ` · editado ${new Date(pr.updatedAt).toLocaleString()}` : ""} 

                          {pr.locked ? ` · LOCKED` : ""} 

                        </Typography> 

                      ))} 

                    </Stack> 

                  )} 

 

                  {m.status === "FINISHED" && m.score && my?.points !== undefined && ( 

                    <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}> 

                      Puntos por este partido: <b>{my.points}</b> 

                    </Typography> 

                  )} 

                </Paper> 

              ); 

            })} 

          </Stack> 

        )} 

      </Paper> 

 

      <Paper sx={{ p: 3 }}> 

        <Typography variant="h6">Ranking</Typography> 

 

        {ranking.length === 0 ? ( 

          <Typography color="text.secondary" sx={{ mt: 1 }}> 

            Sin miembros todavía. 

          </Typography> 

        ) : ( 

          <Stack sx={{ mt: 1 }} spacing={0.5}> 

            {ranking.map((r) => ( 

              <Typography key={r.user.id}> 

                • {r.user.name}: {r.points} pts 

              </Typography> 

            ))} 

          </Stack> 

        )} 

      </Paper> 

    </Stack> 

  ); 

} 

 
