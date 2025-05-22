import {
  UsersIcon,
  CalendarIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

// Datos de ejemplo - Esto vendrá de Supabase
const stats = [
  {
    name: 'Alumnos Activos',
    value: '24',
    icon: UsersIcon,
    change: '+2',
    changeType: 'increase',
  },
  {
    name: 'Asistencias del Mes',
    value: '156',
    icon: CalendarIcon,
    change: '+23%',
    changeType: 'increase',
  },
  {
    name: 'Ingresos del Mes',
    value: '$45,000',
    icon: BanknotesIcon,
    change: '+8%',
    changeType: 'increase',
  },
  {
    name: 'Pagos Pendientes',
    value: '3',
    icon: ExclamationTriangleIcon,
    change: '-2',
    changeType: 'decrease',
  },
]

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((item) => (
        <div
          key={item.name}
          className="relative overflow-hidden rounded-lg bg-white p-6 shadow"
        >
          <dt>
            <div className="absolute rounded-md bg-primary/10 p-3">
              <item.icon
                className="h-6 w-6 text-primary"
                aria-hidden="true"
              />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">
              {item.name}
            </p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
            <p
              className={`ml-2 flex items-baseline text-sm font-semibold ${
                item.changeType === 'increase'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {item.change}
            </p>
          </dd>
        </div>
      ))}
    </div>
  )
} 