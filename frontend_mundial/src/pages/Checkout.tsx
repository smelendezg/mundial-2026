import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Chip, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  confirmPaymentTx,
  createCoinsPayment,
  createMerchPayment,
  createPackPayment,
  createTicketPayment,
  getMyPaymentMethods,
} from "../api/paymentsApi";
import { bannerImages } from "../data/mockMedia";
import { reserveTicket } from "../api/ticketsApi";
import { useApp, type CartItem } from "../context/AppContext";
import type { PaymentMethod } from "../types/payment";
import { validateMoneyAmount, validateRequired } from "../utils/validation";

type CheckoutKind = "TICKET" | "COINS" | "MERCH";
type Msg = { text: string; severity: "success" | "error" | "info" } | null;

type CheckoutLine =
  | CartItem
  | {
      id: string;
      kind: "COINS";
      quantity: number;
      amount: number;
      title: string;
      subtitle: string;
      coins: number;
    };

export default function Checkout() {
  const { user, cartItems, clearCart } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const kind = ((searchParams.get("type") ?? "TICKET").toUpperCase() as CheckoutKind) || "TICKET";
  const ticketId = searchParams.get("ticketId") ?? "";
  const coins = Number(searchParams.get("coins") ?? "0");
  const itemSku = searchParams.get("sku") ?? "";
  const itemName = searchParams.get("itemName") ?? "";
  const itemSize = searchParams.get("size") ?? "";
  const quantity = Number(searchParams.get("quantity") ?? "1");
  const amount = Number(searchParams.get("amount") ?? "0");

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [methodId, setMethodId] = useState("");
  const [txIds, setTxIds] = useState<string[]>([]);
  const [msg, setMsg] = useState<Msg>(null);
  const [loading, setLoading] = useState(false);

  const checkoutItems = useMemo<CheckoutLine[]>(() => {
    if (searchParams.toString()) {
      if (kind === "COINS") {
        return [
          {
            id: "coins-direct",
            kind: "COINS",
            quantity: 1,
            amount,
            title: "Recarga de monedas",
            subtitle: `${coins} monedas`,
            coins,
          },
        ];
      }

      if (kind === "MERCH") {
        return [
          {
            id: `direct-${itemSku}`,
            kind: "MERCH",
            sku: itemSku,
            itemName,
            itemSize,
            quantity,
            amount,
            image: "",
          },
        ];
      }

      return [
        {
          id: `direct-ticket-${ticketId}`,
          kind: "TICKET",
          matchId: ticketId,
          title: "Reserva de entrada",
          subtitle: `Reserva ${ticketId}`,
          quantity,
          amount,
        },
      ];
    }

    return cartItems;
  }, [amount, cartItems, coins, itemName, itemSize, itemSku, kind, quantity, searchParams, ticketId]);

  const totalAmount = checkoutItems.reduce((sum, item) => sum + item.amount, 0);
  const title = searchParams.toString() ? "Pago directo" : "Carrito y pago";

  useEffect(() => {
    if (!user) return;

    getMyPaymentMethods(user.id).then((data) => {
      setMethods(data ?? []);
      setMethodId(data.find((method) => method.isDefault)?.id ?? data[0]?.id ?? "");
    });
  }, [user]);

  if (!user) return <Alert severity="warning">Debes iniciar sesión.</Alert>;

  const validateCheckout = () => {
    if (checkoutItems.length === 0) return "Tu carrito está vacío.";
    if (!methodId) return "Selecciona un método de pago.";
    const totalError = validateMoneyAmount(
      totalAmount,
      "El valor del pago",
      1000,
      20000000
    );
    if (totalError) return totalError;
    for (const item of checkoutItems) {
      const maxQuantity = item.kind === "TICKET" ? 6 : 10;
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > maxQuantity) {
        return item.kind === "TICKET"
          ? "Cada reserva debe tener entre 1 y 6 entradas."
          : "Cada artículo debe tener una cantidad válida entre 1 y 10.";
      }
      const amountError = validateMoneyAmount(item.amount, "El valor del artículo", 1000, 5000000);
      if (amountError) {
        return "Todos los artículos deben tener un valor válido.";
      }
      if (item.kind === "TICKET") {
        if (validateRequired(item.matchId, "El partido")) return "Hay una entrada sin partido válido.";
      }
      if (item.kind === "MERCH") {
        if (validateRequired(item.sku, "El SKU") || validateRequired(item.itemName, "El producto", 4)) {
          return "Hay un souvenir con datos incompletos.";
        }
      }
      if (item.kind === "PACK") {
        if (validateRequired(item.sku, "El SKU") || !Number.isInteger(item.packs) || item.packs < 1) {
          return "Hay una compra de sobres con datos incompletos.";
        }
      }
      if (item.kind === "COINS") {
        if (!Number.isInteger(item.coins) || item.coins < 1) {
          return "Hay una compra de monedas con datos incompletos.";
        }
      }
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
      const createdIds: string[] = [];

      for (const item of checkoutItems) {
        if (item.kind === "COINS") {
          const tx = await createCoinsPayment(user.id, item.coins, methodId, item.amount);
          createdIds.push(tx.id);
          continue;
        }

        if (item.kind === "PACK") {
          const tx = await createPackPayment(
            user.id,
            item.sku,
            item.title,
            item.packs,
            item.quantity,
            methodId,
            item.amount
          );
          createdIds.push(tx.id);
          continue;
        }

        if (item.kind === "MERCH") {
          const tx = await createMerchPayment(
            user.id,
            item.sku,
            item.itemName,
            item.itemSize,
            item.quantity,
            methodId,
            item.amount
          );
          createdIds.push(tx.id);
          continue;
        }

        const ticket = await reserveTicket(user.id, item.matchId, item.quantity);
        const tx = await createTicketPayment(user.id, ticket.id, methodId, item.amount);
        createdIds.push(tx.id);
      }

      setTxIds(createdIds);
      setMsg({
        text:
          createdIds.length === 1
            ? "Transacción creada. Confirma el pago para finalizar."
            : "Se crearon las transacciones del carrito. Confirma el pago para finalizar.",
        severity: "info",
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error creando el pago.";
      setMsg({ text: message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onConfirm = async () => {
    if (txIds.length === 0) {
      setMsg({ text: "Primero crea la transacción.", severity: "error" });
      return;
    }

    try {
      setLoading(true);
      for (const txId of txIds) {
        const tx = await confirmPaymentTx(user.id, txId);

        if (tx.status === "PENDING") {
          setMsg({ text: "Uno de los pagos sigue pendiente en el proveedor sandbox.", severity: "info" });
          return;
        }

        if (tx.status === "FAILED") {
          setMsg({ text: "Uno de los pagos fue rechazado por el proveedor sandbox.", severity: "error" });
          return;
        }
      }

      if (!searchParams.toString()) clearCart();
      setMsg({ text: "Pago confirmado correctamente.", severity: "success" });
      navigate("/payments");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error confirmando el pago.";
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
          minHeight: 240,
          background: `linear-gradient(135deg, rgba(9,61,42,.92), rgba(22,117,79,.82)), url(${bannerImages.checkout})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <Stack spacing={1}>
          <Typography variant="h4" sx={{ fontWeight: 950 }}>{title}</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
            Revisa tu pedido, elige el método de pago y confirma todo en un solo paso.
          </Typography>
        </Stack>
      </Paper>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        <Chip label={`${checkoutItems.length} líneas`} />
        <Chip label={`${checkoutItems.reduce((sum, item) => sum + item.quantity, 0)} artículos`} />
        <Chip label={`Total $${totalAmount.toLocaleString()} COP`} />
      </Stack>

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
        <Typography variant="h6">Resumen del carrito</Typography>

        <Stack spacing={1.25} sx={{ mt: 2 }}>
          {checkoutItems.map((item) => (
            <Paper key={item.id} variant="outlined" sx={{ p: 1.5 }}>
              <Typography sx={{ fontWeight: 800 }}>
                {item.kind === "COINS"
                  ? item.title
                  : item.kind === "PACK"
                  ? item.title
                  : item.kind === "MERCH"
                  ? item.itemName
                  : item.title}
              </Typography>
              <Typography color="text.secondary">
                {item.kind === "COINS"
                  ? item.subtitle
                  : item.kind === "PACK"
                  ? `${item.subtitle} · Cantidad ${item.quantity}`
                  : item.kind === "MERCH"
                  ? `${item.itemSize} · Cantidad ${item.quantity}`
                  : `${item.subtitle} · Cantidad ${item.quantity}`}
              </Typography>
              <Typography color="text.secondary">
                Total: ${item.amount.toLocaleString()} COP
              </Typography>
            </Paper>
          ))}
        </Stack>

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
              Crear transacciones
            </Button>
            <Button variant="outlined" onClick={onConfirm} disabled={loading || txIds.length === 0}>
              Confirmar pagos
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
