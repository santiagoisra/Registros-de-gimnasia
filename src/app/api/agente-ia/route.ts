import { NextResponse } from 'next/server'

// URL base del servidor del agente de Python (adk api_server)
const AGENT_BASE_URL = process.env.AGENT_BASE_URL || 'http://localhost:8000';
const AGENT_APP_NAME = 'agent'; // Corregido: Usar 'agent' para coincidir con el nombre del directorio pasado a adk api_server
const USER_ID = 'user123'; // Placeholder - puedes usar un ID de usuario real
const SESSION_ID = 'session123'; // Placeholder - puedes usar un ID de sesión real

// Endpoint para enviar mensajes al agente
const AGENT_RUN_URL = `${AGENT_BASE_URL}/run`;
// Endpoint para crear/obtener sesiones
const AGENT_SESSION_URL = `${AGENT_BASE_URL}/apps/${AGENT_APP_NAME}/users/${USER_ID}/sessions/${SESSION_ID}`;

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'No se proporcionó mensaje' }, { status: 400 })
    }

    console.log('Mensaje recibido en la API Next.js:', message)

    // --- Paso 1: Asegurar que la sesión exista ---
    console.log(`Intentando crear/obtener sesión en: ${AGENT_SESSION_URL}`);
    const sessionResponse = await fetch(AGENT_SESSION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // El cuerpo de la solicitud para crear sesión puede ser vacío o con estado inicial
      body: JSON.stringify({}), // Enviamos un cuerpo vacío
    });

    if (!sessionResponse.ok) {
      const errorText = await sessionResponse.text();
      // Si la sesión ya existe, el servidor ADK puede devolver 409 Conflict o un mensaje específico en 404/400
      // Verificamos si el error sugiere que la sesión ya existe para no detener el proceso
      const sessionErrorDetail = errorText.toLowerCase();
      if (!(sessionResponse.status === 409 || sessionErrorDetail.includes('session already exists'))) {
         console.error(`Error al crear/obtener sesión (${sessionResponse.status}):`, errorText);
         return NextResponse.json({ error: `Error al configurar la sesión con el agente: ${sessionResponse.status} ${errorText}` }, { status: sessionResponse.status });
      }
       console.log(`Sesión ya existente o creada con éxito (status ${sessionResponse.status}). Procediendo...`);
    } else {
       console.log(`Sesión creada/obtenida con éxito (status ${sessionResponse.status}). Procediendo...`);
    }

    // --- Paso 2: Enviar el mensaje a la sesión existente/creada ---
    console.log(`Enviando mensaje a la sesión en: ${AGENT_RUN_URL}`);
    const requestBody = {
      app_name: AGENT_APP_NAME, // Usar el nombre del directorio del agente
      user_id: USER_ID, // Usar el ID de usuario de la sesión
      session_id: SESSION_ID, // Usar el ID de sesión
      new_message: {
        role: 'user',
        parts: [{
          text: message
        }]
      }
    };

    console.log('Cuerpo de la solicitud enviado al agente (/run):', JSON.stringify(requestBody, null, 2));

    const agentResponse = await fetch(AGENT_RUN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text()
      console.error(`Error del servidor del agente (/run ${agentResponse.status}):`, errorText)
      return NextResponse.json({ error: `Error al comunicarse con el agente: ${agentResponse.status} ${errorText}` }, { status: agentResponse.status })
    }

    const agentData = await agentResponse.json()
    console.log('Respuesta completa del agente Python (/run):', agentData)

    // --- Paso 3: Procesar la respuesta del agente ---
    let responseContent = 'El agente no proporcionó una respuesta de texto.'; // Mensaje por defecto

    if (Array.isArray(agentData) && agentData.length > 0) {
      // Buscar el último evento que contenga texto en content.parts
      // Iteramos desde el final para encontrar el mensaje más reciente
      for (let i = agentData.length - 1; i >= 0; i--) {
        const event: { content?: { parts?: { text?: string }[] } } = agentData[i]; // Tipo más específico
        if (event.content && Array.isArray(event.content.parts)) {
          const textParts = event.content.parts.filter((part): part is { text: string } => typeof part.text === 'string' && part.text.length > 0); // Usar type predicate
          if (textParts.length > 0) {
            // Concatenar todo el texto de las partes encontradas en este evento
            responseContent = textParts.map((part) => part.text).join('').trim(); // Eliminar any innecesario
            console.log('Texto extraído (último evento con texto):', responseContent);
            break; // Encontramos el mensaje principal, salimos
          }
        }
      }

      // Si después de buscar cualquier evento con texto, responseContent sigue siendo el mensaje por defecto,
      // podríamos intentar la lógica original o loggear la respuesta completa para depurar.
       if (responseContent === 'El agente no proporcionó una respuesta de texto.') {
           console.warn('No se encontró ningún evento con contenido de texto en la respuesta. Respuesta completa:', JSON.stringify(agentData, null, 2));
           // Opcional: Podrías añadir aquí una lógica de respaldo para buscar específicamente por role === 'model'
           // aunque la búsqueda general debería capturar el caso principal.
       }

    } else {
       console.warn('La respuesta del agente no es un array o está vacía. Respuesta completa:', JSON.stringify(agentData, null, 2));
       // responseContent ya tiene el mensaje por defecto adecuado.
    }

    // responseContent ya tiene el mensaje final o el mensaje por defecto

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