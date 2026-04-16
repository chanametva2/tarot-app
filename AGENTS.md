<!-- BEGIN:nextjs-agent-rules -->
# Next.js 16+ Agent Rules

This is NOT the Next.js you know. APIs, conventions, and file structure may differ from older versions.

Key changes in Next.js 16:
- `params` is now a `Promise<{...}>` - use `use(params)` to unwrap
- Use `priority` prop instead of `loading="eager"` for Image
- Run `npm run build` before reporting build errors
<!-- END:nextjs-agent-rules -->

---

# The Dhamma Path Tarot App

## Dev Commands
```bash
npm run dev    # Start dev server (http://localhost:3000)
npm run build  # Production build
npm run lint   # ESLint
```

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Redirects to /decks
│   ├── decks/             # Deck selection
│   ├── draw/              # Draw pages (single, three, four-noble-truths)
│   ├── cards/[cardId]/    # Card detail pages
│   ├── journal/            # Journal page
│   └── favorites/          # Saved favorites
├── components/
│   ├── tarot/             # TarotCard, CardModal, LookbookFlipBook, ShuffleAnimation
│   └── ui/               # UI components
├── lib/tarot/             # Core logic (deckLoader, draw, spreads, types)
└── data/decks/            # JSON deck data
```

## Multi-Deck System
Decks are hardcoded in `src/lib/tarot/deckLoader.ts`:
- **Dhamma Path Tarot** (78 cards, 2:3 ratio, Major + 4 Minor suits)
- **Asian Vogue Tarot** (22 Major Arcana, 9:16 ratio, has lookbook + guidebook)

## Data Files (per deck)
| File | Purpose |
|------|---------|
| `manifest.json` | Deck metadata (`card_aspect_ratio`, `image_extension`) |
| `cards.json` | Card definitions (image paths use `image_extension`) |
| `meanings.json` | Card meanings (bilingual `th`/`en`) |
| `spreads.json` | Spread configurations |
| `lookbook.json` | Lookbook entries (Asian Vogue only) |
| `guidebook.json` | Guidebook entries (Asian Vogue only) |

## Image Naming Convention
```
Asian Vogue: F00.webp - F21.webp (Major Arcana only)
Dhamma Path:
  - Major: F00.webp - F21.webp
  - Minor: D01-D14, S01-S14, N01-N14, M01-M14
```

## LookbookFlipBook (Asian Vogue only)
Uses `page-flip` library. Key pattern:
```tsx
useEffect(() => {
  const pf = new PageFlip(container, { flippingTime: 400 });
  setTimeout(() => {
    pf.loadFromHTML(Array.from(container.querySelectorAll('.page')) as HTMLElement[]);
  }, 100);
  return () => { pf?.destroy(); };
}, []);
```

## Key Types
```typescript
Lang = 'th' | 'en'
Orientation = 'upright' | 'reversed'
DrawResult = { card: CardRecord, meaning: MeaningRecord, orientation: Orientation }
LocalizedText = { th?: string; en?: string }
```

## LocalStorage Keys
- `tarot-journal-entries` - Saved journal entries
- `tarot-favorites` - Favorite card IDs

## Adding New Features
1. New spread: create page in `src/app/draw/[spread-name]/`
2. Draw pages need `JournalModal` for save-to-journal feature
3. Card image paths: update JSON files AND any hardcoded paths
