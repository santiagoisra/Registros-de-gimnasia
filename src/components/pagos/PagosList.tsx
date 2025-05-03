'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'react-hot-toast'
import type { Pago } from '@/types'
import { getPagos } from '@/services/pagos'

export default function PagosList() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarPagos()
  }, [])

  const cargarPagos = async () => {
    try {
      const data = await getPagos()
      setPagos(data)
    } catch {
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alumno
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Método de Pago
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pagos.map((pago) => (
              <tr key={pago.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {pago.alumnoId || 'Alumno'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(new Date(pago.fecha), "d 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ${pago.monto}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {pago.metodoPago}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {pago.estado}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}