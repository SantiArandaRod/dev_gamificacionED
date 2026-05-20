# Contexto para Codex — Sistema de Editor de Avatares SVG

## Objetivo general
Implementar un editor de avatares estilo Xbox 360 / Wii Mii, **enfocado solo en la cara**,
usando **SVG dinámico** (sin PNGs). El usuario elige partes, colores y accesorios; el resultado
se guarda como un JSON estructurado asociado al jugador.

El proyecto ya existe en FastAPI (PyCharm). **No crear el proyecto desde cero.** Solo agregar
los archivos indicados e integrarlos con los existentes.

---

## Estructura del proyecto existente

```
dev_gamificacionED/
├── app/
│   ├── data/
│   │   └── questions.json          ← ya existe
│   ├── models/
│   │   ├── __init__.py
│   │   ├── avatar.py               ← ya existe (probablemente vacío o básico)
│   │   ├── board.py
│   │   ├── player.py               ← ya existe, agregar campo avatar_data
│   │   ├── question.py
│   │   └── session.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── board.py
│   │   ├── questions.py
│   │   └── session.py
│   ├── services/
│   │   └── game_service.py
│   ├── game_state.py
│   └── main.py
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js
│   │   ├── avatar-builder.js       ← ya existe (probablemente vacío o básico)
│   │   ├── board.js
│   │   └── question-modal.js
│   ├── game.html
│   └── index.html
└── .gitignore
```

---

## Archivos a CREAR (nuevos)

### 1. `app/data/avatar_parts.json`
Catálogo completo de partes del avatar. Debe contener estas categorías con al menos
3-5 opciones por categoría:

```json
{
  "skin_colors": [
    {"id": "skin_1", "label": "Claro",     "hex": "#FDDBB4"},
    {"id": "skin_2", "label": "Medio",     "hex": "#D4956A"},
    {"id": "skin_3", "label": "Canela",    "hex": "#C68642"},
    {"id": "skin_4", "label": "Oscuro",    "hex": "#8D5524"},
    {"id": "skin_5", "label": "Muy oscuro","hex": "#4A2912"}
  ],
  "head_shapes": [
    {"id": "head_round",   "label": "Redonda",    "svg_path": "..."},
    {"id": "head_oval",    "label": "Ovalada",    "svg_path": "..."},
    {"id": "head_square",  "label": "Cuadrada",   "svg_path": "..."},
    {"id": "head_heart",   "label": "Corazón",    "svg_path": "..."}
  ],
  "eyes": [
    {"id": "eyes_normal",  "label": "Normal",     "svg_group": "..."},
    {"id": "eyes_big",     "label": "Grandes",    "svg_group": "..."},
    {"id": "eyes_small",   "label": "Pequeños",   "svg_group": "..."},
    {"id": "eyes_almond",  "label": "Almendra",   "svg_group": "..."},
    {"id": "eyes_round",   "label": "Redondos",   "svg_group": "..."}
  ],
  "eye_colors": [
    {"id": "eye_brown",  "label": "Café",    "hex": "#5C3317"},
    {"id": "eye_black",  "label": "Negro",   "hex": "#1A1A1A"},
    {"id": "eye_green",  "label": "Verde",   "hex": "#2D6E4F"},
    {"id": "eye_blue",   "label": "Azul",    "hex": "#2756B1"},
    {"id": "eye_hazel",  "label": "Avellana","hex": "#8B6914"}
  ],
  "eyebrows": [
    {"id": "brow_flat",   "label": "Rectas",    "svg_group": "..."},
    {"id": "brow_arched", "label": "Arqueadas", "svg_group": "..."},
    {"id": "brow_thick",  "label": "Gruesas",   "svg_group": "..."},
    {"id": "brow_thin",   "label": "Delgadas",  "svg_group": "..."}
  ],
  "eyebrow_colors": [
    {"id": "brow_black",  "hex": "#1A1A1A"},
    {"id": "brow_brown",  "hex": "#5C3317"},
    {"id": "brow_blonde", "hex": "#C8A96E"},
    {"id": "brow_gray",   "hex": "#999999"}
  ],
  "noses": [
    {"id": "nose_button",   "label": "Respingada", "svg_group": "..."},
    {"id": "nose_normal",   "label": "Normal",     "svg_group": "..."},
    {"id": "nose_wide",     "label": "Ancha",      "svg_group": "..."},
    {"id": "nose_pointed",  "label": "Puntiaguda", "svg_group": "..."}
  ],
  "mouths": [
    {"id": "mouth_smile",    "label": "Sonrisa",    "svg_group": "..."},
    {"id": "mouth_neutral",  "label": "Neutral",    "svg_group": "..."},
    {"id": "mouth_wide",     "label": "Amplia",     "svg_group": "..."},
    {"id": "mouth_small",    "label": "Pequeña",    "svg_group": "..."}
  ],
  "mouth_colors": [
    {"id": "lip_natural", "hex": "#C46E6E"},
    {"id": "lip_red",     "hex": "#C0392B"},
    {"id": "lip_nude",    "hex": "#D4956A"},
    {"id": "lip_dark",    "hex": "#8B2252"}
  ],
  "accessories": [
    {"id": "acc_none",       "label": "Ninguno",      "svg_group": null},
    {"id": "acc_glasses_r",  "label": "Gafas redondas","svg_group": "..."},
    {"id": "acc_glasses_sq", "label": "Gafas cuadradas","svg_group": "..."},
    {"id": "acc_monocle",    "label": "Monóculo",     "svg_group": "..."},
    {"id": "acc_eyepatch",   "label": "Parche",       "svg_group": "..."},
    {"id": "acc_freckles",   "label": "Pecas",        "svg_group": "..."},
    {"id": "acc_blush",      "label": "Rubor",        "svg_group": "..."},
    {"id": "acc_scar",       "label": "Cicatriz",     "svg_group": "..."},
    {"id": "acc_earrings",   "label": "Aretes",       "svg_group": "..."}
  ]
}
```

