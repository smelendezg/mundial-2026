import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { getUserAlbum } from "../api/albumApi";
import { albumShopCatalog } from "../data/albumShopCatalog";
import { buyListing, cancelListing, createListing, getMarketListings } from "../api/marketApi";
import { useApp } from "../context/AppContext";
import type { MarketListing } from "../types/market";
import type { Sticker } from "../types/sticker";
import RarityChip from "../components/RarityChip";
import { bannerImages } from "../data/mockMedia";
import { validatePositiveNumber } from "../utils/validation";

const POOL_CODE = "AMIGOS2026";

export default function Marketplace() {
  const { user, addCartItem } = useApp();
  const [repeated, setRepeated] = useState<Sticker[]>([]);
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [coins, setCoins] = useState(0);
  const [selectedSticker, setSelectedSticker] = useState("");
  const [price, setPrice] = useState(5);
  const [priceError, setPriceError] = useState("");
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;

    const album = await getUserAlbum(POOL_CODE, user.id, user.name);
    setRepeated([...(album.repeated ?? [])]);
    setCoins(album.coins ?? 0);

    const active = await getMarketListings(POOL_CODE);
    setListings(active ?? []);
  }, [user]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  const repeatedById = useMemo(() => {
    const map = new Map<string, Sticker>();
    for (const sticker of repeated) if (!map.has(sticker.id)) map.set(sticker.id, sticker);
    return map;
  }, [repeated]);

  if (!user) return <Alert severity="warning">Debes iniciar sesión.</Alert>;

  const onCreate = async () => {
    const nextPriceError = validatePositiveNumber(price, "El precio", 1, 200);
    setPriceError(nextPriceError);

    if (!selectedSticker || nextPriceError) {
      setMsg({ text: nextPriceError || "Selecciona una lámina repetida.", type: "error" });
      return;
    }

    const ok = await createListing(POOL_CODE, user.id, selectedSticker, price);
    setMsg(
      ok
        ? { text: "Publicación creada correctamente.", type: "success" }
        : { text: "No se pudo publicar.", type: "error" }
    );
    setSelectedSticker("");
    await refresh();
  };

  const onBuy = async (id: string, listingPrice: number) => {
    if (coins < listingPrice) {
      setMsg({ text: "No tienes suficientes monedas.", type: "error" });
      return;
    }

    const ok = await buyListing(POOL_CODE, user.id, id);
    setMsg(
      ok
        ? { text: "Compra realizada con tus monedas del álbum.", type: "success" }
        : { text: "No se pudo comprar.", type: "error" }
    );
    await refresh();
  };

  const onCancel = async (listingId: string) => {
    const ok = await cancelListing(POOL_CODE, user.id, listingId);
    setMsg(
      ok
        ? { text: "Publicación cancelada y lámina devuelta.", type: "success" }
        : { text: "No se pudo cancelar.", type: "error" }
    );
    await refresh();
  };

  const onAddPackToCart = (item: (typeof albumShopCatalog)[number]) => {
    if (!("packs" in item)) return;
    if (!Number.isInteger(item.packs ?? 0) || (item.packs ?? 0) < 1) {
      setMsg({ text: "La cantidad de sobres no es válida.", type: "error" });
      return;
    }
    addCartItem({
      id: `cart-pack-${item.id}`,
      kind: "PACK",
      sku: item.id.toUpperCase(),
      title: item.title,
      subtitle: item.subtitle,
      quantity: 1,
      amount: item.amount,
      image: item.image ?? "",
      packs: item.packs ?? 0,
    });
    setMsg({ text: "Sobres agregados al carrito.", type: "success" });
  };

  const onAddCoinsToCart = (item: (typeof albumShopCatalog)[number]) => {
    if (!("coins" in item)) return;
    if (!Number.isInteger(item.coins ?? 0) || (item.coins ?? 0) < 1) {
      setMsg({ text: "La cantidad de monedas no es válida.", type: "error" });
      return;
    }
    addCartItem({
      id: `cart-coins-${item.id}`,
      kind: "COINS",
      title: item.title,
      subtitle: item.subtitle,
      quantity: 1,
      amount: item.amount,
      coins: item.coins ?? 0,
    });
    setMsg({ text: "Monedas agregadas al carrito.", type: "success" });
  };

  const myListings = listings.filter((listing) => listing.sellerId === user.id);
  const marketListings = listings.filter((listing) => listing.sellerId !== user.id);

  return (
    <Stack spacing={2.5}>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3 },
          background: `linear-gradient(135deg, rgba(10,63,43,.94), rgba(19,120,82,.80)), url(${bannerImages.marketplace})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 950 }}>
          Tienda de láminas
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
          Compra sobres y monedas desde el carrito. Más abajo puedes publicar o comprar láminas
          repetidas usando tus monedas del álbum.
        </Typography>
      </Paper>

      {msg && <Alert severity={msg.type}>{msg.text}</Alert>}

      <Paper sx={{ p: 2.5 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
          <Box>
            <Typography variant="h6">Sobres y monedas</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Estas compras se agregan al carrito y se pagan junto con entradas o souvenirs.
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 800 }}>
            Monedas actuales: <b>{coins}</b>
          </Typography>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
          {albumShopCatalog.map((item) => (
            <Paper key={item.id} variant="outlined" sx={{ p: 2, width: { xs: "100%", md: 260 } }}>
              <Stack spacing={1}>
                <Typography sx={{ fontWeight: 900 }}>{item.title}</Typography>
                <Typography color="text.secondary">{item.subtitle}</Typography>
                <Typography sx={{ fontWeight: 800 }}>${item.amount.toLocaleString()} COP</Typography>
                <Button
                  variant="contained"
                  onClick={() => ("packs" in item ? onAddPackToCart(item) : onAddCoinsToCart(item))}
                >
                  Agregar al carrito
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Paper>

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h6">Mercado entre usuarios</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
          Aquí sigues comprando láminas repetidas con monedas del álbum, sin pasar por métodos de
          pago externos.
        </Typography>

        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography sx={{ fontWeight: 800 }}>
            Tus monedas: <b>{coins}</b>
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, mt: 2 }} variant="outlined">
          <Typography variant="h6">Publicar lámina repetida</Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              select
              label="Mis repetidas"
              value={selectedSticker}
              onChange={(event) => setSelectedSticker(event.target.value)}
            >
              {repeated.length === 0 ? (
                <MenuItem value="" disabled>
                  No tienes repetidas
                </MenuItem>
              ) : (
                Array.from(repeatedById.values()).map((sticker) => (
                  <MenuItem key={sticker.id} value={sticker.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                      <span>
                        {sticker.name} ({sticker.team})
                      </span>
                      <Box sx={{ flex: 1 }} />
                      <RarityChip rarity={sticker.rarity} />
                    </Box>
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              label="Precio"
              type="number"
              value={price}
              onChange={(event) => setPrice(Number(event.target.value))}
              inputProps={{ min: 1 }}
              error={Boolean(priceError)}
              helperText={priceError || "Entre 1 y 200 monedas."}
            />

            <Button variant="contained" disabled={repeated.length === 0} onClick={onCreate}>
              Publicar
            </Button>
          </Stack>
        </Paper>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="h6">Mis publicaciones</Typography>
            {myListings.length === 0 ? (
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                No tienes publicaciones activas.
              </Typography>
            ) : (
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {myListings.map((listing) => (
                  <Paper key={listing.id} variant="outlined" sx={{ p: 2 }}>
                    <Typography sx={{ fontWeight: 900 }}>{listing.sticker.name}</Typography>
                    <Typography color="text.secondary">
                      {listing.sticker.team} · {listing.price} monedas
                    </Typography>
                    <Button sx={{ mt: 1 }} variant="outlined" color="error" onClick={() => onCancel(listing.id)}>
                      Cancelar publicación
                    </Button>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>

          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="h6">Publicaciones disponibles</Typography>
            {marketListings.length === 0 ? (
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                No hay publicaciones disponibles.
              </Typography>
            ) : (
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {marketListings.map((listing) => (
                  <Paper key={listing.id} variant="outlined" sx={{ p: 2 }}>
                    <Typography sx={{ fontWeight: 900 }}>{listing.sticker.name}</Typography>
                    <Typography color="text.secondary">
                      {listing.sticker.team} · {listing.price} monedas
                    </Typography>
                    <Button sx={{ mt: 1 }} variant="contained" onClick={() => onBuy(listing.id, listing.price)}>
                      Comprar con monedas
                    </Button>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Stack>
      </Paper>
    </Stack>
  );
}
