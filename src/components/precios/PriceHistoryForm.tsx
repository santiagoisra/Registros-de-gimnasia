import { useState } from 'react'
import type { HistorialPrecio } from '@/types'
import { formatDate } from '@/utils'

interface PriceHistoryFormProps {
  initialData?: Partial<HistorialPrecio>
  preciosExistentes: HistorialPrecio[]
  onSubmit: (data: Omit<HistorialPrecio, 'id'>) => Promise<void>
  onClose: () => void
  loading?: boolean
  error?: string | null
  alumnos?: { id: string; nombre: string; apellido: string }[]
  alumnosLoading?: boolean
}

export default function PriceHistoryForm({
  initialData = {},
  preciosExistentes,
  onSubmit,
  onClose,
  loading = false,
  error = null,
  alumnos,
  alumnosLoading
}: PriceHistoryFormProps) {
  const [form, setForm] = useState<Omit<HistorialPrecio, 'id'>>({
    alumnoId: initialData.alumnoId || '',
    precio: initialData.precio || 0,
    fechaDesde: initialData.fechaDesde || formatDate(new Date()),
    fechaHasta: initialData.fechaHasta || '',
    servicio: initialData.servicio || 'Clases',
    tipoServicio: initialData.tipoServicio || 'Individual',
    activo: initialData.activo ?? true,
    moneda: initialData.moneda || 'ARS',
    descuento: initialData.descuento,
    incrementoProgramado: initialData.incrementoProgramado,
    historialCambios: initialData.historialCambios,
    notas: initialData.notas || '',
    createdAt: initialData.createdAt || '',
    updatedAt: initialData.updatedAt || ''
  })
  const [formError, setFormError] = useState<string | null>(null)

  // Validación de solapamiento de fechas
  const validateFechas = () => {
    const desde = new Date(form.fechaDesde)
    const hasta = form.fechaHasta ? new Date(form.fechaHasta) : null
    for (const precio of preciosExistentes) {
      if (initialData.id && precio.id === initialData.id) continue // Ignorar el actual en edición
      const pDesde = new Date(precio.fechaDesde)
      const pHasta = precio.fechaHasta ? new Date(precio.fechaHasta) : null
      // Si hay solapamiento
      if (
        (!pHasta || !hasta || hasta >= pDesde) &&
        (!hasta || !pHasta || desde <= pHasta)
      ) {
        return 'Las fechas se solapan con otro precio registrado.'
      }
    }
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    let newValue: any = value
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      newValue = e.target.checked
    }
    setForm((prev) => ({
      ...prev,
      [name]: newValue
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    // Validaciones básicas
    if (!form.alumnoId || form.alumnoId.trim() === '') {
      setFormError('Debe seleccionarse un alumno válido para el historial de precios.')
      return
    }
    if (!form.precio || form.precio <= 0) {
      setFormError('El precio debe ser mayor a 0')
      return
    }
    if (!form.fechaDesde) {
      setFormError('La fecha de inicio es obligatoria')
      return
    }
    const fechasError = validateFechas()
    if (fechasError) {
      setFormError(fechasError)
      return
    }
    try {
      await onSubmit(form)
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar el precio')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4 relative"
      >
        <button
          type="button"
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          disabled={loading}
        >
          ×
        </button>
        <h2 className="text-lg font-bold mb-2">{initialData.id ? 'Editar precio' : 'Nuevo precio'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alumnos && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Alumno</label>
              <select
                name="alumnoId"
                value={form.alumnoId}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-2 py-1"
                required
                disabled={loading || alumnosLoading}
                title="Seleccionar alumno"
              >
                <option value="">Seleccionar alumno...</option>
                {alumnos.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.nombre} {a.apellido}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium">Precio</label>
            <input
              type="number"
              name="precio"
              value={form.precio}
              onChange={handleChange}
              className="mt-1 block w-full border rounded px-2 py-1"
              min={0}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Moneda</label>
            <select
              name="moneda"
              value={form.moneda}
              onChange={handleChange}
              className="mt-1 block w-full border rounded px-2 py-1"
              disabled={loading}
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Servicio</label>
            <select
              name="servicio"
              value={form.servicio}
              onChange={handleChange}
              className="mt-1 block w-full border rounded px-2 py-1"
              disabled={loading}
            >
              <option value="Clases">Clases</option>
              <option value="Competencia">Competencia</option>
              <option value="Equipamiento">Equipamiento</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Tipo de servicio</label>
            <select
              name="tipoServicio"
              value={form.tipoServicio}
              onChange={handleChange}
              className="mt-1 block w-full border rounded px-2 py-1"
              disabled={loading}
            >
              <option value="Individual">Individual</option>
              <option value="Grupal">Grupal</option>
              <option value="Personalizado">Personalizado</option>
              <option value="Evento">Evento</option>
              <option value="Material">Material</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Fecha desde</label>
            <input
              type="date"
              name="fechaDesde"
              value={form.fechaDesde}
              onChange={handleChange}
              className="mt-1 block w-full border rounded px-2 py-1"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Fecha hasta</label>
            <input
              type="date"
              name="fechaHasta"
              value={form.fechaHasta || ''}
              onChange={handleChange}
              className="mt-1 block w-full border rounded px-2 py-1"
              disabled={loading}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Notas</label>
          <textarea
            name="notas"
            value={form.notas}
            onChange={handleChange}
            className="mt-1 block w-full border rounded px-2 py-1"
            rows={2}
            disabled={loading}
          />
        </div>
        {/* Aquí se pueden agregar campos para descuento e incrementoProgramado si se requiere */}
        {formError && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm">{formError}</div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm">{error}</div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Guardando...' : initialData.id ? 'Guardar cambios' : 'Crear precio'}
          </button>
        </div>
      </form>
    </div>
  )
} 