from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.game_state import questions_db
from app.models.question import Question
import uvicorn
import json
import os
# Importación de rutas (las crearemos en el siguiente paso)
from app.routes import session, questions, board

app = FastAPI(
    title="Serpientes & Escaleras MVP",
    description="Backend educativo para gamificación en el aula",
    version="0.1.0"
)

@app.on_event("startup")
async def load_data():
    path = "app/data/questions.json"
    if os.path.exists(path):
        with open(path, "r") as f:
            data = json.load(f)
            questions_db.extend([Question(**q) for q in data])
        print(f"✅ Cargadas {len(questions_db)} preguntas.")
# Configuración de CORS: Permite que el frontend se comunique con el backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción podrías restringirlo a tu dominio de Render
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de Routers
app.include_router(session.router, prefix="/api/session", tags=["Session"])
app.include_router(questions.router, prefix="/api/questions", tags=["Questions"])
app.include_router(board.router, prefix="/api/board", tags=["Board"])

# Montaje de archivos estáticos (HTML, CSS, JS)
# IMPORTANTE: Esto sirve el index.html en la raíz del servidor
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    """Redirección simple o mensaje de bienvenida al API"""
    return {"message": "Bienvenido al API de Serpientes & Escaleras. Ve a /static/index.html para jugar."}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)