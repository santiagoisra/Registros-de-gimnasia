import { useState, useEffect } from 'react'
import type { AlertConfig } from '@/types'
// Remover import de getAlertas si no se usa directamente en el hook
// import { getAlertas, Alerta } from '@/services/alertas'
import type { Alerta } from '@/services/alertas'; // Mantener solo el tipo Alerta si se usa

export function useAlertas(config: AlertConfig[]) {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(false)
  // Corregir el tipo de error: usar unknown y verificar si es un Error
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAlertas = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log('Fetching alertas with config:', config)
        // La lógica de fetching real debería estar aquí o ser llamada
        // Si getAlertas se usa, asegurarse de que se importe correctamente.
        // Por ahora, setAlertas([]); simula que no hay fetching real aquí.
        setAlertas([]) 
      } catch (err: unknown) { // Usar unknown en lugar de any
        // Verificar si el error es una instancia de Error y usar su mensaje
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }

    if (config) {
      fetchAlertas()
    }
  }, [config])

  return { alertas, loading, error }
} 