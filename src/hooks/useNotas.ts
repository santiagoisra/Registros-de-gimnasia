'use client'

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import type { Nota } from '@/types'
import {
  getNotas,
  getNota,
  createNota,
  updateNota,
  deleteNota,
  getEstadisticasNotas,
  getNotasPorPeriodo
} from '@/services/notas'
import { 
  PaginationParams, 
  OrderParams, 
  DateRangeParams,
  handleDatabaseError,
  validateDateRange,
  validateRequired,
  validateNumericRange
} from '@/utils'

interface UseNotasOptions extends PaginationParams, OrderParams, DateRangeParams {
  alumnoId?: string
  tipo?: Nota['tipo']
  categoria?: Nota['categoria']
  visibleEnReporte?: boolean
  calificacionMin?: number
  calificacionMax?: number
  autoFetch?: boolean
}

interface NotasEstadisticas {
  totalNotas: number
  porTipo: Record<Nota['tipo'], number>
  porCategoria: Record<NonNullable<Nota['categoria']>, number>
  promedioCalificaciones: number
  tendencias: {
    ausencias: number
    lesiones: number
    vacaciones: number
    general: number
    evaluaciones: number
    progresos: number
    competencias: number
  }
  objetivosCumplidos: number
  objetivosPendientes: number
}

export function useNotas(options: UseNotasOptions = {}) {
  const [notas, setNotas] = useState<Nota[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(options.page || 1)
  const [pageSize, setPageSize] = useState(options.pageSize || 10)
  const [estadisticas, setEstadisticas] = useState<NotasEstadisticas | null>(null)

  const fetchNotas = useCallback(async () => {
    if (!options.alumnoId) return

    try {
      validateRequired(options.alumnoId, 'alumnoId')
      if (options.fechaDesde && options.fechaHasta) {
        validateDateRange(options.fechaDesde, options.fechaHasta)
      }
      if (options.calificacionMin !== undefined && options.calificacionMax !== undefined) {
        validateNumericRange(options.calificacionMin, 0, 10, 'calificación mínima')
        validateNumericRange(options.calificacionMax, 0, 10, 'calificación máxima')
      }

      setLoading(true)
      setError(null)

      const result = await getNotas({
        ...options,
        page: options.page || 1,
        pageSize: options.pageSize || 10
      })

      setNotas(result.notas)
      setTotal(result.total)
      setEstadisticas(result.estadisticas)
    } catch (err) {
      setError(handleDatabaseError(err as Error, 'fetchNotas'))
    } finally {
      setLoading(false)
    }
  }, [options])

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchNotas()
    }
  }, [fetchNotas, options.autoFetch])

  const createNota = useCallback(async (nota: Omit<Nota, 'id'>) => {
    try {
      setLoading(true)
      setError(null)
      const nuevaNota = await createNota(nota)
      setNotas(prev => [nuevaNota, ...prev])
      await fetchNotas() // Recargar para actualizar estadísticas
      return nuevaNota
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al crear nota'))
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchNotas])

  const updateNota = useCallback(async (id: string, nota: Partial<Omit<Nota, 'id'>>) => {
    try {
      setLoading(true)
      setError(null)
      const notaActualizada = await updateNota(id, nota)
      setNotas(prev => prev.map(n => n.id === id ? notaActualizada : n))
      await fetchNotas() // Recargar para actualizar estadísticas
      return notaActualizada
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al actualizar nota'))
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchNotas])

  const deleteNota = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await deleteNota(id)
      setNotas(prev => prev.filter(n => n.id !== id))
      await fetchNotas() // Recargar para actualizar estadísticas
      return true
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al eliminar nota'))
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchNotas])

  const getNota = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const nota = await getNota(id)
      return nota
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al obtener nota'))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getNotasPorPeriodo = useCallback(async (fechaInicio: string, fechaFin: string, tipo?: Nota['tipo']) => {
    try {
      setLoading(true)
      setError(null)
      const notas = await getNotasPorPeriodo(fechaInicio, fechaFin, tipo)
      return notas
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al obtener notas por periodo'))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const actualizarObjetivo = useCallback(async (
    id: string, 
    objetivoIndex: number, 
    seguimientoUpdate: Nota['seguimiento'][0]
  ) => {
    try {
      const nota = await getNota(id)
      if (!nota) throw new Error('Nota no encontrada')

      const seguimiento = [...(nota.seguimiento || [])]
      seguimiento[objetivoIndex] = seguimientoUpdate

      return await updateNota(id, { seguimiento })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al actualizar objetivo'))
      throw err
    }
  }, [getNota, updateNota])

  const agregarAdjunto = useCallback(async (
    id: string,
    adjunto: Nota['adjuntos'][0]
  ) => {
    try {
      const nota = await getNota(id)
      if (!nota) throw new Error('Nota no encontrada')

      const adjuntos = [...(nota.adjuntos || []), adjunto]
      return await updateNota(id, { adjuntos })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al agregar adjunto'))
      throw err
    }
  }, [getNota, updateNota])

  const eliminarAdjunto = useCallback(async (
    id: string,
    adjuntoUrl: string
  ) => {
    try {
      const nota = await getNota(id)
      if (!nota) throw new Error('Nota no encontrada')

      const adjuntos = nota.adjuntos?.filter(adj => adj.url !== adjuntoUrl) || []
      return await updateNota(id, { adjuntos })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al eliminar adjunto'))
      throw err
    }
  }, [getNota, updateNota])

  return {
    notas,
    loading,
    error,
    total,
    page,
    pageSize,
    estadisticas,
    setPage,
    setPageSize,
    fetchNotas,
    createNota,
    updateNota,
    deleteNota,
    getNota,
    getNotasPorPeriodo,
    actualizarObjetivo,
    agregarAdjunto,
    eliminarAdjunto
  }
} 