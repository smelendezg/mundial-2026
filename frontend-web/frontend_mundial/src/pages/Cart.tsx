import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Alert,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { bannerImages } from "../theme/bannerImages";
import {
  getCarrito,
  eliminarItemCarrito,
  vaciarCarrito,
  confirmarOrden,
  type OrdenResponse,
  type ItemOrdenResponse,
} from "../api/storeApi";
import { getMyPaymentMethods } from "../api/paymentsApi";
import type { PaymentMethod } from "../types/payment";
import { useApp } from "../context/AppContext";

function formatPrecio(value: number) {
  return `$${value.toLocaleString("es-CO")} COP`;
}

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [orden, setOrden] = useState<OrdenResponse | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<number | null>(null);
  const [vaciando, setVaciando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [metodos, setMetodos] = useState<PaymentMethod[]>([]);
  const [metodoPagoId, setMetodoPagoId] = useState("");
  const [mostrarPago, setMostrarPago] = useState(false);

  const cargarCarrito = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await getCarrito();
      setOrden(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCarrito();
  }, []);

  useEffect(() => {
    if (!user) return;
    getMyPaymentMethods(user.id).then((data) => {
      setMetodos(data ?? []);
      const def = data.find((m) => m.isDefault) ?? data[0];
      if (def) setMetodoPagoId(def.id);
    });
  }, [user]);

  const handleEliminarItem = async (item: ItemOrdenResponse) => {
    try {
      setEliminando(item.id);
      setError(null);
      const actualizado = await eliminarItemCarrito(item.id);
      setOrden(actualizado);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEliminando(null);
    }
  };

  const handleVaciar = async () => {
    try {
      setVaciando(true);
      setError(null);
      await vaciarCarrito();
      setOrden(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setVaciando(false);
    }
  };

  const handleConfirmar = async () => {
    if (!metodoPagoId) {
      setError("Selecciona un método de pago.");
      return;
    }
    try {
      setConfirmando(true);
      setError(null);
      await confirmarOrden({ metodoPagoId: Number(metodoPagoId) });
      setExito("¡Pago realizado correctamente! Tu orden ha sido confirmada.");
      setOrden(null);
      setMostrarPago(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setConfirmando(false);
    }
  };

  if (cargando) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 300 }}>
        <CircularProgress />
      </Stack>
    );
  }

  const items = orden?.items ?? [];
  const total = orden?.total ?? 0;
  const cantidad = items.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <Stack spacing={2.5}>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3 },
          background: `linear-gradient(135deg, rgba(10,63,43,.94), rgba(17,118,76,.82)), url(${bannerImages.cart})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 950 }}>
          Carrito de compra
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 720 }}>
          Revisa los productos antes de pasar al pago.
        </Typography>
      </Paper>

      {error && <Alert severity="error">{error}</Alert>}
      {exito && (
        <Alert severity="success" action={
          <Button color="inherit" size="small" onClick={() => navigate("/store")}>
            Ir a tienda
          </Button>
        }>
          {exito}
        </Alert>
      )}

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        <Chip label={`${items.length} productos`} />
        <Chip label={`${cantidad} artículos`} />
        <Chip label={formatPrecio(total)} />
        {orden?.estado && <Chip label={`Estado: ${orden.estado}`} variant="outlined" />}
      </Stack>

      {items.length === 0 && !exito ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Tu carrito está vacío</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Agrega productos desde la tienda de souvenirs.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => navigate("/store")}>
              Ir a tienda
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Stack spacing={2}>
          <Paper sx={{ p: 2.5 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
              <Box>
                <Typography variant="h6">Resumen del pedido</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                  Revisa los artículos antes de continuar al pago.
                </Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  variant="outlined"
                  color="inherit"
                  disabled={vaciando}
                  onClick={handleVaciar}
                >
                  Vaciar carrito
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setMostrarPago(true)}
                  disabled={items.length === 0}
                >
                  Ir a pagar
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {items.map((item) => (
            <Paper key={item.id} variant="outlined" sx={{ p: 2.25 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Avatar
                    variant="rounded"
                    src={item.productoImagenUrl}
                    alt={item.productoNombre}
                    sx={{ width: 72, height: 72, borderRadius: 1 }}
                  />
                  <Stack spacing={0.75}>
                    <Chip
                      icon={<ShoppingBagRoundedIcon />}
                      label="Souvenir"
                      size="small"
                      sx={{ alignSelf: "flex-start" }}
                    />
                    <Typography sx={{ fontWeight: 900 }}>{item.productoNombre}</Typography>
                    <Typography color="text.secondary">
                      Cantidad: {item.cantidad} · Precio unitario: {formatPrecio(item.precioUnitario)}
                    </Typography>
                    <Typography color="text.secondary">
                      Total: {formatPrecio(item.precioUnitario * item.cantidad)}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems="flex-start">
                  <Button variant="outlined" onClick={() => navigate("/store")}>
                    Ver tienda
                  </Button>
                  <Button
                    color="error"
                    variant="outlined"
                    disabled={eliminando === item.id}
                    onClick={() => handleEliminarItem(item)}
                  >
                    Quitar
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}

          <Paper sx={{ p: 2.5 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
              <Box>
                <Typography variant="h6">Total a pagar</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Al confirmar se procesará el pago de todos los artículos.
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 950 }}>
                {formatPrecio(total)}
              </Typography>
            </Stack>
          </Paper>

          {mostrarPago && (
            <Paper sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Confirmar pago
              </Typography>
              {metodos.length === 0 ? (
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
              ) : (
                <Stack spacing={2}>
                  <TextField
                    select
                    label="Método de pago"
                    value={metodoPagoId}
                    onChange={(e) => setMetodoPagoId(e.target.value)}
                    disabled={confirmando}
                    fullWidth
                  >
                    {metodos.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.label} {m.isDefault ? "· predeterminado" : ""}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <Button
                      variant="contained"
                      onClick={handleConfirmar}
                      disabled={confirmando}
                    >
                      {confirmando ? "Procesando..." : "Confirmar pago"}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setMostrarPago(false)}
                      disabled={confirmando}
                    >
                      Cancelar
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Paper>
          )}
        </Stack>
      )}
    </Stack>
  );
}
