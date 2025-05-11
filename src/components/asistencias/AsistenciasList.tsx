'use client'

import { useState, useEffect, useRef } from 'react'
import { useAsistencias } from '@/hooks/useAsistencias'
import { Spinner } from '@/components/ui/Spinner'
import { Alert } from '@/components/ui/Alert'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Shift } from '@/types/supabase'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { useSwipeable } from 'react-swipeable'

// Definir tipo mínimo para asistencia
interface Asistencia {
  id: string
  estado: 'presente' | 'ausente'
  // agregar más campos si se usan en el archivo
}

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
  const [showFiltersMobile, setShowFiltersMobile] = useState(false)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

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

  // DEBUG: log de filtros activos
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('Filtros asistencias:', {
      page,
      perPage,
      sede: filterSede === 'todas' ? undefined : filterSede,
      shiftId: filterShift || undefined,
      fecha: filterDate || undefined,
      estado: filterEstado !== 'todos' ? filterEstado : undefined
    })
  }, [page, perPage, filterSede, filterShift, filterDate, filterEstado])

  const { asistencias, loading, error, totalPages } = useAsistencias({
    page,
    pageSize: perPage,
    sede: filterSede === 'todas' ? undefined : filterSede,
    shiftId: filterShift || undefined,
    fecha: filterDate || undefined,
    estado: filterEstado === 'todos' ? undefined : filterEstado
  })

  if (loading && !asistencias?.length) {
    return <Spinner size="lg" className="mx-auto" />
  }

  if (error) {
    return <Alert variant="error">{error.message}</Alert>
  }

  // Filtros (siempre visibles)
  const filtrosUI = isMobile ? (
    <>
      <button
        className="mb-2 px-4 py-2 bg-gray-200 rounded text-gray-700 font-semibold"
        onClick={() => setShowFiltersMobile(true)}
      >
        Filtros
      </button>
      {showFiltersMobile && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg">Filtros</span>
              <button onClick={() => setShowFiltersMobile(false)} className="text-gray-500">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label htmlFor="filterDateMobile" className="block text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="date"
                  id="filterDateMobile"
                  value={filterDate}
                  onChange={e => { setFilterDate(e.target.value); setPage(1) }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base min-h-[44px]"
                />
              </div>
              <div>
                <label htmlFor="filterEstadoMobile" className="block text-sm font-medium text-gray-700">Estado</label>
                <select
                  id="filterEstadoMobile"
                  value={filterEstado}
                  onChange={e => { setFilterEstado(e.target.value as 'todos' | 'presente' | 'ausente'); setPage(1) }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base min-h-[44px]"
                >
                  <option value="todos">Todos</option>
                  <option value="presente">Presente</option>
                  <option value="ausente">Ausente</option>
                </select>
              </div>
              <div>
                <label htmlFor="filterSedeMobile" className="block text-sm font-medium text-gray-700">Sede</label>
                <select
                  id="filterSedeMobile"
                  value={filterSede}
                  onChange={e => { setFilterSede(e.target.value as 'todas' | 'Plaza Arenales' | 'Plaza Terán'); setPage(1) }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base min-h-[44px]"
                >
                  <option value="todas">Todas</option>
                  <option value="Plaza Arenales">Plaza Arenales</option>
                  <option value="Plaza Terán">Plaza Terán</option>
                </select>
              </div>
              <div>
                <label htmlFor="filterShiftMobile" className="block text-sm font-medium text-gray-700">Turno</label>
                <select
                  id="filterShiftMobile"
                  value={filterShift}
                  onChange={e => { setFilterShift(e.target.value); setPage(1) }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base min-h-[44px]"
                >
                  <option value="">Todos</option>
                  {shifts.map(shift => (
                    <option key={shift.id} value={shift.id}>
                      {shift.name} ({shift.start_time.slice(0,5)} - {shift.end_time.slice(0,5)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setFilterDate(new Date().toISOString().split('T')[0])
                    setFilterEstado('todos')
                    setFilterSede('todas')
                    setFilterShift('')
                    setPage(1)
                    setShowFiltersMobile(false)
                  }}
                  className="px-3 py-2 rounded bg-gray-200 text-gray-700 text-xs font-semibold border border-gray-300 hover:bg-gray-300"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  ) : (
    <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 mb-2 sm:mb-4">
      <div className="w-full sm:w-auto">
        <label htmlFor="filterDate" className="block text-sm font-medium text-gray-700">
          Filtrar por fecha
        </label>
        <input
          type="date"
          id="filterDate"
          value={filterDate}
          onChange={(e) => { setFilterDate(e.target.value); setPage(1) }}
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
          onChange={(e) => { setFilterEstado(e.target.value as 'todos' | 'presente' | 'ausente'); setPage(1) }}
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
          onChange={(e) => { setFilterSede(e.target.value as 'todas' | 'Plaza Arenales' | 'Plaza Terán'); setPage(1) }}
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

      <div className="w-full sm:w-auto flex items-end">
        <button
          type="button"
          onClick={() => {
            setFilterDate(new Date().toISOString().split('T')[0])
            setFilterEstado('todos')
            setFilterSede('todas')
            setFilterShift('')
            setPage(1)
          }}
          className="ml-2 px-3 py-2 rounded bg-gray-200 text-gray-700 text-xs font-semibold border border-gray-300 hover:bg-gray-300"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  )

  // Resumen de estados
  const resumen = asistencias.length > 0 ? asistencias.reduce(
    (acc, a) => {
      if (a.estado === 'presente') acc.presente++
      else acc.ausente++
      return acc
    },
    { presente: 0, ausente: 0 }
  ) : { presente: 0, ausente: 0 }

  function handleToggleEstado(asistencia: Asistencia) {
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

  function handleLongPress(asistencia: Asistencia) {
    // Por ahora, alternar estado igual que con click
    handleToggleEstado(asistencia)
  }

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

  return (
    <div className="space-y-4">
      {filtrosUI}
      {asistencias.length > 0 ? (
        <>
          {/* Resumen de estados */}
          {asistencias.length > 0 && (
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
          )}
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {asistencias.filter(a => a.alumno).map((asistencia) => (
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
                      <SwipeableRow asistencia={asistencia} onToggle={handleToggleEstado}>
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
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {filterSede !== 'todas' || filterShift !== '' || filterDate !== new Date().toISOString().split('T')[0] || filterEstado !== 'todos'
              ? 'No hay coincidencias para los filtros aplicados.'
              : 'No hay asistencias registradas.'}
            {(filterSede !== 'todas' || filterShift !== '' || filterDate !== new Date().toISOString().split('T')[0] || filterEstado !== 'todos') && (
              <>
                <br />
                <span className="text-xs text-gray-400">Prueba cambiando la fecha o limpiando los filtros.</span>
              </>
            )}
          </p>
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
function SwipeableRow({ asistencia, onToggle, children }: { asistencia: Asistencia, onToggle: (a: Asistencia) => void, children: React.ReactNode }) {
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