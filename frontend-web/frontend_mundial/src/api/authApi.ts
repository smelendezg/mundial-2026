import { USE_MOCK } from "./config";
import { http, setAuthToken, getAuthToken } from "./http";
import { createSystemEvent } from "./eventsApi";

import type { Role, CurrentUser } from "../context/AppContext";

export type LoginResponse = { token: string; user: CurrentUser };

export type LoginPayload = {
  usernameOrEmail: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  avatarUrl?: string;
  role?: Role;
};

type ApiUser = Omit<CurrentUser, "role"> & {
  role?: Role | "USER" | "ADMIN" | "SUPPORT" | "ROLE_USER" | "ROLE_ADMIN" | "ROLE_SUPPORT";
};

function buildMockToken(user: CurrentUser) {
  return btoa(JSON.stringify(user));
}

function parseMockToken(token: string): CurrentUser | null {
  try {
    const raw = atob(token);
    const u = normalizeUser(JSON.parse(raw) as ApiUser);
    if (!u?.id || !u?.name || !u?.role) return null;
    return u;
  } catch {
    return null;
  }
}

function normalizeRole(role: ApiUser["role"]): Role {
  const value = String(role ?? "user").toLowerCase();
  if (value.includes("admin")) return "admin";
  if (value.includes("support") || value.includes("soporte")) return "support";
  return "user";
}

function normalizeUser(user: ApiUser): CurrentUser {
  return {
    ...user,
    role: normalizeRole(user.role),
  };
}

function buildMockUser(
  name: string,
  role: Role,
  lastName = "",
  email = "",
  avatarUrl = ""
): CurrentUser {
  const key = email.trim().toLowerCase() || name.trim().toLowerCase();
  const mockId =
    key === "sara"
      ? "u1"
      : key === "juan"
      ? "u2"
      : `u_${key.replace(/\s+/g, "_")}`;

  return {
    id: mockId,
    name: name.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    avatarUrl,
    role,
  };
}

export async function loginApi(
  usernameOrEmail: string,
  password: string
): Promise<LoginResponse> {
  const trimmed = usernameOrEmail.trim();
  if (!trimmed) throw new Error("Usuario o correo vacío");
  if (!password) throw new Error("Contraseña vacía");

  if (!USE_MOCK) {
    const res = await http.post<{ token: string }>("/login", {
      correoUsuario: trimmed,
      contrasena: password,
    });

    setAuthToken(res.token);

    const profileRes = await http.get<{
      id: number;
      correoUsuario: string;
      nombre: string;
      apellido: string;
      rol: string;
    }>("/api/usuarios/perfil");

    const user: CurrentUser = normalizeUser({
      id: String(profileRes.id),
      name: profileRes.nombre,
      lastName: profileRes.apellido,
      email: profileRes.correoUsuario,
      role: profileRes.rol as ApiUser["role"],
    });

    await createSystemEvent({
      type: "AUTH_LOGIN",
      actorId: user.id,
      actorName: user.name,
      entityType: "AUTH",
      message: `Inicio de sesión: ${user.name}`,
      data: { role: user.role },
    });

    return { token: res.token, user };
  }

  const lowerUser = trimmed.toLowerCase();
  const role: Role =
    lowerUser.includes("admin") || password === "Admin2026*"
      ? "admin"
      : lowerUser.includes("soporte") ||
        lowerUser.includes("support") ||
        password === "Soporte2026*"
      ? "support"
      : "user";
  const user = buildMockUser(trimmed, role, "", trimmed.includes("@") ? trimmed : "");
  const token = buildMockToken(user);

  setAuthToken(token);

  await createSystemEvent({
    type: "AUTH_LOGIN",
    actorId: user.id,
    actorName: user.name,
    entityType: "AUTH",
    message: `Inicio de sesión: ${user.name}`,
    data: { role: user.role },
  });

  return { token, user };
}

export async function registerApi(
  payload: RegisterPayload
): Promise<LoginResponse> {
  const trimmed = payload.name.trim();
  const lastName = payload.lastName.trim();
  const email = payload.email.trim().toLowerCase();

  if (!trimmed) throw new Error("Nombre vacío");
  if (!lastName) throw new Error("Apellido vacío");
  if (!email) throw new Error("Correo vacío");
  if (!payload.password) throw new Error("Contraseña vacía");

  if (!USE_MOCK) {
    await http.post("/api/usuarios/registrar", {
      correoUsuario: email,
      contrasena: payload.password,
      nombre: trimmed,
      apellido: lastName,
      rol: "ROLE_USUARIO",
    });

    const loginRes = await loginApi(email, payload.password);

    await createSystemEvent({
      type: "USER_REGISTERED",
      actorId: loginRes.user.id,
      actorName: loginRes.user.name,
      entityType: "USER",
      entityId: loginRes.user.id,
      message: `Usuario registrado: ${loginRes.user.name}`,
      data: { role: loginRes.user.role },
    });

    return loginRes;
  }

  const role = payload.role ?? "user";
  const user = buildMockUser(trimmed, role, lastName, email, payload.avatarUrl);
  const token = buildMockToken(user);

  setAuthToken(token);

  await createSystemEvent({
    type: "USER_REGISTERED",
    actorId: user.id,
    actorName: user.name,
    entityType: "USER",
    entityId: user.id,
    message: `Usuario registrado: ${user.name}`,
    data: { role: user.role },
  });

  return { token, user };
}

export async function logoutApi(user?: CurrentUser | null): Promise<void> {
  if (!USE_MOCK) {
    try {
      await http.post<void>("/api/auth/logout");
    } catch {
      // ignored
    }
  }

  if (user) {
    try {
      await createSystemEvent({
        type: "AUTH_LOGOUT",
        actorId: user.id,
        actorName: user.name,
        entityType: "AUTH",
        message: `Cierre de sesión: ${user.name}`,
        data: { role: user.role },
      });
    } catch {
      // ignored
    }
  }

  setAuthToken(null);
}

export async function getMeApi(): Promise<CurrentUser | null> {
  if (!USE_MOCK) {
    try {
      const res = await http.get<{
        id: number;
        correoUsuario: string;
        nombre: string;
        apellido: string;
        rol: string;
      }>("/api/usuarios/perfil");

      return normalizeUser({
        id: String(res.id),
        name: res.nombre,
        lastName: res.apellido,
        email: res.correoUsuario,
        role: res.rol as ApiUser["role"],
      });
    } catch {
      return null;
    }
  }

  const token = getAuthToken();
  if (!token) return null;

  return parseMockToken(token);
}