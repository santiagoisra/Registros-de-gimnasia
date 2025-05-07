'use client'

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import type { HistorialPrecio, EstadisticasPrecios } from '@/types'
import * as historialPreciosService from '@/services/historialPrecios'
import { 
  PaginationParams, 
  OrderParams, 
  DateRangeParams,
  handleDatabaseError,
  validateDateRange,
  formatDate
} from '@/utils'

interface UseHistorialPreciosOptions extends PaginationParams, OrderParams, DateRangeParams {
  servicio?: string
  soloActivos?: boolean
  tipoServicio?: HistorialPrecio['tipoServicio']
  moneda?: HistorialPrecio['moneda']
  conDescuento?: boolean
  autoFetch?: boolean
}

interface UseHistorialPreciosReturn {
  precios: HistorialPrecio[]
  precioVigente: HistorialPrecio | null
  estadisticas: EstadisticasPrecios | null
  incrementosPendientes: HistorialPrecio[]
  loading: boolean
  error: Error | null
  fetchPrecios: () => Promise<void>
  fetchPrecioVigente: (servicio: string, fecha?: string) => Promise<void>
  fetchEstadisticas: (fechaInicio: string, fechaFin: string) => Promise<void>
  verificarIncrementos: () => Promise<void>
  createPrecio: (precio: Omit<HistorialPrecio, 'id'>) => Promise<HistorialPrecio>
  updatePrecio: (id: string, precio: Partial<Omit<HistorialPrecio, 'id'>>) => Promise<HistorialPrecio>
  deletePrecio: (id: string) => Promise<boolean>
}

export function useHistorialPrecios(options: UseHistorialPreciosOptions = {}): UseHistorialPreciosReturn {
  const [precios, setPrecios] = useState<HistorialPrecio[]>([])
  const [precioVigente, setPrecioVigente] = useState<HistorialPrecio | null>(null)
  const [estadisticas, setEstadisticas] = useState<EstadisticasPrecios | null>(null)
  const [incrementosPendientes, setIncrementosPendientes] = useState<HistorialPrecio[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchPrecios = useCallback(async () => {
    try {
      if (options.fechaDesde && options.fechaHasta) {
        validateDateRange(options.fechaDesde, options.fechaHasta)
      }

      setLoading(true)
      setError(null)

      // TODO: Implementar o importar correctamente getHistorialPrecios
      // const result = await historialPreciosService.getHistorialPrecios({
      //   ...options,
      //   page: options.page || 1,
      //   pageSize: options.pageSize || 10
      // })
      const result = { precios: [], estadisticas: null } // Dummy para compilar

      setPrecios(result.precios)
      setEstadisticas(result.estadisticas)
      
      // Obtener incrementos pendientes
      const hoy = formatDate(new Date())
      const incrementosPendientes = result.precios
        .filter((precio: any) => precio.incrementoProgramado?.some((inc: any) => 
          !inc.notificado && inc.fecha > hoy
        ))
      setIncrementosPendientes(incrementosPendientes)
    } catch (err) {
      setError(handleDatabaseError(err as Error, 'fetchPrecios'))
    } finally {
      setLoading(false)
    }
  }, [options])

  const fetchPrecioVigente = useCallback(async (servicio: string, fecha?: string) => {
    try {
      setLoading(true)
      setError(null)
      // TODO: Implementar o importar correctamente getPrecioVigente
      // const precio = await historialPreciosService.getPrecioVigente(servicio, fecha)
      const precio = null
      setPrecioVigente(precio)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al obtener precio vigente'))
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchEstadisticas = useCallback(async (fechaInicio: string, fechaFin: string) => {
    if (!options.servicio) {
      setError(new Error('Se requiere especificar un servicio para obtener estadísticas'))
      return
    }

    try {
      setLoading(true)
      setError(null)
      // TODO: Implementar o importar correctamente getPreciosTendencia
      // const { estadisticas: stats } = await historialPreciosService.getPreciosTendencia(
      //   options.servicio,
      //   fechaInicio,
      //   fechaFin,
      //   {
      //     tipoServicio: options.tipoServicio,
      //     moneda: options.moneda
      //   }
      // )
      const stats = null
      setEstadisticas(stats)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al obtener estadísticas'))
    } finally {
      setLoading(false)
    }
  }, [options.servicio, options.tipoServicio, options.moneda])

  const verificarIncrementos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // TODO: Implementar o importar correctamente verificarIncrementosProgramados
      // const precios = await historialPreciosService.verificarIncrementosProgramados()
      const precios: HistorialPrecio[] = []
      setIncrementosPendientes(precios)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al verificar incrementos'))
    } finally {
      setLoading(false)
    }
  }, [])

  // TODO: Implementar createPrecio, updatePrecio y deletePrecio correctamente si es necesario

  useEffect(() => {
    if (options.autoFetch) {
      fetchPrecios()
    }
  }, [options.autoFetch, fetchPrecios])

  return {
    precios,
    precioVigente,
    estadisticas,
    incrementosPendientes,
    loading,
    error,
    fetchPrecios,
    fetchPrecioVigente,
    fetchEstadisticas,
    verificarIncrementos,
    createPrecio: async (precio: Omit<HistorialPrecio, 'id'>) => {
      // Implementation needed
      throw new Error('Method not implemented')
    },
    updatePrecio: async (id: string, precio: Partial<Omit<HistorialPrecio, 'id'>>) => {
      // Implementation needed
      throw new Error('Method not implemented')
    },
    deletePrecio: async (id: string) => {
      // Implementation needed
      throw new Error('Method not implemented')
    }
  }
} 