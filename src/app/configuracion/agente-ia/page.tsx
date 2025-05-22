'use client'

import React, { useState } from 'react'
// import DatePicker from 'react-datepicker' // Eliminada porque no se usa
// import "react-datepicker/dist/react-datepicker.css" // Eliminada porque DatePicker no se usa
// import type { MetodoPago } from '@/types' // Eliminada porque no se usa
// import { toast } from 'react-hot-toast' // Comentamos toast ya que no se usa en la lógica actual
//import { usePagos } from '@/hooks/usePagos' // Ya no se usa usePagos aquí
//import { useAlumnos } from '@/hooks/useAlumnos' // Ya no se usa useAlumnos aquí
//import { useToast } from '@/hooks/useToast' // Ya no se usa useToast aquí
//import { Spinner } from '@/components/ui/Spinner'
//import { Input } from '@/components/ui/Input'
//import { classNames } from '@/utils/classNames'
//import { classNames } from '@/utils/classNames'

// No necesitamos PagoFormBulkProps aquí ya que PagoFormBulk se define en otro archivo
// interface PagoFormBulkProps {
//   onSuccess?: () => void
// }

// Tampoco necesitamos metodosPago aquí, se define en PagoFormBulk.tsx
// const metodosPago: MetodoPago[] = ['Efectivo', 'Transferencia', 'Mercado Pago']

// Componente Modal simple
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
};


export default function AgenteIAPage() {
  const [messages, setMessages] = useState<{ text: string, sender: 'user' | 'agent' }[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false); // Estado para controlar el modal de ayuda

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const newMessage = inputMessage
    setMessages(prevMessages => [...prevMessages, { text: newMessage, sender: 'user' }])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/agente-ia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessage }),
      })

      if (!response.ok) {
        throw new Error(`Error en la API: ${response.statusText}`)
      }

      const data = await response.json()
      setMessages(prevMessages => [...prevMessages, { text: data.response, sender: 'agent' }])

    } catch (error) {
      console.error('Error al enviar mensaje a la API:', error)
      setMessages(prevMessages => [...prevMessages, { text: `Error al comunicarse con el agente: ${error instanceof Error ? error.message : String(error)}`, sender: 'agent' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-4">
         <h1 className="text-3xl font-bold text-gray-900">Usar con Agente IA</h1>
         <button onClick={() => setShowHelpModal(true)} className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4c-.47 0-.93-.097-1.345-.275M9 16l-.008-.008m-2.002 2.002L10 16m0 0l2 2m-2-2l-2-2m2-2l2-2m0-4V7m0-3v2m0 10v2M3 12h2m14 0h2M6 18L4 20M6 6l-2 2M18 6l2 2M18 18l2 2" />
            </svg>
         </button>
      </div>
      <p className="mb-6 text-gray-700 leading-relaxed">
        Interactúa con el Agente IA para una gestión eficiente de gimnasios. Este asistente inteligente te permite administrar alumnos, pagos, asistencias y notas utilizando lenguaje natural. También puede proporcionar resúmenes y alertas. Explora sus capacidades y optimiza tus tareas diarias.
      </p>

      {/* Interfaz de Chat */}
      <div className="flex flex-col h-[500px] border border-gray-200 rounded-xl shadow-lg overflow-hidden bg-white">
        {/* Área de Mensajes */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`inline-block px-4 py-2 rounded-xl max-w-[80%] break-words ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-gray-200 text-gray-800 rounded-bl-sm'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {/* Indicador de carga del agente */}
          {isLoading && (
            <div className="flex items-start justify-start">
              <div className="inline-block px-4 py-2 rounded-xl bg-gray-200 text-gray-800 rounded-bl-sm animate-pulse">
                Escribiendo...
              </div>
            </div>
          )}
        </div>

        {/* Input y Botón de Enviar */}
        <form onSubmit={handleSendMessage} className="flex p-4 border-t border-gray-200 bg-gray-50 gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 px-4 py-2"
            placeholder="Escribe tu mensaje aquí..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            disabled={!inputMessage.trim() || isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
      </div>

      {/* Modal de Ayuda */}
      <Modal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} title="Capacidades del Agente IA">
        <p>El Agente IA está diseñado para ayudarte con:</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Administración de Alumnos (crear, leer, actualizar, eliminar)</li>
          <li>Registro y consulta de Pagos</li>
          <li>Gestión de Asistencias</li>
          <li>Creación y lectura de Notas</li>
          <li>Obtener resúmenes completos por alumno</li>
          <li>Consultar el último pago de un alumno por nombre</li>
          <li>Recibir alertas automáticas</li>
        </ul>
        <p className="mt-4">Pronto podrás realizar operaciones avanzadas y análisis de datos.</p>
      </Modal>
    </div>
  )
} 