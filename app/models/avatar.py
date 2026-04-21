from pydantic import BaseModel
from typing import Literal


class AvatarConfig(BaseModel):
    skin_color: str = "#FDBCB4"
    hair_color: str = "#1a1a1a"
    bg_color: str = "#ff6b6b"
    accessory: Literal["none", "glasses", "hat", "crown", "graduation", "cap", "bow", "bolt"] = "none"
    face_shape: Literal["circle", "square", "rounded"] = "circle"
    eyes_style: Literal["normal", "happy", "cool", "sleepy"] = "normal"
    mouth_style: Literal["smile", "big", "flat", "tongue"] = "smile"