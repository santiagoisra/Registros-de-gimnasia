'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'react-hot-toast'
import type { Pago } from '@/types'
import { getPagos } from '@/services/pagos'

interface PagosListProps {
  onSuccess?: () => void
}

export default function PagosList({ onSuccess }: PagosListProps) {
  const [pagos, setPagos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarPagos()
  }, [])

  const cargarPagos = async () => {
    try {
      const data = await getPagos()
      setPagos(data)
    } catch (error) {
      toast.error('Error al cargar los pagos')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Últimos Pagos
        </h3>
        <div className="text-sm text-gray-500">
          Total: ${pagos.reduce((sum, pago) => sum + pago.monto, 0)}
        </div>
      </div>
      <div className="border-t border-gray-200">
        <ul role="list" className="divide-y divide-gray-200">
          {pagos.map((pago) => (
            <li key={pago.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {pago.alumnos.nombre}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(pago.fecha), "d 'de' MMMM, yyyy", {
                      locale: es,
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    Período: {format(new Date(pago.periodoDesde), "MMM yyyy", {
                      locale: es,
                    })}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm font-medium text-gray-900">
                    ${pago.monto}
                  </div>
                  <div className="text-xs text-gray-500">
                    {pago.metodoPago}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 