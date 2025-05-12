import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'
import { Spinner } from '../Spinner'

// Registrar escalas y elementos necesarios para LineChart
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface LineChartProps {
  data: ChartData<'line'>
  options?: ChartOptions<'line'>
  loading?: boolean
  className?: string
}

export function LineChart({ data, options, loading = false, className = '' }: LineChartProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="md" />
      </div>
    )
  }
  return (
    <div className={className}>
      <Line data={data} options={options} />
    </div>
  )
} 