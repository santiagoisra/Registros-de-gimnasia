'use client'

import { useCallback, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from './useToast'
import { handleDatabaseError } from '@/utils/errorHandling'
import { 
  getAsistencias, 
  getAsistenciasPorPeriodo, 
  getEstadisticasAsistencia,
  createAsistencia,
  updateAsistencia,
  deleteAsistencia 
} from '@/services/asistencias'
import type { Asistencia, EstadisticasAsistencia } from '@/types/supabase'

export const useAsistencias = (options?: { 
  alumnoId?: string
  page?: number 
  pageSize?: number
}) => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  // Query para obtener asistencias
  const { 
    data: asistenciasData,
    error: asistenciasError,
    isLoading: asistenciasLoading 
  } = useQuery({
    queryKey: ['asistencias', options?.alumnoId, options?.page, options?.pageSize],
    queryFn: () => getAsistencias(options),
    enabled: !!options
  })

  // Query para estadísticas
  const {
    data: estadisticas,
    error: estadisticasError,
    isLoading: estadisticasLoading
  } = useQuery({
    queryKey: ['estadisticas', options?.alumnoId],
    queryFn: () => getEstadisticasAsistencia(options?.alumnoId),
    enabled: !!options?.alumnoId
  })

  // Mutation para crear asistencia
  const { mutate: crearAsistencia } = useMutation({
    mutationFn: createAsistencia,
    onSuccess: () => {
      queryClient.invalidateQueries(['asistencias'])
      showToast('Asistencia registrada correctamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error, 'crear asistencia')
      showToast(err.message, 'error')
      console.error(err)
    }
  })

  // Mutation para actualizar asistencia
  const { mutate: actualizarAsistencia } = useMutation({
    mutationFn: updateAsistencia,
    onSuccess: () => {
      queryClient.invalidateQueries(['asistencias'])
      showToast('Asistencia actualizada correctamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error, 'actualizar asistencia')
      showToast(err.message, 'error')
      console.error(err)
    }
  })

  // Mutation para eliminar asistencia
  const { mutate: eliminarAsistencia } = useMutation({
    mutationFn: deleteAsistencia,
    onSuccess: () => {
      queryClient.invalidateQueries(['asistencias'])
      showToast('Asistencia eliminada correctamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error, 'eliminar asistencia')
      showToast(err.message, 'error')
      console.error(err)
    }
  })

  const obtenerAsistenciasPorPeriodo = useCallback(async (periodo: { desde: string; hasta: string }) => {
    try {
      setLoading(true)
      const data = await getAsistenciasPorPeriodo(periodo)
      return data
    } catch (error) {
      showToast('Error al obtener las asistencias del periodo', 'error')
      console.error(error)
      return []
    } finally {
      setLoading(false)
    }
  }, [showToast])

  return {
    asistencias: asistenciasData?.data || [],
    totalPages: asistenciasData?.totalPages || 1,
    estadisticas,
    loading: loading || asistenciasLoading || estadisticasLoading,
    error: asistenciasError || estadisticasError,
    crearAsistencia,
    actualizarAsistencia,
    eliminarAsistencia,
    obtenerAsistenciasPorPeriodo
  }
} 