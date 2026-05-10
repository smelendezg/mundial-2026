// src/api/authApi.ts
import { USE_MOCK } from "./config";
import { http, setAuthToken, getAuthToken } from "./http";
import { createSystemEvent } from "./eventsApi";
import {
  validateEmail,
  validatePassword,
  validatePersonName,
  validateUsernameOrEmail,
} from "../utils/validation";

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
  role?:
    | Role
    | "USER"
    | "ADMIN"
    | "SUPPORT"
    | "OPERATOR"
    | "ROLE_USER"
    | "ROLE_ADMIN"
    | "ROLE_SUPPORT"
    | "ROLE_OPERATOR";
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
  if (value.includes("operator") || value.includes("operador") || value.includes("admin")) return "operator";
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
  const userError = validateUsernameOrEmail(trimmed);
  if (userError) throw new Error(userError);
  if (!password) throw new Error("La contraseña es obligatoria.");
  if (password.length > 80) throw new Error("La contraseña no puede tener más de 80 caracteres.");

  if (!USE_MOCK) {
    const res = await http.post<LoginResponse>("/auth/login", {
      usernameOrEmail: trimmed,
      password,
    });
    const user = normalizeUser(res.user as ApiUser);

    setAuthToken(res.token);

    await createSystemEvent({
      type: "AUTH_LOGIN",
      actorId: user.id,
      actorName: user.name,
      entityType: "AUTH",
      message: `Inicio de sesión: ${user.name}`,
      data: { role: user.role },
    });

    return { ...res, user };
  }

  const lowerUser = trimmed.toLowerCase();
  const role: Role =
    lowerUser.includes("operator") ||
    lowerUser.includes("operador") ||
    lowerUser.includes("admin") ||
    password === "Operador2026*" ||
    password === "Admin2026*"
      ? "operator"
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
  const role = payload.role ?? "user";

  const nameError = validatePersonName(trimmed, "El nombre");
  if (nameError) throw new Error(nameError);
  const lastNameError = validatePersonName(lastName, "El apellido");
  if (lastNameError) throw new Error(lastNameError);
  const emailError = validateEmail(email);
  if (emailError) throw new Error(emailError);
  const passwordError = validatePassword(payload.password);
  if (passwordError) throw new Error(passwordError);

  if (!USE_MOCK) {
    const res = await http.post<LoginResponse>("/auth/register", {
      name: trimmed,
      lastName,
      email,
      password: payload.password,
      avatarUrl: payload.avatarUrl,
      role,
    });
    const user = normalizeUser(res.user as ApiUser);

    setAuthToken(res.token);

    await createSystemEvent({
      type: "USER_REGISTERED",
      actorId: user.id,
      actorName: user.name,
      entityType: "USER",
      entityId: user.id,
      message: `Usuario registrado: ${user.name}`,
      data: { role: user.role },
    });

    return { ...res, user };
  }

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
    await http.post<void>("/auth/logout");
  }

  if (user) {
    await createSystemEvent({
      type: "AUTH_LOGOUT",
      actorId: user.id,
      actorName: user.name,
      entityType: "AUTH",
      message: `Cierre de sesión: ${user.name}`,
      data: { role: user.role },
    });
  }

  setAuthToken(null);
}

export async function getMeApi(): Promise<CurrentUser | null> {
  if (!USE_MOCK) {
    try {
      const user = await http.get<ApiUser>("/auth/me");
      return normalizeUser(user);
    } catch {
      return null;
    }
  }

  const token = getAuthToken();
  if (!token) return null;

  return parseMockToken(token);
}
