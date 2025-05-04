'use client'

import { useState } from 'react'
import { useAsistencias } from '@/hooks/useAsistencias'
import { useAlumnos } from '@/hooks/useAlumnos'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import type { Alumno } from '@/types'

interface AsistenciaFormProps {
  onSuccess?: () => void
}

export function AsistenciaForm({ onSuccess }: AsistenciaFormProps) {
  const [alumno_id, setAlumnoId] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [estado, setEstado] = useState<'presente' | 'ausente'>('presente')
  const [notas, setNotas] = useState('')
  const [sede, setSede] = useState<'Plaza Arenales' | 'Plaza Terán'>('Plaza Arenales')
  const [error, setError] = useState<string | null>(null)

  const { crearAsistencia, loading } = useAsistencias()
  const { alumnos } = useAlumnos()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await crearAsistencia({
        alumno_id,
        fecha,
        estado,
        notas,
        sede
      })

      setAlumnoId('')
      setFecha(new Date().toISOString().split('T')[0])
      setEstado('presente')
      setNotas('')
      setSede('Plaza Arenales')

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar la asistencia')
    }
  }

  if (loading) {
    return <Spinner size="lg" className="mx-auto" />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <div>
        <label htmlFor="alumno" className="block text-sm font-medium text-gray-700">
          Alumno
        </label>
        <select
          id="alumno"
          value={alumno_id}
          onChange={(e) => setAlumnoId(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Seleccionar alumno</option>
          {alumnos?.map((alumno: Alumno) => (
            <option key={alumno.id} value={alumno.id}>
              {alumno.apellido}, {alumno.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
          Fecha
        </label>
        <input
          type="date"
          id="fecha"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="sede" className="block text-sm font-medium text-gray-700">
          Sede
        </label>
        <select
          id="sede"
          value={sede}
          onChange={(e) => setSede(e.target.value as 'Plaza Arenales' | 'Plaza Terán')}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="Plaza Arenales">Plaza Arenales</option>
          <option value="Plaza Terán">Plaza Terán</option>
        </select>
      </div>

      <div>
        <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
          Estado
        </label>
        <select
          id="estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value as 'presente' | 'ausente')}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="presente">Presente</option>
          <option value="ausente">Ausente</option>
        </select>
      </div>

      <div>
        <label htmlFor="notas" className="block text-sm font-medium text-gray-700">
          Notas
        </label>
        <textarea
          id="notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}