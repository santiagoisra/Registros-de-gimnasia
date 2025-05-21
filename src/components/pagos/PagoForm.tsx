'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import type { Alumno, MetodoPago } from '@/types'
import { alumnosService } from '@/services/alumnos'
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
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
  })

  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [loadingAlumnos, setLoadingAlumnos] = useState(true)
  const { createPago } = usePagos()

  useEffect(() => {
    cargarAlumnos()
  }, [])

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      mes: formData.fecha.getMonth() + 1,
      anio: formData.fecha.getFullYear()
    }))
  }, [formData.fecha])

  const cargarAlumnos = async () => {
    try {
      const { data } = await alumnosService.getAlumnos()
      setAlumnos(data.filter((alumno: Alumno) => alumno.activo))
    } catch {
      toast.error('Error al cargar los alumnos')
    } finally {
      setLoadingAlumnos(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.alumnoId || !formData.monto) {
      toast.error('Por favor completa los campos requeridos')
      return
    }

    try {
      await createPago({
        alumnoId: formData.alumnoId,
        fecha: formData.fecha.toISOString(),
        monto: Number(formData.monto),
        metodoPago: formData.metodoPago,
        periodoDesde: formData.periodoDesde.toISOString(),
        periodoHasta: formData.periodoHasta.toISOString(),
        notas: formData.notas || undefined,
        estado: 'Pagado',
        mes: formData.mes,
        anio: formData.anio
      })
      toast.success('Pago registrado correctamente')
      onSuccess?.()
      setFormData({
        alumnoId: '',
        fecha: new Date(),
        monto: '',
        metodoPago: 'Efectivo',
        periodoDesde: new Date(),
        periodoHasta: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        notas: '',
        mes: new Date().getMonth() + 1,
        anio: new Date().getFullYear()
      })
    } catch {
      toast.error('Error al registrar el pago')
    }
  }

  if (loadingAlumnos) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="alumno" className="block text-sm font-medium text-gray-700">
          Alumno
        </label>
        <select
          id="alumno"
          value={formData.alumnoId}
          onChange={(e) => setFormData({ ...formData, alumnoId: e.target.value })}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
        >
          <option value="">Selecciona un alumno</option>
          {alumnos.map((alumno) => (
            <option key={alumno.id} value={alumno.id}>
              {alumno.nombre} {alumno.apellido}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
          Fecha de Pago
        </label>
        <DatePicker
          id="fecha"
          selected={formData.fecha}
          onChange={(date: Date | null) => setFormData({ ...formData, fecha: date || new Date() })}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          dateFormat="dd/MM/yyyy"
          showPopperArrow={false}
        />
      </div>

      <div>
        <label htmlFor="monto" className="block text-sm font-medium text-gray-700">
          Monto
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="monto"
            value={formData.monto}
            onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
            className="mt-1 block w-full pl-7 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label htmlFor="metodoPago" className="block text-sm font-medium text-gray-700">
          Método de Pago
        </label>
        <select
          id="metodoPago"
          value={formData.metodoPago}
          onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value as MetodoPago })}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
        >
          {metodosPago.map((metodo) => (
            <option key={metodo} value={metodo}>
              {metodo}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="periodoDesde" className="block text-sm font-medium text-gray-700">
            Período Desde
          </label>
          <DatePicker
            id="periodoDesde"
            selected={formData.periodoDesde}
            onChange={(date: Date | null) => setFormData({ ...formData, periodoDesde: date || new Date() })}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            dateFormat="dd/MM/yyyy"
            showPopperArrow={false}
          />
        </div>

        <div>
          <label htmlFor="periodoHasta" className="block text-sm font-medium text-gray-700">
            Período Hasta
          </label>
          <DatePicker
            id="periodoHasta"
            selected={formData.periodoHasta}
            onChange={(date: Date | null) => setFormData({ ...formData, periodoHasta: date || new Date() })}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            dateFormat="dd/MM/yyyy"
            showPopperArrow={false}
          />
        </div>
      </div>

      <div>
        <label htmlFor="notas" className="block text-sm font-medium text-gray-700">
          Notas
        </label>
        <textarea
          id="notas"
          value={formData.notas}
          onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
          rows={3}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Registrar Pago
        </button>
      </div>
    </form>
  )
}