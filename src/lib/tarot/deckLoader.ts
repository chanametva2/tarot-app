import { CardRecord, MeaningRecord, Manifest, SpreadsData, Spread, DeckRegistry, DeckBundle, ModelProfile, LookbookEntry, GuidebookEntry, DrawResult, Orientation } from './types';

import dhammaPathManifest from '@/data/decks/dhamma-path-tarot/manifest.json';
import dhammaPathCards from '@/data/decks/dhamma-path-tarot/cards.json';
import dhammaPathMeanings from '@/data/decks/dhamma-path-tarot/meanings.json';
import dhammaPathSpreads from '@/data/decks/dhamma-path-tarot/spreads.json';

import asianVogueManifest from '@/data/decks/asian-vogue-tarot/manifest.json';
import asianVogueCards from '@/data/decks/asian-vogue-tarot/cards.json';
import asianVogueMeanings from '@/data/decks/asian-vogue-tarot/meanings.json';
import asianVogueSpreads from '@/data/decks/asian-vogue-tarot/spreads.json';
import asianVogueLookbook from '@/data/decks/asian-vogue-tarot/lookbook.json';
import asianVogueGuidebook from '@/data/decks/asian-vogue-tarot/guidebook.json';

export type { CardRecord, MeaningRecord, Manifest, SpreadsData, Spread, DeckRegistry, DeckBundle, ModelProfile, LookbookEntry, GuidebookEntry };

const deckBundles: Record<string, DeckBundle> = {
  'dhamma-path-tarot': {
    manifest: dhammaPathManifest as Manifest,
    cards: dhammaPathCards as CardRecord[],
    meanings: dhammaPathMeanings as Record<string, MeaningRecord>,
    spreads: dhammaPathSpreads as SpreadsData,
    lookbook: undefined,
    guidebook: undefined,
  },
  'asian-vogue-tarot': {
    manifest: asianVogueManifest as Manifest,
    cards: asianVogueCards as CardRecord[],
    meanings: asianVogueMeanings as Record<string, MeaningRecord>,
    spreads: asianVogueSpreads as SpreadsData,
    lookbook: asianVogueLookbook as { deck_id: string; entries: LookbookEntry[] } | undefined,
    guidebook: asianVogueGuidebook as { deck_id: string; entries: GuidebookEntry[] } | undefined,
  },
};

const registry: DeckRegistry[] = [
  {
    deck_id: 'deck_002_dhamma_path_tarot',
    slug: 'dhamma-path-tarot',
    title: { th: 'ไพ่พุทธธรรมทาโรต์', en: 'The Dhamma Path Tarot' },
    subtitle: { th: 'การเดินทางแห่งญาณรู้', en: 'The Journey of Insight' },
    author: 'Chanamet Vakulchai',
    card_count: 78,
    has_minor_arcana: true,
    path: 'dhamma-path-tarot',
  },
  {
    deck_id: 'deck_003_asian_vogue_tarot',
    slug: 'asian-vogue-tarot',
    title: { th: 'The Archetype: Asian Vogue Tarot', en: 'The Archetype: Asian Vogue Tarot' },
    subtitle: { th: 'Limited Edition: The Luminous Skin Series', en: 'Limited Edition: The Luminous Skin Series' },
    author: 'Chanamet Vakulchai',
    card_count: 22,
    has_minor_arcana: false,
    has_lookbook: true,
    has_guidebook: true,
    path: 'asian-vogue-tarot',
  },
];

export function getAllDecks(): DeckRegistry[] {
  return registry;
}

export function getDeckRegistry(slug: string): DeckRegistry | undefined {
  return registry.find(d => d.slug === slug);
}

export function getDeckById(deckId: string): DeckRegistry | undefined {
  return registry.find(d => d.deck_id === deckId);
}

export function getDeckBundle(slug: string): DeckBundle | undefined {
  return deckBundles[slug];
}

export function getDeckAspectRatio(slug: string): string {
  const bundle = deckBundles[slug];
  return bundle?.manifest.card_aspect_ratio || '2:3';
}

export function getDefaultDeck(): DeckRegistry {
  return registry[0];
}

export function getDefaultDeckBundle(): DeckBundle {
  return deckBundles[registry[0].slug];
}

export function getCardById(cardId: string, deckSlug?: string): CardRecord | undefined {
  if (deckSlug) {
    const bundle = deckBundles[deckSlug];
    return bundle?.cards.find(card => card.card_id === cardId);
  }
  for (const bundle of Object.values(deckBundles)) {
    const card = bundle.cards.find(c => c.card_id === cardId);
    if (card) return card;
  }
  return undefined;
}

