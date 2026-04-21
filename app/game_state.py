from app.models.session import GameSession
from app.models.question import Question

# Diccionario para almacenar las sesiones activas {session_id: GameSession}
sessions: dict[str, GameSession] = {}

# Banco de preguntas cargado en memoria para acceso rápido
questions_db: list[Question] = []