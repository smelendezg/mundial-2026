import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
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
import type { PaymentTx, PaymentTxKind, PaymentTxStatus } from "../types/paymentTx";
import {
  formatCardNumber,
  formatExpiryDate,
  onlyDigits,
  validateCardHolder,
  validateCardNumber,
  validateExpiryDate,
  validatePaymentReference,
  validateSecurityCode,
  validateTextLength,
  type FieldErrors,
} from "../utils/validation";
import { bannerImages } from "../data/mockMedia";

type PaymentField =
  | "label"
  | "details"
  | "holderName"
  | "cardNumber"
  | "expiry"
  | "cvv";
type Msg = { text: string; severity: "success" | "error" | "info" } | null;

const statusLabels: Record<PaymentTxStatus, string> = {
  PENDING: "Pendiente",
  SUCCEEDED: "Aprobado",
  FAILED: "Fallido",
  REFUNDED: "Reembolsado",
};

const kindLabels: Record<PaymentTxKind, string> = {
  TICKET: "Entradas",
  COINS: "Monedas",
  PACKS: "Sobres",
  MERCH: "Souvenirs",
};

export default function Payments() {
  const { user } = useApp();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [txs, setTxs] = useState<PaymentTx[]>([]);
  const [type, setType] = useState<PaymentMethodType>("CARD");
  const [label, setLabel] = useState("");
  const [details, setDetails] = useState("");
  const [holderName, setHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
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

  const cardLast4 = onlyDigits(cardNumber).slice(-4);
  const cardLabel = holderName.trim()
    ? `${holderName.trim()} · terminada en ${cardLast4 || "****"}`
    : `Tarjeta terminada en ${cardLast4 || "****"}`;
  const cardDetails = `**** **** **** ${cardLast4 || "****"} · vence ${expiry || "MM/AA"}`;

  const resetForm = () => {
    setType("CARD");
    setLabel("");
    setDetails("");
    setHolderName("");
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setErrors({});
  };

  const validateForm = () => {
    const nextErrors: FieldErrors<PaymentField> = {};

    if (type === "CARD") {
      nextErrors.holderName = validateCardHolder(holderName);
      nextErrors.cardNumber = validateCardNumber(cardNumber);
      nextErrors.expiry = validateExpiryDate(expiry);
      nextErrors.cvv = validateSecurityCode(cvv);
      nextErrors.label = validateTextLength(cardLabel, "La etiqueta de la tarjeta", 4, 40);
      nextErrors.details = validatePaymentReference(cardDetails, "La referencia");
    } else {
      nextErrors.label = validateTextLength(label, "El nombre del método", 4, 40);
      nextErrors.details = validatePaymentReference(details, "La referencia");
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

      await addPaymentMethod(
        user.id,
        type,
        type === "CARD" ? cardLabel : label,
        type === "CARD" ? cardDetails : details
      );
      resetForm();
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

  const summary = {
    methods: methods.length,
    pending: txs.filter((tx) => tx.status === "PENDING").length,
    approved: txs.filter((tx) => tx.status === "SUCCEEDED").length,
    shop: txs.filter((tx) => tx.kind === "MERCH" || tx.kind === "PACKS").length,
  };

  return (
    <Stack spacing={2}>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3 },
          background: `linear-gradient(135deg, rgba(10,63,43,.94), rgba(19,120,82,.78)), url(${bannerImages.payments})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 950 }}>
          Métodos de pago y movimientos
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 720 }}>
          Guarda tus medios de pago y revisa en un solo lugar entradas, sobres, monedas y compras
          de souvenirs.
        </Typography>
      </Paper>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        <Chip label={`${summary.methods} métodos guardados`} />
        <Chip label={`${summary.pending} pagos pendientes`} />
        <Chip label={`${summary.approved} pagos aprobados`} />
        <Chip label={`${summary.shop} compras de tienda`} />
      </Stack>

      {msg && <Alert severity={msg.severity}>{msg.text}</Alert>}

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h6">Agregar método</Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            select
            label="Tipo"
            value={type}
            onChange={(event) => {
              setType(event.target.value as PaymentMethodType);
              setErrors({});
            }}
            disabled={loading}
            sx={{ maxWidth: { md: 220 } }}
          >
            <MenuItem value="CARD">Tarjeta</MenuItem>
            <MenuItem value="PSE">PSE</MenuItem>
            <MenuItem value="TRANSFER">Transferencia</MenuItem>
            <MenuItem value="CASH">Efectivo</MenuItem>
          </TextField>

          {type === "CARD" ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                  <TextField
                    label="Nombre del titular"
                    value={holderName}
                    onChange={(event) => setHolderName(event.target.value)}
                    error={Boolean(errors.holderName)}
                    helperText={errors.holderName || "Como aparece en la tarjeta"}
                    disabled={loading}
                    fullWidth
                  />
                  <TextField
                    label="Código de seguridad"
                    value={cvv}
                    onChange={(event) => setCvv(onlyDigits(event.target.value).slice(0, 4))}
                    error={Boolean(errors.cvv)}
                    helperText={errors.cvv || "CVV de 3 o 4 dígitos"}
                    disabled={loading}
                    sx={{ minWidth: { md: 220 } }}
                  />
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                  <TextField
                    label="Número de tarjeta"
                    value={cardNumber}
                    onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                    error={Boolean(errors.cardNumber)}
                    helperText={errors.cardNumber || "Se validan 16 dígitos y consistencia del número"}
                    disabled={loading}
                    fullWidth
                  />
                  <TextField
                    label="Vencimiento"
                    value={expiry}
                    onChange={(event) => setExpiry(formatExpiryDate(event.target.value))}
                    error={Boolean(errors.expiry)}
                    helperText={errors.expiry || "Formato MM/AA"}
                    disabled={loading}
                    sx={{ minWidth: { md: 220 } }}
                  />
                </Stack>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background:
                      "linear-gradient(135deg, rgba(8,58,42,.98), rgba(20,111,75,.88))",
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="overline" sx={{ color: "rgba(230,240,232,.8)" }}>
                      Tarjeta segura
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: 2 }}>
                      {cardNumber || "**** **** **** ****"}
                    </Typography>
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Box>
                        <Typography variant="caption" sx={{ color: "rgba(230,240,232,.78)" }}>
                          Titular
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }}>
                          {holderName || "Nombre del titular"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: "rgba(230,240,232,.78)" }}>
                          Vence
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }}>{expiry || "MM/AA"}</Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Paper>
              </Stack>
            </Paper>
          ) : (
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              <TextField
                label="Nombre"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                error={Boolean(errors.label)}
                helperText={
                  errors.label ||
                  (type === "PSE"
                    ? "Ejemplo: PSE Bancolombia"
                    : type === "TRANSFER"
                    ? "Ejemplo: Cuenta principal"
                    : "Ejemplo: Pago en punto autorizado")
                }
                disabled={loading}
                fullWidth
              />
              <TextField
                label="Referencia"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                error={Boolean(errors.details)}
                helperText={
                  errors.details ||
                  (type === "PSE"
                    ? "Ejemplo: Ahorros Bancolombia"
                    : type === "TRANSFER"
                    ? "Ejemplo: Cuenta terminada en 4581"
                    : "Ejemplo: Recaudo Medellín")
                }
                disabled={loading}
                fullWidth
              />
            </Stack>
          )}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Button variant="contained" onClick={onAddMethod} disabled={loading}>
              Agregar método
            </Button>
            <Button variant="outlined" color="inherit" onClick={resetForm} disabled={loading}>
              Limpiar
            </Button>
          </Stack>
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
                      {kindLabels[tx.kind]} · {statusLabels[tx.status]}
                    </Typography>
                    <Typography color="text.secondary">
                      ${tx.amount.toLocaleString()} {tx.currency} · {tx.provider}
                    </Typography>
                    {tx.kind === "PACKS" && (
                      <Typography color="text.secondary">
                        {tx.itemName ?? "Compra de sobres"} · {tx.packs ?? tx.quantity ?? 1} sobres
                      </Typography>
                    )}
                    {tx.kind === "COINS" && (
                      <Typography color="text.secondary">
                        Recarga de {tx.coins ?? 0} monedas
                      </Typography>
                    )}
                    {tx.kind === "TICKET" && (
                      <Typography color="text.secondary">
                        Reserva vinculada: {tx.ticketId ?? "Pendiente de asignación"}
                      </Typography>
                    )}
                    {tx.kind === "MERCH" && (
                      <Typography color="text.secondary">
                        {tx.itemName} · {tx.itemSize} · Cantidad {tx.quantity ?? 1}
                      </Typography>
                    )}
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
