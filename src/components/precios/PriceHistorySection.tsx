'use client'

import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useHistorialPrecios } from '@/hooks/useHistorialPrecios'
import { formatDate } from '@/utils'
import { useState } from 'react'
import PriceHistoryForm from './PriceHistoryForm'
import type { HistorialPrecio } from '@/types'
import { useAlumnos } from '@/hooks/useAlumnos'

interface PriceHistorySectionProps {
  alumnoId?: string
}

const PriceHistorySection = ({ alumnoId }: PriceHistorySectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState<HistorialPrecio | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { alumnos, isLoading: alumnosLoading } = useAlumnos({})
  const { precios, isLoading, error, createPrecio, updatePrecio, deletePrecio } = useHistorialPrecios({ alumnoId })

  const handleAdd = () => {
    setEditData(null)
    setShowForm(true)
    setFormError(null)
  }

  const handleEdit = (precio: HistorialPrecio) => {
    setEditData(precio)
    setShowForm(true)
    setFormError(null)
  }

  const handleDelete = async (precio: HistorialPrecio) => {
    if (!window.confirm('¿Seguro que querés eliminar este precio?')) return
    setFormLoading(true)
    setFormError(null)
    try {
      await deletePrecio(precio.id)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setFormError((err as { message?: string }).message || 'Error al eliminar el precio')
      } else {
        setFormError('Error al eliminar el precio')
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handleFormSubmit = async (data: Omit<HistorialPrecio, 'id'>) => {
    setFormLoading(true)
    setFormError(null)
    try {
      const dataToSend = alumnoId ? { ...data, alumnoId } : { ...data }
      await (editData ? updatePrecio({ id: (editData as HistorialPrecio).id, data: dataToSend }) : createPrecio(dataToSend))
      setShowForm(false)
      setEditData(null)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setFormError((err as { message?: string }).message || 'Error al guardar el precio')
      } else {
        setFormError('Error al guardar el precio')
      }
    } finally {
      setFormLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-lg">
        Error al cargar el historial de precios: {error.message}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Historial de precios</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAdd}
            className="text-white bg-primary hover:bg-primary/90 px-3 py-1 rounded shadow text-sm"
          >
            Agregar precio
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-500 bg-transparent border-none p-0"
            title={isExpanded ? 'Ocultar historial' : 'Mostrar historial'}
          >
            <ChevronDownIcon 
              className={`h-5 w-5 transform transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {formError && (
        <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm mb-2">{formError}</div>
      )}

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {precios.length === 0 ? (
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg">
              No hay historial de precios registrado
            </div>
          ) : (
            precios.map((precio: HistorialPrecio, index: number) => (
              <div
                key={precio.id}
                className={`p-4 rounded-lg flex flex-col gap-2 md:flex-row md:items-center md:justify-between ${
                  index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {precio.moneda} {precio.precio}
                    {index === 0 && (
                      <span className="ml-2 text-xs font-medium text-green-800 bg-green-100 px-2 py-0.5 rounded-full">
                        Actual
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Desde: {formatDate(precio.fechaDesde)}
                    {precio.fechaHasta && ` hasta ${formatDate(precio.fechaHasta)}`}
                  </p>
                  <p className="text-sm text-gray-500">{precio.servicio} - {precio.tipoServicio}</p>
                  {precio.notas && (
                    <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                      {precio.notas}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    type="button"
                    className="text-primary hover:underline text-sm"
                    onClick={() => handleEdit(precio)}
                    disabled={formLoading}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="text-red-600 hover:underline text-sm"
                    onClick={() => handleDelete(precio)}
                    disabled={formLoading}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <PriceHistoryForm
          initialData={editData || (alumnoId ? { alumnoId } : undefined)}
          preciosExistentes={precios}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setEditData(null); setFormError(null) }}
          loading={formLoading}
          error={formError}
          alumnos={!alumnoId ? alumnos : undefined}
          alumnosLoading={!alumnoId ? alumnosLoading : undefined}
        />
      )}
    </div>
  )
}

export default PriceHistorySection 