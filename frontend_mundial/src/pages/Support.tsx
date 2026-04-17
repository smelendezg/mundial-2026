import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  createSupportRequest,
  getMySupportRequests,
  getSupportRequests,
  updateSupportStatus,
} from "../api/supportApi";
import { useApp } from "../context/AppContext";
import type { SupportCategory, SupportRequest, SupportStatus } from "../types/support";
import { validateRequired, type FieldErrors } from "../utils/validation";
import { bannerImages } from "../theme/bannerImages";

type SupportField = "title" | "description";
type Msg = { text: string; severity: "success" | "error" | "info" } | null;

const categoryLabels: Record<SupportCategory, string> = {
  TICKET: "Entradas",
  NOTIFICATION: "Notificaciones",
  PAYMENT: "Pagos",
  TRANSFER: "Transferencias",
  OTHER: "General",
};

const statusLabels: Record<SupportStatus, string> = {
  OPEN: "Abierta",
  IN_REVIEW: "En revisión",
  CLOSED: "Cerrada",
};

const statusColors: Record<SupportStatus, "success" | "warning" | "default"> = {
  OPEN: "success",
  IN_REVIEW: "warning",
  CLOSED: "default",
};

export default function Support() {
  const { user } = useApp();
  const [items, setItems] = useState<SupportRequest[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<SupportCategory>("TICKET");
  const [description, setDescription] = useState("");
  const [statusFilter, setStatusFilter] = useState<SupportStatus | "ALL">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<SupportCategory | "ALL">("ALL");
  const [errors, setErrors] = useState<FieldErrors<SupportField>>({});
  const [msg, setMsg] = useState<Msg>(null);
  const [loading, setLoading] = useState(false);

  const isStaff = user?.role === "support";

  const fullName = useMemo(() => {
    if (!user) return "";
    return [user.name, user.lastName].filter(Boolean).join(" ");
  }, [user]);

  const refresh = useCallback(async () => {
    if (!user) return;
    const nextItems = isStaff ? await getSupportRequests() : await getMySupportRequests(user.id);
    setItems(nextItems);
  }, [isStaff, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const summary = useMemo(() => {
    const count = (status: SupportStatus) =>
      items.filter((item) => item.status === status).length;

    return [
      { label: "Abiertas", value: count("OPEN") },
      { label: "En revisión", value: count("IN_REVIEW") },
      { label: "Cerradas", value: count("CLOSED") },
      { label: "Total", value: items.length },
    ];
  }, [items]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const statusOk = statusFilter === "ALL" || item.status === statusFilter;
        const categoryOk = categoryFilter === "ALL" || item.category === categoryFilter;
        return statusOk && categoryOk;
      }),
    [items, statusFilter, categoryFilter]
  );

  if (!user) return <Alert severity="warning">Debes iniciar sesión.</Alert>;

  const validateForm = () => {
    const nextErrors: FieldErrors<SupportField> = {
      title: validateRequired(title, "El asunto", 6),
      description: validateRequired(description, "La descripción", 20),
    };

    Object.keys(nextErrors).forEach((key) => {
      const typedKey = key as SupportField;
      if (!nextErrors[typedKey]) delete nextErrors[typedKey];
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onCreate = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setMsg(null);

      await createSupportRequest(user.id, fullName || user.name, title, category, description);
      setTitle("");
      setDescription("");
      setCategory("TICKET");
      setMsg({ text: "Solicitud creada correctamente.", severity: "success" });
      await refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo crear la solicitud.";
      setMsg({ text: message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onStatusChange = async (requestId: string, status: SupportStatus) => {
    try {
      setLoading(true);
      setMsg(null);

      await updateSupportStatus(user.id, fullName || user.name, requestId, status);
      setMsg({ text: `Solicitud marcada como ${statusLabels[status].toLowerCase()}.`, severity: "success" });
      await refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo actualizar la solicitud.";
      setMsg({ text: message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3.5 },
          background:
            `linear-gradient(135deg, rgba(12,73,54,.95), rgba(31,137,88,.80)), url(${bannerImages.support})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Stack spacing={1.5} sx={{ maxWidth: 840 }}>
          <Chip
            label={isStaff ? "Mesa de soporte" : "Centro de ayuda"}
            sx={{ alignSelf: "flex-start" }}
          />
          <Typography variant="h4" sx={{ fontWeight: 950 }}>
            {isStaff ? "Soporte operativo" : "Soporte y trazabilidad"}
          </Typography>
          <Typography sx={{ color: "rgba(234,242,255,.84)" }}>
            {isStaff
              ? "Revisa solicitudes, filtra por estado y actualiza el ciclo de atención con eventos auditables."
              : "Reporta problemas con entradas, pagos, notificaciones o transferencias. El equipo podrá ver el historial completo."}
          </Typography>
        </Stack>
      </Paper>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1.5 }}>
        {summary.map((item) => (
          <Paper key={item.label} sx={{ p: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 950 }}>
              {item.value}
            </Typography>
            <Typography color="text.secondary">{item.label}</Typography>
          </Paper>
        ))}
      </Box>

      {msg && <Alert severity={msg.severity}>{msg.text}</Alert>}

      {!isStaff && (
        <Paper sx={{ p: 2.5 }}>
          <Typography variant="h6">Nueva solicitud</Typography>
          <Typography color="text.secondary">
            Cuéntanos qué ocurrió con suficiente detalle para poder reproducirlo.
          </Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Asunto"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              error={Boolean(errors.title)}
              helperText={errors.title || "Ejemplo: No aparece mi reserva de entrada."}
              disabled={loading}
              fullWidth
            />
            <TextField
              select
              label="Categoría"
              value={category}
              onChange={(event) => setCategory(event.target.value as SupportCategory)}
              disabled={loading}
              fullWidth
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Descripción"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              error={Boolean(errors.description)}
              helperText={errors.description || "Incluye fecha, pantalla y qué esperabas que pasara."}
              disabled={loading}
              minRows={4}
              multiline
              fullWidth
            />
            <Button variant="contained" onClick={onCreate} disabled={loading}>
              Crear solicitud
            </Button>
          </Stack>
        </Paper>
      )}

      <Paper sx={{ p: 2.5 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
          <Box>
            <Typography variant="h6">
              {isStaff ? "Bandeja de solicitudes" : "Mis solicitudes"}
            </Typography>
            <Typography color="text.secondary">
              {isStaff
                ? "Prioriza casos abiertos y deja cada cambio listo para auditoría."
                : "Consulta el estado de tus casos y el último cambio registrado."}
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              select
              label="Estado"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as SupportStatus | "ALL")}
              sx={{ minWidth: 170 }}
            >
              <MenuItem value="ALL">Todos</MenuItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Categoría"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as SupportCategory | "ALL")}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="ALL">Todas</MenuItem>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>

        {filteredItems.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            No hay solicitudes para estos filtros.
          </Typography>
        ) : (
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {filteredItems.map((item) => (
              <Paper key={item.id} variant="outlined" sx={{ p: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                  <Stack spacing={0.85} sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                      <Typography sx={{ fontWeight: 900 }}>{item.title}</Typography>
                      <Chip label={categoryLabels[item.category]} size="small" />
                      <Chip
                        label={statusLabels[item.status]}
                        size="small"
                        color={statusColors[item.status]}
                        variant={item.status === "CLOSED" ? "outlined" : "filled"}
                      />
                    </Stack>
                    <Typography color="text.secondary">{item.description}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Caso {item.id} · Usuario {item.userId} · Creada{" "}
                      {new Date(item.createdAt).toLocaleString()} · Actualizada{" "}
                      {new Date(item.updatedAt).toLocaleString()}
                    </Typography>
                  </Stack>

                  <TextField
                    select
                    label={isStaff ? "Atención" : "Estado"}
                    value={item.status}
                    onChange={(event) =>
                      onStatusChange(item.id, event.target.value as SupportStatus)
                    }
                    disabled={loading || (!isStaff && item.status === "CLOSED")}
                    sx={{ minWidth: 180 }}
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
