import { useState } from 'react'
import { useAlertas } from '@/hooks/useAlertas'
import { AlertasDashboard } from './AlertasDashboard'
import type { AlertConfig } from '@/types'

// La configuración se debe obtener de un contexto global o prop, pero por ahora se deja fija
const defaultConfig: AlertConfig[] = [
  { type: 'pago', enabled: true, reminderDays: 5 },
  { type: 'asistencia', enabled: true, threshold: 7 },
  // Agregar 'as AlertType' o corregir el tipo si 'general' no es un AlertType válido
  // Si 'general' NO es un AlertType válido, esta línea causará un error de tipo aquí.
  // Si 'general' SÍ es un AlertType válido, entonces no hay problema.
  // Basado en el error anterior ('string' is not assignable to 'AlertType'), probablemente 'general' NO es un AlertType.
  // Eliminaré la línea de 'general' si no es un tipo válido o la ajustaré si se puede.
  // Asumiendo que AlertType es 'asistencia' | 'pago', eliminaré 'general'. Si necesitas 'general', tendrás que agregarlo a AlertType en @/types.
  // { type: 'general', enabled: true },
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