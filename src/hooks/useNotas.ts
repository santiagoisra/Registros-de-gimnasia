'use client'

import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import type { Nota } from '../types'
import {
  getNotasPorAlumno,
  createNota,
  updateNota,
  deleteNota
} from '@/services/notas'

export const useNotas = (alumnoId: string) => {
  const [loading, setLoading] = useState(false)
  const [notas, setNotas] = useState<Nota[]>([])

  const fetchNotas = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getNotasPorAlumno(alumnoId)
      setNotas(data)
    } catch (error) {
      toast.error('Error al cargar las notas')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [alumnoId])

  const registrarNota = useCallback(async (nueva: Omit<Nota, 'id'>) => {
    try {
      setLoading(true)
      await createNota(nueva)
      toast.success('Nota registrada')
      await fetchNotas()
    } catch (error) {
      toast.error('Error al registrar la nota')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [fetchNotas])

  const modificarNota = useCallback(async (id: string, cambios: Partial<Nota>) => {
    try {
      setLoading(true)
      await updateNota(id, cambios)
      toast.success('Nota actualizada')
      await fetchNotas()
    } catch (error) {
      toast.error('Error al actualizar la nota')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [fetchNotas])

  const eliminarNota = useCallback(async (id: string) => {
    try {
      setLoading(true)
      await deleteNota(id)
      toast.success('Nota eliminada')
      await fetchNotas()
    } catch (error) {
      toast.error('Error al eliminar la nota')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [fetchNotas])

  return {
    loading,
    notas,
    fetchNotas,
    registrarNota,
    modificarNota,
    eliminarNota
  }
} 