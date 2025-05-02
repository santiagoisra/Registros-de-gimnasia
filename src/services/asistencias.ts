import { supabase } from '@/lib/supabase'
import type { Asistencia } from '@/types'

export async function getAsistencias() {
  const { data, error } = await supabase
    .from('asistencias')
    .select(`
      *,
      alumnos (
        nombre
      )
    `)
    .order('fecha', { ascending: false })

  if (error) throw error
  return data
}

export async function getAsistenciasPorFecha(fecha: string) {
  const { data, error } = await supabase
    .from('asistencias')
    .select(`
      *,
      alumnos (
        nombre
      )
    `)
    .eq('fecha::date', fecha)
    .order('fecha', { ascending: false })

  if (error) throw error
  return data
}

export async function createAsistencia(asistencia: Omit<Asistencia, 'id'>) {
  const { data, error } = await supabase
    .from('asistencias')
    .insert([asistencia])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createAsistenciasBulk(asistencias: Omit<Asistencia, 'id'>[]) {
  const { data, error } = await supabase
    .from('asistencias')
    .insert(asistencias)
    .select()

  if (error) throw error
  return data
}

export async function deleteAsistencia(id: string) {
  const { error } = await supabase
    .from('asistencias')
    .delete()
    .eq('id', id)

  if (error) throw error
} 