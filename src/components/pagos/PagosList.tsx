'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'react-hot-toast'
import type { Pago, Alumno } from '@/types'
import { alumnosService } from '@/services/alumnos'
import { usePagos } from '@/hooks/usePagos'
import { PaymentStatusBadge } from '@/components/ui/PaymentStatusBadge'

export default function PagosList() {
  const [alumnos, setAlumnos] = useState<Record<string, Alumno>>({})
  const [filtro, setFiltro] = useState('')
  const [metodoPagoFiltro, setMetodoPagoFiltro] = useState<string>('todos')
  const [loading, setLoading] = useState(true)

  const { 
    pagos, 
    isLoading: loadingPagos, 
    error,
    deletePago: eliminarPago 
  } = usePagos({
    page: 1,
    pageSize: 50
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const { data: alumnosData } = await alumnosService.getAlumnos()
      // Crear un objeto con los alumnos indexados por ID para búsqueda rápida
      const alumnosMap = alumnosData.reduce((acc, alumno) => {
        acc[alumno.id] = alumno
        return acc
      }, {} as Record<string, Alumno>)
      setAlumnos(alumnosMap)
    } catch (error) {
      toast.error('Error al cargar los alumnos')
      console.error('Error al cargar alumnos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEliminarPago = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este pago? Esta acción no se puede deshacer.')) {
      try {
        await eliminarPago(id)
        toast.success('Pago eliminado correctamente')
      } catch (error) {
        console.error('Error al eliminar el pago:', error)
        toast.error('Error al eliminar el pago')
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

  if (loading || loadingPagos) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error al cargar los pagos. Por favor, intenta recargar la página.
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
            Total: ${pagosFiltrados.reduce((sum, pago) => sum + Number(pago.monto), 0).toLocaleString()}
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
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Mercado Pago">Mercado Pago</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
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
                    ${Number(pago.monto).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pago.metodoPago}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <PaymentStatusBadge
                      status={pago.estado === 'Pagado' ? 'al_dia' : 'pendiente'}
                      tooltipContent={`Pago ${pago.estado.toLowerCase()} el ${format(new Date(pago.fecha), "d 'de' MMMM, yyyy", {
                        locale: es,
                      })}`}
                      size="sm"
                    />
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