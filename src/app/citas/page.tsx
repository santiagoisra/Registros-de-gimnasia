'use client'

import { useState } from 'react'
import { PlusIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'
import CitasCalendar from '@/components/citas/CitasCalendar'
import CitasList from '@/components/citas/CitasList'
import CitasFilters from '@/components/citas/CitasFilters'
import CitasStats from '@/components/citas/CitasStats'
import CreateCitaModal from '@/components/citas/CreateCitaModal'
import { CitaFilters } from '@/types'

export default function CitasPage() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [filters, setFilters] = useState<CitaFilters>({
    dateFrom: undefined,
    dateTo: undefined,
    status: undefined,
    studentId: undefined,
    type: undefined,
    recurring: undefined
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Citas</h1>
            <p className="text-gray-600 mt-2">
              Administra las citas y horarios de entrenamiento
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Nueva Cita
          </button>
        </div>
      </div>

      {/* Stats */}
      <CitasStats />

      {/* Filters and View Toggle */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <CitasFilters filters={filters} onFiltersChange={setFilters} />
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
              view === 'calendar'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Calendario
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
              view === 'list'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ClockIcon className="w-4 h-4" />
            Lista
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        {view === 'calendar' ? (
          <CitasCalendar 
            filters={filters}
            onDateSelect={setSelectedDate}
            onCreateCita={() => setShowCreateModal(true)}
          />
        ) : (
          <CitasList 
            filters={filters}
            onEditCita={(cita) => {
              // TODO: Implementar edición de cita
              console.log('Edit cita:', cita)
            }}
          />
        )}
      </div>

      {/* Create Cita Modal */}
      {showCreateModal && (
        <CreateCitaModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
            setSelectedDate(undefined)
          }}
          onCitaCreated={() => {
            setShowCreateModal(false)
            setSelectedDate(undefined)
          }}
          selectedDate={selectedDate}
        />
      )}
    </div>
  )
}