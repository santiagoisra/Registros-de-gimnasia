'use client'

import { useState, useEffect } from 'react'
import { alumnosService } from '@/services/alumnos'
import type { Alumno } from '@/types'

interface UseAlumnosOptions {
  autoFetch?: boolean
}

interface UseAlumnosReturn {
  alumnos: Alumno[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useAlumnos(options: UseAlumnosOptions = { autoFetch: true }): UseAlumnosReturn {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchAlumnos = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await alumnosService.getAlumnos()
      setAlumnos(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar alumnos'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (options.autoFetch) {
      fetchAlumnos()
    }
  }, [options.autoFetch])

  return {
    alumnos,
    loading,
    error,
    refetch: fetchAlumnos
  }
} 