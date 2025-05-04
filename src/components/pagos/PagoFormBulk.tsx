'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import type { Alumno, MetodoPago } from '@/types'
import { getAlumnos } from '@/services/alumnos'
import { usePagos } from '@/hooks/usePagos'

interface PagoFormBulkProps {
  onSuccess?: () => void
}

const metodosPago: MetodoPago[] = ['Efectivo', 'Transferencia', 'Mercado Pago']

export default function PagoFormBulk({ onSuccess }: PagoFormBulkProps) {
  const [fecha, setFecha] = useState<Date>(new Date())
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Efectivo')
  const [periodoDesde, setPeriodoDesde] = useState<Date>(new Date())
  const [periodoHasta, setPeriodoHasta] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() + 1)))
  const [notas, setNotas] = useState<string>('')
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [loadingAlumnos, setLoadingAlumnos] = useState(true)
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState<string[]>([])
  const [montos, setMontos] = useState<Record<string, string>>({})
  const { registrarPagosBulk, loading: loadingPagos } = usePagos()
  const [mes, setMes] = useState<number>(fecha.getMonth() + 1)
  const [anio, setAnio] = useState<number>(fecha.getFullYear())
  const [filtroAlumnos, setFiltroAlumnos] = useState('')
  const [mostrarDetalles, setMostrarDetalles] = useState(false)

  useEffect(() => {
    cargarAlumnos()
  }, [])

  useEffect(() => {
    setMes(fecha.getMonth() + 1)
    setAnio(fecha.getFullYear())
  }, [fecha])

  const cargarAlumnos = async () => {
    try {
      const data = await getAlumnos()
      setAlumnos(data.filter(alumno => alumno.activo))
    } catch {
      toast.error('Error al cargar los alumnos')
    } finally {
      setLoadingAlumnos(false)
    }
  }

  const toggleAlumno = (id: string) => {
    setAlumnosSeleccionados(prev =>
      prev.includes(id)
        ? prev.filter(alumnoId => alumnoId !== id)
        : [...prev, id]
    )
  }

  const handleMontoChange = (id: string, value: string) => {
    setMontos(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (alumnosSeleccionados.length === 0) {
      toast.error('Selecciona al menos un alumno')
      return
    }
    const pagos = alumnosSeleccionados.map(alumnoId => ({
      alumnoId,
      fecha: fecha.toISOString().split('T')[0],
      monto: Number(montos[alumnoId] || 0),
      metodoPago,
      periodoDesde: periodoDesde.toISOString().split('T')[0],
      periodoHasta: periodoHasta.toISOString().split('T')[0],
      notas,
      estado: 'Pagado',
      mes,
      anio,
    }))
    if (pagos.some(p => !p.monto || p.monto <= 0)) {
      toast.error('Todos los alumnos deben tener un monto válido')
      return
    }
    try {
      await registrarPagosBulk(pagos)
      setAlumnosSeleccionados([])
      setMontos({})
      onSuccess?.()
    } catch {
      toast.error('Error al registrar los pagos')
    }
  }

  const alumnosFiltrados = alumnos.filter(alumno =>
    alumno.nombre.toLowerCase().includes(filtroAlumnos.toLowerCase())
  )

  if (loadingAlumnos) {
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
            Fecha de Pago
          </label>
          <DatePicker
            selected={fecha}
            onChange={(date: Date) => setFecha(date)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            dateFormat="dd/MM/yyyy"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" id="metodo-pago-label">
            Método de Pago
          </label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            aria-labelledby="metodo-pago-label"
          >
            {metodosPago.map((metodo) => (
              <option key={metodo} value={metodo}>
                {metodo}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <button
          type="button"
          onClick={() => setMostrarDetalles(!mostrarDetalles)}
          className="flex items-center text-sm text-gray-600 hover:text-primary focus:outline-none focus:text-primary"
        >
          <svg
            className={`h-5 w-5 transform transition-transform ${mostrarDetalles ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span className="ml-2">Detalles adicionales del pago</span>
        </button>

        {mostrarDetalles && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período Desde
              </label>
              <DatePicker
                selected={periodoDesde}
                onChange={(date: Date) => setPeriodoDesde(date)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                dateFormat="dd/MM/yyyy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período Hasta
              </label>
              <DatePicker
                selected={periodoHasta}
                onChange={(date: Date) => setPeriodoHasta(date)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                dateFormat="dd/MM/yyyy"
                minDate={periodoDesde}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" id="mes-label">
                Mes
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={mes}
                onChange={e => setMes(Number(e.target.value))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
                aria-labelledby="mes-label"
                placeholder="Mes (1-12)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" id="anio-label">
                Año
              </label>
              <input
                type="number"
                min={2000}
                max={2100}
                value={anio}
                onChange={e => setAnio(Number(e.target.value))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
                aria-labelledby="anio-label"
                placeholder="Año"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Alumnos a Pagar
          </label>
          <span className="text-xs text-gray-500">
            {alumnosSeleccionados.length} seleccionado{alumnosSeleccionados.length === 1 ? '' : 's'}
          </span>
        </div>
        <input
          type="text"
          value={filtroAlumnos}
          onChange={(e) => setFiltroAlumnos(e.target.value)}
          placeholder="Buscar alumnos..."
          className="w-full mb-4 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {alumnosFiltrados.map((alumno) => (
            <div
              key={alumno.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                alumnosSeleccionados.includes(alumno.id)
                  ? 'bg-primary/10 border-primary'
                  : 'border-gray-200 hover:border-primary'
              }`}
              onClick={() => toggleAlumno(alumno.id)}
              tabIndex={0}
              role="checkbox"
              aria-checked={alumnosSeleccionados.includes(alumno.id) ? "true" : "false"}
              onKeyDown={e => {
                if (e.key === ' ' || e.key === 'Enter') toggleAlumno(alumno.id)
              }}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={alumnosSeleccionados.includes(alumno.id)}
                  onChange={() => toggleAlumno(alumno.id)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  tabIndex={-1}
                  aria-label={`Seleccionar ${alumno.nombre}`}
                />
                <span className="ml-3 text-sm">{alumno.nombre}</span>
              </div>
              {alumnosSeleccionados.includes(alumno.id) && (
                <div className="mt-2">
                  <label className="block text-xs text-gray-500 mb-1">Monto</label>
                  <input
                    type="number"
                    value={montos[alumno.id] || alumno.precioMensual || ''}
                    onChange={e => handleMontoChange(alumno.id, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    className="block w-full rounded-md border-2 border-primary/50 focus:border-primary focus:ring-primary sm:text-base py-2 px-3 text-base"
                    placeholder="0.00"
                    min="0"
                    required
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas (opcional)
        </label>
        <textarea
          value={notas}
          onChange={e => setNotas(e.target.value)}
          rows={2}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="Notas adicionales..."
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={alumnosSeleccionados.length === 0 || loadingPagos}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingPagos ? 'Registrando...' : 'Registrar Pagos'}
        </button>
      </div>

      {loadingPagos && (
        <div className="mt-4 text-primary text-center animate-pulse">Registrando pagos en lote...</div>
      )}
      {!loadingPagos && alumnosSeleccionados.length === 0 && (
        <div className="mt-4 text-green-600 text-center">¡Pagos registrados correctamente!</div>
      )}
    </form>
  )
} 