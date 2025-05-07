'use client'

/**
 * @file usePagos.ts
 * @description Hook personalizado para gestionar pagos en la aplicación.
 * Proporciona funcionalidades para listar, crear, actualizar y eliminar pagos,
 * así como obtener estadísticas y manejar paginación.
 */

import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from './useToast'
import type { Pago } from '@/types'
import type { Pago as PagoDB } from '@/types/supabase'
import { 
  getPagos,
  getPagosPorAlumno,
  getPagosPorFiltros,
  getResumenPagosPorPeriodo,
  getPagosPendientes,
  createPago,
  createPagosBulk,
  updatePago,
  deletePago,
  getEstadisticasPagos
} from '@/services/pagos'
import { handleDatabaseError } from '@/utils/errorHandling'
import { PostgrestError } from '@supabase/supabase-js'
import { validateDateRange, validateRequired, validateNumericRange } from '@/utils'

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
  estado?: PagoDB['estado']
  /** Método de pago para filtrar */
  metodoPago?: PagoDB['metodo_pago']
  /** Número de página actual para paginación */
  page?: number
  /** Cantidad de items por página */
  pageSize?: number
}

/**
 * Resultado de la consulta de pagos con paginación
 * @interface PagosQueryResult
 */
interface PagosQueryResult {
  /** Lista de pagos */
  pagos: Pago[]
  /** Total de pagos encontrados */
  total: number
  /** Página actual */
  page: number
  /** Tamaño de página */
  pageSize: number
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
 * Hook personalizado para gestionar pagos en la aplicación.
 * 
 * @param options - Opciones de configuración para el hook
 * @returns Objeto con queries, mutaciones y utilidades para gestionar pagos
 * 
 * @example
 * ```tsx
 * const { 
 *   pagos,
 *   totalPages,
 *   estadisticas,
 *   createPago,
 *   updatePago,
 *   deletePago,
 *   isLoading
 * } = usePagos({
 *   alumnoId: '123',
 *   fechaDesde: '2024-01-01',
 *   fechaHasta: '2024-12-31'
 * });
 * 
 * // Crear un nuevo pago
 * await createPago({
 *   alumnoId: '123',
 *   fecha: '2024-03-15',
 *   monto: 1500,
 *   metodoPago: 'Efectivo',
 *   estado: 'Pagado',
 *   mes: 3,
 *   anio: 2024
 * });
 * ```
 */
export function usePagos(options: UsePagosOptions = {}) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  // Validar fechas si se proporcionan
  if (options.fechaDesde && options.fechaHasta) {
    validateDateRange(options.fechaDesde, options.fechaHasta)
  }

  // Query principal para obtener pagos
  const pagosQuery = useQuery<PagosQueryResult, Error>({
    queryKey: ['pagos', options],
    queryFn: async () => {
      if (options.alumnoId) {
        const pagos = await getPagosPorAlumno(options.alumnoId, {
          estado: options.estado,
          fechaDesde: options.fechaDesde,
          fechaHasta: options.fechaHasta
        })
        return {
          pagos,
          total: pagos.length,
          page: 1,
          pageSize: pagos.length
        }
      } else {
        return getPagos({
          page: options.page,
          pageSize: options.pageSize,
          orderBy: 'fecha_pago',
          orderDirection: 'desc'
        })
      }
    },
    enabled: !!(options.alumnoId || options.page)
  })

  // Query para estadísticas
  const estadisticasQuery = useQuery<EstadisticasPagos, Error>({
    queryKey: ['pagos-estadisticas', options.alumnoId, options.fechaDesde, options.fechaHasta],
    queryFn: () => getEstadisticasPagos({
      fechaDesde: options.fechaDesde,
      fechaHasta: options.fechaHasta
    }),
    enabled: !!(options.fechaDesde && options.fechaHasta)
  })

