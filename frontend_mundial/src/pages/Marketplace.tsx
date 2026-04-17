// src/pages/Marketplace.tsx 

import { useCallback, useEffect, useMemo, useState } from "react"; 

import { 

  Paper, 

  Stack, 

  Typography, 

  Button, 

  TextField, 

  MenuItem, 

  Alert, 

  Divider, 

  Box, 

} from "@mui/material"; 

 

import { useApp } from "../context/AppContext"; 

import { createListing, buyListing, cancelListing, getMarketListings } from "../api/marketApi"; 

import { getUserAlbum } from "../api/albumApi"; 

 

import type { MarketListing } from "../types/market"; 

import type { Sticker } from "../types/sticker"; 

 

import RarityChip from "../components/RarityChip"; 
import { validatePositiveNumber } from "../utils/validation";

 

const POOL_CODE = "AMIGOS2026"; 

 

export default function Marketplace() { 

  const { user } = useApp(); 

 

  const [repeated, setRepeated] = useState<Sticker[]>([]); 

  const [listings, setListings] = useState<MarketListing[]>([]); 

  const [coins, setCoins] = useState(0); 

 

  const [selectedSticker, setSelectedSticker] = useState(""); 

  const [price, setPrice] = useState(5); 

  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null); 
  const [priceError, setPriceError] = useState("");

 

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

    for (const s of repeated) if (!map.has(s.id)) map.set(s.id, s); 

    return map; 

  }, [repeated]); 

 

  if (!user) return <Alert severity="warning">Debes iniciar sesión</Alert>; 

 

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

      ok ? { text: "Compra realizada.", type: "success" } : { text: "No se pudo comprar.", type: "error" } 

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

 

  const myListings = listings.filter((l) => l.sellerId === user.id); 

  const marketListings = listings.filter((l) => l.sellerId !== user.id); 

 

  return ( 

    <Stack spacing={2}> 

      <Typography variant="h5">Marketplace</Typography> 
      <Alert severity="info">
        Publica láminas repetidas, compra con monedas y conserva registro de cada movimiento.
      </Alert>

 

      <Paper sx={{ p: 2 }}> 

        <Stack direction="row" justifyContent="space-between" alignItems="center"> 

          <Typography> 

            Tus monedas: <b>{coins}</b> 

          </Typography> 

 

          <Typography color="text.secondary"> 

            Publicaciones activas: <b>{listings.length}</b> 

          </Typography> 

        </Stack> 

      </Paper> 

 

      {msg && <Alert severity={msg.type}>{msg.text}</Alert>} 

 

      {/* PUBLICAR */} 

      <Paper sx={{ p: 2 }}> 

        <Typography variant="h6">Publicar sticker</Typography> 

 

        <Stack spacing={2} sx={{ mt: 2 }}> 

          <TextField 

            select 

            label="Mis repetidas" 

            value={selectedSticker} 

            onChange={(e) => setSelectedSticker(e.target.value)} 

          > 

            {repeated.length === 0 ? ( 

              <MenuItem value="" disabled> 

                No tienes repetidas 

              </MenuItem> 

            ) : ( 

              Array.from(repeatedById.values()).map((s) => ( 

                <MenuItem key={s.id} value={s.id}> 

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}> 

                    <span> 

                      {s.name} ({s.team}) 

                    </span> 

                    <Box sx={{ flex: 1 }} /> 

                    <RarityChip rarity={s.rarity} /> 

                  </Box> 

                </MenuItem> 

              )) 

            )} 

          </TextField> 

 

          <TextField 

            label="Precio" 

            type="number" 

            value={price} 

            onChange={(e) => setPrice(Number(e.target.value))} 

            inputProps={{ min: 1 }} 

            error={Boolean(priceError)}
            helperText={priceError || "Entre 1 y 200 monedas. Precio recomendado: 5."} 

          /> 

 

          <Button variant="contained" disabled={repeated.length === 0} onClick={onCreate}> 

            Publicar 

          </Button> 

        </Stack> 

      </Paper> 

 

      {/* MIS PUBLICACIONES */} 

      <Paper sx={{ p: 2 }}> 

        <Typography variant="h6">Mis publicaciones</Typography> 

 

        {myListings.length === 0 ? ( 

          <Typography color="text.secondary" sx={{ mt: 1 }}> 

            No has publicado nada. 

          </Typography> 

        ) : ( 

          <Stack spacing={2} sx={{ mt: 2 }}> 

            {myListings.map((l) => ( 

              <Paper key={l.id} variant="outlined" sx={{ p: 2 }}> 

                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}> 

                  <Stack spacing={0.5}> 

                    <Typography> 

                      <b>{l.sticker.name}</b> <Typography component="span" color="text.secondary">({l.sticker.team})</Typography> 

                    </Typography> 

                    <Typography color="text.secondary"> 

                      Precio: <b>{l.price}</b> monedas 

                    </Typography> 

                  </Stack> 

 

                  <Stack direction="row" spacing={1} alignItems="center"> 

                    <RarityChip rarity={l.sticker.rarity} /> 

                    <Button variant="outlined" color="error" onClick={() => onCancel(l.id)}> 

                      Cancelar 

                    </Button> 

                  </Stack> 

                </Stack> 

              </Paper> 

            ))} 

          </Stack> 

        )} 

      </Paper> 

 

      <Divider /> 

 

      {/* MERCADO GENERAL */} 

      <Paper sx={{ p: 2 }}> 

        <Typography variant="h6">Mercado general</Typography> 

 

        {marketListings.length === 0 ? ( 

          <Typography color="text.secondary" sx={{ mt: 1 }}> 

            No hay publicaciones activas. 

          </Typography> 

        ) : ( 

          <Stack spacing={2} sx={{ mt: 2 }}> 

            {marketListings.map((l) => ( 

              <Paper key={l.id} variant="outlined" sx={{ p: 2 }}> 

                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}> 

                  <Stack spacing={0.5}> 

                    <Typography> 

                      <b>{l.sticker.name}</b> <Typography component="span" color="text.secondary">({l.sticker.team})</Typography> 

                    </Typography> 

                    <Typography color="text.secondary"> 

                      Precio: <b>{l.price}</b> monedas 

                    </Typography> 

                  </Stack> 

 

                  <Stack direction="row" spacing={1} alignItems="center"> 

                    <RarityChip rarity={l.sticker.rarity} /> 

                    <Button 

                      variant="outlined" 

                      onClick={() => onBuy(l.id, l.price)} 

                      disabled={coins < l.price} 

                    > 

                      Comprar 

                    </Button> 

                  </Stack> 

                </Stack> 

 

                {coins < l.price && ( 

                  <Typography color="text.secondary" sx={{ mt: 1, fontSize: 12 }}> 

                    Te faltan {l.price - coins} monedas para comprar este sticker. 

                  </Typography> 

                )} 

              </Paper> 

            ))} 

          </Stack> 

        )} 

      </Paper> 

    </Stack> 

  ); 

} 
