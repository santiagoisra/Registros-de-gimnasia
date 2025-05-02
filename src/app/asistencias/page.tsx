'use client'

import { useState } from 'react'
import AsistenciaForm from '@/components/asistencias/AsistenciaForm'
import AsistenciasList from '@/components/asistencias/AsistenciasList'

export default function AsistenciasPage() {
  const [key, setKey] = useState(0)

  const handleSuccess = () => {
    setKey(prev => prev + 1)
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          Registro de Asistencias
        </h1>
        <AsistenciaForm onSuccess={handleSuccess} />
      </div>
      <AsistenciasList key={key} />
    </div>
  )
} 