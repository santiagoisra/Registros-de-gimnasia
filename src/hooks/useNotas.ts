import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from './useToast'
import type { Nota } from '@/types'
import type { Nota as NotaDB } from '@/types/supabase'
import { 
  handleDatabaseError,
  validateDateRange,
  validateRequired,
  validateNumericRange
} from '@/utils'
import { PostgrestError } from '@supabase/supabase-js'
import { notasService } from '@/services/notas'

interface UseNotasOptions {
  page?: number
  perPage?: number
  orderBy?: keyof Nota
  orderDirection?: 'asc' | 'desc'
  alumnoId?: string
  tipo?: string
  categoria?: string
  visibleEnReporte?: boolean
  calificacionMin?: number
  calificacionMax?: number
  fechaDesde?: string
  fechaHasta?: string
}

/**
 * Hook para gestión de notas: listado, creación, edición y borrado.
 * Usa React Query para queries y mutaciones, soporta paginación y filtrado.
 *
 * @example
 * const {
 *   notas, totalPages, isLoading, isError, error,
 *   createNota, updateNota, deleteNota,
 *   isCreating, isUpdating, isDeleting, refetch
 * } = useNotas({ page: 1, pageSize: 10, alumnoId: '123' })
 */
export function useNotas(options: UseNotasOptions = {}) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  // Validar fechas si se proporcionan
  if (options.fechaDesde && options.fechaHasta) {
    validateDateRange(options.fechaDesde, options.fechaHasta)
  }

  // Query para obtener lista de notas
  const {
    data: notasData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['notas', options],
    queryFn: () => notasService.getNotas(options),
    keepPreviousData: true
  })

  // Query para estadísticas
  const estadisticasQuery = useQuery({
    queryKey: ['notas-estadisticas', options.alumnoId, options.fechaDesde, options.fechaHasta, options.tipo, options.categoria],
    queryFn: () => Promise.resolve(undefined),
    enabled: !!options.alumnoId
  })

  // Query para notas por período
  const notasPorPeriodoQuery = useQuery({
    queryKey: ['notas-periodo', options.fechaDesde, options.fechaHasta, options.tipo],
    queryFn: () => Promise.resolve(undefined),
    enabled: !!(options.fechaDesde && options.fechaHasta)
  })

  // Mutación para crear nota
  const {
    mutateAsync: createNota,
    isPending: isCreating
  } = useMutation({
    mutationFn: notasService.createNota,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas'] })
      showToast('Nota creada correctamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'crear nota')
      showToast(err.message, 'error')
    }
  })

  // Mutación para actualizar nota
  const {
    mutateAsync: updateNota,
    isPending: isUpdating
  } = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Nota> }) => notasService.updateNota(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas'] })
      showToast('Nota actualizada correctamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'actualizar nota')
      showToast(err.message, 'error')
    }
  })

  // Mutación para eliminar nota
  const {
    mutateAsync: deleteNota,
    isPending: isDeleting
  } = useMutation({
    mutationFn: (id: string) => notasService.deleteNota(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas'] })
      showToast('Nota eliminada correctamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'eliminar nota')
      showToast(err.message, 'error')
    }
  })

  return {
    notas: notasData?.data || [],
    totalPages: notasData?.totalPages || 1,
    isLoading,
    isError,
    error,
    refetch,
    createNota,
    updateNota,
    deleteNota,
    isCreating,
    isUpdating,
    isDeleting,
    estadisticas: estadisticasQuery.data,
    notasPorPeriodo: notasPorPeriodoQuery.data
  }
}