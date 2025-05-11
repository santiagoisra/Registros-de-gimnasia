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
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-8 text-center sm:text-left">Registro de Asistencias</h1>
      
      <div className="grid gap-4 sm:gap-8 grid-cols-1 md:grid-cols-[400px,1fr]">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Nueva Asistencia</h2>
          <AsistenciaForm onSuccess={handleSuccess} />
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Listado de Asistencias</h2>
          <AsistenciasList key={key} />
        </div>
      </div>
    </div>
  )
} 