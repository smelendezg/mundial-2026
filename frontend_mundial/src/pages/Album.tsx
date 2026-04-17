import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  catalog,
  convertDuplicateToCoins,
  getAlbumHistory,
  getUserAlbum,
  openPack,
} from "../api/albumApi";
import RarityChip from "../components/RarityChip";
import { useApp } from "../context/AppContext";
import type { AlbumEvent } from "../types/albumEvent";
import type { Sticker } from "../types/sticker";
import { getCountryFlag } from "../utils/countries";
import { bannerImages } from "../theme/bannerImages";

const POOL_CODE = "AMIGOS2026";

function rarityPaper(rarity: Sticker["rarity"]) {
  if (rarity === "legend") return "linear-gradient(145deg, #fff0a8, #d49b1f)";
  if (rarity === "rare") return "linear-gradient(145deg, #caffbf, #2ee59d)";
  return "linear-gradient(145deg, #f7f7f7, #b9c4c9)";
}

function eventLabel(type: AlbumEvent["type"]) {
  const labels: Record<AlbumEvent["type"], string> = {
    PACK_OPENED: "Sobre abierto",
    STICKER_NEW: "Lámina nueva",
    STICKER_DUPLICATE: "Lámina repetida",
    COINS_EARNED: "Monedas ganadas",
    TRADE_CREATED: "Intercambio creado",
    TRADE_ACCEPTED: "Intercambio aceptado",
    TRADE_REJECTED: "Intercambio rechazado",
    MARKET_LISTED: "Publicada en mercado",
    MARKET_BOUGHT: "Comprada en mercado",
    MARKET_CANCELLED: "Publicación cancelada",
    COINS_SPENT: "Monedas gastadas",
  };

  return labels[type] ?? type;
}

