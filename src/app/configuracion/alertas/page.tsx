'use client'
import { useState } from 'react'
import { AlertConfigPanel } from '@/components/ui/AlertConfigPanel'
import type { AlertConfig } from '@/types'

const defaultConfig: AlertConfig[] = [
  { type: 'pago', enabled: true, reminderDays: 5 },
  { type: 'asistencia', enabled: true, threshold: 7 },
  { type: 'general', enabled: true }
]

export default function ConfiguracionAlertasPage() {
  const [config, setConfig] = useState<AlertConfig[]>(defaultConfig)

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Configuración de Alertas</h1>
      <AlertConfigPanel config={config} onChange={setConfig} />
    </div>
  )
} 