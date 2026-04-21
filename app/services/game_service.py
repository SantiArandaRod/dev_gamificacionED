import random

sessions = {}

def create_session():
    import uuid
    session_id = str(uuid.uuid4())[:6]

    sessions[session_id] = {
        "players": [],
        "current_turn": None,
        "dice_value": None,
        "status": "waiting"
    }

    return session_id


def join_session(session_id, player):
    if session_id not in sessions:
        raise Exception("Sesión no existe")

    session = sessions[session_id]

    if len(session["players"]) >= 4:
        raise Exception("Sesión llena")

    session["players"].append(player)

    # primer jugador empieza
    if len(session["players"]) == 1:
        session["current_turn"] = player["player_id"]

    return player


def get_session(session_id):
    return sessions.get(session_id)


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