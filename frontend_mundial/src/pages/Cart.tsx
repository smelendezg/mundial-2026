import { Avatar, Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import StadiumRoundedIcon from "@mui/icons-material/StadiumRounded";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useApp } from "../context/AppContext";
import { bannerImages } from "../data/mockMedia";

function currency(value: number) {
  return `$${value.toLocaleString("es-CO")} COP`;
}

function ticketAvatarLabel(title: string) {
  return title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function Cart() {
  const { cartItems, removeCartItem, clearCart } = useApp();
  const navigate = useNavigate();

  const totals = useMemo(() => {
    const tickets = cartItems.filter((item) => item.kind === "TICKET").length;
    const merch = cartItems.filter((item) => item.kind === "MERCH").length;
    const album = cartItems.filter((item) => item.kind === "COINS" || item.kind === "PACK").length;
    const quantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const amount = cartItems.reduce((sum, item) => sum + item.amount, 0);
    return { tickets, merch, album, quantity, amount };
  }, [cartItems]);

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
          Reúne entradas, sobres, monedas y souvenirs en un solo pedido antes de pasar al pago.
        </Typography>
      </Paper>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        <Chip label={`${totals.tickets} reservas por pagar`} />
        <Chip label={`${totals.album} compras de álbum`} />
        <Chip label={`${totals.merch} souvenirs`} />
        <Chip label={`${totals.quantity} artículos`} />
        <Chip label={currency(totals.amount)} />
      </Stack>

      {cartItems.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Tu carrito está vacío</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Agrega entradas, sobres, monedas o souvenirs desde sus secciones.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => navigate("/store")}>
              Ir a tienda
            </Button>
            <Button variant="outlined" onClick={() => navigate("/tickets")}>
              Ver entradas
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
                  Revisa los artículos antes de crear las transacciones.
                </Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button variant="outlined" color="inherit" onClick={clearCart}>
                  Vaciar carrito
                </Button>
                <Button variant="contained" onClick={() => navigate("/checkout")}>
                  Ir a pagar
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {cartItems.map((item) => (
            <Paper key={item.id} variant="outlined" sx={{ p: 2.25 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  {item.kind === "MERCH" || item.kind === "PACK" ? (
                    <Avatar
                      variant="rounded"
                      src={item.image}
                      alt={item.kind === "MERCH" ? item.itemName : item.title}
                      sx={{ width: 72, height: 72, borderRadius: 1 }}
                    />
                  ) : (
                    <Avatar
                      variant="rounded"
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: 1,
                        bgcolor: item.kind === "COINS" ? "success.dark" : "primary.dark",
                      }}
                    >
                      {item.kind === "COINS" ? "M" : ticketAvatarLabel(item.title)}
                    </Avatar>
                  )}

                  <Stack spacing={0.75}>
                    <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                      {item.kind === "TICKET" ? (
                        <Chip icon={<StadiumRoundedIcon />} label="Entrada" size="small" />
                      ) : item.kind === "COINS" || item.kind === "PACK" ? (
                        <Chip icon={<ShoppingBagRoundedIcon />} label="Álbum" size="small" />
                      ) : (
                        <Chip icon={<ShoppingBagRoundedIcon />} label="Souvenir" size="small" />
                      )}
                      {item.kind === "MERCH" && (
                        <Chip label={item.itemSize} size="small" variant="outlined" />
                      )}
                      {item.kind === "PACK" && (
                        <Chip label={`${item.packs} sobres`} size="small" variant="outlined" />
                      )}
                      {item.kind === "COINS" && (
                        <Chip label={`${item.coins} monedas`} size="small" variant="outlined" />
                      )}
                    </Stack>
                    <Typography sx={{ fontWeight: 900 }}>
                      {item.kind === "TICKET"
                        ? item.title
                        : item.kind === "MERCH"
                        ? item.itemName
                        : item.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {item.kind === "TICKET"
                        ? item.subtitle
                        : item.kind === "MERCH"
                        ? `${item.itemSize} · SKU ${item.sku}`
                        : item.subtitle}
                    </Typography>
                    <Typography color="text.secondary">
                      Cantidad: {item.quantity} · Total: {currency(item.amount)}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                  {item.kind === "TICKET" ? (
                    <Button variant="outlined" onClick={() => navigate("/tickets")}>
                      Cambiar entrada
                    </Button>
                  ) : item.kind === "COINS" || item.kind === "PACK" ? (
                    <Button variant="outlined" onClick={() => navigate("/marketplace")}>
                      Ver tienda de láminas
                    </Button>
                  ) : (
                    <Button variant="outlined" onClick={() => navigate("/store")}>
                      Ver tienda de souvenirs
                    </Button>
                  )}
                  <Button color="error" variant="outlined" onClick={() => removeCartItem(item.id)}>
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
                  Las entradas se reservan al crear la transacción y el resto de artículos se paga
                  en el mismo flujo.
                </Typography>
              </Box>
              <Stack spacing={1} alignItems={{ xs: "flex-start", md: "flex-end" }}>
                <Typography variant="h4" sx={{ fontWeight: 950 }}>
                  {currency(totals.amount)}
                </Typography>
                <Button variant="contained" onClick={() => navigate("/checkout")}>
                  Continuar al pago
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      )}
    </Stack>
  );
}
