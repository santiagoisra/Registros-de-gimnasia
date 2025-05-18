import { useState, useEffect } from 'react'
import type { AlertConfig } from '@/types'
import { getAlertas, Alerta } from '@/services/alertas'

export function useAlertas(config: AlertConfig[]) {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getAlertas(config)
      .then(setAlertas)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [JSON.stringify(config)])

  return { alertas, loading, error }
} 