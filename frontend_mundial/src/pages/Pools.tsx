import { useCallback, useEffect, useState } from "react"; 

import { Alert, Button, Paper, Stack, TextField, Typography } from "@mui/material"; 

import { Link as RouterLink } from "react-router-dom"; 

 

import { useApp } from "../context/AppContext"; 

import type { Pool, User as PoolUser } from "../types/pool"; 

import { createPool, getPools, joinPool } from "../api/poolsApi"; 
import { validateCode, validateRequired } from "../utils/validation";

 

type Msg = { text: string; severity: "success" | "error" } | null; 

 

export default function Pools() { 

  const { user } = useApp(); 

 

  const [pools, setPools] = useState<Pool[]>([]); 

  const [newPoolName, setNewPoolName] = useState(""); 

  const [joinCode, setJoinCode] = useState(""); 

  const [msg, setMsg] = useState<Msg>(null); 

  const [loading, setLoading] = useState(false); 
  const [newPoolError, setNewPoolError] = useState("");
  const [joinCodeError, setJoinCodeError] = useState("");

 

  const refresh = useCallback(async () => { 

    if (!user) return;
    const data = await getPools(); 

 

    const myPools = data.filter((p) => p.members.some((m) => m.user.id === user?.id)); 

    setPools(myPools); 

  }, [user]); 

 

  useEffect(() => { 

    if (!user) return; 

    refresh().catch(() => setMsg({ text: "No se pudieron cargar las pollas.", severity: "error" })); 

  }, [refresh, user]); 

 

  if (!user) { 

    return ( 

      <Stack spacing={2}> 

        <Typography variant="h5">Pollas</Typography> 

        <Alert severity="warning">Debes iniciar sesión para ver/crear/unirte a una polla.</Alert> 

        <Button component={RouterLink} to="/login" variant="contained"> 

          Ir a Login 

        </Button> 

      </Stack> 

    ); 

  } 

 

  const poolUser: PoolUser = { 

    id: user.id, 

    name: user.name, 

    stickers: [], 

    repeated: [], 

  }; 

 

  const onCreate = async () => { 

    const name = newPoolName.trim(); 

    const error = validateRequired(name, "El nombre de la polla", 4);
    setNewPoolError(error);
    if (error) { 

      setMsg({ text: error, severity: "error" }); 

      return; 

    } 

 

    try { 

      setLoading(true); 

      setMsg(null); 

 

      await createPool(name, poolUser); 

 

      setNewPoolName(""); 

      setMsg({ text: "Polla creada correctamente.", severity: "success" }); 

      await refresh(); 

    } catch (e) { 

      const err = e instanceof Error ? e.message : "No se pudo crear la polla"; 

      setMsg({ text: err, severity: "error" }); 

    } finally { 

      setLoading(false); 

    } 

  }; 

 

  const onJoin = async () => { 

    const code = joinCode.trim().toUpperCase(); 

    const error = validateCode(code, "El código de la polla");
    setJoinCodeError(error);
    if (error) { 

      setMsg({ text: error, severity: "error" }); 

      return; 

    } 

 

    try { 

      setLoading(true); 

      setMsg(null); 

 

      const result = await joinPool(code, poolUser); 

 

      setMsg( 

        result 

          ? { text: "Te uniste a la polla.", severity: "success" } 

          : { text: "Código inválido.", severity: "error" } 

      ); 

 

      if (result) setJoinCode(""); 

      await refresh(); 

    } catch (e) { 

      const err = e instanceof Error ? e.message : "Error uniéndote a la polla"; 

      setMsg({ text: err, severity: "error" }); 

    } finally { 

      setLoading(false); 

    } 

  }; 

 

  return ( 

    <div> 

      <Typography variant="h5" gutterBottom> 

        Pollas 

      </Typography> 

 

      <Alert severity="info" sx={{ mb: 2 }}> 

        Crea pollas, comparte códigos de invitación, registra pronósticos y consulta el ranking. 

      </Alert> 

 

      {msg && ( 

        <Alert severity={msg.severity} sx={{ mb: 2 }}> 

          {msg.text} 

        </Alert> 

      )} 

 

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}> 

        <Paper sx={{ p: 2, flex: 1 }}> 

          <Typography variant="h6">Crear polla</Typography> 

          <Stack spacing={1} sx={{ mt: 1 }}> 

            <TextField 

              label="Nombre de la polla" 

              value={newPoolName} 

              onChange={(e) => setNewPoolName(e.target.value)} 
              error={Boolean(newPoolError)}
              helperText={newPoolError || "Mínimo 4 caracteres."}

              disabled={loading} 

            /> 

            <Button variant="contained" onClick={onCreate} disabled={loading}> 

              Crear 

            </Button> 

          </Stack> 

        </Paper> 

 

        <Paper sx={{ p: 2, flex: 1 }}> 

          <Typography variant="h6">Unirse</Typography> 

          <Stack spacing={1} sx={{ mt: 1 }}> 

            <TextField 

              label="Código" 

              value={joinCode} 

              onChange={(e) => setJoinCode(e.target.value)} 
              error={Boolean(joinCodeError)}
              helperText={joinCodeError || "Escribe el código de invitación."}

              disabled={loading} 

            /> 

            <Button variant="outlined" onClick={onJoin} disabled={loading}> 

              Unirme 

            </Button> 

          </Stack> 

        </Paper> 

      </Stack> 

 

      <Paper sx={{ p: 2 }}> 

        <Typography variant="h6" gutterBottom> 

          Mis pollas (ranking) 

        </Typography> 

 

        {pools.length === 0 ? ( 

          <Typography color="text.secondary">No perteneces a ninguna polla todavía.</Typography> 

        ) : ( 

          pools.map((p) => ( 

            <Paper key={p.id} variant="outlined" sx={{ p: 2, mb: 2 }}> 

              <Typography> 

                <b>{p.name}</b> — código:{" "} 

                <Button 

                  component={RouterLink} 

                  to={`/pools/${p.code}`} 

                  variant="text" 

                  size="small" 

                  sx={{ textTransform: "none", p: 0, minWidth: "auto" }} 

                > 

                  {p.code} 

                </Button> 

              </Typography> 

 

              <Typography sx={{ mt: 1 }}> 

                <b>Ranking:</b> 

              </Typography> 

 

              {p.members 

                .slice() 

                .sort((a, b) => (b.points ?? 0) - (a.points ?? 0)) 

                .map((m) => ( 

                  <Typography key={m.user.id}> 

                    • {m.user.name}: {m.points ?? 0} pts 

                  </Typography> 

                ))} 

            </Paper> 

          )) 

        )} 

      </Paper> 

    </div> 

  ); 

} 
