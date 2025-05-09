export type Ubicacion = 'Plaza Arenales' | 'Plaza Terán';

export type MetodoPago = 'Efectivo' | 'Transferencia' | 'Mercado Pago';

export type EstadoPago = 'al_dia' | 'pendiente' | 'atrasado';

export type AlertType = 'pago' | 'asistencia' | 'general'

export interface AlertConfig {
  type: AlertType
  enabled: boolean
  threshold?: number // Para alertas de asistencia (días sin asistir)
  reminderDays?: number // Para alertas de pago (días antes del vencimiento)
}

/**
 * Modelo extendido de Alumno para frontend.
 * Incluye todos los campos de la base (ver src/types/supabase.ts) y campos adicionales para UI/lógica.
 * - Los campos con snake_case provienen de la base.
 * - Los campos camelCase son agregados o mapeados para frontend.
 */
export interface Alumno {
  /** ID único (base) */
  id: string;
  /** Nombre (base) */
  nombre: string;
  /** Apellido (base) */
  apellido: string;
  /** Fecha de nacimiento (extendido/UI) */
  fechaNacimiento?: string;
  /** Dirección (extendido/UI) */
  direccion?: string;
  /** Teléfono (base) */
  telefono: string;
  /** Email (base) */
  email: string;
  /** Fecha de alta (base: created_at) */
  createdAt: string;
  /** Fecha de última actualización (base: updated_at) */
  updatedAt: string;
  /** Estado de actividad (base) */
  activo: boolean;
  /** Alertas activas (base) */
  alertasActivas: boolean;
  /** Fecha última asistencia (base) */
  fechaUltimaAsistencia: string;
  /** Días consecutivos de asistencia (base) */
  diasConsecutivosAsistencia: number;
  /** Estado de pago (base) */
  estadoPago: EstadoPago;
  sede: 'Plaza Arenales' | 'Plaza Terán';
  precioMensual: number;
  notas: string;
  alertConfig?: AlertConfig[];
}

/**
 * Modelo extendido de Asistencia para frontend.
 * Incluye todos los campos de la base y relación con Alumno.
 */
export interface Asistencia {
  id: string;
  alumno_id: string;
  fecha: string;
  sede: Ubicacion;
  estado: 'presente' | 'ausente';
  notas?: string;
  created_at: string;
  updated_at: string;
  /** Relación: datos completos del alumno (extendido/UI) */
  alumno?: Alumno;
}

/**
 * Modelo extendido de Pago para frontend.
 * Incluye todos los campos de la base y campos adicionales para UI.
 */
export interface Pago {
  id: string;
  alumnoId: string; // mapeo de alumno_id
  fecha: string; // mapeo de fecha_pago
  monto: number;
  metodoPago: MetodoPago; // mapeo de metodo_pago
  periodoDesde: string;
  periodoHasta: string;
  notas?: string;
  estado?: 'Pagado' | 'Pendiente';
  mes: number;
  anio: number;
  createdAt?: string; // extendido/UI
  updatedAt?: string; // extendido/UI
}

export interface HistorialPrecios {
  id: string;
  alumnoId: string;
  precio: number;
  fechaDesde: string;
  fechaHasta?: string;
}

/**
 * Modelo extendido de Nota para frontend.
 * Incluye todos los campos de la base y campos adicionales para UI.
 */
export interface Nota {
  id: string;
  alumnoId: string; // mapeo de alumno_id
  fecha: string;
  contenido: string;
  tipo: 'Ausencia' | 'Lesión' | 'Vacaciones' | 'General' | 'Evaluación' | 'Progreso' | 'Competencia';
  visibleEnReporte?: boolean; // mapeo de visible_en_reporte
  categoria?: 'Técnica' | 'Física' | 'Actitudinal' | 'Competitiva'; // extendido/UI
  calificacion?: number; // extendido/UI
  objetivos?: string[]; // extendido/UI
  seguimiento?: {
    fechaRevision: string;
    estado: 'Pendiente' | 'En Progreso' | 'Completado';
    comentarios?: string;
  }[]; // extendido/UI
  adjuntos?: {
    url: string;
    tipo: 'imagen' | 'video' | 'documento';
    descripcion?: string;
  }[]; // extendido/UI
  createdAt: string; // mapeo de created_at
  updatedAt: string; // mapeo de updated_at
}

/**
 * Modelo extendido de HistorialPrecio para frontend.
 * Incluye todos los campos de la base y campos adicionales para UI.
 */
export interface HistorialPrecio {
  id: string;
  alumnoId: string; // mapeo de alumno_id
  precio: number;
  fechaDesde: string; // mapeo de fecha_desde
  fechaHasta: string; // mapeo de fecha_hasta
  servicio: 'Clases' | 'Competencia' | 'Equipamiento' | 'Otro';
  tipoServicio: 'Individual' | 'Grupal' | 'Personalizado' | 'Evento' | 'Material' | 'Otro'; // mapeo de tipo_servicio
  moneda: 'ARS' | 'USD' | 'EUR';
  notas?: string;
  createdAt: string; // mapeo de created_at
  updatedAt: string; // mapeo de updated_at
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