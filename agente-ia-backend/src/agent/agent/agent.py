import json
import os
import uuid
# from google.adk.agents import Agent  # Eliminado porque no existe y rompe el deploy
from typing import Dict, Any, List, Optional, Union
from fastapi import FastAPI, Request

# Rutas a los archivos JSON de datos (relativas a este archivo)
BASE_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
ALUMNOS_PATH = os.path.join(BASE_DATA_PATH, 'alumnos.json')
PAGOS_PATH = os.path.join(BASE_DATA_PATH, 'pagos.json')
NOTAS_PATH = os.path.join(BASE_DATA_PATH, 'notas.json')
ASISTENCIAS_PATH = os.path.join(BASE_DATA_PATH, 'asistencias.json') # Asegurarse de crear este archivo
SUDO_USERS_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'sudo-users.json') # Corregido para apuntar a la raíz

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

# Nueva función para listar solo nombres de alumnos
def listar_nombres_alumnos() -> Dict[str, Any]:
    """Obtiene y lista solo los nombres completos de todos los alumnos."""
    print("Ejecutando tool: listar_nombres_alumnos")
    alumnos = read_json_file(ALUMNOS_PATH)
    if not alumnos:
        return {
            "status": "success",
            "message": "No hay alumnos registrados.",
            "nombres": []
        }

    # Extraer nombres completos
    nombres_completos = [f"{a.get('nombre', '')} {a.get('apellido', '')}".strip() for a in alumnos]

    return {
        "status": "success",
        "message": f"Listado de {len(nombres_completos)} nombres de alumnos.",
        "nombres": nombres_completos
    }

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

