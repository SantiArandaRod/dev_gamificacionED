# Variables al azar — S3E

> Juego de gamificación para Ecuaciones Diferenciales, estilo Serpientes y Escaleras.  
> Diseñado para partidas locales en laptop, hasta 4 jugadores, sin cuentas ni registro.

---

## Descripción

**Variables al azar - S3E** es una aplicación web educativa que convierte el repaso de Ecuaciones Diferenciales en una experiencia de juego competitiva. Los jugadores avanzan en un tablero 5×5 respondiendo preguntas de la materia: las respuestas correctas suben por escaleras, las incorrectas bajan por serpientes.

Las preguntas están organizadas por corte académico (dificultad), el estado del juego vive completamente en el navegador y la validación de respuestas ocurre en el backend para evitar trampas.

---

## Características

- **Hasta 4 jugadores** en el mismo dispositivo (hot seat)
- **Avatares SVG personalizables** — tono de piel, cabello, ojos, nariz, boca, accesorios
- **Dado virtual animado** con mecánica de drag & drop para mover fichas
- **Serpientes y escaleras** adaptadas al tablero 1–25 (recorrido Boustrophedon)
- **75 preguntas** de Ecuaciones Diferenciales (25 por corte académico)
- **Validación segura** — las respuestas correctas nunca se exponen al cliente
- **Estado persistente** — si recargas, la partida continúa desde donde estaba
- **Podio final** con ranking y animación de confeti
- **100% local** — sin cuentas, sin sesiones de servidor, sin base de datos

---

## Estructura del proyecto

```
dev_gamificacionED/
├── app/
│   ├── data/
│   │   ├── questions.json          # Banco de 75 preguntas
│   │   └── avatar_parts.json       # Catálogo SVG de partes de avatar
│   ├── models/
│   │   ├── avatar.py
│   │   └── board.py
│   ├── routes/
│   │   ├── avatar.py
│   │   └── questions.py            # GET /api/questions, POST /api/validate
│   └── services/
│       └── avatar_service.py
├── static/
│   ├── index.html                  # Pantalla de bienvenida
│   ├── rules.html                  # Reglas + selector de dificultad
│   ├── players.html                # Registro de jugadores
│   ├── avatar.html                 # Editor de avatares
│   ├── game.html                   # Tablero principal
│   ├── podium.html                 # Podio final
│   └── js/
│       ├── board.js
│       ├── question-modal.js
│       └── avatar-builder.js
└── main.py
```

---

## Instalación y uso

### Requisitos

- Python 3.10+
- pip

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/dev_gamificacionED.git
cd dev_gamificacionED

# 2. Crear entorno virtual
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Correr el servidor
uvicorn main:app --reload

# 5. Abrir en el navegador
# http://localhost:8000
```

---

## Flujo del juego

```
Bienvenida → Reglas + Dificultad → Registro de jugadores → Avatares → Tablero → Podio
```

1. **Bienvenida** — animación de entrada, botón para iniciar.
2. **Reglas** — se muestra la regla del juego y se elige la dificultad (corte 1 / 2 / 3).
3. **Jugadores** — se registran los nombres (2–4 jugadores). Cada uno recibe un color de ficha.
4. **Avatares** — cada jugador personaliza su avatar SVG uno por uno.
5. **Tablero** — se juega. El dado se lanza, la ficha se arrastra al destino, se responde la pregunta.
6. **Podio** — cuando alguien llega exactamente a la casilla 25, se muestra el ranking final.

### Mecánica de turno

| Evento | Resultado |
|---|---|
| Respuesta correcta | +10 puntos, ficha avanza |
| Respuesta incorrecta | −10 puntos, ficha regresa al origen |
| Caer en base de escalera (acierto) | Sube automáticamente |
| Estar en cabeza de serpiente (fallo) | Baja automáticamente |
| Dado supera casilla 25 | No se mueve, turno pasa |
| Llegar exactamente a casilla 25 | Victoria (requiere acierto) |

---

## Seguridad de preguntas

El backend **nunca expone la respuesta correcta** al cliente. El frontend solo recibe:
`question_id`, `text`, `options`, `academic_cut`, `subject`, `difficulty`.

La validación ocurre siempre vía `POST /api/validate` — imposible hacer trampa desde la consola del navegador.

---

## Endpoints de la API

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/questions?difficulty=easy` | Preguntas filtradas por dificultad (`easy`, `medium`, `hard`) |
| `POST` | `/api/validate` | Valida una respuesta. Body: `{ "question_id": "1-1", "answer": "B" }` |

**Respuesta de validación:**
```json
{ "correct": true }
```

---

## Diseño

Paleta **Retro Arcade**:

| Elemento | Color |
|---|---|
| Fondo general | `#1A1A2E` |
| Superficies | `#16213E` |
| Escaleras | `#F39C12` — dorado eléctrico |
| Serpientes | `#00FF66` — verde neón |
| Ficha 1 | `#00FFFF` — cian |
| Ficha 2 | `#FF00FF` — magenta |
| Ficha 3 | `#FFE600` — amarillo |
| Ficha 4 | `#39FF14` — verde |

---

## Banco de preguntas

Las 75 preguntas están en `app/data/questions.json` con el siguiente formato:

```json
{
  "question_id": "1-1",
  "text": "¿Qué es una ecuación diferencial?",
  "options": ["Una ecuación algebraica", "Una ecuación con derivadas", "Una integral", "Una matriz"],
  "correct_answer": "Una ecuación con derivadas",
  "academic_cut": 1,
  "subject": "Ecuaciones Diferenciales",
  "difficulty": "easy"
}
```

| Dificultad | Corte académico | Preguntas |
|---|---|---|
| Fácil | 1 | 25 |
| Medio | 2 | 25 |
| Difícil | 3 | 25 |

---

## Regla del juego

> **"Disfrutar y ser Honesto"**

## Code team and devs
Equipo
@SantiArandaRod & @juanesgonzalezvega & Codex GPT 5.5 — Medium mode


---

## 📄 Licencia

MIT — libre para uso educativo.
