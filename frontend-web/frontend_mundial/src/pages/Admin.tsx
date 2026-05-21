import { useEffect, useMemo, useState } from "react";
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

import { http } from "../api/http";
import type { Match, MatchStatus } from "../types/match";
import type { Pool } from "../types/pool";
import type { SystemEvent, SystemEventType } from "../types/systemEvent";
import { getPools } from "../api/poolsApi";
import { getSystemEvents } from "../api/eventsApi";
import { useApp } from "../context/AppContext";
import { formatTeam } from "../utils/countries";
import { validateRequired, type FieldErrors } from "../utils/validation";
import { bannerImages } from "../theme/bannerImages";

type Msg = { text: string; severity: "success" | "error" | "info" } | null;
type MatchField = "homeName" | "awayName" | "city" | "stadium" | "startLocal";
import {
  adminCreateMatch,
  adminGetMatches,
  adminPublishResult,
  adminSetMatchStatus,
  adminGetUsuarios,
  adminRegistrarUsuario,
  adminEliminarUsuario,
  adminGetCategorias,
  adminCrearCategoria,
  adminActualizarCategoria,
  adminEliminarCategoria,
  adminGetProductos,
  adminCrearProducto,
  adminActualizarProducto,
  adminEliminarProducto,
  adminReactivarProducto,
  adminGetPartidos,
  adminGetPartidosPorFecha,
  adminGetCapacidadPartidos,
  adminSincronizarPartidos,
  adminGetApuestas,
adminCerrarApuesta,
adminEliminarApuesta,
adminForzarPuntos,
adminEnviarMasiva,
adminNotificarPorPartido,
} from "../api/adminApi";
import type { UsuarioSistema, Categoria, Producto, PartidoCapacidad, Apuesta } from "../api/adminApi";
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

const eventLabels: Record<SystemEventType, string> = {
  AUTH_LOGIN: "Inicio de sesión",
  AUTH_LOGOUT: "Cierre de sesión",
  USER_REGISTERED: "Registro",
  PROFILE_UPDATED: "Perfil actualizado",
  MATCH_CREATED: "Partido creado",
  MATCH_STATUS_CHANGED: "Estado de partido",
  MATCH_RESULT_PUBLISHED: "Resultado publicado",
  TICKET_RESERVED: "Entrada reservada",
  TICKET_CANCELLED: "Entrada cancelada",
  PAYMENT_CREATED: "Pago creado",
  PAYMENT_CONFIRMED: "Pago confirmado",
  PAYMENT_FAILED: "Pago fallido",
  PAYMENT_REFUNDED: "Pago reembolsado",
  SUPPORT_REQUEST_CREATED: "Soporte creado",
  SUPPORT_REQUEST_UPDATED: "Soporte actualizado",
};

function toLocalDatetimeInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalDatetimeInputToISO(localValue: string) {
  return new Date(localValue).toISOString();
}

