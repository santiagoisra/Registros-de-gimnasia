import json
import os
import uuid
from google.adk.agents import Agent
from typing import Dict, Any, List, Optional

# Rutas a los archivos JSON de datos (relativas a este archivo)
BASE_DATA_PATH = os.path.join(os.path.dirname(__file__), 'data')
ALUMNOS_PATH = os.path.join(BASE_DATA_PATH, 'alumnos.json')
PAGOS_PATH = os.path.join(BASE_DATA_PATH, 'pagos.json')
NOTAS_PATH = os.path.join(BASE_DATA_PATH, 'notas.json')
ASISTENCIAS_PATH = os.path.join(BASE_DATA_PATH, 'asistencias.json') # Asegurarse de crear este archivo
SUDO_USERS_PATH = os.path.join(os.path.dirname(__file__), '..', 'sudo-users.json') # Corregido para apuntar a la raíz

# --- Helpers para leer y escribir JSON ---

def read_json_file(filepath: str) -> List[Dict[str, Any]]:
    """Lee datos de un archivo JSON."""
    if not os.path.exists(filepath):
        return []
    with open(filepath, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return [] # Retorna lista vacía si el JSON está vacío o mal formado

def write_json_file(filepath: str, data: List[Dict[str, Any]]):
    """Escribe datos a un archivo JSON."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# --- Funciones del agente (Tools) --- 

# Helper para obtener usuarios SUDO
def get_sudo_users() -> List[Dict[str, Any]]:
    """Obtiene la lista de usuarios SUDO desde el archivo JSON."""
    # Corregir la ruta para apuntar a la raíz del proyecto
    sudo_path_corrected = os.path.join(os.path.dirname(__file__), '..', '..', 'sudo-users.json')
    print(f"Intentando leer usuarios SUDO desde: {sudo_path_corrected}") # Log para depuración
    return read_json_file(sudo_path_corrected)

# Ejemplo: Función de alerta al saludar
def saludo_alerta() -> Dict[str, str]:
    """Genera una alerta básica al saludar."""
    # En una implementación real, aquí se chequearían condiciones para generar alertas reales
    print("Ejecutando tool: saludo_alerta")
    return {
        "status": "success",
        "alerta": "¡Hola! Aquí hay algunas alertas pendientes: 3 personas no asistieron recientemente y una debe el pago del mes.",
        "mensaje": "¿En qué puedo ayudarte hoy?"
    }

# Funciones CRUD para Alumnos

def crud_alumnos(action: str, data: dict = {}) -> Dict[str, Any]:
    """Realiza operaciones CRUD en los datos de alumnos."""
    print(f"Ejecutando tool: crud_alumnos con acción {action} y data {data}")
    alumnos = read_json_file(ALUMNOS_PATH)
    result = {
        "status": "error",
        "message": "Acción no reconocida o faltan datos.",
        "data": None
    }

    if action == 'create' and data:
        data['id'] = str(uuid.uuid4()) # Generar ID único
        alumnos.append(data)
        write_json_file(ALUMNOS_PATH, alumnos)
        result['status'] = 'success'
        result['message'] = 'Alumno creado con éxito.'
        result['data'] = data
    elif action == 'read' and data and data.get('id'):
        alumno = next((a for a in alumnos if a['id'] == data['id']), None)
        if alumno:
            result['status'] = 'success'
            result['message'] = 'Alumno encontrado.'
            result['data'] = alumno
        else:
            result['message'] = 'Alumno no encontrado.'
    elif action == 'read' and data and data.get('nombre') and data.get('apellido'):
        # Buscar por nombre y apellido
         alumno = next((a for a in alumnos if a['nombre'].lower() == data['nombre'].lower() and a['apellido'].lower() == data['apellido'].lower()), None)
         if alumno:
            result['status'] = 'success'
            result['message'] = 'Alumno encontrado por nombre.'
            result['data'] = alumno
         else:
            result['message'] = 'Alumno no encontrado por nombre.'
    elif action == 'read': # Leer todos
        result['status'] = 'success'
        result['message'] = 'Listado de alumnos.'
        result['data'] = alumnos
    elif action == 'update' and data and data.get('id'):
        alumno_index = next((i for i, a in enumerate(alumnos) if a['id'] == data['id']), -1)
        if alumno_index != -1:
            alumnos[alumno_index].update(data) # Actualizar campos
            write_json_file(ALUMNOS_PATH, alumnos)
            result['status'] = 'success'
            result['message'] = 'Alumno actualizado con éxito.'
            result['data'] = alumnos[alumno_index]
        else:
            result['message'] = 'Alumno a actualizar no encontrado.'
    elif action == 'delete' and data and data.get('id'):
        original_count = len(alumnos)
        alumnos = [a for a in alumnos if a['id'] != data['id']]
        if len(alumnos) < original_count:
            write_json_file(ALUMNOS_PATH, alumnos)
            result['status'] = 'success'
            result['message'] = 'Alumno eliminado con éxito.'
        else:
            result['message'] = 'Alumno a eliminar no encontrado.'
    
    return result

# Funciones CRUD para Pagos
def crud_pagos(action: str, data: dict = {}) -> Dict[str, Any]:
    """Realiza operaciones CRUD en los datos de pagos."""
    print(f"Ejecutando tool: crud_pagos con acción {action} y data {data}")
    pagos = read_json_file(PAGOS_PATH)
    result = {
        "status": "error",
        "message": "Acción no reconocida o faltan datos.",
        "data": None
    }

    if action == 'create' and data:
        data['id'] = str(uuid.uuid4()) # Generar ID único
        pagos.append(data)
        write_json_file(PAGOS_PATH, pagos)
        result['status'] = 'success'
        result['message'] = 'Pago registrado con éxito.'
        result['data'] = data
    elif action == 'read' and data and data.get('id'):
        pago = next((p for p in pagos if p['id'] == data['id']), None)
        if pago:
            result['status'] = 'success'
            result['message'] = 'Pago encontrado.'
            result['data'] = pago
        else:
            result['message'] = 'Pago no encontrado.'
    elif action == 'read' and data and data.get('alumno_id'): # Buscar pagos de un alumno
         pagos_alumno = [p for p in pagos if p['alumno_id'] == data['alumno_id']]
         result['status'] = 'success'
         result['message'] = f'Pagos encontrados para el alumno {data["alumno_id"]}.'
         result['data'] = pagos_alumno
    elif action == 'read': # Leer todos
        result['status'] = 'success'
        result['message'] = 'Listado de pagos.'
        result['data'] = pagos
    elif action == 'update' and data and data.get('id'):
        pago_index = next((i for i, p in enumerate(pagos) if p['id'] == data['id']), -1)
        if pago_index != -1:
            pagos[pago_index].update(data) # Actualizar campos
            write_json_file(PAGOS_PATH, pagos)
            result['status'] = 'success'
            result['message'] = 'Pago actualizado con éxito.'
            result['data'] = pagos[pago_index]
        else:
            result['message'] = 'Pago a actualizar no encontrado.'
    elif action == 'delete' and data and data.get('id'):
        original_count = len(pagos)
        pagos = [p for p in pagos if p['id'] != data['id']]
        if len(pagos) < original_count:
            write_json_file(PAGOS_PATH, pagos)
            result['status'] = 'success'
            result['message'] = 'Pago eliminado con éxito.'
        else:
            result['message'] = 'Pago a eliminar no encontrado.'
            
    return result

# Funciones CRUD para Notas
def crud_notas(action: str, data: dict = {}) -> Dict[str, Any]:
    """Realiza operaciones CRUD en los datos de notas."""
    print(f"Ejecutando tool: crud_notas con acción {action} y data {data}")
    notas = read_json_file(NOTAS_PATH)
    result = {
        "status": "error",
        "message": "Acción no reconocida o faltan datos.",
        "data": None
    }

    if action == 'create' and data:
        data['id'] = str(uuid.uuid4()) # Generar ID único
        notas.append(data)
        write_json_file(NOTAS_PATH, notas)
        result['status'] = 'success'
        result['message'] = 'Nota registrada con éxito.'
        result['data'] = data
    elif action == 'read' and data and data.get('id'):
        nota = next((n for n in notas if n['id'] == data['id']), None)
        if nota:
            result['status'] = 'success'
            result['message'] = 'Nota encontrada.'
            result['data'] = nota
        else:
            result['message'] = 'Nota no encontrada.'
    elif action == 'read' and data and data.get('alumno_id'): # Buscar notas de un alumno
         notas_alumno = [n for n in notas if n['alumno_id'] == data['alumno_id']]
         result['status'] = 'success'
         result['message'] = f'Notas encontradas para el alumno {data["alumno_id"]}.'
         result['data'] = notas_alumno
    elif action == 'read': # Leer todos
        result['status'] = 'success'
        result['message'] = 'Listado de notas.'
        result['data'] = notas
    elif action == 'update' and data and data.get('id'):
        nota_index = next((i for i, n in enumerate(notas) if n['id'] == data['id']), -1)
        if nota_index != -1:
            notas[nota_index].update(data) # Actualizar campos
            write_json_file(NOTAS_PATH, notas)
            result['status'] = 'success'
            result['message'] = 'Nota actualizada con éxito.'
            result['data'] = notas[nota_index]
        else:
            result['message'] = 'Nota a actualizar no encontrado.'
    elif action == 'delete' and data and data.get('id'):
        original_count = len(notas)
        notas = [n for n in notas if n['id'] != data['id']]
        if len(notas) < original_count:
            write_json_file(NOTAS_PATH, notas)
            result['status'] = 'success'
            result['message'] = 'Nota eliminada con éxito.'
        else:
            result['message'] = 'Nota a eliminar no encontrado.'
            
    return result

# Funciones CRUD para Asistencias
def crud_asistencias(action: str, data: dict = {}) -> Dict[str, Any]:
    """Realiza operaciones CRUD en los datos de asistencias."""
    print(f"Ejecutando tool: crud_asistencias con acción {action} y data {data}")
    asistencias = read_json_file(ASISTENCIAS_PATH)
    result = {
        "status": "error",
        "message": "Acción no reconocida o faltan datos.",
        "data": None
    }

    if action == 'create' and data:
        data['id'] = str(uuid.uuid4()) # Generar ID único
        asistencias.append(data)
        write_json_file(ASISTENCIAS_PATH, asistencias)
        result['status'] = 'success'
        result['message'] = 'Asistencia registrada con éxito.'
        result['data'] = data
    elif action == 'read' and data and data.get('id'):
        asistencia = next((a for a in asistencias if a['id'] == data['id']), None)
        if asistencia:
            result['status'] = 'success'
            result['message'] = 'Asistencia encontrada.'
            result['data'] = asistencia
        else:
            result['message'] = 'Asistencia no encontrada.'
    elif action == 'read' and data and data.get('alumno_id'): # Buscar asistencias de un alumno
         asistencias_alumno = [a for a in asistencias if a['alumno_id'] == data['alumno_id']]
         result['status'] = 'success'
         result['message'] = f'Asistencias encontradas para el alumno {data["alumno_id"]}.'
         result['data'] = asistencias_alumno
    elif action == 'read': # Leer todos
        result['status'] = 'success'
        result['message'] = 'Listado de asistencias.'
        result['data'] = asistencias
    elif action == 'update' and data and data.get('id'):
        asistencia_index = next((i for i, a in enumerate(asistencias) if a['id'] == data['id']), -1)
        if asistencia_index != -1:
            asistencias[asistencia_index].update(data) # Actualizar campos
            write_json_file(ASISTENCIAS_PATH, asistencias)
            result['status'] = 'success'
            result['message'] = 'Asistencia actualizada con éxito.'
            result['data'] = asistencias[asistencia_index]
        else:
            result['message'] = 'Asistencia a actualizar no encontrada.'
    elif action == 'delete' and data and data.get('id'):
        original_count = len(asistencias)
        asistencias = [a for a in asistencias if a['id'] != data['id']]
        if len(asistencias) < original_count:
            write_json_file(ASISTENCIAS_PATH, asistencias)
            result['status'] = 'success'
            result['message'] = 'Asistencia eliminada con éxito.'
        else:
            result['message'] = 'Asistencia a eliminar no encontrada.'
            
    return result

# Función para resumen
def resumen_alumno(alumno_id: str) -> Dict[str, Any]:
    """Genera un resumen de pagos, notas y asistencias para un alumno."""
    print(f"Ejecutando tool: resumen_alumno para alumno {alumno_id}")

    # Obtener datos del alumno
    alumnos = read_json_file(ALUMNOS_PATH)
    alumno = next((a for a in alumnos if a['id'] == alumno_id), None)
    if not alumno:
        return {
            "status": "error",
            "message": "Alumno no encontrado para el resumen.",
            "resumen": None
        }

    # Obtener pagos, notas y asistencias del alumno
    pagos_alumno = crud_pagos(action='read', data={'alumno_id': alumno_id})['data']
    notas_alumno = crud_notas(action='read', data={'alumno_id': alumno_id})['data']
    asistencias_alumno = crud_asistencias(action='read', data={'alumno_id': alumno_id})['data']

    # Construir la sección de Pagos del resumen
    pagos_resumen = f'No hay registros de pagos para {alumno.get("nombre", "")} {alumno.get("apellido", "")}.' if not pagos_alumno else '\n'.join([f'- Fecha: {p.get("fecha_pago", "")}, Monto: ${p.get("monto", "")}, Estado: {p.get("estado", "")}' for p in pagos_alumno])

    # Construir la sección de Notas del resumen
    notas_resumen = f'No hay notas para {alumno.get("nombre", "")} {alumno.get("apellido", "")}.' if not notas_alumno else '\n'.join([f'- Fecha: {n.get("fecha", "")}: {n.get("contenido", "")}' for n in notas_alumno])

    # Construir la sección de Asistencias del resumen
    asistencias_resumen = f'No hay registros de asistencias para {alumno.get("nombre", "")} {alumno.get("apellido", "")}.' if not asistencias_alumno else '\n'.join([f'- Fecha: {a.get("fecha", "")}, Sede: {a.get("sede", "")}' for a in asistencias_alumno])

    # Unir todas las secciones en el texto final del resumen
    resumen_texto = f"""Resumen para {alumno.get("nombre", "")} {alumno.get("apellido", "")}:

Pagos:
{pagos_resumen}

Notas:
{notas_resumen}

Asistencias:
{asistencias_resumen}
"""
    return {
        "status": "success",
        "resumen": resumen_texto
    }

# Definición del Agente principal
root_agent = Agent(
    name="gimnasia_agent", # Nombre del agente
    model="gemini-1.5-flash-latest", # Modelo a usar (asegúrate de que tu clave API lo soporte)
    description="Agente para gestionar registros de gimnasia (alumnos, pagos, notas, asistencias).",
    instruction="""Eres un agente amable y servicial para gestionar un gimnasio. 
Puedes ayudar con las siguientes tareas: 
- Realizar operaciones CRUD sobre alumnos, pagos, notas y asistencias. 
- Proveer resúmenes de la actividad de un alumno. 
- Dar alertas importantes al saludar. 
Responde a las preguntas del usuario utilizando las herramientas disponibles. 
Siempre sé cortés y conciso en tus respuestas, a menos que se solicite un resumen detallado.""",
    tools=[get_sudo_users, saludo_alerta, crud_alumnos, crud_pagos, crud_notas, crud_asistencias, resumen_alumno], # Lista de herramientas disponibles para el agente
)

# NOTA: La definición de root_agent DEBE estar en este archivo y ser accesible. 