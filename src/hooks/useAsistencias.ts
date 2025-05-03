'use client'

import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import type { Asistencia } from '../types'
import {
  getAsistenciasPorFecha,
  createAsistencia,
  deleteAsistencia,
  createAsistenciasBulk
} from '@/services/asistencias'

export const useAsistencias = (ubicacion: 'Plaza Arenales' | 'Plaza Terán') => {
  const [loading, setLoading] = useState(false)
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])

  const fetchAsistencias = useCallback(async (fecha: string) => {
    try {
      setLoading(true)
      const data = await getAsistenciasPorFecha(fecha)
      setAsistencias(data.filter(a => a.ubicacion === ubicacion))
    } catch (error) {
      toast.error('Error al cargar las asistencias')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [ubicacion])

  const registrarAsistencia = useCallback(async (alumnoId: string, fecha: string) => {
    try {
      setLoading(true)
      await createAsistencia({ alumnoId, fecha, ubicacion })
      toast.success('Asistencia registrada')
      await fetchAsistencias(fecha)
    } catch (error) {
      toast.error('Error al registrar la asistencia')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [ubicacion, fetchAsistencias])

  const registrarAsistenciasBulk = useCallback(async (alumnosIds: string[], fecha: string) => {
    try {
      setLoading(true)
      await createAsistenciasBulk(alumnosIds.map(alumnoId => ({ alumnoId, fecha, ubicacion })))
      toast.success('Asistencias registradas')
      await fetchAsistencias(fecha)
    } catch (error) {
      toast.error('Error al registrar asistencias en lote')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [ubicacion, fetchAsistencias])

  const eliminarAsistencia = useCallback(async (id: string, fecha: string) => {
    try {
      setLoading(true)
      await deleteAsistencia(id)
      toast.success('Asistencia eliminada')
      await fetchAsistencias(fecha)
    } catch (error) {
      toast.error('Error al eliminar la asistencia')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [fetchAsistencias])

  return {
    loading,
    asistencias,
    fetchAsistencias,
    registrarAsistencia,
    registrarAsistenciasBulk,
    eliminarAsistencia
  }
} 