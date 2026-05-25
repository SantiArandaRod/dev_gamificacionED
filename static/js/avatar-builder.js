const AVATAR_DEFAULTS = {
    skin_color: "skin_1",
    head_shape: "head_round",
    hair_style: "hair_short",
    hair_color: "hair_black",
    eye_type: "eyes_normal",
    eye_color: "eye_brown",
    eyebrow_type: "brow_flat",
    eyebrow_color: "brow_black",
    nose_type: "nose_normal",
    mouth_type: "mouth_smile",
    mouth_color: "lip_natural",
    accessory: "acc_none",
    extra: {}
};

var avatarConfig = { ...AVATAR_DEFAULTS };

const AVATAR_CATEGORY_CONFIG = [
    { key: "skin_color", title: "Color de piel", catalog: "skin_colors", type: "color" },
    { key: "head_shape", title: "Forma de cabeza", catalog: "head_shapes", type: "part" },
    { key: "hair_style", title: "Pelo", catalog: "hair_styles", type: "part" },
    { key: "hair_color", title: "Color de pelo", catalog: "hair_colors", type: "color" },
    { key: "eye_type", title: "Ojos", catalog: "eyes", type: "part" },
    { key: "eye_color", title: "Color de ojos", catalog: "eye_colors", type: "color" },
    { key: "eyebrow_type", title: "Cejas", catalog: "eyebrows", type: "part" },
    { key: "eyebrow_color", title: "Color de cejas", catalog: "eyebrow_colors", type: "color" },
    { key: "nose_type", title: "Nariz", catalog: "noses", type: "part" },
    { key: "mouth_type", title: "Boca", catalog: "mouths", type: "part" },
    { key: "mouth_color", title: "Color de boca", catalog: "mouth_colors", type: "color" },
    { key: "accessory", title: "Accesorios", catalog: "accessories", type: "part" }
];

class AvatarBuilder {
    constructor(svgContainerId, options = {}) {
        this.container = document.getElementById(svgContainerId);
        this.options = options;
        this.parts = null;
        this.state = { ...AVATAR_DEFAULTS, ...(options.initialData || {}) };
        this.svg = null;
        this.layers = {};
        this.categoriesContainer = document.getElementById(options.categoriesContainerId || "avatar-categories");
        this.statusElement = document.getElementById(options.statusElementId || "avatar-save-status");
    }

    async loadParts() {
        const res = await fetch("/avatar/parts");
        if (!res.ok) throw new Error("No se pudo cargar el catalogo de avatar");
        this.parts = await res.json();
        this.state = this.normalizeAvatarData(this.state);
        AvatarBuilder.partsCache = this.parts;
        sessionStorage.setItem("avatar_parts_catalog", JSON.stringify(this.parts));
        return this.parts;
    }

    initSVG() {
        if (!this.container || this.svg) return;

        this.container.innerHTML = `
            <svg class="avatar-svg" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Avatar">
                <style id="avatar-dynamic-style"></style>
                <ellipse id="avatar-shadow" cx="100" cy="196" rx="55" ry="12" fill="rgba(0,0,0,0.18)"></ellipse>
                <g id="avatar-ears"></g>
                <g id="avatar-head"></g>
                <g id="avatar-hair"></g>
                <g id="avatar-eyes"></g>
                <g id="avatar-eyebrows"></g>
                <g id="avatar-nose"></g>
                <g id="avatar-mouth"></g>
                <g id="avatar-accessory"></g>
            </svg>
        `;

        this.svg = this.container.querySelector("svg");
        this.layers = {
            style: this.svg.querySelector("#avatar-dynamic-style"),
            ears: this.svg.querySelector("#avatar-ears"),
            head: this.svg.querySelector("#avatar-head"),
            hair: this.svg.querySelector("#avatar-hair"),
            eyes: this.svg.querySelector("#avatar-eyes"),
            eyebrows: this.svg.querySelector("#avatar-eyebrows"),
            nose: this.svg.querySelector("#avatar-nose"),
            mouth: this.svg.querySelector("#avatar-mouth"),
            accessory: this.svg.querySelector("#avatar-accessory")
        };
    }

