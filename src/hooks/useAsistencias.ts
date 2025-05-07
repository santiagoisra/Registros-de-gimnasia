'use client'

import { useCallback, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from './useToast'
import { handleDatabaseError } from '@/utils/errorHandling'
import { asistenciasService } from '@/services/asistencias'
import type { Asistencia } from '@/types/supabase'

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
    queryFn: () => asistenciasService.getAsistencias(options),
    enabled: !!options
  })

  // Query para estadísticas
  const {
    data: estadisticas,
    error: estadisticasError,
    isLoading: estadisticasLoading
  } = useQuery({
    queryKey: ['estadisticas', options?.alumnoId],
    queryFn: () => options?.alumnoId ? asistenciasService.getEstadisticasAsistencia(options.alumnoId!) : Promise.resolve(undefined),
    enabled: !!options?.alumnoId
  })

  // Mutation para crear asistencia
  const { mutate: crearAsistencia } = useMutation({
    mutationFn: asistenciasService.createAsistencia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] })
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
    mutationFn: (args: { id: string, data: Partial<Asistencia> }) => asistenciasService.updateAsistencia(args.id, args.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] })
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
    mutationFn: (id: string) => asistenciasService.deleteAsistencia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] })
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
      const data = await asistenciasService.getAsistencias({ ...options, ...periodo })
      return data
    } catch (error) {
      showToast('Error al obtener las asistencias del periodo', 'error')
      console.error(error)
      return []
    } finally {
      setLoading(false)
    }
  }, [showToast, options])

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