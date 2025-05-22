from fastapi import FastAPI
from typing import Dict, Any, List

# Importamos nuestras funciones del agente (la ruta relativa cambia)
from .agent import (
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

# Opcional: Ruta raíz simple para verificar que FastAPI está funcionando
@app.get("/")
async def read_root():
    return {"message": "FastAPI running with agent tools exposed as endpoints"} 