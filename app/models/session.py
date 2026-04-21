from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime
from .player import Player
import uuid


class GameSession(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: Literal["waiting", "playing", "finished"] = "waiting"
    players: list[Player] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)