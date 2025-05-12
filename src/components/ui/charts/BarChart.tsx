import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'
import { Spinner } from '../Spinner'

// Registrar escalas y elementos necesarios para BarChart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface BarChartProps {
  data: ChartData<'bar'>
  options?: ChartOptions<'bar'>
  loading?: boolean
  className?: string
}

export function BarChart({ data, options, loading = false, className = '' }: BarChartProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="md" />
      </div>
    )
  }
  return (
    <div className={className}>
      <Bar data={data} options={options} />
    </div>
  )
} 