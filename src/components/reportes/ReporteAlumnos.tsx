'use client'

import { useState } from 'react'
import type { Alumno } from '@/types'

// Datos de ejemplo - Esto vendrá de Supabase
const alumnosEjemplo: (Alumno & { asistencias: number; ultimaAsistencia: string })[] = [
  {
    id: '1',
    nombre: 'Juan',
    apellido: 'Pérez',
    telefono: '',
    email: '',
    createdAt: '',
    updatedAt: '',
    alertasActivas: false,
    fechaUltimaAsistencia: '',
    diasConsecutivosAsistencia: 0,
    estadoPago: 'al_dia',
    activo: true,
    precioMensual: 8000,
    asistencias: 12,
    ultimaAsistencia: '2024-03-15',
    sede: 'Plaza Arenales',
    notas: '',
  },
  {
    id: '2',
    nombre: 'María',
    apellido: 'García',
    telefono: '',
    email: '',
    createdAt: '',
    updatedAt: '',
    alertasActivas: false,
    fechaUltimaAsistencia: '',
    diasConsecutivosAsistencia: 0,
    estadoPago: 'al_dia',
    activo: true,
    precioMensual: 8000,
    asistencias: 8,
    ultimaAsistencia: '2024-03-14',
    sede: 'Plaza Terán',
    notas: '',
  },
]

export default function ReporteAlumnos() {
  const [alumnos] = useState(alumnosEjemplo)

  const promedioAsistencias = Math.round(
    alumnos.reduce((sum, alumno) => sum + alumno.asistencias, 0) / alumnos.length
  )

  const alumnosInactivos = alumnos.filter(
    alumno => {
      const ultimaAsistencia = new Date(alumno.ultimaAsistencia)
      const hoy = new Date()
      const diasSinAsistir = Math.floor(
        (hoy.getTime() - ultimaAsistencia.getTime()) / (1000 * 60 * 60 * 24)
      )
      return diasSinAsistir > 7
    }
  )

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Reporte de Alumnos
      </h2>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Promedio de Asistencias Mensuales
          </span>
          <span className="text-lg font-semibold text-gray-900">
            {promedioAsistencias}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary rounded-full h-2"
            style={{
              width: `${(promedioAsistencias / 20) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-600">
          Alumnos con Inasistencias Prolongadas
        </h3>
        {alumnosInactivos.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {alumnosInactivos.map((alumno) => (
              <li key={alumno.id} className="py-3">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {alumno.nombre}
                    </p>
                    <p className="text-sm text-gray-500">
                      Última asistencia: {new Date(alumno.ultimaAsistencia).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {alumno.asistencias} asistencias
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">
            No hay alumnos con inasistencias prolongadas
          </p>
        )}
      </div>
    </div>
  )
} 