> **Nota para Codex**: los valores `"svg_group"` y `"svg_path"` deben ser strings SVG
> inline reales (e.g. `"<path d='M...' .../>"`). Crear formas coherentes y bonitas.
> El viewBox del avatar completo es `0 0 200 220`.

---

### 2. `app/routes/avatar.py` (nuevo route)

```python
# Endpoints requeridos:

GET  /avatar/parts          → devuelve todo avatar_parts.json
GET  /avatar/{player_id}    → devuelve el avatar guardado del jugador
POST /avatar/{player_id}    → guarda/actualiza el avatar del jugador
GET  /avatar/{player_id}/svg → devuelve el SVG renderizado como string
```

El avatar se guarda como JSON en el modelo `Player` (campo `avatar_data: dict`).

---

### 3. Actualizar `app/models/avatar.py`

Crear el schema Pydantic:

```python
from pydantic import BaseModel
from typing import Optional

class AvatarData(BaseModel):
    skin_color: str = "skin_1"
    head_shape: str = "head_round"
    eye_type: str = "eyes_normal"
    eye_color: str = "eye_brown"
    eyebrow_type: str = "brow_flat"
    eyebrow_color: str = "brow_black"
    nose_type: str = "nose_normal"
    mouth_type: str = "mouth_smile"
    mouth_color: str = "lip_natural"
    accessory: str = "acc_none"
    # extras para futuro
    extra: Optional[dict] = {}
```

---

### 4. Actualizar `app/models/player.py`

Agregar campo al modelo `Player` existente:

```python
avatar_data: dict = {}   # Almacena AvatarData serializado
```

---

### 5. `static/js/avatar-builder.js` (reescribir completo)

Este es el archivo más importante. Debe implementar:

#### Clase `AvatarBuilder`
```javascript
class AvatarBuilder {
    constructor(svgContainerId, options = {}) { ... }

    // Carga el catálogo de partes desde /avatar/parts
    async loadParts() { ... }

    // Renderiza el SVG completo del avatar
    render() { ... }

    // Cambia una parte específica
    setPart(category, partId) { ... }

    // Cambia un color
    setColor(category, hex) { ... }

    // Devuelve el estado actual como objeto AvatarData
    getAvatarData() { ... }

    // Carga un AvatarData existente y lo renderiza
    loadAvatarData(data) { ... }

    // Exporta el SVG como string (para guardar en backend)
    exportSVG() { ... }
}
```

#### Estructura del SVG renderizado (viewBox `0 0 200 220`)
Las capas deben renderizarse en este orden (de atrás hacia adelante):
1. Fondo/sombra suave
2. Forma de cabeza (con color de piel)
3. Orejas (con color de piel)
4. Ojos (sclera blanca + iris con color elegido + pupila)
5. Cejas (con color elegido)
6. Nariz
7. Boca (con color de labios)
8. Accesorio (gafas, pecas, rubor, etc.)

#### UI del editor (dentro de avatar-builder.js o en index.html)
- Panel izquierdo: vista previa SVG del avatar (actualización en tiempo real)
- Panel derecho: pestañas o secciones por categoría
  - Color de piel (paleta de círculos de color)
  - Forma de cabeza (thumbnails SVG pequeños)
  - Ojos (thumbnails)
  - Cejas (thumbnails)
  - Nariz (thumbnails)
  - Boca (thumbnails)
  - Accesorios (thumbnails con toggle)
- Botón "Guardar avatar" → llama a `POST /avatar/{player_id}`
- Botón "Aleatorio" → selecciona partes al azar

#### Interacción
- Al hacer clic en una opción → `setPart()` → `render()` → vista previa actualiza
- Sin recargar página, sin parpadeos
- El SVG se actualiza manipulando directamente los elementos del DOM

---

### 6. `static/index.html` (agregar sección)

Agregar dentro del HTML existente la pantalla/modal de edición de avatar.
No reemplazar el index.html completo; solo agregar la sección del editor.

