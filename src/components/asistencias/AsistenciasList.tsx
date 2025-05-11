'use client'

import { useState, useEffect, useRef } from 'react'
import { useAsistencias } from '@/hooks/useAsistencias'
import { Spinner } from '@/components/ui/Spinner'
import { Alert } from '@/components/ui/Alert'
import { format, addDays, subDays, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Shift } from '@/types/supabase'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { useSwipeable } from 'react-swipeable'

export function AsistenciasList() {
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)
  const [filterDate, setFilterDate] = useState<string>(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [filterEstado, setFilterEstado] = useState<'todos' | 'presente' | 'ausente'>('todos')
  const [filterSede, setFilterSede] = useState<'todas' | 'Plaza Arenales' | 'Plaza Terán'>('todas')
  const [shifts, setShifts] = useState<Shift[]>([])
  const [filterShift, setFilterShift] = useState<string>(() =>
    typeof window !== 'undefined' ? localStorage.getItem('asistencias_filterShift') || '' : ''
  )
  const undoTimeout = useRef<NodeJS.Timeout | null>(null)
  const [undoStack, setUndoStack] = useState<{ id: string, prevEstado: 'presente' | 'ausente' } | null>(null)
  const { actualizarAsistencia } = useAsistencias({})
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/shifts')
      .then(res => res.json())
      .then(data => setShifts(data.filter((s: Shift) => s.is_active)))
      .catch(() => setShifts([]))
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('asistencias_filterShift', filterShift)
    }
  }, [filterShift])

  const { asistencias, loading, error, totalPages } = useAsistencias({
    page,
    pageSize: perPage,
    sede: filterSede === 'todas' ? undefined : filterSede,
    shiftId: filterShift || undefined,
    fecha: filterDate || undefined
  })

  if (loading && !asistencias?.length) {
    return <Spinner size="lg" className="mx-auto" />
  }

  if (error) {
    return <Alert variant="error">{error.message}</Alert>
  }

  if (!asistencias?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay asistencias registradas</p>
      </div>
    )
  }

  function handleToggleEstado(asistencia: any) {
    const nuevoEstado = asistencia.estado === 'presente' ? 'ausente' : 'presente'
    // Optimistic UI: actualizar visualmente
    setUndoStack({ id: asistencia.id, prevEstado: asistencia.estado })
    actualizarAsistencia({ id: asistencia.id, data: { estado: nuevoEstado } })
    // Opción de deshacer
    if (undoTimeout.current) clearTimeout(undoTimeout.current)
    undoTimeout.current = setTimeout(() => setUndoStack(null), 5000)
  }

  function handleUndo() {
    if (undoStack) {
      actualizarAsistencia({ id: undoStack.id, data: { estado: undoStack.prevEstado } })
      setUndoStack(null)
      if (undoTimeout.current) clearTimeout(undoTimeout.current)
    }
  }

  function handleLongPress(asistencia: any) {
    // Por ahora, alternar estado igual que con click
    handleToggleEstado(asistencia)
  }

  // Resumen de estados
  const resumen = asistencias.reduce(
    (acc, a) => {
      if (a.estado === 'presente') acc.presente++
      else acc.ausente++
      return acc
    },
    { presente: 0, ausente: 0 }
  )

  function toggleSelection(id: string) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function selectAll() {
    setSelectedIds(asistencias.map(a => a.id))
  }

  function clearSelection() {
    setSelectedIds([])
  }

  function handleBatchMark(estado: 'presente' | 'ausente') {
    selectedIds.forEach(id => actualizarAsistencia({ id, data: { estado } }))
    clearSelection()
  }

  // Navegación de fecha
  function goToPrevDay() {
    setFilterDate(prev => format(subDays(new Date(prev), 1), 'yyyy-MM-dd'))
  }
  function goToNextDay() {
    setFilterDate(prev => format(addDays(new Date(prev), 1), 'yyyy-MM-dd'))
  }
  function goToToday() {
    const today = new Date()
    setFilterDate(today.toISOString().split('T')[0])
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 mb-2 sm:mb-4">
        <div className="w-full sm:w-auto">
          <label htmlFor="filterDate" className="block text-sm font-medium text-gray-700">
            Filtrar por fecha
          </label>
          <input
            type="date"
            id="filterDate"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base sm:text-sm min-h-[44px]"
          />
        </div>

        <div className="w-full sm:w-auto">
          <label htmlFor="filterEstado" className="block text-sm font-medium text-gray-700">
            Filtrar por estado
          </label>
          <select
            id="filterEstado"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value as 'todos' | 'presente' | 'ausente')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base sm:text-sm min-h-[44px]"
          >
            <option value="todos">Todos</option>
            <option value="presente">Presente</option>
            <option value="ausente">Ausente</option>
          </select>
        </div>

        <div className="w-full sm:w-auto">
          <label htmlFor="filterSede" className="block text-sm font-medium text-gray-700">
            Filtrar por sede
          </label>
          <select
            id="filterSede"
            value={filterSede}
            onChange={(e) => setFilterSede(e.target.value as 'todas' | 'Plaza Arenales' | 'Plaza Terán')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base sm:text-sm min-h-[44px]"
          >
            <option value="todas">Todas</option>
            <option value="Plaza Arenales">Plaza Arenales</option>
            <option value="Plaza Terán">Plaza Terán</option>
          </select>
        </div>

        <div className="w-full sm:w-auto">
          <label htmlFor="filterShift" className="block text-sm font-medium text-gray-700">
            Filtrar por turno
          </label>
          <select
            id="filterShift"
            value={filterShift}
            onChange={e => { setFilterShift(e.target.value); setPage(1) }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base sm:text-sm min-h-[44px]"
          >
            <option value="">Todos</option>
            {shifts.map(shift => (
              <option key={shift.id} value={shift.id}>
                {shift.name} ({shift.start_time.slice(0,5)} - {shift.end_time.slice(0,5)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navegación por fecha y tabs de turno */}
      <div className="flex flex-wrap gap-2 items-center mb-2">
        <button onClick={goToPrevDay} className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-semibold">Anterior</button>
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          className="rounded border-gray-300 px-2 py-1 text-xs"
        />
        <button onClick={goToNextDay} className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-semibold">Siguiente</button>
        <button onClick={goToToday} className="px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-xs font-semibold" disabled={isToday(new Date(filterDate))}>Hoy</button>
        {/* Tabs de turno */}
        {shifts.length > 0 && (
          <div className="flex gap-1 ml-2">
            {shifts.map(shift => (
              <button
                key={shift.id}
                onClick={() => setFilterShift(shift.id)}
                className={`px-2 py-1 rounded text-xs font-semibold border ${filterShift === shift.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                {shift.name}
              </button>
            ))}
            <button
              onClick={() => setFilterShift('')}
              className={`px-2 py-1 rounded text-xs font-semibold border ${!filterShift ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              Todos
            </button>
          </div>
        )}
      </div>

      {/* Resumen de estados */}
      <div className="flex flex-wrap gap-4 items-center mb-2">
        <div className="flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1 text-sm">
          <CheckCircleIcon className="w-5 h-5 text-green-500" aria-hidden="true" />
          <span className="font-semibold">{resumen.presente}</span> presente
        </div>
        <div className="flex items-center gap-1 text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1 text-sm">
          <XCircleIcon className="w-5 h-5 text-red-500" aria-hidden="true" />
          <span className="font-semibold">{resumen.ausente}</span> ausente
        </div>
        <div className="text-gray-500 text-xs">Total: {resumen.presente + resumen.ausente}</div>
      </div>

      {/* Barra de acciones de selección múltiple */}
      {selectionMode && (
        <div className="flex flex-wrap gap-2 items-center mb-2 bg-indigo-50 border border-indigo-200 rounded px-2 py-1">
          <span className="text-sm font-medium">Seleccionados: {selectedIds.length}</span>
          <button onClick={selectAll} className="text-xs text-indigo-700 hover:underline">Seleccionar todos</button>
          <button onClick={clearSelection} className="text-xs text-indigo-700 hover:underline">Limpiar</button>
          <button onClick={() => handleBatchMark('presente')} className="text-xs bg-green-100 text-green-800 rounded px-2 py-1 font-semibold">Marcar presente</button>
          <button onClick={() => handleBatchMark('ausente')} className="text-xs bg-red-100 text-red-800 rounded px-2 py-1 font-semibold">Marcar ausente</button>
          <button onClick={() => setSelectionMode(false)} className="ml-auto text-xs text-gray-500 hover:underline">Salir</button>
        </div>
      )}
      <div className="flex flex-wrap gap-2 items-center mb-2">
        <button onClick={() => setSelectionMode(m => !m)} className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-1 font-semibold">
          {selectionMode ? 'Modo normal' : 'Selección múltiple'}
        </button>
      </div>

      <div className="bg-white shadow overflow-x-auto sm:overflow-hidden sm:rounded-lg">
        <table className="min-w-[600px] sm:min-w-full divide-y divide-gray-200 text-base sm:text-sm">
          <thead className="bg-gray-50">
            <tr>
              {selectionMode && (
                <th className="px-2 py-2">
                  <input type="checkbox" checked={selectedIds.length === asistencias.length} onChange={e => e.target.checked ? selectAll() : clearSelection()} aria-label="Seleccionar todos" />
                </th>
              )}
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alumno
              </th>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sede
              </th>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notas
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {asistencias.map((asistencia) => (
              <tr key={asistencia.id}>
                {selectionMode && (
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(asistencia.id)}
                      onChange={() => toggleSelection(asistencia.id)}
                      aria-label="Seleccionar asistencia"
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </td>
                )}
                <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {asistencia.alumno?.nombre} {asistencia.alumno?.apellido}
                </td>
                <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(asistencia.fecha), 'PPP', { locale: es })}
                </td>
                <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-sm">
                  <SwipeableRow asistencia={asistencia} onToggle={handleToggleEstado} onLongPress={handleLongPress}>
                    <button
                      type="button"
                      onClick={() => handleToggleEstado(asistencia)}
                      onTouchStart={e => {
                        const timeout = setTimeout(() => handleLongPress(asistencia), 600)
                        e.currentTarget.addEventListener('touchend', () => clearTimeout(timeout), { once: true })
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium focus:outline-none transition-colors duration-150 ${
                        asistencia.estado === 'presente'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                      aria-label="Alternar estado de asistencia"
                    >
                      {asistencia.estado === 'presente' ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-500" aria-hidden="true" />
                      ) : (
                        <XCircleIcon className="w-4 h-4 text-red-500" aria-hidden="true" />
                      )}
                      {asistencia.estado === 'presente' ? 'Presente' : 'Ausente'}
                    </button>
                  </SwipeableRow>
                </td>
                <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                  {asistencia.sede}
                </td>
                <td className="px-3 sm:px-6 py-3 text-sm text-gray-500">
                  {asistencia.notas || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-2 sm:mt-4 gap-2 sm:gap-0">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-3 sm:py-2 border border-gray-300 rounded-md text-base sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px]"
          >
            Anterior
          </button>
          <span className="text-base sm:text-sm text-gray-700">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-3 sm:py-2 border border-gray-300 rounded-md text-base sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px]"
          >
            Siguiente
          </button>
        </div>
      )}

      {undoStack && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white border border-gray-300 rounded-lg shadow-lg px-4 py-3 flex items-center gap-4 animate-fade-in">
          <span className="text-sm">Marcado de asistencia actualizado. </span>
          <button
            onClick={handleUndo}
            className="text-indigo-600 font-semibold hover:underline focus:outline-none"
          >
            Deshacer
          </button>
        </div>
      )}
    </div>
  )
}

// Componente auxiliar para swipe
function SwipeableRow({ asistencia, onToggle, onLongPress, children }: { asistencia: any, onToggle: (a: any) => void, onLongPress: (a: any) => void, children: React.ReactNode }) {
  const handlers = useSwipeable({
    onSwipedLeft: () => onToggle(asistencia),
    onSwipedRight: () => onToggle(asistencia),
    delta: 30,
    trackTouch: true,
    trackMouse: false
  })
  return (
    <div {...handlers} style={{ touchAction: 'pan-y' }}>
      {children}
    </div>
  )
}