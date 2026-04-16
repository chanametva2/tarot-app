# Tarot Card Aspect Ratio Fix

## Problem
Card images display with wrong proportions (stretched/cropped) especially for Asian Vogue Tarot (9:16 ratio).

## Root Causes

1. **manifest.json missing `card_aspect_ratio`** - Without this, code defaults to 2:3
2. **Wrong image extension** - Asian Vogue uses `.webp`, NOT `.jpg`
3. **Using Tailwind `aspect-[9/16]` class** - Tailwind can't detect dynamic classes

## Solution

### 1. Update manifest.json for each deck
```json
{
  "card_aspect_ratio": "9:16",  // "2:3" for Dhamma Path
  "image_extension": ".webp"
}
```

### 2. Use explicit width/height on Image component
```tsx
const isAsian = getDeckAspectRatio(deckSlug) === '9:16';
const imgWidth = 320;
const imgHeight = isAsian ? 570 : 480; // 9:16 ≈ 320x570, 2:3 = 320x480

<Image
  src={imageSrc}
  width={imgWidth}
  height={imgHeight}
  className="object-cover"
  unoptimized={true}
/>
```

### 3. Fix image paths in cards.json
If cards.json has wrong extension:
- Search: `.jpg`
- Replace: `.webp`

## Verification Commands

```bash
# Check actual image dimensions
magick identify public/images/decks/asian-vogue-tarot/images/F00.webp

# Check manifest has card_aspect_ratio
cat src/data/decks/asian-vogue-tarot/manifest.json | grep aspect

# Verify build passes
npm run build
```

## Key Files to Check
- `manifest.json` - Must have `card_aspect_ratio` field
- `cards.json` - Image paths must match actual files
- `CardModal.tsx` - Use explicit dimensions, NOT `fill` + Tailwind aspect classes

## Aspect Ratios by Deck
| Deck | Ratio | Dimensions (for width=320) |
|------|-------|---------------------------|
| Dhamma Path | 2:3 | 320 x 480 |
| Asian Vogue | 9:16 | 320 x 570 |
