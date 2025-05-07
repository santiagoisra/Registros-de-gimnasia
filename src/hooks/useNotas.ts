'use client'

import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from './useToast'
import type { Nota } from '@/types'
import type { Nota as NotaDB } from '@/types/supabase'
import * as notasService from '@/services/notas'
import { 
  handleDatabaseError,
  validateDateRange,
  validateRequired,
  validateNumericRange
} from '@/utils'
import { PostgrestError } from '@supabase/supabase-js'

interface UseNotasOptions {
  alumnoId?: string
  tipo?: NotaDB['tipo']
  categoria?: Nota['categoria']
  visibleEnReporte?: boolean
  calificacionMin?: number
  calificacionMax?: number
  page?: number
  pageSize?: number
  fechaDesde?: string
  fechaHasta?: string
}

// Función para convertir de modelo frontend a modelo DB
function mapNotaToDB(nota: Partial<Nota>): Partial<NotaDB> {
  return {
    alumno_id: nota.alumnoId,
    fecha: nota.fecha,
    contenido: nota.contenido,
    tipo: nota.tipo as NotaDB['tipo'],
    visible_en_reporte: nota.visibleEnReporte
  }
}

export function useNotas(options: UseNotasOptions = {}) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  // Validar fechas si se proporcionan
  if (options.fechaDesde && options.fechaHasta) {
    validateDateRange(options.fechaDesde, options.fechaHasta)
  }

  // Query principal para obtener notas
  const notasQuery = useQuery({
    queryKey: ['notas', options],
    queryFn: () => Promise.resolve({ data: [], totalPages: 1 }),
    enabled: !!(options.alumnoId || options.tipo || options.visibleEnReporte)
  })

  // Query para estadísticas
  const estadisticasQuery = useQuery({
    queryKey: ['notas-estadisticas', options.alumnoId, options.fechaDesde, options.fechaHasta, options.tipo, options.categoria],
    queryFn: () => Promise.resolve(undefined),
    enabled: !!options.alumnoId
  })

  // Query para notas por período
  const notasPorPeriodoQuery = useQuery({
    queryKey: ['notas-periodo', options.fechaDesde, options.fechaHasta, options.tipo],
    queryFn: () => Promise.resolve(undefined),
    enabled: !!(options.fechaDesde && options.fechaHasta)
  })

  // Mutación para crear nota
  const createNotaMutation = useMutation({
    mutationFn: async () => undefined,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas'] })
      showToast('Nota creada exitosamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'crear nota')
      showToast(err.message, 'error')
      console.error(err)
    }
  })

  // Mutación para actualizar nota
  const updateNotaMutation = useMutation({
    mutationFn: async () => undefined,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas'] })
      showToast('Nota actualizada exitosamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'actualizar nota')
      showToast(err.message, 'error')
      console.error(err)
    }
  })

  // Mutación para eliminar nota
  const deleteNotaMutation = useMutation({
    mutationFn: async () => undefined,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas'] })
      showToast('Nota eliminada exitosamente', 'success')
    },
    onError: (error) => {
      const err = handleDatabaseError(error as Error | PostgrestError, 'eliminar nota')
      showToast(err.message, 'error')
      console.error(err)
    }
  })

  // Función para crear nota con validación
  const handleCreateNota = useCallback(async (data: Partial<Nota>) => {
    try {
      validateRequired(data.alumnoId, 'alumnoId')
      validateRequired(data.fecha, 'fecha')
      validateRequired(data.tipo, 'tipo')
      
      if (data.calificacion !== undefined) {
        validateNumericRange(data.calificacion, 1, 10, 'calificación')
      }

      await createNotaMutation.mutateAsync()
    } catch (error) {
      const err = handleDatabaseError(error as Error | PostgrestError, 'crear nota')
      showToast(err.message, 'error')
      throw err
    }
  }, [createNotaMutation, showToast])

  // Función para actualizar nota con validación
  const handleUpdateNota = useCallback(async (id: string, data: Partial<Nota>) => {
    try {
      if (data.calificacion !== undefined) {
        validateNumericRange(data.calificacion, 1, 10, 'calificación')
      }

      await updateNotaMutation.mutateAsync()
    } catch (error) {
      const err = handleDatabaseError(error as Error | PostgrestError, 'actualizar nota')
      showToast(err.message, 'error')
      throw err
    }
  }, [updateNotaMutation, showToast])

  // Función para eliminar nota
  const handleDeleteNota = useCallback(async (id: string) => {
    try {
      await deleteNotaMutation.mutateAsync()
    } catch (error) {
      const err = handleDatabaseError(error as Error | PostgrestError, 'eliminar nota')
      showToast(err.message, 'error')
      throw err
    }
  }, [deleteNotaMutation, showToast])

  return {
    // Queries
    notas: notasQuery.data?.data || [],
    totalPages: notasQuery.data?.totalPages || 1,
    estadisticas: estadisticasQuery.data,
    notasPorPeriodo: notasPorPeriodoQuery.data,
    
    // Estados de carga y error
    isLoading: notasQuery.isLoading || estadisticasQuery.isLoading || notasPorPeriodoQuery.isLoading,
    isError: notasQuery.isError || estadisticasQuery.isError || notasPorPeriodoQuery.isError,
    error: notasQuery.error || estadisticasQuery.error || notasPorPeriodoQuery.error,

    // Mutaciones
    createNota: handleCreateNota,
    updateNota: handleUpdateNota,
    deleteNota: handleDeleteNota,
    
    // Estados de las mutaciones
    isCreating: createNotaMutation.isPending,
    isUpdating: updateNotaMutation.isPending,
    isDeleting: deleteNotaMutation.isPending
  }
}