import { supabase } from '@/lib/supabase'
import type { HistorialPrecios as HistorialPreciosDB } from '@/types/supabase'
import type { HistorialPrecio } from '@/types'
import { handleDatabaseError } from '@/utils/errorHandling'
import { PostgrestError } from '@supabase/supabase-js'

/**
 * Opciones para filtrar y paginar la consulta de historial de precios
 */
interface GetHistorialPreciosOptions {
  page?: number
  perPage?: number
  orderBy?: keyof HistorialPreciosDB
  orderDirection?: 'asc' | 'desc'
  alumnoId?: string
  fechaDesde?: string
  fechaHasta?: string
  servicio?: HistorialPreciosDB['servicio']
  tipoServicio?: HistorialPreciosDB['tipo_servicio']
  activo?: boolean
  moneda?: HistorialPreciosDB['moneda']
}

/**
 * Mapea un registro de historial de precios desde la base de datos al modelo del frontend
 */
function mapHistorialPrecioFromDB(dbHistorial: HistorialPreciosDB): HistorialPrecio {
  return {
    id: dbHistorial.id,
    alumnoId: dbHistorial.alumno_id,
    precio: dbHistorial.precio,
    fechaDesde: dbHistorial.fecha_desde,
    fechaHasta: dbHistorial.fecha_hasta,
    servicio: dbHistorial.servicio,
    tipoServicio: dbHistorial.tipo_servicio,
    activo: dbHistorial.activo,
    moneda: dbHistorial.moneda,
    descuento: dbHistorial.descuento ? JSON.parse(dbHistorial.descuento) : undefined,
    incrementoProgramado: dbHistorial.incremento_programado ? JSON.parse(dbHistorial.incremento_programado) : undefined,
    historialCambios: dbHistorial.historial_cambios ? JSON.parse(dbHistorial.historial_cambios) : undefined,
    notas: dbHistorial.notas,
    createdAt: dbHistorial.created_at,
    updatedAt: dbHistorial.updated_at
  }
}

/**
 * Mapea un registro de historial de precios del frontend al formato de la base de datos
 */
function mapHistorialPrecioToDB(historial: Partial<HistorialPrecio>): Partial<HistorialPreciosDB> {
  return {
    alumno_id: historial.alumnoId,
    precio: historial.precio,
    fecha_desde: historial.fechaDesde,
    fecha_hasta: historial.fechaHasta,
    servicio: historial.servicio,
    tipo_servicio: historial.tipoServicio,
    activo: historial.activo,
    moneda: historial.moneda,
    descuento: historial.descuento ? JSON.stringify(historial.descuento) : null,
    incremento_programado: historial.incrementoProgramado ? JSON.stringify(historial.incrementoProgramado) : null,
    historial_cambios: historial.historialCambios ? JSON.stringify(historial.historialCambios) : null,
    notas: historial.notas
  }
}

