from fastapi import FastAPI
from google.adk.agents import Agent

# Importamos nuestro agente (la ruta relativa cambia)
from .agent import GymManagementAgent

# Creamos una instancia de FastAPI
app = FastAPI()

# Creamos una instancia de nuestro agente
gym_agent = GymManagementAgent()

# Exponemos el agente a través de la aplicación FastAPI
# El ADK Agent se monta como una sub-aplicación ASGI
# La ruta base '/agent' es la convención por defecto para el ADK Agent API Server
app.mount("/", gym_agent)

# Opcional: Ruta raíz simple para verificar que FastAPI está funcionando
@app.get("/")
async def read_root():
    return {"message": "FastAPI running with GymManagementAgent mounted at /"} 