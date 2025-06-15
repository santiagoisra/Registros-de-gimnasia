'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { useCitas } from '@/hooks/useCitas'

import { CitasCalendarProps, Cita } from '@/types'

interface ExtendedCitasCalendarProps extends CitasCalendarProps {
  onDateSelect: (date: Date) => void
  onCreateCita: () => void
}

export default function CitasCalendar({ filters, onDateSelect, onCreateCita }: ExtendedCitasCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const { getCitasByDateRange } = useCitas()
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)

  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate])
  const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate])
  const calendarDays = useMemo(() => eachDayOfInterval({ start: monthStart, end: monthEnd }), [monthStart, monthEnd])

  useEffect(() => {
    const loadCitas = async () => {
      try {
        setLoading(true)
        const data = await getCitasByDateRange(monthStart, monthEnd, filters)
        setCitas(data)
      } catch (error) {
        console.error('Error loading citas:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCitas()
  }, [currentDate, filters, getCitasByDateRange, monthStart, monthEnd])

  const getCitasForDate = (date: Date) => {
    return citas.filter(cita => isSameDay(cita.date, date))
  }

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || colors.scheduled
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    onDateSelect(date)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1))
  }

  return (
    <div className="p-6">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={onCreateCita}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Nueva Cita
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date) => {
          const daysCitas = getCitasForDate(date)
          const isCurrentMonth = isSameMonth(date, currentDate)
          const isSelected = selectedDate && isSameDay(date, selectedDate)
          const isTodayDate = isToday(date)

          return (
            <div
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={`min-h-[120px] p-2 border border-gray-200 cursor-pointer transition-colors ${
                isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'
              } ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${
                  isTodayDate ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''
                }`}>
                  {format(date, 'd')}
                </span>
                {daysCitas.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                    {daysCitas.length}
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
                {daysCitas.slice(0, 3).map((cita) => (
                  <div
                    key={cita.id}
                    className={`text-xs p-1 rounded truncate ${getStatusColor(cita.status)}`}
                    title={`${cita.time} - ${cita.alumnos?.nombre || 'Sin alumno'} (${cita.title})`}
                  >
                    <div className="font-medium">{cita.time}</div>
                    <div className="truncate">{cita.alumnos?.nombre || 'Sin alumno'}</div>
                  </div>
                ))}
                {daysCitas.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{daysCitas.length - 3} más
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Leyenda */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 rounded"></div>
          <span>Programada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 rounded"></div>
          <span>Confirmada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-100 rounded"></div>
          <span>Completada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 rounded"></div>
          <span>Cancelada</span>
        </div>
      </div>
    </div>
  )
}