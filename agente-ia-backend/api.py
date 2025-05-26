from fastapi import FastAPI

# Creamos una instancia de FastAPI - Esto es lo mínimo que Railway debería reconocer
app = FastAPI()

# Ruta de prueba simple
@app.get("/test")
async def read_test():
    return {"message": "FastAPI test endpoint working"}