'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'react-hot-toast'
import type { Pago, Alumno } from '@/types'
import { getAlumnos } from '@/services/alumnos'
import { usePagos } from '@/hooks/usePagos'

export default function PagosList() {
  const { pagos, loading: loadingPagos, fetchPagos, eliminarPago } = usePagos()
  const [alumnos, setAlumnos] = useState<Record<string, Alumno>>({})
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [metodoPagoFiltro, setMetodoPagoFiltro] = useState<string>('todos')
  const [pagoAEliminar, setPagoAEliminar] = useState<string | null>(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [alumnosData] = await Promise.all([
        getAlumnos(),
        fetchPagos()
      ])
      // Crear un objeto con los alumnos indexados por ID para búsqueda rápida
      const alumnosMap = alumnosData.reduce((acc, alumno) => {
        acc[alumno.id] = alumno
        return acc
      }, {} as Record<string, Alumno>)
      setAlumnos(alumnosMap)
    } catch {
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminarPago = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este pago? Esta acción no se puede deshacer.')) {
      try {
        await eliminarPago(id)
      } catch (error) {
        console.error('Error al eliminar el pago:', error)
      }
    }
  }

  const pagosFiltrados = pagos.filter(pago => {
    const alumno = alumnos[pago.alumnoId]
    const nombreCompleto = alumno ? `${alumno.nombre} ${alumno.apellido || ''}`.toLowerCase() : ''
    const coincideFiltro = nombreCompleto.includes(filtro.toLowerCase()) ||
      pago.metodoPago.toLowerCase().includes(filtro.toLowerCase()) ||
      pago.estado?.toLowerCase().includes(filtro.toLowerCase()) ||
      pago.monto.toString().includes(filtro)
    
    const coincideMetodoPago = metodoPagoFiltro === 'todos' || pago.metodoPago === metodoPagoFiltro

    return coincideFiltro && coincideMetodoPago
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Últimos Pagos
          </h3>
          <div className="text-sm text-gray-500">
            Total: ${pagosFiltrados.reduce((sum, pago) => sum + pago.monto, 0).toLocaleString()}
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Buscar por nombre de alumno..."
              className="p-2 border rounded"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
            <select
              value={metodoPagoFiltro}
              onChange={(e) => setMetodoPagoFiltro(e.target.value)}
              className="p-2 border rounded"
              aria-label="Filtrar por método de pago"
            >
              <option value="todos">Todos los métodos</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="debito">Débito</option>
              <option value="credito">Crédito</option>
            </select>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 overflow-x-auto">
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pagosFiltrados.map((pago) => {
              const alumno = alumnos[pago.alumnoId]
              return (
                <tr key={pago.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {alumno ? `${alumno.nombre} ${alumno.apellido || ''}` : 'Alumno no encontrado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(pago.fecha), "d 'de' MMMM, yyyy", {
                      locale: es,
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${pago.monto.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pago.metodoPago}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      pago.estado === 'Pagado' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {pago.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleEliminarPago(pago.id)}
                      className="text-red-600 hover:text-red-900 font-medium"
                      aria-label="Eliminar pago"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}