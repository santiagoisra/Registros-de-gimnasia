import { NextResponse } from 'next/server'

// URL base del servidor del agente de Python (adk api_server)
const AGENT_BASE_URL = process.env.AGENT_BASE_URL || 'http://localhost:8000';
const AGENT_RUN_URL = `${AGENT_BASE_URL}/agente_ia/`;

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'No se proporcionó mensaje' }, { status: 400 })
    }

    console.log('Mensaje recibido en la API Next.js:', message)

    // Enviar el mensaje directamente al backend del agente
    const agentResponse = await fetch(AGENT_RUN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    })

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text()
      console.error(`Error del servidor del agente (${agentResponse.status}):`, errorText)
      return NextResponse.json({ error: `Error al comunicarse con el agente: ${agentResponse.status} ${errorText}` }, { status: agentResponse.status })
    }

    const agentData = await agentResponse.json()
    console.log('Respuesta completa del agente:', agentData)

    // Procesar la respuesta del agente
    let responseContent = agentData.response || agentData.message || JSON.stringify(agentData)

    return NextResponse.json({ response: responseContent });

  } catch (error) {
    console.error('Error inesperado en la ruta API /api/agente-ia:', error)
    return NextResponse.json({ error: `Error interno del servidor: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 })
  }
}

// Ejemplo de uso en frontend (ya implementado en page.tsx):
// const response = await fetch('/api/agente-ia', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({ message: inputMessage }),
// });
// const data = await response.json();
// setMessages(prevMessages => [...prevMessages, { text: data.response, sender: 'agent' }]);

// También podrías añadir una función GET si necesitás inicializar algo o mostrar info al cargar la página
/*
export async function GET(request: Request) {
  // Lógica para obtener info inicial del agente si es necesario
  return NextResponse.json({ initialData: '...' })
}
*/