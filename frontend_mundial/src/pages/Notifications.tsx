import { useEffect, useState } from "react";
import { Alert, Button, Paper, Stack, TextField, Typography } from "@mui/material";

import {
  createNotification,
  deleteNotification,
  getNotifications,
  markNotificationRead,
} from "../api/notificationApi";
import { useApp } from "../context/AppContext";
import type { NotificationItem } from "../types/notification";
import { validateRequired, type FieldErrors } from "../utils/validation";

type NotificationField = "title" | "body";
type Msg = { text: string; severity: "success" | "error" } | null;

export default function Notifications() {
  const { user } = useApp();
  const isAdmin = user?.role === "admin";
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<FieldErrors<NotificationField>>({});
  const [msg, setMsg] = useState<Msg>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    try {
      setItems(await getNotifications());
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error cargando notificaciones.";
      setMsg({ text: message, severity: "error" });
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const validateForm = () => {
    const nextErrors: FieldErrors<NotificationField> = {
      title: validateRequired(title, "El título", 5),
      body: validateRequired(body, "El mensaje", 10),
    };

    Object.keys(nextErrors).forEach((key) => {
      const typedKey = key as NotificationField;
      if (!nextErrors[typedKey]) delete nextErrors[typedKey];
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onCreate = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await createNotification(title.trim(), body.trim());
      setTitle("");
      setBody("");
      setMsg({ text: "Notificación enviada correctamente.", severity: "success" });
      await refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error creando notificación.";
      setMsg({ text: message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      await refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo marcar como leída.";
      setMsg({ text: message, severity: "error" });
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setMsg({ text: "Notificación eliminada.", severity: "success" });
      await refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo eliminar la notificación.";
      setMsg({ text: message, severity: "error" });
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Notificaciones</Typography>

      <Alert severity="info">
        Consulta alertas y registra evidencia de comunicaciones enviadas a los usuarios.
      </Alert>

      {msg && <Alert severity={msg.severity}>{msg.text}</Alert>}

      {isAdmin && (
        <Paper sx={{ p: 2.5 }}>
          <Typography variant="h6">Crear comunicación</Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Título"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              error={Boolean(errors.title)}
              helperText={errors.title}
              disabled={loading}
              fullWidth
            />
            <TextField
              label="Mensaje"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              error={Boolean(errors.body)}
              helperText={errors.body}
              disabled={loading}
              multiline
              minRows={3}
              fullWidth
            />
            <Button variant="contained" onClick={onCreate} disabled={loading}>
              Enviar notificación
            </Button>
          </Stack>
        </Paper>
      )}

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h6">Bandeja</Typography>

        {items.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            No hay notificaciones todavía.
          </Typography>
        ) : (
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {items.map((item) => (
              <Paper key={item.id} variant="outlined" sx={{ p: 2, opacity: item.read ? 0.72 : 1 }}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5}>
                  <Stack spacing={0.5}>
                    <Typography sx={{ fontWeight: 800 }}>{item.title}</Typography>
                    <Typography>{item.body}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(item.createdAt).toLocaleString()} ·{" "}
                      {item.read ? "Leída" : "No leída"}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    {!item.read && (
                      <Button variant="outlined" onClick={() => onMarkRead(item.id)}>
                        Marcar leída
                      </Button>
                    )}
                    {isAdmin && (
                      <Button color="error" variant="outlined" onClick={() => onDelete(item.id)}>
                        Borrar
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
