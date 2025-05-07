import { supabase } from '@/lib/supabase'
import type { Nota as NotaDB } from '@/types/supabase'
import type { Nota } from '@/types'
import { handleDatabaseError } from '@/utils/errorHandling'
import { PostgrestError } from '@supabase/supabase-js'

/**
 * Opciones para filtrar y paginar la consulta de notas
 */
interface GetNotasOptions {
  page?: number
  perPage?: number
  orderBy?: keyof NotaDB
  orderDirection?: 'asc' | 'desc'
  alumnoId?: string
  tipo?: NotaDB['tipo']
  categoria?: Nota['categoria']
  visibleEnReporte?: boolean
  calificacionMin?: number
  calificacionMax?: number
  fechaDesde?: string
  fechaHasta?: string
}

/**
 * Mapea una nota desde la base de datos al modelo del frontend
 */
function mapNotaFromDB(dbNota: NotaDB): Nota {
  return {
    id: dbNota.id,
    alumnoId: dbNota.alumno_id,
    fecha: dbNota.fecha,
    contenido: dbNota.contenido,
    tipo: dbNota.tipo,
    visibleEnReporte: dbNota.visible_en_reporte,
    categoria: dbNota.categoria as Nota['categoria'],
    calificacion: dbNota.calificacion ?? undefined,
    objetivos: dbNota.objetivos as string[],
    seguimiento: dbNota.seguimiento ? JSON.parse(dbNota.seguimiento) : undefined,
    adjuntos: dbNota.adjuntos ? JSON.parse(dbNota.adjuntos) : undefined,
    createdAt: dbNota.created_at,
    updatedAt: dbNota.updated_at
  }
}

/**
 * Mapea una nota del frontend al formato de la base de datos
 */
function mapNotaToDB(nota: Partial<Nota>): Partial<NotaDB> {
  return {
    alumno_id: nota.alumnoId,
    fecha: nota.fecha,
    contenido: nota.contenido,
    tipo: nota.tipo,
    visible_en_reporte: nota.visibleEnReporte,
    categoria: nota.categoria,
    calificacion: nota.calificacion,
    objetivos: nota.objetivos,
    seguimiento: nota.seguimiento ? JSON.stringify(nota.seguimiento) : null,
    adjuntos: nota.adjuntos ? JSON.stringify(nota.adjuntos) : null
  }
}