export function getMeaningByCardId(cardId: string, deckSlug?: string): MeaningRecord | undefined {
  if (deckSlug) {
    const bundle = deckBundles[deckSlug];
    return bundle?.meanings[cardId];
  }
  for (const bundle of Object.values(deckBundles)) {
    if (bundle.meanings[cardId]) return bundle.meanings[cardId];
  }
  return undefined;
}

export function getFullCard(cardId: string, deckSlug?: string): { card: CardRecord; meaning: MeaningRecord } | undefined {
  const card = getCardById(cardId, deckSlug);
  const meaning = getMeaningByCardId(cardId, deckSlug);
  
  if (!card || !meaning) return undefined;
  
  return { card, meaning };
}

export function getCardsByArcana(arcana: 'major' | 'minor', deckSlug?: string): CardRecord[] {
  if (deckSlug) {
    const bundle = deckBundles[deckSlug];
    return bundle?.cards.filter(card => card.arcana === arcana) || [];
  }
  return getDefaultDeckBundle().cards.filter(card => card.arcana === arcana);
}

export function getCardsBySuit(suitKey: string, deckSlug?: string): CardRecord[] {
  if (deckSlug) {
    const bundle = deckBundles[deckSlug];
    return bundle?.cards.filter(card => card.suit_key === suitKey) || [];
  }
  return getDefaultDeckBundle().cards.filter(card => card.suit_key === suitKey);
}

export function getAllSpreads(deckSlug?: string): Spread[] {
  if (deckSlug) {
    const bundle = deckBundles[deckSlug];
    return bundle?.spreads.spreads || [];
  }
  return getDefaultDeckBundle().spreads.spreads;
}

export function getSpreadById(spreadId: string, deckSlug?: string): Spread | undefined {
  const spreads = getAllSpreads(deckSlug);
  return spreads.find(s => s.spread_id === spreadId);
}

export function getLookbookEntry(cardId: string, deckSlug?: string): LookbookEntry | undefined {
  if (deckSlug === 'asian-vogue-tarot') {
    const bundle = deckBundles['asian-vogue-tarot'];
    if (bundle.lookbook) {
      return bundle.lookbook.entries.find(e => e.card_id === cardId);
    }
  }
  return undefined;
}

export function getGuidebookEntry(cardId: string, deckSlug?: string): GuidebookEntry | undefined {
  if (deckSlug === 'asian-vogue-tarot') {
    const bundle = deckBundles['asian-vogue-tarot'];
    if (bundle.guidebook) {
      return bundle.guidebook.entries.find(e => e.card_id === cardId);
    }
  }
  return undefined;
}

export function getModelProfile(cardId: string, deckSlug?: string): ModelProfile | undefined {
  if (deckSlug === 'asian-vogue-tarot') {
    const bundle = deckBundles['asian-vogue-tarot'];
    const card = bundle.cards.find(c => c.card_id === cardId);
    return card?.model_profile;
  }
  return undefined;
}

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomOrientation(): Orientation {
  return Math.random() < 0.5 ? 'upright' : 'reversed';
}

export function drawCards(count: number, deckSlug?: string): DrawResult[] {
  const bundle = deckSlug ? deckBundles[deckSlug] : getDefaultDeckBundle();
  if (!bundle) return [];
  
  const shuffled = shuffle(bundle.cards);
  const selected = shuffled.slice(0, Math.min(count, bundle.cards.length));
  
  const results: DrawResult[] = [];
  
  for (const card of selected) {
    const meaning = bundle.meanings[card.card_id];
    if (meaning) {
      results.push({
        card,
        meaning,
        orientation: getRandomOrientation(),
      });
    }
  }
  
  return results;
}

export function drawCard(deckSlug?: string): DrawResult | null {
  const results = drawCards(1, deckSlug);
  return results[0] || null;
}

export function drawCardsWithFixedOrientation(count: number, deckSlug?: string): DrawResult[] {
  const bundle = deckSlug ? deckBundles[deckSlug] : getDefaultDeckBundle();
  if (!bundle) return [];
  
  const shuffled = shuffle(bundle.cards);
  const selected = shuffled.slice(0, Math.min(count, bundle.cards.length));
  
  const results: DrawResult[] = [];
  
  for (const card of selected) {
    const meaning = bundle.meanings[card.card_id];
    if (meaning) {
      results.push({
        card,
        meaning,
        orientation: 'upright',
      });
    }
  }
  
  return results;
}
