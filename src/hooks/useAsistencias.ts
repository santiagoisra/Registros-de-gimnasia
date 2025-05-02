'use client'

import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Asistencia } from '../types/supabase'
import { toast } from 'react-hot-toast'

export const useAsistencias = (sede: 'Plaza Arenales' | 'Plaza Terán') => {
  const [loading, setLoading] = useState(false)
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])

  const fetchAsistencias = useCallback(async (fecha: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('asistencias')
        .select('*')
        .eq('sede', sede)
        .eq('fecha', fecha)

      if (error) throw error
      setAsistencias(data || [])
    } catch (error) {
      toast.error('Error al cargar las asistencias')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [sede])

  const registrarAsistencia = useCallback(async (alumnoId: string, fecha: string) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('asistencias')
        .insert([
          {
            alumno_id: alumnoId,
            fecha,
            sede
          }
        ])

      if (error) throw error
      toast.success('Asistencia registrada')
      await fetchAsistencias(fecha)
    } catch (error) {
      toast.error('Error al registrar la asistencia')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [sede, fetchAsistencias])

  const eliminarAsistencia = useCallback(async (id: string, fecha: string) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('asistencias')
        .delete()
        .eq('id', id)

      if (error) throw error
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
    eliminarAsistencia
  }
} 