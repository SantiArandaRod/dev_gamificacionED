// Variables globales
const boardElement = document.getElementById('board');
let boardData = null;
let localPlayer = null;

async function initGame() {
    console.log("Iniciando motor del juego...");
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const cut = urlParams.get('cut') || 1;
        const sId = urlParams.get('session');

        if (!sId) {
            console.error("No se detectó ID de sesión en la URL");
            return;
        }

        // 1. Obtener datos del tablero
        const boardRes = await fetch(`/api/board/?cut=${cut}`);
        if (!boardRes.ok) throw new Error("Fallo al conectar con /api/board/");
        boardData = await boardRes.json();
        console.log("Tablero cargado:", boardData);

        // 2. Dibujar el tablero cuadrado
        renderBoard(boardData.cells);

        // 3. Recuperar jugador local
        const storedPlayer = sessionStorage.getItem('current_player');
        if (storedPlayer) {
            localPlayer = JSON.parse(storedPlayer);
            console.log("Jugador local detectado:", localPlayer.name);
        }

        // 4. Cargar sesión completa para ver otros jugadores
        const sessionRes = await fetch(`/api/session/${sId}`);
        const sessionData = await sessionRes.json();

        // 5. Renderizar todas las fichas
        setTimeout(() => {
            if (sessionData && sessionData.players) {
                sessionData.players.forEach(p => renderPlayerToken(p));
            }
        }, 200);

    } catch (error) {
        console.error("ERROR CRÍTICO:", error);
        alert("Error al cargar el juego. Revisa la consola de Kali.");
    }
}

function renderBoard(cells) {
    if (!boardElement) return;
    boardElement.innerHTML = '';

    cells.forEach(cell => {
        const cellDiv = document.createElement('div');
        // Todas son preguntas por defecto
        cellDiv.className = `cell question ${cell.cell_type || ''}`;
        cellDiv.id = `cell-${cell.cell_number}`;
        cellDiv.innerHTML = `<span>${cell.cell_number}</span>`;

        // Eventos
        // En la función renderBoard, dentro del event listener:
        cellDiv.addEventListener('click', () => {
            console.log("Clic en casilla:", cell.cell_number, "ID Pregunta:", cell.question_id);
            if (cell.question_id) {
                triggerQuestion(cell.question_id);
            } else {
                console.warn("Esta casilla no tiene un question_id asignado");
            }
        });
        cellDiv.addEventListener('click', () => {
            if (cell.question_id) triggerQuestion(cell.question_id);
        });
        cellDiv.addEventListener('dragover', (e) => e.preventDefault());
        cellDiv.addEventListener('drop', handleDrop);

        boardElement.appendChild(cellDiv);
    });
}

function renderPlayerToken(player) {
    const startCell = document.getElementById(`cell-1`);
    if (!startCell || document.getElementById(`token-${player.player_id}`)) return;

    const token = document.createElement('div');
    token.id = `token-${player.player_id}`;
    token.className = 'player-token';
    token.style.backgroundColor = player.avatar.skin_color || '#4ecca3';
    token.draggable = true;
    token.innerHTML = `<span>${player.name[0].toUpperCase()}</span>`;

    token.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('player_id', player.player_id);
    });

    startCell.appendChild(token);
}

function handleDrop(e) {
    e.preventDefault();
    const cell = e.target.closest('.cell');
    const playerId = e.dataTransfer.getData('player_id');
    const token = document.getElementById(`token-${playerId}`);

    if (cell && token) {
        const cellNum = parseInt(cell.id.split('-')[1]);
        cell.appendChild(token);

        const cellInfo = boardData.cells.find(c => c.cell_number === cellNum);
        if (cellInfo) {
            if (cellInfo.destination) {
                setTimeout(() => {
                    const destCell = document.getElementById(`cell-${cellInfo.destination}`);
                    if (destCell) destCell.appendChild(token);
                }, 500);
            } else if (cellInfo.question_id) {
                triggerQuestion(cellInfo.question_id);
            }
        }
    }
}

// Inicialización del dado
const btnRoll = document.getElementById('btn-roll');
if (btnRoll) {
    btnRoll.addEventListener('click', () => {
        const diceDisplay = document.getElementById('dice-value');
        let count = 0;
        const interval = setInterval(() => {
            diceDisplay.innerText = Math.floor(Math.random() * 6) + 1;
            if (++count > 10) clearInterval(interval);
        }, 50);
    });
}

// LANZAR EL JUEGO
initGame();