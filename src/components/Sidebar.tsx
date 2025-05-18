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
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Alumnos', href: '/alumnos', icon: UserGroupIcon },
  { name: 'Asistencias', href: '/asistencias', icon: CalendarIcon },
  { name: 'Pagos', href: '/pagos', icon: CurrencyDollarIcon },
  { name: 'Reportes', href: '/reportes', icon: ChartBarIcon },
]

const configMenu = [
  { name: 'Historial de precios', href: '/configuracion/historial-precios' },
  { name: 'Alertas', href: '/configuracion/alertas' }
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)

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
        {/* Configuración */}
        <li>
          <button
            type="button"
            className={`flex items-center w-full p-2 rounded-lg group transition-colors duration-150 outline-none focus:ring-2 focus:ring-primary focus:bg-primary/20 ${pathname.startsWith('/configuracion') ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-100'} ${collapsed ? 'justify-center' : ''}`}
            onClick={() => setConfigOpen((o) => !o)}
            aria-expanded={configOpen ? 'true' : 'false'}
            aria-controls="config-menu"
          >
            <Cog6ToothIcon className={`w-6 h-6 mr-3 ${pathname.startsWith('/configuracion') ? 'text-primary' : 'text-gray-500 group-hover:text-primary'} ${collapsed ? 'mr-0' : ''}`} aria-hidden="true" />
            {!collapsed && 'Configuración'}
            {!collapsed && (
              <span className="ml-auto">
                <svg className={`w-4 h-4 inline transition-transform ${configOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </span>
            )}
          </button>
          {/* Submenú */}
          {configOpen && !collapsed && (
            <ul id="config-menu" className="ml-8 mt-1 space-y-1">
              {configMenu.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    tabIndex={0}
                    className={`block px-2 py-1 rounded transition-colors duration-150 ${pathname === item.href ? 'bg-primary/20 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <a href="/configuracion/turnos" className="block px-4 py-2 hover:bg-gray-100 rounded transition">
                  Gestión de Turnos
                </a>
              </li>
            </ul>
          )}
        </li>
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
              {/* Configuración */}
              <li>
                <button
                  type="button"
                  className={`flex items-center w-full p-2 rounded-lg group transition-colors duration-150 outline-none focus:ring-2 focus:ring-primary focus:bg-primary/20 ${pathname.startsWith('/configuracion') ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setConfigOpen((o) => !o)}
                  aria-expanded={configOpen ? 'true' : 'false'}
                  aria-controls="config-menu"
                >
                  <Cog6ToothIcon className={`w-6 h-6 mr-3 ${pathname.startsWith('/configuracion') ? 'text-primary' : 'text-gray-500 group-hover:text-primary'}`} aria-hidden="true" />
                  {!collapsed && 'Configuración'}
                  {!collapsed && (
                    <span className="ml-auto">
                      <svg className={`w-4 h-4 inline transition-transform ${configOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </span>
                  )}
                </button>
                {/* Submenú */}
                {configOpen && !collapsed && (
                  <ul id="config-menu" className="ml-8 mt-1 space-y-1">
                    {configMenu.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          tabIndex={0}
                          className={`block px-2 py-1 rounded transition-colors duration-150 ${pathname === item.href ? 'bg-primary/20 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <a href="/configuracion/turnos" className="block px-4 py-2 hover:bg-gray-100 rounded transition">
                        Gestión de Turnos
                      </a>
                    </li>
                  </ul>
                )}
              </li>
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