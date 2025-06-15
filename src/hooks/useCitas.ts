'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { citasService } from '@/services/citas'
import { useToast } from './useToast'

import { Cita, CitaFilters } from '@/types'

export interface CitaStats {
  totalCitas: number
  citasHoy: number
  citasPendientes: number
  conflictos: number
  utilizacion: number
}

export function useCitas() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  // Query para obtener todas las citas
  const {
    data: citas = [],
    isLoading: citasLoading,
    error: citasError,
    refetch: refetchCitas
  } = useQuery({
    queryKey: ['citas'],
    queryFn: citasService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Query para estadísticas
  const {
    data: stats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['citas-stats'],
    queryFn: citasService.getStats,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })

  // Mutación para crear cita
  const createCitaMutation = useMutation({
    mutationFn: citasService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] })
      queryClient.invalidateQueries({ queryKey: ['citas-stats'] })
      showToast('Cita creada exitosamente', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Error al crear la cita', 'error')
    }
  })

  // Mutación para actualizar cita
  const updateCitaMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Cita> }) => 
      citasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] })
      queryClient.invalidateQueries({ queryKey: ['citas-stats'] })
      showToast('Cita actualizada exitosamente', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Error al actualizar la cita', 'error')
    }
  })

  // Mutación para eliminar cita
  const deleteCitaMutation = useMutation({
    mutationFn: citasService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] })
      queryClient.invalidateQueries({ queryKey: ['citas-stats'] })
      showToast('Cita eliminada exitosamente', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message || 'Error al eliminar la cita', 'error')
    }
  })

  // Funciones de conveniencia
  const getCitas = useCallback(async (filters?: CitaFilters) => {
    try {
      setLoading(true)
      const data = await citasService.getFiltered(filters)
      return data
    } catch (error) {
      console.error('Error getting citas:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const getCitasByDateRange = useCallback(async (
    startDate: Date, 
    endDate: Date, 
    filters?: CitaFilters
  ) => {
    try {
      const data = await citasService.getByDateRange(startDate, endDate, filters)
      return data
    } catch (error) {
      console.error('Error getting citas by date range:', error)
      throw error
    }
  }, [])

  const getCitasStats = useCallback(async (): Promise<CitaStats> => {
    try {
      const data = await citasService.getStats()
      return data
    } catch (error) {
      console.error('Error getting citas stats:', error)
      throw error
    }
  }, [])

  const checkTimeSlotAvailability = useCallback(async (
    date: Date,
    duration: number,
    buffertime: number,
    excludeCitaId?: string
  ) => {
    try {
      const data = await citasService.checkAvailability(
        date, 
        duration, 
        buffertime, 
        excludeCitaId
      )
      return data
    } catch (error) {
      console.error('Error checking availability:', error)
      throw error
    }
  }, [])

  const createCita = useCallback(async (citaData: Partial<Cita>) => {
    return createCitaMutation.mutateAsync(citaData)
  }, [createCitaMutation])

  const updateCita = useCallback(async (id: string, citaData: Partial<Cita>) => {
    return updateCitaMutation.mutateAsync({ id, data: citaData })
  }, [updateCitaMutation])

  const deleteCita = useCallback(async (id: string): Promise<void> => {
    return deleteCitaMutation.mutateAsync(id)
  }, [deleteCitaMutation])

  const updateCitaStatus = useCallback(async (id: string, status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'): Promise<void> => {
    await updateCitaMutation.mutateAsync({ id, data: { status } })
  }, [updateCitaMutation])

  const duplicateCita = useCallback(async (citaId: string, newDate: Date) => {
    try {
      const originalCita = citas.find(c => c.id === citaId)
      if (!originalCita) throw new Error('Cita no encontrada')

      const newCita = {
        ...originalCita,
        id: undefined,
        date: newDate,
        status: 'scheduled' as const,
        created_at: undefined,
        updated_at: undefined
      }

      return createCita(newCita)
    } catch (error) {
      console.error('Error duplicating cita:', error)
      throw error
    }
  }, [citas, createCita])

  const bulkUpdateStatus = useCallback(async (citaIds: string[], status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show') => {
    try {
      setLoading(true)
      await Promise.all(
        citaIds.map(id => updateCitaStatus(id, status))
      )
      showToast(`${citaIds.length} citas actualizadas`, 'success')
    } catch (error) {
      console.error('Error bulk updating citas:', error)
      showToast('Error al actualizar las citas', 'error')
    } finally {
      setLoading(false)
    }
  }, [updateCitaStatus, showToast])

  const getConflicts = useCallback(async (date: Date) => {
    try {
      const data = await citasService.getConflicts(date)
      return data
    } catch (error) {
      console.error('Error getting conflicts:', error)
      throw error
    }
  }, [])

  const exportCitas = useCallback(async (filters?: CitaFilters, format: 'csv' | 'ical' = 'csv') => {
    try {
      setLoading(true)
      const data = await citasService.export(filters, format)
      return data
    } catch (error) {
      console.error('Error exporting citas:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    // Data
    citas,
    stats,
    
    // Loading states
    loading: loading || citasLoading,
    statsLoading,
    
    // Mutation states
    creating: createCitaMutation.isPending,
    updating: updateCitaMutation.isPending,
    deleting: deleteCitaMutation.isPending,
    
    // Errors
    error: citasError,
    
    // Functions
    getCitas,
    getCitasByDateRange,
    getCitasStats,
    checkTimeSlotAvailability,
    createCita,
    updateCita,
    deleteCita,
    updateCitaStatus,
    duplicateCita,
    bulkUpdateStatus,
    getConflicts,
    exportCitas,
    refetchCitas,
    
    // Utils
    invalidateQueries: () => {
      queryClient.invalidateQueries({ queryKey: ['citas'] })
      queryClient.invalidateQueries({ queryKey: ['citas-stats'] })
    }
  }
}