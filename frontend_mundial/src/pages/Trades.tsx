import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";

import { acceptTrade, createTradeOffer, getTrades } from "../api/tradesApi";
import { getPools } from "../api/poolsApi";
import { useApp } from "../context/AppContext";
import type { Sticker } from "../types/sticker";
import type { TradeOffer } from "../types/trade";

const POOL_CODE = "AMIGOS2026";
type Msg = { text: string; severity: "success" | "error" | "info" } | null;

export default function Trades() {
  const { user } = useApp();
  const [myRepeated, setMyRepeated] = useState<Sticker[]>([]);
  const [otherStickers, setOtherStickers] = useState<Sticker[]>([]);
  const [otherUserId, setOtherUserId] = useState("");
  const [otherUserName, setOtherUserName] = useState("otro usuario");
  const [giveId, setGiveId] = useState("");
  const [wantId, setWantId] = useState("");
  const [trades, setTrades] = useState<TradeOffer[]>([]);
  const [msg, setMsg] = useState<Msg>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;

    const pools = await getPools();
    const pool = pools.find((item) => item.code === POOL_CODE);
    if (!pool) return;

    const me = pool.members.find((member) => member.user.id === user.id);
    const other = pool.members.find((member) => member.user.id !== user.id);

    setMyRepeated(me?.user.repeated ?? []);
    setOtherStickers(other?.user.stickers ?? []);
    setOtherUserId(other?.user.id ?? "");
    setOtherUserName(other?.user.name ?? "otro usuario");
    setTrades(await getTrades(POOL_CODE));
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const pendingForMe = useMemo(
    () => trades.filter((trade) => trade.status === "PENDING" && trade.toUserId === user?.id),
    [trades, user?.id]
  );

  if (!user) return <Alert severity="warning">Debes iniciar sesión.</Alert>;

  const onCreateOffer = async () => {
    const give = myRepeated.find((sticker) => sticker.id === giveId);
    const want = otherStickers.find((sticker) => sticker.id === wantId);

    if (!otherUserId) {
      setMsg({ text: "Necesitas otro miembro en el grupo para intercambiar.", severity: "error" });
      return;
    }

    if (!give || !want) {
      setMsg({ text: "Selecciona la lámina que entregas y la que quieres recibir.", severity: "error" });
      return;
    }

    if (otherUserId === user.id) {
      setMsg({ text: "No puedes enviarte un intercambio a ti mismo.", severity: "error" });
      return;
    }

    if (give.id === want.id) {
      setMsg({ text: "Elige dos láminas diferentes para el intercambio.", severity: "error" });
      return;
    }

    const alreadyPending = trades.some(
      (trade) =>
        trade.status === "PENDING" &&
        trade.fromUserId === user.id &&
        trade.toUserId === otherUserId &&
        trade.give.id === give.id &&
        trade.want.id === want.id
    );

    if (alreadyPending) {
      setMsg({ text: "Ya existe una oferta pendiente con esas mismas láminas.", severity: "error" });
      return;
    }

    try {
      setLoading(true);
      await createTradeOffer(POOL_CODE, user.id, otherUserId, give, want);
      setGiveId("");
      setWantId("");
      setMsg({ text: "Oferta creada correctamente.", severity: "success" });
      await refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo crear la oferta.";
      setMsg({ text: message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onAccept = async (tradeId: string) => {
    try {
      setLoading(true);
      const ok = await acceptTrade(POOL_CODE, tradeId);
      setMsg(
        ok
          ? { text: "Intercambio aceptado.", severity: "success" }
          : { text: "No se pudo aceptar el intercambio.", severity: "error" }
      );
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Intercambios</Typography>

      <Alert severity="info">
        Intercambia láminas repetidas con confirmación mutua y límites para evitar abusos.
      </Alert>

      {msg && <Alert severity={msg.severity}>{msg.text}</Alert>}

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Paper sx={{ p: 2.5, flex: 1 }}>
          <Typography variant="h6">Crear oferta</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Receptor: {otherUserName}
          </Typography>

          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              select
              label="Yo entrego"
              value={giveId}
              onChange={(event) => setGiveId(event.target.value)}
              disabled={loading || myRepeated.length === 0}
              fullWidth
            >
              {myRepeated.length === 0 ? (
                <MenuItem value="" disabled>
                  No tienes repetidas disponibles
                </MenuItem>
              ) : (
                myRepeated.map((sticker, index) => (
                  <MenuItem key={`${sticker.id}-${index}`} value={sticker.id}>
                    {sticker.name} · {sticker.team} · {sticker.rarity}
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              select
              label="Quiero recibir"
              value={wantId}
              onChange={(event) => setWantId(event.target.value)}
              disabled={loading || otherStickers.length === 0}
              fullWidth
            >
              {otherStickers.length === 0 ? (
                <MenuItem value="" disabled>
                  El otro usuario aún no tiene láminas disponibles
                </MenuItem>
              ) : (
                otherStickers.map((sticker) => (
                  <MenuItem key={sticker.id} value={sticker.id}>
                    {sticker.name} · {sticker.team} · {sticker.rarity}
                  </MenuItem>
                ))
              )}
            </TextField>

            <Button variant="contained" onClick={onCreateOffer} disabled={loading}>
              Crear oferta
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2.5, flex: 1 }}>
          <Typography variant="h6">Ofertas pendientes para mí</Typography>

          {pendingForMe.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              No tienes ofertas pendientes.
            </Typography>
          ) : (
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {pendingForMe.map((trade) => (
                <Paper key={trade.id} variant="outlined" sx={{ p: 2 }}>
                  <Typography>
                    Te ofrecen <b>{trade.give.name}</b> y piden <b>{trade.want.name}</b>.
                  </Typography>
                  <Button
                    sx={{ mt: 1 }}
                    variant="outlined"
                    onClick={() => onAccept(trade.id)}
                    disabled={loading}
                  >
                    Aceptar intercambio
                  </Button>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>
    </Stack>
  );
}
