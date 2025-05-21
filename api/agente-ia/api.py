from fastapi import FastAPI
# Eliminamos las importaciones y lógica del agente temporalmente
# from google.adk.agents import Agent
# from .agent.agent import GymManagementAgent

# Creamos una instancia de FastAPI - Esto es lo mínimo que Vercel debería reconocer
app = FastAPI()

# Ruta de prueba simple
@app.get("/test")
async def read_test():
    return {"message": "FastAPI test endpoint working"}

# Eliminamos el montaje del agente temporalmente
# app.mount("/", gym_agent)

# Eliminamos la ruta raíz temporalmente
# @app.get("/")
# async def read_root():
#     return {"message": "FastAPI running with GymManagementAgent mounted at /"} 