'use client'
import { useState } from 'react'
import { generateReport, exportToCSV, exportToPDF, ReportParams } from '@/services/reportGenerator'
import { ArrowDownTrayIcon, FunnelIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { Spinner } from '@/components/ui/Spinner'

const tipos = [
  { value: 'alumnos', label: 'Alumnos' },
  { value: 'pagos', label: 'Pagos' },
  { value: 'asistencias', label: 'Asistencias' },
  { value: 'notas', label: 'Notas' },
  { value: 'precios', label: 'Historial de Precios' },
]

export function ReportBuilder() {
  const [tipo, setTipo] = useState<ReportParams['tipo']>('alumnos')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [loading, setLoading] = useState(false)
  const [columns, setColumns] = useState<string[]>([])
  const [rows, setRows] = useState<(string | number)[][]>([])
  const [error, setError] = useState('')

  async function handleGenerar() {
    setLoading(true)
    setError('')
    try {
      const { columns, rows } = await generateReport({ tipo, fechaDesde, fechaHasta })
      setColumns(columns)
      setRows(rows)
    } catch {
      setError('Error al generar el reporte')
    } finally {
      setLoading(false)
    }
  }

  function handleExportCSV() {
    if (!columns.length) return
    const csv = exportToCSV(columns, rows)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-${tipo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleExportPDF() {
    if (!columns.length) return
    const pdf = exportToPDF(`Reporte de ${tipos.find(t => t.value === tipo)?.label}`, columns, rows)
    pdf.save(`reporte-${tipo}.pdf`)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <DocumentArrowDownIcon className="h-6 w-6 text-primary" /> Generador de Reportes Personalizados
      </h2>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Reporte</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={tipo}
            onChange={e => setTipo(e.target.value as ReportParams['tipo'])}
          >
            {tipos.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={fechaDesde}
            onChange={e => setFechaDesde(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={fechaHasta}
            onChange={e => setFechaHasta(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <button
            className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-primary-dark"
            onClick={handleGenerar}
            disabled={loading}
          >
            <FunnelIcon className="h-5 w-5" /> Generar
          </button>
        </div>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading && <div className="flex items-center justify-center h-32"><Spinner size="md" /></div>}
      {!loading && columns.length > 0 && (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full border rounded">
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col} className="px-3 py-2 border-b bg-slate-50 text-xs text-gray-700 font-semibold">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  {row.map((cell: string | number, j: number) => (
                    <td key={j} className="px-3 py-2 border-b text-xs text-gray-800">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-4 mt-4">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"
              onClick={handleExportCSV}
            >
              <ArrowDownTrayIcon className="h-5 w-5" /> Exportar CSV
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-700"
              onClick={handleExportPDF}
            >
              <DocumentArrowDownIcon className="h-5 w-5" /> Exportar PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 