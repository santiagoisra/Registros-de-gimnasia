import { Switch } from '@headlessui/react'
import { BellIcon, BellSlashIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface AlertToggleProps {
  isEnabled: boolean
  onChange: (enabled: boolean) => void | Promise<void>
  label?: string
  description?: string
  disabled?: boolean
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: {
    switch: 'h-5 w-9',
    handle: 'h-3 w-3',
    translate: 'translate-x-4',
    icon: 'h-4 w-4',
    text: 'text-sm'
  },
  md: {
    switch: 'h-6 w-11',
    handle: 'h-4 w-4',
    translate: 'translate-x-5',
    icon: 'h-5 w-5',
    text: 'text-base'
  },
  lg: {
    switch: 'h-7 w-14',
    handle: 'h-5 w-5',
    translate: 'translate-x-7',
    icon: 'h-6 w-6',
    text: 'text-lg'
  }
}

export function AlertToggle({
  isEnabled,
  onChange,
  label = 'Alertas',
  description,
  disabled = false,
  showIcon = true,
  size = 'md'
}: AlertToggleProps) {
  const [isPending, setIsPending] = useState(false)
  const [enabled, setEnabled] = useState(isEnabled)

  useEffect(() => {
    setEnabled(isEnabled)
  }, [isEnabled])

  const handleChange = async (newState: boolean) => {
    if (disabled || isPending) return

    setIsPending(true)
    try {
      await onChange(newState)
      setEnabled(newState)
      toast.success(`Alertas ${newState ? 'activadas' : 'desactivadas'}`)
    } catch (error) {
      toast.error('Error al cambiar el estado de las alertas')
      setEnabled(!newState) // Revert on error
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className={`flex items-center gap-3 ${disabled ? 'opacity-50' : ''}`}>
      {showIcon && (
        enabled ? (
          <BellIcon className={`${sizes[size].icon} text-primary`} />
        ) : (
          <BellSlashIcon className={`${sizes[size].icon} text-gray-400`} />
        )
      )}
      
      <div className="flex flex-col">
        <Switch
          checked={enabled}
          onChange={handleChange}
          className={`
            ${enabled ? 'bg-primary' : 'bg-gray-200'}
            relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-75
            ${sizes[size].switch}
            ${disabled || isPending ? 'cursor-not-allowed' : ''}
          `}
          disabled={disabled || isPending}
        >
          <span className="sr-only">{label}</span>
          <span
            aria-hidden="true"
            className={`
              ${enabled ? sizes[size].translate : 'translate-x-0'}
              pointer-events-none inline-block transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out
              ${sizes[size].handle}
            `}
          />
        </Switch>
        
        <div className="flex flex-col">
          <span className={`font-medium ${sizes[size].text}`}>{label}</span>
          {description && (
            <span className={`text-gray-500 ${size === 'lg' ? 'text-base' : 'text-sm'}`}>
              {description}
            </span>
          )}
        </div>
      </div>
    </div>
  )
} 