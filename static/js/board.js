const boardElement = document.getElementById('board');

let localPlayer = null;
let sessionId = "local";
let academicCut = 1;
let currentTurn = null;
let boardData = null;
let currentPlayers = [];
let localGameState = null;
let questionBank = [];
let pendingQuestionPlayerId = null;

function loadLocalGameState() {
    try {
        return JSON.parse(localStorage.getItem('local_game_state') || 'null');
    } catch (err) {
        console.error("No se pudo leer la partida local:", err);
        return null;
    }
}

function saveLocalGameState() {
    localStorage.setItem('local_game_state', JSON.stringify(localGameState));
}

function getActivePlayer() {
    if (!localGameState?.players?.length) return null;
    return localGameState.players[localGameState.current_turn_index] || localGameState.players[0];
}

function setActivePlayerInSession() {
    const activePlayer = getActivePlayer();
    if (!activePlayer) return;
    localPlayer = activePlayer;
    sessionStorage.setItem('current_player', JSON.stringify(activePlayer));
}

async function initGame() {
    const urlParams = new URLSearchParams(window.location.search);
    academicCut = Number(urlParams.get('cut') || 1);
    localGameState = loadLocalGameState();

    if (!localGameState || localGameState.mode !== "local" || !localGameState.players?.length) {
        window.location.href = 'index.html';
        return;
    }

    sessionId = "local";
    setActivePlayerInSession();

    try {
        const [boardRes, questionsRes] = await Promise.all([
            fetch(`/api/board/?cut=${academicCut}`),
            fetch(`/api/questions/?cut=${academicCut}`)
        ]);

        boardData = await boardRes.json();
        questionBank = await questionsRes.json();

        renderBoard();
        sync();
    } catch (err) {
        console.error("Error cargando tablero:", err);
    }
}

function renderBoard() {
    boardElement.innerHTML = '';

    if (!boardData || !boardData.cells) return;

    boardData.cells.forEach(cellData => {
        const cell = document.createElement('div');
        cell.className = `cell ${cellData.cell_type}`;
        if (cellData.has_question) cell.classList.add('question');
        cell.id = `cell-${cellData.cell_number}`;
        cell.innerHTML = `<span>${cellData.cell_number}</span>`;

        boardElement.appendChild(cell);
    });
}

function updatePlayers(players) {
    players.forEach(p => {
        let token = document.getElementById(`token-${p.player_id}`);

        if (!token) {
            token = document.createElement('div');
            token.id = `token-${p.player_id}`;
            token.className = 'player-token';
            token.innerHTML = generateAvatarSVG(p.avatar_data || p.avatar);
        }

        token.title = p.name;
        const cell = document.getElementById(`cell-${p.position || 1}`);
        if (cell) cell.appendChild(token);
    });
}

function animateToken(playerId, className) {
    const token = document.getElementById(`token-${playerId}`);
    if (!token) return;

    token.classList.remove('token-correct', 'token-incorrect', 'token-move');
    void token.offsetWidth;
    token.classList.add(className);
    window.setTimeout(() => token.classList.remove(className), 900);
}

function updateScoreboard(players) {
    let scoreboard = document.getElementById('scoreboard');

    if (!scoreboard) {
        const sidebar = document.querySelector('.sidebar');
        const closeButton = sidebar.querySelector('.btn-outline-danger');
        const scoreCard = document.createElement('div');
        scoreCard.className = 'card bg-dark border-success mb-4';
        scoreCard.innerHTML = `
            <div class="card-body text-light small">
                <h6 class="card-title fw-bold text-success">Puntajes</h6>
                <div id="scoreboard" class="d-grid gap-2"></div>
            </div>
        `;
        sidebar.insertBefore(scoreCard, closeButton);
        scoreboard = document.getElementById('scoreboard');
    }

    scoreboard.innerHTML = '';
    players.forEach(player => {
        const row = document.createElement('div');
        row.className = `score-row ${player.player_id === currentTurn ? 'active' : ''}`;
        row.innerHTML = `
            <span>${player.name}</span>
            <strong>${player.score ?? 0} pts</strong>
        `;
        scoreboard.appendChild(row);
    });
}

function updatePlayerScore(playerId, score) {
    currentPlayers = currentPlayers.map(player => {
        if (player.player_id === playerId) {
            return { ...player, score };
        }
        return player;
    });
    updateScoreboard(currentPlayers);
}

