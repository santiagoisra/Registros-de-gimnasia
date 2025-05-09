'use client'

import { useState, useEffect } from 'react'
import {
  UsersIcon,
  CalendarIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { PaymentStatusBadge } from '@/components/ui/PaymentStatusBadge'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function ReporteGeneral() {
  const [estadisticas, setEstadisticas] = useState({
    alumnosActivos: 0,
    asistenciasMes: 0,
    ingresosMes: 0,
    pagosPendientes: 0,
    asistenciasPorDia: {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
      data: [0, 0, 0, 0, 0],
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = async () => {
    try {
      const fechaInicio = new Date()
      fechaInicio.setDate(1) // Primer día del mes actual
      const fechaFin = new Date()

      const fechaInicioStr = fechaInicio.toISOString().split('T')[0]
      const fechaFinStr = fechaFin.toISOString().split('T')[0]

      // Obtener alumnos activos
      const { count: alumnosActivos } = await supabase
        .from('alumnos')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)

      // Obtener asistencias del mes
      const { count: asistenciasMes } = await supabase
        .from('asistencias')
        .select('*', { count: 'exact', head: true })
        .gte('fecha', fechaInicioStr)
        .lte('fecha', fechaFinStr)

      // Obtener ingresos del mes
      const { data: pagos } = await supabase
        .from('pagos')
        .select('monto')
        .gte('fecha_pago', fechaInicioStr)
        .lte('fecha_pago', fechaFinStr)

      const ingresosMes = pagos?.reduce((sum, pago) => sum + pago.monto, 0) || 0

      // Obtener pagos pendientes
      // 1. Traer IDs de alumnos con pagos al día
      const { data: pagosAlDia } = await supabase
        .from('pagos')
        .select('alumno_id')
        .gte('periodo_hasta', fechaInicioStr)

      const idsAlDia = Array.from(new Set((pagosAlDia || [])
        .map((p: any) => p.alumno_id)
        .filter(Boolean)))

      let pagosPendientes = 0
      if (idsAlDia.length > 0) {
        const { count } = await supabase
          .from('alumnos')
          .select('*', { count: 'exact', head: true })
          .eq('activo', true)
          .not('id', 'in', idsAlDia)
        pagosPendientes = count || 0
      } else {
        // Si no hay ninguno al día, todos los activos están pendientes
        const { count } = await supabase
          .from('alumnos')
          .select('*', { count: 'exact', head: true })
          .eq('activo', true)
        pagosPendientes = count || 0
      }

      // Obtener asistencias por día de la semana
      const { data: asistenciasSemana } = await supabase
        .from('asistencias')
        .select('fecha')
        .gte('fecha', fechaInicioStr)
        .lte('fecha', fechaFinStr)

      const asistenciasPorDia = {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
        data: [0, 0, 0, 0, 0],
      }

      asistenciasSemana?.forEach(asistencia => {
        const dia = new Date(asistencia.fecha).getDay()
        if (dia > 0 && dia < 6) { // Solo días de semana (1-5)
          asistenciasPorDia.data[dia - 1]++
        }
      })

      setEstadisticas({
        alumnosActivos: alumnosActivos || 0,
        asistenciasMes: asistenciasMes || 0,
        ingresosMes,
        pagosPendientes: pagosPendientes || 0,
        asistenciasPorDia,
      })
    } catch {
      toast.error('Error al cargar las estadísticas')
    } finally {
      setLoading(false)
    }
  }

  const chartData = {
    labels: estadisticas.asistenciasPorDia.labels,
    datasets: [
      {
        label: 'Asistencias por día',
        data: estadisticas.asistenciasPorDia.data,
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        borderColor: 'rgb(14, 165, 233)',
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Asistencias de la Semana',
      },
    },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Resumen General
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <UsersIcon className="h-6 w-6 text-primary" />
            <span className="ml-2 text-sm font-medium text-gray-600">
              Alumnos Activos
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {estadisticas.alumnosActivos}
          </p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <CalendarIcon className="h-6 w-6 text-green-600" />
            <span className="ml-2 text-sm font-medium text-gray-600">
              Asistencias del Mes
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {estadisticas.asistenciasMes}
          </p>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center">
            <BanknotesIcon className="h-6 w-6 text-yellow-600" />
            <span className="ml-2 text-sm font-medium text-gray-600">
              Ingresos del Mes
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            ${estadisticas.ingresosMes}
          </p>
        </div>

        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              <span className="ml-2 text-sm font-medium text-gray-600">
                Pagos Pendientes
              </span>
            </div>
            <PaymentStatusBadge
              status="atrasado"
              tooltipContent={`${estadisticas.pagosPendientes} alumnos con pagos pendientes`}
              size="sm"
            />
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {estadisticas.pagosPendientes}
          </p>
        </div>
      </div>

      <div className="h-64">
        <Bar options={chartOptions} data={chartData} />
      </div>
    </div>
  )
}