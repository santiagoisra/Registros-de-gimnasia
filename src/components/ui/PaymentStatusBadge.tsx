import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import type { EstadoPago } from '@/types'
import { Tooltip } from 'react-tooltip'

interface PaymentStatusBadgeProps {
  status: EstadoPago
  tooltipContent?: string
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig = {
  al_dia: {
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    icon: CheckCircleIcon,
    label: 'Al día'
  },
  pendiente: {
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    icon: ClockIcon,
    label: 'Pendiente'
  },
  atrasado: {
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    icon: ExclamationCircleIcon,
    label: 'Atrasado'
  }
}

const sizes = {
  sm: {
    badge: 'px-2 py-1 text-xs',
    icon: 'h-3.5 w-3.5'
  },
  md: {
    badge: 'px-2.5 py-1.5 text-sm',
    icon: 'h-4 w-4'
  },
  lg: {
    badge: 'px-3 py-2 text-base',
    icon: 'h-5 w-5'
  }
}

export function PaymentStatusBadge({
  status,
  tooltipContent,
  className = '',
  showIcon = true,
  size = 'md'
}: PaymentStatusBadgeProps) {
  const config = statusConfig[status]
  const sizeConfig = sizes[size]
  const id = `payment-status-${Math.random().toString(36).substr(2, 9)}`

  return (
    <>
      <span
        data-tooltip-id={tooltipContent ? id : undefined}
        className={`
          inline-flex items-center gap-1.5 
          ${config.bgColor} ${config.textColor}
          border ${config.borderColor}
          rounded-full font-medium
          ${sizeConfig.badge}
          ${className}
        `}
      >
        {showIcon && (
          <config.icon
            className={sizeConfig.icon}
            aria-hidden="true"
          />
        )}
        {config.label}
      </span>
      {tooltipContent && (
        <Tooltip
          id={id}
          content={tooltipContent}
          place="top"
          className="z-50 max-w-xs text-sm"
        />
      )}
    </>
  )
} 