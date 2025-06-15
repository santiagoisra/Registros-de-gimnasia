'use client'

import { useEffect, useState } from 'react'
import { CalendarDaysIcon, ClockIcon, UserGroupIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useCitas } from '@/hooks/useCitas'

interface StatsData {
  totalCitas: number
  citasHoy: number
  citasPendientes: number
  conflictos: number
  utilizacion: number
}

export default function CitasStats() {
  const { getCitasStats } = useCitas()
  const [stats, setStats] = useState<StatsData>({
    totalCitas: 0,
    citasHoy: 0,
    citasPendientes: 0,
    conflictos: 0,
    utilizacion: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getCitasStats()
        setStats(data)
      } catch (error) {
        console.error('Error loading citas stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [getCitasStats])

  const statCards = [
    {
      title: 'Total de Citas',
      value: stats.totalCitas,
      icon: CalendarDaysIcon,
      color: 'blue',
      description: 'Este mes'
    },
    {
      title: 'Citas Hoy',
      value: stats.citasHoy,
      icon: ClockIcon,
      color: 'green',
      description: 'Programadas'
    },
    {
      title: 'Pendientes',
      value: stats.citasPendientes,
      icon: UserGroupIcon,
      color: 'yellow',
      description: 'Por confirmar'
    },
    {
      title: 'Conflictos',
      value: stats.conflictos,
      icon: ExclamationTriangleIcon,
      color: 'red',
      description: 'Requieren atención'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      red: 'bg-red-50 text-red-600 border-red-200'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => {
        const Icon = card.icon
        return (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {card.value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{card.description}</p>
              </div>
              <div className={`p-3 rounded-lg border ${getColorClasses(card.color)}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}