export const notasService = {
  /**
   * Obtiene un listado paginado de notas con filtros opcionales
   */
  async getNotas(options: GetNotasOptions = {}) {
    try {
      let query = supabase
        .from('notas')
        .select('*', { count: 'exact' })

      if (options.alumnoId) {
        query = query.eq('alumno_id', options.alumnoId)
      }

      if (options.tipo) {
        query = query.eq('tipo', options.tipo)
      }

      if (options.categoria) {
        query = query.eq('categoria', options.categoria)
      }

      if (options.visibleEnReporte !== undefined) {
        query = query.eq('visible_en_reporte', options.visibleEnReporte)
      }

      if (options.calificacionMin !== undefined) {
        query = query.gte('calificacion', options.calificacionMin)
      }

      if (options.calificacionMax !== undefined) {
        query = query.lte('calificacion', options.calificacionMax)
      }

      if (options.fechaDesde) {
        query = query.gte('fecha', options.fechaDesde)
      }

      if (options.fechaHasta) {
        query = query.lte('fecha', options.fechaHasta)
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
          throw handleDatabaseError(error, 'Error al obtener notas')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al obtener notas')
      }

      const notas = data.map(mapNotaFromDB)
      const totalPages = count ? Math.ceil(count / (options.perPage || 10)) : 1

      return { data: notas, totalPages }
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al obtener notas')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al obtener notas')
    }
  },

  /**
   * Obtiene una nota específica por ID
   */
  async getNota(id: string) {
    try {
      const { data, error } = await supabase
        .from('notas')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al obtener nota')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al obtener nota')
      }

      return data ? mapNotaFromDB(data) : null
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al obtener nota')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al obtener nota')
    }
  },

  /**
   * Crea una nueva nota
   */
  async createNota(data: Partial<Nota>) {
    try {
      const dbData = mapNotaToDB(data)
      const { data: newNota, error } = await supabase
        .from('notas')
        .insert([dbData])
        .select()
        .single()

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al crear nota')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al crear nota')
      }

      return mapNotaFromDB(newNota)
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al crear nota')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al crear nota')
    }
  },

  /**
   * Actualiza una nota existente
   */
  async updateNota(id: string, data: Partial<Nota>) {
    try {
      const dbData = mapNotaToDB(data)
      const { data: updatedNota, error } = await supabase
        .from('notas')
        .update(dbData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al actualizar nota')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al actualizar nota')
      }

      return mapNotaFromDB(updatedNota)
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al actualizar nota')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al actualizar nota')
    }
  },

  /**
   * Elimina una nota
   */
  async deleteNota(id: string) {
    try {
      const { error } = await supabase
        .from('notas')
        .delete()
        .eq('id', id)

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al eliminar nota')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al eliminar nota')
      }
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al eliminar nota')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al eliminar nota')
    }
  },

  /**
   * Obtiene estadísticas de notas para un alumno
   */
  async getEstadisticasNotas(alumnoId: string, options?: { fechaDesde?: string; fechaHasta?: string }) {
    try {
      let query = supabase
        .from('notas')
        .select('*')
        .eq('alumno_id', alumnoId)

      if (options?.fechaDesde) {
        query = query.gte('fecha', options.fechaDesde)
      }

      if (options?.fechaHasta) {
        query = query.lte('fecha', options.fechaHasta)
      }

      const { data, error } = await query

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al obtener estadísticas de notas')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al obtener estadísticas de notas')
      }

      const notas = data.map(mapNotaFromDB)

      // Calcular estadísticas
      const porTipo = notas.reduce((acc, nota) => {
        acc[nota.tipo] = (acc[nota.tipo] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const porCategoria = notas.reduce((acc, nota) => {
        if (nota.categoria) {
          acc[nota.categoria] = (acc[nota.categoria] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)

      const promedioCalificaciones = notas.reduce((acc, nota) => {
        if (nota.calificacion) {
          acc.sum += nota.calificacion
          acc.count++
        }
        return acc
      }, { sum: 0, count: 0 })

      const objetivosCumplidos = notas.reduce((acc, nota) => {
        if (nota.seguimiento) {
          const seguimiento = Array.isArray(nota.seguimiento) ? nota.seguimiento : [nota.seguimiento]
          seguimiento.forEach(s => {
            if (s.estado === 'Completado') acc++
          })
        }
        return acc
      }, 0)

      return {
        total: notas.length,
        porTipo,
        porCategoria,
        promedioCalificacion: promedioCalificaciones.count > 0 
          ? promedioCalificaciones.sum / promedioCalificaciones.count 
          : 0,
        objetivosCumplidos,
        conAdjuntos: notas.filter(n => n.adjuntos && n.adjuntos.length > 0).length,
        visiblesEnReporte: notas.filter(n => n.visibleEnReporte).length
      }
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al obtener estadísticas de notas')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al obtener estadísticas de notas')
    }
  },

  /**
   * Obtiene notas por período
   */
  async getNotasPorPeriodo(alumnoId: string, periodo: { desde: string; hasta: string }) {
    try {
      const { data, error } = await supabase
        .from('notas')
        .select('*')
        .eq('alumno_id', alumnoId)
        .gte('fecha', periodo.desde)
        .lte('fecha', periodo.hasta)
        .order('fecha', { ascending: true })

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al obtener notas por período')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al obtener notas por período')
      }

      return data.map(mapNotaFromDB)
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al obtener notas por período')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al obtener notas por período')
    }
  }
}