import { supabase } from '@/lib/supabase'
import type { HistorialPrecios } from '@/types'

function mapHistorialPrecioFromDB(db: Record<string, any>): HistorialPrecios {
  return {
    id: db.id,
    alumnoId: db.alumno_id,
    precio: db.precio,
    fechaDesde: db.fecha_desde,
    fechaHasta: db.fecha_hasta,
  }
}

export async function getHistorialPreciosPorAlumno(alumnoId: string) {
  const { data, error } = await supabase
    .from('historial_precios')
    .select('*')
    .eq('alumno_id', alumnoId)
    .order('fecha_desde', { ascending: false })

  if (error) throw error
  return data ? data.map(mapHistorialPrecioFromDB) : []
}

export async function createHistorialPrecio(historial: Omit<HistorialPrecios, 'id'>) {
  const dbHistorial: Record<string, any> = {
    alumno_id: historial.alumnoId,
    precio: historial.precio,
    fecha_desde: historial.fechaDesde,
    fecha_hasta: historial.fechaHasta,
  }
  const { data, error } = await supabase
    .from('historial_precios')
    .insert([dbHistorial])
    .select()
    .single()

  if (error) throw error
  return data ? mapHistorialPrecioFromDB(data) : null
}

export async function updateHistorialPrecio(id: string, historial: Partial<HistorialPrecios>) {
  const dbHistorial: Record<string, any> = {
    precio: historial.precio,
    fecha_desde: historial.fechaDesde,
    fecha_hasta: historial.fechaHasta,
  }
  const { data, error } = await supabase
    .from('historial_precios')
    .update(dbHistorial)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data ? mapHistorialPrecioFromDB(data) : null
}

export async function deleteHistorialPrecio(id: string) {
  const { error } = await supabase
    .from('historial_precios')
    .delete()
    .eq('id', id)

  if (error) throw error
} 