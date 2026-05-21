import { USE_MOCK } from "./config";
import { http } from "./http";
import { mockDb } from "./mockDb";

export interface ReportesStats {
  totalUsuarios: number;
  totalPartidos: number;
  totalTransacciones: number;
  usuariosActivosHoy: number;
}

export interface ProductoMasVendido {
  productoId: number;
  nombre: string;
  categoria: string;
  cantidadVendida: number;
  ingresoTotal: number;
}

export interface VentasPorCategoria {
  categoria: string;
  cantidadVendida: number;
  ingresoTotal: number;
}

export interface ReportesCompras {
  ingresoTotal: number;
  totalOrdenes: number;
  totalEntradasVendidas: number;
  productosMasVendidos: ProductoMasVendido[];
  ventasPorCategoria: VentasPorCategoria[];
}

export interface PartidoMasApostado {
  partidoId: number;
  local: string;
  visitante: string;
  ronda: string;
  totalPronosticos: number;
}

export interface PollaRanking {
  apuestaId: number;
  nombre: string;
  estado: string;
  totalParticipantes: number;
}

export interface IngresoMetodoPago {
  tipo: string;
  totalOrdenes: number;
  ingresoTotal: number;
}

export async function getEstadisticasGenerales(): Promise<ReportesStats> {
  if (USE_MOCK) {
    return mockDb.getEstadisticasGenerales();
  }
  return http.get<ReportesStats>("/api/reportes/estadisticas-generales");
}

export async function getReportesCompras(): Promise<ReportesCompras> {
  if (USE_MOCK) {
    return mockDb.getReportesCompras();
  }
  return http.get<ReportesCompras>("/api/reportes/compras");
}

export async function getPartidosMasApostados(): Promise<PartidoMasApostado[]> {
  return http.get<PartidoMasApostado[]>("/api/reportes/partidos-apostados");
}

export async function getPollaRanking(): Promise<PollaRanking[]> {
  return http.get<PollaRanking[]>("/api/reportes/pollas");
}

export async function getIngresosPorMetodoPago(): Promise<IngresoMetodoPago[]> {
  return http.get<IngresoMetodoPago[]>("/api/reportes/metodos-pago");
}
