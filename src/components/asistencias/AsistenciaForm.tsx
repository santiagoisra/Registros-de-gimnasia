'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAsistencias } from '@/hooks/useAsistencias'
import { useAlumnos } from '@/hooks/useAlumnos'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import type { Alumno, Shift } from '@/types'

interface AsistenciaFormProps {
  onSuccess?: () => void
}

export function AsistenciaForm({ onSuccess }: AsistenciaFormProps) {
  const [alumno_id, setAlumnoId] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [estado, setEstado] = useState<'presente' | 'ausente'>('presente')
  const [sede, setSede] = useState<'Plaza Arenales' | 'Plaza Terán'>('Plaza Arenales')
  const [error, setError] = useState<string | null>(null)
  const [shifts, setShifts] = useState<Shift[]>([])

  const { crearAsistencia, loading } = useAsistencias()
  const { alumnos, refetch } = useAlumnos()

  useEffect(() => {
    fetch('/api/shifts')
      .then(res => res.json())
      .then(data => setShifts(data.filter((s: Shift) => s.is_active)))
      .catch(() => setShifts([]))
  }, [])

  useEffect(() => {
    refetch();
  }, [refetch]);

  const alumnoSeleccionado = useMemo(() => alumnos?.find(a => a.id === alumno_id), [alumno_id, alumnos])
  const shiftAsignado = useMemo(() => shifts.find(s => s.id === alumnoSeleccionado?.shift_id), [alumnoSeleccionado, shifts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await crearAsistencia({
        alumno_id,
        fecha,
        estado,
        sede
      })

      setAlumnoId('')
      setFecha(new Date().toISOString().split('T')[0])
      setEstado('presente')
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
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base sm:text-sm min-h-[44px]"
        >
          <option value="">Seleccionar alumno</option>
          {alumnos?.map((alumno: Alumno) => (
            <option key={alumno.id} value={alumno.id}>
              {alumno.apellido ? `${alumno.apellido}, ${alumno.nombre}` : alumno.nombre}
            </option>
          ))}
        </select>
      </div>

      {alumnoSeleccionado && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Turno asignado</label>
          <div className="mt-1 text-base font-semibold">
            {shiftAsignado ? `${shiftAsignado.name} (${shiftAsignado.start_time.slice(0,5)} - ${shiftAsignado.end_time.slice(0,5)})` : <span className="text-xs text-gray-400">No tiene turno asignado</span>}
          </div>
        </div>
      )}

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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base sm:text-sm min-h-[44px]"
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base sm:text-sm min-h-[44px]"
        >
          <option value="Plaza Arenales">Plaza Arenales</option>
          <option value="Plaza Terán">Plaza Terán</option>
        </select>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => setEstado('presente')}
          className={`flex-1 py-4 rounded-lg text-lg font-bold border-2 ${estado === 'presente' ? 'bg-green-500 text-white border-green-600' : 'bg-white text-green-700 border-green-300'} transition-colors`}
        >
          Presente
        </button>
        <button
          type="button"
          onClick={() => setEstado('ausente')}
          className={`flex-1 py-4 rounded-lg text-lg font-bold border-2 ${estado === 'ausente' ? 'bg-red-500 text-white border-red-600' : 'bg-white text-red-700 border-red-300'} transition-colors`}
        >
          Ausente
        </button>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !alumno_id}
          className="inline-flex justify-center py-3 px-4 sm:py-2 sm:px-4 border border-transparent shadow-sm text-base sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px]"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}