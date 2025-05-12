import { BaseService } from './BaseService'
import type { HistorialPrecio } from '@/types'
import { supabase } from '@/lib/supabase'
import { logError } from '@/lib/logger'

/**
 * Servicio para gestión de historial de precios
 */
export class HistorialPreciosService extends BaseService<HistorialPrecio> {
  protected table = 'historial_precios'

  /**
   * Obtiene historial por rango de fechas
   */
  async getByDateRange(alumnoId: string, desde: string, hasta: string) {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('alumno_id', alumnoId)
        .gte('fecha_desde', desde)
        .lte('fecha_hasta', hasta)
      if (error) throw error
      return data as HistorialPrecio[]
    } catch (error) {
      logError(`[${this.table}] Error al filtrar por rango`, error)
      throw this.handleError(error, 'filtrar por rango')
    }
  }

  /**
   * Obtiene historial por servicio
   */
  async getByServicio(servicio: string) {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('servicio', servicio)
      if (error) throw error
      return data as HistorialPrecio[]
    } catch (error) {
      logError(`[${this.table}] Error al filtrar por servicio`, error)
      throw this.handleError(error, 'filtrar por servicio')
    }
  }

  /**
   * Obtiene variación de precio en un período
   */
  async getVariationByPeriod(alumnoId: string, desde: string, hasta: string) {
    const precios = await this.getByDateRange(alumnoId, desde, hasta)
    if (!precios.length) return null
    const sorted = precios.sort((a, b) => a.fechaDesde.localeCompare(b.fechaDesde))
    return {
      inicial: sorted[0].precio,
      final: sorted[sorted.length - 1].precio,
      variacion: sorted[sorted.length - 1].precio - sorted[0].precio
    }
  }

  /**
   * Obtiene el precio máximo y mínimo en un período
   */
  async getMaxMinPrices(alumnoId: string, desde: string, hasta: string) {
    const precios = await this.getByDateRange(alumnoId, desde, hasta)
    if (!precios.length) return null
    const max = Math.max(...precios.map(p => p.precio))
    const min = Math.min(...precios.map(p => p.precio))
    return { max, min }
  }

  /**
   * Calcula el precio promedio en un período
   */
  async getAveragePriceByPeriod(alumnoId: string, desde: string, hasta: string) {
    const precios = await this.getByDateRange(alumnoId, desde, hasta)
    if (!precios.length) return null
    const avg = precios.reduce((acc, p) => acc + p.precio, 0) / precios.length
    return avg
  }

  /**
   * Analiza la tendencia de precios para un servicio/categoría en un período
   */
  async getPriceTrends({ servicio, categoria, desde, hasta }: { servicio?: string; categoria?: string; desde: string; hasta: string }) {
    try {
      let query = supabase.from(this.table).select('*')
        .gte('fecha_desde', desde)
        .lte('fecha_hasta', hasta)
      if (servicio) query = query.eq('servicio', servicio)
      if (categoria) query = query.eq('tipo_servicio', categoria)
      const { data, error } = await query
      if (error) throw error
      if (!data?.length) return []
      // Agrupar por mes/año y calcular promedio
      const trends: Record<string, { sum: number; count: number }> = {}
      data.forEach((p: HistorialPrecio) => {
        const key = p.fechaDesde.slice(0, 7) // yyyy-mm
        if (!trends[key]) trends[key] = { sum: 0, count: 0 }
        trends[key].sum += p.precio
        trends[key].count++
      })
      return Object.entries(trends).map(([periodo, stats]) => ({
        periodo,
        promedio: stats.sum / stats.count
      }))
    } catch (error) {
      logError(`[${this.table}] Error en getPriceTrends`, error)
      throw this.handleError(error, 'analizar tendencias')
    }
  }

  /**
   * Calcula el precio promedio agrupado por categoría o servicio
   */
  async getAveragePriceByPeriodGroup({ groupBy, desde, hasta }: { groupBy: 'servicio' | 'tipo_servicio'; desde: string; hasta: string }) {
    try {
      const { data, error } = await supabase.from(this.table)
        .select('*')
        .gte('fecha_desde', desde)
        .lte('fecha_hasta', hasta)
      if (error) throw error
      if (!data?.length) return {}
      const result: Record<string, number> = {}
      const grouped: Record<string, { sum: number; count: number }> = {}
      data.forEach((p: HistorialPrecio) => {
        const key = (groupBy === 'servicio' ? p.servicio : p.tipoServicio) || 'Otro'
        if (!grouped[key]) grouped[key] = { sum: 0, count: 0 }
        grouped[key].sum += p.precio
        grouped[key].count++
      })
      Object.entries(grouped).forEach(([k, v]) => {
        result[k] = v.sum / v.count
      })
      return result
    } catch (error) {
      logError(`[${this.table}] Error en getAveragePriceByPeriodGroup`, error)
      throw this.handleError(error, 'promediar por grupo')
    }
  }

  /**
   * Calcula la variación de precios por categoría en un período
   */
  async getVariationByCategory({ desde, hasta }: { desde: string; hasta: string }) {
    try {
      const { data, error } = await supabase.from(this.table)
        .select('*')
        .gte('fecha_desde', desde)
        .lte('fecha_hasta', hasta)
      if (error) throw error
      if (!data?.length) return {}
      const grouped: Record<string, HistorialPrecio[]> = {}
      data.forEach((p: HistorialPrecio) => {
        const key = p.tipoServicio || 'Otro'
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(p)
      })
      const result: Record<string, { inicial: number; final: number; variacion: number }> = {}
      Object.entries(grouped).forEach(([cat, precios]) => {
        const sorted = precios.sort((a, b) => a.fechaDesde.localeCompare(b.fechaDesde))
        result[cat] = {
          inicial: sorted[0].precio,
          final: sorted[sorted.length - 1].precio,
          variacion: sorted[sorted.length - 1].precio - sorted[0].precio
        }
      })
      return result
    } catch (error) {
      logError(`[${this.table}] Error en getVariationByCategory`, error)
      throw this.handleError(error, 'variación por categoría')
    }
  }
}

export const historialPreciosService = new HistorialPreciosService() 