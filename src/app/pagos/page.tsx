'use client'

import { useState } from 'react'
import PagoForm from '@/components/pagos/PagoForm'
import PagosList from '@/components/pagos/PagosList'
import { PagoFormBulk } from '@/components/pagos/PagoFormBulk'

export default function PagosPage() {
  const [tab, setTab] = useState<'individual' | 'lote'>('individual')

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          Registro de Pagos
        </h1>
        <div className="flex gap-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${tab === 'individual' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setTab('individual')}
          >
            Pago Individual
          </button>
          <button
            className={`px-4 py-2 rounded ${tab === 'lote' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setTab('lote')}
          >
            Pago en Lote
          </button>
        </div>
        {tab === 'individual' ? (
          <PagoForm onSuccess={() => {}} />
        ) : (
          <PagoFormBulk onSuccess={() => {}} />
        )}
      </div>
      <PagosList />
    </div>
  )
} 