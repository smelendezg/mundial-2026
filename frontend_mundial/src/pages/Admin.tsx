import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import type { Match, MatchStatus } from "../types/match";
import type { StoreProduct } from "../data/storeCatalog";
import {
  adminGetMatches,
  adminPublishResult,
  adminSetMatchStatus,
  adminUpdateMatch,
} from "../api/adminApi";
import { storeCatalog } from "../data/storeCatalog";
import { useApp } from "../context/AppContext";
import { formatTeam } from "../utils/countries";
import {
  validateDateTime,
  validateFutureDateTime,
  validateImageSource,
  validateIntegerRange,
  validateMoneyAmount,
  validateOptionalEmojiFlag,
  validateRequired,
  validateTextLength,
  type FieldErrors,
} from "../utils/validation";
import { bannerImages } from "../data/mockMedia";

type Msg = { text: string; severity: "success" | "error" | "info" } | null;
type MatchField = "selectedMatchId" | "city" | "stadium" | "startLocal" | "inconsistencyNote";
type ProductField =
  | "name"
  | "category"
  | "price"
  | "stock"
  | "description"
  | "image"
  | "sizeLabel"
  | "team"
  | "flag";

type OperatorProduct = StoreProduct & {
  active: boolean;
  promoted: boolean;
  stock: number;
};

const statusLabels: Record<MatchStatus, string> = {
  SCHEDULED: "Programado",
  LIVE: "En vivo",
  PENDING_DATA: "Pendiente de datos",
  FINISHED: "Finalizado",
};

const statusColors: Record<MatchStatus, "default" | "success" | "warning" | "info"> = {
  SCHEDULED: "info",
  LIVE: "success",
  PENDING_DATA: "warning",
  FINISHED: "default",
};

function toLocalDatetimeInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function fromLocalDatetimeInputToISO(localValue: string) {
  return new Date(localValue).toISOString();
}

function validateScore(value: number, label: string) {
  if (!Number.isInteger(value)) return `${label} debe ser un número entero.`;
  if (value < 0) return `${label} no puede ser negativo.`;
  if (value > 20) return `${label} no puede ser mayor que 20.`;
  return "";
}

function buildOperatorCatalog(): OperatorProduct[] {
  return storeCatalog.map((product, index) => ({
    ...product,
    active: true,
    promoted: index < 2,
    stock: product.category === "Camisetas" ? 24 : 12,
  }));
}

