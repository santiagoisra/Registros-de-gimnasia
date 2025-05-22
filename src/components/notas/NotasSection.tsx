'use client'

import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useNotas } from '@/hooks/useNotas'
import { useAutoSave } from '@/hooks/useAutoSave'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { formatDate } from '@/utils'
import { useState } from 'react'
import type { Nota } from '@/types'

interface NotasSectionProps {
  alumnoId: string
}

export function NotasSection({ alumnoId }: NotasSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentContent, setCurrentContent] = useState('')
  const { notas, createNota, updateNota, isLoading } = useNotas({ alumnoId })

  // Auto-guardado de la nota actual
  useAutoSave({
    value: currentContent,
    onSave: async (value: unknown) => {
      const content = String(value ?? '')
      if (!content.trim()) return

      await createNota({
        alumnoId,
        fecha: formatDate(new Date()),
        contenido: content,
        tipo: 'General',
        visibleEnReporte: true,
      })

      // Limpiar el contenido después de guardar
      setCurrentContent('')
    },
    delay: 2000, // 2 segundos de debounce
    enabled: Boolean(currentContent.trim()),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div
        className="flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-medium text-gray-900">Notas</h3>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
        />
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Editor para nueva nota */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Nueva nota</h4>
            <RichTextEditor
              content={currentContent}
              onChange={setCurrentContent}
              placeholder="Escribe una nueva nota..."
              autoFocus
            />
          </div>

          {/* Historial de notas */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Historial de notas</h4>
            {notas.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No hay notas registradas</p>
            ) : (
              notas.map((nota: Nota) => (
                <div
                  key={nota.id}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(new Date(nota.fecha))}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(nota.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        nota.visibleEnReporte
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {nota.visibleEnReporte ? 'Visible en reporte' : 'No visible en reporte'}
                    </span>
                  </div>
                  <div className="prose max-w-none text-sm text-gray-700">
                    <RichTextEditor
                      content={nota.contenido as string}
                      onChange={async (content: string) => {
                        await updateNota({
                          id: nota.id,
                          data: { contenido: content },
                        })
                      }}
                      readOnly
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
} 