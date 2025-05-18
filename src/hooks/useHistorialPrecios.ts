import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { historialPreciosService } from '@/services/historialPrecios'
import type { HistorialPrecio } from '@/types'
import { useToast } from './useToast'
import { handleDatabaseError } from '@/utils/errorHandling'
import { PostgrestError } from '@supabase/supabase-js'

interface UseHistorialPreciosOptions {
  page?: number
  perPage?: number
  orderBy?: keyof HistorialPrecio
  orderDirection?: 'asc' | 'desc'
  servicio?: string
  tipoServicio?: string
  moneda?: string
  alumnoId?: string
  fechaDesde?: string
  fechaHasta?: string
}

export function useHistorialPrecios(options: UseHistorialPreciosOptions = {}) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  // Query para obtener lista de precios
  const {
    data: preciosData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['historialPrecios', options],
    queryFn: () => historialPreciosService.getHistorialPrecios(options),
    keepPreviousData: true
  })

  // Mutación para crear precio
  const {
    mutateAsync: createPrecio,
    isPending: isCreating
  } = useMutation({
    mutationFn: historialPreciosService.createHistorialPrecio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historialPrecios'] })
      showToast('Precio creado correctamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'crear precio')
      showToast(err.message, 'error')
    }
  })

  // Mutación para actualizar precio
  const {
    mutateAsync: updatePrecio,
    isPending: isUpdating
  } = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<HistorialPrecio> }) => historialPreciosService.updateHistorialPrecio(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historialPrecios'] })
      showToast('Precio actualizado correctamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'actualizar precio')
      showToast(err.message, 'error')
    }
  })

  // Mutación para eliminar precio
  const {
    mutateAsync: deletePrecio,
    isPending: isDeleting
  } = useMutation({
    mutationFn: (id: string) => historialPreciosService.deleteHistorialPrecio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historialPrecios'] })
      showToast('Precio eliminado correctamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'eliminar precio')
      showToast(err.message, 'error')
    }
  })

  return {
    precios: preciosData?.data || [],
    totalPages: preciosData?.totalPages || 1,
    isLoading,
    isError,
    error,
    refetch,
    createPrecio,
    updatePrecio,
    deletePrecio,
    isCreating,
    isUpdating,
    isDeleting
  }
} 