export default function OperatorPanel() {
  const { user } = useApp();
  const navigate = useNavigate();
  const productImageInputRef = useRef<HTMLInputElement | null>(null);

  const [tab, setTab] = useState(0);
  const [msg, setMsg] = useState<Msg>(null);
  const [loading, setLoading] = useState(false);

  const [matches, setMatches] = useState<Match[]>([]);
  const [catalog, setCatalog] = useState<OperatorProduct[]>(() => buildOperatorCatalog());

  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [city, setCity] = useState("");
  const [stadium, setStadium] = useState("");
  const [startLocal, setStartLocal] = useState(() =>
    toLocalDatetimeInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
  );
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus>("SCHEDULED");
  const [errors, setErrors] = useState<FieldErrors<MatchField>>({});
  const [draft, setDraft] = useState<Record<string, { h: number; a: number }>>({});
  const [scoreErrors, setScoreErrors] = useState<Record<string, string>>({});
  const [inconsistencyNote, setInconsistencyNote] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState<StoreProduct["category"]>("Accesorios");
  const [productPrice, setProductPrice] = useState("0");
  const [productStock, setProductStock] = useState("0");
  const [productDescription, setProductDescription] = useState("");
  const [productImage, setProductImage] = useState("");
  const [productTeam, setProductTeam] = useState("");
  const [productFlag, setProductFlag] = useState("");
  const [productSizeLabel, setProductSizeLabel] = useState("Unitalla");
  const [productFeatured, setProductFeatured] = useState(false);
  const [productActive, setProductActive] = useState(true);
  const [productErrors, setProductErrors] = useState<FieldErrors<ProductField>>({});

  const refresh = async () => {
    try {
      const ms = await adminGetMatches();
      setMatches(ms.slice().sort((a, b) => a.startTimeISO.localeCompare(b.startTimeISO)));
    } catch {
      setMsg({ text: "No se pudo cargar la información operativa.", severity: "error" });
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (matches.length === 0) return;
    const current = matches.find((item) => item.id === selectedMatchId) ?? matches[0];
    if (!current) return;
    setSelectedMatchId(current.id);
    setCity(current.city);
    setStadium(current.stadium);
    setStartLocal(toLocalDatetimeInputValue(current.startTimeISO));
    setSelectedStatus(current.status);
  }, [matches, selectedMatchId]);

  const stats = useMemo(() => {
    const live = matches.filter((match) => match.status === "LIVE").length;
    const scheduled = matches.filter((match) => match.status === "SCHEDULED").length;
    const activeProducts = catalog.filter((item) => item.active).length;
    const featuredProducts = catalog.filter((item) => item.highlight || item.promoted).length;

    return [
      { label: "Partidos", value: matches.length },
      { label: "En vivo", value: live },
      { label: "Programados", value: scheduled },
      { label: "Catálogo activo", value: activeProducts },
      { label: "Destacados", value: featuredProducts },
      { label: "Souvenirs", value: catalog.length },
    ];
  }, [catalog, matches]);

  const catalogSorted = useMemo(
    () => catalog.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [catalog]
  );

  const validateMatchForm = () => {
    const nextErrors: FieldErrors<MatchField> = {
      selectedMatchId: validateRequired(selectedMatchId, "El partido"),
      city: validateTextLength(city, "La ciudad", 3, 80),
      stadium: validateTextLength(stadium, "El estadio", 3, 120),
      startLocal:
        selectedStatus === "SCHEDULED"
          ? validateFutureDateTime(startLocal, "La fecha y hora")
          : validateDateTime(startLocal, "La fecha y hora"),
      inconsistencyNote: inconsistencyNote.trim()
        ? validateTextLength(inconsistencyNote, "La nota operativa", 8, 280)
        : "",
    };

    Object.keys(nextErrors).forEach((key) => {
      const typedKey = key as MatchField;
      if (!nextErrors[typedKey]) delete nextErrors[typedKey];
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateProductForm = () => {
    const isShirt = productCategory === "Camisetas";
    const nextErrors: FieldErrors<ProductField> = {
      name: validateTextLength(productName, "El nombre del producto", 4, 90),
      category: validateRequired(productCategory, "La categoría", 3),
      price: validateMoneyAmount(Number(productPrice), "El precio", 1000, 5000000),
      stock: validateIntegerRange(Number(productStock), "El stock", 0, 5000),
      description: validateTextLength(productDescription, "La descripción", 10, 220),
      image: validateImageSource(productImage, "La imagen"),
      sizeLabel: validateTextLength(productSizeLabel, "La talla o presentación", 2, 40),
      team: isShirt ? validateTextLength(productTeam, "La selección", 3, 50) : "",
      flag: isShirt ? validateOptionalEmojiFlag(productFlag, "La bandera") : "",
    };

    Object.keys(nextErrors).forEach((key) => {
      const typedKey = key as ProductField;
      if (!nextErrors[typedKey]) delete nextErrors[typedKey];
    });

    setProductErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetProductForm = () => {
    setEditingId(null);
    setProductName("");
    setProductCategory("Accesorios");
    setProductPrice("0");
    setProductStock("0");
    setProductDescription("");
    setProductImage("");
    setProductTeam("");
    setProductFlag("");
    setProductSizeLabel("Unitalla");
    setProductFeatured(false);
    setProductActive(true);
    setProductErrors({});
  };

  const onUpdateMatch = async () => {
    if (!validateMatchForm()) return;

    try {
      setLoading(true);
      setMsg(null);

      await adminUpdateMatch(selectedMatchId, {
        city: city.trim(),
        stadium: stadium.trim(),
        startTimeISO: fromLocalDatetimeInputToISO(startLocal),
        status: selectedStatus,
      });

      setMsg({ text: "Ajuste operativo del calendario publicado.", severity: "success" });
      await refresh();
    } catch (e) {
      setMsg({ text: (e as Error).message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onPublish = async (match: Match) => {
    const current = draft[match.id] ?? {
      h: match.score?.home ?? 0,
      a: match.score?.away ?? 0,
    };
    const error =
      validateScore(current.h, "El marcador local") ||
      validateScore(current.a, "El marcador visitante");

    if (error) {
      setScoreErrors((prev) => ({ ...prev, [match.id]: error }));
      return;
    }

    try {
      setLoading(true);
      setMsg(null);
      setScoreErrors((prev) => ({ ...prev, [match.id]: "" }));

      await adminPublishResult(match.id, current.h, current.a);
      setMsg({ text: "Resultado publicado correctamente.", severity: "success" });
      await refresh();
    } catch (e) {
      setMsg({ text: (e as Error).message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onStatus = async (matchId: string, status: MatchStatus) => {
    try {
      setLoading(true);
      setMsg(null);
      await adminSetMatchStatus(matchId, status);
      setMsg({ text: `Estado actualizado a ${statusLabels[status]}.`, severity: "success" });
      await refresh();
    } catch (e) {
      setMsg({ text: (e as Error).message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitProduct = () => {
    if (!validateProductForm()) return;

    const payload: OperatorProduct = {
      id: editingId ?? `operator-product-${Date.now()}`,
      sku:
        editingId ??
        productName
          .trim()
          .toUpperCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^A-Z0-9]+/g, "-"),
      name: productName.trim(),
      category: productCategory,
      team: productTeam.trim() || undefined,
      flag: productFlag.trim() || undefined,
      price: Number(productPrice),
      sizeLabel: productSizeLabel.trim(),
      image: productImage.trim(),
      highlight: productFeatured,
      description: productDescription.trim(),
      active: productActive,
      promoted: productFeatured,
      stock: Number(productStock),
    };

    setCatalog((current) => {
      if (!editingId) return [payload, ...current];
      return current.map((item) => (item.id === editingId ? payload : item));
    });

    setMsg({
      text: editingId ? "Producto actualizado correctamente." : "Producto creado correctamente.",
      severity: "success",
    });
    resetProductForm();
  };

  const onProductImageFileChange = (file?: File | null) => {
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setProductErrors((current) => ({
        ...current,
        image: "La imagen debe ser PNG, JPG o WEBP.",
      }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setProductErrors((current) => ({
        ...current,
        image: "La imagen debe pesar menos de 2 MB.",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProductImage(String(reader.result ?? ""));
      setProductErrors((current) => ({
        ...current,
        image: "",
      }));
    };
    reader.readAsDataURL(file);
  };

  const onEditProduct = (product: OperatorProduct) => {
    setEditingId(product.id);
    setProductName(product.name);
    setProductCategory(product.category);
    setProductPrice(String(product.price));
    setProductStock(String(product.stock));
    setProductDescription(product.description);
    setProductImage(product.image);
    setProductTeam(product.team ?? "");
    setProductFlag(product.flag ?? "");
    setProductSizeLabel(product.sizeLabel);
    setProductFeatured(Boolean(product.highlight || product.promoted));
    setProductActive(product.active);
    setProductErrors({});
  };

  const onToggleProduct = (productId: string, key: "active" | "promoted" | "highlight") => {
    setCatalog((current) =>
      current.map((item) =>
        item.id === productId
          ? {
              ...item,
              [key]: !item[key],
              ...(key !== "active" ? { promoted: !item.promoted, highlight: !item.highlight } : {}),
            }
          : item
      )
    );
  };

  const onDeleteProduct = (productId: string) => {
    setCatalog((current) => current.filter((item) => item.id !== productId));
    if (editingId === productId) resetProductForm();
    setMsg({ text: "Producto retirado del catálogo.", severity: "success" });
  };

  return (
    <Stack spacing={2.5}>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3.5 },
          overflow: "hidden",
          position: "relative",
          background:
            `linear-gradient(135deg, rgba(13,91,63,.94), rgba(24,122,78,.82)), url(${bannerImages.operator})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Stack spacing={2} sx={{ maxWidth: 920 }}>
          <Chip label="Operación Mundial 2026" sx={{ alignSelf: "flex-start" }} />
          <Typography variant="h4" sx={{ fontWeight: 950 }}>
            Panel de operador
          </Typography>
          <Typography sx={{ color: "rgba(234,242,255,.84)", maxWidth: 760 }}>
            Supervisa calendario, valida contenido operativo y mantiene el catálogo de souvenirs
            listo para publicarse.
          </Typography>
          {user && (
            <Typography variant="caption" sx={{ color: "rgba(234,242,255,.74)" }}>
              Sesión operativa: {user.name}
            </Typography>
          )}
        </Stack>
      </Paper>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1.5 }}>
        {stats.map((stat) => (
          <Paper key={stat.label} sx={{ p: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 950 }}>
              {stat.value}
            </Typography>
            <Typography color="text.secondary">{stat.label}</Typography>
          </Paper>
        ))}
      </Box>

      {msg && <Alert severity={msg.severity}>{msg.text}</Alert>}

      <Paper sx={{ p: 1 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
          <Tab label="Calendario" />
          <Tab label="Catálogo" />
          <Tab label="Comunicaciones" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Stack spacing={2}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6">Validar y ajustar calendario</Typography>
            <Typography color="text.secondary">
              El operador solo ajusta fecha, hora, ciudad, estadio y estado del evento sobre
              partidos que ya llegaron desde la API.
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(5, 1fr)" },
                gap: 1.5,
                mt: 2,
              }}
            >
              <TextField
                select
                label="Partido"
                value={selectedMatchId}
                onChange={(event) => setSelectedMatchId(event.target.value)}
                error={Boolean(errors.selectedMatchId)}
                helperText={errors.selectedMatchId || "La API define equipos y estructura"}
              >
                {matches.map((match) => (
                  <MenuItem key={match.id} value={match.id}>
                    {formatTeam(match.home)} vs {formatTeam(match.away)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Ciudad"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                error={Boolean(errors.city)}
                helperText={errors.city || "Ciudad sede"}
                disabled={loading}
              />
              <TextField
                label="Estadio"
                value={stadium}
                onChange={(event) => setStadium(event.target.value)}
                error={Boolean(errors.stadium)}
                helperText={errors.stadium || "Nombre oficial"}
                disabled={loading}
              />
              <TextField
                label="Fecha y hora"
                type="datetime-local"
                value={startLocal}
                onChange={(event) => setStartLocal(event.target.value)}
                error={Boolean(errors.startLocal)}
                helperText={errors.startLocal || "Debe ser futura"}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                select
                label="Estado"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value as MatchStatus)}
                helperText="Visible para usuarios al publicar"
                disabled={loading}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <TextField
              label="Reporte de inconsistencia"
              value={inconsistencyNote}
              onChange={(event) => setInconsistencyNote(event.target.value)}
              helperText="Opcional. Sirve para dejar contexto del ajuste realizado."
              multiline
              minRows={2}
              fullWidth
              sx={{ mt: 1.5 }}
            />

            <Button variant="contained" onClick={onUpdateMatch} disabled={loading} sx={{ mt: 2 }}>
              Publicar ajuste
            </Button>
          </Paper>

          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6">Partidos y validación de resultados</Typography>
            {matches.length === 0 ? (
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Todavía no hay partidos cargados.
              </Typography>
            ) : (
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {matches.map((match) => {
                  const current = draft[match.id] ?? {
                    h: match.score?.home ?? 0,
                    a: match.score?.away ?? 0,
                  };
                  const canPublish = match.status === "FINISHED" || match.status === "PENDING_DATA";

                  return (
                    <Paper key={match.id} variant="outlined" sx={{ p: 2 }}>
                      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                            <Typography sx={{ fontWeight: 900 }}>
                              {formatTeam(match.home)} vs {formatTeam(match.away)}
                            </Typography>
                            <Chip
                              size="small"
                              color={statusColors[match.status]}
                              label={statusLabels[match.status]}
                            />
                          </Stack>
                          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                            {new Date(match.startTimeISO).toLocaleString()} · {match.city} · {match.stadium}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <Button
                              key={value}
                              size="small"
                              variant={match.status === value ? "contained" : "outlined"}
                              onClick={() => onStatus(match.id, value as MatchStatus)}
                              disabled={loading}
                            >
                              {label}
                            </Button>
                          ))}
                        </Stack>
                      </Stack>

                      <Divider sx={{ my: 2 }} />

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "flex-start" }}>
                        <TextField
                          label="Goles local"
                          type="number"
                          size="small"
                          value={current.h}
                          inputProps={{ min: 0, max: 20 }}
                          onChange={(event) =>
                            setDraft((prev) => ({
                              ...prev,
                              [match.id]: { h: Number(event.target.value), a: current.a },
                            }))
                          }
                          disabled={loading}
                        />
                        <TextField
                          label="Goles visitante"
                          type="number"
                          size="small"
                          value={current.a}
                          inputProps={{ min: 0, max: 20 }}
                          onChange={(event) =>
                            setDraft((prev) => ({
                              ...prev,
                              [match.id]: { h: current.h, a: Number(event.target.value) },
                            }))
                          }
                          disabled={loading}
                        />
                        <Button
                          variant="contained"
                          disabled={!canPublish || loading}
                          onClick={() => onPublish(match)}
                        >
                          Publicar resultado
                        </Button>
                      </Stack>
                      <Typography
                        variant="caption"
                        color={scoreErrors[match.id] ? "error" : "text.secondary"}
                        sx={{ mt: 1, display: "block" }}
                      >
                        {scoreErrors[match.id] ||
                          "Publica cuando el partido esté finalizado o marcado como pendiente de datos."}
                      </Typography>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Stack>
      )}

      {tab === 1 && (
        <Stack spacing={2}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6">{editingId ? "Editar producto" : "Crear producto"}</Typography>
            <Typography color="text.secondary">
              Gestiona nombre, precio, categoría, foto, stock y estado de publicación.
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 1.5,
                mt: 2,
              }}
            >
              <TextField
                label="Nombre"
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
                error={Boolean(productErrors.name)}
                helperText={productErrors.name || "Ejemplo: Camiseta local Colombia"}
              />
              <TextField
                select
                label="Categoría"
                value={productCategory}
                onChange={(event) => setProductCategory(event.target.value as StoreProduct["category"])}
                error={Boolean(productErrors.category)}
                helperText={productErrors.category || "Clasifica el producto"}
              >
                {["Destacados", "Camisetas", "Accesorios", "Coleccionables"].map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Talla o presentación"
                value={productSizeLabel}
                onChange={(event) => setProductSizeLabel(event.target.value)}
                error={Boolean(productErrors.sizeLabel)}
                helperText={productErrors.sizeLabel || "Ejemplo: Unitalla o 750 ml"}
              />
              <TextField
                label="Precio"
                type="number"
                value={productPrice}
                onChange={(event) => setProductPrice(event.target.value)}
                error={Boolean(productErrors.price)}
                helperText={productErrors.price || "En pesos colombianos"}
              />
              <TextField
                label="Stock"
                type="number"
                value={productStock}
                onChange={(event) => setProductStock(event.target.value)}
                error={Boolean(productErrors.stock)}
                helperText={productErrors.stock || "Cantidad disponible"}
              />
              <TextField
                label="Bandera"
                value={productFlag}
                onChange={(event) => setProductFlag(event.target.value)}
                error={Boolean(productErrors.flag)}
                helperText={productErrors.flag || (productCategory === "Camisetas" ? "Opcional" : "Opcional")}
              />
              <TextField
                label="Selección"
                value={productTeam}
                onChange={(event) => setProductTeam(event.target.value)}
                error={Boolean(productErrors.team)}
                helperText={productErrors.team || (productCategory === "Camisetas" ? "Recomendado para camisetas" : "Opcional")}
              />
              <TextField
                label="Imagen"
                value={productImage}
                onChange={(event) => setProductImage(event.target.value)}
                error={Boolean(productErrors.image)}
                helperText={productErrors.image || "Puedes pegar una URL o subir un archivo."}
              />
              <Box />
            </Box>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 1 }}>
              <input
                ref={productImageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={(event) => onProductImageFileChange(event.target.files?.[0])}
              />
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => productImageInputRef.current?.click()}
              >
                Subir archivo
              </Button>
              {productImage && (
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => {
                    setProductImage("");
                    if (productImageInputRef.current) productImageInputRef.current.value = "";
                  }}
                >
                  Quitar imagen
                </Button>
              )}
            </Stack>

            {productImage && (
              <Paper
                variant="outlined"
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: 96,
                    height: 96,
                    borderRadius: 1,
                    backgroundImage: `url(${productImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    flexShrink: 0,
                  }}
                />
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>Vista previa de imagen</Typography>
                  <Typography color="text.secondary">
                    El operador puede usar enlace o archivo subido para el mockup del producto.
                  </Typography>
                </Box>
              </Paper>
            )}

            <TextField
              label="Descripción"
              value={productDescription}
              onChange={(event) => setProductDescription(event.target.value)}
              error={Boolean(productErrors.description)}
              helperText={productErrors.description || "Describe el producto para su publicación"}
              multiline
              minRows={3}
              fullWidth
              sx={{ mt: 1.5 }}
            />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch checked={productActive} onChange={(event) => setProductActive(event.target.checked)} />
                }
                label="Producto activo"
              />
              <FormControlLabel
                control={
                  <Switch checked={productFeatured} onChange={(event) => setProductFeatured(event.target.checked)} />
                }
                label="Destacado o promoción"
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={onSubmitProduct}>
                {editingId ? "Guardar cambios" : "Crear producto"}
              </Button>
              <Button variant="outlined" color="inherit" onClick={resetProductForm}>
                Limpiar formulario
              </Button>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6">Catálogo de souvenirs</Typography>
            <Typography color="text.secondary">
              Activa, desactiva o destaca productos antes de mostrarlos al usuario.
            </Typography>

            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {catalogSorted.map((product) => (
                <Paper key={product.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                    <Box>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                        <Typography sx={{ fontWeight: 900 }}>{product.name}</Typography>
                        <Chip label={product.category} size="small" />
                        <Chip
                          label={product.active ? "Activo" : "Inactivo"}
                          size="small"
                          color={product.active ? "success" : "default"}
                        />
                        {(product.highlight || product.promoted) && (
                          <Chip label="Destacado" size="small" color="warning" />
                        )}
                      </Stack>
                      <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                        ${product.price.toLocaleString()} COP · Stock {product.stock} · {product.sizeLabel}
                      </Typography>
                      <Typography color="text.secondary">{product.description}</Typography>
                    </Box>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <Button variant="outlined" onClick={() => onEditProduct(product)}>
                        Editar
                      </Button>
                      <Button variant="outlined" onClick={() => onToggleProduct(product.id, "active")}>
                        {product.active ? "Desactivar" : "Activar"}
                      </Button>
                      <Button variant="outlined" onClick={() => onToggleProduct(product.id, "highlight")}>
                        {(product.highlight || product.promoted) ? "Quitar destacado" : "Destacar"}
                      </Button>
                      <Button color="error" variant="outlined" onClick={() => onDeleteProduct(product.id)}>
                        Eliminar
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Stack>
      )}

      {tab === 2 && (
        <Stack spacing={2}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6">Publicación y comunicación</Typography>
            <Typography color="text.secondary">
              Desde aquí coordinas avisos sobre calendario, contenidos y novedades de la tienda.
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
              <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
                <Typography sx={{ fontWeight: 900 }}>Notificaciones a usuarios</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                  Envía avisos masivos o segmentados desde el módulo de notificaciones.
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate("/notifications")}>
                  Abrir notificaciones
                </Button>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
                <Typography sx={{ fontWeight: 900 }}>Control operativo</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                  Revisa inconsistencias de calendario, stock básico y productos destacados antes de publicar.
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
                  <Chip label={`${matches.filter((item) => item.status === "PENDING_DATA").length} partidos por validar`} />
                  <Chip label={`${catalog.filter((item) => item.stock < 5).length} productos con stock bajo`} />
                </Stack>
              </Paper>
            </Stack>
          </Paper>
        </Stack>
      )}
    </Stack>
  );
}
