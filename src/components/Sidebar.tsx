import Link from 'next/link'
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Alumnos', href: '/alumnos', icon: UserGroupIcon },
  { name: 'Asistencias', href: '/asistencias', icon: CalendarIcon },
  { name: 'Pagos', href: '/pagos', icon: CurrencyDollarIcon },
  { name: 'Reportes', href: '/reportes', icon: ChartBarIcon },
]

export default function Sidebar() {
  return (
    <div className="flex flex-col w-64 bg-white border-r">
      <div className="flex items-center justify-center h-16 border-b">
        <span className="text-lg font-semibold text-gray-800">
          Registros de Gimnasia
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="p-4 space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100 group"
              >
                <item.icon className="w-6 h-6 mr-3 text-gray-500 group-hover:text-primary" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
} 