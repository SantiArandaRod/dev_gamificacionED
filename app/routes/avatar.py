from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.models.avatar import AvatarData
from app.services import avatar_service, game_service

router = APIRouter()


def find_player(player_id: str) -> dict | None:
    for session in game_service.sessions.values():
        for player in session.get("players", []):
            if player.get("player_id") == player_id:
                return player
    return None


@router.get("/parts")
def get_parts():
    return avatar_service.get_parts_catalog()


@router.get("/{player_id}", response_model=AvatarData)
def get_avatar(player_id: str):
    player = find_player(player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Jugador no existe")
    return avatar_service.normalize_avatar_data(player.get("avatar_data"))


@router.post("/{player_id}", response_model=AvatarData)
def save_avatar(player_id: str, avatar_data: AvatarData):
    player = find_player(player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Jugador no existe")

    serialized = avatar_data.model_dump()
    player["avatar_data"] = serialized
    return serialized


@router.get("/{player_id}/svg")
def get_avatar_svg(player_id: str):
    player = find_player(player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Jugador no existe")

    svg = avatar_service.render_avatar_svg(player.get("avatar_data"))
    return Response(content=svg, media_type="image/svg+xml")
