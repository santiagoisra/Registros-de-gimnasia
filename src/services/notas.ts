import { supabase } from '@/lib/supabase'
import type { Nota } from '@/types'

// Mapeo entre los nombres del modelo y la base de datos
function mapNotaFromDB(dbNota: Record<string, unknown>): Nota {
  return {
    id: dbNota.id as string,
    alumnoId: dbNota.alumno_id as string,
    fecha: dbNota.fecha as string,
    contenido: dbNota.contenido as string,
    tipo: dbNota.tipo as Nota['tipo'],
    visibleEnReporte: dbNota.visible_en_reporte as boolean | undefined,
    categoria: dbNota.categoria as Nota['categoria'],
    calificacion: dbNota.calificacion as number | undefined,
    objetivos: dbNota.objetivos as string[] | undefined,
    seguimiento: dbNota.seguimiento as Nota['seguimiento'],
    adjuntos: dbNota.adjuntos as Nota['adjuntos'],
    createdAt: dbNota.created_at as string | undefined,
    updatedAt: dbNota.updated_at as string | undefined,
  }
}

// Función para obtener todas las notas con filtros opcionales
export async function getNotas(options?: {
  alumnoId?: string;
  tipo?: Nota['tipo'];
  categoria?: Nota['categoria'];
  fechaDesde?: string;
  fechaHasta?: string;
  visibleEnReporte?: boolean;
  calificacionMin?: number;
  calificacionMax?: number;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}) {
  try {
    const {
      page = 1,
      pageSize = 10,
      orderBy = 'fecha',
      orderDirection = 'desc'
    } = options || {}

    const start = (page - 1) * pageSize
    const end = start + pageSize - 1

    let query = supabase.from('notas').select('*', { count: 'exact' })

    if (options?.alumnoId) {
      query = query.eq('alumno_id', options.alumnoId)
    }

    if (options?.tipo) {
      query = query.eq('tipo', options.tipo)
    }

    if (options?.categoria) {
      query = query.eq('categoria', options.categoria)
    }

    if (options?.fechaDesde) {
      query = query.gte('fecha', options.fechaDesde)
    }

    if (options?.fechaHasta) {
      query = query.lte('fecha', options.fechaHasta)
    }

    if (options?.visibleEnReporte !== undefined) {
      query = query.eq('visible_en_reporte', options.visibleEnReporte)
    }

    if (options?.calificacionMin !== undefined) {
      query = query.gte('calificacion', options.calificacionMin)
    }

    if (options?.calificacionMax !== undefined) {
      query = query.lte('calificacion', options.calificacionMax)
    }

    const { data, error, count } = await query
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .range(start, end)

    if (error) throw error

    return {
      notas: data ? data.map(mapNotaFromDB) : [],
      total: count || 0,
      page,
      pageSize
    }
  } catch (error) {
    console.error('Error al obtener las notas:', error)
    throw error
  }
}

// Función para obtener una nota específica
export async function getNota(id: string) {
  try {
    const { data, error } = await supabase
      .from('notas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return data ? mapNotaFromDB(data) : null
  } catch (error) {
    console.error('Error al obtener la nota:', error)
    throw error
  }
}

// Función para crear una nueva nota
export async function createNota(nota: Omit<Nota, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('notas')
      .insert({
        alumno_id: nota.alumnoId,
        fecha: nota.fecha,
        contenido: nota.contenido,
        tipo: nota.tipo,
        visible_en_reporte: nota.visibleEnReporte,
        categoria: nota.categoria,
        calificacion: nota.calificacion,
        objetivos: nota.objetivos,
        seguimiento: nota.seguimiento,
        adjuntos: nota.adjuntos,
      })
      .select()
      .single()

    if (error) throw error

    return mapNotaFromDB(data)
  } catch (error) {
    console.error('Error al crear la nota:', error)
    throw error
  }
}

