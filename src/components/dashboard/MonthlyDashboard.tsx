'use client'
import { useState, useEffect } from 'react'
import { BarChart, LineChart } from '@/components/ui/charts'
import { getDashboardMetrics, getAttendanceTrends, getIncomeTrends } from '@/services/reports'
import { Spinner } from '@/components/ui/Spinner'
import { UsersIcon, CalendarIcon, BanknotesIcon, ExclamationTriangleIcon, ArrowRightIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { AlertasContainer } from '../alertas'

const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const anioActual = new Date().getFullYear()

const quickLinks = [
  { label: 'Alumnos', href: '/alumnos', icon: UsersIcon, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { label: 'Asistencias', href: '/asistencias', icon: CalendarIcon, color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { label: 'Pagos', href: '/pagos', icon: BanknotesIcon, color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
  { label: 'Reportes', href: '/reportes', icon: ArrowRightIcon, color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  { label: 'Configuración', href: '/configuracion', icon: Cog6ToothIcon, color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
]

export function MonthlyDashboard() {
  const [mes, setMes] = useState(new Date().getMonth())
  const [anio, setAnio] = useState(anioActual)
  const [metrics, setMetrics] = useState<{
    alumnosActivos: number;
    asistenciasMes: number;
    ingresosMes: number;
    pagosPendientes: number;
  } | null>(null)
  const [attendance, setAttendance] = useState<{ labels: string[]; data: number[] } | null>(null)
  const [income, setIncome] = useState<{ labels: string[]; data: number[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      getDashboardMetrics({ mes: mes + 1, anio }),
      getAttendanceTrends({ mes: mes + 1, anio }),
      getIncomeTrends({ anio })
    ])
      .then(([metrics, attendance, income]) => {
        setMetrics(metrics)
        setAttendance(attendance)
        setIncome(income)
      })
      .catch(() => setError('Error al cargar los datos'))
      .finally(() => setLoading(false))
  }, [mes, anio])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-12">
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <section className="mb-8">
          <AlertasContainer />
        </section>
        {/* Accesos rápidos */}
        <div className="flex flex-wrap gap-3 mb-8">
          {quickLinks.map(({ label, href, icon: Icon, color }) => (
            <Link key={label} href={href} className={`flex items-center gap-2 px-5 py-3 rounded-xl shadow-sm font-semibold text-base transition hover:scale-105 ${color}`}>
              <Icon className="h-6 w-6" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
        {/* Filtros de mes y año */}
        <div className="flex flex-wrap gap-4 mb-8 items-end">
          <div className="w-full sm:w-auto bg-white border border-gray-200 shadow-md rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-400" />
              <label className="block text-sm font-medium text-gray-700">Mes</label>
              <select
                className="border rounded px-2 py-1 ml-2 focus:ring-2 focus:ring-blue-200"
                value={mes}
                onChange={e => setMes(Number(e.target.value))}
                title="Seleccionar mes"
              >
                {meses.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 ml-0 sm:ml-6">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
              <label className="block text-sm font-medium text-gray-700">Año</label>
              <select
                className="border rounded px-2 py-1 ml-2 focus:ring-2 focus:ring-blue-200"
                value={anio}
                onChange={e => setAnio(Number(e.target.value))}
                title="Seleccionar año"
              >
                {[anioActual - 1, anioActual, anioActual + 1].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-8">{error}</div>
        ) : (
          metrics && attendance && income && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <MetricCard icon={UsersIcon} label="Alumnos Activos" value={metrics.alumnosActivos} color="primary" />
                <MetricCard icon={CalendarIcon} label="Asistencias del Mes" value={metrics.asistenciasMes} color="green" />
                <MetricCard icon={BanknotesIcon} label="Ingresos del Mes" value={`$${metrics.ingresosMes}`} color="yellow" />
                <MetricCard icon={ExclamationTriangleIcon} label="Pagos Pendientes" value={metrics.pagosPendientes} color="red" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Asistencias por Día</h2>
                  <BarChart
                    data={{
                      labels: attendance.labels,
                      datasets: [
                        {
                          label: 'Asistencias',
                          data: attendance.data,
                          backgroundColor: 'rgba(14, 165, 233, 0.5)',
                          borderColor: 'rgb(14, 165, 233)',
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: { display: false },
                      },
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Ingresos por Mes</h2>
                  <LineChart
                    data={{
                      labels: income.labels,
                      datasets: [
                        {
                          label: 'Ingresos',
                          data: income.data,
                          borderColor: 'rgb(14, 165, 233)',
                          backgroundColor: 'rgba(14, 165, 233, 0.2)',
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: { display: false },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value: number | string) => `$${value}`
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </>
          )
        )}
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    primary: 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100',
    green: 'bg-green-50 text-green-800 border border-green-200 hover:bg-green-100',
    yellow: 'bg-yellow-50 text-yellow-800 border border-yellow-200 hover:bg-yellow-100',
    red: 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100',
  }
  return (
    <div className={`p-6 rounded-xl shadow-md flex flex-col items-start gap-2 transition ${colorMap[color]}`}> 
      <div className="flex items-center gap-3 mb-1">
        <Icon className="h-8 w-8" />
        <span className="text-base font-semibold">{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  )
} 