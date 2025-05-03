import { supabase } from '@/lib/supabase'
import type { Pago } from '@/types'

// Mapeo entre los nombres del modelo y la base de datos
function mapPagoFromDB(dbPago: Record<string, unknown>): Pago {
  return {
    id: dbPago.id as string,
    alumnoId: dbPago.alumno_id as string,
    fecha: dbPago.fecha_pago as string,
    monto: dbPago.monto as number,
    metodoPago: dbPago.metodo_pago as Pago['metodoPago'],
    periodoDesde: (dbPago.periodo_desde as string) || '', // si existe
    periodoHasta: (dbPago.periodo_hasta as string) || '', // si existe
    notas: dbPago.notas as string | undefined, // si existe
    estado: dbPago.estado as Pago['estado'],
  }
}

export async function getPagos() {
  const { data, error } = await supabase
    .from('pagos')
    .select('*')
    .order('fecha_pago', { ascending: false })

  if (error) throw error
  return data ? data.map(mapPagoFromDB) : []
}

export async function getPagosPorAlumno(alumnoId: string) {
  const { data, error } = await supabase
    .from('pagos')
    .select('*')
    .eq('alumno_id', alumnoId)
    .order('fecha_pago', { ascending: false })

  if (error) throw error
  return data ? data.map(mapPagoFromDB) : []
}

export async function createPago(pago: Omit<Pago, 'id'>) {
  // Mapear los campos del modelo al formato de la base de datos
  const dbPago: Record<string, unknown> = {
    alumno_id: pago.alumnoId,
    fecha_pago: pago.fecha,
    monto: pago.monto,
    metodo_pago: pago.metodoPago,
    periodo_desde: pago.periodoDesde,
    periodo_hasta: pago.periodoHasta,
    notas: pago.notas,
    estado: pago.estado,
  }
  const { data, error } = await supabase
    .from('pagos')
    .insert([dbPago])
    .select()
    .single()

  if (error) throw error
  return data ? mapPagoFromDB(data) : null
}

export async function updatePago(id: string, pago: Partial<Pago>) {
  const dbPago: Record<string, unknown> = {
    alumno_id: pago.alumnoId,
    fecha_pago: pago.fecha,
    monto: pago.monto,
    metodo_pago: pago.metodoPago,
    periodo_desde: pago.periodoDesde,
    periodo_hasta: pago.periodoHasta,
    notas: pago.notas,
    estado: pago.estado,
  }
  const { data, error } = await supabase
    .from('pagos')
    .update(dbPago)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data ? mapPagoFromDB(data) : null
}

export async function deletePago(id: string) {
  const { error } = await supabase
    .from('pagos')
    .delete()
    .eq('id', id)

  if (error) throw error
}