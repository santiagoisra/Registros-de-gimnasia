import { useState } from 'react'
import { useAlertas } from '@/hooks/useAlertas'
import { AlertasDashboard } from './AlertasDashboard'

// La configuración se debe obtener de un contexto global o prop, pero por ahora se deja fija
const defaultConfig = [
  { type: 'pago', enabled: true, reminderDays: 5 },
  { type: 'asistencia', enabled: true, threshold: 7 },
  { type: 'general', enabled: true }
]

export function AlertasContainer() {
  const { alertas, loading, error } = useAlertas(defaultConfig)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [notas, setNotas] = useState<Record<string, string>>({})

  const handleDismiss = (id: string) => {
    setDismissed(prev => new Set(prev).add(id))
  }
  const handleNotaChange = (id: string, nota: string) => {
    setNotas(prev => ({ ...prev, [id]: nota }))
  }

  const alertasFiltradas = alertas.filter(a => !dismissed.has(a.id)).map(a => ({ ...a, notas: notas[a.id] }))

  return (
    <div className="space-y-6">
      {loading && <div className="p-4">Cargando alertas...</div>}
      {error && <div className="p-4 text-red-600">Error: {error}</div>}
      <AlertasDashboard alertas={alertasFiltradas} onDismiss={handleDismiss} onNotaChange={handleNotaChange} />
    </div>
  )
} 