// Función para actualizar una nota
export async function updateNota(id: string, nota: Partial<Omit<Nota, 'id'>>) {
  try {
    const { data, error } = await supabase
      .from('notas')
      .update({
        alumno_id: nota.alumnoId,
        fecha: nota.fecha,
        contenido: nota.contenido,
        tipo: nota.tipo,
        visible_en_reporte: nota.visibleEnReporte,
        categoria: nota.categoria,
        calificacion: nota.calificacion,
        objetivos: nota.objetivos,
        seguimiento: nota.seguimiento,
        adjuntos: nota.adjuntos,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return mapNotaFromDB(data)
  } catch (error) {
    console.error('Error al actualizar la nota:', error)
    throw error
  }
}

// Función para eliminar una nota
export async function deleteNota(id: string) {
  try {
    const { error } = await supabase
      .from('notas')
      .delete()
      .eq('id', id)

    if (error) throw error

    return true
  } catch (error) {
    console.error('Error al eliminar la nota:', error)
    throw error
  }
}

// Función para obtener estadísticas de notas por tipo y categoría
export async function getEstadisticasNotas(alumnoId: string, options?: {
  fechaDesde?: string;
  fechaHasta?: string;
  tipo?: Nota['tipo'];
  categoria?: Nota['categoria'];
}) {
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

    if (options?.tipo) {
      query = query.eq('tipo', options.tipo)
    }

    if (options?.categoria) {
      query = query.eq('categoria', options.categoria)
    }

    const { data, error } = await query

    if (error) throw error

    const notas = data ? data.map(mapNotaFromDB) : []
    
    // Calcular estadísticas
    const estadisticas = {
      totalNotas: notas.length,
      porTipo: {} as Record<Nota['tipo'], number>,
      porCategoria: {} as Record<NonNullable<Nota['categoria']>, number>,
      promedioCalificaciones: 0,
      tendencias: {
        ausencias: 0,
        lesiones: 0,
        vacaciones: 0,
        general: 0,
        evaluaciones: 0,
        progresos: 0,
        competencias: 0
      },
      objetivosCumplidos: 0,
      objetivosPendientes: 0
    }

    let totalCalificaciones = 0
    let notasConCalificacion = 0

    notas.forEach(nota => {
      // Conteo por tipo
      if (nota.tipo) {
        estadisticas.porTipo[nota.tipo] = (estadisticas.porTipo[nota.tipo] || 0) + 1
      }

      // Conteo por categoría
      if (nota.categoria) {
        estadisticas.porCategoria[nota.categoria] = (estadisticas.porCategoria[nota.categoria] || 0) + 1
      }

      // Promedio de calificaciones
      if (nota.calificacion !== undefined) {
        totalCalificaciones += nota.calificacion
        notasConCalificacion++
      }

      // Conteo de objetivos
      if (nota.objetivos) {
        nota.seguimiento?.forEach(seg => {
          if (seg.estado === 'Completado') {
            estadisticas.objetivosCumplidos++
          } else {
            estadisticas.objetivosPendientes++
          }
        })
      }

      // Actualizar tendencias
      switch (nota.tipo) {
        case 'Ausencia':
          estadisticas.tendencias.ausencias++
          break
        case 'Lesión':
          estadisticas.tendencias.lesiones++
          break
        case 'Vacaciones':
          estadisticas.tendencias.vacaciones++
          break
        case 'General':
          estadisticas.tendencias.general++
          break
        case 'Evaluación':
          estadisticas.tendencias.evaluaciones++
          break
        case 'Progreso':
          estadisticas.tendencias.progresos++
          break
        case 'Competencia':
          estadisticas.tendencias.competencias++
          break
      }
    })

    // Calcular promedio de calificaciones
    estadisticas.promedioCalificaciones = notasConCalificacion > 0 
      ? totalCalificaciones / notasConCalificacion 
      : 0

    return estadisticas
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    throw error
  }
}

// Función para obtener notas por período
export async function getNotasPorPeriodo(fechaInicio: string, fechaFin: string, tipo?: Nota['tipo']) {
  try {
    let query = supabase
      .from('notas')
      .select('*')
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin)

    if (tipo) {
      query = query.eq('tipo', tipo)
    }

    const { data, error } = await query.order('fecha', { ascending: true })

    if (error) throw error

    return data ? data.map(mapNotaFromDB) : []
  } catch (error) {
    console.error('Error al obtener notas por período:', error)
    throw error
  }
}