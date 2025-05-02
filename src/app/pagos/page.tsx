'use client'

import { useState } from 'react'
import PagoForm from '@/components/pagos/PagoForm'
import PagosList from '@/components/pagos/PagosList'

export default function PagosPage() {
  const [key, setKey] = useState(0)

  const handleSuccess = () => {
    setKey(prev => prev + 1)
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          Registro de Pagos
        </h1>
        <PagoForm onSuccess={handleSuccess} />
      </div>
      <PagosList key={key} />
    </div>
  )
} 