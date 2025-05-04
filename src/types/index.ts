export type Ubicacion = 'Plaza Arenales' | 'Plaza Terán';

export type MetodoPago = 'Efectivo' | 'Transferencia' | 'Mercado Pago';

export type EstadoPago = 'al_dia' | 'pendiente' | 'atrasado';

export interface Alumno {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asistencia {
  id: string;
  alumno_id: string;
  fecha: string;
  sede: 'Plaza Arenales' | 'Plaza Terán';
  estado: 'presente' | 'ausente';
  notas?: string;
  created_at: string;
  updated_at: string;
  alumno?: Alumno;
}

export interface Pago {
  id: string;
  alumnoId: string;
  fecha: string;
  monto: number;
  metodoPago: MetodoPago;
  periodoDesde: string;
  periodoHasta: string;
  notas?: string;
  estado?: 'Pagado' | 'Pendiente';
  mes: number;
  anio: number;
}

export interface HistorialPrecios {
  id: string;
  alumnoId: string;
  precio: number;
  fechaDesde: string;
  fechaHasta?: string;
}

export interface Nota {
  id: string;
  alumnoId: string;
  fecha: string;
  contenido: string;
  tipo: 'Ausencia' | 'Lesión' | 'Vacaciones' | 'General' | 'Evaluación' | 'Progreso' | 'Competencia';
  visibleEnReporte?: boolean;
  categoria?: 'Técnica' | 'Física' | 'Actitudinal' | 'Competitiva';
  calificacion?: number;
  objetivos?: string[];
  seguimiento?: {
    fechaRevision: string;
    estado: 'Pendiente' | 'En Progreso' | 'Completado';
    comentarios?: string;
  }[];
  adjuntos?: {
    url: string;
    tipo: 'imagen' | 'video' | 'documento';
    descripcion?: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface HistorialPrecio {
  id: string;
  servicio: string;
  precio: number;
  fechaInicio: string;
  fechaFin: string | null;
  notas?: string;
  activo: boolean;
  moneda?: 'ARS' | 'USD';
  tipoServicio: 'Mensual' | 'Por Clase' | 'Especial' | 'Competencia';
  descuento?: {
    porcentaje: number;
    motivo: string;
    validoHasta?: string;
  };
  incrementoProgramado?: {
    fecha: string;
    porcentaje: number;
    notificado: boolean;
  }[];
  historialCambios?: {
    fecha: string;
    precioAnterior: number;
    precioNuevo: number;
    motivo?: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EstadisticasPrecios {
  promedio: number;
  minimo: number;
  maximo: number;
  variacionPorcentual: number;
  tendenciaMensual: {
    mes: string;
    promedio: number;
    cantidadCambios: number;
  }[];
  proyeccionProximoMes?: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface OrderParams {
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface DateRangeParams {
  fechaDesde?: string;
  fechaHasta?: string;
} 