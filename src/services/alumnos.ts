import { supabase } from '@/lib/supabase'
import type { Alumno } from '@/types'

// Mapeo entre los nombres del modelo y la base de datos
function mapAlumnoFromDB(dbAlumno: Record<string, unknown>): Alumno {
  return {
    id: dbAlumno.id as string,
    nombre: dbAlumno.nombre as string,
    email: dbAlumno.email as string | undefined,
    telefono: dbAlumno.telefono as string | undefined,
    fechaAlta: dbAlumno.created_at as string,
    activo: dbAlumno.activo as boolean,
    notas: dbAlumno.notas as string | undefined, // si existe
    precioMensual: dbAlumno.precio_mensual as number, // si existe
    alertasActivas: dbAlumno.alertas_activas as boolean | undefined,
    fechaUltimaAsistencia: dbAlumno.fecha_ultima_asistencia as string | undefined,
    diasConsecutivosAsistencia: dbAlumno.dias_consecutivos_asistencia as number | undefined,
    estadoPago: dbAlumno.estado_pago as Alumno['estadoPago'],
    // sede: dbAlumno.sede // Descomentar si se agrega al modelo Alumno del frontend
  }
}

export async function getAlumnos() {
  const { data, error } = await supabase
    .from('alumnos')
    .select('*')
    .order('nombre')

  if (error) throw error
  return data ? data.map(mapAlumnoFromDB) : []
}

export async function getAlumno(id: string) {
  const { data, error } = await supabase
    .from('alumnos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data ? mapAlumnoFromDB(data) : null
}

export async function createAlumno(alumno: Omit<Alumno, 'id' | 'fechaAlta'>) {
  // Mapear los campos del modelo al formato de la base de datos
  const dbAlumno: Record<string, unknown> = {
    nombre: alumno.nombre,
    email: alumno.email,
    telefono: alumno.telefono,
    activo: alumno.activo,
    notas: alumno.notas,
    precio_mensual: alumno.precioMensual,
    alertas_activas: alumno.alertasActivas,
    fecha_ultima_asistencia: alumno.fechaUltimaAsistencia,
    dias_consecutivos_asistencia: alumno.diasConsecutivosAsistencia,
    estado_pago: alumno.estadoPago,
    // sede: alumno.sede // Descomentar si se agrega al modelo Alumno del frontend
  }
  const { data, error } = await supabase
    .from('alumnos')
    .insert([dbAlumno])
    .select()
    .single()

  if (error) throw error
  return data ? mapAlumnoFromDB(data) : null
}

export async function updateAlumno(id: string, alumno: Partial<Alumno>) {
  const dbAlumno: Record<string, unknown> = {
    nombre: alumno.nombre,
    email: alumno.email,
    telefono: alumno.telefono,
    activo: alumno.activo,
    notas: alumno.notas,
    precio_mensual: alumno.precioMensual,
    alertas_activas: alumno.alertasActivas,
    fecha_ultima_asistencia: alumno.fechaUltimaAsistencia,
    dias_consecutivos_asistencia: alumno.diasConsecutivosAsistencia,
    estado_pago: alumno.estadoPago,
    // sede: alumno.sede // Descomentar si se agrega al modelo Alumno del frontend
  }
  const { data, error } = await supabase
    .from('alumnos')
    .update(dbAlumno)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data ? mapAlumnoFromDB(data) : null
}

export async function deleteAlumno(id: string) {
  const { error } = await supabase
    .from('alumnos')
    .update({ activo: false })
    .eq('id', id)

  if (error) throw error
}