async function sync() {
    localGameState = loadLocalGameState();
    setActivePlayerInSession();

    currentTurn = localPlayer?.player_id;
    currentPlayers = localGameState.players;
    updatePlayers(currentPlayers);
    updateScoreboard(currentPlayers);
    updateTurnUI();
}

function updateTurnUI() {
    const btn = document.getElementById('btn-roll');

    if (!btn || !localPlayer) return;

    btn.disabled = Boolean(typeof isAnswering !== "undefined" && isAnswering);
    btn.innerText = btn.disabled ? "Resuelve el reto" : `${localPlayer.name}: lanzar dado`;
}

function moveLocalPlayer(playerId, steps) {
    const player = localGameState.players.find(item => item.player_id === playerId);
    if (!player) return null;

    player.position = Math.max(1, Math.min(25, (player.position || 1) + steps));
    saveLocalGameState();
    return player;
}

function advanceTurn() {
    localGameState.current_turn_index = (localGameState.current_turn_index + 1) % localGameState.players.length;
    saveLocalGameState();
    sync();
}

async function handlePostMove(player) {
    const specialMove = applySpecialMove(player);
    if (specialMove && typeof wait === "function") await wait(850);
    player = specialMove || player;
    const cellNumber = player.position;
    const cellData = boardData.cells.find(c => c.cell_number === cellNumber);

    if (cellData && cellData.has_question) {
        pendingQuestionPlayerId = player.player_id;
        await triggerNextQuestion(sessionId, academicCut);
        return;
    }

    advanceTurn();
}

function applySpecialMove(player) {
    const cellData = boardData.cells.find(c => c.cell_number === player.position);
    if (!cellData?.destination) return null;

    const destination = cellData.destination;
    const playerState = localGameState.players.find(item => item.player_id === player.player_id);
    if (!playerState) return null;

    playerState.position = destination;
    saveLocalGameState();
    sync();
    animateToken(player.player_id, 'token-move');

    const message = destination > cellData.cell_number
        ? `${player.name} sube por una escalera hasta la casilla ${destination}.`
        : `${player.name} baja por una serpiente hasta la casilla ${destination}.`;
    if (typeof showGameNotice === "function") showGameNotice(message);

    return playerState;
}

function getNextLocalQuestion(cut) {
    const used = new Set(localGameState.used_question_ids || []);
    const availableQuestions = questionBank.filter(question => (
        Number(question.academic_cut) === Number(cut)
        && !used.has(String(question.question_id))
    ));

    if (!availableQuestions.length) return null;

    const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    localGameState.used_question_ids = [...used, String(question.question_id)];
    saveLocalGameState();
    return question;
}

function submitLocalAnswer(playerId, questionId, answer) {
    const player = localGameState.players.find(item => item.player_id === playerId);
    const question = questionBank.find(item => String(item.question_id) === String(questionId));
    const scored = new Set(localGameState.scored_question_ids || []);

    if (!player || !question) {
        return { detail: "No se pudo validar la respuesta." };
    }

    if (scored.has(String(questionId))) {
        return { detail: "Esta pregunta ya fue puntuada." };
    }

    const correct = answer === question.correct_answer;
    const delta = correct ? 10 : -5;

    player.score = (player.score || 0) + delta;
    localGameState.scored_question_ids = [...scored, String(questionId)];
    saveLocalGameState();

    return {
        player_id: playerId,
        correct,
        delta,
        score: player.score,
        correct_answer: question.correct_answer,
    };
}

async function penalizeLocalPlayer(playerId, steps) {
    const player = moveLocalPlayer(playerId, -steps);
    sync();
    animateToken(playerId, 'token-incorrect');
    return player;
}

function finishQuestionTurn() {
    pendingQuestionPlayerId = null;
    advanceTurn();
}

function animateDice(value) {
    const diceEl = document.getElementById('dice-value');
    diceEl.classList.remove('dice-pop');
    diceEl.innerText = value;
    void diceEl.offsetWidth;
    diceEl.classList.add('dice-pop');
}

document.getElementById('btn-roll').addEventListener('click', async () => {
    if (!localPlayer) return;
    if (typeof isAnswering !== "undefined" && isAnswering) return;

    try {
        const dice = Math.floor(Math.random() * 6) + 1;
        localGameState.dice_value = dice;
        saveLocalGameState();
        animateDice(dice);

        const movedPlayer = moveLocalPlayer(localPlayer.player_id, dice);
        sync();
        animateToken(localPlayer.player_id, 'token-move');
        await handlePostMove(movedPlayer);
    } catch (err) {
        console.error("Error en turno:", err);
    }
});

initGame();
