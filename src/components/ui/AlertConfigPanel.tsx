import { useState, useEffect } from 'react'
import { AlertToggle } from './AlertToggle'
import type { AlertConfig, AlertType } from '@/types'

interface AlertConfigPanelProps {
  config: AlertConfig[]
  onChange: (config: AlertConfig[]) => void | Promise<void>
  disabled?: boolean
}

const defaultConfig: AlertConfig[] = [
  {
    type: 'pago',
    enabled: true,
    reminderDays: 5
  },
  {
    type: 'asistencia',
    enabled: true,
    threshold: 7
  },
  {
    type: 'general',
    enabled: true
  }
]

const alertTypeLabels: Record<AlertType, string> = {
  pago: 'Alertas de pago',
  asistencia: 'Alertas de asistencia',
  general: 'Alertas generales'
}

const alertTypeDescriptions: Record<AlertType, string> = {
  pago: 'Notificaciones sobre vencimientos y estado de pagos',
  asistencia: 'Avisos sobre inasistencias prolongadas',
  general: 'Comunicaciones generales del gimnasio'
}

export function AlertConfigPanel({ config = defaultConfig, onChange, disabled = false }: AlertConfigPanelProps) {
  const [localConfig, setLocalConfig] = useState<AlertConfig[]>(config)

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  const handleToggle = async (type: AlertType, enabled: boolean) => {
    const newConfig = localConfig.map(c => 
      c.type === type ? { ...c, enabled } : c
    )
    setLocalConfig(newConfig)
    await onChange(newConfig)
  }

  const handleThresholdChange = async (type: AlertType, value: number) => {
    const newConfig = localConfig.map(c => 
      c.type === type ? { ...c, threshold: value } : c
    )
    setLocalConfig(newConfig)
    await onChange(newConfig)
  }

  const handleReminderDaysChange = async (type: AlertType, value: number) => {
    const newConfig = localConfig.map(c => 
      c.type === type ? { ...c, reminderDays: value } : c
    )
    setLocalConfig(newConfig)
    await onChange(newConfig)
  }

  return (
    <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900">Configuración de alertas</h3>
      
      <div className="space-y-4">
        {localConfig.map((alert) => (
          <div key={alert.type} className="p-4 bg-white rounded-md shadow-sm">
            <AlertToggle
              isEnabled={alert.enabled}
              onChange={(enabled) => handleToggle(alert.type, enabled)}
              label={alertTypeLabels[alert.type]}
              description={alertTypeDescriptions[alert.type]}
              disabled={disabled}
            />
            
            {alert.enabled && (
              <div className="mt-4 ml-8">
                {alert.type === 'asistencia' && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">
                      Alertar después de
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={alert.threshold}
                      onChange={(e) => handleThresholdChange(alert.type, Number(e.target.value))}
                      className="w-20 px-2 py-1 text-sm border rounded focus:ring-primary focus:border-primary"
                      disabled={disabled}
                      title="Días sin asistir antes de alertar"
                      placeholder="Días"
                    />
                    <span className="text-sm text-gray-600">días sin asistir</span>
                  </div>
                )}
                
                {alert.type === 'pago' && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">
                      Recordar
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={alert.reminderDays}
                      onChange={(e) => handleReminderDaysChange(alert.type, Number(e.target.value))}
                      className="w-20 px-2 py-1 text-sm border rounded focus:ring-primary focus:border-primary"
                      disabled={disabled}
                      title="Días antes del vencimiento para recordar"
                      placeholder="Días"
                    />
                    <span className="text-sm text-gray-600">días antes del vencimiento</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 