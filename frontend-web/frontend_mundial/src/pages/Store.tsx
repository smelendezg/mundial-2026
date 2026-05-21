import { Box, Button, Chip, CircularProgress, Alert, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { bannerImages } from "../theme/bannerImages";
import { getProductos, getCategorias, agregarAlCarrito } from "../api/storeApi";
import type { ProductoResponse, CategoriaResponse } from "../api/storeApi";

function formatPrecio(value: number) {
  return `$${value.toLocaleString("es-CO")} COP`;
}

function ProductCard({
  product,
  onAdd,
  loading,
}: {
  product: ProductoResponse;
  onAdd: (product: ProductoResponse) => void;
  loading: boolean;
}) {
  return (
    <Paper
      sx={{
        minWidth: { xs: 250, md: 290 },
        width: { xs: 250, md: 290 },
        p: 1.25,
        flexShrink: 0,
        backgroundColor: product.destacado ? "rgba(40, 28, 4, 0.78)" : undefined,
        borderColor: product.destacado ? "rgba(255, 209, 102, 0.42)" : undefined,
      }}
    >
   <Box
  sx={{
    height: 290,
    borderRadius: 1.5,
    backgroundImage: `url(${product.imagenUrl})`,
backgroundSize: "cover",
backgroundPosition: "center",

    mb: 1.5,
  }}
/>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip label={product.categoriaNombre} size="small" />
          {product.equipo && (
            <Chip
              label={`${product.bandera ?? ""} ${product.equipo}`}
              size="small"
              variant="outlined"
            />
          )}
          {product.talla && (
            <Chip label={product.talla} size="small" variant="outlined" />
          )}
        </Stack>

        <Typography sx={{ fontWeight: 900 }}>{product.nombre}</Typography>
        <Typography color="text.secondary" sx={{ minHeight: 42 }}>
          {product.descripcion}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          {formatPrecio(product.precio)}
        </Typography>
        {product.stock === 0 ? (
          <Button variant="outlined" disabled>
            Sin stock
          </Button>
        ) : (
          <Button variant="contained" disabled={loading} onClick={() => onAdd(product)}>
            Agregar al carrito
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

export default function Store() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<ProductoResponse[]>([]);
  const [categorias, setCategorias] = useState<CategoriaResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agregando, setAgregando] = useState<number | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [prods, cats] = await Promise.all([getProductos(), getCategorias()]);
        setProductos(prods);
        setCategorias(cats);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const handleAgregar = async (product: ProductoResponse) => {
    try {
      setAgregando(product.id);
      setMensajeExito(null);
      await agregarAlCarrito({ productoId: product.id, cantidad: 1 });
      setMensajeExito(`"${product.nombre}" agregado al carrito.`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAgregando(null);
    }
  };

  const featured = productos.find((p) => p.destacado) ?? productos[0];

  if (cargando) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 300 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3.5 },
          background: `linear-gradient(135deg, rgba(67,45,4,.92), rgba(142,106,27,.78)), url(${bannerImages.store})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: 300,
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <Stack spacing={1.25} sx={{ maxWidth: 760 }}>
          <Chip label="Tienda oficial" sx={{ alignSelf: "flex-start" }} />
          <Typography variant="h3" sx={{ fontWeight: 950 }}>
            Tienda de souvenirs
          </Typography>
          <Typography sx={{ color: "rgba(234,242,255,.86)" }}>
            Camisetas, accesorios y piezas de colección con precios claros, fotos grandes y un
            recorrido más parecido al de una tienda real.
          </Typography>
          {featured && (
            <Button
              variant="contained"
              onClick={() => handleAgregar(featured)}
              disabled={agregando === featured.id}
              sx={{ alignSelf: "flex-start", mt: 1 }}
            >
              Agregar {featured.nombre}
            </Button>
          )}
        </Stack>
      </Paper>

      {mensajeExito && <Alert severity="success">{mensajeExito}</Alert>}

      {featured && (
        <Paper
          sx={{
            p: { xs: 2, md: 2.5 },
            background: "linear-gradient(135deg, rgba(75,55,6,.92), rgba(168,132,38,.82))",
            borderColor: "rgba(255, 209, 102, 0.46)",
          }}
        >
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
            <Box>
              <Typography variant="overline" sx={{ color: "rgba(255,245,212,.84)" }}>
                Producto destacado
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 950 }}>
                {featured.nombre}
              </Typography>
              <Typography sx={{ color: "rgba(255,245,212,.88)", mt: 0.75, maxWidth: 640 }}>
                {featured.descripcion}
              </Typography>
            </Box>
            <Stack spacing={0.75} alignItems={{ xs: "flex-start", md: "flex-end" }}>
              {featured.talla && <Chip label={featured.talla} />}
              <Typography variant="h4" sx={{ fontWeight: 950 }}>
                {formatPrecio(featured.precio)}
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        <Chip label={`${productos.length} productos disponibles`} />
        <Chip label="Souvenirs oficiales" />
        <Button variant="outlined" size="small" onClick={() => navigate("/cart")}>
          Ver carrito
        </Button>
      </Stack>

      {categorias.map((cat) => {
        const items = productos.filter((p) => p.categoriaNombre === cat.nombre);
        if (items.length === 0) return null;
        return (
          <Stack key={cat.id} spacing={1.5}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {cat.nombre}
              </Typography>
              <Typography color="text.secondary">
                Explora la colección y agrega al carrito lo que quieras llevar.
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                overflowX: "auto",
                pb: 1,
                scrollSnapType: "x proximity",
                "& > *": { scrollSnapAlign: "start" },
              }}
            >
              {items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={handleAgregar}
                  loading={agregando === product.id}
                />
              ))}
            </Box>
          </Stack>
        );
      })}
    </Stack>
  );
}