    render() {
        if (!this.parts || !this.container) return;
        this.initSVG();

        const skin = this.getColorHex("skin_colors", this.state.skin_color, "skin_1");
        const hair = this.getColorHex("hair_colors", this.state.hair_color, "hair_black");
        const eye = this.getColorHex("eye_colors", this.state.eye_color, "eye_brown");
        const brow = this.getColorHex("eyebrow_colors", this.state.eyebrow_color, "brow_black");
        const mouth = this.getColorHex("mouth_colors", this.state.mouth_color, "lip_natural");

        this.layers.style.textContent = `
            .avatar-skin-fill { fill: ${skin}; }
            .avatar-hair-fill { fill: ${hair}; }
            .avatar-eye-fill { fill: ${eye}; }
            .avatar-brow-fill { fill: ${brow}; }
            .avatar-brow-stroke { stroke: ${brow}; }
            .avatar-mouth-fill { fill: ${mouth}; }
            .avatar-mouth-stroke { stroke: ${mouth}; }
        `;

        this.layers.ears.innerHTML = `
            <ellipse class="avatar-skin-fill" cx="40" cy="112" rx="13" ry="20" stroke="#402819" stroke-width="3"/>
            <ellipse class="avatar-skin-fill" cx="160" cy="112" rx="13" ry="20" stroke="#402819" stroke-width="3"/>
            <path d="M40 105 C34 112 35 122 42 127" fill="none" stroke="#9A6648" stroke-width="2" stroke-linecap="round"/>
            <path d="M160 105 C166 112 165 122 158 127" fill="none" stroke="#9A6648" stroke-width="2" stroke-linecap="round"/>
        `;
        this.layers.head.innerHTML = this.getPart("head_shapes", this.state.head_shape, "head_round").svg_path || "";
        this.layers.hair.innerHTML = this.getPart("hair_styles", this.state.hair_style, "hair_short").svg_group || "";
        this.layers.eyes.innerHTML = this.getPart("eyes", this.state.eye_type, "eyes_normal").svg_group || "";
        this.layers.eyebrows.innerHTML = this.getPart("eyebrows", this.state.eyebrow_type, "brow_flat").svg_group || "";
        this.layers.nose.innerHTML = this.getPart("noses", this.state.nose_type, "nose_normal").svg_group || "";
        this.layers.mouth.innerHTML = this.getPart("mouths", this.state.mouth_type, "mouth_smile").svg_group || "";
        this.layers.accessory.innerHTML = this.getPart("accessories", this.state.accessory, "acc_none").svg_group || "";

        this.applyDynamicColors({ skin, hair, eye, brow, mouth });

        avatarConfig = this.getAvatarData();
        this.updateSelectedOptions();
    }

    applyDynamicColors(colors) {
        this.paint(".avatar-skin-fill", "fill", colors.skin);
        this.paint(".avatar-hair-fill", "fill", colors.hair);
        this.paint(".avatar-eye-fill", "fill", colors.eye);
        this.paint(".avatar-brow-fill", "fill", colors.brow);
        this.paint(".avatar-brow-stroke", "stroke", colors.brow);
        this.paint(".avatar-mouth-fill", "fill", colors.mouth);
        this.paint(".avatar-mouth-stroke", "stroke", colors.mouth);
    }

    paint(selector, property, value) {
        this.svg.querySelectorAll(selector).forEach(element => {
            element.setAttribute(property, value);
            element.style.setProperty(property, value, "important");
        });
    }

    setPart(category, partId) {
        if (!Object.prototype.hasOwnProperty.call(this.state, category)) return;
        this.state[category] = partId;
        this.render();
    }

    setColor(category, hex) {
        const config = AVATAR_CATEGORY_CONFIG.find(item => item.key === category);
        if (!config || config.type !== "color") return;
        const item = (this.parts[config.catalog] || []).find(option => option.hex.toLowerCase() === hex.toLowerCase());
        this.state[category] = item ? item.id : this.state[category];
        this.render();
    }

    getAvatarData() {
        return { ...AVATAR_DEFAULTS, ...this.state, extra: this.state.extra || {} };
    }

    loadAvatarData(data) {
        this.state = this.normalizeAvatarData(data || {});
        this.render();
    }

    exportSVG() {
        return this.svg ? this.svg.outerHTML : generateAvatarSVG(this.getAvatarData());
    }

    renderEditorUI() {
        if (!this.categoriesContainer || !this.parts) return;
        this.categoriesContainer.innerHTML = "";

        AVATAR_CATEGORY_CONFIG.forEach(category => {
            const section = document.createElement("section");
            section.className = "avatar-category";
            section.dataset.category = category.key;

            const title = document.createElement("button");
            title.type = "button";
            title.className = "avatar-tab";
            title.textContent = category.title;

            const options = document.createElement("div");
            options.className = category.type === "color" ? "avatar-color-grid" : "avatar-part-grid";

            (this.parts[category.catalog] || []).forEach(part => {
                const option = category.type === "color"
                    ? this.createColorOption(category, part)
                    : this.createPartOption(category, part);
                options.appendChild(option);
            });

            section.appendChild(title);
            section.appendChild(options);
            this.categoriesContainer.appendChild(section);
        });

        this.updateSelectedOptions();
    }

