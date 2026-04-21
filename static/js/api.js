const API_BASE = "/api";

const api = {
    async createSession() {
        const res = await fetch(`${API_BASE}/session/create`, { method: 'POST' });
        return res.json();
    },

    async joinGame(sessionId, playerData) {
        const res = await fetch(`${API_BASE}/session/${sessionId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(playerData)
        });
        return res.json();
    },

    async getBoard() {
        const res = await fetch(`${API_BASE}/board/`);
        return res.json();
    }
};

// Lógica del botón entrar
document.getElementById('btn-join').addEventListener('click', async () => {
    const name = document.getElementById('player-name').value;
    if (!name) return alert("¡Ponte un nombre, ingeniero!");

    // 1. Crear o unirse a sesión (Para el MVP, creamos una nueva si no hay)
    const session = await api.createSession();

    // 2. Preparar datos del jugador según el modelo Pydantic
    const playerData = {
        player_id: crypto.randomUUID(),
        session_id: session.session_id,
        name: name,
        order: 1,
        avatar: config, // El objeto config que actualizamos arriba
        position: 0
    };

    // 3. Guardar en sessionStorage para persistencia local
    sessionStorage.setItem('current_player', JSON.stringify(playerData));

    // 4. Registrar en backend y redirigir
    await api.joinGame(session.session_id, playerData);
    window.location.href = `game.html?session=${session.session_id}`;
});