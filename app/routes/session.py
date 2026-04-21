from fastapi import APIRouter, HTTPException
from uuid import uuid4
from datetime import datetime

from app.models.session import GameSession
from app.models.player import Player
from app.game_state import sessions

router = APIRouter()


@router.post("/create")
async def create_session():
    """Crea una nueva sesión de juego y devuelve su ID"""
    session_id = str(uuid4())[:8]  # ID corto para facilitar compartirlo
    new_session = GameSession(
        session_id=session_id,
        status="waiting",
        players=[],
        created_at=datetime.now()
    )
    sessions[session_id] = new_session
    return {"session_id": session_id}


@router.get("/{session_id}")
async def get_session(session_id: str):
    """Obtiene el estado actual de una sesión"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    return sessions[session_id]


@router.post("/{session_id}/join")
async def join_session(session_id: str, player_data: Player):
    """Añade un jugador a la sesión (máximo 4)"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")

    session = sessions[session_id]

    if len(session.players) >= 4:
        raise HTTPException(status_code=400, detail="Sesión llena")

    session.players.append(player_data)
    return {"message": f"Bienvenido {player_data.name}", "player_id": player_data.player_id}