'use client'

import { useAlumnos } from '@/hooks/useAlumnos'
import PriceHistorySection from '@/components/precios/PriceHistorySection'
import { NotasSection } from '@/components/notas/NotasSection'
import { PaymentStatusBadge } from '@/components/ui/PaymentStatusBadge'
import { AlertToggle } from '@/components/ui/AlertToggle'
import { AlertConfigPanel } from '@/components/ui/AlertConfigPanel'
import { PencilIcon } from '@heroicons/react/24/outline'
import type { Alumno } from '@/types'

interface AlumnoDetailsProps {
  alumnoId: string
  onEdit?: (alumno: Alumno) => void
}

export function AlumnoDetails({ alumnoId, onEdit }: AlumnoDetailsProps) {
  const { alumnos, isLoading, error }: { alumnos: Alumno[], isLoading: boolean, error: Error | null } = useAlumnos({})
  const alumno = alumnos.find(a => a.id === alumnoId)

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
        Error al cargar los detalles del alumno: {error.message}
      </div>
    )
  }

  if (!alumno) {
    return (
      <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg">
        No se encontró el alumno
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
      {/* Encabezado con información básica */}
      <div className="px-6 py-5">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {alumno.nombre} {alumno.apellido}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{alumno.email}</p>
          </div>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(alumno)}
              className="text-gray-400 hover:text-gray-500 bg-transparent border-none p-0"
              title="Editar alumno"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Información de contacto y estado */}
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Información de contacto</h3>
            <dl className="grid grid-cols-1 gap-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                <dd className="mt-1 text-sm text-gray-900">{alumno.telefono || 'No especificado'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                <dd className="mt-1 text-sm text-gray-900">{alumno.direccion || 'No especificada'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Sede</dt>
                <dd className="mt-1 text-sm text-gray-900">{alumno.sede}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Estado</h3>
            <dl className="grid grid-cols-1 gap-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Estado de pago</dt>
                <dd className="mt-1">
                  <PaymentStatusBadge status={alumno.estadoPago} />
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Última asistencia</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {alumno.fechaUltimaAsistencia || 'Sin registros'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Configuración de alertas */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Configuración de alertas</h3>
          <AlertToggle
            isEnabled={alumno.alertasActivas}
            onChange={() => {}} // Esto debería manejarse con una función real
            size="sm"
          />
        </div>
        {alumno.alertasActivas && alumno.alertConfig && (
          <AlertConfigPanel
            config={alumno.alertConfig}
            onChange={() => {}} // Esto debería manejarse con una función real
            disabled={!alumno.alertasActivas}
          />
        )}
      </div>

      {/* Historial de precios */}
      <div className="px-6 py-5">
        <PriceHistorySection alumnoId={alumno.id} />
      </div>

      {/* Notas */}
      <div className="px-6 py-5">
        <NotasSection alumnoId={alumno.id} />
      </div>
    </div>
  )
} 