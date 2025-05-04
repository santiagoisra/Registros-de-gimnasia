'use client'

import { useState } from 'react'
import { AsistenciaForm } from '@/components/asistencias/AsistenciaForm'
import { AsistenciasList } from '@/components/asistencias/AsistenciasList'

export default function AsistenciasPage() {
  const [key, setKey] = useState(0)

  const handleSuccess = () => {
    setKey(prev => prev + 1)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Registro de Asistencias</h1>
      
      <div className="grid gap-8 md:grid-cols-[400px,1fr]">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Nueva Asistencia</h2>
          <AsistenciaForm onSuccess={handleSuccess} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Listado de Asistencias</h2>
          <AsistenciasList key={key} />
        </div>
      </div>
    </div>
  )
} 