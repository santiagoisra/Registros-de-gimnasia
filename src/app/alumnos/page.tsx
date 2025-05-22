'use client'

import { useState } from 'react'
import AlumnosList from '@/components/alumnos/AlumnosList'
import AlumnosActions from '@/components/alumnos/AlumnosActions'

export default function AlumnosPage() {
  const [key, setKey] = useState(0)

  const handleSuccess = () => {
    setKey(prev => prev + 1)
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          Gestión de Alumnos
        </h1>
        <AlumnosActions onSuccess={handleSuccess} />
      </div>
      <AlumnosList key={key} />
    </div>
  )
} 