  // Mutación para crear pago
  const createPagoMutation = useMutation<Pago | null, Error, Omit<Pago, 'id'>>({
    mutationFn: createPago,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] })
      showToast('Pago registrado exitosamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'registrar pago')
      showToast(err.message, 'error')
      console.error(err)
    }
  })

  // Mutación para crear pagos en lote
  const createPagosBulkMutation = useMutation<(Pago | null)[], Error, Omit<Pago, 'id'>[]>({
    mutationFn: createPagosBulk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] })
      showToast('Pagos registrados exitosamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'registrar pagos en lote')
      showToast(err.message, 'error')
      console.error(err)
    }
  })

  // Mutación para actualizar pago
  const updatePagoMutation = useMutation<Pago | null, Error, { id: string; data: Partial<Omit<Pago, 'id'>> }>({
    mutationFn: ({ id, data }) => updatePago(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] })
      showToast('Pago actualizado exitosamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'actualizar pago')
      showToast(err.message, 'error')
      console.error(err)
    }
  })

  // Mutación para eliminar pago
  const deletePagoMutation = useMutation<void, Error, string>({
    mutationFn: deletePago,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos'] })
      showToast('Pago eliminado exitosamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'eliminar pago')
      showToast(err.message, 'error')
      console.error(err)
    }
  })

  // Función para crear pago con validación
  const handleCreatePago = useCallback(async (data: Omit<Pago, 'id'>) => {
    try {
      validateRequired(data.alumnoId, 'alumnoId')
      validateRequired(data.fecha, 'fecha')
      validateRequired(data.monto, 'monto')
      validateRequired(data.metodoPago, 'metodoPago')
      validateRequired(data.estado, 'estado')
      validateRequired(data.mes, 'mes')
      validateRequired(data.anio, 'año')
      
      validateNumericRange(data.monto, 0, Infinity, 'monto')
      validateNumericRange(data.mes, 1, 12, 'mes')
      validateNumericRange(data.anio, 2000, 2100, 'año')

      await createPagoMutation.mutateAsync(data)
    } catch (error) {
      const err = handleDatabaseError(error as Error | PostgrestError, 'crear pago')
      showToast(err.message, 'error')
      throw err
    }
  }, [createPagoMutation, showToast])

  // Función para crear pagos en lote con validación
  const handleCreatePagosBulk = useCallback(async (pagos: Omit<Pago, 'id'>[]) => {
    try {
      pagos.forEach((pago, index) => {
        validateRequired(pago.alumnoId, `alumnoId en pago ${index + 1}`)
        validateRequired(pago.fecha, `fecha en pago ${index + 1}`)
        validateRequired(pago.monto, `monto en pago ${index + 1}`)
        validateRequired(pago.metodoPago, `metodoPago en pago ${index + 1}`)
        validateRequired(pago.estado, `estado en pago ${index + 1}`)
        validateRequired(pago.mes, `mes en pago ${index + 1}`)
        validateRequired(pago.anio, `año en pago ${index + 1}`)
        
        validateNumericRange(pago.monto, 0, Infinity, `monto en pago ${index + 1}`)
        validateNumericRange(pago.mes, 1, 12, `mes en pago ${index + 1}`)
        validateNumericRange(pago.anio, 2000, 2100, `año en pago ${index + 1}`)
      })

      await createPagosBulkMutation.mutateAsync(pagos)
    } catch (error) {
      const err = handleDatabaseError(error as Error | PostgrestError, 'crear pagos en lote')
      showToast(err.message, 'error')
      throw err
    }
  }, [createPagosBulkMutation, showToast])

  // Función para actualizar pago con validación
  const handleUpdatePago = useCallback(async (id: string, data: Partial<Omit<Pago, 'id'>>) => {
    try {
      if (data.monto !== undefined) {
        validateNumericRange(data.monto, 0, Infinity, 'monto')
      }
      if (data.mes !== undefined) {
        validateNumericRange(data.mes, 1, 12, 'mes')
      }
      if (data.anio !== undefined) {
        validateNumericRange(data.anio, 2000, 2100, 'año')
      }

      await updatePagoMutation.mutateAsync({ id, data })
    } catch (error) {
      const err = handleDatabaseError(error as Error | PostgrestError, 'actualizar pago')
      showToast(err.message, 'error')
      throw err
    }
  }, [updatePagoMutation, showToast])

  // Función para eliminar pago
  const handleDeletePago = useCallback(async (id: string) => {
    try {
      await deletePagoMutation.mutateAsync(id)
    } catch (error) {
      const err = handleDatabaseError(error as Error | PostgrestError, 'eliminar pago')
      showToast(err.message, 'error')
      throw err
    }
  }, [deletePagoMutation, showToast])

  return {
    // Queries
    pagos: pagosQuery.data?.pagos || [],
    totalPages: pagosQuery.data ? Math.ceil(pagosQuery.data.total / (options.pageSize || 10)) : 1,
    estadisticas: estadisticasQuery.data,
    
    // Estados de carga y error
    isLoading: pagosQuery.isLoading || estadisticasQuery.isLoading,
    isError: pagosQuery.isError || estadisticasQuery.isError,
    error: pagosQuery.error || estadisticasQuery.error,

    // Mutaciones
    createPago: handleCreatePago,
    createPagosBulk: handleCreatePagosBulk,
    updatePago: handleUpdatePago,
    deletePago: handleDeletePago,
    
    // Estados de las mutaciones
    isCreating: createPagoMutation.isPending || createPagosBulkMutation.isPending,
    isUpdating: updatePagoMutation.isPending,
    isDeleting: deletePagoMutation.isPending
  }
} 