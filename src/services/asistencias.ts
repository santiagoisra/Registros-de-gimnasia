import { supabase } from '@/lib/supabase'
import type { Asistencia } from '@/types'

// Mapeo entre los nombres del modelo y la base de datos
function mapAsistenciaFromDB(dbAsistencia: Record<string, unknown>): Asistencia {
  return {
    id: dbAsistencia.id,
    alumnoId: dbAsistencia.alumno_id,
    fecha: dbAsistencia.fecha,
    ubicacion: dbAsistencia.sede,
  }
}

export async function getAsistencias() {
  const { data, error } = await supabase
    .from('asistencias')
    .select('*')
    .order('fecha', { ascending: false })

  if (error) throw error
  return data ? data.map(mapAsistenciaFromDB) : []
}

export async function getAsistenciasPorFecha(fecha: string) {
  const { data, error } = await supabase
    .from('asistencias')
    .select('*')
    .eq('fecha', fecha)
    .order('fecha', { ascending: false })

  if (error) throw error
  return data ? data.map(mapAsistenciaFromDB) : []
}

export async function createAsistencia(asistencia: Omit<Asistencia, 'id'>) {
  // Mapear los campos del modelo al formato de la base de datos
  const dbAsistencia: Record<string, unknown> = {
    alumno_id: asistencia.alumnoId,
    fecha: asistencia.fecha,
    sede: asistencia.ubicacion,
  }
  const { data, error } = await supabase
    .from('asistencias')
    .insert([dbAsistencia])
    .select()
    .single()

  if (error) throw error
  return data ? mapAsistenciaFromDB(data) : null
}

export async function createAsistenciasBulk(asistencias: Omit<Asistencia, 'id'>[]) {
  const dbAsistencias = asistencias.map(a => ({
    alumno_id: a.alumnoId,
    fecha: a.fecha,
    sede: a.ubicacion,
  }))
  const { data, error } = await supabase
    .from('asistencias')
    .insert(dbAsistencias)
    .select()

  if (error) throw error
  return data ? data.map(mapAsistenciaFromDB) : []
}

export async function deleteAsistencia(id: string) {
  const { error } = await supabase
    .from('asistencias')
    .delete()
    .eq('id', id)

  if (error) throw error
}