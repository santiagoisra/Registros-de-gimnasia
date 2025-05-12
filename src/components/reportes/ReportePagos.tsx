'use client'

import { useEffect, useState } from 'react'
import { generateReport } from '@/services/reportGenerator'

export default function ReportePagos() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState<(string | number)[][]>([])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError('')
      try {
        const { rows } = await generateReport({ tipo: 'pagos' })
        setRows(rows)
      } catch {
        setError('Error al cargar los datos de pagos')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-32">Cargando...</div>
  }
  if (error) {
    return <div className="text-red-600">{error}</div>
  }
  if (!rows.length) {
    return <div className="text-gray-500">No hay datos de pagos para mostrar</div>
  }

  // Calcular ingresos mensuales y pagos pendientes si los datos lo permiten
  // Suponiendo que la columna 2 es el monto y la 5 es el estado
  const montoIdx = 2
  const estadoIdx = 5
  const ingresosTotales = rows.reduce((sum, row) => sum + (Number(row[montoIdx]) || 0), 0)
  const pagosPendientes = rows.filter(row => row[estadoIdx] === 'pendiente')
  const totalPendiente = pagosPendientes.reduce((sum, row) => sum + (Number(row[montoIdx]) || 0), 0)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Reporte de Pagos
      </h2>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-600">
            Pagos Pendientes
          </h3>
          <span className="text-lg font-semibold text-red-600">
            ${totalPendiente}
          </span>
        </div>
        <div className="space-y-4">
          {pagosPendientes.length > 0 ? (
            pagosPendientes.map((row, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 bg-red-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {row[1]}
                    </p>
                    <p className="text-xs text-gray-500">
                      Estado: {row[estadoIdx]}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-red-600">
                  ${row[montoIdx]}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No hay pagos pendientes</p>
          )}
        </div>
      </div>
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Ingresos Totales</h3>
        <span className="text-lg font-semibold text-green-600">${ingresosTotales}</span>
      </div>
    </div>
  )
}