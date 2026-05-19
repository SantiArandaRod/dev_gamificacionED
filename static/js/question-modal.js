let questionModal;
let isAnswering = false;
let currentQuestion = null;

document.addEventListener('DOMContentLoaded', () => {
    const modalElement = document.getElementById('qModal');
    if (modalElement) {
        questionModal = new bootstrap.Modal(modalElement);
    }
});


// 🔥 TRIGGER PRINCIPAL
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


// 🔥 RENDER MODAL (Bootstrap real)
function showQuestionModal(question) {
    const modal = document.getElementById('qModal');

    const textEl = modal.querySelector('#q-text');
    const optionsEl = modal.querySelector('#q-options');

    if (!textEl || !optionsEl) {
        console.error("❌ No se encontraron elementos del modal");
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


// 🔥 VALIDACIÓN CENTRAL
async function submitAnswer(answer) {

    if (!currentQuestion) return;

    const correct = currentQuestion.correct_answer;

    if (answer === correct) {
        alert("correcto :)");;

    } else {
        alert("❌ Incorrecto");

        // penalización real
        await moveBack(localPlayer.player_id, 2);
    }

    // liberar estado
    isAnswering = false;
    currentQuestion = null;

    questionModal.hide();
}


// 🔥 PENALIZACIÓN
async function moveBack(playerId, steps) {
    try {
        await api.movePlayer(sessionId, playerId, -steps);
    } catch (err) {
        console.error("Error en penalización:", err);
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
