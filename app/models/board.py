from pydantic import BaseModel
from typing import Literal, Optional


class BoardCell(BaseModel):
    cell_number: int
    cell_type: Literal["normal", "snake_head", "ladder_bottom", "question"] = "normal"
    destination: Optional[int] = None
    question_id: Optional[str] = None


SNAKES: dict[int, int] = {
    24: 16,
    21: 13,
    18: 7,
    14: 5,
}

LADDERS: dict[int, int] = {
    3: 11,
    6: 15,
    10: 19,
    12: 22,
}


def build_board() -> list[BoardCell]:
    cells = []
    for n in range(1, 26):
        if n in SNAKES:
            cells.append(BoardCell(cell_number=n, cell_type="snake_head", destination=SNAKES[n]))
        elif n in LADDERS:
            cells.append(BoardCell(cell_number=n, cell_type="ladder_bottom", destination=LADDERS[n]))
        else:
            cells.append(BoardCell(cell_number=n, cell_type="normal"))
    return cells
