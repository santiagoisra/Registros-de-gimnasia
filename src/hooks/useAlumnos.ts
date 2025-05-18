import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { alumnosService } from '@/services/alumnos'
import type { Alumno } from '@/types'
import { useToast } from './useToast'
import { handleDatabaseError } from '@/utils/errorHandling'
import { PostgrestError } from '@supabase/supabase-js'

interface UseAlumnosOptions {
  page?: number
  perPage?: number
  orderBy?: keyof Alumno
  orderDirection?: 'asc' | 'desc'
  sede?: string
  activo?: boolean
  estadoPago?: string
  shift_id?: string
}

/**
 * Hook para gestión de alumnos: listado, detalle, creación, edición y borrado.
 * Usa React Query para queries y mutaciones, soporta paginación y filtrado.
 *
 * @example
 * const {
 *   alumnos, totalPages, isLoading, isError, error,
 *   getAlumnoById, createAlumno, updateAlumno, deleteAlumno,
 *   isCreating, isUpdating, isDeleting, refetch
 * } = useAlumnos({ page: 1, perPage: 10, activo: true })
 */
export function useAlumnos(options: UseAlumnosOptions = {}) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  // Query para obtener lista de alumnos
  const {
    data: alumnosData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['alumnos', options],
    queryFn: () => alumnosService.getAlumnos(options),
    keepPreviousData: true
  })

  // Mutación para crear alumno
  const {
    mutateAsync: createAlumno,
    isPending: isCreating
  } = useMutation({
    mutationFn: alumnosService.createAlumno,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] })
      showToast('Alumno creado correctamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'crear alumno')
      showToast(err.message, 'error')
    }
  })

  // Mutación para actualizar alumno
  const {
    mutateAsync: updateAlumno,
    isPending: isUpdating
  } = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Alumno> }) => alumnosService.updateAlumno(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] })
      showToast('Alumno actualizado correctamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'actualizar alumno')
      showToast(err.message, 'error')
    }
  })

  // Mutación para eliminar alumno
  const {
    mutateAsync: deleteAlumno,
    isPending: isDeleting
  } = useMutation({
    mutationFn: (id: string) => alumnosService.deleteAlumno(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumnos'] })
      showToast('Alumno eliminado correctamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'eliminar alumno')
      showToast(err.message, 'error')
    }
  })

  // Obtener alumno por ID (no cachea, para uso puntual)
  const getAlumnoById = async (id: string) => {
    try {
      return await alumnosService.getAlumnoById(id)
    } catch (error) {
      const err = handleDatabaseError(error as Error | PostgrestError, 'obtener alumno')
      showToast(err.message, 'error')
      throw err
    }
  }

  return {
    alumnos: alumnosData?.data || [],
    totalPages: alumnosData?.totalPages || 1,
    isLoading,
    isError,
    error,
    refetch,
    getAlumnoById,
    createAlumno,
    updateAlumno,
    deleteAlumno,
    isCreating,
    isUpdating,
    isDeleting
  }
} 