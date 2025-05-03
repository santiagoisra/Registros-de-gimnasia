import { supabase } from '@/lib/supabase'
import type { HistorialPrecios } from '@/types'

function mapHistorialPrecioFromDB(db: Record<string, unknown>): HistorialPrecios {
  return {
    id: db.id as string,
    alumnoId: db.alumno_id as string,
    precio: db.precio as number,
    fechaDesde: db.fecha_desde as string,
    fechaHasta: db.fecha_hasta as string | undefined,
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
  const dbHistorial: Record<string, unknown> = {
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
  const dbHistorial: Record<string, unknown> = {
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