#!/usr/bin/env python3
"""
Deck Validation Script for Dhamma Path Tarot
Validates manifest.json, cards.json, meanings.json, and images.
Generates validation_report.md with results.
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
REPORT_FILE = DECK_PATH / "validation_report.md"

# Expected card IDs
EXPECTED_MAJOR = [f"F{str(i).zfill(2)}" for i in range(22)]
EXPECTED_MINOR = []
for prefix in ["D", "S", "N", "M"]:
    for i in range(1, 15):
        EXPECTED_MINOR.append(f"{prefix}{str(i).zfill(2)}")
EXPECTED_ALL = EXPECTED_MAJOR + EXPECTED_MINOR

# Required fields for Major Arcana
MAJOR_REQUIRED = [
    "card_id",
    "arcana",
    "number",
    "name_en",
    "name_th",
    "manual_title_th",
    "manual_title_en",
    "subtitle_th",
    "subtitle_en",
    "journey_stage",
    "image",
]

# Required fields for Minor Arcana
MINOR_REQUIRED = [
    "card_id",
    "arcana",
    "suit_key",
    "suit_name_th",
    "suit_name_en",
    "element_th",
    "element_en",
    "rank_type",
    "rank",
    "rank_name_th",
    "rank_name_en",
    "systematic_name_th",
    "systematic_name_en",
    "image",
]

# Image files expected (using .jpg as per manifest)
EXPECTED_IMAGES = []
for i in range(22):
    EXPECTED_IMAGES.append(f"F{str(i).zfill(2)}.jpg")
for prefix in ["D", "S", "N", "M"]:
    for i in range(1, 15):
        EXPECTED_IMAGES.append(f"{prefix}{str(i).zfill(2)}.jpg")
EXPECTED_IMAGES.extend(["cover.jpg", "back.jpg"])


class ValidationResult:
    def __init__(self):
        self.card_count = 0
        self.meanings_count = 0
        self.expected_images = len(EXPECTED_IMAGES)
        self.found_images = 0
        self.missing_in_cards = []
        self.missing_in_meanings = []
        self.missing_images = []
        self.missing_fields = {}  # card_id -> list of missing fields
        self.warnings = []
        self.errors = []

    def add_error(self, msg):
        self.errors.append(msg)

    def add_warning(self, msg):
        self.warnings.append(msg)

    def is_pass(self):
        return (
            len(self.errors) == 0
            and len(self.missing_fields) == 0
            and len(self.missing_images) == 0
        )

    def is_pass_with_warnings(self):
        return len(self.errors) == 0 and (
            len(self.warnings) > 0
            or len(self.missing_fields) > 0
            or len(self.missing_images) > 0
        )

    def is_fail(self):
        return (
            len(self.errors) > 0
            or len(self.missing_images) > 0
            or len(self.missing_fields) > 0
        )


def validate_structure(result, manifest, cards, meanings):
    """A. Structural validation"""
    print("=" * 60)
    print("A. STRUCTURAL VALIDATION")
    print("=" * 60)

    result.card_count = len(cards)
    result.meanings_count = len(meanings)

    print(f"  Cards: {result.card_count} (expected 78)")
    print(f"  Meanings: {result.meanings_count} (expected 78)")

    if result.card_count != 78:
        result.add_error(f"cards.json has {result.card_count} cards, expected 78")

    if result.meanings_count != 78:
        result.add_error(
            f"meanings.json has {result.meanings_count} entries, expected 78"
        )


def validate_card_id_consistency(result, cards, meanings):
    """B. card_id consistency"""
    print("\n" + "=" * 60)
    print("B. CARD_ID CONSISTENCY")
    print("=" * 60)

    card_ids_in_cards = set(c["card_id"] for c in cards)
    card_ids_in_meanings = set(meanings.keys())

    missing_in_meanings = card_ids_in_cards - card_ids_in_meanings
    missing_in_cards = card_ids_in_meanings - card_ids_in_cards

    if missing_in_meanings:
        result.missing_in_meanings = sorted(missing_in_meanings)
        result.add_error(f"Missing {len(missing_in_meanings)} entries in meanings.json")
        print(
            f"  [FAIL] Missing in meanings: {', '.join(missing_in_meanings[:5])}{'...' if len(missing_in_meanings) > 5 else ''}"
        )

    if missing_in_cards:
        result.missing_in_cards = sorted(missing_in_cards)
        result.add_error(f"Missing {len(missing_in_cards)} entries in cards.json")
        print(
            f"  [FAIL] Missing in cards: {', '.join(missing_in_cards[:5])}{'...' if len(missing_in_cards) > 5 else ''}"
        )

    if not missing_in_meanings and not missing_in_cards:
        print("  [OK] All card_ids match between cards.json and meanings.json")


def validate_images(result, cards):
    """C. Image validation"""
    print("\n" + "=" * 60)
    print("C. IMAGE VALIDATION")
    print("=" * 60)

    images_in_cards = set(c.get("image", "") for c in cards)
    expected_image_names = set(
        f
        for f in EXPECTED_IMAGES
        if not f.startswith("cover") and not f.startswith("back")
    )

    found_count = 0
    missing = []

    for img in sorted(images_in_cards):
        if not img:
            continue
        img_name = os.path.basename(img)
        img_path = IMAGES_PATH / img_name

        # Check for both .jpg and .webp
        if not img_path.exists():
            # Try .webp
            webp_path = IMAGES_PATH / img_name.replace(".jpg", ".webp")
            if webp_path.exists():
                found_count += 1
                continue

        if img_path.exists():
            found_count += 1
        else:
            missing.append(img_name)

    result.found_images = found_count

    # Check cover and back
    for special in ["cover.jpg", "back.jpg"]:
        path = IMAGES_PATH / special
        if not path.exists():
            # Try webp
            webp_path = IMAGES_PATH / special.replace(".jpg", ".webp")
            if webp_path.exists():
                result.found_images += 1
            else:
                missing.append(special)
                result.found_images += 0  # already counted

    result.missing_images = sorted(missing)

    print(f"  Images referenced in cards: {len(images_in_cards)}")
    print(f"  Images found in folder: {result.found_images} / {result.expected_images}")

    if result.missing_images:
        result.add_error(f"Missing {len(result.missing_images)} image files")
        for img in result.missing_images[:5]:
            print(f"    - {img}")
        if len(result.missing_images) > 5:
            print(f"    ... and {len(result.missing_images) - 5} more")


def validate_required_fields(result, cards):
    """D. Required field validation"""
    print("\n" + "=" * 60)
    print("D. REQUIRED FIELD VALIDATION")
    print("=" * 60)

    missing_by_card = {}

    for card in cards:
        card_id = card.get("card_id", "unknown")
        arcana = card.get("arcana", "")

        if arcana == "major":
            required = MAJOR_REQUIRED
        elif arcana == "minor":
            required = MINOR_REQUIRED
        else:
            result.add_error(f"Unknown arcana '{arcana}' for {card_id}")
            continue

        missing = []
        for field in required:
            # Check if key exists (empty strings are valid for optional fields)
            if field not in card:
                missing.append(field)

        if missing:
            missing_by_card[card_id] = missing

    result.missing_fields = missing_by_card

    if missing_by_card:
        result.add_error(f"Missing required fields in {len(missing_by_card)} cards")
        for card_id, fields in list(missing_by_card.items())[:3]:
            print(f"  [FAIL] {card_id}: missing {', '.join(fields)}")
        if len(missing_by_card) > 3:
            print(f"  ... and {len(missing_by_card) - 3} more cards")
    else:
        print("  [OK] All required fields present")


def check_warnings(result, cards, meanings):
    """E. Soft validation / warnings"""
    print("\n" + "=" * 60)
    print("E. SOFT VALIDATION / WARNINGS")
    print("=" * 60)

    fallback_count = 0
    empty_en_fields = []

    for card in cards:
        card_id = card.get("card_id", "unknown")

        # Check for fallback usage
        if card.get("manual_title_en") == card.get("systematic_name_en"):
            fallback_count += 1

        # Check for missing English fields in meanings
        if card_id in meanings:
            meaning = meanings[card_id]

            if not meaning.get("story", {}).get("en"):
                empty_en_fields.append(f"{card_id}.story.en")
            if not meaning.get("quote", {}).get("en"):
                empty_en_fields.append(f"{card_id}.quote.en")
            if not meaning.get("reflection", {}).get("en"):
                empty_en_fields.append(f"{card_id}.reflection.en")
            if not meaning.get("upright", {}).get("en"):
                empty_en_fields.append(f"{card_id}.upright.en")

    if fallback_count > 0:
        result.add_warning(
            f"{fallback_count} cards using systematic_name as manual_title fallback"
        )
        print(f"  [WARN] {fallback_count} cards using fallback titles")

    if empty_en_fields:
        result.add_warning(f"{len(empty_en_fields)} English fields are empty")
        print(f"  [WARN] {len(empty_en_fields)} empty English fields")
        for field in empty_en_fields[:5]:
            print(f"    - {field}")
        if len(empty_en_fields) > 5:
            print(f"    ... and {len(empty_en_fields) - 5} more")


def generate_report(result):
    """Generate validation_report.md"""
    print("\n" + "=" * 60)
    print("GENERATING VALIDATION REPORT")
    print("=" * 60)

    # Determine result
    if result.is_pass():
        status = "PASS"
    elif result.is_pass_with_warnings():
        status = "PASS WITH WARNINGS"
    else:
        status = "FAIL"

    report_lines = [
        "# Validation Report",
        "",
        f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "---",
        "",
        "## 1. Summary",
        "",
        f"| Metric | Value |",
        f"|---------|-------|",
        f"| Total cards | {result.card_count} |",
        f"| Total meanings | {result.meanings_count} |",
        f"| Images expected | {result.expected_images} |",
        f"| Images found | {result.found_images} |",
        "",
        "---",
        "",
        "## 2. Result",
        "",
        f"**{status}**",
        "",
        "---",
        "",
        "## 3. card_id Mismatches",
        "",
    ]

    if result.missing_in_cards:
        report_lines.append("**Missing in cards.json:**")
        for card_id in result.missing_in_cards:
            report_lines.append(f"- `{card_id}`")
        report_lines.append("")

    if result.missing_in_meanings:
        report_lines.append("**Missing in meanings.json:**")
        for card_id in result.missing_in_meanings:
            report_lines.append(f"- `{card_id}`")
        report_lines.append("")

    if not result.missing_in_cards and not result.missing_in_meanings:
        report_lines.append("*No mismatches found.*")
        report_lines.append("")

    report_lines.extend(
        [
            "---",
            "",
            "## 4. Missing Images",
            "",
        ]
    )

    if result.missing_images:
        report_lines.append("**Missing image files:**")
        for img in result.missing_images:
            report_lines.append(f"- `{img}`")
        report_lines.append("")
    else:
        report_lines.append("*No missing images.*")
        report_lines.append("")

    report_lines.extend(
        [
            "---",
            "",
            "## 5. Missing Required Fields",
            "",
        ]
    )

    if result.missing_fields:
        for card_id, fields in result.missing_fields.items():
            report_lines.append(f"**{card_id}:** {', '.join(fields)}")
        report_lines.append("")
    else:
        report_lines.append("*All required fields present.*")
        report_lines.append("")

    report_lines.extend(
        [
            "---",
            "",
            "## 6. Warnings",
            "",
        ]
    )

    if result.warnings:
        for warning in result.warnings:
            report_lines.append(f"- {warning}")
        report_lines.append("")
    else:
        report_lines.append("*No warnings.*")
        report_lines.append("")

    report_lines.extend(
        [
            "---",
            "",
            "## 7. Final Readiness",
            "",
        ]
    )

    if status == "PASS" or status == "PASS WITH WARNINGS":
        report_lines.append("**Ready for app use** [OK]")
        if status == "PASS WITH WARNINGS":
            report_lines.append("")
            report_lines.append("*Note: Some warnings exist but are non-blocking.*")
    else:
        report_lines.append("**Not ready for app use** [FAIL]")
        report_lines.append("")
        report_lines.append("*Fix the errors above before proceeding.*")

    # Write report
    report_content = "\n".join(report_lines)
    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        f.write(report_content)

    print(f"  [OK] Report saved to: {REPORT_FILE.name}")
    print(f"\n  {'=' * 40}")
    print(f"  FINAL RESULT: {status}")
    print(f"  {'=' * 40}")

    return status


def main():
    print("\n" + "=" * 60)
    print("DHAMMA PATH TAROT - DECK VALIDATION")
    print("=" * 60)

    # Load files
    print("\nLoading files...")
    try:
        with open(MANIFEST_FILE, "r", encoding="utf-8") as f:
            manifest = json.load(f)
        print(f"  [OK] manifest.json")
    except Exception as e:
        print(f"  [FAIL] Failed to load manifest.json: {e}")
        sys.exit(1)

    try:
        with open(CARDS_FILE, "r", encoding="utf-8") as f:
            cards = json.load(f)
        print(f"  [OK] cards.json ({len(cards)} cards)")
    except Exception as e:
        print(f"  [FAIL] Failed to load cards.json: {e}")
        sys.exit(1)

    try:
        with open(MEANINGS_FILE, "r", encoding="utf-8") as f:
            meanings = json.load(f)
        print(f"  [OK] meanings.json ({len(meanings)} entries)")
    except Exception as e:
        print(f"  [FAIL] Failed to load meanings.json: {e}")
        sys.exit(1)

    try:
        with open(CARDS_FILE, "r", encoding="utf-8") as f:
            cards = json.load(f)
        print(f"  [OK] cards.json ({len(cards)} cards)")
    except Exception as e:
        print(f"  [FAIL] Failed to load cards.json: {e}")
        sys.exit(1)

    try:
        with open(MEANINGS_FILE, "r", encoding="utf-8") as f:
            meanings = json.load(f)
        print(f"  [OK] meanings.json ({len(meanings)} entries)")
    except Exception as e:
        print(f"  [FAIL] Failed to load meanings.json: {e}")
        sys.exit(1)

    # Initialize result
    result = ValidationResult()

    # Run validations
    validate_structure(result, manifest, cards, meanings)
    validate_card_id_consistency(result, cards, meanings)
    validate_images(result, cards)
    validate_required_fields(result, cards)
    check_warnings(result, cards, meanings)

    # Generate report
    status = generate_report(result)

    # Exit code
    if status == "FAIL":
        sys.exit(1)

    print("\n" + "=" * 60)
    print("VALIDATION COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()
