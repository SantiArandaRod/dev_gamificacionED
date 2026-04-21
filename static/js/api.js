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

    async getBoard(cutValue) {
        // Añadimos el parámetro del corte a la petición del tablero
        const res = await fetch(`${API_BASE}/board/?cut=${cutValue}`);
        return res.json();
    },

    async getSession(sessionId) {
        const res = await fetch(`${API_BASE}/session/${sessionId}`);
        return res.json();
    }
};

// Lógica del botón entrar
document.getElementById('btn-join').addEventListener('click', async () => {
    const name = document.getElementById('player-name').value;
    const cut = document.getElementById('academic_cut').value;

    if (!name) return alert("¡Ponte un nombre, ingeniero!");

    try {
        // 1. Crear sesión primero
        const session = await api.createSession();

        // 2. Ahora sí preparamos los datos con el session_id real
        const playerData = {
            player_id: crypto.randomUUID(),
            session_id: session.session_id,
            name: name,
            order: 1,
            avatar: avatarConfig, // Usamos el objeto global de avatar-builder.js
            position: 1
        };

        // 3. Persistencia y registro
        sessionStorage.setItem('current_player', JSON.stringify(playerData));
        await api.joinGame(session.session_id, playerData);

        console.log(`Redirigiendo a sesión ${session.session_id} con corte ${cut}`);
        window.location.href = `game.html?session=${session.session_id}&cut=${cut}`;

    } catch (error) {
        console.error("Fallo en el inicio:", error);
        alert("Error de conexión con el servidor");
    }
});