let questionModal;
let isAnswering = false;
let currentQuestion = null;

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

    if (!textEl || !optionsEl) {
        console.error("No se encontraron elementos del modal");
        return;
    }

    textEl.innerText = question.text;
    optionsEl.innerHTML = '';

    question.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-option w-100';
        btn.innerText = opt;
        btn.onclick = () => submitAnswer(opt);

        optionsEl.appendChild(btn);
    });

    questionModal.show();
}

async function submitAnswer(answer) {
    if (!currentQuestion) return;

    const result = await api.submitAnswer(
        sessionId,
        localPlayer.player_id,
        currentQuestion.question_id,
        answer
    );

    if (result.correct) {
        alert(`Correcto. +10 puntos. Puntaje actual: ${result.score}`);
    } else {
        alert(`Incorrecto. -5 puntos. Puntaje actual: ${result.score}`);
        await moveBack(localPlayer.player_id, 2);
    }

    isAnswering = false;
    currentQuestion = null;
    questionModal.hide();
    await sync();
}

async function moveBack(playerId, steps) {
    try {
        await api.movePlayer(sessionId, playerId, -steps);
    } catch (err) {
        console.error("Error en penalizacion:", err);
    }
}

async function triggerNextQuestion(sessionId, cut) {
    try {
        const res = await fetch(`/api/questions/session/${sessionId}/next?cut=${cut}`);

        if (!res.ok) {
            const error = await res.json();
            alert(error.detail || "No quedan preguntas disponibles para esta sesion");
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
