'use client'

import { useCallback, useEffect, useRef } from 'react'

interface UseAutoSaveOptions {
  onSave: (value: any) => Promise<void>
  value: any
  delay?: number
  enabled?: boolean
}

export function useAutoSave({
  onSave,
  value,
  delay = 1000,
  enabled = true,
}: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const valueRef = useRef(value)
  const onSaveRef = useRef(onSave)

  // Actualizar las refs cuando cambien las props
  useEffect(() => {
    valueRef.current = value
    onSaveRef.current = onSave
  }, [value, onSave])

  // Limpiar el timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const debouncedSave = useCallback(() => {
    if (!enabled) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        await onSaveRef.current(valueRef.current)
      } catch (error) {
        console.error('Error al auto-guardar:', error)
      }
    }, delay)
  }, [delay, enabled])

  // Llamar a debouncedSave cuando cambie el valor
  useEffect(() => {
    debouncedSave()
  }, [value, debouncedSave])

  return {
    // Forzar guardado inmediato
    saveNow: async () => {
      if (!enabled) return

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      try {
        await onSaveRef.current(valueRef.current)
      } catch (error) {
        console.error('Error al guardar:', error)
        throw error
      }
    },
  }
} 