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

interface GetAsistenciasOptions {
  offset?: number;
  limit?: number;
  fecha?: string; // Opcional: puedes ajustar el tipo si la fecha tiene un formato específico
  sede?: "Plaza Arenales" | "Plaza Terán"; // Restringir el estado a estos valores específicos
  estado?: "presente" | "ausente"; // Restringir el estado a estos valores
  alumnoId?: string;
  orderBy?: string;
  ascending?: boolean;
  search?: string;
}

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

  // Query para obtener lista de asistencias - Revertir a estructura original para evitar errores de tipado con useQuery
  const {
    data: asistenciasData,
    isLoading,
    isError: queryError,
    error: queryFetchError,
    refetch
  } = useQuery({
    queryKey: ['asistencias', options],
    queryFn: () => asistenciasService.getAsistencias(options as GetAsistenciasOptions), // Castear opciones aquí
    // keepPreviousData: true // Eliminar esta opción si no es soportada o no necesaria
  });

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

  // Corregir el acceso a data y totalPages para manejar el caso undefined
  const asistencias = asistenciasData?.data || [];
  const totalPages = asistenciasData?.totalPages || 0;

  return {
    asistencias,
    totalPages,
    isLoading,
    isError: !!queryError || !!queryFetchError, // Usar el nuevo nombre para isError
    error: queryFetchError, // Usar el nuevo nombre para error
    refetch,
    crearAsistencia,
    actualizarAsistencia,
    eliminarAsistencia,
    isCreating,
    isUpdating,
    isDeleting
  }
} 