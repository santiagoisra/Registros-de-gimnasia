import { BaseService } from './BaseService'
import type { Nota } from '@/types'
import { supabase } from '@/lib/supabase'
import { logError } from '@/lib/logger'

/**
 * Servicio para gestión de notas
 */
export class NotasService extends BaseService<Nota> {
  protected table = 'notas'

  /**
   * Busca notas por contenido (texto libre)
   */
  async searchByContent(searchTerm: string, options?: { page?: number; perPage?: number }) {
    try {
      let query = supabase.from(this.table)
        .select('*', { count: 'exact' })
        .ilike('contenido', `%${searchTerm}%`)
      if (options?.page && options?.perPage) {
        const from = (options.page - 1) * options.perPage
        const to = from + options.perPage - 1
        query = query.range(from, to)
      }
      const { data, error, count } = await query
      if (error) throw error
      return { data: data as Nota[], total: count || 0 }
    } catch (error) {
      logError(`[${this.table}] Error en searchByContent`, error)
      throw this.handleError(error, 'buscar por contenido')
    }
  }

  /**
   * Filtra notas por rango de fechas
   */
  async findByDateRange(desde: string, hasta: string) {
    try {
      const { data, error } = await supabase.from(this.table)
        .select('*')
        .gte('fecha', desde)
        .lte('fecha', hasta)
      if (error) throw error
      return data as Nota[]
    } catch (error) {
      logError(`[${this.table}] Error en findByDateRange`, error)
      throw this.handleError(error, 'filtrar por fecha')
    }
  }

  /**
   * Agrega una categoría a una nota
   */
  async addCategory(notaId: string, categoria: string) {
    try {
      const { data, error } = await supabase.from(this.table)
        .update({ categoria })
        .eq('id', notaId)
        .select()
        .single()
      if (error) throw error
      return data as Nota
    } catch (error) {
      logError(`[${this.table}] Error en addCategory`, error)
      throw this.handleError(error, 'agregar categoría')
    }
  }

  /**
   * Quita la categoría de una nota
   */
  async removeCategory(notaId: string) {
    try {
      const { data, error } = await supabase.from(this.table)
        .update({ categoria: null })
        .eq('id', notaId)
        .select()
        .single()
      if (error) throw error
      return data as Nota
    } catch (error) {
      logError(`[${this.table}] Error en removeCategory`, error)
      throw this.handleError(error, 'quitar categoría')
    }
  }

  /**
   * Vincula una nota a otra entidad (ej: alumno, pago, asistencia)
   */
  async linkToEntity(notaId: string, entityType: string, entityId: string) {
    try {
      // Asumimos que la nota tiene campos: entity_type, entity_id
      const { data, error } = await supabase.from(this.table)
        .update({ entity_type: entityType, entity_id: entityId })
        .eq('id', notaId)
        .select()
        .single()
      if (error) throw error
      return data as Nota
    } catch (error) {
      logError(`[${this.table}] Error en linkToEntity`, error)
      throw this.handleError(error, 'vincular entidad')
    }
  }

  /**
   * Obtiene entidades vinculadas a una nota
   */
  async getLinkedEntities(notaId: string) {
    try {
      const { data, error } = await supabase.from(this.table)
        .select('entity_type, entity_id')
        .eq('id', notaId)
        .single()
      if (error) throw error
      return data
    } catch (error) {
      logError(`[${this.table}] Error en getLinkedEntities`, error)
      throw this.handleError(error, 'obtener entidades vinculadas')
    }
  }
}

export const notasService = new NotasService() 