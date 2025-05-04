'use client'

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import type { HistorialPrecio, EstadisticasPrecios } from '@/types'
import {
  getHistorialPrecios,
  getPrecioVigente,
  createHistorialPrecio,
  updateHistorialPrecio,
  deleteHistorialPrecio,
  getPreciosTendencia,
  verificarIncrementosProgramados
} from '@/services/historialPrecios'
import { 
  PaginationParams, 
  OrderParams, 
  DateRangeParams,
  handleDatabaseError,
  validateDateRange,
  validateRequired,
  validateNumericRange,
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

      const result = await getHistorialPrecios({
        ...options,
        page: options.page || 1,
        pageSize: options.pageSize || 10
      })

      setPrecios(result.precios)
      setEstadisticas(result.estadisticas)
      
      // Obtener incrementos pendientes
      const hoy = formatDate(new Date())
      const incrementosPendientes = result.precios
        .filter(precio => precio.incrementoProgramado?.some(inc => 
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
      const precio = await getPrecioVigente(servicio, fecha)
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
      const { estadisticas: stats } = await getPreciosTendencia(
        options.servicio,
        fechaInicio,
        fechaFin,
        {
          tipoServicio: options.tipoServicio,
          moneda: options.moneda
        }
      )
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
      const precios = await verificarIncrementosProgramados()
      setIncrementosPendientes(precios)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al verificar incrementos'))
    } finally {
      setLoading(false)
    }
  }, [])

  const createPrecio = useCallback(async (precio: Omit<HistorialPrecio, 'id'>) => {
    try {
      setLoading(true)
      setError(null)
      const nuevoPrecio = await createHistorialPrecio(precio)
      setPrecios(prev => [nuevoPrecio, ...prev])
      toast.success('Precio creado correctamente')
      return nuevoPrecio
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al crear precio'))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePrecio = useCallback(async (id: string, precio: Partial<Omit<HistorialPrecio, 'id'>>) => {
    try {
      setLoading(true)
      setError(null)
      const precioActualizado = await updateHistorialPrecio(id, precio)
      setPrecios(prev => prev.map(p => p.id === id ? precioActualizado : p))
      toast.success('Precio actualizado correctamente')
      return precioActualizado
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al actualizar precio'))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deletePrecio = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await deleteHistorialPrecio(id)
      setPrecios(prev => prev.filter(p => p.id !== id))
      toast.success('Precio eliminado correctamente')
      return true
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al eliminar precio'))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

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
    createPrecio,
    updatePrecio,
    deletePrecio
  }
} 