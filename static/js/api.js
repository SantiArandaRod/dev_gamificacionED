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
    // 1. Capturamos los valores justo cuando se hace click
    const name = document.getElementById('player-name').value;
    const cut = document.getElementById('academic_cut').value;

    if (!name) return alert("¡Ponte un nombre, ingeniero!");

    try {
        // 2. Crear sesión
        const session = await api.createSession();

        // 3. Preparar datos del jugador
        // Importante: posición inicial 1 para que aparezca en la primera casilla
        const playerData = {
            player_id: crypto.randomUUID(),
            session_id: session.session_id,
            name: name,
            order: 1,
            avatar: typeof config !== 'undefined' ? config : { skin_color: "#ffdbac" },
            position: 1
        };

        // 4. Guardar localmente
        sessionStorage.setItem('current_player', JSON.stringify(playerData));

        // 5. Registrar en backend
        await api.joinGame(session.session_id, playerData);

        // 6. Redirigir incluyendo el CORTE seleccionado
        console.log(`Redirigiendo a sesión ${session.session_id} con corte ${cut}`);
        window.location.href = `game.html?session=${session.session_id}&cut=${cut}`;

    } catch (error) {
        console.error("Fallo en el inicio:", error);
        alert("Error de conexión con el servidor de FastAPI");
    }
});