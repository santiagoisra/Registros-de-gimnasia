'use client'

import { useState } from 'react'
import { useAsistencias } from '@/hooks/useAsistencias'
import { Spinner } from '@/components/ui/Spinner'
import { Alert } from '@/components/ui/Alert'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface AsistenciasListProps {
  onRefresh?: () => void
}

export function AsistenciasList({ onRefresh }: AsistenciasListProps) {
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)
  const [filterDate, setFilterDate] = useState<string>('')
  const [filterEstado, setFilterEstado] = useState<'todos' | 'presente' | 'ausente'>('todos')
  const [filterSede, setFilterSede] = useState<'todas' | 'Plaza Arenales' | 'Plaza Terán'>('todas')

  const { asistencias, loading, error, totalPages } = useAsistencias({
    page,
    perPage,
    filterDate,
    filterEstado: filterEstado === 'todos' ? undefined : filterEstado,
    sede: filterSede === 'todas' ? undefined : filterSede
  })

  if (loading && !asistencias?.length) {
    return <Spinner size="lg" className="mx-auto" />
  }

  if (error) {
    return <Alert variant="error">{error.message}</Alert>
  }

  if (!asistencias?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay asistencias registradas</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label htmlFor="filterDate" className="block text-sm font-medium text-gray-700">
            Filtrar por fecha
          </label>
          <input
            type="date"
            id="filterDate"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="filterEstado" className="block text-sm font-medium text-gray-700">
            Filtrar por estado
          </label>
          <select
            id="filterEstado"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value as 'todos' | 'presente' | 'ausente')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="todos">Todos</option>
            <option value="presente">Presente</option>
            <option value="ausente">Ausente</option>
          </select>
        </div>

        <div>
          <label htmlFor="filterSede" className="block text-sm font-medium text-gray-700">
            Filtrar por sede
          </label>
          <select
            id="filterSede"
            value={filterSede}
            onChange={(e) => setFilterSede(e.target.value as 'todas' | 'Plaza Arenales' | 'Plaza Terán')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="todas">Todas</option>
            <option value="Plaza Arenales">Plaza Arenales</option>
            <option value="Plaza Terán">Plaza Terán</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
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
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sede
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notas
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {asistencias.map((asistencia) => (
              <tr key={asistencia.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {asistencia.alumno?.nombre} {asistencia.alumno?.apellido}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(asistencia.fecha), 'PPP', { locale: es })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    asistencia.estado === 'presente' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {asistencia.estado === 'presente' ? 'Presente' : 'Ausente'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {asistencia.sede}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {asistencia.notas || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}