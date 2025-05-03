export type Alumno = {
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
}

export type Asistencia = {
  id: string
  created_at: string
  alumno_id: string
  fecha: string
  sede: 'Plaza Arenales' | 'Plaza Terán'
}

export type Pago = {
  id: string
  created_at: string
  alumno_id: string
  monto: number
  fecha_pago: string
  mes: number
  año: number
  metodo_pago: 'Efectivo' | 'Transferencia' | 'Mercado Pago'
  estado: 'Pendiente' | 'Pagado'
}

export type HistorialPrecios = {
  id: string
  alumno_id: string
  precio: number
  fecha_desde: string
  fecha_hasta?: string
}

export type Nota = {
  id: string
  alumno_id: string
  fecha: string
  contenido: string
  tipo: 'Ausencia' | 'Lesión' | 'Vacaciones' | 'General'
  visible_en_reporte?: boolean
}

export type Database = {
  public: {
    Tables: {
      alumnos: {
        Row: Alumno
        Insert: Omit<Alumno, 'id' | 'created_at'>
        Update: Partial<Omit<Alumno, 'id' | 'created_at'>>
      }
      asistencias: {
        Row: Asistencia
        Insert: Omit<Asistencia, 'id' | 'created_at'>
        Update: Partial<Omit<Asistencia, 'id' | 'created_at'>>
      }
      pagos: {
        Row: Pago
        Insert: Omit<Pago, 'id' | 'created_at'>
        Update: Partial<Omit<Pago, 'id' | 'created_at'>>
      }
      historial_precios: {
        Row: HistorialPrecios
        Insert: Omit<HistorialPrecios, 'id'>
        Update: Partial<Omit<HistorialPrecios, 'id'>>
      }
      notas: {
        Row: Nota
        Insert: Omit<Nota, 'id'>
        Update: Partial<Omit<Nota, 'id'>>
      }
    }
  }
} 