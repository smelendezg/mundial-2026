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
import { getMatches } from "../api/matchesApi";
import { cancelTicket, getMyTickets } from "../api/ticketsApi";
import { useApp } from "../context/AppContext";
import { bannerImages } from "../data/mockMedia";
import type { Match } from "../types/match";
import type { Ticket } from "../types/ticket";
import { validateFutureDateTime, validatePositiveNumber } from "../utils/validation";

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
  const { user, addCartItem } = useApp();

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

  const selectedMatch = matches.find((match) => match.id === selectedMatchId);

  const onAddToCart = () => {
    const nextQuantityError = validatePositiveNumber(quantity, "La cantidad", 1, 6);
    setQuantityError(nextQuantityError);

    if (!selectedMatchId) {
      setMsg({ text: "Selecciona un partido.", severity: "error" });
      return;
    }

    if (nextQuantityError) return;

    if (!selectedMatch) {
      setMsg({ text: "No encontramos la información del partido.", severity: "error" });
      return;
    }
    const matchTimeError = validateFutureDateTime(selectedMatch.startTimeISO, "La fecha del partido");
    if (matchTimeError) {
      setMsg({ text: "Ese partido ya no está disponible para reservar.", severity: "error" });
      return;
    }

    addCartItem({
      id: `cart-ticket-${selectedMatch.id}`,
      kind: "TICKET",
      matchId: selectedMatch.id,
      title: `${selectedMatch.home.name} vs ${selectedMatch.away.name}`,
      subtitle: `${selectedMatch.city} · ${selectedMatch.stadium}`,
      quantity,
      amount: quantity * ticketPrice,
    });
    setMsg({ text: "Entrada agregada al carrito.", severity: "success" });
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
      <Paper
        sx={{
          p: { xs: 2.5, md: 3 },
          background: `linear-gradient(135deg, rgba(8,58,42,.94), rgba(22,117,79,.82)), url(${bannerImages.tickets})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 950 }}>
          Entradas del Mundial 2026
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 720 }}>
          Elige un partido, revisa cantidad y agrega la reserva al carrito para pagarla junto con
          souvenirs o compras del álbum.
        </Typography>
      </Paper>

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
          <Button variant="contained" onClick={onAddToCart} disabled={loading || matches.length === 0}>
            Agregar al carrito
          </Button>
        </Stack>

        {selectedMatch && (
          <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography sx={{ fontWeight: 900 }}>
              {selectedMatch.home.name} vs {selectedMatch.away.name}
            </Typography>
            <Typography color="text.secondary">
              {selectedMatch.city} · {selectedMatch.stadium}
            </Typography>
            <Typography color="text.secondary">
              {new Date(selectedMatch.startTimeISO).toLocaleString()}
            </Typography>
            <Typography sx={{ mt: 1, fontWeight: 800 }}>
              Total estimado: ${(quantity * ticketPrice).toLocaleString()} COP
            </Typography>
          </Paper>
        )}
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
                          <Button variant="outlined" color="error" onClick={() => onCancel(ticket.id)}>
                            Cancelar
                          </Button>
                        </>
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
