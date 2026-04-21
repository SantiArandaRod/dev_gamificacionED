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

    async getSession(sessionId) {
        const res = await fetch(`${API_BASE}/session/${sessionId}`);
        return res.json();
    },

    async rollDice(sessionId, playerId) {
        const res = await fetch(`${API_BASE}/session/${sessionId}/roll`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ player_id: playerId })
        });
        return res.json();
    },

    async movePlayer(sessionId, playerId, steps) {
        const res = await fetch(`${API_BASE}/session/${sessionId}/move`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ player_id: playerId, steps })
        });
        return res.json();
    }
};