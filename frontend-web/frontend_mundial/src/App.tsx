import type { ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { messaging } from "./firebaseConfig";
import Layout from "./components/Layout";
import FullPageLoader from "./components/FullPageLoader";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Matches from "./pages/Matches";
import Admin from "./pages/Admin";
import ProfilePage from "./pages/Profile";
import Pools from "./pages/Pools";
import PollInfo from "./pages/PollInfo";
import PollPronostico from "./pages/PollPronostico";
import Album from "./pages/Album";
import Friends from "./pages/Friends";
import Marketplace from "./pages/Marketplace";
import Trades from "./pages/Trades";
import Notifications from "./pages/Notifications";
import Support from "./pages/Support";
import Maps from "./pages/Maps";
import Checkout from "./pages/Checkout";
import Tickets from "./pages/Tickets";
import Payments from "./pages/Payments";
import Store from "./pages/Store";
import Cart from "./pages/Cart";
import { useApp } from "./context/AppContext";

type GuardProps = { children: ReactNode };

function AdminOnly({ children }: GuardProps) {
  const { user, authLoading } = useApp();
  if (authLoading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}

function SupportArea({ children }: GuardProps) {
  const { user, authLoading } = useApp();
  if (authLoading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function UserOnly({ children }: GuardProps) {
  const { user, authLoading } = useApp();
  if (authLoading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "support") return <Navigate to="/support" replace />;
  return <>{children}</>;
}

function IndexRedirect() {
  const { user, authLoading } = useApp();
  if (authLoading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "support") return <Navigate to="/support" replace />;
  return <Navigate to="/home" replace />;
}

export default function App() {
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      const { title, body } = payload.notification ?? {};
      if (Notification.permission === "granted") {
        new Notification(title ?? "Mundial 2026", {
          body: body ?? "",
          icon: "/vite.svg",
        });
      }
    });
    return () => unsubscribe();
  }, []);
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<Layout />}>
        <Route index element={<IndexRedirect />} />

        <Route path="home" element={<UserOnly><Home /></UserOnly>} />
        <Route path="matches" element={<UserOnly><Matches /></UserOnly>} />
        <Route path="profile" element={<UserOnly><ProfilePage /></UserOnly>} />

        {/* Pollas */}
        <Route path="pools" element={<UserOnly><Pools /></UserOnly>} />
        <Route path="pools/:id/info" element={<UserOnly><PollInfo /></UserOnly>} />
        <Route path="pools/:id/pronostico" element={<UserOnly><PollPronostico /></UserOnly>} />

        <Route path="album" element={<UserOnly><Album /></UserOnly>} />
        <Route path="friends" element={<UserOnly><Friends /></UserOnly>} />
        <Route path="marketplace" element={<UserOnly><Marketplace /></UserOnly>} />
        <Route path="trades" element={<UserOnly><Trades /></UserOnly>} />
        <Route path="notifications" element={<UserOnly><Notifications /></UserOnly>} />
        <Route path="maps" element={<UserOnly><Maps /></UserOnly>} />
        <Route path="checkout" element={<UserOnly><Checkout /></UserOnly>} />
        <Route path="tickets" element={<UserOnly><Tickets /></UserOnly>} />
        <Route path="payments" element={<UserOnly><Payments /></UserOnly>} />
<Route path="store" element={<UserOnly><Store /></UserOnly>} />
<Route path="cart" element={<UserOnly><Cart /></UserOnly>} />
        <Route path="admin" element={<AdminOnly><Admin /></AdminOnly>} />
        <Route path="support" element={<SupportArea><Support /></SupportArea>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}