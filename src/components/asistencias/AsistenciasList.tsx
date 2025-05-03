'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'react-hot-toast'
import type { Asistencia } from '@/types'
import { getAsistencias } from '@/services/asistencias'

export default function AsistenciasList() {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarAsistencias()
  }, [])

  const cargarAsistencias = async () => {
    try {
      const data = await getAsistencias()
      setAsistencias(data)
    } catch (error) {
      toast.error('Error al cargar las asistencias')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Últimas Asistencias
        </h3>
      </div>
      <div className="border-t border-gray-200">
        <ul role="list" className="divide-y divide-gray-200">
          {asistencias.map((asistencia) => (
            <li key={asistencia.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-sm font-medium">
                        {asistencia.id.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {asistencia.alumnoId || 'Alumno'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(asistencia.fecha), "EEEE d 'de' MMMM", {
                        locale: es,
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{asistencia.ubicacion}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 