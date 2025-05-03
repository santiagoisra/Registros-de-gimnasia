'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Alumnos', href: '/alumnos', icon: UserGroupIcon },
  { name: 'Asistencias', href: '/asistencias', icon: CalendarIcon },
  { name: 'Pagos', href: '/pagos', icon: CurrencyDollarIcon },
  { name: 'Reportes', href: '/reportes', icon: ChartBarIcon },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Sidebar para escritorio
  const sidebarContent = (
    <nav
      className={`flex flex-col h-full bg-white border-r transition-all duration-200 ${collapsed ? 'w-20' : 'w-64'}`}
      aria-label="Navegación principal"
      role="navigation"
    >
      <div className="flex items-center justify-between h-16 border-b px-4">
        <span className={`text-lg font-semibold text-gray-800 transition-all duration-200 ${collapsed ? 'hidden' : 'block'}`}>Registros de Gimnasia</span>
        <button
          className="p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? <ChevronDoubleRightIcon className="w-5 h-5" /> : <ChevronDoubleLeftIcon className="w-5 h-5" />}
        </button>
      </div>
      <ul className="p-4 space-y-2" role="list">
        {navigation.map((item) => {
          const active = pathname === item.href
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                tabIndex={0}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center p-2 rounded-lg group transition-colors duration-150 outline-none focus:ring-2 focus:ring-primary focus:bg-primary/20 ${active ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-100'} ${collapsed ? 'justify-center' : ''}`}
              >
                <item.icon className={`w-6 h-6 mr-3 ${active ? 'text-primary' : 'text-gray-500 group-hover:text-primary'} ${collapsed ? 'mr-0' : ''}`} aria-hidden="true" />
                {!collapsed && item.name}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )

  // Sidebar para móvil
  return (
    <>
      {/* Botón hamburguesa solo visible en móvil */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded bg-white border shadow focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú de navegación"
      >
        <Bars3Icon className="w-6 h-6" aria-hidden="true" />
      </button>
      {/* Sidebar móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex" role="dialog" aria-modal="true">
          <nav className="relative w-64 bg-white border-r h-full flex flex-col" aria-label="Navegación principal" role="navigation">
            <div className="flex items-center justify-between h-16 border-b px-4">
              <span className="text-lg font-semibold text-gray-800">Registros de Gimnasia</span>
              <button
                className="p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú de navegación"
              >
                <XMarkIcon className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>
            <ul className="p-4 space-y-2" role="list">
              {navigation.map((item) => {
                const active = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      tabIndex={0}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center p-2 rounded-lg group transition-colors duration-150 outline-none focus:ring-2 focus:ring-primary focus:bg-primary/20 ${active ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon className={`w-6 h-6 mr-3 ${active ? 'text-primary' : 'text-gray-500 group-hover:text-primary'}`} aria-hidden="true" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
          {/* Fondo oscuro para cerrar el menú */}
          <div className="flex-1 bg-black bg-opacity-30" onClick={() => setMobileOpen(false)} tabIndex={0} aria-label="Cerrar menú" />
        </div>
      )}
      {/* Sidebar escritorio (oculta en móvil) */}
      <div className="hidden md:flex h-full">
        {sidebarContent}
      </div>
    </>
  )
} 