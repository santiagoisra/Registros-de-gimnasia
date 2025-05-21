/**
 * @file usePagos.ts
 * @description Hook personalizado para gestionar pagos en la aplicación.
 * Proporciona funcionalidades para listar, crear, actualizar y eliminar pagos,
 * así como obtener estadísticas y manejar paginación.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from './useToast'
import type { Pago } from '@/types'
import * as pagosService from '@/services/pagos'
import { handleDatabaseError } from '@/utils/errorHandling'
import { PostgrestError } from '@supabase/supabase-js'

/**
 * Opciones de configuración para el hook usePagos
 * @interface UsePagosOptions
 */
interface UsePagosOptions {
  /** ID del alumno para filtrar pagos */
  alumnoId?: string
  /** Fecha inicial para filtrar pagos */
  fechaDesde?: string
  /** Fecha final para filtrar pagos */
  fechaHasta?: string
  /** Estado del pago para filtrar */
  estado?: Pago['estado']
  /** Método de pago para filtrar */
  metodoPago?: Pago['metodoPago']
  /** Número de página actual para paginación */
  page?: number
  /** Cantidad de items por página */
  pageSize?: number
  /** Ordenar por campo */
  orderBy?: keyof Pago
  /** Ordenar dirección */
  orderDirection?: 'asc' | 'desc'
}

/**
 * Estadísticas calculadas sobre los pagos
 * @interface EstadisticasPagos
 */
interface EstadisticasPagos {
  /** Monto total recaudado */
  totalRecaudado: number
  /** Pagos agrupados por mes */
  pagosPorMes: Record<string, number>
  /** Pagos agrupados por método de pago */
  pagosPorMetodo: Record<string, number>
  /** Promedio mensual de pagos */
  promedioMensual: number
  /** Cantidad total de pagos */
  cantidadPagos: number
  /** Monto promedio por pago */
  montoPromedio: number
}

/**
 * Hook para gestión de pagos: listado, creación, edición y borrado.
 * Usa React Query para queries y mutaciones, soporta paginación y filtrado.
 *
 * @example
 * const {
 *   pagos, totalPages, isLoading, isError, error,
 *   createPago, updatePago, deletePago,
 *   isCreating, isUpdating, isDeleting, refetch
 * } = usePagos({ page: 1, pageSize: 10, alumnoId: '123' })
 */
export function usePagos(options: UsePagosOptions = {}) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  // Validar fechas si se proporcionan
  if (options.fechaDesde && options.fechaHasta) {
    // Remover llamadas a validateDateRange si no se usa
  }

  // Query para obtener lista de pagos
  const {
    data: pagosData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['pagos', options],
    queryFn: () => pagosService.getPagos(options),
  })

  // Query para estadísticas
  const estadisticasQuery = useQuery<EstadisticasPagos, Error>({
    queryKey: ['pagos-estadisticas', options.alumnoId, options.fechaDesde, options.fechaHasta],
    queryFn: () => pagosService.getEstadisticasPagos({
      fechaDesde: options.fechaDesde,
      fechaHasta: options.fechaHasta
    }),
    enabled: !!(options.fechaDesde && options.fechaHasta)
  })

  // Mutación para crear pago
  const {
    mutateAsync: createPago,
    isPending: isCreating
  } = useMutation({
    mutationFn: pagosService.createPago,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] })
      showToast('Pago registrado correctamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'crear pago')
      showToast(err.message, 'error')
    }
  })

  // Mutación para actualizar pago
  const {
    mutateAsync: updatePago,
    isPending: isUpdating
  } = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Pago> }) => pagosService.updatePago(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] })
      showToast('Pago actualizado correctamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'actualizar pago')
      showToast(err.message, 'error')
    }
  })

  // Mutación para eliminar pago
  const {
    mutateAsync: deletePago,
    isPending: isDeleting
  } = useMutation({
    mutationFn: (id: string) => pagosService.deletePago(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] })
      showToast('Pago eliminado correctamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'eliminar pago')
      showToast(err.message, 'error')
    }
  })

  const pagos = pagosData?.pagos || []
  const total = pagosData?.total || 0
  const totalPages = total > 0 && options.pageSize && options.pageSize > 0
    ? Math.ceil(total / options.pageSize) : 1

  return {
    pagos,
    total,
    totalPages,
    isLoading,
    error,
    refetch,
    createPago,
    updatePago,
    deletePago,
    isCreating,
    isUpdating,
    isDeleting,
    estadisticas: estadisticasQuery.data
  }
} 