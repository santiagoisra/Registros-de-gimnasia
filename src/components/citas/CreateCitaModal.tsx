'use client'

import { useState, useEffect, useCallback } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

import { es } from 'date-fns/locale'
import { useCitas } from '@/hooks/useCitas'
import { useAlumnos } from '@/hooks/useAlumnos'
import { useToast } from '@/hooks/useToast'

import { Cita } from '@/types'

interface CreateCitaModalProps {
  isOpen: boolean
  onClose: () => void
  onCitaCreated: () => void
  selectedDate?: Date
  editingCita?: Cita
}

interface CitaForm {
  title: string
  date: Date | null
  time: string
  duration: number
  student_id: string
  type: 'individual' | 'group' | 'evaluation' | 'consultation'
  status: 'scheduled' | 'confirmed'
  notes: string
  recurring: boolean
  recurringtype: 'daily' | 'weekly' | 'monthly'
  recurringend: Date | null
  maxcapacity: number
  buffertime: number
}

const timeSlots = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
]

export default function CreateCitaModal({ isOpen, onClose, selectedDate, editingCita }: CreateCitaModalProps) {
  const { createCita, updateCita, checkTimeSlotAvailability } = useCitas()
  const { alumnos } = useAlumnos()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [conflictWarning, setConflictWarning] = useState('')

  const [form, setForm] = useState<CitaForm>({
    title: '',
    date: selectedDate || new Date(),
    time: '09:00',
    duration: 60,
    student_id: '',
    type: 'individual',
    status: 'scheduled',
    notes: '',
    recurring: false,
    recurringtype: 'weekly',
    recurringend: null,
    maxcapacity: 1,
    buffertime: 15
  })

  useEffect(() => {
    if (editingCita) {
      setForm({
        title: editingCita.title || '',
        date: new Date(editingCita.date),
        time: editingCita.time || '09:00',
        duration: editingCita.duration || 60,
        student_id: editingCita.student_id || '',
        type: editingCita.type || 'individual',
        status: (editingCita.status === 'scheduled' || editingCita.status === 'confirmed') ? editingCita.status : 'scheduled',
        notes: editingCita.notes || '',
        recurring: editingCita.recurring || false,
        recurringtype: editingCita.recurringtype || 'weekly',
        recurringend: editingCita.recurringend ? new Date(editingCita.recurringend) : null,
        maxcapacity: editingCita.maxcapacity || 1,
        buffertime: editingCita.buffertime || 15
      })
    } else if (selectedDate) {
      setForm(prev => ({ ...prev, date: selectedDate }))
    }
  }, [editingCita, selectedDate])

  const checkAvailability = useCallback(async () => {
    if (!form.date) return
    
    try {
      const availableSlots: string[] = []
      
      // Verificar cada slot de tiempo
      for (const timeSlot of timeSlots) {
        const dateTime = new Date(`${form.date.toISOString().split('T')[0]}T${timeSlot}`)
        const result = await checkTimeSlotAvailability(
          dateTime,
          form.duration,
          form.buffertime,
          editingCita?.id
        )
        
        if (result.available) {
          availableSlots.push(timeSlot)
        }
      }
      
      setAvailableSlots(availableSlots)
      
    } catch (error) {
      console.error('Error checking availability:', error)
    }
  }, [form.date, form.duration, form.buffertime, editingCita?.id, checkTimeSlotAvailability])

  useEffect(() => {
    if (form.date) {
      checkAvailability()
    }
  }, [form.date, form.duration, form.buffertime, checkAvailability])

  // Separate effect to handle conflict warning
  useEffect(() => {
    if (availableSlots.length > 0) {
      if (!availableSlots.includes(form.time)) {
        setConflictWarning('El horario seleccionado no está disponible')
      } else {
        setConflictWarning('')
      }
    }
  }, [form.time, availableSlots])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.date || !form.time || !form.student_id) {
      showToast('Por favor completa todos los campos requeridos', 'error')
      return
    }

    if (conflictWarning && !confirm('Hay un conflicto de horario. ¿Deseas continuar?')) {
      return
    }

    setLoading(true)
    
    try {
      const citaData = {
        ...form,
        date: form.date,
        title: form.title || `Cita ${form.type}`,
        recurringend: form.recurringend || undefined,
      }

      if (editingCita) {
        await updateCita(editingCita.id, citaData)
        showToast('Cita actualizada exitosamente', 'success')
      } else {
        await createCita(citaData)
        showToast('Cita creada exitosamente', 'success')
      }
      
      onClose()
    } catch (error) {
      console.error('Error saving cita:', error)
      showToast('Error al guardar la cita', 'error')
    } finally {
      setLoading(false)
    }
  }

  const updateForm = (field: keyof CitaForm, value: CitaForm[keyof CitaForm]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingCita ? 'Editar Cita' : 'Nueva Cita'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la cita
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateForm('title', e.target.value)}
                placeholder="Ej: Entrenamiento funcional"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de cita *
              </label>
              <select
                value={form.type}
                onChange={(e) => updateForm('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="individual">Individual</option>
                <option value="group">Grupal</option>
                <option value="evaluation">Evaluación</option>
                <option value="consultation">Consulta</option>
              </select>
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <DatePicker
                selected={form.date}
                onChange={(date) => updateForm('date', date)}
                dateFormat="dd/MM/yyyy"
                locale={es}
                minDate={new Date()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora *
              </label>
              <select
                value={form.time}
                onChange={(e) => updateForm('time', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  conflictWarning ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                {timeSlots.map((time) => (
                  <option 
                    key={time} 
                    value={time}
                    disabled={!availableSlots.includes(time)}
                    className={!availableSlots.includes(time) ? 'text-gray-400' : ''}
                  >
                    {time} {!availableSlots.includes(time) ? '(No disponible)' : ''}
                  </option>
                ))}
              </select>
              {conflictWarning && (
                <p className="text-red-600 text-xs mt-1">{conflictWarning}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración (min) *
              </label>
              <select
                value={form.duration}
                onChange={(e) => updateForm('duration', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>1 hora</option>
                <option value={90}>1.5 horas</option>
                <option value={120}>2 horas</option>
              </select>
            </div>
          </div>

          {/* Estudiante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estudiante *
            </label>
            <select
              value={form.student_id}
              onChange={(e) => updateForm('student_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccionar estudiante</option>
              {alumnos?.map((alumno) => (
                <option key={alumno.id} value={alumno.id}>
                  {alumno.nombre} {alumno.apellido}
                </option>
              ))}
            </select>
          </div>

          {/* Configuración avanzada */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacidad máxima
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={form.maxcapacity}
                onChange={(e) => updateForm('maxcapacity', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo de buffer (min)
              </label>
              <select
                value={form.buffertime}
                onChange={(e) => updateForm('buffertime', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>Sin buffer</option>
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
              </select>
            </div>
          </div>

          {/* Recurrencia */}
          <div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="recurring"
                checked={form.recurring}
                onChange={(e) => updateForm('recurring', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="recurring" className="ml-2 text-sm font-medium text-gray-700">
                Cita recurrente
              </label>
            </div>

            {form.recurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frecuencia
                  </label>
                  <select
                    value={form.recurringtype}
                    onChange={(e) => updateForm('recurringtype', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de fin
                  </label>
                  <DatePicker
                    selected={form.recurringend}
            onChange={(date) => updateForm('recurringend', date)}
                    dateFormat="dd/MM/yyyy"
                    locale={es}
                    minDate={form.date || new Date()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholderText="Seleccionar fecha de fin"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas adicionales
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
              rows={3}
              placeholder="Información adicional sobre la cita..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Guardando...' : (editingCita ? 'Actualizar' : 'Crear Cita')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}