'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import type { Alumno } from '@/types'
import { createAlumno, updateAlumno } from '@/services/alumnos'

interface AlumnoFormProps {
  alumno?: Alumno
  onClose: () => void
  onSuccess: () => void
}

export default function AlumnoForm({ alumno, onClose, onSuccess }: AlumnoFormProps) {
  const [formData, setFormData] = useState({
    nombre: alumno?.nombre || '',
    email: alumno?.email || '',
    telefono: alumno?.telefono || '',
    precioMensual: alumno?.precioMensual || 0,
    notas: alumno?.notas || '',
    activo: alumno?.activo ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (alumno) {
        await updateAlumno(alumno.id, formData)
        toast.success('Alumno actualizado')
      } else {
        await createAlumno(formData)
        toast.success('Alumno creado')
      }
      onSuccess()
      onClose()
    } catch (error) {
      toast.error('Error al guardar el alumno')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          type="text"
          id="nombre"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
          Teléfono
        </label>
        <input
          type="tel"
          id="telefono"
          value={formData.telefono}
          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="precioMensual" className="block text-sm font-medium text-gray-700">
          Precio Mensual
        </label>
        <input
          type="number"
          id="precioMensual"
          value={formData.precioMensual}
          onChange={(e) => setFormData({ ...formData, precioMensual: Number(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          required
          min="0"
        />
      </div>

      <div>
        <label htmlFor="activo" className="flex items-center">
          <input
            type="checkbox"
            id="activo"
            checked={formData.activo}
            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Activo</span>
        </label>
      </div>

      <div>
        <label htmlFor="notas" className="block text-sm font-medium text-gray-700">
          Notas
        </label>
        <textarea
          id="notas"
          value={formData.notas}
          onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="Notas adicionales..."
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {alumno ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  )
} 