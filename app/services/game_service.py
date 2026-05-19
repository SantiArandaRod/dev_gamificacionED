import random

sessions = {}

def create_session():
    import uuid
    session_id = str(uuid.uuid4())[:6]

    sessions[session_id] = {
        "players": [],
        "current_turn": None,
        "dice_value": None,
        "status": "waiting",
        "used_question_ids": [],
    }

    return session_id


def join_session(session_id, player):
    if session_id not in sessions:
        raise Exception("Sesión no existe")

    session = sessions[session_id]

    if len(session["players"]) >= 4:
        raise Exception("Sesión llena")

    player["score"] = 0
    session["players"].append(player)

    # primer jugador empieza
    if len(session["players"]) == 1:
        session["current_turn"] = player["player_id"]

    return player


def get_session(session_id):
    return sessions.get(session_id)


def get_next_question(session_id, cut, questions):
    if session_id not in sessions:
        raise Exception("Sesion no existe")

    session = sessions[session_id]
    used_question_ids = set(session.setdefault("used_question_ids", []))

    available_questions = [
        question
        for question in questions
        if question.academic_cut == cut and str(question.question_id) not in used_question_ids
    ]

    if not available_questions:
        raise Exception("No quedan preguntas disponibles para esta sesion")

    question = random.choice(available_questions)
    session["used_question_ids"].append(str(question.question_id))

    return question


def submit_answer(session_id, player_id, question_id, answer, questions):
    if session_id not in sessions:
        raise Exception("Sesion no existe")

    session = sessions[session_id]
    player = next(
        (p for p in session["players"] if p["player_id"] == player_id),
        None,
    )

    if not player:
        raise Exception("Jugador no existe")

    question = next(
        (q for q in questions if str(q.question_id) == str(question_id)),
        None,
    )

    if not question:
        raise Exception("Pregunta no existe")

    correct = answer == question.correct_answer
    delta = 10 if correct else -5
    player["score"] = player.get("score", 0) + delta

    return {
        "correct": correct,
        "delta": delta,
        "score": player["score"],
        "correct_answer": question.correct_answer,
    }


def roll_dice(session_id, player_id):
    session = sessions[session_id]

    if session["current_turn"] != player_id:
        raise Exception("No es tu turno")

    dice = random.randint(1, 6)
    session["dice_value"] = dice

    return dice


def move_player(session_id, player_id, steps):
    session = sessions[session_id]

    if session["current_turn"] != player_id:
        raise Exception("No es tu turno")

    player = next(p for p in session["players"] if p["player_id"] == player_id)

    player["position"] += steps

    if player["position"] > 25:
        player["position"] = 25

    # cambiar turno
    idx = session["players"].index(player)
    next_idx = (idx + 1) % len(session["players"])
    session["current_turn"] = session["players"][next_idx]["player_id"]

    return player