function makeTeamCode(name: string) {
 return name.trim().normalize("NFD").replaceAll(/[\u0300-\u036f]/g, "").replaceAll(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
}

function validateScore(value: number, label: string) {
  if (!Number.isInteger(value)) return `${label} debe ser un número entero.`;
  if (value < 0) return `${label} no puede ser negativo.`;
  if (value > 20) return `${label} no puede ser mayor que 20.`;
  return "";
}

export default function Admin() {
  const { user } = useApp();

  const [tab, setTab] = useState(0);
  const [msg, setMsg] = useState<Msg>(null);
  const [loading, setLoading] = useState(false);

  const [matches, setMatches] = useState<Match[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [events, setEvents] = useState<SystemEvent[]>([]);

  const [homeName, setHomeName] = useState("");
  const [awayName, setAwayName] = useState("");
  const [city, setCity] = useState("");
  const [stadium, setStadium] = useState("");
  const [startLocal, setStartLocal] = useState(() =>
    toLocalDatetimeInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
  );
  const [assignToAllPools, setAssignToAllPools] = useState(true);
  const [errors, setErrors] = useState<FieldErrors<MatchField>>({});
  const [eventFilter, setEventFilter] = useState<SystemEventType | "ALL">("ALL");
  const [draft, setDraft] = useState<Record<string, { h: number; a: number }>>({});
  const [scoreErrors, setScoreErrors] = useState<Record<string, string>>({});
const [partidos, setPartidos] = useState<Match[]>([]);
const [capacidades, setCapacidades] = useState<PartidoCapacidad[]>([]);
const [fechaFiltro, setFechaFiltro] = useState("");
const [sincLiga, setSincLiga] = useState("1");
const [sincTemporada, setSincTemporada] = useState("2026");
const [sincFecha, setSincFecha] = useState("");
const [apuestas, setApuestas] = useState<Apuesta[]>([]);
  const [miembrosApuesta, setMiembrosApuesta] = useState<Record<number, { usuarioId: number; nombre: string; puntos: number }[]>>({});
const [loadingMiembros, setLoadingMiembros] = useState<Record<number, boolean>>({});
const [notiModo, setNotiModo] = useState<"todos" | "partido" | "usuarios">("todos");
const [notiTipo, setNotiTipo] = useState("INFO");
const [notiTitulo, setNotiTitulo] = useState("");
const [notiMensaje, setNotiMensaje] = useState("");
const [notiCanal, setNotiCanal] = useState("SISTEMA");
const [notiPartidoId, setNotiPartidoId] = useState("");
const [notiUsuarioIds, setNotiUsuarioIds] = useState("");
const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoApellido, setNuevoApellido] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [nuevoRol, setNuevoRol] = useState("ROLE_ADMIN");
const [categorias, setCategorias] = useState<Categoria[]>([]);
const [nuevaCategoriaNombre, setNuevaCategoriaNombre] = useState("");
const [nuevaCategoriaDesc, setNuevaCategoriaDesc] = useState("");
const [editCategoria, setEditCategoria] = useState<Categoria | null>(null);
const [editCategoriaNombre, setEditCategoriaNombre] = useState("");
const [editCategoriaDesc, setEditCategoriaDesc] = useState("");

const [productos, setProductos] = useState<Producto[]>([]);
const [prodNombre, setProdNombre] = useState("");
const [prodDesc, setProdDesc] = useState("");
const [prodPrecio, setProdPrecio] = useState("");
const [prodStock, setProdStock] = useState("");
const [prodImagenUrl, setProdImagenUrl] = useState("");
const [prodCategoriaId, setProdCategoriaId] = useState("");
const [editProducto, setEditProducto] = useState<Producto | null>(null);
const [editProdPrecio, setEditProdPrecio] = useState("");
const [editProdStock, setEditProdStock] = useState("");
const [editProdDesc, setEditProdDesc] = useState("");
const [editProdImagenUrl, setEditProdImagenUrl] = useState("");

 const refresh = async () => {
  try {
    const [ms, evs, us, cats, prods, parts, caps, apuestas] = await Promise.all([
  adminGetMatches().catch(() => [] as Match[]),
  getSystemEvents().catch(() => [] as SystemEvent[]),
  adminGetUsuarios().catch(() => [] as UsuarioSistema[]),
  adminGetCategorias().catch(() => [] as Categoria[]),
  adminGetProductos().catch(() => [] as Producto[]),
  adminGetPartidos().catch(() => [] as Match[]),
  adminGetCapacidadPartidos().catch(() => [] as PartidoCapacidad[]),
  adminGetApuestas().catch(() => [] as Apuesta[]),
]);
setCategorias(cats);
setProductos(prods);
setPartidos(parts);
setCapacidades(caps);
setApuestas(apuestas);
   const ps = await getPools(0).catch(() => [] as Pool[]);
    setMatches(ms.slice().sort((a, b) => a.startTimeISO.localeCompare(b.startTimeISO)));
    setPools(ps);
    setEvents(evs);
    setUsuarios(us);
  } catch {
    setMsg({ text: "No se pudo cargar la información del panel.", severity: "error" });
  }
};
  useEffect(() => {
    void refresh();
  }, []);

  const stats = useMemo(() => {
    const live = matches.filter((m) => m.status === "LIVE").length;
    const scheduled = matches.filter((m) => m.status === "SCHEDULED").length;
    const pending = matches.filter((m) => m.status === "PENDING_DATA").length;
    const members = pools.reduce((sum, pool) => sum + pool.members.length, 0);
    return [
      { label: "Partidos", value: matches.length },
      { label: "En vivo", value: live },
      { label: "Programados", value: scheduled },
      { label: "Por revisar", value: pending },
   { label: "Pollas", value: apuestas.length },
{ label: "Participantes", value: members },
    ];
  }, [matches, pools]);

  
  const eventsFiltered = useMemo(() => {
    if (eventFilter === "ALL") return events;
    return events.filter((e) => e.type === eventFilter);
  }, [events, eventFilter]);

  const eventTypes = useMemo(() => Array.from(new Set(events.map((e) => e.type))).sort((a, b) => a.localeCompare(b)), [events]);

  const validateMatchForm = () => {
    const nextErrors: FieldErrors<MatchField> = {
      homeName: validateRequired(homeName, "El equipo local", 2),
      awayName: validateRequired(awayName, "El equipo visitante", 2),
      city: validateRequired(city, "La ciudad", 3),
      stadium: validateRequired(stadium, "El estadio", 3),
      startLocal: validateRequired(startLocal, "La fecha y hora"),
    };
    if (homeName.trim() && awayName.trim() && homeName.trim() === awayName.trim()) {
      nextErrors.awayName = "El visitante debe ser diferente al local.";
    }
    if (startLocal && new Date(startLocal).getTime() <= Date.now()) {
      nextErrors.startLocal = "La fecha debe ser futura para crear el partido.";
    }
    Object.keys(nextErrors).forEach((key) => {
      const k = key as MatchField;
      if (!nextErrors[k]) delete nextErrors[k];
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onCreateMatch = async () => {
    if (!validateMatchForm()) return;
    try {
      setLoading(true);
      setMsg(null);
      const cleanHome = homeName.trim();
      const cleanAway = awayName.trim();
      await adminCreateMatch({
        home: { id: `team_${Date.now()}_home`, name: cleanHome, code: makeTeamCode(cleanHome) },
        away: { id: `team_${Date.now()}_away`, name: cleanAway, code: makeTeamCode(cleanAway) },
        city: city.trim(),
        stadium: stadium.trim(),
        startTimeISO: fromLocalDatetimeInputToISO(startLocal),
        status: "SCHEDULED",
        assignToAllPools,
      });
      setHomeName(""); setAwayName(""); setCity(""); setStadium("");
      setStartLocal(toLocalDatetimeInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()));
      setMsg({ text: "Partido creado y disponible para las pollas.", severity: "success" });
      await refresh();
    } catch (e) {
      setMsg({ text: (e as Error).message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onPublish = async (match: Match) => {
    const current = draft[match.id] ?? { h: match.score?.home ?? 0, a: match.score?.away ?? 0 };
    const error = validateScore(current.h, "El marcador local") || validateScore(current.a, "El marcador visitante");
    if (error) { setScoreErrors((prev) => ({ ...prev, [match.id]: error })); return; }
    try {
      setLoading(true); setMsg(null);
      setScoreErrors((prev) => ({ ...prev, [match.id]: "" }));
      await adminPublishResult(match.id, current.h, current.a);
      setMsg({ text: "Resultado publicado y rankings recalculados.", severity: "success" });
      await refresh();
    } catch (e) {
      setMsg({ text: (e as Error).message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onStatus = async (matchId: string, status: MatchStatus) => {
    try {
      setLoading(true); setMsg(null);
      await adminSetMatchStatus(matchId, status);
      setMsg({ text: `Estado cambiado a ${statusLabels[status]}.`, severity: "success" });
      await refresh();
    } catch (e) {
      setMsg({ text: (e as Error).message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onRegistrarUsuario = async () => {
    if (!nuevoCorreo || !nuevoNombre || !nuevoApellido || !nuevaContrasena) {
      setMsg({ text: "Todos los campos son obligatorios.", severity: "error" });
      return;
    }
    try {
      setLoading(true); setMsg(null);
      await adminRegistrarUsuario({
        correoUsuario: nuevoCorreo,
        contrasena: nuevaContrasena,
        nombre: nuevoNombre,
        apellido: nuevoApellido,
        rol: nuevoRol,
      });
      setNuevoCorreo(""); setNuevoNombre(""); setNuevoApellido("");
      setNuevaContrasena(""); setNuevoRol("ROLE_ADMIN");
      setMsg({ text: "Usuario registrado correctamente.", severity: "success" });
      await refresh();
    } catch (e) {
      setMsg({ text: (e as Error).message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onEliminarUsuario = async (u: UsuarioSistema) => {
    try {
      setLoading(true); setMsg(null);
      await adminEliminarUsuario(u.id);
      setMsg({ text: `Usuario ${u.nombre} desactivado.`, severity: "success" });
      await refresh();
    } catch (e) {
      setMsg({ text: (e as Error).message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };
const onCrearCategoria = async () => {
  if (!nuevaCategoriaNombre) { setMsg({ text: "El nombre es obligatorio.", severity: "error" }); return; }
  try {
    setLoading(true); setMsg(null);
    await adminCrearCategoria({ nombre: nuevaCategoriaNombre, descripcion: nuevaCategoriaDesc });
    setNuevaCategoriaNombre(""); setNuevaCategoriaDesc("");
    setMsg({ text: "Categoría creada.", severity: "success" });
    await refresh();
  } catch (e) { setMsg({ text: (e as Error).message, severity: "error" }); }
  finally { setLoading(false); }
};

const onActualizarCategoria = async () => {
  if (!editCategoria || !editCategoriaNombre) return;
  try {
    setLoading(true); setMsg(null);
    await adminActualizarCategoria(editCategoria.id, { nombre: editCategoriaNombre, descripcion: editCategoriaDesc });
    setEditCategoria(null); setEditCategoriaNombre(""); setEditCategoriaDesc("");
    setMsg({ text: "Categoría actualizada.", severity: "success" });
    await refresh();
  } catch (e) { setMsg({ text: (e as Error).message, severity: "error" }); }
  finally { setLoading(false); }
};

const onEliminarCategoria = async (c: Categoria) => {
  try {
    setLoading(true); setMsg(null);
    await adminEliminarCategoria(c.id);
    setMsg({ text: `Categoría ${c.nombre} eliminada y productos desactivados.`, severity: "success" });
    await refresh();
  } catch (e) { setMsg({ text: (e as Error).message, severity: "error" }); }
  finally { setLoading(false); }
};

const onCrearProducto = async () => {
  if (!prodNombre || !prodPrecio || !prodStock || !prodCategoriaId) {
    setMsg({ text: "Nombre, precio, stock y categoría son obligatorios.", severity: "error" }); return;
  }
  try {
    setLoading(true); setMsg(null);
    await adminCrearProducto({ nombre: prodNombre, descripcion: prodDesc, precio: Number(prodPrecio), stock: Number(prodStock), imagenUrl: prodImagenUrl, categoriaId: Number(prodCategoriaId) });
    setProdNombre(""); setProdDesc(""); setProdPrecio(""); setProdStock(""); setProdImagenUrl(""); setProdCategoriaId("");
    setMsg({ text: "Producto creado.", severity: "success" });
    await refresh();
  } catch (e) { setMsg({ text: (e as Error).message, severity: "error" }); }
  finally { setLoading(false); }
};

const onActualizarProducto = async () => {
  if (!editProducto) return;
  try {
    setLoading(true); setMsg(null);
    await adminActualizarProducto(editProducto.id, { precio: editProdPrecio ? Number(editProdPrecio) : undefined, stock: editProdStock ? Number(editProdStock) : undefined, descripcion: editProdDesc || undefined, imagenUrl: editProdImagenUrl || undefined });
    setEditProducto(null); setEditProdPrecio(""); setEditProdStock(""); setEditProdDesc(""); setEditProdImagenUrl("");
    setMsg({ text: "Producto actualizado.", severity: "success" });
    await refresh();
  } catch (e) { setMsg({ text: (e as Error).message, severity: "error" }); }
  finally { setLoading(false); }
};

const onEliminarProducto = async (p: Producto) => {
  try {
    setLoading(true); setMsg(null);
    await adminEliminarProducto(p.id);
    setMsg({ text: `Producto ${p.nombre} desactivado.`, severity: "success" });
    await refresh();
  } catch (e) { setMsg({ text: (e as Error).message, severity: "error" }); }
  finally { setLoading(false); }
};

const onReactivarProducto = async (p: Producto) => {
  try {
    setLoading(true); setMsg(null);
    await adminReactivarProducto(p.id);
    setMsg({ text: `Producto ${p.nombre} reactivado.`, severity: "success" });
    await refresh();
  } catch (e) { setMsg({ text: (e as Error).message, severity: "error" }); }
  finally { setLoading(false); }
};
const onSincronizar = async () => {
  if (!sincFecha) { setMsg({ text: "La fecha es obligatoria para sincronizar.", severity: "error" }); return; }
  try {
    setLoading(true); setMsg(null);
    const total = await adminSincronizarPartidos(Number(sincLiga), Number(sincTemporada), sincFecha);
    setMsg({ text: `Sincronización completada. ${total} partidos actualizados.`, severity: "success" });
    await refresh();
  } catch (e) { setMsg({ text: (e as Error).message, severity: "error" }); }
  finally { setLoading(false); }
};

const onFiltrarFecha = async () => {
  if (!fechaFiltro) { setMsg({ text: "Selecciona una fecha para filtrar.", severity: "error" }); return; }
  try {
    setLoading(true); setMsg(null);
    const resultado = await adminGetPartidosPorFecha(fechaFiltro);
    setPartidos(resultado);
  } catch (e) { setMsg({ text: (e as Error).message, severity: "error" }); }
  finally { setLoading(false); }
};
const onCerrarApuesta = async (a: Apuesta) => {
  try {
    setLoading(true); setMsg(null);
    await adminCerrarApuesta(a.id);
    setMsg({ text: `Polla "${a.nombre}" cerrada.`, severity: "success" });
    await refresh();
  } catch (e) { setMsg({ text: (e as Error).message, severity: "error" }); }
  finally { setLoading(false); }
};

const onEliminarApuesta = async (a: Apuesta) => {
  try {
    setLoading(true); setMsg(null);
    await adminEliminarApuesta(a.id);
    setMsg({ text: `Polla "${a.nombre}" eliminada.`, severity: "success" });
    await refresh();
  } catch (e) { setMsg({ text: (e as Error).message, severity: "error" }); }
  finally { setLoading(false); }
};

const onForzarPuntos = async (a: Apuesta) => {
  try {
    setLoading(true); setMsg(null);
    await adminForzarPuntos(a.id);
    setMsg({ text: `Puntos calculados para "${a.nombre}".`, severity: "success" });
    await refresh();
  } catch (e) { setMsg({ text: (e as Error).message, severity: "error" }); }
  finally { setLoading(false); }
};
const onVerMiembros = async (apuestaId: number) => {
  if (miembrosApuesta[apuestaId]) {
    setMiembrosApuesta((prev) => { const next = { ...prev }; delete next[apuestaId]; return next; });
    return;
  }
  try {
    setLoadingMiembros((prev) => ({ ...prev, [apuestaId]: true }));
    const result = await http.get<{ usuarioId: number; puntos: number }[]>(`/api/apuestas/participantes/${apuestaId}`);
    setMiembrosApuesta((prev) => ({ ...prev, [apuestaId]: result.map((r) => ({ usuarioId: r.usuarioId, nombre: `Usuario ${r.usuarioId}`, puntos: r.puntos })) }));
  } catch (e) { setMsg({ text: (e as Error).message, severity: "error" }); }
  finally { setLoadingMiembros((prev) => ({ ...prev, [apuestaId]: false })); }
};
const onEnviarNotificacion = async () => {
  if (!notiTitulo || !notiMensaje) {
    setMsg({ text: "Título y mensaje son obligatorios.", severity: "error" });
    return;
  }
  try {
    setLoading(true); setMsg(null);
    if (notiModo === "todos") {
      await adminEnviarMasiva({ tipo: notiTipo, titulo: notiTitulo, mensaje: notiMensaje, canal: notiCanal });
    } else if (notiModo === "partido") {
      if (!notiPartidoId) { setMsg({ text: "Selecciona un partido.", severity: "error" }); return; }
      await adminNotificarPorPartido(Number(notiPartidoId), { tipo: notiTipo, titulo: notiTitulo, mensaje: notiMensaje, canal: notiCanal });
    } else {
      const ids = notiUsuarioIds.split(",").map((s) => Number(s.trim())).filter(Boolean);
      await adminEnviarMasiva({ tipo: notiTipo, titulo: notiTitulo, mensaje: notiMensaje, canal: notiCanal, usuarioIds: ids });
    }
    setNotiTitulo(""); setNotiMensaje("");
    setMsg({ text: "Notificación enviada correctamente.", severity: "success" });
  } catch (e) { setMsg({ text: (e as Error).message, severity: "error" }); }
  finally { setLoading(false); }
};
  return (
    <Stack spacing={2.5}>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3.5 },
          overflow: "hidden",
          position: "relative",
          background: `linear-gradient(135deg, rgba(13,91,63,.94), rgba(24,122,78,.82)), url(${bannerImages.admin})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Stack spacing={2} sx={{ maxWidth: 920 }}>
          <Chip label="Operación Mundial 2026" sx={{ alignSelf: "flex-start" }} />
          <Typography variant="h4" sx={{ fontWeight: 950 }}>Panel administrativo</Typography>
          <Typography sx={{ color: "rgba(234,242,255,.84)", maxWidth: 760 }}>
            Gestiona partidos, publica marcadores y revisa cómo quedan las pollas después de cada resultado.
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
            <Typography variant="h4" sx={{ fontWeight: 950 }}>{stat.value}</Typography>
            <Typography color="text.secondary">{stat.label}</Typography>
          </Paper>
        ))}
      </Box>

      {msg && <Alert severity={msg.severity}>{msg.text}</Alert>}

      <Paper sx={{ p: 1 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="Calendario" />
          <Tab label="Pollas y ranking" />
          <Tab label="Auditoría" />
          <Tab label="Usuarios" />
          <Tab label="Categorías" />
<Tab label="Productos" />
<Tab label="Notificaciones" />
        </Tabs>
      </Paper>
{tab === 0 && (
  <Stack spacing={2}>
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="h6">Forzar sincronización</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>Actualiza los partidos desde la API externa manualmente.</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 1.5 }}>
        <TextField label="Liga" type="number" value={sincLiga} onChange={(e) => setSincLiga(e.target.value)} disabled={loading} />
        <TextField label="Temporada" type="number" value={sincTemporada} onChange={(e) => setSincTemporada(e.target.value)} disabled={loading} />
        <TextField label="Fecha (YYYY-MM-DD)" value={sincFecha} onChange={(e) => setSincFecha(e.target.value)} disabled={loading} />
      </Box>
      <Button variant="contained" sx={{ mt: 2 }} disabled={loading} onClick={onSincronizar}>Sincronizar</Button>
    </Paper>

    <Paper sx={{ p: 2.5 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ md: "center" }}>
        <Typography variant="h6">Partidos</Typography>
        <Stack direction="row" spacing={1}>
          <TextField label="Filtrar por fecha" type="date" size="small" value={fechaFiltro} onChange={(e) => setFechaFiltro(e.target.value)} disabled={loading} slotProps={{ inputLabel: { shrink: true } }} />
          <Button variant="outlined" size="small" disabled={loading} onClick={onFiltrarFecha}>Filtrar</Button>
          <Button variant="outlined" size="small" disabled={loading} onClick={async () => { const all = await adminGetPartidos(); setPartidos(all); setFechaFiltro(""); }}>Ver todos</Button>
        </Stack>
      </Stack>
      {partidos.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 1 }}>No hay partidos.</Typography>
      ) : (
        <Stack spacing={1} sx={{ mt: 2 }}>
          {partidos.map((p) => {
            const cap = capacidades.find((c) => c.partidoId === Number(p.id));
            return (
              <Paper key={p.id} variant="outlined" sx={{ p: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                      <Stack direction="row" spacing={1} alignItems="center">
  {p.home.logo && <img src={p.home.logo} alt={p.home.name} style={{ width: 24, height: 24, objectFit: "contain" }} />}
  <Typography sx={{ fontWeight: 900 }}>{p.home.name}</Typography>
  <Typography sx={{ fontWeight: 900 }}>vs</Typography>
  {p.away.logo && <img src={p.away.logo} alt={p.away.name} style={{ width: 24, height: 24, objectFit: "contain" }} />}
  <Typography sx={{ fontWeight: 900 }}>{p.away.name}</Typography>
</Stack>
                      <Chip size="small" color={statusColors[p.status]} label={statusLabels[p.status]} />
                    </Stack>
                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                      {new Date(p.startTimeISO).toLocaleString()} · {p.city} · {p.stadium}
                    </Typography>
                    {p.score && <Typography sx={{ mt: 0.5, fontWeight: 800 }}>Resultado: {p.score.home} - {p.score.away}</Typography>}
                  </Box>
                  {cap && (
                    <Stack spacing={0.5} alignItems={{ md: "flex-end" }}>
                      <Chip size="small" label={`Reservadas: ${cap.entradasReservadas}`} variant="outlined" />
                      <Chip size="small" label={`Pagadas: ${cap.entradasPagadas}`} color="success" variant="outlined" />
                      <Chip size="small" label={`Capacidad: ${cap.capacidadTotal}`} variant="outlined" />
                    </Stack>
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Paper>
  </Stack>
)}
     {tab === 1 && (
  <Paper sx={{ p: 2.5 }}>
    <Typography variant="h6">Pollas y ranking</Typography>
    <Typography color="text.secondary">Revisa, cierra, fuerza puntos o elimina pollas.</Typography>
    {apuestas.length === 0 ? (
      <Typography color="text.secondary" sx={{ mt: 1 }}>No hay pollas registradas.</Typography>
    ) : (
      <Stack spacing={1.5} sx={{ mt: 2 }}>
        {apuestas.map((a) => {
          
          return (
            <Paper key={a.id} variant="outlined" sx={{ p: 2 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontWeight: 900 }}>{a.nombre}</Typography>
                    <Chip size="small" label={a.estado} color={a.estado === "ABIERTA" ? "success" : "default"} />
                  </Stack>
                 <Typography color="text.secondary">
  Código {a.codigoInvitacion}
</Typography>
                  {a.fechaCierre && <Typography variant="caption">Cierre: {new Date(a.fechaCierre).toLocaleString()}</Typography>}
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                  {a.estado === "ABIERTA" && (
                    <Button size="small" variant="outlined" disabled={loading} onClick={() => onCerrarApuesta(a)}>Cerrar</Button>
                  )}
                  {a.estado === "CERRADA" && (
                    <Button size="small" variant="outlined" color="info" disabled={loading} onClick={() => onForzarPuntos(a)}>Forzar puntos</Button>
                  )}
                  <Button size="small" color="error" variant="outlined" disabled={loading} onClick={() => onEliminarApuesta(a)}>Eliminar</Button>
                </Stack>
              </Stack>
          <Box sx={{ mt: 1.5 }}>
  <Button size="small" variant="text" disabled={loadingMiembros[a.id]} onClick={() => onVerMiembros(a.id)}>
    {miembrosApuesta[a.id] ? "Ocultar miembros" : "Ver miembros"}
  </Button>
  {miembrosApuesta[a.id] && (
    <Stack spacing={0.75} sx={{ mt: 1 }}>
      {miembrosApuesta[a.id].slice().sort((x, y) => (y.puntos ?? 0) - (x.puntos ?? 0)).map((member, index) => (
        <Box key={member.usuarioId} sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.75, borderBottom: "1px solid rgba(234,242,255,0.08)" }}>
          <Typography>{index + 1}. {member.nombre}</Typography>
          <Typography sx={{ fontWeight: 900 }}>{member.puntos ?? 0} pts</Typography>
        </Box>
      ))}
    </Stack>
  )}
</Box>
            </Paper>
          );
        })}
      </Stack>
    )}
  </Paper>
)}

      {tab === 2 && (
        <Paper sx={{ p: 2.5 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
            <Box>
              <Typography variant="h6">Auditoría del sistema</Typography>
              <Typography color="text.secondary">Movimientos recientes de autenticación, partidos, pagos y soporte.</Typography>
            </Box>
            <TextField select label="Filtrar evento" value={eventFilter} onChange={(e) => setEventFilter(e.target.value as SystemEventType | "ALL")} sx={{ minWidth: 240 }}>
              <MenuItem value="ALL">Todos</MenuItem>
              {eventTypes.map((type) => (<MenuItem key={type} value={type}>{eventLabels[type]}</MenuItem>))}
            </TextField>
          </Stack>
          {eventsFiltered.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 2 }}>No hay eventos para este filtro.</Typography>
          ) : (
            <Stack spacing={1} sx={{ mt: 2 }}>
              {eventsFiltered.map((event) => (
                <Paper key={event.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
                    <Box>
                      <Typography sx={{ fontWeight: 900 }}>{eventLabels[event.type] ?? event.type}</Typography>
                      <Typography color="text.secondary">{event.message}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">{new Date(event.createdAt).toLocaleString()}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                    {event.actorName && <Chip size="small" label={`Actor: ${event.actorName}`} />}
                    {event.entityType && <Chip size="small" label={`Entidad: ${event.entityType}`} variant="outlined" />}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      )}

      {tab === 3 && (
        <Stack spacing={2}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6">Registrar usuario del sistema</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Agrega administradores, operadores, soporte o personal legal.
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 1.5 }}>
              <TextField label="Nombre" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} disabled={loading} />
              <TextField label="Apellido" value={nuevoApellido} onChange={(e) => setNuevoApellido(e.target.value)} disabled={loading} />
              <TextField label="Correo" type="email" value={nuevoCorreo} onChange={(e) => setNuevoCorreo(e.target.value)} disabled={loading} />
              <TextField label="Contraseña" type="password" value={nuevaContrasena} onChange={(e) => setNuevaContrasena(e.target.value)} disabled={loading} />
              <TextField select label="Rol" value={nuevoRol} onChange={(e) => setNuevoRol(e.target.value)} disabled={loading}>
                <MenuItem value="ROLE_ADMIN">Administrador</MenuItem>
                <MenuItem value="ROLE_OPERADOR">Operador</MenuItem>
                <MenuItem value="ROLE_SOPORTE">Soporte</MenuItem>
                <MenuItem value="ROLE_LEGAL">Legal</MenuItem>
              </TextField>
            </Box>
            <Button variant="contained" sx={{ mt: 2 }} disabled={loading} onClick={onRegistrarUsuario}>
              Registrar usuario
            </Button>
          </Paper>

          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6">Usuarios registrados</Typography>
            {usuarios.length === 0 ? (
              <Typography color="text.secondary" sx={{ mt: 1 }}>No hay usuarios registrados.</Typography>
            ) : (
              <Stack spacing={1} sx={{ mt: 2 }}>
                {usuarios.map((u) => (
                  <Paper key={u.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1}>
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>{u.nombre} {u.apellido}</Typography>
                        <Typography color="text.secondary">{u.correoUsuario}</Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={u.rol} size="small" color={u.rol === "ROLE_ADMIN" ? "error" : "default"} />
                        <Button size="small" color="error" variant="outlined" disabled={loading} onClick={() => onEliminarUsuario(u)}>
                          Desactivar
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Stack>
      )}
      {tab === 4 && (
  <Stack spacing={2}>
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="h6">Crear categoría</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 1.5, mt: 2 }}>
        <TextField label="Nombre" value={nuevaCategoriaNombre} onChange={(e) => setNuevaCategoriaNombre(e.target.value)} disabled={loading} />
        <TextField label="Descripción" value={nuevaCategoriaDesc} onChange={(e) => setNuevaCategoriaDesc(e.target.value)} disabled={loading} />
      </Box>
      <Button variant="contained" sx={{ mt: 2 }} disabled={loading} onClick={onCrearCategoria}>Crear categoría</Button>
    </Paper>

    <Paper sx={{ p: 2.5 }}>
      <Typography variant="h6">Categorías registradas</Typography>
      {categorias.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 1 }}>No hay categorías.</Typography>
      ) : (
        <Stack spacing={1} sx={{ mt: 2 }}>
          {categorias.map((c) => (
            <Paper key={c.id} variant="outlined" sx={{ p: 2 }}>
              {editCategoria?.id === c.id ? (
                <Stack spacing={1.5}>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 1.5 }}>
                    <TextField label="Nombre" value={editCategoriaNombre} onChange={(e) => setEditCategoriaNombre(e.target.value)} disabled={loading} size="small" />
                    <TextField label="Descripción" value={editCategoriaDesc} onChange={(e) => setEditCategoriaDesc(e.target.value)} disabled={loading} size="small" />
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="contained" disabled={loading} onClick={onActualizarCategoria}>Guardar</Button>
                    <Button size="small" variant="outlined" disabled={loading} onClick={() => setEditCategoria(null)}>Cancelar</Button>
                  </Stack>
                </Stack>
              ) : (
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1}>
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>{c.nombre}</Typography>
                    <Typography color="text.secondary">{c.descripcion}</Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" disabled={loading} onClick={() => { setEditCategoria(c); setEditCategoriaNombre(c.nombre); setEditCategoriaDesc(c.descripcion); }}>Editar</Button>
                    <Button size="small" color="error" variant="outlined" disabled={loading} onClick={() => onEliminarCategoria(c)}>Eliminar</Button>
                  </Stack>
                </Stack>
              )}
            </Paper>
          ))}
        </Stack>
      )}
    </Paper>
  </Stack>
)}

{tab === 5 && (
  <Stack spacing={2}>
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="h6">Crear producto</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 1.5, mt: 2 }}>
        <TextField label="Nombre" value={prodNombre} onChange={(e) => setProdNombre(e.target.value)} disabled={loading} />
        <TextField label="Descripción" value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} disabled={loading} />
        <TextField label="Precio" type="number" value={prodPrecio} onChange={(e) => setProdPrecio(e.target.value)} disabled={loading} />
        <TextField label="Stock" type="number" value={prodStock} onChange={(e) => setProdStock(e.target.value)} disabled={loading} />
        <TextField label="URL imagen" value={prodImagenUrl} onChange={(e) => setProdImagenUrl(e.target.value)} disabled={loading} />
        <TextField select label="Categoría" value={prodCategoriaId} onChange={(e) => setProdCategoriaId(e.target.value)} disabled={loading}>
          {categorias.map((c) => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>)}
        </TextField>
      </Box>
      <Button variant="contained" sx={{ mt: 2 }} disabled={loading} onClick={onCrearProducto}>Crear producto</Button>
    </Paper>

    <Paper sx={{ p: 2.5 }}>
      <Typography variant="h6">Productos</Typography>
      {productos.length === 0 ? (
        <Typography color="text.secondary" sx={{ mt: 1 }}>No hay productos.</Typography>
      ) : (
        <Stack spacing={1} sx={{ mt: 2 }}>
          {productos.map((p) => (
            <Paper key={p.id} variant="outlined" sx={{ p: 2 }}>
              {editProducto?.id === p.id ? (
                <Stack spacing={1.5}>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 1.5 }}>
                    <TextField label="Precio" type="number" value={editProdPrecio} onChange={(e) => setEditProdPrecio(e.target.value)} disabled={loading} size="small" />
                    <TextField label="Stock" type="number" value={editProdStock} onChange={(e) => setEditProdStock(e.target.value)} disabled={loading} size="small" />
                    <TextField label="Descripción" value={editProdDesc} onChange={(e) => setEditProdDesc(e.target.value)} disabled={loading} size="small" />
                    <TextField label="URL imagen" value={editProdImagenUrl} onChange={(e) => setEditProdImagenUrl(e.target.value)} disabled={loading} size="small" />
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="contained" disabled={loading} onClick={onActualizarProducto}>Guardar</Button>
                    <Button size="small" variant="outlined" disabled={loading} onClick={() => setEditProducto(null)}>Cancelar</Button>
                  </Stack>
                </Stack>
              ) : (
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ fontWeight: 700 }}>{p.nombre}</Typography>
                      <Chip size="small" label={p.activo ? "Activo" : "Inactivo"} color={p.activo ? "success" : "default"} />
                      <Chip size="small" label={p.categoriaNombre} variant="outlined" />
                    </Stack>
                    <Typography color="text.secondary">{p.descripcion}</Typography>
                    <Typography variant="caption">${p.precio} · Stock: {p.stock}</Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    {p.activo ? (
                      <>
                        <Button size="small" variant="outlined" disabled={loading} onClick={() => { setEditProducto(p); setEditProdPrecio(String(p.precio)); setEditProdStock(String(p.stock)); setEditProdDesc(p.descripcion); setEditProdImagenUrl(p.imagenUrl); }}>Editar</Button>
                        <Button size="small" color="error" variant="outlined" disabled={loading} onClick={() => onEliminarProducto(p)}>Desactivar</Button>
                      </>
                    ) : (
                      <Button size="small" color="success" variant="outlined" disabled={loading} onClick={() => onReactivarProducto(p)}>Reactivar</Button>
                    )}
                  </Stack>
                </Stack>
              )}
            </Paper>
          ))}
        </Stack>
      )}
    </Paper>
  </Stack>
)}
{tab === 6 && (
  <Paper sx={{ p: 2.5 }}>
    <Typography variant="h6">Enviar notificaciones</Typography>
    <Typography color="text.secondary" sx={{ mb: 2 }}>
      Envía notificaciones push a todos los usuarios, segmentado por partido o a usuarios específicos.
    </Typography>

    <Stack spacing={2}>
      <TextField
        select label="Destino" value={notiModo}
        onChange={(e) => setNotiModo(e.target.value as "todos" | "partido" | "usuarios")}
        disabled={loading}
      >
        <MenuItem value="todos">Todos los usuarios activos</MenuItem>
        <MenuItem value="partido">Por partido (fans de las selecciones)</MenuItem>
        <MenuItem value="usuarios">Usuarios específicos</MenuItem>
      </TextField>

      {notiModo === "partido" && (
        <TextField
          select label="Partido" value={notiPartidoId}
          onChange={(e) => setNotiPartidoId(e.target.value)}
          disabled={loading}
        >
          {partidos.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.home?.name ?? "Local"} vs {p.away?.name ?? "Visitante"} — {new Date(p.startTimeISO).toLocaleDateString()}
            </MenuItem>
          ))}
        </TextField>
      )}

      {notiModo === "usuarios" && (
        <TextField
          label="IDs de usuarios (separados por coma)"
          value={notiUsuarioIds}
          onChange={(e) => setNotiUsuarioIds(e.target.value)}
          disabled={loading}
          placeholder="1, 2, 3"
        />
      )}

      <Divider />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 1.5 }}>
        <TextField
          select label="Tipo" value={notiTipo}
          onChange={(e) => setNotiTipo(e.target.value)}
          disabled={loading}
        >
          <MenuItem value="INFO">Info</MenuItem>
          <MenuItem value="ALERTA">Alerta</MenuItem>
          <MenuItem value="PARTIDO">Partido</MenuItem>
          <MenuItem value="SISTEMA">Sistema</MenuItem>
        </TextField>
        <TextField
          select label="Canal" value={notiCanal}
          onChange={(e) => setNotiCanal(e.target.value)}
          disabled={loading}
        >
          <MenuItem value="SISTEMA">Sistema</MenuItem>
          <MenuItem value="PUSH">Push</MenuItem>
          <MenuItem value="EMAIL">Email</MenuItem>
        </TextField>
        <TextField
          label="Título" value={notiTitulo}
          onChange={(e) => setNotiTitulo(e.target.value)}
          disabled={loading}
        />
        <TextField
          label="Mensaje" value={notiMensaje}
          onChange={(e) => setNotiMensaje(e.target.value)}
          disabled={loading} multiline rows={2}
        />
      </Box>

      <Button variant="contained" disabled={loading} onClick={onEnviarNotificacion} sx={{ alignSelf: "flex-start" }}>
        Enviar notificación
      </Button>
    </Stack>
  </Paper>
)}
    </Stack>
  );
}