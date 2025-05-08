'use client'

import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import AlumnoForm from './AlumnoForm'

interface AlumnosActionsProps {
  onSuccess: () => void
}

export default function AlumnosActions({ onSuccess }: AlumnosActionsProps) {
  const [showForm, setShowForm] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Nuevo Alumno
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 max-h-screen overflow-y-auto">
            <h2 className="text-lg font-medium mb-4">Nuevo Alumno</h2>
            <AlumnoForm 
              onClose={() => setShowForm(false)} 
              onSuccess={() => {
                onSuccess()
                setShowForm(false)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
} 