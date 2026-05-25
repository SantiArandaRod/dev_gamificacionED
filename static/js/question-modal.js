let questionModal;
let isAnswering = false;
let currentQuestion = null;
let feedbackTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    const modalElement = document.getElementById('qModal');
    if (modalElement) {
        questionModal = new bootstrap.Modal(modalElement);
    }
});

async function triggerQuestion(questionId) {
    try {
        const res = await fetch(`/api/questions/${questionId}`);
        const question = await res.json();

        currentQuestion = question;
        if (question) {
            isAnswering = true;
        }

        showQuestionModal(question);
    } catch (err) {
        console.error("Error cargando pregunta:", err);
    }
}

function showQuestionModal(question) {
    const modal = document.getElementById('qModal');
    const textEl = modal.querySelector('#q-text');
    const optionsEl = modal.querySelector('#q-options');
    const feedbackEl = modal.querySelector('#q-feedback');

    if (!textEl || !optionsEl) {
        console.error("No se encontraron elementos del modal");
        return;
    }

    textEl.innerText = question.text;
    optionsEl.innerHTML = '';
    if (feedbackEl) {
        feedbackEl.className = 'question-feedback';
        feedbackEl.innerHTML = '';
    }

    question.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-option w-100';
        btn.innerText = opt;
        btn.onclick = () => submitAnswer(opt);

        optionsEl.appendChild(btn);
    });

    if (typeof updateTurnUI === "function") updateTurnUI();
    questionModal.show();
}

async function submitAnswer(answer) {
    if (!currentQuestion || !isAnswering) return;

    isAnswering = false;
    document.querySelectorAll('#q-options button').forEach(btn => {
        btn.disabled = true;
    });

    const activePlayerId = pendingQuestionPlayerId || localPlayer.player_id;
    const result = typeof submitLocalAnswer === "function"
        ? submitLocalAnswer(activePlayerId, currentQuestion.question_id, answer)
        : await api.submitAnswer(sessionId, activePlayerId, currentQuestion.question_id, answer);

    if (result.detail) {
        showQuestionFeedback("neutral", result.detail);
        currentQuestion = null;
        await wait(1100);
        questionModal.hide();
        await sync();
        return;
    }

    updatePlayerScore(result.player_id, result.score);
    await new Promise(resolve => requestAnimationFrame(resolve));

    if (result.correct) {
        animateToken?.(result.player_id, 'token-correct');
        showQuestionFeedback("correct", `Correcto: +10 puntos. Puntaje actual: ${result.score}`);
        await wait(1300);
    } else {
        showQuestionFeedback("incorrect", `Incorrecto: -5 puntos y retrocedes 2 casillas. Respuesta: ${result.correct_answer}`);
        await wait(950);
        await moveBack(result.player_id, 2);
        await wait(750);
    }

    currentQuestion = null;
    questionModal.hide();
    await sync();
    if (typeof finishQuestionTurn === "function") finishQuestionTurn();
    if (typeof updateTurnUI === "function") updateTurnUI();
}

async function moveBack(playerId, steps) {
    try {
        if (typeof penalizeLocalPlayer === "function") {
            await penalizeLocalPlayer(playerId, steps);
            return;
        }
        await api.movePlayer(sessionId, playerId, -steps);
    } catch (err) {
        console.error("Error en penalizacion:", err);
    }
}

async function triggerNextQuestion(sessionId, cut) {
    try {
        if (typeof getNextLocalQuestion === "function") {
            const question = getNextLocalQuestion(cut);

            if (!question) {
                showGameNotice("Ya no quedan preguntas para este corte. El turno avanza.");
                if (typeof finishQuestionTurn === "function") finishQuestionTurn();
                return;
            }

            currentQuestion = question;
            isAnswering = true;
            showQuestionModal(question);
            return;
        }

        const res = await fetch(`/api/questions/session/${sessionId}/next?cut=${cut}`);

        if (!res.ok) {
            const error = await res.json();
            showGameNotice(error.detail || "No quedan preguntas disponibles para esta sesion");
            return;
        }

        const question = await res.json();

        currentQuestion = question;
        isAnswering = true;
        showQuestionModal(question);
    } catch (err) {
        console.error("Error cargando pregunta de la sesion:", err);
    }
}

function showQuestionFeedback(type, message) {
    const feedbackEl = document.getElementById('q-feedback');
    if (!feedbackEl) return;

    window.clearTimeout(feedbackTimer);
    feedbackEl.className = `question-feedback ${type} show`;
    feedbackEl.innerHTML = message;
    feedbackTimer = window.setTimeout(() => {
        feedbackEl.classList.remove('show');
    }, 2200);
}

function showGameNotice(message) {
    const notice = document.getElementById('game-notice');
    if (!notice) return;

    notice.innerText = message;
    notice.classList.add('show');
    window.setTimeout(() => notice.classList.remove('show'), 2200);
}

function wait(ms) {
    return new Promise(resolve => window.setTimeout(resolve, ms));
}
