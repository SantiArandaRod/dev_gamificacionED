from fastapi import APIRouter
from app.models.board import build_board, SNAKES, LADDERS

router = APIRouter()

@router.get("/")
async def get_board():
    """
    Devuelve la configuración completa del tablero 10x10.
    """
    cells = build_board()
    return {
        "cells": cells,
        "special_structures": {
            "snakes": SNAKES,
            "ladders": LADDERS
        },
        "dimensions": {"rows": 10, "cols": 10}
    }