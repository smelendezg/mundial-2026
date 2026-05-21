import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import PeopleIcon from "@mui/icons-material/People";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  getReportesCompras,
  getEstadisticasGenerales,
  getPartidosMasApostados,
  getPollaRanking,
  getIngresosPorMetodoPago,
} from "../api/reportsApi";
import type {
  ReportesCompras,
  ReportesStats,
  PartidoMasApostado,
  PollaRanking,
  IngresoMetodoPago,
} from "../api/reportsApi";

const PIE_COLORS = ["#2196f3", "#4caf50", "#ff9800", "#e91e63", "#9c27b0", "#00bcd4"];

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCOPShort(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

interface SummaryCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function SummaryCard({ label, value, icon, color }: SummaryCardProps) {
  return (
    <Card sx={{ borderTop: `4px solid ${color}` }}>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ color, fontSize: 40, display: "flex" }}>{icon}</Box>
        <Box>
          <Typography variant="body2" color="textSecondary">
            {label}
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        {children}
      </Typography>
      <Divider sx={{ mb: 3 }} />
    </>
  );
}

export default function Reports() {
  const [compras, setCompras] = useState<ReportesCompras | null>(null);
  const [stats, setStats] = useState<ReportesStats | null>(null);
  const [partidos, setPartidos] = useState<PartidoMasApostado[]>([]);
  const [pollas, setPollas] = useState<PollaRanking[]>([]);
  const [metodosPago, setMetodosPago] = useState<IngresoMetodoPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getReportesCompras(),
      getEstadisticasGenerales(),
      getPartidosMasApostados(),
      getPollaRanking(),
      getIngresosPorMetodoPago(),
    ])
      .then(([comprasData, statsData, partidosData, pollasData, metodosData]) => {
        setCompras(comprasData);
        setStats(statsData);
        setPartidos(partidosData);
        setPollas(pollasData);
        setMetodosPago(metodosData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <Alert severity="error">{error}</Alert>;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  const productosChartData = compras?.productosMasVendidos.map((p) => ({
    nombre: p.nombre.length > 14 ? p.nombre.slice(0, 14) + "…" : p.nombre,
    cantidad: p.cantidadVendida,
    ingreso: p.ingresoTotal,
  })) ?? [];

  const categoriasChartData = compras?.ventasPorCategoria.map((c) => ({
    name: c.categoria,
    value: c.cantidadVendida,
    ingreso: c.ingresoTotal,
  })) ?? [];

  const partidosChartData = partidos.map((p) => ({
    partido: `${p.local} vs ${p.visitante}`.length > 18
      ? `${p.local} vs ${p.visitante}`.slice(0, 18) + "…"
      : `${p.local} vs ${p.visitante}`,
    pronosticos: p.totalPronosticos,
    ronda: p.ronda,
  }));

  const metodosChartData = metodosPago.map((m) => ({
    name: m.tipo,
    value: m.ingresoTotal,
    ordenes: m.totalOrdenes,
  }));

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Reportes
      </Typography>
      <Typography variant="body1" color="textSecondary" mb={4}>
        Estadísticas generales, ventas, pollas y actividad del torneo.
      </Typography>

      {/* ── Estadísticas generales ── */}
      {stats && (
        <Box mb={5}>
          <SectionTitle>Estadísticas Generales</SectionTitle>
          <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            <SummaryCard
              label="Total Partidos"
              value={stats.totalPartidos.toLocaleString()}
              icon={<SportsSoccerIcon fontSize="inherit" />}
              color="#0277bd"
            />
            <SummaryCard
              label="Total Transacciones"
              value={stats.totalTransacciones.toLocaleString()}
              icon={<SwapHorizIcon fontSize="inherit" />}
              color="#558b2f"
            />
            <SummaryCard
              label="Usuarios Activos"
              value={stats.usuariosActivosHoy.toLocaleString()}
              icon={<PeopleIcon fontSize="inherit" />}
              color="#6a1b9a"
            />
          </Box>
        </Box>
      )}

      {/* ── Resumen de compras ── */}
      {compras && (
        <Box mb={5}>
          <SectionTitle>Resumen de Compras</SectionTitle>
          <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            <SummaryCard
              label="Ingreso Total"
              value={formatCOP(compras.ingresoTotal)}
              icon={<AttachMoneyIcon fontSize="inherit" />}
              color="#2e7d32"
            />
            <SummaryCard
              label="Total Órdenes"
              value={compras.totalOrdenes.toLocaleString()}
              icon={<ReceiptIcon fontSize="inherit" />}
              color="#1565c0"
            />
            <SummaryCard
              label="Entradas Vendidas"
              value={compras.totalEntradasVendidas.toLocaleString()}
              icon={<ConfirmationNumberIcon fontSize="inherit" />}
              color="#e65100"
            />
          </Box>
        </Box>
      )}

      {/* ── Productos y categorías ── */}
      {compras && (
        <Box mb={5}>
          <SectionTitle>Ventas por Producto y Categoría</SectionTitle>
          <Box sx={{ display: "grid", gap: 4, gridTemplateColumns: { xs: "1fr", lg: "1.5fr 1fr" } }}>

            {/* Barras: top productos */}
            <Box>
              <Typography variant="subtitle2" color="textSecondary" mb={2}>
                Top 5 productos más vendidos
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={productosChartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => v.toLocaleString()} />
                  <YAxis type="category" dataKey="nombre" width={110} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number, name: string) =>
                      name === "cantidad" ? [value.toLocaleString(), "Unidades"] : [formatCOP(value), "Ingreso"]
                    }
                  />
                  <Bar dataKey="cantidad" fill="#1565c0" radius={[0, 4, 4, 0]} name="cantidad" />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {/* Donut: categorías */}
            <Box>
              <Typography variant="subtitle2" color="textSecondary" mb={2}>
                Unidades vendidas por categoría
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={categoriasChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {categoriasChartData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [v.toLocaleString(), "Unidades"]} />
                  <Legend iconType="circle" iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Métodos de pago ── */}
      {metodosPago.length > 0 && (
        <Box mb={5}>
          <SectionTitle>Ingresos por Método de Pago</SectionTitle>
          <Box sx={{ display: "grid", gap: 4, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={metodosChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {metodosChartData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [formatCOP(v), "Ingreso"]} />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "grey.100" }}>
                    <TableCell>Método</TableCell>
                    <TableCell align="right">Órdenes</TableCell>
                    <TableCell align="right">Ingreso</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metodosPago.map((m, i) => (
                    <TableRow key={m.tipo} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box
                            sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }}
                          />
                          {m.tipo}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{m.totalOrdenes.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main" fontWeight="medium">
                          {formatCOP(m.ingresoTotal)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      )}

      {/* ── Partidos más apostados ── */}
      {partidos.length > 0 && (
        <Box mb={5}>
          <SectionTitle>Partidos Más Apostados</SectionTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={partidosChartData} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="partido"
                tick={{ fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(v: number) => [v.toLocaleString(), "Pronósticos"]}
                labelFormatter={(label, payload) => {
                  const ronda = payload?.[0]?.payload?.ronda;
                  return ronda ? `${label} · ${ronda}` : label;
                }}
              />
              <Bar dataKey="pronosticos" fill="#7b1fa2" radius={[4, 4, 0, 0]} name="Pronósticos" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}

      {/* ── Ranking de pollas ── */}
      {pollas.length > 0 && (
        <Box mb={5}>
          <SectionTitle>Ranking de Pollas por Participantes</SectionTitle>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "grey.100" }}>
                  <TableCell>#</TableCell>
                  <TableCell>Polla</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Participantes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pollas.map((p, i) => (
                  <TableRow key={p.apuestaId} hover>
                    <TableCell>
                      {i === 0 ? (
                        <EmojiEventsIcon sx={{ color: "warning.main", fontSize: 18, verticalAlign: "middle" }} />
                      ) : (
                        <Typography variant="body2" color="textSecondary">{i + 1}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">{p.nombre}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={p.estado}
                        size="small"
                        color={p.estado === "abierta" ? "success" : p.estado === "cerrada" ? "default" : "warning"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">{p.totalParticipantes}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}