def crud_alumnos(action: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Realiza operaciones CRUD en los datos de alumnos.

    Puede 'create', 'read', 'update', o 'delete' alumnos.
    Para 'create', se requiere data con 'nombre' y 'apellido'. Genera un ID automáticamente.
    Para 'read', se puede buscar por 'id' o por 'nombre' y 'apellido'. Si no se especifica nada, lee todos los alumnos.
    Para 'update', se requiere data con el 'id' del alumno y los campos a actualizar.
    Para 'delete', se requiere data con el 'id' del alumno a eliminar.

    Ejemplo de uso por el agente:
    - Para crear un alumno: llamar con action='create', data={'nombre': 'Nuevo', 'apellido': 'Alumno'}
    - Para leer por nombre: llamar con action='read', data={'nombre': 'Juan', 'apellido': 'Perez'}
    - Para leer todos: llamar con action='read', data={}
    - Para obtener ID: llamar con action='read', data={'nombre': 'Nombre', 'apellido': 'Apellido'}
    """
    print(f"Ejecutando tool: crud_alumnos con acción {action} y data {data}")
    alumnos = read_json_file(ALUMNOS_PATH)
    result = {
        "status": "error",
        "message": "Acción no reconocida o faltan datos.",
        "data": None
    }

    if action == 'create' and isinstance(data, dict):
        if not data or 'nombre' not in data or 'apellido' not in data:
             result['message'] = 'Faltan nombre o apellido para crear el alumno.'
             return result
        data['id'] = str(uuid.uuid4()) # Generar ID único
        alumnos.append(data)
        write_json_file(ALUMNOS_PATH, alumnos)
        result['status'] = 'success'
        result['message'] = 'Alumno creado con éxito.'
        result['data'] = data
    elif action == 'read' and isinstance(data, dict) and data.get('id'):
        alumno = next((a for a in alumnos if a['id'] == data['id']), None)
        if alumno:
            result['status'] = 'success'
            result['message'] = 'Alumno encontrado.'
            result['data'] = alumno
        else:
            result['message'] = 'Alumno no encontrado.'
    elif action == 'read' and isinstance(data, dict) and data.get('nombre') and data.get('apellido'):
        # Buscar por nombre y apellido
         alumno = next((a for a in alumnos if a['nombre'].lower() == data['nombre'].lower() and a['apellido'].lower() == data['apellido'].lower()), None)
         if alumno:
            result['status'] = 'success'
            result['message'] = 'Alumno encontrado por nombre.'
            result['data'] = alumno
         else:
            result['message'] = 'Alumno no encontrado por nombre.'
    elif action == 'read' and (data is None or (isinstance(data, dict) and not data)): # Leer todos si data es None o diccionario vacío
        result['status'] = 'success'
        result['message'] = 'Listado de alumnos.'
        result['data'] = alumnos
    elif action == 'update' and isinstance(data, dict) and data.get('id'):
        alumno_index = next((i for i, a in enumerate(alumnos) if a['id'] == data['id']), -1)
        if alumno_index != -1:
            alumnos[alumno_index].update(data) # Actualizar campos
            write_json_file(ALUMNOS_PATH, alumnos)
            result['status'] = 'success'
            result['message'] = 'Alumno actualizado con éxito.'
            result['data'] = alumnos[alumno_index]
        else:
            result['message'] = 'Alumno a actualizar no encontrado.'
    elif action == 'delete' and isinstance(data, dict) and data.get('id'):
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
def crud_pagos(action: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Realiza operaciones CRUD sobre los datos de pagos.

    Puede 'create', 'read', 'update', o 'delete' pagos.
    Para 'create', se requiere data con 'alumno_id', 'fecha', y 'monto'. Genera un ID para el pago.
    Para 'read', se puede buscar por 'id' del pago o por 'alumno_id' para obtener todos los pagos de un alumno.
    Para 'update', se requiere data con el 'id' del pago y campos a actualizar ('fecha', 'monto', etc.).
    Para 'delete', se requiere data con el 'id' del pago.

    **Importante: Las operaciones de pago requieren el 'alumno_id'. Si el usuario proporciona solo el nombre del alumno, primero usa `crud_alumnos` con action='read' y el nombre/apellido para obtener el `alumno_id`**. Luego, utiliza ese `alumno_id` en la herramienta de pagos correspondiente (`crud_pagos` o `ultimo_pago_alumno`).

    Ejemplo de uso por el agente:
    - Para crear un pago: llamar con action='create', data={'alumno_id': '...', 'fecha': 'YYYY-MM-DD', 'monto': 123}
    - Para leer pagos de un alumno: llamar con action='read', data={'alumno_id': '...'}
    - Para leer un pago específico: llamar con action='read', data={'id': '...'}
    """
    pagos = read_json_file(PAGOS_PATH)

    if action == 'create' and isinstance(data, dict):
        if not data or 'alumno_id' not in data or 'fecha' not in data or 'monto' not in data:
            return {"status": "error", "message": "Faltan datos requeridos ('alumno_id', 'fecha', 'monto') para crear el pago.", "data": None}
        new_pago = {
            'id': str(uuid.uuid4()),
            'alumno_id': data['alumno_id'],
            'fecha': data['fecha'],
            'monto': data['monto']
        }
        pagos.append(new_pago)
        write_json_file(PAGOS_PATH, pagos)
        return {"status": "success", "message": "Pago creado.", "data": new_pago}

    elif action == 'read':
        if isinstance(data, dict) and data.get('id'): # Leer un pago específico por ID
            pago_encontrado = next((p for p in pagos if isinstance(p, dict) and p.get('id') == data['id']), None)
            if pago_encontrado:
                return {"status": "success", "message": "Pago encontrado.", "data": pago_encontrado}
            else:
                return {"status": "error", "message": "Pago no encontrado.", "data": None}
        elif data is None or (isinstance(data, dict) and 'alumno_id' not in data):
             return {"status": "success", "message": "Lista de todos los pagos.", "data": pagos}
        elif isinstance(data, dict) and data.get('alumno_id'): # Leer todos los pagos de un alumno por alumno_id
            alumno_id_a_buscar = data['alumno_id']
            # Modificación: Asegurar que 'alumno_id' existe antes de comparar
            pagos_alumno = [p for p in pagos if isinstance(p, dict) and 'alumno_id' in p and p['alumno_id'] == alumno_id_a_buscar]
            # Opcional: ordenar por fecha si existe el campo 'fecha' y es comparable
            try:
                # Aseguramos que 'fecha' existe antes de intentar acceder a ella para ordenar
                # Usamos .get() de forma segura y proporcionamos un valor por defecto que funcione con comparación
                pagos_alumno_ordenados = sorted(pagos_alumno, key=lambda p: p.get('fecha', '0000-00-00'), reverse=True) # Ordenar descendente para último pago
                # Devolvemos la lista completa de pagos encontrados para el alumno, ordenada
                return {"status": "success", "message": f"Pagos encontrados para el alumno {alumno_id_a_buscar}.", "data": pagos_alumno_ordenados}
            except TypeError:
                 # Si las fechas no son comparables o faltan, devolvemos sin ordenar pero con advertencia
                 print(f"Advertencia: No se pudieron ordenar los pagos por fecha para el alumno {alumno_id_a_buscar}. Datos devueltos sin ordenar.")
                 return {"status": "success", "message": f"Pagos encontrados para el alumno {alumno_id_a_buscar} (sin ordenar por fecha).", "data": pagos_alumno}
        else:
             return {"status": "error", "message": "Datos de lectura de pagos inválidos.", "data": None}

    elif action == 'update':
        if not data or 'id' not in data:
            return {"status": "error", "message": "Se requiere el ID del pago para actualizar.", "data": None}
        pago_id = data['id']
        pago_encontrado = next((p for p in pagos if isinstance(p, dict) and p.get('id') == pago_id), None)
        if not pago_encontrado:
            return {"status": "error", "message": "Pago no encontrado para actualizar.", "data": None}

        # Actualizar campos permitidos (ej: fecha, monto)
        if 'fecha' in data: pago_encontrado['fecha'] = data['fecha']
        if 'monto' in data: pago_encontrado['monto'] = data['monto']
        # No permitir actualizar 'id' o 'alumno_id' directamente con esta acción

        write_json_file(PAGOS_PATH, pagos)
        return {"status": "success", "message": "Pago actualizado.", "data": pago_encontrado}

    elif action == 'delete':
        if not data or 'id' not in data:
            return {"status": "error", "message": "Se requiere el ID del pago para eliminar.", "data": None}
        pago_id = data['id']
        pagos_actualizados = [p for p in pagos if isinstance(p, dict) and p.get('id') != pago_id]
        if len(pagos_actualizados) == len(pagos):
            return {"status": "error", "message": "Pago no encontrado para eliminar.", "data": None}
        write_json_file(PAGOS_PATH, pagos_actualizados)
        return {"status": "success", "message": "Pago eliminado.", "data": {"id": pago_id}}

    else:
        return {"status": "error", "message": "Acción no reconocida para pagos.", "data": None}

# Funciones CRUD para Notas
def crud_notas(action: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Realiza operaciones CRUD en los datos de notas."""
    print(f"Ejecutando tool: crud_notas con acción {action} y data {data}")
    notas = read_json_file(NOTAS_PATH)
    result = {
        "status": "error",
        "message": "Acción no reconocida o faltan datos.",
        "data": None
    }

    if action == 'create' and isinstance(data, dict):
        if not data or 'alumno_id' not in data or 'fecha' not in data or 'contenido' not in data:
             result['message'] = "Faltan datos requeridos ('alumno_id', 'fecha', 'contenido') para crear la nota."
             return result
        data['id'] = str(uuid.uuid4()) # Generar ID único
        notas.append(data)
        write_json_file(NOTAS_PATH, notas)
        result['status'] = 'success';
        result['message'] = 'Nota creada con éxito.';
        result['data'] = data
    elif action == 'read' and isinstance(data, dict) and data.get('id'):
        nota = next((n for n in notas if isinstance(n, dict) and n.get('id') == data['id']), None)
        if nota:
            result['status'] = 'success';
            result['message'] = 'Nota encontrada.';
            result['data'] = nota
        else:
            result['message'] = 'Nota no encontrada.';
    elif action == 'read' and isinstance(data, dict) and data.get('alumno_id'):
        alumno_id_a_buscar = data['alumno_id']
        notas_alumno = [n for n in notas if isinstance(n, dict) and 'alumno_id' in n and n['alumno_id'] == alumno_id_a_buscar]
        result['status'] = 'success';
        result['message'] = f'Notas encontradas para el alumno {alumno_id_a_buscar}.';
        result['data'] = notas_alumno
    elif action == 'read' and (data is None or (isinstance(data, dict) and not data)): # Leer todas si data es None o diccionario vacío
        result['status'] = 'success';
        result['message'] = 'Lista de todas las notas.';
        result['data'] = notas
    elif action == 'update' and isinstance(data, dict) and data.get('id'):
        nota_id = data['id']
        nota_encontrada = next((n for n in notas if isinstance(n, dict) and n.get('id') == nota_id), None)
        if not nota_encontrada:
            result['message'] = 'Nota no encontrada para actualizar.';
            return result
        if 'fecha' in data: nota_encontrada['fecha'] = data['fecha']
        if 'contenido' in data: nota_encontrada['contenido'] = data['contenido']
        write_json_file(NOTAS_PATH, notas)
        result['status'] = 'success';
        result['message'] = 'Nota actualizada con éxito.';
        result['data'] = nota_encontrada
    elif action == 'delete' and isinstance(data, dict) and data.get('id'):
        nota_id = data['id']
        original_count = len(notas)
        notas_actualizadas = [n for n in notas if isinstance(n, dict) and n.get('id') != nota_id]
        if len(notas_actualizadas) == original_count:
            result['message'] = 'Nota no encontrada para eliminar.';
            return result
        write_json_file(NOTAS_PATH, notas_actualizadas)
        result['status'] = 'success';
        result['message'] = 'Nota eliminada con éxito.';
        result['data'] = {'id': nota_id}
    else:
        result['message'] = 'Acción no reconocida para notas.';
    return result

# Funciones CRUD para Asistencias
def crud_asistencias(action: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Realiza operaciones CRUD en los datos de asistencias."""
    print(f"Ejecutando tool: crud_asistencias con acción {action} y data {data}")
    asistencias = read_json_file(ASISTENCIAS_PATH)
    result = {
        "status": "error",
        "message": "Acción no reconocida o faltan datos.",
        "data": None
    }

    if action == 'create' and isinstance(data, dict):
         if not data or 'alumno_id' not in data or 'fecha' not in data or 'estado' not in data:
             result['message'] = "Faltan datos requeridos ('alumno_id', 'fecha', 'estado') para registrar la asistencia."
             return result
         data['id'] = str(uuid.uuid4())
         asistencias.append(data)
         write_json_file(ASISTENCIAS_PATH, asistencias)
         result['status'] = 'success';
         result['message'] = 'Asistencia registrada con éxito.';
         result['data'] = data
    elif action == 'read' and isinstance(data, dict) and data.get('id'):
        asistencia = next((a for a in asistencias if isinstance(a, dict) and a.get('id') == data['id']), None)
        if asistencia:
            result['status'] = 'success';
            result['message'] = 'Asistencia encontrada.';
            result['data'] = asistencia
        else:
            result['message'] = 'Asistencia no encontrada.';
    elif action == 'read' and isinstance(data, dict) and data.get('alumno_id'):
        alumno_id_a_buscar = data['alumno_id']
        asistencias_alumno = [a for a in asistencias if isinstance(a, dict) and 'alumno_id' in a and a['alumno_id'] == alumno_id_a_buscar]
        result['status'] = 'success';
        result['message'] = f'Asistencias encontradas para el alumno {alumno_id_a_buscar}.';
        result['data'] = asistencias_alumno
    elif action == 'read' and (data is None or (isinstance(data, dict) and not data)): # Leer todas si data es None o diccionario vacío
        result['status'] = 'success';
        result['message'] = 'Lista de todas las asistencias.';
        result['data'] = asistencias
    elif action == 'update' and isinstance(data, dict) and data.get('id'):
        asistencia_id = data['id']
        asistencia_encontrada = next((a for a in asistencias if isinstance(a, dict) and a.get('id') == asistencia_id), None)
        if not asistencia_encontrada:
            result['message'] = 'Asistencia no encontrada para actualizar.';
            return result
        if 'fecha' in data: asistencia_encontrada['fecha'] = data['fecha']
        if 'estado' in data: asistencia_encontrada['estado'] = data['estado']
        write_json_file(ASISTENCIAS_PATH, asistencias)
        result['status'] = 'success';
        result['message'] = 'Asistencia actualizada con éxito.';
        result['data'] = asistencia_encontrada
    elif action == 'delete' and isinstance(data, dict) and data.get('id'):
        asistencia_id = data['id']
        original_count = len(asistencias)
        asistencias_actualizadas = [a for a in asistencias if isinstance(a, dict) and a.get('id') != asistencia_id]
        if len(asistencias_actualizadas) == original_count:
            result['message'] = 'Asistencia no encontrada para eliminar.';
            return result
        write_json_file(ASISTENCIAS_PATH, asistencias_actualizadas)
        result['status'] = 'success';
        result['message'] = 'Asistencia eliminada con éxito.';
        result['data'] = {'id': asistencia_id}
    else:
        result['message'] = 'Acción no reconocida para asistencias.';
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
    pagos_resumen = f'No hay registros de pagos para {alumno.get("nombre", "")} {alumno.get("apellido", "")}.' if not pagos_alumno else '\n'.join([f'- Fecha: {p.get("fecha_pago", p.get("fecha", ""))}, Monto: ${p.get("monto", "")}, Estado: {p.get("estado", "")}' for p in pagos_alumno])

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

# Nueva función tool para encontrar el último pago de un alumno por nombre
def ultimo_pago_alumno(nombre: str, apellido: str) -> Dict[str, Any]:
    """Obtiene la información del último pago registrado para un alumno específico.

    Primero usa `crud_alumnos` para encontrar el `alumno_id` basado en el nombre y apellido.
    Luego usa `crud_pagos` para leer todos los pagos de ese `alumno_id` y encuentra el último.
    """
    print(f"Ejecutando tool: ultimo_pago_alumno para {nombre} {apellido}")

    # 1. Encontrar alumno_id usando crud_alumnos
    alumno_data_search = crud_alumnos(action='read', data={'nombre': nombre, 'apellido': apellido})
    if alumno_data_search['status'] != 'success' or not alumno_data_search['data']:
        return {"status": "error", "message": f"Alumno {nombre} {apellido} no encontrado para verificar el último pago.", "data": None}

    alumno = alumno_data_search['data']
    alumno_id = alumno.get('id')

    if not alumno_id:
         return {"status": "error", "message": f"No se pudo obtener el ID del alumno {nombre} {apellido}.", "data": None}

    # 2. Obtener todos los pagos de ese alumno_id usando crud_pagos
    # Modificación: Llamar a crud_pagos con data={'alumno_id': alumno_id}
    pagos_data_search = crud_pagos(action='read', data={'alumno_id': alumno_id})

    if pagos_data_search['status'] != 'success' or not pagos_data_search['data']:
        return {"status": "success", "message": f"No se encontraron pagos para el alumno {nombre} {apellido}.", "data": None} # Estado success pero sin datos si no hay pagos

    pagos_alumno = pagos_data_search['data']

    # 3. Encontrar el último pago (ordenado por fecha descendente en crud_pagos read by alumno_id)
    if pagos_alumno:
        ultimo_pago = pagos_alumno[0] # El primer elemento es el último pago por la modificación en crud_pagos read
        return {"status": "success", "message": f"Último pago encontrado para {nombre} {apellido}.", "data": ultimo_pago}
    else:
        return {"status": "success", "message": f"No se encontraron pagos para el alumno {nombre} {apellido}.", "data": None} # Estado success pero sin datos si no hay pagos

# --- Definición del Agente principal (comentado porque falta la clase Agent) ---
# root_agent = Agent(
#     name="gimnasia_agent", # Nombre del agente
#     model="gemini-1.5-flash-latest", # Modelo a usar (asegúrate de que tu clave API lo soporte)
#     description="Agente para gestionar registros de gimnasia (alumnos, pagos, notas, asistencias) y realizar acciones multi-paso.",
#     instruction="""Eres un agente amable y servicial para gestionar un gimnasio.
# Puedes ayudar con las siguientes tareas:
# - Realizar operaciones CRUD sobre alumnos, pagos, notas y asistencias.
# - Proveer resúmenes de la actividad de un alumno.
# - Dar alertas importantes al saludar.
# - Listar los nombres de todos los alumnos.
# - Buscar información sobre el último pago de un alumno dado su nombre completo.
# 
# **Instrucciones clave para ti (el Agente):**
# 1.  Siempre que necesites operar con pagos (crear, buscar, etc.) y el usuario solo te dé el nombre de un alumno, **tu primer paso debe ser usar la herramienta `crud_alumnos` con la acción `read` y el nombre/apellido para obtener el `alumno_id`**. Luego, utiliza ese `alumno_id` en la herramienta de pagos correspondiente (`crud_pagos` o `ultimo_pago_alumno`).
# 2.  Si el usuario te da instrucciones que implican múltiples pasos (como crear un alumno Y registrar un pago en el mismo mensaje), intenta ejecutar los pasos en secuencia utilizando las herramientas adecuadas.
# 3.  Presta atención a las conversaciones anteriores para mantener el contexto, especialmente para instrucciones de seguimiento o preguntas sobre entidades mencionadas previamente.
# 
# Utiliza las herramientas disponibles para responder a las preguntas y ejecutar las solicitudes del usuario. Siempre sé cortés y conciso en tus respuestas, a menos que se solicite un resumen detallado.
# """,
#     tools=[get_sudo_users, saludo_alerta, crud_alumnos, crud_pagos, crud_notas, crud_asistencias, resumen_alumno, listar_nombres_alumnos, ultimo_pago_alumno],
# )
# 
# # NOTA: La definición de root_agent DEBE estar en este archivo y ser accesible. 

# Intentar importar Google ADK, si falla, dejar comentario para instalar manualmente
try:
    from google.adk.agents import Agent
except ImportError:
    Agent = None  # Para evitar errores de importación si no está instalado

# Leer la API key y config de Gemini desde el entorno
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
GOOGLE_GENAI_USE_VERTEXAI = os.environ.get("GOOGLE_GENAI_USE_VERTEXAI", "FALSE")

# Definir el agente principal solo si la librería está disponible
if Agent:
    root_agent = Agent(
        name="gimnasia_agent",
        model="gemini-1.5-flash-latest",  # Cambiar si querés otro modelo
        description="Agente para gestionar registros de gimnasia y responder consultas.",
        instruction="""Sos un agente amable y servicial para gestionar un gimnasio. Respondé consultas, resúmenes, alertas, etc.""",
        tools=[],  # Agregá tools si querés
        # Si el ADK requiere pasar la API key, hacelo acá o en la config global
    )
else:
    root_agent = None

app = FastAPI()

@app.post("/agente_ia/")
async def run_agent(request: Request):
    if not root_agent:
        return {"status": "error", "message": "Google ADK no está instalado. Instalalo con 'pip install google-adk'"}
    data = await request.json()
    response = root_agent.run(data)
    return response

@app.get("/")
async def read_root():
    return {"message": "Agente de gimnasia corriendo con Google ADK"} 