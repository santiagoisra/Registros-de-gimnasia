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
    mes: dbPago.mes as number,
    anio: dbPago.año as number,
  }
}

// Función para obtener todos los pagos con ordenamiento y paginación
export async function getPagos(options?: {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}) {
  const { page = 1, pageSize = 10, orderBy = 'fecha_pago', orderDirection = 'desc' } = options || {}
  const start = (page - 1) * pageSize
  const end = start + pageSize - 1

  try {
    const { data, error, count } = await supabase
      .from('pagos')
      .select('*', { count: 'exact' })
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .range(start, end)

    if (error) throw error

    return {
      pagos: data ? data.map(mapPagoFromDB) : [],
      total: count || 0,
      page,
      pageSize
    }
  } catch (error) {
    console.error('Error al obtener pagos:', error)
    return {
      pagos: [],
      total: 0,
      page,
      pageSize
    }
  }
}

// Función para obtener pagos por alumno con filtros
export async function getPagosPorAlumno(alumnoId: string, options?: {
  estado?: Pago['estado'];
  fechaDesde?: string;
  fechaHasta?: string;
}) {
  let query = supabase
    .from('pagos')
    .select('*')
    .eq('alumno_id', alumnoId)
    .order('fecha_pago', { ascending: false })

  if (options?.estado) {
    query = query.eq('estado', options.estado)
  }
  if (options?.fechaDesde) {
    query = query.gte('fecha_pago', options.fechaDesde)
  }
  if (options?.fechaHasta) {
    query = query.lte('fecha_pago', options.fechaHasta)
  }

  const { data, error } = await query

  if (error) throw error
  return data ? data.map(mapPagoFromDB) : []
}

// Función para obtener pagos por rango de fechas y estado
export async function getPagosPorFiltros(options: {
  estado?: Pago['estado'];
  fechaDesde?: string;
  fechaHasta?: string;
  metodoPago?: Pago['metodoPago'];
}) {
  let query = supabase
    .from('pagos')
    .select('*')
    .order('fecha_pago', { ascending: false })

  if (options.estado) {
    query = query.eq('estado', options.estado)
  }
  if (options.fechaDesde) {
    query = query.gte('fecha_pago', options.fechaDesde)
  }
  if (options.fechaHasta) {
    query = query.lte('fecha_pago', options.fechaHasta)
  }
  if (options.metodoPago) {
    query = query.eq('metodo_pago', options.metodoPago)
  }

  const { data, error } = await query

  if (error) throw error
  return data ? data.map(mapPagoFromDB) : []
}

// Función para obtener resumen de pagos por período
export async function getResumenPagosPorPeriodo(options: {
  fechaDesde: string;
  fechaHasta: string;
}) {
  const { data, error } = await supabase
    .from('pagos')
    .select('*')
    .gte('fecha_pago', options.fechaDesde)
    .lte('fecha_pago', options.fechaHasta)

  if (error) throw error

  const pagos = data ? data.map(mapPagoFromDB) : []
  return {
    totalRecaudado: pagos.reduce((sum, pago) => sum + pago.monto, 0),
    cantidadPagos: pagos.length,
    promedioMonto: pagos.length > 0 ? pagos.reduce((sum, pago) => sum + pago.monto, 0) / pagos.length : 0,
    porMetodoPago: pagos.reduce((acc, pago) => {
      acc[pago.metodoPago] = (acc[pago.metodoPago] || 0) + pago.monto
      return acc
    }, {} as Record<string, number>),
    porEstado: pagos.reduce((acc, pago) => {
      acc[pago.estado || 'Pendiente'] = (acc[pago.estado || 'Pendiente'] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

// Función para obtener pagos pendientes
export async function getPagosPendientes() {
  const { data, error } = await supabase
    .from('pagos')
    .select('*')
    .eq('estado', 'Pendiente')
    .order('fecha_pago', { ascending: false })

  if (error) throw error
  return data ? data.map(mapPagoFromDB) : []
}

// Función para crear un nuevo pago
export async function createPago(pago: Omit<Pago, 'id'>) {
  const dbPago: Record<string, unknown> = {
    alumno_id: pago.alumnoId,
    fecha_pago: pago.fecha,
    monto: pago.monto,
    metodo_pago: pago.metodoPago,
    periodo_desde: pago.periodoDesde,
    periodo_hasta: pago.periodoHasta,
    notas: pago.notas,
    estado: pago.estado,
    mes: pago.mes,
    año: pago.anio,
  }
  const { data, error } = await supabase
    .from('pagos')
    .insert([dbPago])
    .select()
    .single()

  if (error) throw error
  return data ? mapPagoFromDB(data) : null
}

// Función para actualizar un pago existente
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
    mes: pago.mes,
    año: pago.anio,
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

// Función para eliminar un pago
export async function deletePago(id: string) {
  const { error } = await supabase
    .from('pagos')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Función para crear múltiples pagos
export async function createPagosBulk(pagos: Omit<Pago, 'id'>[]) {
  const dbPagos = pagos.map(pago => ({
    alumno_id: pago.alumnoId,
    fecha_pago: pago.fecha,
    monto: pago.monto,
    metodo_pago: pago.metodoPago,
    periodo_desde: pago.periodoDesde,
    periodo_hasta: pago.periodoHasta,
    notas: pago.notas,
    estado: pago.estado,
    mes: pago.mes,
    año: pago.anio,
  }))
  const { data, error } = await supabase
    .from('pagos')
    .insert(dbPagos)
    .select()

  if (error) throw error
  return data ? data.map(mapPagoFromDB) : []
}

// Función para obtener estadísticas de pagos
export async function getEstadisticasPagos(options?: {
  fechaDesde?: string;
  fechaHasta?: string;
}) {
  let query = supabase.from('pagos').select('*')

  if (options?.fechaDesde) {
    query = query.gte('fecha_pago', options.fechaDesde)
  }
  if (options?.fechaHasta) {
    query = query.lte('fecha_pago', options.fechaHasta)
  }

  const { data, error } = await query

  if (error) throw error

  const pagos = data ? data.map(mapPagoFromDB) : []
  
  // Calcular estadísticas
  const totalRecaudado = pagos.reduce((sum, pago) => sum + pago.monto, 0)
  const pagosPorMes = pagos.reduce((acc, pago) => {
    const key = `${pago.anio}-${pago.mes.toString().padStart(2, '0')}`
    acc[key] = (acc[key] || 0) + pago.monto
    return acc
  }, {} as Record<string, number>)

  const pagosPorMetodo = pagos.reduce((acc, pago) => {
    acc[pago.metodoPago] = (acc[pago.metodoPago] || 0) + pago.monto
    return acc
  }, {} as Record<string, number>)

  const promedioMensual = Object.values(pagosPorMes).reduce((sum, monto) => sum + monto, 0) / 
    (Object.keys(pagosPorMes).length || 1)

  return {
    totalRecaudado,
    pagosPorMes,
    pagosPorMetodo,
    promedioMensual,
    cantidadPagos: pagos.length,
    montoPromedio: totalRecaudado / (pagos.length || 1)
  }
}