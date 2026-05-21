import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { getMyProfile, updateMyProfile } from "../api/profileApi";
import { http } from "../api/http";
import type { Profile } from "../types/profile";

type Vista = "ver" | "editar" | "preferencias";

type Preferencia = { id: number; nombre: string };

export default function ProfilePage() {
  const { user, setUser, logout } = useApp();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [vista, setVista] = useState<Vista>("ver");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correoNuevo, setCorreoNuevo] = useState("");
  const [contrasenaActual, setContrasenaActual] = useState("");
  const [contrasenaNueva, setContrasenaNueva] = useState("");

  const [selecciones, setSelecciones] = useState<Preferencia[]>([]);
  const [estadios, setEstadios] = useState<Preferencia[]>([]);
  const [ciudades, setCiudades] = useState<Preferencia[]>([]);

  const [todasSelecciones, setTodasSelecciones] = useState<Preferencia[]>([]);
  const [todosEstadios, setTodosEstadios] = useState<Preferencia[]>([]);
  const [todasCiudades, setTodasCiudades] = useState<Preferencia[]>([]);

  const [seleccionada, setSeleccionada] = useState<number | "">("");
  const [estadioSeleccionado, setEstadioSeleccionado] = useState<number | "">("");
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState<number | "">("");

useEffect(() => {
  if (!user) return;
  getMyProfile(user.id, {
    name: user.name,
    lastName: user.lastName,
    email: user.email,
  }).then((p) => {
    setProfile(p);
    setNombre(p.name);
    setApellido(p.lastName);
    setSelecciones(p.favoriteTeams.map((nombre, id) => ({ id, nombre })));
    setCiudades(p.favoriteCities.map((nombre, id) => ({ id, nombre })));
  });
  http.get<Preferencia[]>("/api/usuarios/estadiosFav").then(setEstadios).catch(() => {});
}, [user]);

  useEffect(() => {
    if (vista !== "preferencias") return;
    http.get<Preferencia[]>("/api/partidos/catalogo/selecciones").then(setTodasSelecciones).catch(() => {});
    http.get<Preferencia[]>("/api/estadios").then(setTodosEstadios).catch(() => {});
    http.get<Preferencia[]>("/api/ciudades").then(setTodasCiudades).catch(() => {});
  }, [vista]);

  if (!user) return <Alert severity="warning">Debes iniciar sesión.</Alert>;
  if (!profile) return <Alert severity="info">Cargando perfil...</Alert>;

 const onGuardarPerfil = async () => {
  try {
    setGuardando(true);
    setMensaje("");

    const updated = await updateMyProfile(user.id, {
      name: nombre,
      lastName: apellido,
      correoNuevo: correoNuevo || undefined,
      contrasenaActual: contrasenaActual || undefined,
      contrasenaNueva: contrasenaNueva || undefined,
    });

    setProfile(updated);
    setNombre(updated.name);
    setApellido(updated.lastName);
    setUser({
      ...user,
      name: updated.name,
      lastName: updated.lastName,
      email: updated.email,
    });
    setContrasenaActual("");
    setContrasenaNueva("");
    setCorreoNuevo("");
    setMensaje("Perfil actualizado correctamente.");
    setVista("ver");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("inicia sesi") || msg.includes("Token invalidado") || msg.includes("Sesi")) {
      setMensaje("Correo actualizado. Redirigiendo al login...");
      setTimeout(() => {
        logout();
        navigate("/login", { replace: true });
      }, 2000);
      return;
    }
    setMensaje(msg || "Error al actualizar el perfil.");
  } finally {
    setGuardando(false);
  }
};

  const agregarSeleccion = async () => {
    if (seleccionada === "") return;
    await http.put("/api/usuarios/seleccionesFavoritas", [seleccionada]);
    const res = await http.get<Preferencia[]>("/api/usuarios/seleccionesFavoritas");
    setSelecciones(res);
    setSeleccionada("");
  };

  const eliminarSeleccion = async (id: number) => {
    await http.delete(`/api/usuarios/seleccionesFavoritas/${id}`);
    setSelecciones((prev) => prev.filter((s) => s.id !== id));
  };

  const agregarEstadio = async () => {
    if (estadioSeleccionado === "") return;
    await http.put("/api/usuarios/estadiosFav", [estadioSeleccionado]);
    const res = await http.get<Preferencia[]>("/api/usuarios/estadiosFav");
    setEstadios(res);
    setEstadioSeleccionado("");
  };

  const eliminarEstadio = async (id: number) => {
    await http.delete(`/api/usuarios/estadiosFav/${id}`);
    setEstadios((prev) => prev.filter((e) => e.id !== id));
  };

  const agregarCiudad = async () => {
    if (ciudadSeleccionada === "") return;
    await http.put("/api/usuarios/ciudadesFav", [ciudadSeleccionada]);
    const res = await http.get<Preferencia[]>("/api/usuarios/ciudadesFav");
    setCiudades(res);
    setCiudadSeleccionada("");
  };

  const eliminarCiudad = async (id: number) => {
    await http.delete(`/api/usuarios/ciudadesFav/${id}`);
    setCiudades((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 600, mx: "auto" }}>
      <Box>
        <Typography variant="h5">Mi Perfil</Typography>
        <Typography color="text.secondary">
          Gestiona tu información personal y preferencias.
        </Typography>
      </Box>

      {mensaje && (
        <Alert severity={mensaje.includes("correctamente") ? "success" : "error"}>
          {mensaje}
        </Alert>
      )}

      {vista === "ver" && (
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2} alignItems="center">
            <Avatar sx={{ width: 80, height: 80, fontSize: 32 }}>
              {profile.name.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6">{profile.name} {profile.lastName}</Typography>
            <Typography color="text.secondary">{profile.email}</Typography>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1}>
            <Typography variant="subtitle2">Selecciones favoritas</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {selecciones.length > 0 ? (
                selecciones.map((s) => <Chip key={s.id} label={s.nombre} size="small" />)
              ) : (
                <Typography color="text.secondary" variant="body2">Sin selecciones favoritas</Typography>
              )}
            </Stack>

            <Typography variant="subtitle2" sx={{ mt: 1 }}>Estadios favoritos</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {estadios.length > 0 ? (
                estadios.map((e) => <Chip key={e.id} label={e.nombre} size="small" />)
              ) : (
                <Typography color="text.secondary" variant="body2">Sin estadios favoritos</Typography>
              )}
            </Stack>

            <Typography variant="subtitle2" sx={{ mt: 1 }}>Ciudades favoritas</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {ciudades.length > 0 ? (
                ciudades.map((c) => <Chip key={c.id} label={c.nombre} size="small" />)
              ) : (
                <Typography color="text.secondary" variant="body2">Sin ciudades favoritas</Typography>
              )}
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={() => setVista("editar")}>Editar perfil</Button>
            <Button variant="outlined" onClick={() => setVista("preferencias")}>Editar preferencias</Button>
            <Button color="inherit" onClick={() => navigate("/home")}>Volver</Button>
          </Stack>
        </Paper>
      )}

      {vista === "editar" && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Editar perfil</Typography>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={guardando} fullWidth />
              <TextField label="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} disabled={guardando} fullWidth />
            </Stack>
            <Divider />
            <Typography variant="subtitle2" color="text.secondary">
              Para cambiar correo o contraseña debes confirmar tu contraseña actual
            </Typography>
            <TextField label="Correo nuevo (opcional)" type="email" value={correoNuevo} onChange={(e) => setCorreoNuevo(e.target.value)} disabled={guardando} fullWidth />
            <TextField label="Contraseña actual" type="password" value={contrasenaActual} onChange={(e) => setContrasenaActual(e.target.value)} disabled={guardando} fullWidth />
            <TextField label="Contraseña nueva (opcional)" type="password" value={contrasenaNueva} onChange={(e) => setContrasenaNueva(e.target.value)} disabled={guardando} fullWidth />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={onGuardarPerfil} disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar cambios"}
              </Button>
              <Button color="inherit" onClick={() => { setVista("ver"); setMensaje(""); }} disabled={guardando}>Cancelar</Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      {vista === "preferencias" && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Editar preferencias</Typography>
          <Stack spacing={3}>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Selecciones favoritas</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                {selecciones.map((s) => (
                  <Chip key={s.id} label={s.nombre} size="small" onDelete={() => eliminarSeleccion(s.id)} />
                ))}
              </Stack>
              <Stack direction="row" spacing={1}>
                <Select value={seleccionada} onChange={(e) => setSeleccionada(e.target.value as number)} displayEmpty size="small" sx={{ minWidth: 200 }}>
                  <MenuItem value="">Selecciona una selección</MenuItem>
                  {todasSelecciones.filter((s) => !selecciones.find((f) => f.id === s.id)).map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>
                  ))}
                </Select>
                <Button variant="outlined" size="small" onClick={agregarSeleccion}>Agregar</Button>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Estadios favoritos</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                {estadios.map((e) => (
                  <Chip key={e.id} label={e.nombre} size="small" onDelete={() => eliminarEstadio(e.id)} />
                ))}
              </Stack>
              <Stack direction="row" spacing={1}>
                <Select value={estadioSeleccionado} onChange={(e) => setEstadioSeleccionado(e.target.value as number)} displayEmpty size="small" sx={{ minWidth: 200 }}>
                  <MenuItem value="">Selecciona un estadio</MenuItem>
                  {todosEstadios.filter((e) => !estadios.find((f) => f.id === e.id)).map((e) => (
                    <MenuItem key={e.id} value={e.id}>{e.nombre}</MenuItem>
                  ))}
                </Select>
                <Button variant="outlined" size="small" onClick={agregarEstadio}>Agregar</Button>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Ciudades favoritas</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                {ciudades.map((c) => (
                  <Chip key={c.id} label={c.nombre} size="small" onDelete={() => eliminarCiudad(c.id)} />
                ))}
              </Stack>
              <Stack direction="row" spacing={1}>
                <Select value={ciudadSeleccionada} onChange={(e) => setCiudadSeleccionada(e.target.value as number)} displayEmpty size="small" sx={{ minWidth: 200 }}>
                  <MenuItem value="">Selecciona una ciudad</MenuItem>
                  {todasCiudades.filter((c) => !ciudades.find((f) => f.id === c.id)).map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
                  ))}
                </Select>
                <Button variant="outlined" size="small" onClick={agregarCiudad}>Agregar</Button>
              </Stack>
            </Box>

            <Button color="inherit" onClick={() => setVista("ver")}>Volver</Button>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}