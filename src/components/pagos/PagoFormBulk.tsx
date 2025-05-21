'use client'

import { useState } from 'react'
//import { toast } from 'react-hot-toast' // Comentamos toast ya que no se usa en la lógica actual
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import type { MetodoPago } from '@/types'
import { usePagos } from '@/hooks/usePagos'
import { useAlumnos } from '@/hooks/useAlumnos'
import { useToast } from '@/hooks/useToast'
//import { Spinner } from '@/components/ui/Spinner'
//import { Input } from '@/components/ui/Input'
//import { classNames } from '@/utils/classNames'
//import { classNames } from '@/utils/classNames'

export function PagoFormBulk() {
  const [fecha, setFecha] = useState<Date>(new Date())
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Efectivo')
  const { showToast } = useToast()
  const [periodoDesde, setPeriodoDesde] = useState<Date>(new Date())
  const [periodoHasta, setPeriodoHasta] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() + 1)))
  const [notas, setNotas] = useState<string>('')
  const { alumnos, isLoading: loadingAlumnos } = useAlumnos()
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState<string[]>([])
  // const [montos, setMontos] = useState<Record<string, string>>({}) // Comentamos montos ya que no se usa en la lógica actual
  const { isCreating: loadingPagos } = usePagos()
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1)
  const [anio, setAnio] = useState<number>(new Date().getFullYear())
  const [filtroAlumnos, setFiltroAlumnos] = useState('')
  const [mostrarDetalles, setMostrarDetalles] = useState(false)
  const [pagosRegistrados, setPagosRegistrados] = useState(false)

  const toggleAlumno = (id: string) => {
    setAlumnosSeleccionados(prev =>
      prev.includes(id)
        ? prev.filter(alumnoId => alumnoId !== id)
        : [...prev, id]
    )
    setPagosRegistrados(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (alumnosSeleccionados.length === 0) {
      showToast('Selecciona al menos un alumno para generar pagos.', 'success')
      return
    }

    // La lógica de mapeo de alumnos a pagos y validación de montos está comentada temporalmente
    /*
    const pagos = alumnosSeleccionados.map(alumnoId => {
      const monto = parseFloat(montos[alumnoId] || '0')
      if (isNaN(monto) || monto <= 0) {
        toast.error(`Ingresa un monto válido para el alumno ${alumnoId}`)
        return null // Omitir este pago si el monto no es válido
      }

      // Asegurarse de que las fechas están en formato YYYY-MM-DD
      const fechaPagoStr = new Date().toISOString().split('T')[0]
      const periodoDesdeStr = periodoDesde.toISOString().split('T')[0]
      const periodoHastaStr = periodoHasta.toISOString().split('T')[0]

      return {
        alumnoId,
        fecha: fechaPagoStr,
        monto,
        metodoPago: metodoPago as MetodoPago,
        periodoDesde: periodoDesdeStr,
        periodoHasta: periodoHastaStr,
        notas,
        estado: 'Pagado' as const,
        mes,
        anio,
      }
    }).filter(p => p !== null) // Filtrar los pagos nulos (con monto inválido)

    if (pagos.length === 0) {
      // Esto no debería pasar si ya validamos, pero es un safety check
      return
    }
    */

    // TODO: Implementar funcionalidad de creación masiva de pagos
    showToast('Funcionalidad de creación masiva pendiente de implementar.', 'success')
  }

  const alumnosFiltrados = alumnos.filter(alumno =>
    alumno.nombre.toLowerCase().includes(filtroAlumnos.toLowerCase())
  )

  const handleFechaChange = (date: Date | null) => {
    const nuevaFecha = date || new Date()
    setFecha(nuevaFecha)
    setMes(nuevaFecha.getMonth() + 1)
    setAnio(nuevaFecha.getFullYear())
  }

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
            onChange={handleFechaChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            dateFormat="dd/MM/yyyy"
            showPopperArrow={false}
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
            {/* {metodosPago.map((metodo) => (
              <option key={metodo} value={metodo}>
                {metodo}
              </option>
            ))} */}
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
                onChange={(date: Date | null) => setPeriodoDesde(date || new Date())}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                dateFormat="dd/MM/yyyy"
                showPopperArrow={false}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período Hasta
              </label>
              <DatePicker
                selected={periodoHasta}
                onChange={(date: Date | null) => setPeriodoHasta(date || new Date())}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                dateFormat="dd/MM/yyyy"
                minDate={periodoDesde}
                showPopperArrow={false}
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
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={alumnosSeleccionados.includes(alumno.id)}
                onChange={() => toggleAlumno(alumno.id)}
                id={`alumno-${alumno.id}`}
              />
              <label
                htmlFor={`alumno-${alumno.id}`}
                className="flex items-center cursor-pointer"
              >
                <span className="text-sm">{alumno.nombre}</span>
              </label>
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
      {pagosRegistrados && !loadingPagos && (
        <div className="mt-4 text-green-600 text-center">¡Pagos registrados correctamente!</div>
      )}
    </form>
  )
} 