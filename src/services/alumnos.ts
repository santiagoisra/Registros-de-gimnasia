import { supabase } from '@/lib/supabase'
import type { Alumno } from '@/types'

export async function getAlumnos() {
  const { data, error } = await supabase
    .from('alumnos')
    .select('*')
    .order('nombre')

  if (error) throw error
  return data
}

export async function getAlumno(id: string) {
  const { data, error } = await supabase
    .from('alumnos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createAlumno(alumno: Omit<Alumno, 'id' | 'fechaAlta'>) {
  const { data, error } = await supabase
    .from('alumnos')
    .insert([alumno])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateAlumno(id: string, alumno: Partial<Alumno>) {
  const { data, error } = await supabase
    .from('alumnos')
    .update(alumno)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAlumno(id: string) {
  const { error } = await supabase
    .from('alumnos')
    .delete()
    .eq('id', id)

  if (error) throw error
} 