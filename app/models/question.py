from pydantic import BaseModel, Field
from typing import Literal, Optional
import uuid


class Question(BaseModel):
    question_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    options: list[str]
    correct_answer: str
    academic_cut: Literal[1, 2, 3]
    subject: str
    difficulty: Literal["easy", "medium", "hard"] = "medium"
    created_by: Optional[str] = None