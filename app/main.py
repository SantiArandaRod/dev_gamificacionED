from contextlib import asynccontextmanager
from pathlib import Path
import json

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.game_state import questions_db
from app.models.question import Question
from app.routes import avatar, board, questions, session

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
QUESTIONS_PATH = BASE_DIR / "data" / "questions.json"
STATIC_DIR = PROJECT_DIR / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    if QUESTIONS_PATH.exists():
        with QUESTIONS_PATH.open("r", encoding="utf-8") as f:
            data = json.load(f)
            questions_db.clear()
            questions_db.extend([Question(**q) for q in data])
        print(f"Cargadas {len(questions_db)} preguntas.")
    yield


app = FastAPI(
    title="Serpientes & Escaleras MVP",
    description="Backend educativo para gamificacion en el aula",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session.router, prefix="/api", tags=["Session"])
app.include_router(questions.router, prefix="/api", tags=["Questions"])
app.include_router(board.router, prefix="/api/board", tags=["Board"])
app.include_router(avatar.router, prefix="/avatar", tags=["Avatar"])

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
async def root():
    return {
        "message": "Bienvenido al API de Serpientes & Escaleras. Ve a /static/index.html para jugar."
    }


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
