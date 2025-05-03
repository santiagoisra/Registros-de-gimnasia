'use client'

import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import type { Pago } from '../types'
import {
  getPagos,
  getPagosPorAlumno,
  createPago,
  updatePago,
  deletePago
} from '@/services/pagos'

export const usePagos = () => {
  const [loading, setLoading] = useState(false)
  const [pagos, setPagos] = useState<Pago[]>([])

  const fetchPagos = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getPagos()
      setPagos(data)
    } catch (error) {
      toast.error('Error al cargar los pagos')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPagosPorAlumno = useCallback(async (alumnoId: string) => {
    try {
      setLoading(true)
      const data = await getPagosPorAlumno(alumnoId)
      setPagos(data)
    } catch (error) {
      toast.error('Error al cargar los pagos del alumno')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  const registrarPago = useCallback(async (pago: Omit<Pago, 'id'>) => {
    try {
      setLoading(true)
      await createPago(pago)
      toast.success('Pago registrado')
      await fetchPagos()
    } catch (error) {
      toast.error('Error al registrar el pago')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [fetchPagos])

  const modificarPago = useCallback(async (id: string, pago: Partial<Pago>) => {
    try {
      setLoading(true)
      await updatePago(id, pago)
      toast.success('Pago actualizado')
      await fetchPagos()
    } catch (error) {
      toast.error('Error al actualizar el pago')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [fetchPagos])

  const eliminarPago = useCallback(async (id: string) => {
    try {
      setLoading(true)
      await deletePago(id)
      toast.success('Pago eliminado')
      await fetchPagos()
    } catch (error) {
      toast.error('Error al eliminar el pago')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [fetchPagos])

  return {
    loading,
    pagos,
    fetchPagos,
    fetchPagosPorAlumno,
    registrarPago,
    modificarPago,
    eliminarPago
  }
} 