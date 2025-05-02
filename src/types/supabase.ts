export type Alumno = {
  id: string
  created_at: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  sede: 'Plaza Arenales' | 'Plaza Terán'
  activo: boolean
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
    }
  }
} 