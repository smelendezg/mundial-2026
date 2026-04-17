import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { getMatches } from "../api/matchesApi";
import { cancelTicket, getMyTickets, reserveTicket } from "../api/ticketsApi";
import { useApp } from "../context/AppContext";
import type { Match } from "../types/match";
import type { Ticket } from "../types/ticket";
import { validatePositiveNumber } from "../utils/validation";

type Msg = { text: string; severity: "success" | "error" | "info" } | null;

const ticketPrice = 50000;

function statusLabel(status: Ticket["status"]) {
  const labels: Record<Ticket["status"], string> = {
    RESERVED: "Reservada",
    PAID: "Pagada",
    CANCELLED: "Cancelada",
    EXPIRED: "Expirada",
    REFUNDED: "Reembolsada",
    TRANSFERRED: "Transferida",
  };

  return labels[status];
}

export default function Tickets() {
  const { user } = useApp();
  const navigate = useNavigate();

  const [items, setItems] = useState<Ticket[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [quantityError, setQuantityError] = useState("");
  const [msg, setMsg] = useState<Msg>(null);
  const [loading, setLoading] = useState(false);

  const matchById = useMemo(() => new Map(matches.map((match) => [match.id, match])), [matches]);

  const refresh = useCallback(async () => {
    if (!user) return;

    const [ticketsData, matchesData] = await Promise.all([getMyTickets(user.id), getMatches()]);
    setItems(ticketsData ?? []);
    setMatches(matchesData ?? []);
    setSelectedMatchId((current) => current || matchesData[0]?.id || "");
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const summary = useMemo(
    () => ({
      total: items.length,
      reserved: items.filter((ticket) => ticket.status === "RESERVED").length,
      paid: items.filter((ticket) => ticket.status === "PAID").length,
      refunded: items.filter((ticket) => ticket.status === "REFUNDED").length,
    }),
    [items]
  );

  if (!user) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5">Entradas</Typography>
        <Alert severity="warning">Debes iniciar sesión para ver tus entradas.</Alert>
      </Stack>
    );
  }

  const onReserve = async () => {
    const nextQuantityError = validatePositiveNumber(quantity, "La cantidad", 1, 6);
    setQuantityError(nextQuantityError);

    if (!selectedMatchId) {
      setMsg({ text: "Selecciona un partido.", severity: "error" });
      return;
    }

    if (nextQuantityError) return;

    try {
      setLoading(true);
      setMsg(null);

      const ticket = await reserveTicket(user.id, selectedMatchId, quantity);
      setMsg({ text: "Reserva creada. Tienes 10 minutos para pagarla.", severity: "success" });
      await refresh();
      navigate(`/checkout?type=TICKET&ticketId=${ticket.id}&amount=${ticket.quantity * ticketPrice}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo reservar la entrada.";
      setMsg({ text: message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onCancel = async (ticketId: string) => {
    try {
      setLoading(true);
      const ok = await cancelTicket(user.id, ticketId);
      setMsg(
        ok
          ? { text: "Reserva cancelada.", severity: "success" }
          : { text: "No se pudo cancelar esta entrada.", severity: "error" }
      );
      await refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error cancelando la entrada.";
      setMsg({ text: message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Entradas</Typography>

      <Alert severity="info">
        Reserva entradas por partido, confirma el pago en sandbox y conserva evidencia de cada
        transacción.
      </Alert>

      {msg && <Alert severity={msg.severity}>{msg.text}</Alert>}

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h6">Nueva reserva</Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mt: 2 }}>
          <TextField
            select
            label="Partido"
            value={selectedMatchId}
            onChange={(event) => setSelectedMatchId(event.target.value)}
            disabled={loading}
            fullWidth
          >
            {matches.map((match) => (
              <MenuItem key={match.id} value={match.id}>
                {match.home.name} vs {match.away.name} · {match.city}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Cantidad"
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            error={Boolean(quantityError)}
            helperText={quantityError || "Máximo 6 entradas por reserva."}
            inputProps={{ min: 1, max: 6 }}
            disabled={loading}
            sx={{ minWidth: { md: 180 } }}
          />
          <Button variant="contained" onClick={onReserve} disabled={loading || matches.length === 0}>
            Reservar
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h6">Resumen</Typography>
        <Typography color="text.secondary">
          Total: {summary.total} · Reservadas: {summary.reserved} · Pagadas: {summary.paid} ·
          Reembolsadas: {summary.refunded}
        </Typography>
      </Paper>

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h6">Mis entradas</Typography>

        {items.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Aún no tienes entradas.
          </Typography>
        ) : (
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {items.map((ticket) => {
              const match = matchById.get(ticket.matchId);
              return (
                <Paper key={ticket.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                        <Typography sx={{ fontWeight: 800 }}>
                          {match ? `${match.home.name} vs ${match.away.name}` : ticket.matchId}
                        </Typography>
                        <Chip label={statusLabel(ticket.status)} size="small" variant="outlined" />
                      </Stack>
                      <Typography color="text.secondary">
                        Cantidad: {ticket.quantity} · Total: ${(ticket.quantity * ticketPrice).toLocaleString()} COP
                      </Typography>
                      {match && (
                        <Typography color="text.secondary">
                          {match.city} · {match.stadium}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        Creada: {new Date(ticket.createdAt).toLocaleString()}
                        {ticket.expiresAt ? ` · Expira: ${new Date(ticket.expiresAt).toLocaleString()}` : ""}
                        {ticket.paymentRef ? ` · Ref: ${ticket.paymentRef}` : ""}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                      {ticket.status === "RESERVED" && (
                        <>
                          <Button
                            variant="contained"
                            onClick={() =>
                              navigate(
                                `/checkout?type=TICKET&ticketId=${ticket.id}&amount=${
                                  ticket.quantity * ticketPrice
                                }`
                              )
                            }
                          >
                            Pagar
                          </Button>
                          <Button variant="outlined" color="error" onClick={() => onCancel(ticket.id)}>
                            Cancelar
                          </Button>
                        </>
                      )}
                      {ticket.status === "PAID" && (
                        <Button variant="outlined" onClick={() => navigate("/payments")}>
                          Ver pago
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
