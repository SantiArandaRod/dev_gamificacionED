from pydantic import BaseModel, Field
from typing import Literal, Optional


class AvatarConfig(BaseModel):
    skin_color: str = "#FDBCB4"
    hair_color: str = "#1a1a1a"
    bg_color: str = "#ff6b6b"
    accessory: Literal["none", "glasses", "hat", "crown", "graduation", "cap", "bow", "bolt"] = "none"
    face_shape: Literal["circle", "square", "rounded"] = "circle"
    eyes_style: Literal["normal", "happy", "cool", "sleepy"] = "normal"
    mouth_style: Literal["smile", "big", "flat", "tongue"] = "smile"


class AvatarData(BaseModel):
    skin_color: str = "skin_1"
    head_shape: str = "head_round"
    hair_style: str = "hair_short"
    hair_color: str = "hair_black"
    eye_type: str = "eyes_normal"
    eye_color: str = "eye_brown"
    eyebrow_type: str = "brow_flat"
    eyebrow_color: str = "brow_black"
    nose_type: str = "nose_normal"
    mouth_type: str = "mouth_smile"
    mouth_color: str = "lip_natural"
    accessory: str = "acc_none"
    extra: Optional[dict] = Field(default_factory=dict)
