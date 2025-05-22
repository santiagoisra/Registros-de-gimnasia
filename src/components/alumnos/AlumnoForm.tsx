'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import type { Alumno, EstadoPago, Shift } from '@/types'
import { alumnosService } from '@/services/alumnos'
import { AlertToggle } from '@/components/ui/AlertToggle'
import { AlertConfigPanel } from '@/components/ui/AlertConfigPanel'
import { PaymentStatusBadge } from '@/components/ui/PaymentStatusBadge'

interface AlumnoFormProps {
  alumno?: Alumno
  onClose: () => void
  onSuccess: () => void
}

const ESTADOS_PAGO: EstadoPago[] = ['al_dia', 'pendiente', 'atrasado']

export default function AlumnoForm({ alumno, onClose, onSuccess }: AlumnoFormProps) {
  const [formData, setFormData] = useState({
    nombre: alumno?.nombre || '',
    apellido: alumno?.apellido || '',
    sede: (alumno?.sede as 'Plaza Arenales' | 'Plaza Terán') || '',
    email: alumno?.email || '',
    telefono: alumno?.telefono || '',
    precioMensual: alumno?.precioMensual || 0,
    notas: alumno?.notas || '',
    activo: alumno?.activo ?? true,
    alertasActivas: alumno?.alertasActivas ?? true,
    alertConfig: alumno?.alertConfig || [
      {
        type: 'pago',
        enabled: true,
        reminderDays: 5
      },
      {
        type: 'asistencia',
        enabled: true,
        threshold: 7
      },
      {
        type: 'general',
        enabled: true
      }
    ],
    estadoPago: alumno?.estadoPago || 'al_dia',
    diasConsecutivosAsistencia: alumno?.diasConsecutivosAsistencia || 0,
    fechaUltimaAsistencia: alumno?.fechaUltimaAsistencia || '',
    shift_id: alumno?.shift_id || '',
  })

  const [shifts, setShifts] = useState<Shift[]>([])
  const [shiftsLoading, setShiftsLoading] = useState(true)
  const [shiftsError, setShiftsError] = useState<string | null>(null)

  useEffect(() => {
    setShiftsLoading(true)
    fetch('/api/shifts')
      .then(res => res.json())
      .then(data => {
        setShifts(data.filter((s: Shift) => s.is_active))
        setShiftsLoading(false)
      })
      .catch(() => {
        setShiftsError('Error al cargar los turnos')
        setShiftsLoading(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validaciones
    if (!formData.nombre.trim() || !formData.sede) {
      return
    }
    if (formData.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      return
    }
    // Casteo seguro de sede y mapeo de campos válidos para Supabase
    const payload = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      telefono: formData.telefono,
      sede: formData.sede as 'Plaza Arenales' | 'Plaza Terán',
      activo: formData.activo,
      alertas_activas: formData.alertasActivas,
      estado_pago: formData.estadoPago,
      shift_id: formData.shift_id || undefined,
      fecha_ultima_asistencia: formData.fechaUltimaAsistencia || undefined,
      dias_consecutivos_asistencia: formData.diasConsecutivosAsistencia || 0
    };
    try {
      if (alumno) {
        await alumnosService.updateAlumno(alumno.id, payload)
        toast.success('Alumno actualizado')
      } else {
        await alumnosService.createAlumno(payload)
        toast.success('Alumno creado')
      }
      onSuccess()
      onClose()
    } catch (error) {
      const msg = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Error al guardar el alumno')
      console.error(error)
      toast.error(msg)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-2 py-4 sm:px-4 md:px-8 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna 1: datos principales */}
        <div className="space-y-6">
          <div>
            <label htmlFor="nombre" className="block text-base font-semibold text-gray-800 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="mt-1 block w-full rounded-lg border-2 border-gray-300 focus:border-primary focus:ring-primary text-lg py-3 px-4 transition-all duration-150 sm:text-base"
              required
            />
          </div>
          <div>
            <label htmlFor="sede" className="block text-base font-semibold text-gray-800 mb-1">
              Sede <span className="text-red-500">*</span>
            </label>
            <select
              id="sede"
              value={formData.sede}
              onChange={(e) => setFormData({ ...formData, sede: e.target.value as 'Plaza Arenales' | 'Plaza Terán' })}
              className="mt-1 block w-full rounded-lg border-2 border-gray-300 focus:border-primary focus:ring-primary text-lg py-3 px-4 transition-all duration-150 sm:text-base"
              required
            >
              <option value="">Seleccionar sede</option>
              <option value="Plaza Arenales">Plaza Arenales</option>
              <option value="Plaza Terán">Plaza Terán</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado de Pago
            </label>
            <PaymentStatusBadge
              status={formData.estadoPago}
              tooltipContent={
                formData.estadoPago === 'al_dia'
                  ? 'El alumno está al día con sus pagos'
                  : formData.estadoPago === 'pendiente'
                  ? 'El alumno tiene un pago pendiente'
                  : 'El alumno tiene pagos atrasados'
              }
            />
          </div>
        </div>
        {/* Columna 2: datos opcionales */}
        <div className="space-y-6">
          <div>
            <label htmlFor="apellido" className="block text-base font-semibold text-gray-800 mb-1">
              Apellido
            </label>
            <input
              type="text"
              id="apellido"
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              className="mt-1 block w-full rounded-lg border-2 border-gray-300 focus:border-primary focus:ring-primary text-lg py-3 px-4 transition-all duration-150 sm:text-base"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-base font-semibold text-gray-800 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-lg border-2 border-gray-300 focus:border-primary focus:ring-primary text-lg py-3 px-4 transition-all duration-150 sm:text-base"
            />
          </div>
          <div>
            <label htmlFor="telefono" className="block text-base font-semibold text-gray-800 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              id="telefono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="mt-1 block w-full rounded-lg border-2 border-gray-300 focus:border-primary focus:ring-primary text-lg py-3 px-4 transition-all duration-150 sm:text-base"
            />
          </div>
        </div>
        {/* Sección de activo y alertas: ocupa toda la fila en desktop */}
        <div className="md:col-span-2 space-y-4 mt-2">
          <div className="flex items-center space-x-4">
            <label htmlFor="activo" className="flex items-center text-base font-semibold text-gray-800">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded mr-2"
              />
              Activo
            </label>
            <AlertToggle
              isEnabled={formData.alertasActivas}
              onChange={(enabled) => {
                setFormData({ 
                  ...formData, 
                  alertasActivas: enabled,
                  alertConfig: formData.alertConfig.map(c => ({ ...c, enabled }))
                })
              }}
              label="Recibir alertas"
              description="Notificaciones sobre pagos y asistencias"
              size="sm"
            />
          </div>
          {formData.alertasActivas && (
            <div className="mt-4">
              <AlertConfigPanel
                config={formData.alertConfig}
                onChange={(newConfig) => setFormData({ ...formData, alertConfig: newConfig })}
                disabled={!formData.alertasActivas}
              />
            </div>
          )}
        </div>
      </div>
      {/* Sección avanzada: estado de pago, asistencia, turno, notas */}
      <hr className="my-6 border-gray-300" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="estadoPago" className="block text-base font-semibold text-gray-800 mb-1">
              Estado de pago
            </label>
            <select
              id="estadoPago"
              value={formData.estadoPago}
              onChange={(e) => setFormData({ ...formData, estadoPago: e.target.value as EstadoPago })}
              className="mt-1 block w-full rounded-lg border-2 border-gray-300 focus:border-primary focus:ring-primary text-lg py-3 px-4 transition-all duration-150 sm:text-base"
            >
              {ESTADOS_PAGO.map((estado) => (
                <option key={estado} value={estado}>
                  {estado === 'al_dia' ? 'Al día' : estado === 'pendiente' ? 'Pendiente' : 'Atrasado'}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="diasConsecutivosAsistencia" className="block text-base font-semibold text-gray-800 mb-1">
                Días consecutivos de asistencia
              </label>
              <input
                type="number"
                id="diasConsecutivosAsistencia"
                value={formData.diasConsecutivosAsistencia}
                onChange={(e) => setFormData({ ...formData, diasConsecutivosAsistencia: Number(e.target.value) })}
                className="mt-1 block w-full rounded-lg border-2 border-gray-300 focus:border-primary focus:ring-primary text-lg py-3 px-4 transition-all duration-150 sm:text-base"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="fechaUltimaAsistencia" className="block text-base font-semibold text-gray-800 mb-1">
                Fecha de última asistencia
              </label>
              <input
                type="date"
                id="fechaUltimaAsistencia"
                value={formData.fechaUltimaAsistencia}
                onChange={(e) => setFormData({ ...formData, fechaUltimaAsistencia: e.target.value })}
                className="mt-1 block w-full rounded-lg border-2 border-gray-300 focus:border-primary focus:ring-primary text-lg py-3 px-4 transition-all duration-150 sm:text-base"
              />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <label htmlFor="shift_id" className="block text-base font-semibold text-gray-800 mb-1">
              Turno
            </label>
            {shiftsLoading ? (
              <span className="text-gray-500 text-sm">Cargando turnos...</span>
            ) : shiftsError ? (
              <span className="text-red-500 text-sm">{shiftsError}</span>
            ) : (
              <select
                id="shift_id"
                value={formData.shift_id || ''}
                onChange={e => setFormData({ ...formData, shift_id: e.target.value })}
                className="mt-1 block w-full rounded-lg border-2 border-gray-300 focus:border-primary focus:ring-primary text-lg py-3 px-4 transition-all duration-150 sm:text-base"
              >
                <option value="">Sin turno asignado</option>
                {shifts.map(shift => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name} ({shift.start_time} - {shift.end_time})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label htmlFor="notas" className="block text-base font-semibold text-gray-800 mb-1">
              Notas
            </label>
            <textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-lg border-2 border-gray-300 focus:border-primary focus:ring-primary text-lg py-3 px-4 transition-all duration-150 sm:text-base"
              placeholder="Notas adicionales..."
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-2 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-all text-lg"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-all text-lg shadow-md"
        >
          {alumno ? 'Actualizar' : 'Crear'} alumno
        </button>
      </div>
    </form>
  )
}