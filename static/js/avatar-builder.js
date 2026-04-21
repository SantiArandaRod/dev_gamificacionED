// Definición global del estado del avatar para el jugador local
let avatarConfig = {
    skin_color: "#ffdbac",
    face_shape: "circle", // circle, square, rounded
    accessory: "none" // none, glasses, hat, crown, graduation
};

// Función principal para generar el string SVG completo
function generateAvatarSVG(config) {
    const { skin_color, face_shape, accessory } = config;

    // Definición de las formas de la cara
    let faceSVG = '';
    switch (face_shape) {
        case 'square': faceSVG = `<rect x="10" y="10" width="80" height="80" rx="5" fill="${skin_color}" stroke="#000" stroke-width="2"/>`; break;
        case 'rounded': faceSVG = `<rect x="10" y="10" width="80" height="80" rx="25" fill="${skin_color}" stroke="#000" stroke-width="2"/>`; break;
        default: // circle
            faceSVG = `<circle cx="50" cy="50" r="40" fill="${skin_color}" stroke="#000" stroke-width="2"/>`;
    }

    // Elementos fijos: Ojos y Boca simple
    const featuresSVG = `
        <circle cx="35" cy="40" r="4" fill="#000"/>
        <circle cx="65" cy="40" r="4" fill="#000"/>
        <path d="M 35 65 C 40 70, 60 70, 65 65" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/>
    `;

    // Lógica de Accesorios (SVG simples pero reconocibles)
    let accessorySVG = '';
    switch (accessory) {
        case 'glasses':
            accessorySVG = `<path d="M 25 40 Q 35 30, 45 40 M 55 40 Q 65 30, 75 40 M 45 40 L 55 40" stroke="#000" stroke-width="3" fill="none"/>`;
            break;
        case 'hat':
            accessorySVG = `<rect x="15" y="5" width="70" height="15" rx="3" fill="#333"/><rect x="25" y="-10" width="50" height="20" rx="3" fill="#333"/>`;
            break;
        case 'crown':
            accessorySVG = `<path d="M 20 20 L 30 5 L 40 20 L 50 5 L 60 20 L 70 5 L 80 20 L 80 40 L 20 40 Z" fill="#f1c40f" stroke="#b7950b" stroke-width="2"/>`;
            break;
        case 'graduation':
            accessorySVG = `<path d="M 10 20 L 50 5 L 90 20 L 50 35 Z" fill="#2c3e50"/><path d="M 90 20 L 90 40" stroke="#f1c40f" stroke-width="3"/>`;
            break;
    }

    // Unimos all en el contenedor SVG
    return `
        <svg viewBox="0 0 100 100" width="100%" height="100%">
            ${faceSVG}
            ${featuresSVG}
            ${accessorySVG}
        </svg>
    `;
}

// Lógica para el Lobby (DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('avatar-svg-container');
    const inputs = ['skin_color', 'face_shape', 'accessory'];

    if (container) {
        // Función interna para actualizar la vista previa
        const updatePreview = () => {
            // Actualizamos la configuración global
            inputs.forEach(id => {
                avatarConfig[id] = document.getElementById(id).value;
            });
            // Renderizamos el SVG en el contenedor
            container.innerHTML = generateAvatarSVG(avatarConfig);
        };

        // Asignamos eventos 'change' o 'input' a todos los controles
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('change', updatePreview);
            // Para el color, usamos 'input' para feedback en tiempo real
            if (id === 'skin_color') document.getElementById(id).addEventListener('input', updatePreview);
        });

        // Renderizado inicial
        updatePreview();
    }
});