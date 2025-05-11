"use client"
import { useEffect, useState } from 'react'
import { Shift } from '@/types/supabase'
import { Spinner } from '@/components/ui/Spinner'
import ShiftForm from './ShiftForm'

export default function ShiftManagement() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Shift | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Fetch shifts
  const fetchShifts = () => {
    setLoading(true)
    fetch('/api/shifts')
      .then(res => res.json())
      .then(data => {
        setShifts(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Error al cargar los turnos')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchShifts()
  }, [])

  const handleEdit = (shift: Shift) => {
    setEditing(shift)
    setModalOpen(true)
  }

  const handleSave = async (data: Omit<Shift, 'id' | 'created_at'>) => {
    if (!editing) return
    const res = await fetch(`/api/shifts/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Error al guardar')
    }
    setModalOpen(false)
    setEditing(null)
    fetchShifts()
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Gestión de Turnos</h1>
      {loading && <Spinner />}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Nombre</th>
              <th className="border px-2 py-1">Inicio</th>
              <th className="border px-2 py-1">Fin</th>
              <th className="border px-2 py-1">Activo</th>
              <th className="border px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map(shift => (
              <tr key={shift.id}>
                <td className="border px-2 py-1">{shift.name}</td>
                <td className="border px-2 py-1">{shift.start_time}</td>
                <td className="border px-2 py-1">{shift.end_time}</td>
                <td className="border px-2 py-1">{shift.is_active ? 'Sí' : 'No'}</td>
                <td className="border px-2 py-1">
                  <button onClick={() => handleEdit(shift)} className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {modalOpen && editing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-4 max-w-lg w-full relative">
            <button onClick={() => { setModalOpen(false); setEditing(null) }} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">&times;</button>
            <h2 className="text-lg font-bold mb-2">Editar turno</h2>
            <ShiftForm
              shift={editing}
              onSave={handleSave}
              onCancel={() => { setModalOpen(false); setEditing(null) }}
            />
          </div>
        </div>
      )}
      {/* TODO: Agregar formularios para crear turnos y acciones de eliminar */}
    </div>
  )
} 