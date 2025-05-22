'use client'

import { useEffect, useState } from 'react'
import { generateReport } from '@/services/reportGenerator'

export default function ReporteAlumnos() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState<(string | number)[][]>([])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError('')
      try {
        const { rows } = await generateReport({ tipo: 'alumnos' })
        setRows(rows)
      } catch {
        setError('Error al cargar los datos de alumnos')
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
    return <div className="text-gray-500">No hay datos de alumnos para mostrar</div>
  }

  // Calcular promedio de asistencias y alumnos inactivos si los datos lo permiten
  // Suponiendo que la columna 5 es la última asistencia (ajustar si cambia el orden)
  const asistenciasIdx = 4 // Ajustar si cambia el orden de columnas
  const promedioAsistencias = Math.round(
    rows.reduce((sum, row) => sum + (Number(row[asistenciasIdx]) || 0), 0) / rows.length
  )
  // Alumnos inactivos: lógica de ejemplo, ajustar según datos reales
  const alumnosInactivos = rows.filter(row => {
    const ultimaAsistencia = new Date(row[asistenciasIdx])
    const hoy = new Date()
    const diasSinAsistir = Math.floor((hoy.getTime() - ultimaAsistencia.getTime()) / (1000 * 60 * 60 * 24))
    return diasSinAsistir > 7
  })

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Reporte de Alumnos
      </h2>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Promedio de Asistencias Mensuales
          </span>
          <span className="text-lg font-semibold text-gray-900">
            {promedioAsistencias}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary rounded-full h-2"
            style={{ width: `${(promedioAsistencias / 20) * 100}%` }}
          />
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-600">
          Alumnos con Inasistencias Prolongadas
        </h3>
        {alumnosInactivos.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {alumnosInactivos.map((row, i) => (
              <li key={i} className="py-3">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {row[1]}
                    </p>
                    <p className="text-sm text-gray-500">
                      Última asistencia: {new Date(row[asistenciasIdx]).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {row[asistenciasIdx]} asistencias
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">
            No hay alumnos con inasistencias prolongadas
          </p>
        )}
      </div>
    </div>
  )
} 