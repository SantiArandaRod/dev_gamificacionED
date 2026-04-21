# services/game_service.py

import uuid
from datetime import datetime
from typing import List

from models import *
from game_state import *


def create_session() -> GameSession:
    session_id = str(uuid.uuid4())

    session = GameSession(
        session_id=session_id,
        status="waiting",
        players=[],
        created_at=datetime.utcnow()
    )

    sessions[session_id] = session
    return session


def get_session(session_id: str) -> GameSession | None:
    return sessions.get(session_id)


def add_player(session_id: str, name: str, avatar: AvatarConfig) -> Player:
    session = sessions.get(session_id)

    if not session:
        raise ValueError("Session not found")

    if len(session.players) >= 4:
        raise ValueError("Max 4 players")

    player = Player(
        player_id=uuid.uuid4(),
        session_id=session_id,
        name=name,
        order=len(session.players) + 1,
        avatar=avatar,
        position=0
    )

    session.players.append(player)
    return player