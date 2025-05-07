'use client'

import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useHistorialPrecios } from '@/hooks/useHistorialPrecios'
import { formatDate } from '@/utils'
import { useState } from 'react'

interface PriceHistorySectionProps {
  alumnoId: string
}

export function PriceHistorySection({ alumnoId }: PriceHistorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { precios, loading, error } = useHistorialPrecios({ autoFetch: true })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-lg">
        Error al cargar el historial de precios: {error.message}
      </div>
    )
  }

  if (!precios?.length) {
    return (
      <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg">
        No hay historial de precios registrado
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Historial de precios</h3>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-500 bg-transparent border-none p-0"
          title={isExpanded ? 'Ocultar historial' : 'Mostrar historial'}
        >
          <ChevronDownIcon 
            className={`h-5 w-5 transform transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {precios.map((precio, index) => (
            <div
              key={precio.id}
              className={`p-4 rounded-lg ${
                index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {precio.moneda} {precio.precio}
                    {index === 0 && (
                      <span className="ml-2 text-xs font-medium text-green-800 bg-green-100 px-2 py-0.5 rounded-full">
                        Actual
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Desde: {formatDate(precio.fechaDesde)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{precio.servicio}</p>
                  <p className="mt-1 text-sm text-gray-500">{precio.moneda}</p>
                </div>
              </div>
              {precio.notas && (
                <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                  {precio.notas}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 