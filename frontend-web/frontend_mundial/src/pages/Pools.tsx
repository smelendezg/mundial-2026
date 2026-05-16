import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useApp } from "../context/AppContext";
import type { Pool } from "../types/pool";
import { createPool, getPools, joinPool } from "../api/poolsApi";
import { validateCode, validateRequired } from "../utils/validation";

type Msg = { text: string; severity: "success" | "error" } | null;

export default function Pools() {
  const { user } = useApp();
  const navigate = useNavigate();

  const [pools, setPools] = useState<Pool[]>([]);
  const [newPoolName, setNewPoolName] = useState("");
  const [fechaCierre, setFechaCierre] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [msg, setMsg] = useState<Msg>(null);
  const [loading, setLoading] = useState(false);
  const [newPoolError, setNewPoolError] = useState("");
  const [joinCodeError, setJoinCodeError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    const data = await getPools(Number(user.id));
    setPools(data);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    refresh().catch(() =>
      setMsg({ text: "No se pudieron cargar las pollas.", severity: "error" })
    );
  }, [refresh, user]);

  if (!user) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5">Pollas</Typography>
        <Alert severity="warning">
          Debes iniciar sesión para ver/crear/unirte a una polla.
        </Alert>
        <Button onClick={() => navigate("/login")} variant="contained">
          Ir a Login
        </Button>
      </Stack>
    );
  }

  const handleCopy = (pool: Pool) => {
    navigator.clipboard.writeText(pool.code).then(() => {
      setCopied(pool.id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const onCreate = async () => {
    const name = newPoolName.trim();
    const error = validateRequired(name, "El nombre de la polla", 4);
    setNewPoolError(error);
    if (error) {
      setMsg({ text: error, severity: "error" });
      return;
    }
    if (!fechaCierre) {
      setMsg({ text: "La fecha de cierre es obligatoria.", severity: "error" });
      return;
    }

    try {
      setLoading(true);
      setMsg(null);
      await createPool(name, Number(user.id), fechaCierre);
      setNewPoolName("");
      setFechaCierre("");
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
    const code = joinCode.trim();
    const error = validateCode(code, "El código de la polla");
    setJoinCodeError(error);
    if (error) {
      setMsg({ text: error, severity: "error" });
      return;
    }

    try {
      setLoading(true);
      setMsg(null);
      const result = await joinPool(code, Number(user.id));
      setMsg(
        result
          ? { text: "Te uniste a la polla.", severity: "success" }
          : { text: "Código inválido.", severity: "error" }
      );
      if (result) setJoinCode("");
      await refresh();
    } catch (e) {
      const err =
        e instanceof Error ? e.message : "Error uniéndote a la polla";
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
        Crea pollas, comparte códigos de invitación, registra pronósticos y
        consulta el ranking.
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
            <TextField
              label="Fecha de cierre"
              type="datetime-local"
              value={fechaCierre}
              onChange={(e) => setFechaCierre(e.target.value)}
              disabled={loading}
              slotProps={{ inputLabel: { shrink: true } }}
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
              label="Código de invitación"
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
          Mis pollas
        </Typography>

        {pools.length === 0 ? (
          <Typography color="text.secondary">
            No perteneces a ninguna polla todavía.
          </Typography>
        ) : (
          pools.map((p) => (
            <Paper key={p.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Typography fontWeight={700}>{p.name}</Typography>
                <Chip
                  label={p.estado}
                  size="small"
                  color={p.estado === "ABIERTA" ? "success" : "default"}
                />
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Código: {p.code}
                </Typography>
                <Tooltip title={copied === p.id ? "¡Copiado!" : "Copiar código"}>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => handleCopy(p)}
                    sx={{ minWidth: "auto", textTransform: "none" }}
                  >
                    {copied === p.id ? "✓ Copiado" : "Copiar"}
                  </Button>
                </Tooltip>
              </Stack>

              {p.fechaCierre && (
                <Typography variant="caption" color="text.secondary">
                  Cierra: {new Date(p.fechaCierre).toLocaleString()}
                </Typography>
              )}

              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate(`/pools/${p.id}/info`)}
                >
                  Info polla
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(`/pools/${p.id}/pronostico`)}
                >
                  Registrar pronóstico
                </Button>
              </Stack>
            </Paper>
          ))
        )}
      </Paper>
    </div>
  );
}