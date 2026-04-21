from pydantic import BaseModel
from typing import Literal, Optional


class BoardCell(BaseModel):
    cell_number: int
    cell_type: Literal["normal", "snake_head", "ladder_bottom", "question"] = "normal"
    destination: Optional[int] = None
    question_id: Optional[str] = None


SNAKES: dict[int, int] = {
    98: 78,
    95: 72,
    87: 24,
    64: 60,
    54: 34,
    43: 17,
    40: 3,
}

LADDERS: dict[int, int] = {
    4: 56,
    9: 31,
    20: 38,
    28: 84,
    51: 67,
    63: 81,
    71: 91,
}


def build_board() -> list[BoardCell]:
    cells = []
    for n in range(1, 101):
        if n in SNAKES:
            cells.append(BoardCell(cell_number=n, cell_type="snake_head", destination=SNAKES[n]))
        elif n in LADDERS:
            cells.append(BoardCell(cell_number=n, cell_type="ladder_bottom", destination=LADDERS[n]))
        else:
            cells.append(BoardCell(cell_number=n, cell_type="normal"))
    return cells