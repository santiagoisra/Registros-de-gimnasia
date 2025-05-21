'use client'

import React, { useState } from 'react'

export default function AgenteIAPage() {
  const [messages, setMessages] = useState<{ text: string, sender: 'user' | 'agent' }[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Usar con Agente IA</h1>
      <p className="mb-6 text-gray-700 leading-relaxed">
        Este panel te permite interactuar con un agente inteligente para gestionar alumnos, pagos, asistencias y recibir alertas automáticas usando lenguaje natural. Pronto vas a poder hacer SUDO de usuarios y operar sobre los datos del sistema desde aquí.
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
    </div>
  )
} 