export default function Album() {
  const { user } = useApp();
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [repeated, setRepeated] = useState<Sticker[]>([]);
  const [lastPack, setLastPack] = useState<Sticker[]>([]);
  const [packsLeft, setPacksLeft] = useState(0);
  const [coins, setCoins] = useState(0);
  const [history, setHistory] = useState<AlbumEvent[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [msg, setMsg] = useState<{ text: string; severity: "success" | "error" | "info" } | null>(
    null
  );

  const countries = useMemo(
    () => Array.from(new Set(catalog.map((sticker) => sticker.team))).sort(),
    []
  );

  const ownedIds = useMemo(() => new Set(stickers.map((sticker) => sticker.id)), [stickers]);

  const progressPct = useMemo(() => {
    if (catalog.length === 0) return 0;
    return Math.round((stickers.length / catalog.length) * 100);
  }, [stickers.length]);

  const selected = selectedCountry || countries[0] || "";
  const countryStickers = useMemo(
    () => catalog.filter((sticker) => sticker.team === selected),
    [selected]
  );
  const ownedInCountry = countryStickers.filter((sticker) => ownedIds.has(sticker.id)).length;
  const countryProgress = countryStickers.length
    ? Math.round((ownedInCountry / countryStickers.length) * 100)
    : 0;

  const refresh = useCallback(async () => {
    if (!user) return;

    const album = await getUserAlbum(POOL_CODE, user.id, user.name);
    setStickers([...(album.stickers ?? [])]);
    setRepeated([...(album.repeated ?? [])]);
    setCoins(album.coins ?? 0);
    setPacksLeft(album.packsLeft ?? 0);

    const events = await getAlbumHistory(POOL_CODE, user.id);
    setHistory(events ?? []);
  }, [user]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  if (!user) return <Alert severity="warning">Debes iniciar sesión.</Alert>;

  const onOpenPack = async () => {
    if (packsLeft <= 0) {
      setMsg({ text: "Ya usaste tus sobres disponibles de hoy.", severity: "info" });
      return;
    }

    try {
      const pack = await openPack(POOL_CODE, user.id, user.name);
      setLastPack([...pack]);
      setMsg({ text: "Sobre abierto. Revisa tus nuevas láminas.", severity: "success" });
      await refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo abrir el sobre.";
      setMsg({ text: message, severity: "error" });
    }
  };

  const onConvertRepeated = async (stickerId: string) => {
    const ok = await convertDuplicateToCoins(POOL_CODE, user.id, user.name, stickerId);
    setMsg(
      ok
        ? { text: "Repetida convertida en moneda.", severity: "success" }
        : { text: "No se pudo convertir la repetida.", severity: "error" }
    );
    await refresh();
  };

  return (
    <Stack spacing={2}>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3 },
          minHeight: 280,
          display: "flex",
          alignItems: "end",
          background:
            `linear-gradient(rgba(4,20,13,.10), rgba(4,20,13,.72)), url(${bannerImages.album})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Álbum Mundialista ✨
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 620, mt: 1 }}>
            Abre sobres, pega láminas por país y completa tu colección.
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
            <Chip label={`📖 ${stickers.length}/${catalog.length} láminas`} />
            <Chip label={`📌 ${progressPct}% completo`} color="success" variant="outlined" />
            <Chip label={`🪙 ${coins} monedas`} variant="outlined" />
            <Chip label={`🎁 ${packsLeft} sobres hoy`} variant="outlined" />
          </Stack>
        </Box>
      </Paper>

      {msg && <Alert severity={msg.severity}>{msg.text}</Alert>}

      <Paper
        sx={{
          p: { xs: 1.5, md: 2.5 },
          background:
            "linear-gradient(90deg, rgba(86,50,24,.92), rgba(36,21,13,.92) 48%, rgba(86,50,24,.92))",
          border: "1px solid rgba(255,220,160,.24)",
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={{ xs: 2, lg: 0 }}
          sx={{
            minHeight: 620,
            perspective: "1400px",
          }}
        >
          <Paper
            sx={{
              flex: 0.75,
              p: 2.5,
              borderRadius: { xs: 2, lg: "8px 0 0 8px" },
              background:
                "linear-gradient(135deg, rgba(255,249,229,.96), rgba(227,237,218,.94))",
              color: "#172019",
              borderRight: { lg: "2px solid rgba(80,45,22,.35)" },
              boxShadow: "inset -14px 0 25px rgba(79,45,22,.18)",
            }}
          >
            <Typography variant="h6" sx={{ color: "#172019" }}>
              Índice de países
            </Typography>
            <Typography sx={{ color: "rgba(23,32,25,.72)", mb: 2 }}>
              Elige una selección para abrir su página.
            </Typography>

            <Stack spacing={1}>
              {countries.map((country) => {
                const total = catalog.filter((sticker) => sticker.team === country).length;
                const owned = catalog.filter(
                  (sticker) => sticker.team === country && ownedIds.has(sticker.id)
                ).length;
                const active = country === selected;

                return (
                  <Button
                    key={country}
                    variant={active ? "contained" : "outlined"}
                    onClick={() => setSelectedCountry(country)}
                    sx={{
                      justifyContent: "space-between",
                      color: active ? undefined : "#172019",
                      borderColor: "rgba(23,32,25,.28)",
                      bgcolor: active ? undefined : "rgba(255,255,255,.42)",
                    }}
                  >
                    <span>
                      {getCountryFlag(country)} {country}
                    </span>
                    <span>
                      {owned}/{total}
                    </span>
                  </Button>
                );
              })}
            </Stack>

            <Box sx={{ mt: 3 }}>
              <Typography sx={{ fontWeight: 900 }}>Progreso total</Typography>
              <LinearProgress
                variant="determinate"
                value={progressPct}
                sx={{ mt: 1, height: 10, borderRadius: 2 }}
              />
              <Typography sx={{ mt: 1, color: "rgba(23,32,25,.72)" }}>
                {progressPct}% del álbum completo
              </Typography>
            </Box>
          </Paper>

          <Paper
            sx={{
              flex: 1.25,
              p: { xs: 2, md: 3 },
              borderRadius: { xs: 2, lg: "0 8px 8px 0" },
              background:
                "linear-gradient(135deg, rgba(255,252,238,.98), rgba(232,240,224,.96))",
              color: "#172019",
              boxShadow: "inset 14px 0 25px rgba(79,45,22,.12)",
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
              <Box>
                <Typography variant="h5" sx={{ color: "#172019", fontWeight: 900 }}>
                  {getCountryFlag(selected)} {selected}
                </Typography>
                <Typography sx={{ color: "rgba(23,32,25,.72)" }}>
                  {ownedInCountry}/{countryStickers.length} láminas pegadas · {countryProgress}%
                </Typography>
              </Box>
              <Button variant="contained" onClick={onOpenPack} disabled={packsLeft <= 0}>
                Abrir sobre 🎁
              </Button>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={countryProgress}
              sx={{ mt: 2, height: 9, borderRadius: 2 }}
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  sm: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2,
                mt: 3,
              }}
            >
              {countryStickers.map((sticker, index) => {
                const owned = ownedIds.has(sticker.id);

                return (
                  <Box
                    key={sticker.id}
                    sx={{
                      minHeight: 190,
                      p: 1.2,
                      borderRadius: 2,
                      background: owned
                        ? "linear-gradient(145deg, rgba(255,255,255,.98), rgba(236,236,226,.98))"
                        : "repeating-linear-gradient(135deg, rgba(23,32,25,.08), rgba(23,32,25,.08) 8px, rgba(23,32,25,.14) 8px, rgba(23,32,25,.14) 16px)",
                      border: owned
                        ? "1px solid rgba(23,32,25,.22)"
                        : "2px dashed rgba(23,32,25,.30)",
                      boxShadow: owned ? "0 14px 28px rgba(40,30,18,.20)" : "inset 0 0 0 1px rgba(255,255,255,.40)",
                      transform: owned ? `rotate(${index % 2 === 0 ? "-1deg" : "1deg"})` : "none",
                    }}
                  >
                    {owned ? (
                      <Stack spacing={1} sx={{ height: "100%" }}>
                        <Box
                          sx={{
                            minHeight: 108,
                            borderRadius: 1.5,
                            display: "grid",
                            placeItems: "center",
                            color: "#172019",
                            background: rarityPaper(sticker.rarity),
                            border: "1px solid rgba(23,32,25,.22)",
                            fontSize: 42,
                            fontWeight: 900,
                          }}
                        >
                          {getCountryFlag(sticker.team)}
                        </Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography sx={{ color: "#172019", fontWeight: 900 }}>
                            {sticker.name}
                          </Typography>
                          <RarityChip rarity={sticker.rarity} />
                        </Stack>
                        <Typography sx={{ color: "rgba(23,32,25,.72)" }}>{sticker.team}</Typography>
                      </Stack>
                    ) : (
                      <Stack
                        sx={{ height: "100%", minHeight: 165 }}
                        alignItems="center"
                        justifyContent="center"
                        spacing={1}
                      >
                        <Typography sx={{ color: "rgba(23,32,25,.45)", fontSize: 38 }}>
                          {getCountryFlag(sticker.team)}
                        </Typography>
                        <Typography sx={{ color: "rgba(23,32,25,.55)", fontWeight: 900 }}>
                          Espacio #{index + 1}
                        </Typography>
                        <Typography sx={{ color: "rgba(23,32,25,.50)", textAlign: "center" }}>
                          Lámina pendiente
                        </Typography>
                      </Stack>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Stack>
      </Paper>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Paper sx={{ p: 2.5, flex: 1 }}>
          <Typography variant="h6">Último sobre 🎁</Typography>
          {lastPack.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Aún no has abierto sobres en esta sesión.
            </Typography>
          ) : (
            <Stack spacing={1} sx={{ mt: 2 }}>
              {lastPack.map((sticker, index) => (
                <Paper key={`${sticker.id}-${index}`} variant="outlined" sx={{ p: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontWeight: 800 }}>
                      {getCountryFlag(sticker.team)} {sticker.name}
                    </Typography>
                    <RarityChip rarity={sticker.rarity} />
                  </Stack>
                  <Typography color="text.secondary">{sticker.team}</Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>

        <Paper sx={{ p: 2.5, flex: 1 }}>
          <Typography variant="h6">Repetidas para intercambiar 🪙</Typography>
          {repeated.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Aún no tienes láminas repetidas.
            </Typography>
          ) : (
            <Stack spacing={1} sx={{ mt: 2 }}>
              {repeated.slice(0, 6).map((sticker, index) => (
                <Paper key={`${sticker.id}-${index}`} variant="outlined" sx={{ p: 1.5 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                    <Box>
                      <Typography sx={{ fontWeight: 800 }}>
                        {getCountryFlag(sticker.team)} {sticker.name}
                      </Typography>
                      <Typography color="text.secondary">{sticker.team}</Typography>
                    </Box>
                    <Button size="small" variant="outlined" onClick={() => onConvertRepeated(sticker.id)}>
                      Convertir
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h6">Bitácora del álbum</Typography>
        {history.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Aún no hay movimientos registrados.
          </Typography>
        ) : (
          <Stack spacing={0.8} sx={{ mt: 1 }}>
            {history.slice(0, 8).map((event) => (
              <Typography key={event.id} color="text.secondary">
                📌 <b>{eventLabel(event.type)}</b> · {new Date(event.createdAt).toLocaleString()}
              </Typography>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
