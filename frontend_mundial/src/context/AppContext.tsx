// src/context/AppContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getMeApi, loginApi, logoutApi } from "../api/authApi";

export type Role = "user" | "admin" | "support";

export type CurrentUser = {
  id: string;
  name: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
  role: Role;
};

type AppState = {
  user: CurrentUser | null;
  setUser: (u: CurrentUser | null) => void;

  activePoolCode: string | null;
  setActivePoolCode: (code: string | null) => void;

  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  authLoading: boolean;
};

const AppContext = createContext<AppState | undefined>(undefined);

const LS_POOL = "mundial_activePool";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [activePoolCode, setActivePoolCode] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMeApi();
        setUser(me);
      } finally {
        setAuthLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const rawPool = localStorage.getItem(LS_POOL);
    if (rawPool) setActivePoolCode(rawPool);
  }, []);

  useEffect(() => {
    if (activePoolCode) {
      localStorage.setItem(LS_POOL, activePoolCode);
    } else {
      localStorage.removeItem(LS_POOL);
    }
  }, [activePoolCode]);

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    const res = await loginApi(usernameOrEmail, password);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    await logoutApi(user);
    setUser(null);
    setActivePoolCode(null);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      activePoolCode,
      setActivePoolCode,
      login,
      logout,
      authLoading,
    }),
    [user, activePoolCode, login, logout, authLoading]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
