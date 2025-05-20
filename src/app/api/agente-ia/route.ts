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
    let responseContent = 'Respuesta del agente no reconocida o vacía.';

    // El endpoint /run devuelve una lista de eventos. Buscamos el último evento de rol 'model' con contenido de texto.
    if (Array.isArray(agentData) && agentData.length > 0) {
        // Buscamos el último evento que contiene la respuesta del modelo
        const lastModelEvent = agentData.reverse().find(event =>
            event.author === AGENT_APP_NAME && // Asegurarse que es un evento del agente
            event.content &&
            Array.isArray(event.content.parts) &&
            event.content.parts.some(part => part.text)
        );

        if (lastModelEvent && lastModelEvent.content && Array.isArray(lastModelEvent.content.parts)) {
            // Concatenar todo el texto de las partes
            responseContent = lastModelEvent.content.parts
                .filter(part => part.text)
                .map(part => part.text)
                .join(' ') // Unir partes de texto con un espacio
                .trim();

            // Si la respuesta principal es solo texto, la usamos.
            if (responseContent) {
                 console.log('Respuesta de texto extraída:', responseContent);
            } else {
                 // Si no hay texto directo, intentamos extraer info de tool_code_response si existe
                 const toolCodeEvent = agentData.find(event => event.tool_code_response); // Buscar evento con respuesta de herramienta
                 if(toolCodeEvent && toolCodeEvent.tool_code_response && toolCodeEvent.tool_code_response.response) {
                     const toolResponse = toolCodeEvent.tool_code_response.response;
                      if (toolResponse.alerta) {
                         responseContent = toolResponse.alerta;
                     } else if (toolResponse.resumen) {
                         responseContent = toolResponse.resumen;
                     } else if (toolResponse.message) {
                          responseContent = toolResponse.message + (toolResponse.data ? ': ' + JSON.stringify(toolResponse.data, null, 2) : '');
                     } else if (toolResponse.data) {
                          responseContent = JSON.stringify(toolResponse.data, null, 2);
                     } else {
                         responseContent = JSON.stringify(toolResponse, null, 2); // Fallback
                     }
                      console.log('Respuesta de herramienta extraída:', responseContent);
                 } else { // Si no hay texto ni tool_code_response clara, mostramos la respuesta completa para depurar
                     console.warn('No se pudo extraer respuesta de texto o herramienta. Mostrando respuesta completa.');
                     responseContent = JSON.stringify(agentData, null, 2);
                 }
            }

        } else { // Si no se encontró un evento de modelo con texto
            console.warn('No se encontró un evento de modelo con contenido de texto en la respuesta. Mostrando respuesta completa.');
            responseContent = JSON.stringify(agentData, null, 2);
        }

    } else { // Si agentData no es un array o está vacío
       console.warn('La respuesta del agente no es un array o está vacía. Mostrando respuesta completa.');
       responseContent = JSON.stringify(agentData, null, 2);
    }

    // Si la respuesta extraída es vacía, usamos un mensaje por defecto.
    if (!responseContent || responseContent.trim() === '') {
         responseContent = 'El agente no proporcionó una respuesta de texto.';
    }

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