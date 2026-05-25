from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.game_state import questions_db
from app.services import game_service

router = APIRouter()

DIFFICULTY_TO_CUT: dict[str, int] = {
    "easy": 1,
    "medium": 2,
    "hard": 3,
}


class ValidateAnswerRequest(BaseModel):
    question_id: str
    answer: str


def public_question(question) -> dict:
    return {
        "question_id": question.question_id,
        "text": question.text,
        "options": question.options,
        "academic_cut": question.academic_cut,
        "subject": question.subject,
        "difficulty": question.difficulty,
    }


def find_question(question_id: str):
    return next(
        (question for question in questions_db if str(question.question_id) == str(question_id)),
        None,
    )


def fallback_feedback(question, correct: bool) -> str:
    if correct:
        return (
            "Correcto. Esa respuesta coincide con el concepto evaluado y suma puntos "
            "porque identifica la idea central de la pregunta."
        )

    return (
        "Respuesta incorrecta. Revisa el enunciado y las opciones: la clave está en "
        "relacionar el concepto con su definición o procedimiento dentro de ecuaciones "
        "diferenciales."
    )


def get_feedback(question, correct: bool) -> str:
    if question.feedback:
        selected = question.feedback.correct if correct else question.feedback.incorrect
        if selected:
            return selected
    return fallback_feedback(question, correct)


@router.get("/questions")
async def get_questions(
    difficulty: Literal["easy", "medium", "hard"] | None = Query(None),
    cut: int | None = Query(None, ge=1, le=3),
):
    academic_cut = DIFFICULTY_TO_CUT[difficulty] if difficulty else cut
    filtered = [
        question for question in questions_db
        if academic_cut is None or question.academic_cut == academic_cut
    ]
    return [public_question(question) for question in filtered]


@router.get("/questions/")
async def get_questions_slash(
    difficulty: Literal["easy", "medium", "hard"] | None = Query(None),
    cut: int | None = Query(None, ge=1, le=3),
):
    return await get_questions(difficulty=difficulty, cut=cut)


@router.post("/validate")
async def validate_answer(data: ValidateAnswerRequest):
    question = find_question(data.question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")

    correct = data.answer == question.correct_answer
    return {
        "correct": correct,
        "feedback": get_feedback(question, correct),
    }


@router.get("/questions/session/{session_id}/next")
async def get_next_session_question(
    session_id: str,
    cut: int = Query(1, ge=1, le=3),
):
    try:
        question = game_service.get_next_question(session_id, cut, questions_db)
        return public_question(question)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/questions/session/{session_id}/answer")
async def submit_session_answer(session_id: str, data: dict):
    try:
        return game_service.submit_answer(
            session_id,
            data["player_id"],
            data["question_id"],
            data["answer"],
            questions_db,
        )
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Campo requerido: {e}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/questions/{question_id}")
async def get_single_question(question_id: str):
    question = find_question(question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    return public_question(question)
