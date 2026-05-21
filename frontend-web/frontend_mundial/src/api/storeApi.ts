import { http } from "./http";

export interface ProductoResponse {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl: string;
  activo: boolean;
  categoriaNombre: string;
  codigoProducto: string | null;
  talla: string | null;
  equipo: string | null;
  bandera: string | null;
  destacado: boolean;
}

export interface CategoriaResponse {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface AgregarItemRequest {
  productoId: number;
  cantidad: number;
}

export interface ConfirmarOrdenRequest {
  metodoPagoId: number;
}

export interface ItemOrdenResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  productoImagenUrl: string;
  cantidad: number;
  precioUnitario: number;
}

export interface OrdenResponse {
  id: number;
  estado: string;
  total: number;
  fechaCreacion: string;
  fechaPago: string | null;
  paymentRef: string | null;
  metodoPagoNombre: string | null;
  items: ItemOrdenResponse[];
}

export async function getProductos(): Promise<ProductoResponse[]> {
  return http.get<ProductoResponse[]>("/api/productos");
}

export async function getProductosPorCategoria(categoriaId: number): Promise<ProductoResponse[]> {
  return http.get<ProductoResponse[]>(`/api/productos?categoriaId=${categoriaId}`);
}

export async function getProductoPorId(id: number): Promise<ProductoResponse> {
  return http.get<ProductoResponse>(`/api/productos/${id}`);
}

export async function getCategorias(): Promise<CategoriaResponse[]> {
  return http.get<CategoriaResponse[]>("/api/categorias");
}

export async function getCarrito(): Promise<OrdenResponse> {
  return http.get<OrdenResponse>("/api/ordenes/carrito");
}

export async function agregarAlCarrito(data: AgregarItemRequest): Promise<OrdenResponse> {
  return http.post<OrdenResponse>("/api/ordenes/carrito/agregar", data);
}

export async function eliminarItemCarrito(itemId: number): Promise<OrdenResponse> {
  return http.delete<OrdenResponse>(`/api/ordenes/carrito/item/${itemId}`);
}

export async function vaciarCarrito(): Promise<OrdenResponse> {
  return http.delete<OrdenResponse>("/api/ordenes/carrito");
}

export async function confirmarOrden(data: ConfirmarOrdenRequest): Promise<OrdenResponse> {
  return http.post<OrdenResponse>("/api/ordenes/carrito/confirmar", data);
}

export async function getHistorialOrdenes(): Promise<OrdenResponse[]> {
  return http.get<OrdenResponse[]>("/api/ordenes/historial");
}