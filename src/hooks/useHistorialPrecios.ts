'use client'

import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import type { HistorialPrecios } from '../types'
import {
  getHistorialPreciosPorAlumno,
  createHistorialPrecio,
  updateHistorialPrecio,
  deleteHistorialPrecio
} from '@/services/historialPrecios'

export const useHistorialPrecios = (alumnoId: string) => {
  const [loading, setLoading] = useState(false)
  const [historial, setHistorial] = useState<HistorialPrecios[]>([])

  const fetchHistorial = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getHistorialPreciosPorAlumno(alumnoId)
      setHistorial(data)
    } catch (error) {
      toast.error('Error al cargar el historial de precios')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [alumnoId])

  const registrarHistorial = useCallback(async (nuevo: Omit<HistorialPrecios, 'id'>) => {
    try {
      setLoading(true)
      await createHistorialPrecio(nuevo)
      toast.success('Historial de precio registrado')
      await fetchHistorial()
    } catch (error) {
      toast.error('Error al registrar el historial de precio')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [fetchHistorial])

  const modificarHistorial = useCallback(async (id: string, cambios: Partial<HistorialPrecios>) => {
    try {
      setLoading(true)
      await updateHistorialPrecio(id, cambios)
      toast.success('Historial de precio actualizado')
      await fetchHistorial()
    } catch (error) {
      toast.error('Error al actualizar el historial de precio')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [fetchHistorial])

  const eliminarHistorial = useCallback(async (id: string) => {
    try {
      setLoading(true)
      await deleteHistorialPrecio(id)
      toast.success('Historial de precio eliminado')
      await fetchHistorial()
    } catch (error) {
      toast.error('Error al eliminar el historial de precio')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [fetchHistorial])

  return {
    loading,
    historial,
    fetchHistorial,
    registrarHistorial,
    modificarHistorial,
    eliminarHistorial
  }
} 