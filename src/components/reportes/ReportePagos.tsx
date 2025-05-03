'use client'

import { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

// Datos de ejemplo - Esto vendrá de Supabase
const datosPagos = {
  ingresosPorMes: {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    data: [35000, 42000, 45000, 48000, 52000, 55000],
  },
  pagosPendientes: [
    {
      alumno: 'Juan Pérez',
      monto: 8000,
      diasAtraso: 5,
    },
    {
      alumno: 'María García',
      monto: 8000,
      diasAtraso: 3,
    },
  ],
}

export default function ReportePagos() {
  const [datos] = useState(datosPagos)

  const chartData = {
    labels: datos.ingresosPorMes.labels,
    datasets: [
      {
        label: 'Ingresos Mensuales',
        data: datos.ingresosPorMes.data,
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        tension: 0.4,
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
        text: 'Evolución de Ingresos',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number | string) => `$${value}`
        },
      },
    },
  } as const

  const totalPendiente = datos.pagosPendientes.reduce(
    (sum, pago) => sum + pago.monto,
    0
  )

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Reporte de Pagos
      </h2>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-600">
            Pagos Pendientes
          </h3>
          <span className="text-lg font-semibold text-red-600">
            ${totalPendiente}
          </span>
        </div>

        <div className="space-y-4">
          {datos.pagosPendientes.map((pago, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 bg-red-50 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {pago.alumno}
                </p>
                <p className="text-xs text-gray-500">
                  {pago.diasAtraso} días de atraso
                </p>
              </div>
              <span className="text-sm font-medium text-red-600">
                ${pago.monto}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-64">
        <Line options={chartOptions} data={chartData} />
      </div>
    </div>
  )
}