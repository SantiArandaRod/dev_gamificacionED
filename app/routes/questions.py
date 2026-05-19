from fastapi import APIRouter, HTTPException, Query
from app.game_state import questions_db
from app.services import game_service
from typing import Optional

router = APIRouter()

@router.get("/")
async def get_questions(cut: Optional[int] = Query(None, ge=1, le=3)):
    """
    Devuelve preguntas filtradas por corte académico (1, 2 o 3).
    Si no se envía corte, devuelve todas.
    """
    if cut:
        filtered = [q for q in questions_db if q.academic_cut == cut]
        return filtered
    return questions_db


@router.get("/session/{session_id}/next")
async def get_next_session_question(
    session_id: str,
    cut: int = Query(1, ge=1, le=3),
):
    try:
        return game_service.get_next_question(session_id, cut, questions_db)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{question_id}")
async def get_single_question(question_id: str):
    """Busca una pregunta específica por ID"""
    for q in questions_db:
        if str(q.question_id) == question_id:
            return q
    return {"error": "Pregunta no encontrada"}
