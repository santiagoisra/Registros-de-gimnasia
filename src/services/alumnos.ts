import { supabase } from '@/lib/supabase'
import type { Alumno as AlumnoDB } from '@/types/supabase'
import type { Alumno } from '@/types'
import { handleDatabaseError } from '@/utils/errorHandling'
import { PostgrestError } from '@supabase/supabase-js'

/**
 * Opciones para filtrar y paginar la consulta de alumnos
 */
interface GetAlumnosOptions {
  page?: number
  perPage?: number
  orderBy?: keyof AlumnoDB
  orderDirection?: 'asc' | 'desc'
  sede?: AlumnoDB['sede']
  activo?: boolean
  estadoPago?: AlumnoDB['estado_pago']
}

/**
 * Mapea un alumno desde la base de datos al modelo del frontend
 */
function mapAlumnoFromDB(dbAlumno: AlumnoDB): Alumno {
  return {
    id: dbAlumno.id,
    nombre: dbAlumno.nombre,
    apellido: dbAlumno.apellido,
    email: dbAlumno.email,
    telefono: dbAlumno.telefono,
    createdAt: dbAlumno.created_at,
    updatedAt: dbAlumno.created_at, // La base no tiene updated_at, usamos created_at
    activo: dbAlumno.activo,
    alertasActivas: dbAlumno.alertas_activas ?? false,
    fechaUltimaAsistencia: dbAlumno.fecha_ultima_asistencia ?? '',
    diasConsecutivosAsistencia: dbAlumno.dias_consecutivos_asistencia ?? 0,
    estadoPago: dbAlumno.estado_pago ?? 'al_dia'
  }
}

export const alumnosService = {
  /**
   * Obtiene un listado paginado de alumnos con filtros opcionales
   */
  async getAlumnos(options: GetAlumnosOptions = {}) {
    try {
      let query = supabase
        .from('alumnos')
        .select('*', { count: 'exact' })

      if (options.sede) {
        query = query.eq('sede', options.sede)
      }

      if (typeof options.activo === 'boolean') {
        query = query.eq('activo', options.activo)
      }

      if (options.estadoPago) {
        query = query.eq('estado_pago', options.estadoPago)
      }

      if (options.orderBy) {
        const dbColumn = options.orderBy === 'alumno_id' ? 'alumno_id' : undefined
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
          throw handleDatabaseError(error, 'Error al obtener alumnos')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al obtener alumnos')
      }

      const alumnos = data.map(mapAlumnoFromDB)
      const totalPages = count ? Math.ceil(count / (options.perPage || 10)) : 1

      return { data: alumnos, totalPages }
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al obtener alumnos')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al obtener alumnos')
    }
  },

  /**
   * Obtiene un alumno por su ID
   */
  async getAlumnoById(id: string) {
    try {
      const { data, error } = await supabase
        .from('alumnos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al obtener alumno')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al obtener alumno')
      }

      return data ? mapAlumnoFromDB(data) : null
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al obtener alumno')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al obtener alumno')
    }
  },

  /**
   * Crea un nuevo alumno
   */
  async createAlumno(data: Partial<AlumnoDB>) {
    try {
      const { data: newAlumno, error } = await supabase
        .from('alumnos')
        .insert([{
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          telefono: data.telefono,
          sede: data.sede,
          activo: data.activo ?? true,
          alertas_activas: data.alertas_activas,
          estado_pago: data.estado_pago
        }])
        .select()
        .single()

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al crear alumno')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al crear alumno')
      }

      return mapAlumnoFromDB(newAlumno)
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al crear alumno')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al crear alumno')
    }
  },

  /**
   * Actualiza un alumno existente
   */
  async updateAlumno(id: string, data: Partial<AlumnoDB>) {
    try {
      const { data: updatedAlumno, error } = await supabase
        .from('alumnos')
        .update({
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          telefono: data.telefono,
          sede: data.sede,
          activo: data.activo,
          alertas_activas: data.alertas_activas,
          fecha_ultima_asistencia: data.fecha_ultima_asistencia,
          dias_consecutivos_asistencia: data.dias_consecutivos_asistencia,
          estado_pago: data.estado_pago
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al actualizar alumno')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al actualizar alumno')
      }

      return mapAlumnoFromDB(updatedAlumno)
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al actualizar alumno')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al actualizar alumno')
    }
  },

  /**
   * Elimina un alumno
   */
  async deleteAlumno(id: string) {
    try {
      const { error } = await supabase
        .from('alumnos')
        .delete()
        .eq('id', id)

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al eliminar alumno')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al eliminar alumno')
      }
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al eliminar alumno')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al eliminar alumno')
    }
  },

  /**
   * Actualiza el estado de pago de un alumno
   */
  async actualizarEstadoPago(id: string, estadoPago: AlumnoDB['estado_pago']) {
    try {
      const { error } = await supabase
        .from('alumnos')
        .update({ estado_pago: estadoPago })
        .eq('id', id)

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al actualizar estado de pago')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al actualizar estado de pago')
      }
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al actualizar estado de pago')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al actualizar estado de pago')
    }
  },

  /**
   * Actualiza la asistencia de un alumno
   */
  async actualizarAsistencia(id: string, fecha: string) {
    try {
      const { error } = await supabase
        .from('alumnos')
        .update({
          fecha_ultima_asistencia: fecha,
          // TODO: Implementar correctamente el incremento de dias_consecutivos_asistencia
        })
        .eq('id', id)

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al actualizar asistencia')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al actualizar asistencia')
      }
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al actualizar asistencia')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al actualizar asistencia')
    }
  },

  /**
   * Resetea el contador de asistencias consecutivas de un alumno
   */
  async resetearAsistenciasConsecutivas(id: string) {
    try {
      const { error } = await supabase
        .from('alumnos')
        .update({ dias_consecutivos_asistencia: 0 })
        .eq('id', id)

      if (error) {
        if (error instanceof Error) {
          throw handleDatabaseError(error, 'Error al resetear asistencias')
        }
        throw handleDatabaseError(error as PostgrestError, 'Error al resetear asistencias')
      }
    } catch (error) {
      if (error instanceof Error) {
        throw handleDatabaseError(error, 'Error al resetear asistencias')
      }
      throw handleDatabaseError(error as PostgrestError, 'Error al resetear asistencias')
    }
  }
}