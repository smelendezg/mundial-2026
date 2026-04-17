import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Chip, Paper, Stack, TextField, Typography } from "@mui/material";

import { getStadiums, stadiumsMock } from "../api/mapsApi";
import type { Stadium } from "../types/stadium";
import { bannerImages } from "../theme/bannerImages";

function buildMapUrl(stadium: Stadium) {
  const delta = 0.035;
  const left = stadium.lng - delta;
  const right = stadium.lng + delta;
  const top = stadium.lat + delta;
  const bottom = stadium.lat - delta;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${stadium.lat}%2C${stadium.lng}`;
}

export default function Maps() {
  const [query, setQuery] = useState("");
  const [stadiums, setStadiums] = useState<Stadium[]>(stadiumsMock);
  const [selectedId, setSelectedId] = useState(stadiumsMock[0].id);

  useEffect(() => {
    getStadiums().then((data) => {
      if (data.length === 0) return;
      setStadiums(data);
      setSelectedId((current) => data.some((stadium) => stadium.id === current) ? current : data[0].id);
    });
  }, []);

  const filtered = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return stadiums;

    return stadiums.filter((stadium) =>
      `${stadium.name} ${stadium.city} ${stadium.country}`.toLowerCase().includes(cleanQuery)
    );
  }, [query, stadiums]);

  const selected = stadiums.find((stadium) => stadium.id === selectedId) ?? filtered[0] ?? stadiums[0];

  return (
    <Stack spacing={2}>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3 },
          background:
            `linear-gradient(135deg, rgba(4,20,13,.88), rgba(12,66,38,.82)), url(${bannerImages.maps})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          Mapa real de estadios 🗺️
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
          Busca una sede y abre su ubicación real en OpenStreetMap con marcador.
        </Typography>
      </Paper>

      <Alert severity="info">
        El mapa usa coordenadas reales de sedes y se centra en el estadio seleccionado.
      </Alert>

      <TextField
        label="Buscar ciudad o estadio"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Ciudad de México, Dallas, MetLife"
        fullWidth
      />

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
        <Paper sx={{ p: 2, flex: 0.9 }}>
          <Typography variant="h6">Sedes</Typography>
          <Stack spacing={1.2} sx={{ mt: 2 }}>
            {filtered.length === 0 ? (
              <Typography color="text.secondary">No hay estadios con esa búsqueda.</Typography>
            ) : (
              filtered.map((stadium) => {
                const active = stadium.id === selected.id;
                return (
                  <Button
                    key={stadium.id}
                    variant={active ? "contained" : "outlined"}
                    onClick={() => setSelectedId(stadium.id)}
                    sx={{ justifyContent: "space-between", py: 1.2 }}
                  >
                    <span>🏟️ {stadium.name}</span>
                    <span>{stadium.city}</span>
                  </Button>
                );
              })
            )}
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, flex: 1.7 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
            <Box>
              <Typography variant="h6">{selected.name}</Typography>
              <Typography color="text.secondary">
                {selected.city}, {selected.country}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip label={`Lat ${selected.lat}`} variant="outlined" />
              <Chip label={`Lng ${selected.lng}`} variant="outlined" />
            </Stack>
          </Stack>

          <Box
            component="iframe"
            title={`Mapa de ${selected.name}`}
            src={buildMapUrl(selected)}
            sx={{
              width: "100%",
              height: { xs: 360, md: 520 },
              mt: 2,
              border: "1px solid rgba(255,255,255,.18)",
              borderRadius: 2,
              filter: "saturate(1.05) contrast(1.02)",
              bgcolor: "rgba(255,255,255,.08)",
            }}
          />
        </Paper>
      </Stack>
    </Stack>
  );
}
