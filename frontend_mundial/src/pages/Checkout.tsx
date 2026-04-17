import { useEffect, useMemo, useState } from "react";
import { Alert, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  confirmPaymentTx,
  createCoinsPayment,
  createTicketPayment,
  getMyPaymentMethods,
} from "../api/paymentsApi";
import { useApp } from "../context/AppContext";
import type { PaymentMethod } from "../types/payment";

type CheckoutKind = "TICKET" | "COINS";
type Msg = { text: string; severity: "success" | "error" | "info" } | null;

export default function Checkout() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const kind = ((searchParams.get("type") ?? "TICKET").toUpperCase() as CheckoutKind) || "TICKET";
  const ticketId = searchParams.get("ticketId") ?? "";
  const coins = Number(searchParams.get("coins") ?? "0");
  const amount = Number(searchParams.get("amount") ?? "0");

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [methodId, setMethodId] = useState("");
  const [txId, setTxId] = useState("");
  const [msg, setMsg] = useState<Msg>(null);
  const [loading, setLoading] = useState(false);

  const title = useMemo(
    () => (kind === "TICKET" ? "Pago de entrada" : "Compra de monedas"),
    [kind]
  );

  useEffect(() => {
    if (!user) return;

    getMyPaymentMethods(user.id).then((data) => {
      setMethods(data ?? []);
      setMethodId(data.find((method) => method.isDefault)?.id ?? data[0]?.id ?? "");
    });
  }, [user]);

  if (!user) return <Alert severity="warning">Debes iniciar sesión.</Alert>;

  const validateCheckout = () => {
    if (kind !== "TICKET" && kind !== "COINS") return "El tipo de pago no es válido.";
    if (!methodId) return "Selecciona un método de pago.";
    if (!Number.isFinite(amount) || amount < 1000 || amount > 20000000) {
      return "El valor del pago debe estar entre $1.000 y $20.000.000 COP.";
    }
    if (kind === "TICKET" && !/^[A-Za-z0-9_-]{3,80}$/.test(ticketId)) {
      return "Falta la reserva de entrada o el identificador no es válido.";
    }
    if (kind === "COINS" && (!Number.isFinite(coins) || coins <= 0)) {
      return "La cantidad de monedas no es válida.";
    }
    if (kind === "COINS" && (!Number.isInteger(coins) || coins > 500)) {
      return "La compra de monedas debe ser un número entero entre 1 y 500.";
    }
    return "";
  };

  const onCreate = async () => {
    const validationError = validateCheckout();
    if (validationError) {
      setMsg({ text: validationError, severity: "error" });
      return;
    }

    try {
      setLoading(true);
      setMsg(null);

      const tx =
        kind === "TICKET"
          ? await createTicketPayment(user.id, ticketId, methodId, amount)
          : await createCoinsPayment(user.id, coins, methodId, amount);

      setTxId(tx.id);
      setMsg({ text: "Transacción creada. Confirma el pago para finalizar.", severity: "info" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error creando el pago.";
      setMsg({ text: message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onConfirm = async () => {
    if (!txId) {
      setMsg({ text: "Primero crea la transacción.", severity: "error" });
      return;
    }

    try {
      setLoading(true);
      const tx = await confirmPaymentTx(user.id, txId);

      if (tx.status === "PENDING") {
        setMsg({ text: "El pago sigue pendiente en el proveedor sandbox.", severity: "info" });
        return;
      }

      if (tx.status === "FAILED") {
        setMsg({ text: "El proveedor sandbox rechazó el pago.", severity: "error" });
        return;
      }

      setMsg({ text: "Pago confirmado correctamente.", severity: "success" });
      navigate(kind === "TICKET" ? "/tickets" : "/payments");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error confirmando el pago.";
      setMsg({ text: message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">{title}</Typography>

      {msg && <Alert severity={msg.severity}>{msg.text}</Alert>}

      {methods.length === 0 && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => navigate("/payments")}>
              Agregar
            </Button>
          }
        >
          No tienes métodos de pago. Agrega uno antes de continuar.
        </Alert>
      )}

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h6">Resumen</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {kind === "TICKET" ? `Reserva: ${ticketId}` : `Monedas: ${coins}`} · Valor: $
          {amount.toLocaleString()} COP
        </Typography>

        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            select
            label="Método de pago"
            value={methodId}
            onChange={(event) => setMethodId(event.target.value)}
            disabled={loading || methods.length === 0}
            fullWidth
          >
            {methods.map((method) => (
              <MenuItem key={method.id} value={method.id}>
                {method.label} {method.isDefault ? "· predeterminado" : ""}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button variant="contained" onClick={onCreate} disabled={loading || methods.length === 0}>
              Crear transacción
            </Button>
            <Button variant="outlined" onClick={onConfirm} disabled={loading || !txId}>
              Confirmar pago
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
