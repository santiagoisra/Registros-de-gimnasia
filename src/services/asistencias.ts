import { supabase } from '@/lib/supabase'
import type { Asistencia, Alumno } from '@/types'
import { handleDatabaseError } from '@/utils/errorHandling'

// Mapeo entre los nombres del modelo y la base de datos
function mapAsistenciaFromDB(dbAsistencia: Record<string, unknown>): Asistencia {
  return {
    id: dbAsistencia.id as string,
    alumno_id: dbAsistencia.alumno_id as string,
    fecha: dbAsistencia.fecha as string,
    sede: dbAsistencia.sede as Asistencia['sede'],
    estado: dbAsistencia.estado as Asistencia['estado'],
    created_at: dbAsistencia.created_at as string,
    updated_at: dbAsistencia.updated_at as string,
    notas: dbAsistencia.notas as string | undefined,
    alumno: dbAsistencia.alumnos as Alumno | undefined
  }
}

// Mapeo del modelo a la base de datos
function mapAsistenciaToDB(asistencia: Partial<Asistencia>): Record<string, unknown> {
  return {
    alumno_id: asistencia.alumno_id,
    fecha: asistencia.fecha,
    sede: asistencia.sede,
    estado: asistencia.estado,
    notas: asistencia.notas,
  }
}

interface GetAsistenciasOptions {
  page?: number
  perPage?: number
  orderBy?: keyof Asistencia
  orderDirection?: 'asc' | 'desc'
  alumnoId?: string
  estado?: Asistencia['estado']
  fecha?: string
  sede?: Asistencia['sede']
}

export const asistenciasService = {
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

      if (options.fecha) {
        query = query.eq('fecha', options.fecha)
      }

      if (options.sede) {
        query = query.eq('sede', options.sede)
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

      if (error) throw error

      const asistencias = data.map(asistencia => ({
        id: asistencia.id,
        alumno_id: asistencia.alumno_id,
        fecha: asistencia.fecha,
        estado: asistencia.estado,
        sede: asistencia.sede,
        notas: asistencia.notas,
        created_at: asistencia.created_at,
        updated_at: asistencia.updated_at,
        alumno: asistencia.alumnos
      }))

      const totalPages = count ? Math.ceil(count / (options.perPage || 10)) : 1

      return { data: asistencias, totalPages }
    } catch (error) {
      throw handleDatabaseError(error)
    }
  },

  async createAsistencia(data: Partial<Asistencia>) {
    try {
      const { data: newAsistencia, error } = await supabase
        .from('asistencias')
        .insert([{
          alumno_id: data.alumno_id,
          fecha: data.fecha,
          estado: data.estado,
          sede: data.sede,
          notas: data.notas
        }])
        .select('*, alumnos(*)')
        .single()

      if (error) throw error

      return {
        id: newAsistencia.id,
        alumno_id: newAsistencia.alumno_id,
        fecha: newAsistencia.fecha,
        estado: newAsistencia.estado,
        sede: newAsistencia.sede,
        notas: newAsistencia.notas,
        created_at: newAsistencia.created_at,
        updated_at: newAsistencia.updated_at,
        alumno: newAsistencia.alumnos
      }
    } catch (error) {
      throw handleDatabaseError(error)
    }
  },

  async updateAsistencia(id: string, data: Partial<Asistencia>) {
    try {
      const { data: updatedAsistencia, error } = await supabase
        .from('asistencias')
        .update({
          alumno_id: data.alumno_id,
          fecha: data.fecha,
          estado: data.estado,
          sede: data.sede,
          notas: data.notas
        })
        .eq('id', id)
        .select('*, alumnos(*)')
        .single()

      if (error) throw error

      return {
        id: updatedAsistencia.id,
        alumno_id: updatedAsistencia.alumno_id,
        fecha: updatedAsistencia.fecha,
        estado: updatedAsistencia.estado,
        sede: updatedAsistencia.sede,
        notas: updatedAsistencia.notas,
        created_at: updatedAsistencia.created_at,
        updated_at: updatedAsistencia.updated_at,
        alumno: updatedAsistencia.alumnos
      }
    } catch (error) {
      throw handleDatabaseError(error)
    }
  },

  async deleteAsistencia(id: string) {
    try {
      const { error } = await supabase
        .from('asistencias')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      throw handleDatabaseError(error)
    }
  },

  async getEstadisticasAsistencia(alumnoId: string, periodo?: { desde: string; hasta: string }) {
    try {
      let query = supabase
        .from('asistencias')
        .select('*')
        .eq('alumno_id', alumnoId)

      if (periodo?.desde) {
        query = query.gte('fecha', periodo.desde)
      }

      if (periodo?.hasta) {
        query = query.lte('fecha', periodo.hasta)
      }

      const { data, error } = await query

      if (error) throw error

      const asistencias = data.map(asistencia => ({
        id: asistencia.id,
        alumno_id: asistencia.alumno_id,
        fecha: asistencia.fecha,
        estado: asistencia.estado,
        sede: asistencia.sede,
        notas: asistencia.notas,
        created_at: asistencia.created_at,
        updated_at: asistencia.updated_at
      }))

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
      ).map(([fecha, stats]) => ({ fecha, ...stats }))

      return {
        total,
        porMes,
        porcentajePresente: (presentes / total) * 100,
        porcentajeAusente: (ausentes / total) * 100,
        porSede,
        tendencia
      }
    } catch (error) {
      throw handleDatabaseError(error)
    }
  }
}