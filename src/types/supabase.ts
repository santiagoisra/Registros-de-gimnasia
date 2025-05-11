/**
 * Tipos generados para reflejar la estructura real de la base de datos en Supabase.
 * No incluir campos extendidos de frontend ni lógica de UI.
 * Usar estos tipos como fuente de verdad para los servicios y queries directos a la base.
 */

/**
 * Modelo de Alumno según Supabase
 */
export interface Alumno {
  id: string
  created_at: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  sede: 'Plaza Arenales' | 'Plaza Terán'
  activo: boolean
  alertas_activas?: boolean
  fecha_ultima_asistencia?: string
  dias_consecutivos_asistencia?: number
  estado_pago?: 'al_dia' | 'pendiente' | 'atrasado'
  shift_id?: string // FK a shifts.id
  [key: string]: any
}

/**
 * Modelo de Asistencia según Supabase
 */
export interface Asistencia {
  id: string
  created_at: string
  updated_at: string
  alumno_id: string
  fecha: string
  sede: 'Plaza Arenales' | 'Plaza Terán'
  estado: 'presente' | 'ausente'
  alumno?: Alumno // relación opcional (join)
  [key: string]: any
}

/**
 * Modelo de Pago según Supabase
 */
export interface Pago {
  id: string
  created_at: string
  alumno_id: string
  monto: number
  fecha_pago: string
  mes: number
  año: number
  metodo_pago: 'Efectivo' | 'Transferencia' | 'Mercado Pago'
  estado: 'Pendiente' | 'Pagado'
  [key: string]: any
}

/**
 * Modelo de HistorialPrecios en la base de datos.
 * Refleja exactamente la estructura de la tabla historial_precios.
 */
export interface HistorialPrecios {
  id: string;
  alumno_id: string;
  precio: number;
  fecha_desde: string;
  fecha_hasta: string;
  servicio: 'Clases' | 'Competencia' | 'Equipamiento' | 'Otro';
  tipo_servicio: 'Individual' | 'Grupal' | 'Personalizado' | 'Evento' | 'Material' | 'Otro';
  activo: boolean;
  moneda: 'ARS' | 'USD' | 'EUR';
  descuento: string | null; // JSON string
  incremento_programado: string | null; // JSON string
  historial_cambios: string | null; // JSON string
  notas: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

/**
 * Modelo de Nota en la base de datos.
 * Refleja exactamente la estructura de la tabla notas.
 */
export interface Nota {
  id: string;
  alumno_id: string;
  fecha: string;
  contenido: string;
  tipo: 'Ausencia' | 'Lesión' | 'Vacaciones' | 'General' | 'Evaluación' | 'Progreso' | 'Competencia';
  visible_en_reporte: boolean;
  categoria: 'Técnica' | 'Física' | 'Actitudinal' | 'Competitiva' | null;
  calificacion: number | null;
  objetivos: string[] | null;
  seguimiento: string | null; // JSON string
  adjuntos: string | null; // JSON string
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

/**
 * Estadísticas de asistencia (usado en servicios)
 */
export type EstadisticasAsistencia = {
  total: number
  porMes: Record<number, number>
  porcentajePresente: number
  porcentajeAusente: number
  porSede: {
    'Plaza Arenales': number
    'Plaza Terán': number
  }
  tendencia: Array<{ fecha: string; presentes: number; ausentes: number }>
}

/**
 * Modelo de Shift según Supabase
 */
export interface Shift {
  id: string
  name: string
  start_time: string // formato HH:MM:SS
  end_time: string   // formato HH:MM:SS
  is_active: boolean
  created_at: string
  [key: string]: any
}

/**
 * Tipado de tablas para Supabase (usado por servicios generados)
 */
export type Database = {
  public: {
    Tables: {
      alumnos: {
        Row: Alumno
        Insert: Omit<Alumno, 'id' | 'created_at'>
        Update: Partial<Omit<Alumno, 'id' | 'created_at'>>
        Relationships: []
      }
      asistencias: {
        Row: Asistencia
        Insert: Omit<Asistencia, 'id' | 'created_at'>
        Update: Partial<Omit<Asistencia, 'id' | 'created_at'>>
        Relationships: []
      }
      pagos: {
        Row: Pago
        Insert: Omit<Pago, 'id' | 'created_at'>
        Update: Partial<Omit<Pago, 'id' | 'created_at'>>
        Relationships: []
      }
      historial_precios: {
        Row: HistorialPrecios
        Insert: Omit<HistorialPrecios, 'id'>
        Update: Partial<Omit<HistorialPrecios, 'id'>>
        Relationships: []
      }
      notas: {
        Row: Nota
        Insert: Omit<Nota, 'id'>
        Update: Partial<Omit<Nota, 'id'>>
        Relationships: []
      }
      shifts: {
        Row: Shift
        Insert: Omit<Shift, 'id' | 'created_at'>
        Update: Partial<Omit<Shift, 'id' | 'created_at'>>
        Relationships: []
      }
    }
  }
  Views: Record<string, never>
  Functions: Record<string, never>
}

/**
 * Tipo compatible con GenericSchema de Supabase para helpers genéricos
 */
export type SupabaseSchema = {
  Tables: Database['public']['Tables']
  Views: Record<string, never>
  Functions: Record<string, never>
} 