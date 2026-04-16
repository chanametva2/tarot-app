#!/usr/bin/env python3
"""
Schema Migration Script for Dhamma Path Tarot Deck
Patches manifest.json, cards.json, and meanings.json to the latest schema.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Configuration
DECK_PATH = Path(__file__).parent
MANIFEST_FILE = DECK_PATH / "manifest.json"
CARDS_FILE = DECK_PATH / "cards.json"
MEANINGS_FILE = DECK_PATH / "meanings.json"
IMAGES_PATH = DECK_PATH / "images"

# Journey stage mapping for Major Arcana
JOURNEY_STAGES = {
    "F00": "pre_enlightenment",
    "F01": "pre_enlightenment",
    "F02": "pre_enlightenment",
    "F03": "pre_enlightenment",
    "F04": "pre_enlightenment",
    "F05": "pre_enlightenment",
    "F06": "turning_point",
    "F07": "turning_point",
    "F08": "turning_point",
    "F09": "turning_point",
    "F10": "turning_point",
    "F11": "battle_for_enlightenment",
    "F12": "battle_for_enlightenment",
    "F13": "battle_for_enlightenment",
    "F14": "battle_for_enlightenment",
    "F15": "battle_for_enlightenment",
    "F16": "battle_for_enlightenment",
    "F17": "battle_for_enlightenment",
    "F18": "battle_for_enlightenment",
    "F19": "battle_for_enlightenment",
    "F20": "battle_for_enlightenment",
    "F21": "battle_for_enlightenment",
}

# Suit mapping
SUIT_MAP = {"D": "dukkha", "S": "samudaya", "N": "nirodha", "M": "magga"}

# Element mapping
ELEMENT_MAP = {
    "dukkha": {"th": "ลม", "en": "Air"},
    "samudaya": {"th": "น้ำ", "en": "Water"},
    "nirodha": {"th": "ดิน", "en": "Earth"},
    "magga": {"th": "ไฟ", "en": "Fire"},
}

# Suit name mapping
SUIT_NAME_MAP = {
    "dukkha": {"th": "ชุดดาบ", "en": "Suit of Dukkha"},
    "samudaya": {"th": "ชุดถ้วย", "en": "Suit of Samudaya"},
    "nirodha": {"th": "ชุดเหรียญ", "en": "Suit of Nirodha"},
    "magga": {"th": "ชุดไม้เท้า", "en": "Suit of Magga"},
}

# Suit theme mapping
SUIT_THEME_MAP = {
    "dukkha": {"th": "ความทุกข์", "en": "Suffering"},
    "samudaya": {"th": "ความอยาก", "en": "Craving"},
    "nirodha": {"th": "การหยุดนิ่ง", "en": "Cessation"},
    "magga": {"th": "การเดินทาง", "en": "Path"},
}


# Rank type mapping
def get_rank_type(card_id):
    num = int(card_id[1:])
    return "pip" if num <= 10 else "court"


# Rank name mapping
RANK_NAME_MAP = {
    "01": {"th": "เอก", "en": "Ace"},
    "02": {"th": "ทูต", "en": "Two"},
    "03": {"th": "ตรี", "en": "Three"},
    "04": {"th": "จัตวา", "en": "Four"},
    "05": {"th": "เบญจ", "en": "Five"},
    "06": {"th": "ฉัตร", "en": "Six"},
    "07": {"th": "สัตต", "en": "Seven"},
    "08": {"th": "อัฏฐ", "en": "Eight"},
    "09": {"th": "นวางค์", "en": "Nine"},
    "10": {"th": "ทศ", "en": "Ten"},
    "11": {"th": "องค์หญิง", "en": "Page"},
    "12": {"th": "องค์ชาย", "en": "Knight"},
    "13": {"th": "พระนาง", "en": "Queen"},
    "14": {"th": "พระราชา", "en": "King"},
}


def step0_preflight():
    """STEP 0: Preflight - Check if all required files exist"""
    print("=" * 60)
    print("STEP 0: PREFLIGHT CHECK")
    print("=" * 60)

    files = {
        "manifest.json": MANIFEST_FILE,
        "cards.json": CARDS_FILE,
        "meanings.json": MEANINGS_FILE,
        "images/": IMAGES_PATH,
    }

    all_ok = True
    for name, path in files.items():
        if path.exists():
            if path.is_dir():
                print(f"  [OK] {name} exists (directory)")
            else:
                print(f"  [OK] {name} exists")
        else:
            print(f"  [FAIL] {name} MISSING!")
            all_ok = False

    if not all_ok:
        print("\n[ERROR] Preflight failed. Some files are missing.")
        return False

    print("\n[OK] All required files present.")
    return True


def step1_backup():
    """STEP 1: Create backups"""
    print("\n" + "=" * 60)
    print("STEP 1: BACKUP")
    print("=" * 60)

    backup_suffix = f".backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

    files_to_backup = [
        (MANIFEST_FILE, "manifest"),
        (CARDS_FILE, "cards"),
        (MEANINGS_FILE, "meanings"),
    ]

    for file_path, name in files_to_backup:
        backup_path = DECK_PATH / f"{name}{backup_suffix}"
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        with open(backup_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  [OK] Created: {backup_path.name}")

    # Also create simple .backup.json (overwrite-safe)
    for file_path, name in files_to_backup:
        backup_path = DECK_PATH / f"{name}.backup.json"
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        with open(backup_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  [OK] Created: {backup_path.name}")

    return True


def step2_patch_manifest(manifest):
    """STEP 2: Patch manifest.json"""
    print("\n" + "=" * 60)
    print("STEP 2: PATCH MANIFEST")
    print("=" * 60)

    changes = []

    # Add schema_version if missing
    if "schema_version" not in manifest:
        manifest["schema_version"] = "major_minor_normalized_v1"
        changes.append("Added schema_version")

    # Add naming schema if missing
    if "naming" not in manifest:
        manifest["naming"] = {
            "major_card_id_pattern": "F00-F21",
            "minor_card_id_patterns": ["D01-D14", "S01-S14", "N01-N14", "M01-M14"],
            "image_extension": ".jpg",
        }
        changes.append("Added naming schema")

    # Ensure language_support
    if manifest.get("language_support") != ["th", "en"]:
        manifest["language_support"] = ["th", "en"]
        changes.append("Updated language_support")

    # Ensure card_count
    if manifest.get("card_count") != 78:
        manifest["card_count"] = 78
        changes.append("Updated card_count to 78")

    # Ensure structure
    if manifest.get("structure", {}).get("major") != 22:
        manifest.setdefault("structure", {})["major"] = 22
        changes.append("Updated structure.major")

    if manifest.get("structure", {}).get("minor") != 56:
        manifest.setdefault("structure", {})["minor"] = 56
        changes.append("Updated structure.minor")

    if changes:
        for change in changes:
            print(f"  [OK] {change}")
    else:
        print("  - No changes needed")

    return manifest, changes


def step3_patch_cards(cards):
    """STEP 3: Patch cards.json"""
    print("\n" + "=" * 60)
    print("STEP 3: PATCH CARDS")
    print("=" * 60)

    patched_count = 0

    for card in cards:
        card_id = card.get("card_id", "")
        arcana = card.get("arcana", "")

        if arcana == "major":
            # Ensure required fields for Major Arcana
            if "number" not in card:
                card["number"] = int(card_id[1:])
            if "roman" not in card:
                card["roman"] = str(card["number"])

            # Add name_th and name_en from name object (MUST be before subtitle extraction)
            name_obj = card.get("name", {})
            if "th" in name_obj:
                card["name_th"] = name_obj["th"]
            if "en" in name_obj:
                card["name_en"] = name_obj["en"]

            # Add manual_title (use systematic name as fallback)
            if "manual_title_th" not in card:
                card["manual_title_th"] = card.get("name_th", card_id)
            if "manual_title_en" not in card:
                card["manual_title_en"] = card.get("name_en", card_id)

            # Add subtitle (extract from name_th/name_en if contains parentheses)
            # Use name_th/name_en that was just set above
            name_th = card.get("name_th", card.get("name", {}).get("th", ""))
            name_en = card.get("name_en", card.get("name", {}).get("en", ""))

            # Extract Thai subtitle from name_th (part after Thai parentheses or English in Thai)
            if "subtitle_th" not in card:
                if "(" in name_th:
                    subtitle = name_th.split("(")[-1].rstrip(")").strip()
                    card["subtitle_th"] = subtitle
                else:
                    card["subtitle_th"] = ""

            # Extract English subtitle from name_en
            if "subtitle_en" not in card:
                if "(" in name_en:
                    subtitle = name_en.split("(")[-1].rstrip(")").strip()
                    card["subtitle_en"] = subtitle
                else:
                    card["subtitle_en"] = ""

            # Add journey_stage
            if "journey_stage" not in card:
                card["journey_stage"] = JOURNEY_STAGES.get(card_id, "unknown")

            # Add image if missing
            if "image" not in card:
                card["image"] = f"images/{card_id}.jpg"

            patched_count += 1

        elif arcana == "minor":
            suit_prefix = card_id[0]
            suit_key = SUIT_MAP.get(suit_prefix, "unknown")
            rank = card_id[1:]
            rank_type = get_rank_type(card_id)

            # Add arcana
            card["arcana"] = "minor"

            # Add suit_key
            if "suit_key" not in card:
                card["suit_key"] = suit_key

            # Add suit_name
            if "suit_name_th" not in card:
                card["suit_name_th"] = SUIT_NAME_MAP.get(suit_key, {}).get(
                    "th", suit_key
                )
            if "suit_name_en" not in card:
                card["suit_name_en"] = SUIT_NAME_MAP.get(suit_key, {}).get(
                    "en", suit_key
                )

            # Add element
            element = ELEMENT_MAP.get(suit_key, {})
            if "element_th" not in card:
                card["element_th"] = element.get("th", "")
            if "element_en" not in card:
                card["element_en"] = element.get("en", "")

            # Add suit_theme
            theme = SUIT_THEME_MAP.get(suit_key, {})
            if "suit_theme_th" not in card:
                card["suit_theme_th"] = theme.get("th", "")
            if "suit_theme_en" not in card:
                card["suit_theme_en"] = theme.get("en", "")

            # Add rank_type
            if "rank_type" not in card:
                card["rank_type"] = rank_type

            # Add rank
            if "rank" not in card:
                card["rank"] = rank

            # Add rank_name
            rank_name = RANK_NAME_MAP.get(rank, {"th": rank, "en": rank})
            if "rank_name_th" not in card:
                card["rank_name_th"] = rank_name["th"]
            if "rank_name_en" not in card:
                card["rank_name_en"] = rank_name["en"]

            # Add systematic_name
            if "systematic_name_th" not in card:
                card["systematic_name_th"] = (
                    f"{rank_name['th']} {SUIT_NAME_MAP.get(suit_key, {}).get('th', suit_key)}"
                )
            if "systematic_name_en" not in card:
                card["systematic_name_en"] = (
                    f"{rank_name['en']} of {SUIT_NAME_MAP.get(suit_key, {}).get('en', suit_key)}"
                )

            # Add manual_title (use systematic name as fallback)
            if "manual_title_th" not in card:
                card["manual_title_th"] = card.get("systematic_name_th", card_id)
            if "manual_title_en" not in card:
                card["manual_title_en"] = card.get("systematic_name_en", card_id)

            # Add image if missing
            if "image" not in card:
                card["image"] = f"images/{card_id}.jpg"

            patched_count += 1

    print(f"  [OK] Patched {patched_count} cards")
    return cards


def step4_patch_meanings(meanings, cards):
    """STEP 4: Patch meanings.json"""
    print("\n" + "=" * 60)
    print("STEP 4: PATCH MEANINGS")
    print("=" * 60)

    # Create card lookup
    card_lookup = {c["card_id"]: c for c in cards}

    patched_count = 0

    for card_id, meaning in meanings.items():
        if card_id not in card_lookup:
            print(f"  ! Warning: {card_id} in meanings but not in cards")
            continue

        card = card_lookup[card_id]
        arcana = card.get("arcana", "unknown")
        changes = []

        # Sync name from cards.json
        if "name_th" not in meaning and "name" in card:
            meaning["name_th"] = card["name"].get("th", "")
        if "name_en" not in meaning and "name" in card:
            meaning["name_en"] = card["name"].get("en", "")

        # Sync manual_title
        if "manual_title_th" not in meaning:
            meaning["manual_title_th"] = card.get("manual_title_th", "")
            if meaning["manual_title_th"]:
                changes.append("manual_title_th")
        if "manual_title_en" not in meaning:
            meaning["manual_title_en"] = card.get("manual_title_en", "")
            if meaning["manual_title_en"]:
                changes.append("manual_title_en")

        # Normalize upright/reversed to list
        for key in ["upright", "reversed"]:
            if key in meaning:
                val = meaning[key]
                # If it's a dict with th/en
                if isinstance(val, dict):
                    # Convert to {th: [...], en: [...]} format
                    if "th" in val and isinstance(val["th"], str):
                        meaning[key] = {"th": [val["th"]]}
                    if "en" in val and isinstance(val["en"], str):
                        if "th" not in meaning[key]:
                            meaning[key] = {"th": []}
                        meaning[key]["en"] = [val["en"]]
                # If it's a list, ensure th/en structure
                elif isinstance(val, list):
                    # Already list format, check if bilingual
                    pass

        # Add arcana/suit info for Minor
        if arcana == "minor":
            for field in [
                "arcana",
                "suit_key",
                "suit_name",
                "element",
                "suit_theme",
                "rank_type",
                "rank",
                "rank_name",
                "systematic_name",
            ]:
                src_field = field
                if field == "suit_name":
                    src_field = "suit_name_en"
                elif field == "element":
                    src_field = "element_en"
                elif field == "suit_theme":
                    src_field = "suit_theme_en"
                elif field == "rank_name":
                    src_field = "rank_name_en"
                elif field == "systematic_name":
                    src_field = "systematic_name_en"

                if field not in meaning and src_field in card:
                    meaning[field] = card[src_field]

        if changes:
            patched_count += 1

    print(f"  [OK] Synced meanings with cards ({patched_count} entries updated)")
    return meanings


def save_patched_files(manifest, cards, meanings):
    """Save all patched files"""
    print("\n" + "=" * 60)
    print("SAVING PATCHED FILES")
    print("=" * 60)

    with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"  [OK] Saved: {MANIFEST_FILE.name}")

    with open(CARDS_FILE, "w", encoding="utf-8") as f:
        json.dump(cards, f, ensure_ascii=False, indent=2)
    print(f"  [OK] Saved: {CARDS_FILE.name}")

    with open(MEANINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(meanings, f, ensure_ascii=False, indent=2)
    print(f"  [OK] Saved: {MEANINGS_FILE.name}")


def main():
    print("\n" + "=" * 60)
    print("DHAMMA PATH TAROT - SCHEMA MIGRATION")
    print("=" * 60)

    # STEP 0: Preflight
    if not step0_preflight():
        sys.exit(1)

    # STEP 1: Backup
    if not step1_backup():
        sys.exit(1)

    # Load current files
    print("\nLoading current files...")
    with open(MANIFEST_FILE, "r", encoding="utf-8") as f:
        manifest = json.load(f)
    with open(CARDS_FILE, "r", encoding="utf-8") as f:
        cards = json.load(f)
    with open(MEANINGS_FILE, "r", encoding="utf-8") as f:
        meanings = json.load(f)
    print(f"  Loaded {len(cards)} cards, {len(meanings)} meanings")

    # STEP 2: Patch manifest
    manifest, manifest_changes = step2_patch_manifest(manifest)

    # STEP 3: Patch cards
    cards = step3_patch_cards(cards)

    # STEP 4: Patch meanings
    meanings = step4_patch_meanings(meanings, cards)

    # Save patched files
    save_patched_files(manifest, cards, meanings)

    print("\n" + "=" * 60)
    print("MIGRATION COMPLETE")
    print("=" * 60)
    print("\nNext step: Run validate_deck.py to validate the patched data.")
    print("=" * 60)


if __name__ == "__main__":
    main()
