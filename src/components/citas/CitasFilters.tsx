'use client'

import { useState } from 'react'
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import DatePicker from 'react-datepicker'
import { useAlumnos } from '@/hooks/useAlumnos'

import { CitasFiltersProps } from '@/types'

export default function CitasFilters({ filters, onFiltersChange }: CitasFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const { alumnos } = useAlumnos()

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'scheduled', label: 'Programada' },
    { value: 'confirmed', label: 'Confirmada' },
    { value: 'in-progress', label: 'En progreso' },
    { value: 'completed', label: 'Completada' },
    { value: 'cancelled', label: 'Cancelada' },
    { value: 'no-show', label: 'No asistió' }
  ]

  const appointmentTypes = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'individual', label: 'Individual' },
    { value: 'group', label: 'Grupal' },
    { value: 'evaluation', label: 'Evaluación' },
    { value: 'consultation', label: 'Consulta' }
  ]

  const updateFilter = (key: string, value: string | boolean | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      dateFrom: undefined,
      dateTo: undefined,
      status: undefined,
      studentId: undefined,
      type: undefined,
      recurring: undefined
    })
  }

  const hasActiveFilters = 
    filters.dateFrom ||
    filters.dateTo ||
    filters.status ||
    filters.studentId ||
    filters.type ||
    filters.recurring !== undefined

  return (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
          hasActiveFilters
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <FunnelIcon className="w-4 h-4" />
        Filtros
        {hasActiveFilters && (
          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
            Activos
          </span>
        )}
      </button>

      {showFilters && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-10">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Rango de fechas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rango de fechas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <DatePicker
                      selected={filters.dateFrom ? new Date(filters.dateFrom) : null}
                      onChange={(date) => updateFilter('dateFrom', date ? date.toISOString().split('T')[0] : undefined)}
                      placeholderText="Fecha inicio"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>
                  <div>
                    <DatePicker
                      selected={filters.dateTo ? new Date(filters.dateTo) : null}
                      onChange={(date) => updateFilter('dateTo', date ? date.toISOString().split('T')[0] : undefined)}
                      placeholderText="Fecha fin"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      dateFormat="dd/MM/yyyy"
                      minDate={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => updateFilter('status', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estudiante */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estudiante
                </label>
                <select
                  value={filters.studentId || ''}
                  onChange={(e) => updateFilter('studentId', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los estudiantes</option>
                  {alumnos?.map((alumno) => (
                    <option key={alumno.id} value={alumno.id}>
                      {alumno.nombre} {alumno.apellido}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de cita */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de cita
                </label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => updateFilter('type', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {appointmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-between mt-6 pt-4 border-t">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                disabled={!hasActiveFilters}
              >
                Limpiar filtros
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}