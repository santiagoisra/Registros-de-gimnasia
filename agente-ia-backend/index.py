from fastapi import FastAPI, Request
from typing import Dict, Any, List
import os

# Importar Google ADK
try:
    from google.adk.agents import Agent
    from google.adk.runners import Runner
    from google.adk.sessions import InMemorySessionService
    from google.genai import types
    google_adk_available = True
except ImportError:
    google_adk_available = False
    Agent = None

# Importamos nuestras funciones del agente (ajustado para import absoluto)
from src.agent.agent.agent import (
    crud_alumnos,
    crud_pagos,
    crud_notas,
    crud_asistencias,
    resumen_alumno,
    listar_nombres_alumnos,
    ultimo_pago_alumno,
    saludo_alerta,
    get_sudo_users
)

# Creamos una instancia de FastAPI
app = FastAPI()

# Inicializar el agente de Google ADK si está disponible
root_agent = None
session_service = None
runner = None
APP_NAME = "gimnasia_app"
USER_ID = "usuario1"
SESSION_ID = "sesion1"
if google_adk_available:
    try:
        print("Iniciando configuración del agente Google ADK...")
        tools = [
            crud_alumnos,
            crud_pagos,
            crud_notas,
            crud_asistencias,
            resumen_alumno,
            listar_nombres_alumnos,
            ultimo_pago_alumno,
            saludo_alerta,
            get_sudo_users
        ]
        print(f"Tools configuradas: {len(tools)}")
        root_agent = Agent(
            name="GymManagementAgent",
            description="Agente para gestión de gimnasio con funciones CRUD para alumnos, pagos, notas y asistencias",
            tools=tools
        )
        session_service = InMemorySessionService()
        session_service.create_session(app_name=APP_NAME, user_id=USER_ID, session_id=SESSION_ID)
        runner = Runner(agent=root_agent, app_name=APP_NAME, session_service=session_service)
        print("Agente inicializado exitosamente")
    except Exception as e:
        print(f"Error detallado inicializando Google ADK Agent: {e}")
        import traceback
        traceback.print_exc()
        root_agent = None
        session_service = None
        runner = None
else:
    print("Google ADK no está disponible")

# Y en el endpoint, mejorar el manejo de errores:
@app.post("/agente_ia/")
async def run_agent(request: Request):
    print(f"Recibida solicitud en /agente_ia/. ADK disponible: {google_adk_available}, Agente: {root_agent is not None}")
    if not google_adk_available:
        return {"status": "error", "message": "Google ADK no está instalado. Instálalo con 'pip install google-adk'"}
    if not root_agent or not runner or not session_service:
        return {"status": "error", "message": "El agente no pudo ser inicializado"}
    try:
        data = await request.json()
        message = data.get("message", "")
        print(f"Procesando mensaje: {message}")
        content = types.Content(role="user", parts=[types.Part(text=message)])
        events = runner.run(user_id=USER_ID, session_id=SESSION_ID, new_message=content)
        respuesta = None
        for event in events:
            if event.is_final_response():
                respuesta = event.content.parts[0].text if event.content and event.content.parts else None
                break
        print(f"Respuesta del agente: {respuesta}")
        return {
            "status": "success",
            "response": respuesta or "No se recibió respuesta del agente.",
            "message": "Procesado exitosamente"
        }
    except Exception as e:
        print(f"Error detallado procesando solicitud: {e}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "message": f"Error procesando solicitud: {str(e)}",
            "response": "Lo siento, ocurrió un error procesando tu solicitud."
        }

# Definimos los endpoints de la API que corresponden a nuestras herramientas
# Cada endpoint recibirá los datos necesarios en el body de la solicitud POST

@app.post("/crud_alumnos/")
async def handle_crud_alumnos(data: Dict[str, Any]):
    action = data.get("action")
    tool_data = data.get("data", {})
    return crud_alumnos(action=action, data=tool_data)

@app.post("/crud_pagos/")
async def handle_crud_pagos(data: Dict[str, Any]):
    action = data.get("action")
    tool_data = data.get("data", {})
    return crud_pagos(action=action, data=tool_data)

@app.post("/crud_notas/")
async def handle_crud_notas(data: Dict[str, Any]):
    action = data.get("action")
    tool_data = data.get("data", {})
    return crud_notas(action=action, data=tool_data)

@app.post("/crud_asistencias/")
async def handle_crud_asistencias(data: Dict[str, Any]):
    action = data.get("action")
    tool_data = data.get("data", {})
    return crud_asistencias(action=action, data=tool_data)

@app.post("/resumen_alumno/")
async def handle_resumen_alumno(data: Dict[str, Any]):
    alumno_id = data.get("alumno_id")
    if not alumno_id:
        return {"status": "error", "message": "Falta el alumno_id", "resumen": None}
    return resumen_alumno(alumno_id=alumno_id)

@app.post("/listar_nombres_alumnos/")
async def handle_listar_nombres_alumnos():
    return listar_nombres_alumnos()

@app.post("/ultimo_pago_alumno/")
async def handle_ultimo_pago_alumno(data: Dict[str, Any]):
    nombre = data.get("nombre")
    apellido = data.get("apellido")
    if not nombre or not apellido:
         return {"status": "error", "message": "Faltan nombre o apellido", "data": None}
    return ultimo_pago_alumno(nombre=nombre, apellido=apellido)

@app.post("/saludo_alerta/")
async def handle_saludo_alerta():
    return saludo_alerta()

@app.post("/get_sudo_users/")
async def handle_get_sudo_users():
    return get_sudo_users()

# Ruta raíz para verificar que FastAPI está funcionando
@app.get("/")
async def read_root():
    status = "con Google ADK" if google_adk_available and root_agent else "sin Google ADK"
    return {"message": f"FastAPI running with agent tools exposed as endpoints ({status})"}

# Endpoint de salud para Railway
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "google_adk_available": google_adk_available,
        "agent_initialized": root_agent is not None
    }