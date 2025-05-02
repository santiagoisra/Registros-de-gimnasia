'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import type { Alumno, Ubicacion } from '@/types'
import { getAlumnos } from '@/services/alumnos'
import { createAsistenciasBulk } from '@/services/asistencias'

interface AsistenciaFormProps {
  onSuccess?: () => void
}

const ubicaciones: Ubicacion[] = ['Plaza Arenales', 'Plaza Terán']

export default function AsistenciaForm({ onSuccess }: AsistenciaFormProps) {
  const [fecha, setFecha] = useState<Date>(new Date())
  const [ubicacion, setUbicacion] = useState<Ubicacion>('Plaza Arenales')
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState<string[]>([])
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar alumnos al montar el componente
  useEffect(() => {
    cargarAlumnos()
  }, [])

  const cargarAlumnos = async () => {
    try {
      const data = await getAlumnos()
      setAlumnos(data.filter(alumno => alumno.activo))
    } catch (error) {
      toast.error('Error al cargar los alumnos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (alumnosSeleccionados.length === 0) {
      toast.error('Selecciona al menos un alumno')
      return
    }

    try {
      const asistencias = alumnosSeleccionados.map(alumnoId => ({
        alumnoId,
        fecha: fecha.toISOString(),
        ubicacion
      }))

      await createAsistenciasBulk(asistencias)
      toast.success('Asistencias registradas')
      setAlumnosSeleccionados([])
      onSuccess?.()
    } catch (error) {
      toast.error('Error al registrar las asistencias')
    }
  }

  const toggleAlumno = (id: string) => {
    setAlumnosSeleccionados(prev =>
      prev.includes(id)
        ? prev.filter(alumnoId => alumnoId !== id)
        : [...prev, id]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha
          </label>
          <DatePicker
            selected={fecha}
            onChange={(date: Date) => setFecha(date)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            dateFormat="dd/MM/yyyy"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación
          </label>
          <select
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value as Ubicacion)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            {ubicaciones.map((ubi) => (
              <option key={ubi} value={ubi}>
                {ubi}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alumnos Presentes
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {alumnos.map((alumno) => (
            <div
              key={alumno.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                alumnosSeleccionados.includes(alumno.id)
                  ? 'bg-primary/10 border-primary'
                  : 'border-gray-200 hover:border-primary'
              }`}
              onClick={() => toggleAlumno(alumno.id)}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={alumnosSeleccionados.includes(alumno.id)}
                  onChange={() => toggleAlumno(alumno.id)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="ml-3 text-sm">{alumno.nombre}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={alumnosSeleccionados.length === 0}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Registrar Asistencias
        </button>
      </div>
    </form>
  )
} 