// src/App.tsx
import type { ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import FullPageLoader from "./components/FullPageLoader";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Matches from "./pages/Matches";
import OperatorPanel from "./pages/Admin";
import ProfilePage from "./pages/Profile";
import Pools from "./pages/Pools";
import PollDetail from "./pages/PollDetail";
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

function OperatorOnly({ children }: GuardProps) {
  const { user, authLoading } = useApp();

  if (authLoading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "operator") return <Navigate to="/" replace />;

  return <>{children}</>;
}

function SupportArea({ children }: GuardProps) {
  const { user, authLoading } = useApp();

  if (authLoading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "operator") return <Navigate to="/operator" replace />;

  return <>{children}</>;
}

function UserOnly({ children }: GuardProps) {
  const { user, authLoading } = useApp();

  if (authLoading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "operator") return <Navigate to="/operator" replace />;
  if (user.role === "support") return <Navigate to="/support" replace />;

  return <>{children}</>;
}

function UserOrOperatorOnly({ children }: GuardProps) {
  const { user, authLoading } = useApp();

  if (authLoading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "support") return <Navigate to="/support" replace />;

  return <>{children}</>;
}

function IndexRedirect() {
  const { user, authLoading } = useApp();

  if (authLoading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "operator") return <Navigate to="/operator" replace />;
  if (user.role === "support") return <Navigate to="/support" replace />;

  return <Navigate to="/home" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<Layout />}>
        <Route index element={<IndexRedirect />} />

        <Route path="home" element={<UserOnly><Home /></UserOnly>} />
        <Route path="matches" element={<UserOnly><Matches /></UserOnly>} />
        <Route path="profile" element={<UserOnly><ProfilePage /></UserOnly>} />
        <Route path="pools" element={<UserOnly><Pools /></UserOnly>} />
        <Route path="pools/:code" element={<UserOnly><PollDetail /></UserOnly>} />
        <Route path="album" element={<UserOnly><Album /></UserOnly>} />
        <Route path="friends" element={<UserOnly><Friends /></UserOnly>} />
        <Route path="marketplace" element={<UserOnly><Marketplace /></UserOnly>} />
        <Route path="trades" element={<UserOnly><Trades /></UserOnly>} />
        <Route path="notifications" element={<UserOrOperatorOnly><Notifications /></UserOrOperatorOnly>} />
        <Route path="maps" element={<UserOnly><Maps /></UserOnly>} />
        <Route path="checkout" element={<UserOnly><Checkout /></UserOnly>} />
        <Route path="tickets" element={<UserOnly><Tickets /></UserOnly>} />
        <Route path="payments" element={<UserOnly><Payments /></UserOnly>} />
        <Route path="store" element={<UserOnly><Store /></UserOnly>} />
        <Route path="cart" element={<UserOnly><Cart /></UserOnly>} />

        <Route path="operator" element={<OperatorOnly><OperatorPanel /></OperatorOnly>} />
        <Route path="admin" element={<Navigate to="/operator" replace />} />
        <Route path="support" element={<SupportArea><Support /></SupportArea>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
