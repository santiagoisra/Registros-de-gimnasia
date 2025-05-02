import { supabase } from '@/lib/supabase'
import type { Pago } from '@/types'

export async function getPagos() {
  const { data, error } = await supabase
    .from('pagos')
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

export async function getPagosPorAlumno(alumnoId: string) {
  const { data, error } = await supabase
    .from('pagos')
    .select('*')
    .eq('alumno_id', alumnoId)
    .order('fecha', { ascending: false })

  if (error) throw error
  return data
}

export async function createPago(pago: Omit<Pago, 'id'>) {
  const { data, error } = await supabase
    .from('pagos')
    .insert([pago])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePago(id: string, pago: Partial<Pago>) {
  const { data, error } = await supabase
    .from('pagos')
    .update(pago)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletePago(id: string) {
  const { error } = await supabase
    .from('pagos')
    .delete()
    .eq('id', id)

  if (error) throw error
} 