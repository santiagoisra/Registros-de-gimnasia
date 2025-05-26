'use client'

import React from 'react'
import Link from 'next/link'
import { ChatBubbleLeftRightIcon, BellIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

const configurationOptions = [
  {
    title: 'Agente IA',
    description: 'Interactúa con el asistente inteligente para gestionar el gimnasio',
    href: '/configuracion/agente-ia',
    icon: ChatBubbleLeftRightIcon,
    color: 'bg-blue-500'
  },
  {
    title: 'Alertas',
    description: 'Configura notificaciones y alertas del sistema',
    href: '/configuracion/alertas',
    icon: BellIcon,
    color: 'bg-yellow-500'
  },
  {
    title: 'Historial de Precios',
    description: 'Gestiona el historial y cambios de precios',
    href: '/configuracion/historial-precios',
    icon: CurrencyDollarIcon,
    color: 'bg-green-500'
  },
  {
    title: 'Turnos',
    description: 'Administra horarios y turnos del gimnasio',
    href: '/configuracion/turnos',
    icon: ClockIcon,
    color: 'bg-purple-500'
  }
]

export default function ConfiguracionPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
        <p className="text-gray-600">Administra las configuraciones del sistema de gestión del gimnasio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configurationOptions.map((option) => {
          const IconComponent = option.icon
          return (
            <Link
              key={option.href}
              href={option.href}
              className="block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 hover:border-gray-300"
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-lg ${option.color} text-white mr-4`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{option.title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{option.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}