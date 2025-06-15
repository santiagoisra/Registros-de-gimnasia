'use client'

import { useState, useEffect } from 'react'
import { PencilIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useCitas } from '@/hooks/useCitas'

import { Cita, CitasListProps } from '@/types'

export default function CitasList({ filters, onEditCita }: CitasListProps) {
  const { getCitas, updateCitaStatus, deleteCita } = useCitas()
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCitas, setSelectedCitas] = useState<string[]>([])
  const [sortField, setSortField] = useState<keyof Cita>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    const loadCitas = async () => {
      try {
        setLoading(true)
        const data = await getCitas(filters)
        setCitas(data)
      } catch (error) {
        console.error('Error loading citas:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCitas()
  }, [filters, getCitas])



  const getTypeBadge = (type: string) => {
    const typeConfig = {
      individual: { label: 'Individual', color: 'bg-purple-100 text-purple-800' },
      group: { label: 'Grupal', color: 'bg-indigo-100 text-indigo-800' },
      evaluation: { label: 'Evaluación', color: 'bg-cyan-100 text-cyan-800' },
      consultation: { label: 'Consulta', color: 'bg-pink-100 text-pink-800' }
    }
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.individual
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const handleSort = (field: keyof Cita) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleStatusChange = async (citaId: string, newStatus: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show') => {
    try {
      await updateCitaStatus(citaId, newStatus)
      setCitas(prev => prev.map(cita => 
        cita.id === citaId ? { ...cita, status: newStatus as Cita['status'] } : cita
      ))
    } catch (error) {
      console.error('Error updating cita status:', error)
    }
  }

  const handleDelete = async (citaId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      try {
        await deleteCita(citaId)
        setCitas(prev => prev.filter(cita => cita.id !== citaId))
      } catch (error) {
        console.error('Error deleting cita:', error)
      }
    }
  }

  const handleSelectCita = (citaId: string) => {
    setSelectedCitas(prev => 
      prev.includes(citaId) 
        ? prev.filter(id => id !== citaId)
        : [...prev, citaId]
    )
  }

  const handleSelectAll = () => {
    setSelectedCitas(selectedCitas.length === citas.length ? [] : citas.map(c => c.id))
  }

  const handleBulkConfirm = async () => {
    if (selectedCitas.length === 0) return
    
    try {
      for (const citaId of selectedCitas) {
        await updateCitaStatus(citaId, 'confirmed')
      }
      setCitas(prev => prev.map(cita => 
        selectedCitas.includes(cita.id) ? { ...cita, status: 'confirmed' } : cita
      ))
      setSelectedCitas([])
    } catch (error) {
      console.error('Error confirming selected citas:', error)
    }
  }

  const handleBulkCancel = async () => {
    if (selectedCitas.length === 0) return
    
    try {
      for (const citaId of selectedCitas) {
        await updateCitaStatus(citaId, 'cancelled')
      }
      setCitas(prev => prev.map(cita => 
        selectedCitas.includes(cita.id) ? { ...cita, status: 'cancelled' } : cita
      ))
      setSelectedCitas([])
    } catch (error) {
      console.error('Error cancelling selected citas:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedCitas.length === 0) return
    
    if (confirm(`¿Estás seguro de que quieres eliminar ${selectedCitas.length} cita(s) seleccionada(s)?`)) {
      try {
        for (const citaId of selectedCitas) {
          await deleteCita(citaId)
        }
        setCitas(prev => prev.filter(cita => !selectedCitas.includes(cita.id)))
        setSelectedCitas([])
      } catch (error) {
        console.error('Error deleting selected citas:', error)
      }
    }
  }

  const sortedCitas = [...citas].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return sortDirection === 'asc' ? 1 : -1
    if (bValue == null) return sortDirection === 'asc' ? -1 : 1
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header con acciones */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Citas ({citas.length})
          </h3>
          {selectedCitas.length > 0 && (
            <p className="text-sm text-gray-600">
              {selectedCitas.length} cita(s) seleccionada(s)
            </p>
          )}
        </div>
        
        {selectedCitas.length > 0 && (
          <div className="flex gap-2">
            <button 
              onClick={handleBulkConfirm}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Confirmar seleccionadas
            </button>
            <button 
              onClick={handleBulkCancel}
              className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Cancelar seleccionadas
            </button>
            <button 
              onClick={handleBulkDelete}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Eliminar seleccionadas
            </button>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedCitas.length === citas.length && citas.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                Fecha y Hora
                {sortField === 'date' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estudiante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duración
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCitas.map((cita) => (
              <tr key={cita.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedCitas.includes(cita.id)}
                    onChange={() => handleSelectCita(cita.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {format(cita.date, 'dd/MM/yyyy', { locale: es })}
                    </div>
                    <div className="text-sm text-gray-500">{cita.time}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {cita.alumnos ? `${cita.alumnos.nombre} ${cita.alumnos.apellido}` : 'Sin asignar'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getTypeBadge(cita.type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={cita.status}
                    onChange={(e) => handleStatusChange(cita.id, e.target.value as 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show')}
                    className="text-sm border-0 bg-transparent focus:ring-0 cursor-pointer"
                  >
                    <option value="scheduled">Programada</option>
                    <option value="confirmed">Confirmada</option>
                    <option value="in-progress">En progreso</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                    <option value="no-show">No asistió</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cita.duration} min
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditCita(cita)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Editar"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cita.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {citas.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No se encontraron citas con los filtros aplicados</p>
          </div>
        </div>
      )}
    </div>
  )
}