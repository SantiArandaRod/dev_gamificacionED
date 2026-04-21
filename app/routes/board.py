# app/routes/board.py
from fastapi import APIRouter, Query
from app.game_state import questions_db
from app.models.board import SNAKES, LADDERS  # Importamos las constantes
import random

router = APIRouter()


@router.get("/")
async def get_board(cut: int = Query(1, ge=1, le=3)):
    # 1. Filtramos las preguntas según el corte seleccionado por el usuario
    filtered_questions = [q for q in questions_db if q.academic_cut == cut]

    cells = []
    for i in range(1, 26):
        cell_type = "normal"
        destination = None

        # Lógica de Serpientes y Escaleras
        if i in SNAKES:
            cell_type = "snake_head"
            destination = SNAKES[i]
        elif i in LADDERS:
            cell_type = "ladder_bottom"
            destination = LADDERS[i]

        # 2. TODAS las casillas son preguntas (excepto quizás la 1 y la 25 si quieres)
        # Asignamos una pregunta aleatoria del pool filtrado
        q_id = None
        if filtered_questions:
            selected_q = random.choice(filtered_questions)
            q_id = str(selected_q.question_id)

        cells.append({
            "cell_number": i,
            "cell_type": cell_type,
            "destination": destination,
            "question_id": q_id
        })

    return {
        "cells": cells,
        "special_structures": {"snakes": SNAKES, "ladders": LADDERS},
        "dimensions": {"rows": 5, "cols": 5}
    }