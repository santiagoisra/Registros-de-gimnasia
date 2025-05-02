'use client'

import { useState, useEffect } from 'react'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import type { Alumno } from '@/types'
import AlumnoForm from './AlumnoForm'
import { getAlumnos, deleteAlumno } from '@/services/alumnos'

export default function AlumnosList() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [alumnoEditar, setAlumnoEditar] = useState<Alumno | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarAlumnos()
  }, [])

  const cargarAlumnos = async () => {
    try {
      const data = await getAlumnos()
      setAlumnos(data)
    } catch (error) {
      toast.error('Error al cargar los alumnos')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este alumno?')) return
    try {
      await deleteAlumno(id)
      toast.success('Alumno eliminado')
      cargarAlumnos()
    } catch (error) {
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
              Estado
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {alumnos.map((alumno) => (
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
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleEliminar(alumno.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {alumnoEditar && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
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