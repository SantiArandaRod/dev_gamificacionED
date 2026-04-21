from fastapi import APIRouter, HTTPException
from app.services import game_service

router = APIRouter(prefix="/session")

@router.post("/create")
def create():
    session_id = game_service.create_session()
    return {"session_id": session_id}


@router.post("/{session_id}/join")
def join(session_id: str, player: dict):
    try:
        game_service.join_session(session_id, player)
        return {
            "message": f"Bienvenido {player['name']}",
            "player_id": player["player_id"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{session_id}")
def get(session_id: str):
    session = game_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="No existe")
    return session


@router.post("/{session_id}/roll")
def roll(session_id: str, data: dict):
    try:
        dice = game_service.roll_dice(session_id, data["player_id"])
        return {"dice": dice}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{session_id}/move")
def move(session_id: str, data: dict):
    try:
        player = game_service.move_player(
            session_id,
            data["player_id"],
            data["steps"]
        )
        return player
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))