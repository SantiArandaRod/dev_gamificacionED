const boardElement = document.getElementById('board');

let localPlayer = null;
let sessionId = null;
let currentTurn = null;
let boardData = null;

// 🔥 INIT PRINCIPAL
async function initGame() {
const urlParams = new URLSearchParams(window.location.search);
sessionId = urlParams.get('session');
const cut = urlParams.get('cut') || 1;

localPlayer = JSON.parse(sessionStorage.getItem('current_player'));

try {
    // 🔥 cargar tablero desde backend
    const res = await fetch(`/api/board/?cut=${cut}`);
    boardData = await res.json();

    renderBoard();

    startSync();

} catch (err) {
    console.error("Error cargando tablero:", err);
}

}

// 🔥 RENDER TABLERO DINÁMICO
function renderBoard() {
boardElement.innerHTML = '';

if (!boardData || !boardData.cells) return;

boardData.cells.forEach(cellData => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.id = `cell-${cellData.cell_number}`;

    cell.innerHTML = `<span>${cellData.cell_number}</span>`;

    boardElement.appendChild(cell);
});

}

// 🔥 ACTUALIZAR JUGADORES
function updatePlayers(players) {
players.forEach(p => {
let token = document.getElementById(`token-${p.player_id}`);

    if (!token) {
        token = document.createElement('div');
        token.id = `token-${p.player_id}`;
        token.className = 'player-token';

        if (p.avatar) {
            token.innerHTML = generateAvatarSVG(p.avatar);
        }
    }

    const cell = document.getElementById(`cell-${p.position || 1}`);
    if (cell) cell.appendChild(token);
});

}

// 🔥 SINCRONIZACIÓN
async function sync() {
try {
const session = await api.getSession(sessionId);

    currentTurn = session.current_turn;

    updatePlayers(session.players);

    updateTurnUI();

} catch (err) {
    console.error("Error en sync:", err);
}

}

// 🔥 LOOP DE SYNC
function startSync() {
setInterval(sync, 1500);
}

// 🔥 UI DE TURNOS
function updateTurnUI() {
const btn = document.getElementById('btn-roll');

if (!btn) return;

if (currentTurn === localPlayer.player_id) {
    btn.disabled = false;
    btn.innerText = "🎲 Tu turno";
} else {
    btn.disabled = true;
    btn.innerText = "⏳ Espera turno";
}

}

function handlePostMove(player) {
    const cellNumber = player.position;

    const cellData = boardData.cells.find(c => c.cell_number === cellNumber);

    if (cellData && cellData.question_id) {

        // 🔥 adaptar formato
        const qId = `${cellData.question_id}`;

        triggerQuestion(qId);
    }
}
// 🔥 EVENTO DEL DADO
document.getElementById('btn-roll').addEventListener('click', async () => {

// 🔒 control de turno
if (currentTurn !== localPlayer.player_id) return;

// 🔒 bloquear mientras responde
if (typeof isAnswering !== "undefined" && isAnswering) return;

try {
    const res = await api.rollDice(sessionId, localPlayer.player_id);

    const dice = res.dice;

    document.getElementById('dice-value').innerText = dice;

    const moveRes = await api.movePlayer(sessionId, localPlayer.player_id, dice);

    // 🔥 evaluar casilla
    handlePostMove(moveRes);

} catch (err) {
    console.error("Error en turno:", err);
}

});

// 🚀 START
initGame();