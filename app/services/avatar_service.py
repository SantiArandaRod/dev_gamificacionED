import json
from pathlib import Path

from app.models.avatar import AvatarData

PARTS_FILE = Path(__file__).parent.parent / "data" / "avatar_parts.json"


def get_parts_catalog() -> dict:
    with PARTS_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)


def get_default_avatar_data() -> dict:
    return AvatarData().model_dump()


def normalize_avatar_data(avatar_data: dict | None) -> dict:
    if not avatar_data:
        return get_default_avatar_data()
    return AvatarData(**avatar_data).model_dump()


def get_catalog_item(parts_catalog: dict, category: str, item_id: str, default_id: str) -> dict:
    items = parts_catalog.get(category, [])
    return next(
        (item for item in items if item.get("id") == item_id),
        next(item for item in items if item.get("id") == default_id),
    )


def get_color(parts_catalog: dict, category: str, item_id: str, default_id: str) -> str:
    return get_catalog_item(parts_catalog, category, item_id, default_id).get("hex", "#000000")


def render_avatar_svg(avatar_data: dict | None, parts_catalog: dict | None = None) -> str:
    parts_catalog = parts_catalog or get_parts_catalog()
    data = normalize_avatar_data(avatar_data)

    skin = get_color(parts_catalog, "skin_colors", data["skin_color"], "skin_1")
    hair = get_color(parts_catalog, "hair_colors", data["hair_color"], "hair_black")
    eye = get_color(parts_catalog, "eye_colors", data["eye_color"], "eye_brown")
    brow = get_color(parts_catalog, "eyebrow_colors", data["eyebrow_color"], "brow_black")
    mouth = get_color(parts_catalog, "mouth_colors", data["mouth_color"], "lip_natural")

    head = get_catalog_item(parts_catalog, "head_shapes", data["head_shape"], "head_round")
    hair_part = get_catalog_item(parts_catalog, "hair_styles", data["hair_style"], "hair_short")
    eyes = get_catalog_item(parts_catalog, "eyes", data["eye_type"], "eyes_normal")
    eyebrows = get_catalog_item(parts_catalog, "eyebrows", data["eyebrow_type"], "brow_flat")
    nose = get_catalog_item(parts_catalog, "noses", data["nose_type"], "nose_normal")
    mouth_part = get_catalog_item(parts_catalog, "mouths", data["mouth_type"], "mouth_smile")
    accessory = get_catalog_item(parts_catalog, "accessories", data["accessory"], "acc_none")

    accessory_svg = accessory.get("svg_group") or ""
    hair_svg = hair_part.get("svg_group") or ""

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" role="img" aria-label="Avatar">
  <style>
    .avatar-skin-fill {{ fill: {skin}; }}
    .avatar-hair-fill {{ fill: {hair}; }}
    .avatar-eye-fill {{ fill: {eye}; }}
    .avatar-brow-fill {{ fill: {brow}; }}
    .avatar-brow-stroke {{ stroke: {brow}; }}
    .avatar-mouth-fill {{ fill: {mouth}; }}
    .avatar-mouth-stroke {{ stroke: {mouth}; }}
  </style>
  <ellipse cx="100" cy="196" rx="55" ry="12" fill="rgba(0,0,0,0.18)"/>
  <g id="avatar-ears">
    <ellipse class="avatar-skin-fill" cx="40" cy="112" rx="13" ry="20" stroke="#402819" stroke-width="3"/>
    <ellipse class="avatar-skin-fill" cx="160" cy="112" rx="13" ry="20" stroke="#402819" stroke-width="3"/>
    <path d="M40 105 C34 112 35 122 42 127" fill="none" stroke="#9A6648" stroke-width="2" stroke-linecap="round"/>
    <path d="M160 105 C166 112 165 122 158 127" fill="none" stroke="#9A6648" stroke-width="2" stroke-linecap="round"/>
  </g>
  <g id="avatar-head">{head.get("svg_path", "")}</g>
  <g id="avatar-hair">{hair_svg}</g>
  <g id="avatar-eyes">{eyes.get("svg_group", "")}</g>
  <g id="avatar-eyebrows">{eyebrows.get("svg_group", "")}</g>
  <g id="avatar-nose">{nose.get("svg_group", "")}</g>
  <g id="avatar-mouth">{mouth_part.get("svg_group", "")}</g>
  <g id="avatar-accessory">{accessory_svg}</g>
</svg>"""
