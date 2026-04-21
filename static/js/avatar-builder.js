const avatarContainer = document.getElementById('avatar-svg-container');
const inputs = ['skin_color', 'face_shape', 'accessory'];

const config = {
    skin_color: "#ffdbac",
    face_shape: "circle",
    accessory: "none",
    hair_color: "#4a2c2a", // Valores por defecto para el MVP
    bg_color: "#e0e0e0",
    eyes_style: "normal",
    mouth_style: "smile"
};

function renderAvatar() {
    const { skin_color, face_shape, accessory } = config;

    // Definición de formas de cara
    const shapes = {
        circle: `<circle cx="50" cy="50" r="40" fill="${skin_color}" />`,
        square: `<rect x="15" y="15" width="70" height="70" rx="10" fill="${skin_color}" />`,
        rounded: `<rect x="20" y="15" width="60" height="70" rx="25" fill="${skin_color}" />`
    };

    // Definición de accesorios (posiciones simplificadas)
    const accessories = {
        none: '',
        glasses: `<path d="M30 45 h10 M60 45 h10" stroke="black" stroke-width="3"/><rect x="25" y="40" width="20" height="15" fill="none" stroke="black"/><rect x="55" y="40" width="20" height="15" fill="none" stroke="black"/>`,
        crown: `<path d="M20 30 L30 10 L50 25 L70 10 L80 30 Z" fill="gold" stroke="#b8860b"/>`,
        graduation: `<rect x="20" y="10" width="60" height="10" fill="black"/><path d="M50 10 L50 30" stroke="black"/>`
    };

    const svg = `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="${config.bg_color}" />
            ${shapes[face_shape]}
            <circle cx="35" cy="45" r="3" fill="black" />
            <circle cx="65" cy="45" r="3" fill="black" />
            <path d="M40 65 Q50 75 60 65" stroke="black" fill="none" stroke-width="2" />
            ${accessories[accessory]}
        </svg>
    `;

    avatarContainer.innerHTML = svg;
}

// Listeners para actualizar en tiempo real
inputs.forEach(id => {
    document.getElementById(id).addEventListener('input', (e) => {
        config[id] = e.target.value;
        renderAvatar();
    });
});

// Inicializar
renderAvatar();