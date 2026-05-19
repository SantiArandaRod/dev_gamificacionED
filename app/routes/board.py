from fastapi import APIRouter, Query

from app.models.board import LADDERS, SNAKES

router = APIRouter()


@router.get("/")
async def get_board(
    cut: int = Query(1, ge=1, le=3),
    session_id: str | None = Query(None),
):
    cells = []
    for i in range(1, 26):
        cell_type = "normal"
        destination = None

        if i in SNAKES:
            cell_type = "snake_head"
            destination = SNAKES[i]
        elif i in LADDERS:
            cell_type = "ladder_bottom"
            destination = LADDERS[i]

        cells.append(
            {
                "cell_number": i,
                "cell_type": cell_type,
                "destination": destination,
                "has_question": True,
            }
        )

    return {
        "cells": cells,
        "special_structures": {"snakes": SNAKES, "ladders": LADDERS},
        "dimensions": {"rows": 5, "cols": 5},
        "cut": cut,
        "session_id": session_id,
    }
