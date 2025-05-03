'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import type { Alumno, MetodoPago } from '@/types'
import { getAlumnos } from '@/services/alumnos'
import { usePagos } from '@/hooks/usePagos'

interface PagoFormProps {
  onSuccess?: () => void
}

const metodosPago: MetodoPago[] = ['Efectivo', 'Transferencia', 'Mercado Pago']

export default function PagoForm({ onSuccess }: PagoFormProps) {
  const [formData, setFormData] = useState({
    alumnoId: '',
    fecha: new Date(),
    monto: '',
    metodoPago: 'Efectivo' as MetodoPago,
    periodoDesde: new Date(),
    periodoHasta: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    notas: '',
  })

  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [loadingAlumnos, setLoadingAlumnos] = useState(true)
  const { registrarPago, loading: loadingPago } = usePagos()

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
      setLoadingAlumnos(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await registrarPago({
        alumnoId: formData.alumnoId,
        fecha: formData.fecha.toISOString(),
        monto: Number(formData.monto),
        metodoPago: formData.metodoPago,
        periodoDesde: formData.periodoDesde.toISOString().split('T')[0],
        periodoHasta: formData.periodoHasta.toISOString().split('T')[0],
        notas: formData.notas,
      })
      setFormData({
        ...formData,
        alumnoId: '',
        monto: '',
        notas: '',
      })
      onSuccess?.()
    } catch (error) {
      toast.error('Error al registrar el pago')
    }
  }

  const alumnoSeleccionado = alumnos.find(a => a.id === formData.alumnoId)

  if (loadingAlumnos) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alumno
          </label>
          <select
            value={formData.alumnoId}
            onChange={(e) => {
              const alumno = alumnos.find(a => a.id === e.target.value)
              setFormData({
                ...formData,
                alumnoId: e.target.value,
                monto: alumno ? alumno.precioMensual.toString() : '',
              })
            }}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          >
            <option value="">Seleccionar alumno</option>
            {alumnos.map((alumno) => (
              <option key={alumno.id} value={alumno.id}>
                {alumno.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Pago
          </label>
          <DatePicker
            selected={formData.fecha}
            onChange={(date: Date) => setFormData({ ...formData, fecha: date })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            dateFormat="dd/MM/yyyy"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              value={formData.monto}
              onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
              className="block w-full rounded-md border-gray-300 pl-7 focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="0.00"
              required
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Método de Pago
          </label>
          <select
            value={formData.metodoPago}
            onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value as MetodoPago })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          >
            {metodosPago.map((metodo) => (
              <option key={metodo} value={metodo}>
                {metodo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período Desde
          </label>
          <DatePicker
            selected={formData.periodoDesde}
            onChange={(date: Date) => setFormData({ ...formData, periodoDesde: date })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            dateFormat="dd/MM/yyyy"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período Hasta
          </label>
          <DatePicker
            selected={formData.periodoHasta}
            onChange={(date: Date) => setFormData({ ...formData, periodoHasta: date })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            dateFormat="dd/MM/yyyy"
            minDate={formData.periodoDesde}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas
          </label>
          <textarea
            value={formData.notas}
            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="Notas adicionales..."
          />
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        {alumnoSeleccionado && (
          <div className="text-sm text-gray-500">
            Precio mensual actual: ${alumnoSeleccionado.precioMensual}
          </div>
        )}
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          disabled={loadingPago}
        >
          {loadingPago ? 'Registrando...' : 'Registrar Pago'}
        </button>
      </div>
    </form>
  )
} 