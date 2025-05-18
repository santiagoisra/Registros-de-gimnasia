import { useState } from 'react'
import type { Alerta } from '@/services/alertas'
import { Alert } from '../ui/Alert'

interface AlertasDashboardProps {
  alertas: Alerta[]
  onDismiss?: (id: string) => void
  onNotaChange?: (id: string, nota: string) => void
}

export function AlertasDashboard({ alertas, onDismiss, onNotaChange }: AlertasDashboardProps) {
  const [notas, setNotas] = useState<Record<string, string>>({})

  const handleNotaChange = (id: string, value: string) => {
    setNotas((prev) => ({ ...prev, [id]: value }))
    onNotaChange?.(id, value)
  }

  if (alertas.length === 0) {
    return <div className="p-4 text-gray-500">No hay alertas activas 🎉</div>
  }

  return (
    <div className="space-y-4">
      {alertas.map((alerta) => (
        <Alert key={alerta.id} variant={alerta.tipo === 'pago' ? 'error' : 'warning'}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{alerta.nombre}</span>
              {alerta.dismissible && (
                <button
                  className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => onDismiss?.(alerta.id)}
                >
                  Descartar
                </button>
              )}
            </div>
            <div>{alerta.mensaje}</div>
            <textarea
              className="w-full p-2 border rounded text-sm"
              placeholder="Agregar nota..."
              value={notas[alerta.id] || alerta.notas || ''}
              onChange={e => handleNotaChange(alerta.id, e.target.value)}
              rows={2}
            />
          </div>
        </Alert>
      ))}
    </div>
  )
} 