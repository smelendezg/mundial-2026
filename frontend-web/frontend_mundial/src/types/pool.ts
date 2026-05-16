export interface PoolMember {
  usuarioId: number;
  nombre: string;
  puntos: number;
  posicionRanking?: number;
}

export interface Pool {
  id: number;
  name: string;       
  code: string;      
  estado: string;
  fechaCierre?: string;
  creadoPor: number;
  members: PoolMember[];
}