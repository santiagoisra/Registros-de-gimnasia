'use client'

import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useHistorialPrecios } from '@/hooks/useHistorialPrecios'
import { formatDate, formatCurrency } from '@/utils'
import type { HistorialPrecio } from '@/types'
import { Button } from '@/components/ui/Button'
import { Tooltip } from 'react-tooltip'

interface PriceHistoryFormProps {
  onSubmit: (precio: Omit<HistorialPrecio, 'id'>) => Promise<void>
  onCancel: () => void
  initialData?: Partial<HistorialPrecio>
}

function PriceHistoryForm({ onSubmit, onCancel, initialData }: PriceHistoryFormProps) {
  const [formData, setFormData] = useState<Partial<HistorialPrecio>>({
    precio: 0,
    fechaDesde: formatDate(new Date()),
    moneda: 'ARS',
    servicio: 'Clases',
    tipoServicio: 'Individual',
    activo: true,
    ...initialData
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData as Omit<HistorialPrecio, 'id'>)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="precio" className="block text-sm font-medium text-gray-700">
            Precio
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="precio"
              required
              min={0}
              step={0.01}
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })}
              className="mt-1 block w-full pl-7 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label htmlFor="moneda" className="block text-sm font-medium text-gray-700">
            Moneda
          </label>
          <select
            id="moneda"
            required
            value={formData.moneda}
            onChange={(e) => setFormData({ ...formData, moneda: e.target.value as HistorialPrecio['moneda'] })}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          >
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="servicio" className="block text-sm font-medium text-gray-700">
            Servicio
          </label>
          <select
            id="servicio"
            required
            value={formData.servicio}
            onChange={(e) => setFormData({ ...formData, servicio: e.target.value as HistorialPrecio['servicio'] })}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          >
            <option value="Clases">Clases</option>
            <option value="Competencia">Competencia</option>
            <option value="Equipamiento">Equipamiento</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div>
          <label htmlFor="tipoServicio" className="block text-sm font-medium text-gray-700">
            Tipo de Servicio
          </label>
          <select
            id="tipoServicio"
            required
            value={formData.tipoServicio}
            onChange={(e) => setFormData({ ...formData, tipoServicio: e.target.value as HistorialPrecio['tipoServicio'] })}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          >
            <option value="Individual">Individual</option>
            <option value="Grupal">Grupal</option>
            <option value="Personalizado">Personalizado</option>
            <option value="Evento">Evento</option>
            <option value="Material">Material</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fechaDesde" className="block text-sm font-medium text-gray-700">
            Fecha Desde
          </label>
          <input
            type="date"
            id="fechaDesde"
            required
            value={formData.fechaDesde}
            onChange={(e) => setFormData({ ...formData, fechaDesde: e.target.value })}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          />
        </div>

        <div>
          <label htmlFor="fechaHasta" className="block text-sm font-medium text-gray-700">
            Fecha Hasta (opcional)
          </label>
          <input
            type="date"
            id="fechaHasta"
            value={formData.fechaHasta || ''}
            min={formData.fechaDesde}
            onChange={(e) => setFormData({ ...formData, fechaHasta: e.target.value || undefined })}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          Guardar
        </Button>
      </div>
    </form>
  )
}

interface PriceHistorySectionProps {
  alumnoId: string
}

export function PriceHistorySection({ alumnoId }: PriceHistorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { historialPrecios, loading, error } = useHistorialPrecios(alumnoId)

  if (loading) {
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

  if (!historialPrecios?.length) {
    return (
      <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg">
        No hay historial de precios registrado
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Historial de precios</h3>
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-500"
          title={isExpanded ? 'Ocultar historial' : 'Mostrar historial'}
        >
          <ChevronDownIcon 
            className={`h-5 w-5 transform transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {historialPrecios.map((precio, index) => (
            <div
              key={precio.id}
              className={`p-4 rounded-lg ${
                index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(precio.precio, precio.moneda)}
                    {index === 0 && (
                      <span className="ml-2 text-xs font-medium text-green-800 bg-green-100 px-2 py-0.5 rounded-full">
                        Actual
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Desde: {formatDate(precio.fechaDesde)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{precio.servicio}</p>
                  <p className="mt-1 text-sm text-gray-500">{precio.moneda}</p>
                </div>
              </div>
              {precio.notas && (
                <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                  {precio.notas}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 