    createColorOption(category, part) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "color-dot";
        button.dataset.category = category.key;
        button.dataset.partId = part.id;
        button.title = part.label || part.id;
        button.style.backgroundColor = part.hex;
        button.addEventListener("click", () => this.setColor(category.key, part.hex));
        return button;
    }

    createPartOption(category, part) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "part-option";
        button.dataset.category = category.key;
        button.dataset.partId = part.id;
        button.innerHTML = `
            <span class="part-thumb">${this.renderThumbnail(category, part)}</span>
            <span class="part-label">${part.label || part.id}</span>
        `;
        button.addEventListener("click", () => this.setPart(category.key, part.id));
        return button;
    }

    renderThumbnail(category, part) {
        const skin = this.getColorHex("skin_colors", this.state.skin_color, "skin_1");
        const hair = this.getColorHex("hair_colors", this.state.hair_color, "hair_black");
        const eye = this.getColorHex("eye_colors", this.state.eye_color, "eye_brown");
        const brow = this.getColorHex("eyebrow_colors", this.state.eyebrow_color, "brow_black");
        const mouth = this.getColorHex("mouth_colors", this.state.mouth_color, "lip_natural");
        const content = part.svg_path || part.svg_group || "<circle cx='100' cy='110' r='18' fill='none' stroke='#9aa3af' stroke-width='5'/>";

        return `
            <svg viewBox="0 0 200 220" aria-hidden="true">
                <style>
                    .avatar-skin-fill { fill: ${skin}; }
                    .avatar-hair-fill { fill: ${hair}; }
                    .avatar-eye-fill { fill: ${eye}; }
                    .avatar-brow-fill { fill: ${brow}; }
                    .avatar-brow-stroke { stroke: ${brow}; }
                    .avatar-mouth-fill { fill: ${mouth}; }
                    .avatar-mouth-stroke { stroke: ${mouth}; }
                </style>
                ${content}
            </svg>
        `;
    }

    updateSelectedOptions() {
        if (!this.categoriesContainer) return;
        this.categoriesContainer.querySelectorAll(".part-option, .color-dot").forEach(option => {
            option.classList.toggle("selected", this.state[option.dataset.category] === option.dataset.partId);
        });
    }

    randomize() {
        AVATAR_CATEGORY_CONFIG.forEach(category => {
            const items = this.parts[category.catalog] || [];
            if (!items.length) return;
            const pool = category.key === "accessory" ? items : items.filter(item => item.id !== "acc_none");
            const selected = pool[Math.floor(Math.random() * pool.length)] || items[0];
            this.state[category.key] = selected.id;
        });
        this.render();
    }

    async saveForCurrentPlayer() {
        const player = JSON.parse(sessionStorage.getItem("current_player") || "null");
        if (!player || !player.player_id) {
            this.setStatus("Agrega el jugador para guardar su avatar.");
            return;
        }

        const localGame = JSON.parse(localStorage.getItem("local_game_state") || "null");
        if (localGame?.mode === "local") {
            const saved = this.getAvatarData();
            localGame.players = (localGame.players || []).map(item => {
                if (item.player_id !== player.player_id) return item;
                return { ...item, avatar: saved, avatar_data: saved };
            });
            player.avatar = saved;
            player.avatar_data = saved;
            localStorage.setItem("local_game_state", JSON.stringify(localGame));
            sessionStorage.setItem("current_player", JSON.stringify(player));
            this.setStatus("Avatar guardado localmente.");
            return;
        }

        const res = await fetch(`/avatar/${player.player_id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.getAvatarData())
        });

        if (!res.ok) {
            this.setStatus("No se pudo guardar el avatar.");
            return;
        }

        const saved = await res.json();
        player.avatar = saved;
        player.avatar_data = saved;
        sessionStorage.setItem("current_player", JSON.stringify(player));
        this.setStatus("Avatar guardado.");
    }

    setStatus(message) {
        if (this.statusElement) this.statusElement.textContent = message;
    }

    getPart(category, id, defaultId) {
        const items = this.parts[category] || [];
        return items.find(item => item.id === id) || items.find(item => item.id === defaultId) || {};
    }

    getColorHex(category, id, defaultId) {
        return this.getPart(category, id, defaultId).hex || "#000000";
    }

    normalizeAvatarData(data) {
        return {
            ...AVATAR_DEFAULTS,
            ...(data || {}),
            hair_style: data?.hair_style || AVATAR_DEFAULTS.hair_style,
            hair_color: data?.hair_color || AVATAR_DEFAULTS.hair_color,
            eyebrow_color: data?.eyebrow_color || AVATAR_DEFAULTS.eyebrow_color,
            mouth_color: data?.mouth_color || AVATAR_DEFAULTS.mouth_color,
            extra: data?.extra || {}
        };
    }
}

AvatarBuilder.partsCache = null;

function getCachedAvatarParts() {
    if (AvatarBuilder.partsCache) return AvatarBuilder.partsCache;
    try {
        const cached = sessionStorage.getItem("avatar_parts_catalog");
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.hair_styles && parsed.hair_colors) {
                AvatarBuilder.partsCache = parsed;
                return AvatarBuilder.partsCache;
            }
            sessionStorage.removeItem("avatar_parts_catalog");
        }
    } catch (err) {
        console.warn("No se pudo leer el catalogo de avatar en cache", err);
    }
    return null;
}

function generateAvatarSVG(config = {}) {
    const parts = getCachedAvatarParts();
    const data = { ...AVATAR_DEFAULTS, ...(config.avatar_data || config) };

    if (!parts || !data.head_shape) {
        const skin = config.skin_color || "#FDDBB4";
        return `
            <svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="100" cy="196" rx="55" ry="12" fill="rgba(0,0,0,0.18)"/>
                <circle cx="100" cy="105" r="62" fill="${skin}" stroke="#402819" stroke-width="4"/>
                <circle cx="78" cy="96" r="7" fill="#111"/>
                <circle cx="122" cy="96" r="7" fill="#111"/>
                <path d="M76 146 C88 160 112 160 124 146" fill="none" stroke="#C46E6E" stroke-width="5" stroke-linecap="round"/>
            </svg>
        `;
    }

    const lookup = (category, id, fallback) => {
        const items = parts[category] || [];
        return items.find(item => item.id === id) || items.find(item => item.id === fallback) || {};
    };
    const color = (category, id, fallback) => lookup(category, id, fallback).hex || "#000";

    return `
        <svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
            <style>
                .avatar-skin-fill { fill: ${color("skin_colors", data.skin_color, "skin_1")}; }
                .avatar-hair-fill { fill: ${color("hair_colors", data.hair_color, "hair_black")}; }
                .avatar-eye-fill { fill: ${color("eye_colors", data.eye_color, "eye_brown")}; }
                .avatar-brow-fill { fill: ${color("eyebrow_colors", data.eyebrow_color, "brow_black")}; }
                .avatar-brow-stroke { stroke: ${color("eyebrow_colors", data.eyebrow_color, "brow_black")}; }
                .avatar-mouth-fill { fill: ${color("mouth_colors", data.mouth_color, "lip_natural")}; }
                .avatar-mouth-stroke { stroke: ${color("mouth_colors", data.mouth_color, "lip_natural")}; }
            </style>
            <ellipse cx="100" cy="196" rx="55" ry="12" fill="rgba(0,0,0,0.18)"/>
            <g>
                <ellipse class="avatar-skin-fill" cx="40" cy="112" rx="13" ry="20" stroke="#402819" stroke-width="3"/>
                <ellipse class="avatar-skin-fill" cx="160" cy="112" rx="13" ry="20" stroke="#402819" stroke-width="3"/>
            </g>
            <g>${lookup("head_shapes", data.head_shape, "head_round").svg_path || ""}</g>
            <g>${lookup("hair_styles", data.hair_style, "hair_short").svg_group || ""}</g>
            <g>${lookup("eyes", data.eye_type, "eyes_normal").svg_group || ""}</g>
            <g>${lookup("eyebrows", data.eyebrow_type, "brow_flat").svg_group || ""}</g>
            <g>${lookup("noses", data.nose_type, "nose_normal").svg_group || ""}</g>
            <g>${lookup("mouths", data.mouth_type, "mouth_smile").svg_group || ""}</g>
            <g>${lookup("accessories", data.accessory, "acc_none").svg_group || ""}</g>
        </svg>
    `;
}

document.addEventListener("DOMContentLoaded", async () => {
    const hasEditor = document.getElementById("avatar-categories") && document.getElementById("avatar-svg-container");
    if (!hasEditor) return;

    const builder = new AvatarBuilder("avatar-svg-container", {
        categoriesContainerId: "avatar-categories",
        statusElementId: "avatar-save-status"
    });

    window.avatarBuilder = builder;

    try {
        await builder.loadParts();
        builder.renderEditorUI();
        builder.render();
    } catch (err) {
        console.error(err);
        builder.setStatus("No se pudo cargar el editor de avatar.");
    }

    document.getElementById("btn-random-avatar")?.addEventListener("click", () => builder.randomize());
    document.getElementById("btn-save-avatar")?.addEventListener("click", () => builder.saveForCurrentPlayer());
});
