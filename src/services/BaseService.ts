import { supabase } from '@/lib/supabase'
import { logError, logInfo } from '@/lib/logger'

/**
 * Clase base abstracta para servicios CRUD sobre Supabase
 * @template T Tipo de entidad
 */
export abstract class BaseService<T> {
  protected abstract table: string

  /**
   * Crea un nuevo registro
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      const { data: created, error } = await supabase
        .from(this.table)
        .insert([data])
        .select()
        .single()
      if (error) throw error
      logInfo(`[${this.table}] Registro creado`, created)
      return created as T
    } catch (error) {
      logError(`[${this.table}] Error al crear`, error)
      throw this.handleError(error, 'crear')
    }
  }

  /**
   * Obtiene un registro por ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as T
    } catch (error) {
      logError(`[${this.table}] Error al buscar por ID`, error)
      return null
    }
  }

  /**
   * Obtiene todos los registros con paginación y orden
   */
  async findAll(options?: {
    page?: number
    perPage?: number
    orderBy?: keyof T
    orderDirection?: 'asc' | 'desc'
    filters?: Record<string, unknown>
  }): Promise<{ data: T[]; totalPages: number }> {
    try {
      let query = supabase.from(this.table).select('*', { count: 'exact' })
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined) query = query.eq(key, value)
        })
      }
      if (options?.orderBy) {
        query = query.order(String(options.orderBy), { ascending: options.orderDirection !== 'desc' })
      }
      if (options?.page && options?.perPage) {
        const from = (options.page - 1) * options.perPage
        const to = from + options.perPage - 1
        query = query.range(from, to)
      }
      const { data, error, count } = await query
      if (error) throw error
      const totalPages = count ? Math.ceil(count / (options?.perPage || 10)) : 1
      return { data: data as T[], totalPages }
    } catch (error) {
      logError(`[${this.table}] Error al listar`, error)
      throw this.handleError(error, 'listar')
    }
  }

  /**
   * Actualiza un registro por ID
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const { data: updated, error } = await supabase
        .from(this.table)
        .update(data)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      logInfo(`[${this.table}] Registro actualizado`, updated)
      return updated as T
    } catch (error) {
      logError(`[${this.table}] Error al actualizar`, error)
      throw this.handleError(error, 'actualizar')
    }
  }

  /**
   * Elimina un registro por ID
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.table)
        .delete()
        .eq('id', id)
      if (error) throw error
      logInfo(`[${this.table}] Registro eliminado`, id)
    } catch (error) {
      logError(`[${this.table}] Error al eliminar`, error)
      throw this.handleError(error, 'eliminar')
    }
  }

  /**
   * Manejo de errores estándar
   */
  protected handleError(error: unknown, accion: string): Error {
    if (error instanceof Error) return error
    if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      return new Error(`[${this.table}] Error al ${accion}: ${(error as { message: string }).message}`)
    }
    return new Error(`[${this.table}] Error desconocido al ${accion}`)
  }
} 