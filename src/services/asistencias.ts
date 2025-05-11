import { supabase } from '@/lib/supabase'
import type { Asistencia as AsistenciaDB, Alumno as AlumnoDB } from '@/types/supabase'
import { handleDatabaseError } from '@/utils/errorHandling'
import { PostgrestError } from '@supabase/supabase-js'

/**
 * Opciones para filtrar y paginar la consulta de asistencias
 */
interface GetAsistenciasOptions {
  page?: number
  perPage?: number
  orderBy?: keyof AsistenciaDB
  orderDirection?: 'asc' | 'desc'
  alumnoId?: string
  estado?: AsistenciaDB['estado']
  fecha?: string
  sede?: AsistenciaDB['sede']
  shiftId?: string
}

/**
 * Mapea una asistencia desde la base de datos al modelo del frontend
 */
function mapAsistenciaFromDB(dbAsistencia: AsistenciaDB & { alumnos: AlumnoDB | null }): AsistenciaDB {
  return {
    id: dbAsistencia.id,
    alumno_id: dbAsistencia.alumno_id,
    fecha: dbAsistencia.fecha,
    estado: dbAsistencia.estado,
    sede: dbAsistencia.sede,
    created_at: dbAsistencia.created_at,
    updated_at: dbAsistencia.updated_at,
    alumno: dbAsistencia.alumnos ? {
      id: dbAsistencia.alumnos.id,
      nombre: dbAsistencia.alumnos.nombre,
      apellido: dbAsistencia.alumnos.apellido,
      email: dbAsistencia.alumnos.email || '',
      telefono: dbAsistencia.alumnos.telefono || '',
      activo: dbAsistencia.alumnos.activo,
      alertas_activas: dbAsistencia.alumnos.alertas_activas ?? false,
      fecha_ultima_asistencia: dbAsistencia.alumnos.fecha_ultima_asistencia || undefined,
      dias_consecutivos_asistencia: dbAsistencia.alumnos.dias_consecutivos_asistencia || undefined,
      estado_pago: dbAsistencia.alumnos.estado_pago || undefined,
      created_at: dbAsistencia.alumnos.created_at,
      sede: dbAsistencia.alumnos.sede,
      // updatedAt: dbAsistencia.alumnos.updated_at // TODO: revisar si existe updated_at en Alumno
    } : undefined
  }
}

export const asistenciasService = {
  /**
   * Obtiene un listado paginado de asistencias con filtros opcionales
   */
  async getAsistencias(options: GetAsistenciasOptions = {}) {
    try {
      let query = supabase
        .from('asistencias')
        .select('*, alumnos(*)', { count: 'exact' })

      if (options.alumnoId) {
        query = query.eq('alumno_id', options.alumnoId)
      }

      if (options.estado) {
        query = query.eq('estado', options.estado)
      }

      if (options.sede) {
        query = query.eq('sede', options.sede)
      }

      if (options.shiftId) {
        query = query.eq('alumnos.shift_id', options.shiftId)
      }

      if (options.fecha) {
        const fechaNorm = options.fecha.length > 10 ? options.fecha.slice(0, 10) : options.fecha
        query = query.eq('fecha', fechaNorm)
      }

      if (options.orderBy) {
        const dbColumn = options.orderBy === 'alumno_id' ? 'alumno_id' : options.orderBy
        query = query.order(String(dbColumn), { ascending: options.orderDirection !== 'desc' })
      }

      if (options.page && options.perPage) {
        const from = (options.page - 1) * options.perPage
        const to = from + options.perPage - 1
        query = query.range(from, to)
      }

      const { data, error, count } = await query

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al obtener asistencias')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al obtener asistencias')
      }

      const asistencias = data
        .map(mapAsistenciaFromDB)
        .filter(a => a.alumno)
      const totalPages = count ? Math.ceil(count / (options.perPage || 10)) : 1

      return { data: asistencias, totalPages }
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al obtener asistencias')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al obtener asistencias')
    }
  },

  /**
   * Crea una nueva asistencia
   */
  async createAsistencia(data: Partial<AsistenciaDB>) {
    try {
      const { data: newAsistencia, error } = await supabase
        .from('asistencias')
        .insert([{
          alumno_id: data.alumno_id,
          fecha: data.fecha,
          estado: data.estado,
          sede: data.sede
        }])
        .select('*, alumnos(*)')
        .single()

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al crear asistencia')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al crear asistencia')
      }

      return mapAsistenciaFromDB(newAsistencia)
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al crear asistencia')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al crear asistencia')
    }
  },

  /**
   * Actualiza una asistencia existente
   */
  async updateAsistencia(id: string, data: Partial<AsistenciaDB>) {
    try {
      const { data: updatedAsistencia, error } = await supabase
        .from('asistencias')
        .update({
          alumno_id: data.alumno_id,
          fecha: data.fecha,
          estado: data.estado,
          sede: data.sede
        })
        .eq('id', id)
        .select('*, alumnos(*)')
        .single()

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al actualizar asistencia')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al actualizar asistencia')
      }

      return mapAsistenciaFromDB(updatedAsistencia)
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al actualizar asistencia')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al actualizar asistencia')
    }
  },

  /**
   * Elimina una asistencia
   */
  async deleteAsistencia(id: string) {
    try {
      const { error } = await supabase
        .from('asistencias')
        .delete()
        .eq('id', id)

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al eliminar asistencia')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al eliminar asistencia')
      }
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al eliminar asistencia')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al eliminar asistencia')
    }
  },

  /**
   * Obtiene estadísticas de asistencia para un alumno en un período opcional
   */
  async getEstadisticasAsistencia(alumnoId: string, periodo?: { desde: string; hasta: string }) {
    try {
      let query = supabase
        .from('asistencias')
        .select('*', { count: 'exact' })
        .eq('alumno_id', alumnoId)

      if (periodo?.desde) {
        query = query.gte('fecha', periodo.desde)
      }

      if (periodo?.hasta) {
        query = query.lte('fecha', periodo.hasta)
      }

      const { data, error } = await query

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al obtener estadísticas de asistencia')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al obtener estadísticas de asistencia')
      }

      const asistencias = data.map(asistencia => mapAsistenciaFromDB({ ...asistencia, alumnos: null }))

      const total = asistencias.length
      const presentes = asistencias.filter(a => a.estado === 'presente').length
      const ausentes = total - presentes

      const porSede = {
        'Plaza Arenales': asistencias.filter(a => a.sede === 'Plaza Arenales').length,
        'Plaza Terán': asistencias.filter(a => a.sede === 'Plaza Terán').length
      }

      const porMes: Record<number, number> = {}
      asistencias.forEach(a => {
        const mes = new Date(a.fecha).getMonth() + 1
        porMes[mes] = (porMes[mes] || 0) + 1
      })

      const tendencia = Object.entries(
        asistencias.reduce((acc, a) => {
          acc[a.fecha] = acc[a.fecha] || { presentes: 0, ausentes: 0 }
          if (a.estado === 'presente') acc[a.fecha].presentes++
          else acc[a.fecha].ausentes++
          return acc
        }, {} as Record<string, { presentes: number, ausentes: number }>)
      ).map(([fecha, stats]) => ({ fecha, ...(typeof stats === 'object' && stats !== null ? stats : {}) }))

      return {
        total,
        porMes,
        porcentajePresente: (presentes / total) * 100,
        porcentajeAusente: (ausentes / total) * 100,
        porSede,
        tendencia
      }
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al obtener estadísticas de asistencia')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al obtener estadísticas de asistencia')
    }
  }
}