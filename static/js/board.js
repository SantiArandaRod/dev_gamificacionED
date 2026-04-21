// Variables de estado global
const boardElement = document.getElementById('board');
let boardData = null;
let localPlayer = null;

// Configuración de la física del tablero 5x5
const SNAKES = { 24: 14, 17: 7, 12: 2 };
const LADDERS = { 3: 11, 8: 18, 15: 23 };

/**
 * Inicialización principal del juego
 */
async function initGame() {
    console.log("🚀 Iniciando motor del juego...");
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const cut = urlParams.get('cut') || 1;
        const sId = urlParams.get('session');

        if (!sId) {
            console.error("❌ No se detectó ID de sesión en la URL");
            return;
        }

        // 1. Obtener datos del tablero filtrados por CORTE
        const boardRes = await fetch(`/api/board/?cut=${cut}`);
        if (!boardRes.ok) throw new Error("Fallo al conectar con /api/board/");
        boardData = await boardRes.json();

        // 2. Dibujar la cuadrícula 5x5
        renderBoard(boardData.cells);

        // 3. Recuperar jugador local de la sesión
        const storedPlayer = sessionStorage.getItem('current_player');
        if (storedPlayer) {
            localPlayer = JSON.parse(storedPlayer);
        }

        // 4. Cargar sesión completa para sincronizar otros jugadores
        const sessionRes = await fetch(`/api/session/${sId}`);
        const sessionData = await sessionRes.json();

        // 5. Renderizar fichas (esperamos a que el DOM esté listo)
        setTimeout(() => {
            if (sessionData && sessionData.players) {
                sessionData.players.forEach(p => renderPlayerToken(p));
            }
        }, 200);

    } catch (error) {
        console.error("⚠️ ERROR CRÍTICO EN INIT:", error);
    }
}

/**
 * Dibuja las celdas en el DOM
 */
function renderBoard(cells) {
    if (!boardElement) return;
    boardElement.innerHTML = '';

    cells.forEach(cell => {
        const cellDiv = document.createElement('div');
        // Todas las casillas son interactivas
        cellDiv.className = `cell question ${cell.cell_type || ''}`;
        cellDiv.id = `cell-${cell.cell_number}`;
        cellDiv.innerHTML = `<span>${cell.cell_number}</span>`;

        // Evento de clic manual para ver la pregunta
        cellDiv.addEventListener('click', () => {
            if (cell.question_id) triggerQuestion(cell.question_id);
        });

        // Configuración para Drag & Drop
        cellDiv.addEventListener('dragover', (e) => e.preventDefault());
        cellDiv.addEventListener('drop', handleDrop);

        boardElement.appendChild(cellDiv);
    });
}

/**
 * Renderiza el avatar personalizado (SVG) en la casilla inicial
 */
function renderPlayerToken(player) {
    const startCell = document.getElementById(`cell-1`);
    if (!startCell || document.getElementById(`token-${player.player_id}`)) return;

    const token = document.createElement('div');
    token.id = `token-${player.player_id}`;
    token.className = 'player-token';

    // Inyectamos el SVG generado por avatar-builder.js
    if (player.avatar && typeof player.avatar === 'object') {
        token.innerHTML = generateAvatarSVG(player.avatar);
    } else {
        token.style.backgroundColor = player.avatar || '#4ecca3';
    }

    token.draggable = true;
    token.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('player_id', player.player_id);
    });

    startCell.appendChild(token);
}

/**
 * Lógica del movimiento (Drag & Drop + Física S&E)
 */
function handleDrop(e) {
    e.preventDefault();
    const cell = e.target.closest('.cell');
    const playerId = e.dataTransfer.getData('player_id');
    const token = document.getElementById(`token-${playerId}`);

    if (cell && token) {
        const cellNum = parseInt(cell.id.split('-')[1]);

        // Mover visualmente al lugar del drop
        cell.appendChild(token);

        // Validar si es una casilla especial
        if (LADDERS[cellNum]) {
            handleSpecialMove(playerId, LADDERS[cellNum], "¡GENIAL! Una escalera 🪜");
        } else if (SNAKES[cellNum]) {
            handleSpecialMove(playerId, SNAKES[cellNum], "¡UY! Una serpiente 🐍");
        } else {
            // Si es normal, disparamos la pregunta de una vez
            checkIfQuestionAndTrigger(cellNum);
        }
    }
}

/**
 * Maneja el movimiento automático por serpientes o escaleras
 */
function handleSpecialMove(playerId, destination, message) {
    setTimeout(() => {
        alert(message);
        const token = document.getElementById(`token-${playerId}`);
        const destCell = document.getElementById(`cell-${destination}`);
        if (token && destCell) {
            destCell.appendChild(token);
            // Tras el movimiento automático, lanzamos la pregunta del destino
            setTimeout(() => checkIfQuestionAndTrigger(destination), 300);
        }
    }, 400);
}

function checkIfQuestionAndTrigger(cellNumber) {
     const cellData = boardData.cells.find(c => c.cell_number === cellNumber);
     if (cellData && cellData.question_id) {
         triggerQuestion(cellData.question_id);
     }
}

// Evento del Dado
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

// Ejecutar inicio
initGame();