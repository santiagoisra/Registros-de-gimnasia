import { useState } from 'react'
import type { Shift } from '@/types/supabase'

interface ShiftFormProps {
  shift?: Shift
  onSave: (data: Omit<Shift, 'id' | 'created_at'>) => void
  onCancel: () => void
}

export default function ShiftForm({ shift, onSave, onCancel }: ShiftFormProps) {
  const [form, setForm] = useState({
    name: shift?.name || '',
    start_time: shift?.start_time || '',
    end_time: shift?.end_time || '',
    is_active: shift?.is_active ?? true,
  })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    let newValue: string | boolean = value
    if (type === 'checkbox' && 'checked' in e.target) {
      newValue = (e.target as HTMLInputElement).checked
    }
    setForm(f => ({
      ...f,
      [name]: newValue
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.name.trim() || !form.start_time || !form.end_time) {
      setError('Todos los campos son obligatorios')
      return
    }
    if (form.start_time >= form.end_time) {
      setError('El horario de inicio debe ser menor al de fin')
      return
    }
    setSaving(true)
    try {
      await onSave(form)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as { message?: string }).message || 'Error al guardar')
      } else {
        setError('Error al guardar')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow max-w-md mx-auto">
      <div>
        <label className="block font-medium mb-1">Nombre</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
          title="Nombre del turno"
          placeholder="Ej: Mañana"
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block font-medium mb-1">Inicio</label>
          <input
            type="time"
            name="start_time"
            value={form.start_time}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
            title="Hora de inicio"
            placeholder="08:00"
          />
        </div>
        <div className="flex-1">
          <label className="block font-medium mb-1">Fin</label>
          <input
            type="time"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
            title="Hora de fin"
            placeholder="12:00"
          />
        </div>
      </div>
      <div>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            className="h-4 w-4"
          />
          Activo
        </label>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancelar</button>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark disabled:opacity-60">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
} 