// Variable para la instancia del modal de Bootstrap
let questionModal;

document.addEventListener('DOMContentLoaded', () => {
    // Inicializamos el modal de Bootstrap una sola vez
    const modalElement = document.getElementById('qModal');
    if (modalElement) {
        questionModal = new bootstrap.Modal(modalElement);
    }
});

async function triggerQuestion(questionId) {
    if (!questionId) return;

    try {
        // 1. Buscamos la pregunta en el estado global que ya cargó el tablero
        // O hacemos un fetch directo si prefieres
        const response = await fetch(`/api/questions/${questionId}`);
        const question = await response.json();

        if (!question) throw new Error("Pregunta no encontrada");

        // 2. Llenar el contenido del modal
        document.getElementById('q-text').innerText = question.text;
        const optionsContainer = document.getElementById('q-options');
        optionsContainer.innerHTML = ''; // Limpiar opciones anteriores

        question.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline-info text-white py-3 fw-bold';
            btn.innerText = option;

            btn.onclick = () => {
                checkAnswer(option, question.correct_answer);
            };

            optionsContainer.appendChild(btn);
        });

        // 3. ¡MOSTRAR EL MODAL!
        if (questionModal) {
            questionModal.show();
        } else {
            // Fallback si por alguna razón no se inicializó en el DOMContentLoaded
            questionModal = new bootstrap.Modal(document.getElementById('qModal'));
            questionModal.show();
        }

    } catch (error) {
        console.error("Error al cargar la pregunta:", error);
    }
}

function checkAnswer(selected, correct) {
    if (selected === correct) {
        alert("¡CORRECTO! Ingeniero.");
        questionModal.hide();
        // Aquí podrías añadir lógica para dar puntos o permitir seguir moviendo
    } else {
        alert(`INCORRECTO. La respuesta era: ${correct}`);
        questionModal.hide();
        // Lógica de penalización (ej. volver a la casilla anterior)
    }
}