export const historialPreciosService = {
  /**
   * Obtiene un listado paginado del historial de precios con filtros opcionales
   */
  async getHistorialPrecios(options: GetHistorialPreciosOptions = {}) {
    try {
      let query = supabase
        .from('historial_precios')
        .select('*', { count: 'exact' })

      if (options.alumnoId) {
        query = query.eq('alumno_id', options.alumnoId)
      }

      if (options.fechaDesde) {
        query = query.gte('fecha_desde', options.fechaDesde)
      }

      if (options.fechaHasta) {
        query = query.lte('fecha_hasta', options.fechaHasta)
      }

      if (options.servicio) {
        query = query.eq('servicio', options.servicio)
      }

      if (options.tipoServicio) {
        query = query.eq('tipo_servicio', options.tipoServicio)
      }

      if (typeof options.activo === 'boolean') {
        query = query.eq('activo', options.activo)
      }

      if (options.moneda) {
        query = query.eq('moneda', options.moneda)
      }

      if (options.orderBy) {
        const dbColumn = options.orderBy === 'alumno_id' ? 'alumno_id' : options.orderBy
        query = query.order(dbColumn, { ascending: options.orderDirection !== 'desc' })
      }

      if (options.page && options.perPage) {
        const from = (options.page - 1) * options.perPage
        const to = from + options.perPage - 1
        query = query.range(from, to)
      }

      const { data, error, count } = await query

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al obtener historial de precios')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al obtener historial de precios')
      }

      const historial = data.map(mapHistorialPrecioFromDB)
      const totalPages = count ? Math.ceil(count / (options.perPage || 10)) : 1

      return { data: historial, totalPages }
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al obtener historial de precios')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al obtener historial de precios')
    }
  },

  /**
   * Crea un nuevo registro en el historial de precios
   */
  async createHistorialPrecio(data: Partial<HistorialPrecio>) {
    try {
      const dbData = mapHistorialPrecioToDB(data)
      const { data: newHistorial, error } = await supabase
        .from('historial_precios')
        .insert([dbData])
        .select()
        .single()

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al crear historial de precios')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al crear historial de precios')
      }

      return mapHistorialPrecioFromDB(newHistorial)
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al crear historial de precios')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al crear historial de precios')
    }
  },

  /**
   * Actualiza un registro del historial de precios
   */
  async updateHistorialPrecio(id: string, data: Partial<HistorialPrecio>) {
    try {
      const dbData = mapHistorialPrecioToDB(data)
      const { data: updatedHistorial, error } = await supabase
        .from('historial_precios')
        .update(dbData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al actualizar historial de precios')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al actualizar historial de precios')
      }

      return mapHistorialPrecioFromDB(updatedHistorial)
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al actualizar historial de precios')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al actualizar historial de precios')
    }
  },

  /**
   * Elimina un registro del historial de precios
   */
  async deleteHistorialPrecio(id: string) {
    try {
      const { error } = await supabase
        .from('historial_precios')
        .delete()
        .eq('id', id)

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al eliminar historial de precios')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al eliminar historial de precios')
      }
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al eliminar historial de precios')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al eliminar historial de precios')
    }
  },

  /**
   * Obtiene estadísticas del historial de precios
   */
  async getEstadisticasHistorialPrecios(options?: { fechaDesde?: string; fechaHasta?: string }) {
    try {
      let query = supabase
        .from('historial_precios')
        .select('*')

      if (options?.fechaDesde) {
        query = query.gte('fecha_desde', options.fechaDesde)
      }

      if (options?.fechaHasta) {
        query = query.lte('fecha_hasta', options.fechaHasta)
      }

      const { data, error } = await query

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al obtener estadísticas de historial de precios')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al obtener estadísticas de historial de precios')
      }

      const historial = data.map(mapHistorialPrecioFromDB)

      // Calcular estadísticas
      const porServicio = historial.reduce((acc, h) => {
        if (h.servicio) {
          acc[h.servicio] = (acc[h.servicio] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)

      const porTipoServicio = historial.reduce((acc, h) => {
        if (h.tipoServicio) {
          acc[h.tipoServicio] = (acc[h.tipoServicio] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)

      const promediosPorServicio = historial.reduce((acc, h) => {
        if (h.servicio && h.precio) {
          if (!acc[h.servicio]) {
            acc[h.servicio] = { sum: 0, count: 0 }
          }
          acc[h.servicio].sum += h.precio
          acc[h.servicio].count++
        }
        return acc
      }, {} as Record<string, { sum: number; count: number }>)

      const preciosPromedio = Object.entries(promediosPorServicio).reduce((acc, [servicio, stats]) => {
        acc[servicio] = stats.sum / stats.count
        return acc
      }, {} as Record<string, number>)

      const descuentosAplicados = historial.filter(h => h.descuento).length
      const incrementosProgramados = historial.filter(h => h.incrementoProgramado).length

      return {
        total: historial.length,
        porServicio,
        porTipoServicio,
        preciosPromedio,
        descuentosAplicados,
        incrementosProgramados,
        activos: historial.filter(h => h.activo).length,
        porMoneda: historial.reduce((acc, h) => {
          if (h.moneda) {
            acc[h.moneda] = (acc[h.moneda] || 0) + 1
          }
          return acc
        }, {} as Record<string, number>)
      }
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al obtener estadísticas de historial de precios')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al obtener estadísticas de historial de precios')
    }
  }
}