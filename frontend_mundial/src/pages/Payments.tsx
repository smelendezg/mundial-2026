import { useCallback, useEffect, useState } from "react";
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

import {
  addPaymentMethod,
  getMyPaymentMethods,
  getMyPaymentTxs,
  refundPaymentTx,
  setDefaultPaymentMethod,
} from "../api/paymentsApi";
import { useApp } from "../context/AppContext";
import type { PaymentMethod, PaymentMethodType } from "../types/payment";
import type { PaymentTx, PaymentTxStatus } from "../types/paymentTx";
import {
  validatePaymentReference,
  validateTextLength,
  type FieldErrors,
} from "../utils/validation";

type PaymentField = "label" | "details";
type Msg = { text: string; severity: "success" | "error" | "info" } | null;

const statusLabels: Record<PaymentTxStatus, string> = {
  PENDING: "Pendiente",
  SUCCEEDED: "Aprobado",
  FAILED: "Fallido",
  REFUNDED: "Reembolsado",
};

export default function Payments() {
  const { user } = useApp();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [txs, setTxs] = useState<PaymentTx[]>([]);
  const [type, setType] = useState<PaymentMethodType>("CARD");
  const [label, setLabel] = useState("");
  const [details, setDetails] = useState("");
  const [errors, setErrors] = useState<FieldErrors<PaymentField>>({});
  const [msg, setMsg] = useState<Msg>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    const [paymentMethods, transactions] = await Promise.all([
      getMyPaymentMethods(user.id),
      getMyPaymentTxs(user.id),
    ]);

    setMethods(paymentMethods ?? []);
    setTxs(transactions ?? []);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!user) return <Alert severity="warning">Debes iniciar sesión.</Alert>;

  const validateForm = () => {
    const nextErrors: FieldErrors<PaymentField> = {
      label: validateTextLength(label, "El nombre del método", 4, 40),
      details: validatePaymentReference(details, "La referencia"),
    };

    if (type === "CARD" && !/\d{4}/.test(details)) {
      nextErrors.details = "La referencia de tarjeta debe incluir al menos 4 números.";
    }

    Object.keys(nextErrors).forEach((key) => {
      const typedKey = key as PaymentField;
      if (!nextErrors[typedKey]) delete nextErrors[typedKey];
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onAddMethod = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setMsg(null);

      await addPaymentMethod(user.id, type, label, details);
      setLabel("");
      setDetails("");
      setType("CARD");
      setMsg({ text: "Método de pago agregado.", severity: "success" });
      await refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo agregar el método de pago.";
      setMsg({ text: message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onSetDefault = async (paymentId: string) => {
    try {
      setLoading(true);
      await setDefaultPaymentMethod(user.id, paymentId);
      setMsg({ text: "Método predeterminado actualizado.", severity: "success" });
      await refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo actualizar el método.";
      setMsg({ text: message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onRefund = async (txId: string) => {
    try {
      setLoading(true);
      await refundPaymentTx(user.id, txId);
      setMsg({ text: "Reembolso registrado correctamente.", severity: "success" });
      await refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo hacer el reembolso.";
      setMsg({ text: message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Pagos</Typography>

      <Alert severity="info">
        Administra métodos de pago sandbox, consulta transacciones y solicita reembolsos con
        trazabilidad.
      </Alert>

      {msg && <Alert severity={msg.severity}>{msg.text}</Alert>}

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h6">Agregar método</Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mt: 2 }}>
          <TextField
            select
            label="Tipo"
            value={type}
            onChange={(event) => setType(event.target.value as PaymentMethodType)}
            disabled={loading}
            sx={{ minWidth: { md: 160 } }}
          >
            <MenuItem value="CARD">Tarjeta</MenuItem>
            <MenuItem value="PSE">PSE</MenuItem>
            <MenuItem value="TRANSFER">Transferencia</MenuItem>
            <MenuItem value="CASH">Efectivo</MenuItem>
          </TextField>
          <TextField
            label="Nombre"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            error={Boolean(errors.label)}
            helperText={errors.label || "Ejemplo: Visa personal"}
            disabled={loading}
            fullWidth
          />
          <TextField
            label="Referencia"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            error={Boolean(errors.details)}
            helperText={errors.details || "Ejemplo: 4111 **** 1111"}
            disabled={loading}
            fullWidth
          />
          <Button variant="contained" onClick={onAddMethod} disabled={loading}>
            Agregar
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h6">Métodos guardados</Typography>
        {methods.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            No tienes métodos guardados.
          </Typography>
        ) : (
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {methods.map((method) => (
              <Paper key={method.id} variant="outlined" sx={{ p: 2 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
                  <Stack spacing={0.5}>
                    <Typography sx={{ fontWeight: 800 }}>{method.label}</Typography>
                    <Typography color="text.secondary">
                      {method.type} {method.details ? `· ${method.details}` : ""}
                    </Typography>
                    {method.isDefault && <Chip label="Predeterminado" size="small" color="success" />}
                  </Stack>
                  {!method.isDefault && (
                    <Button variant="outlined" onClick={() => onSetDefault(method.id)} disabled={loading}>
                      Usar por defecto
                    </Button>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h6">Historial de transacciones</Typography>
        {txs.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            No hay transacciones registradas.
          </Typography>
        ) : (
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {txs.map((tx) => (
              <Paper key={tx.id} variant="outlined" sx={{ p: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
                  <Stack spacing={0.5}>
                    <Typography sx={{ fontWeight: 800 }}>
                      {tx.kind === "TICKET" ? "Entrada" : "Monedas"} · {statusLabels[tx.status]}
                    </Typography>
                    <Typography color="text.secondary">
                      ${tx.amount.toLocaleString()} {tx.currency} · {tx.provider}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Creada: {new Date(tx.createdAt).toLocaleString()}
                      {tx.confirmedAt ? ` · Confirmada: ${new Date(tx.confirmedAt).toLocaleString()}` : ""}
                      {tx.providerRef ? ` · Ref: ${tx.providerRef}` : ""}
                    </Typography>
                  </Stack>
                  {tx.status === "SUCCEEDED" && (
                    <Button color="error" variant="outlined" onClick={() => onRefund(tx.id)} disabled={loading}>
                      Reembolsar
                    </Button>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
