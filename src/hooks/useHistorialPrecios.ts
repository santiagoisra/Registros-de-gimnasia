'use client'

import { useState, useCallback, useEffect } from 'react'
import { 
  PaginationParams, 
  OrderParams, 
  DateRangeParams,
  handleDatabaseError,
  validateDateRange,
  formatDate
} from '@/utils'
import type { HistorialPrecio, EstadisticasPrecios } from '@/types'
import { historialPreciosService } from '@/services/historialPrecios'

interface UseHistorialPreciosOptions extends PaginationParams, OrderParams, DateRangeParams {
  servicio?: string
  tipoServicio?: HistorialPrecio['tipoServicio']
  moneda?: HistorialPrecio['moneda']
  conDescuento?: boolean
  autoFetch?: boolean
  alumnoId?: string
}

interface UseHistorialPreciosReturn {
  precios: HistorialPrecio[]
  precioVigente: HistorialPrecio | null
  estadisticas: EstadisticasPrecios | null
  incrementosPendientes: HistorialPrecio[]
  loading: boolean
  error: Error | null
  fetchPrecios: () => Promise<void>
  fetchPrecioVigente: () => Promise<void>
  fetchEstadisticas: () => Promise<void>
  verificarIncrementos: () => Promise<void>
  createPrecio: (precio: Omit<HistorialPrecio, 'id'>) => Promise<HistorialPrecio>
  updatePrecio: (id: string, precio: Partial<Omit<HistorialPrecio, 'id'>>) => Promise<HistorialPrecio>
  deletePrecio: (id: string) => Promise<boolean>
}

export function useHistorialPrecios(options: UseHistorialPreciosOptions = {}): UseHistorialPreciosReturn {
  const {
    page,
    pageSize,
    orderBy,
    orderDirection,
    fechaDesde,
    fechaHasta,
    servicio,
    tipoServicio,
    moneda,
    autoFetch,
    alumnoId
  } = options

  const [precios, setPrecios] = useState<HistorialPrecio[]>([])
  const [precioVigente, setPrecioVigente] = useState<HistorialPrecio | null>(null)
  const [estadisticas, setEstadisticas] = useState<EstadisticasPrecios | null>(null)
  const [incrementosPendientes, setIncrementosPendientes] = useState<HistorialPrecio[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchPrecios = useCallback(async () => {
    try {
      if (fechaDesde && fechaHasta) {
        validateDateRange(fechaDesde, fechaHasta)
      }
      setLoading(true)
      setError(null)
      const { data: precios, totalPages } = await historialPreciosService.getHistorialPrecios({
        page,
        perPage: pageSize,
        orderBy: orderBy as keyof import('@/types/supabase').HistorialPrecios,
        orderDirection,
        fechaDesde,
        fechaHasta,
        servicio: servicio as import('@/types/supabase').HistorialPrecios['servicio'],
        tipoServicio: tipoServicio as import('@/types/supabase').HistorialPrecios['tipo_servicio'],
        moneda: moneda as import('@/types/supabase').HistorialPrecios['moneda'],
        alumnoId
      })
      setPrecios(precios)
      // TODO: setEstadisticas si el servicio lo devuelve
      // Eliminar lógica de incrementosPendientes si no existe en el tipo
    } catch (err) {
      setError(handleDatabaseError(err as Error, 'fetchPrecios'))
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, orderBy, orderDirection, fechaDesde, fechaHasta, servicio, tipoServicio, moneda, alumnoId])

  const fetchPrecioVigente = useCallback(async () => {
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

  const fetchEstadisticas = useCallback(async () => {
    if (!servicio) {
      setError(new Error('Se requiere especificar un servicio para obtener estadísticas'))
      return
    }

    try {
      setLoading(true)
      setError(null)
      // TODO: Implementar o importar correctamente getPreciosTendencia
      const stats = null
      setEstadisticas(stats)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al obtener estadísticas'))
    } finally {
      setLoading(false)
    }
  }, [servicio])

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

  useEffect(() => {
    if (autoFetch) {
      fetchPrecios()
    }
  }, [autoFetch, fetchPrecios])

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
    createPrecio: async (precio) => {
      setLoading(true)
      setError(null)
      try {
        const nuevo = await historialPreciosService.createHistorialPrecio(precio)
        await fetchPrecios()
        return nuevo
      } catch (err) {
        setError(handleDatabaseError(err as Error, 'createPrecio'))
        throw err
      } finally {
        setLoading(false)
      }
    },
    updatePrecio: async (id, precio) => {
      setLoading(true)
      setError(null)
      try {
        const actualizado = await historialPreciosService.updateHistorialPrecio(id, precio)
        await fetchPrecios()
        return actualizado
      } catch (err) {
        setError(handleDatabaseError(err as Error, 'updatePrecio'))
        throw err
      } finally {
        setLoading(false)
      }
    },
    deletePrecio: async (id) => {
      setLoading(true)
      setError(null)
      try {
        await historialPreciosService.deleteHistorialPrecio(id)
        await fetchPrecios()
        return true
      } catch (err) {
        setError(handleDatabaseError(err as Error, 'deletePrecio'))
        return false
      } finally {
        setLoading(false)
      }
    }
  }
} 