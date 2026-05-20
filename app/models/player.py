from pydantic import BaseModel, Field
from .avatar import AvatarConfig
import uuid


class Player(BaseModel):
    player_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    name: str
    order: int
    avatar: AvatarConfig = Field(default_factory=AvatarConfig)
    avatar_data: dict = Field(default_factory=dict)
    position: int = 0
    is_active: bool = True
