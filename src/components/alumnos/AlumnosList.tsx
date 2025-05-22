'use client'

import { useState, useEffect, useCallback } from 'react'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import type { Alumno, Shift } from '@/types'
import AlumnoForm from './AlumnoForm'
import { alumnosService } from '@/services/alumnos'
import Pagination from '@/components/ui/Pagination'

export default function AlumnosList() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [alumnoEditar, setAlumnoEditar] = useState<Alumno | null>(null)
  const [loading, setLoading] = useState(true)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [shiftFilter, setShiftFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const perPage = 10

  const cargarAlumnos = useCallback(async () => {
    setLoading(true)
    try {
      const { data, totalPages } = await alumnosService.getAlumnos({
        page,
        perPage,
        activo: true,
        shift_id: shiftFilter || undefined,
      })
      setAlumnos(data)
      setTotalPages(totalPages)
    } catch {
      toast.error('Error al cargar los alumnos')
    } finally {
      setLoading(false)
    }
  }, [page, perPage, shiftFilter])

  useEffect(() => {
    cargarAlumnos()
    fetch('/api/shifts')
      .then(res => res.json())
      .then(data => setShifts(data))
      .catch(() => setShifts([]))
  }, [shiftFilter, page, cargarAlumnos])

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este alumno?')) return
    try {
      await alumnosService.deleteAlumno(id)
      toast.success('Alumno eliminado')
      cargarAlumnos()
    } catch {
      toast.error('Error al eliminar el alumno')
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
    <div className="overflow-x-auto">
      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="shiftFilter" className="font-medium text-gray-700">Filtrar por turno:</label>
        <select
          id="shiftFilter"
          value={shiftFilter}
          onChange={e => { setShiftFilter(e.target.value); setPage(1) }}
          className="border rounded px-2 py-1"
        >
          <option value="">Todos</option>
          {shifts.map(shift => (
            <option key={shift.id} value={shift.id}>
              {shift.name} ({shift.start_time} - {shift.end_time})
            </option>
          ))}
        </select>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Teléfono
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Precio Mensual
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Turno
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {alumnos.map((alumno) => {
            const turno = shifts.find(s => s.id === alumno.shift_id)
            return (
              <tr key={alumno.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{alumno.nombre}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{alumno.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{alumno.telefono}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${alumno.precioMensual}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">{turno ? `${turno.name} (${turno.start_time} - ${turno.end_time})` : 'Sin turno'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      alumno.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {alumno.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setAlumnoEditar(alumno)}
                    className="text-primary hover:text-primary/80 mr-3"
                    title="Editar alumno"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEliminar(alumno.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Eliminar alumno"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
      {alumnoEditar && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 max-h-screen overflow-y-auto">
            <h2 className="text-lg font-medium mb-4">Editar Alumno</h2>
            <AlumnoForm
              alumno={alumnoEditar}
              onClose={() => setAlumnoEditar(null)}
              onSuccess={cargarAlumnos}
            />
          </div>
        </div>
      )}
    </div>
  )
}