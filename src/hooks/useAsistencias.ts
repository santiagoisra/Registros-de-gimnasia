import { useCallback, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from './useToast'
import { handleDatabaseError } from '@/utils/errorHandling'
import { asistenciasService } from '@/services/asistencias'
import type { Asistencia } from '@/types/supabase'
import { PostgrestError } from '@supabase/supabase-js'

/**
 * Hook para gestión de asistencias: listado, creación, edición y borrado.
 * Usa React Query para queries y mutaciones, soporta paginación y filtrado.
 *
 * @example
 * const {
 *   asistencias, totalPages, isLoading, isError, error,
 *   crearAsistencia, actualizarAsistencia, eliminarAsistencia,
 *   isCreating, isUpdating, isDeleting, refetch
 * } = useAsistencias({ page: 1, pageSize: 10, alumnoId: '123' })
 */

interface UseAsistenciasOptions {
  page?: number
  perPage?: number
  orderBy?: keyof Asistencia
  orderDirection?: 'asc' | 'desc'
  alumnoId?: string
  estado?: string
  fecha?: string
  sede?: string
  shiftId?: string
}

export function useAsistencias(options: UseAsistenciasOptions = {}) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  // Query para obtener lista de asistencias
  const {
    data: asistenciasData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['asistencias', options],
    queryFn: () => asistenciasService.getAsistencias(options),
    keepPreviousData: true
  })

  // Mutación para crear asistencia
  const {
    mutateAsync: crearAsistencia,
    isPending: isCreating
  } = useMutation({
    mutationFn: asistenciasService.createAsistencia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] })
      showToast('Asistencia registrada correctamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'crear asistencia')
      showToast(err.message, 'error')
    }
  })

  // Mutación para actualizar asistencia
  const {
    mutateAsync: actualizarAsistencia,
    isPending: isUpdating
  } = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Asistencia> }) => asistenciasService.updateAsistencia(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] })
      showToast('Asistencia actualizada correctamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'actualizar asistencia')
      showToast(err.message, 'error')
    }
  })

  // Mutación para eliminar asistencia
  const {
    mutateAsync: eliminarAsistencia,
    isPending: isDeleting
  } = useMutation({
    mutationFn: (id: string) => asistenciasService.deleteAsistencia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asistencias'] })
      showToast('Asistencia eliminada correctamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'eliminar asistencia')
      showToast(err.message, 'error')
    }
  })

  return {
    asistencias: asistenciasData?.data || [],
    totalPages: asistenciasData?.totalPages || 1,
    isLoading,
    isError,
    error,
    refetch,
    crearAsistencia,
    actualizarAsistencia,
    eliminarAsistencia,
    isCreating,
    isUpdating,
    isDeleting
  }
} 