```html
<!-- Sección Avatar Builder -->
<div id="avatar-editor" class="avatar-editor hidden">
  <div class="avatar-preview-panel">
    <div id="avatar-svg-container"><!-- SVG renderizado aquí --></div>
    <button id="btn-random-avatar">🎲 Aleatorio</button>
    <button id="btn-save-avatar">Guardar avatar</button>
  </div>
  <div class="avatar-options-panel">
    <!-- Las pestañas/categorías se generan dinámicamente desde avatar-builder.js -->
    <div id="avatar-categories"></div>
  </div>
</div>
```

---

### 7. `static/css/style.css` (agregar estilos)

Agregar al CSS existente los estilos para:
- `.avatar-editor` — layout de dos paneles (flex)
- `.avatar-preview-panel` — panel izquierdo con el SVG
- `.avatar-options-panel` — panel derecho con opciones
- `.part-option` — cada opción seleccionable (borde destacado al seleccionar)
- `.part-option.selected` — estado activo
- `.color-dot` — círculo de color seleccionable
- `.color-dot.selected` — borde activo
- `.avatar-tab` — pestañas de categorías
- Transición suave al cambiar partes

---

### 8. `app/services/avatar_service.py` (nuevo, opcional pero recomendado)

```python
import json
from pathlib import Path

PARTS_FILE = Path(__file__).parent.parent / "data" / "avatar_parts.json"

def get_parts_catalog() -> dict:
    with open(PARTS_FILE) as f:
        return json.load(f)

def render_avatar_svg(avatar_data: dict, parts_catalog: dict) -> str:
    """
    Construye el SVG completo del avatar a partir de avatar_data.
    Útil para generar SVG desde el backend (e.g. para el tablero/ranking).
    Devuelve el string SVG completo.
    """
    ...
```

---

### 9. Registrar el nuevo router en `app/main.py`

```python
from app.routes import avatar as avatar_router

app.include_router(avatar_router.router, prefix="/avatar", tags=["avatar"])
```

---

## Resumen de archivos a tocar

| Archivo | Acción |
|---|---|
| `app/data/avatar_parts.json` | CREAR — catálogo SVG |
| `app/models/avatar.py` | REESCRIBIR — Pydantic schema |
| `app/models/player.py` | MODIFICAR — agregar `avatar_data` |
| `app/routes/avatar.py` | CREAR — 4 endpoints REST |
| `app/services/avatar_service.py` | CREAR — lógica de negocio |
| `app/main.py` | MODIFICAR — registrar router |
| `static/js/avatar-builder.js` | REESCRIBIR — clase AvatarBuilder + UI |
| `static/index.html` | MODIFICAR — agregar sección editor |
| `static/css/style.css` | MODIFICAR — agregar estilos del editor |

---

## Restricciones técnicas

- **Sin imágenes PNG**. Todo visual es SVG inline.
- **Sin librerías externas** para el SVG (vanilla JS puro).
- **Python** ≥ 3.9. FastAPI con Pydantic v2.
- **El SVG del avatar** usa `viewBox="0 0 200 220"` en todos los lugares.
- Cada parte SVG es un `<g>` autocontenido que se inserta/reemplaza en el SVG principal.
- Los colores de piel, ojos, cejas y labios se aplican con `fill` dinámico sobre los paths correspondientes.
- El archivo `avatar_parts.json` contiene los SVG paths como strings; el JS los inserta con `innerHTML` o `insertAdjacentHTML`.
- **No usar `document.write`** ni `eval`.
- Los endpoints de FastAPI devuelven `JSONResponse` o `HTMLResponse` según corresponda.
- El endpoint `GET /avatar/{player_id}/svg` devuelve `Content-Type: image/svg+xml`.

---

## Orden de implementación sugerido para Codex

1. `avatar_parts.json` — diseñar todas las formas SVG de las partes
2. `app/models/avatar.py` — Pydantic schema
3. `app/models/player.py` — agregar campo
4. `app/routes/avatar.py` + `app/services/avatar_service.py`
5. `app/main.py` — registrar router
6. `static/js/avatar-builder.js` — clase AvatarBuilder con render
7. `static/css/style.css` — estilos del editor
8. `static/index.html` — sección del editor
9. Probar endpoint a endpoint con el servidor corriendo (`uvicorn app.main:app --reload`)

---

## Prompt sugerido para darle a Codex (copiar y pegar)

```
Implementa el sistema de editor de avatares SVG descrito en CODEX_AVATAR_CONTEXT.md
para el proyecto FastAPI existente. Sigue el orden de implementación indicado.

Prioridades:
1. Las formas SVG de avatar_parts.json deben ser expresivas y visualmente distintas
   entre sí — no todas iguales con pequeñas variaciones.
2. La clase AvatarBuilder debe actualizar el SVG en tiempo real sin recargar.
3. Los endpoints FastAPI deben manejar correctamente el caso en que el jugador
   no tenga avatar guardado (devolver AvatarData con valores por defecto).
4. Todos los archivos existentes se modifican de forma no destructiva
   (no borrar lógica existente, solo agregar).

Empieza por avatar_parts.json con los paths SVG completos.
```
