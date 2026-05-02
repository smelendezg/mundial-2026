import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { useMemo } from "react";

import { storeCatalog, formatStorePrice, type StoreProduct } from "../data/storeCatalog";
import { bannerImages } from "../data/mockMedia";
import { useApp } from "../context/AppContext";

function ProductCard({
  product,
  onAdd,
}: {
  product: StoreProduct;
  onAdd: (product: StoreProduct) => void;
}) {
  return (
    <Paper
      sx={{
        minWidth: { xs: 250, md: 290 },
        width: { xs: 250, md: 290 },
        p: 1.25,
        flexShrink: 0,
        backgroundColor: product.highlight ? "rgba(40, 28, 4, 0.78)" : undefined,
        borderColor: product.highlight ? "rgba(255, 209, 102, 0.42)" : undefined,
      }}
    >
      <Box
        sx={{
          height: 290,
          borderRadius: 1.5,
          backgroundImage: `linear-gradient(rgba(6,16,11,.08), rgba(6,16,11,.28)), url(${product.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          mb: 1.5,
        }}
      />

      <Stack spacing={1}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip label={product.category} size="small" />
          {product.team && <Chip label={`${product.flag ?? ""} ${product.team}`} size="small" variant="outlined" />}
          <Chip label={product.sizeLabel} size="small" variant="outlined" />
        </Stack>

        <Typography sx={{ fontWeight: 900 }}>{product.name}</Typography>
        <Typography color="text.secondary" sx={{ minHeight: 42 }}>
          {product.description}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          {formatStorePrice(product.price)}
        </Typography>
        <Button variant="contained" onClick={() => onAdd(product)}>
          Agregar al carrito
        </Button>
      </Stack>
    </Paper>
  );
}

export default function Store() {
  const { addCartItem } = useApp();

  const featured = storeCatalog.find((product) => product.highlight) ?? storeCatalog[0];
  const categories = useMemo(
    () =>
      ["Camisetas", "Accesorios", "Coleccionables"].map((category) => ({
        category,
        items: storeCatalog.filter((product) => product.category === category),
      })),
    []
  );

  const addToCart = (product: StoreProduct) => {
    addCartItem({
      id: `cart-merch-${product.sku}-${product.sizeLabel}`,
      kind: "MERCH",
      sku: product.sku,
      itemName: product.name,
      itemSize: product.sizeLabel,
      quantity: 1,
      amount: product.price,
      image: product.image,
    });
  };

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
          <Button
            variant="contained"
            onClick={() => addToCart(featured)}
            sx={{ alignSelf: "flex-start", mt: 1 }}
          >
            Agregar {featured.name}
          </Button>
        </Stack>
      </Paper>

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
              {featured.name}
            </Typography>
            <Typography sx={{ color: "rgba(255,245,212,.88)", mt: 0.75, maxWidth: 640 }}>
              {featured.description}
            </Typography>
          </Box>
          <Stack spacing={0.75} alignItems={{ xs: "flex-start", md: "flex-end" }}>
            <Chip label={featured.sizeLabel} />
            <Typography variant="h4" sx={{ fontWeight: 950 }}>
              {formatStorePrice(featured.price)}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        <Chip label={`${storeCatalog.length} productos disponibles`} />
        <Chip label="Camisetas unitalla" />
        <Chip label="Souvenirs oficiales" />
      </Stack>

      {categories.map(({ category, items }) => (
        <Stack key={category} spacing={1.5}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              {category}
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
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))}
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}
