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

export type Role = "user" | "operator" | "support";

export type CurrentUser = {
  id: string;
  name: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
  role: Role;
};

export type CartItem =
  | {
      id: string;
      kind: "TICKET";
      matchId: string;
      title: string;
      subtitle: string;
      quantity: number;
      amount: number;
    }
  | {
      id: string;
      kind: "COINS";
      title: string;
      subtitle: string;
      quantity: number;
      amount: number;
      coins: number;
    }
  | {
      id: string;
      kind: "PACK";
      sku: string;
      title: string;
      subtitle: string;
      quantity: number;
      amount: number;
      image: string;
      packs: number;
    }
  | {
      id: string;
      kind: "MERCH";
      sku: string;
      itemName: string;
      itemSize: string;
      quantity: number;
      amount: number;
      image: string;
    };

type AppState = {
  user: CurrentUser | null;
  setUser: (u: CurrentUser | null) => void;

  activePoolCode: string | null;
  setActivePoolCode: (code: string | null) => void;

  cartItems: CartItem[];
  addCartItem: (item: CartItem) => void;
  removeCartItem: (itemId: string) => void;
  clearCart: () => void;

  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  authLoading: boolean;
};

const AppContext = createContext<AppState | undefined>(undefined);

const LS_POOL = "mundial_activePool";
const LS_CART = "mundial_cart";

function validateStoredCartItem(item: CartItem): boolean {
  if (!item?.id || !Number.isFinite(item.amount) || item.amount < 1000) return false;
  if (!Number.isInteger(item.quantity) || item.quantity < 1) return false;

  if (item.kind === "TICKET") {
    return Boolean(item.matchId && item.title.trim() && item.subtitle.trim() && item.quantity <= 6);
  }

  if (item.kind === "COINS") {
    return Boolean(
      item.title.trim() &&
        item.subtitle.trim() &&
        Number.isInteger(item.coins) &&
        item.coins > 0 &&
        item.quantity <= 10
    );
  }

  if (item.kind === "PACK") {
    return Boolean(
      item.sku.trim() &&
        item.title.trim() &&
        item.subtitle.trim() &&
        Number.isInteger(item.packs) &&
        item.packs > 0 &&
        item.quantity <= 10
    );
  }

  return Boolean(
    item.sku.trim() &&
      item.itemName.trim() &&
      item.itemSize.trim() &&
      item.quantity <= 10
  );
}

function mergeCartEntry(existing: CartItem, nextItem: CartItem): CartItem {
  const maxQuantity = existing.kind === "TICKET" ? 6 : 10;
  const nextQuantity = Math.min(maxQuantity, existing.quantity + nextItem.quantity);
  const unitAmount = existing.amount / existing.quantity;

  return {
    ...existing,
    quantity: nextQuantity,
    amount: Math.round(unitAmount * nextQuantity),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [activePoolCode, setActivePoolCode] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
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
    const rawCart = localStorage.getItem(LS_CART);
    if (rawCart) {
      try {
        const parsed = JSON.parse(rawCart) as CartItem[];
        setCartItems(parsed.filter(validateStoredCartItem));
      } catch {
        localStorage.removeItem(LS_CART);
      }
    }
  }, []);

  useEffect(() => {
    if (activePoolCode) {
      localStorage.setItem(LS_POOL, activePoolCode);
    } else {
      localStorage.removeItem(LS_POOL);
    }
  }, [activePoolCode]);

  useEffect(() => {
    localStorage.setItem(LS_CART, JSON.stringify(cartItems));
  }, [cartItems]);

  const addCartItem = useCallback((item: CartItem) => {
    if (!validateStoredCartItem(item)) return;

    setCartItems((current) => {
      const existing = current.find((entry) =>
        entry.kind === "TICKET" && item.kind === "TICKET"
          ? entry.matchId === item.matchId
          : entry.kind === "COINS" && item.kind === "COINS"
          ? entry.coins === item.coins
          : entry.kind === "PACK" && item.kind === "PACK"
          ? entry.sku === item.sku
          : entry.kind === "MERCH" && item.kind === "MERCH"
          ? entry.sku === item.sku && entry.itemSize === item.itemSize
          : false
      );

      if (!existing) return [...current, item];

      return current.map((entry) => (entry.id === existing.id ? mergeCartEntry(existing, item) : entry));
    });
  }, []);

  const removeCartItem = useCallback((itemId: string) => {
    setCartItems((current) => current.filter((item) => item.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    const res = await loginApi(usernameOrEmail, password);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    await logoutApi(user);
    setUser(null);
    setActivePoolCode(null);
    setCartItems([]);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      activePoolCode,
      setActivePoolCode,
      cartItems,
      addCartItem,
      removeCartItem,
      clearCart,
      login,
      logout,
      authLoading,
    }),
    [user, activePoolCode, cartItems, addCartItem, removeCartItem, clearCart, login, logout, authLoading]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
