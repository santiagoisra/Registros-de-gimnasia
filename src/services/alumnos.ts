import { supabase } from '@/lib/supabase'
import type { Alumno } from '@/types'

// Mapeo entre los nombres del modelo y la base de datos
function mapAlumnoFromDB(dbAlumno: Record<string, unknown>): Alumno {
  return {
    id: dbAlumno.id as string,
    nombre: dbAlumno.nombre as string,
    apellido: dbAlumno.apellido as string | undefined,
    sede: dbAlumno.sede as Alumno['sede'],
    email: dbAlumno.email as string | undefined,
    telefono: dbAlumno.telefono as string | undefined,
    fechaAlta: dbAlumno.created_at as string,
    activo: dbAlumno.activo as boolean,
    notas: dbAlumno.notas as string | undefined,
    precioMensual: dbAlumno.precio_mensual as number,
    alertasActivas: dbAlumno.alertas_activas as boolean | undefined,
    fechaUltimaAsistencia: dbAlumno.fecha_ultima_asistencia as string | undefined,
    diasConsecutivosAsistencia: dbAlumno.dias_consecutivos_asistencia as number | undefined,
    estadoPago: dbAlumno.estado_pago as Alumno['estadoPago'],
  }
}

// Mapeo del modelo a la base de datos
function mapAlumnoToDB(alumno: Partial<Alumno>): Record<string, unknown> {
  return {
    nombre: alumno.nombre,
    apellido: alumno.apellido,
    sede: alumno.sede,
    email: alumno.email,
    telefono: alumno.telefono,
    activo: alumno.activo,
    notas: alumno.notas,
    precio_mensual: alumno.precioMensual,
    alertas_activas: alumno.alertasActivas,
    fecha_ultima_asistencia: alumno.fechaUltimaAsistencia,
    dias_consecutivos_asistencia: alumno.diasConsecutivosAsistencia,
    estado_pago: alumno.estadoPago,
  }
}

export async function getAlumnos(): Promise<Alumno[]> {
  const { data, error } = await supabase
    .from('alumnos')
    .select('*')
    .order('apellido', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export async function getAlumnosPorSede(sede: Alumno['sede']) {
  const { data, error } = await supabase
    .from('alumnos')
    .select('*')
    .eq('sede', sede)
    .order('nombre')

  if (error) throw error
  return data ? data.map(mapAlumnoFromDB) : []
}

export async function getAlumnosActivos() {
  const { data, error } = await supabase
    .from('alumnos')
    .select('*')
    .eq('activo', true)
    .order('nombre')

  if (error) throw error
  return data ? data.map(mapAlumnoFromDB) : []
}

export async function getAlumnoById(id: string): Promise<Alumno | null> {
  const { data, error } = await supabase
    .from('alumnos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function createAlumno(alumno: Omit<Alumno, 'id' | 'createdAt' | 'updatedAt'>): Promise<Alumno> {
  const { data, error } = await supabase
    .from('alumnos')
    .insert([alumno])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateAlumno(id: string, alumno: Partial<Omit<Alumno, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Alumno> {
  const { data, error } = await supabase
    .from('alumnos')
    .update(alumno)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function deleteAlumno(id: string): Promise<void> {
  const { error } = await supabase
    .from('alumnos')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function actualizarEstadoPago(id: string, estadoPago: Alumno['estadoPago']) {
  const { error } = await supabase
    .from('alumnos')
    .update({ estado_pago: estadoPago })
    .eq('id', id)

  if (error) throw error
}

export async function actualizarAsistencia(id: string, fecha: string) {
  const { error } = await supabase
    .from('alumnos')
    .update({
      fecha_ultima_asistencia: fecha,
      dias_consecutivos_asistencia: supabase.sql`dias_consecutivos_asistencia + 1`
    })
    .eq('id', id)

  if (error) throw error
}

export async function resetearAsistenciasConsecutivas(id: string) {
  const { error } = await supabase
    .from('alumnos')
    .update({ dias_consecutivos_asistencia: 0 })
    .eq('id', id)

  if (error) throw error
}