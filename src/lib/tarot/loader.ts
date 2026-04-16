import { CardRecord, MeaningRecord, Manifest, SpreadsData, Spread } from './types';

import manifestData from '@/data/manifest.json';
import cardsData from '@/data/cards.json';
import meaningsData from '@/data/meanings.json';
import spreadsData from '@/data/spreads.json';

export const manifest: Manifest = manifestData as Manifest;
export const allCards: CardRecord[] = cardsData as CardRecord[];

const meanings: Record<string, MeaningRecord> = meaningsData as Record<string, MeaningRecord>;

const spreadsDataTyped: SpreadsData = spreadsData as SpreadsData;

export function getDeckManifest(): Manifest {
  return manifest;
}

export function getAllCards(): CardRecord[] {
  return allCards;
}

export function getCardById(cardId: string): CardRecord | undefined {
  return allCards.find(card => card.card_id === cardId);
}

export function getMeaningByCardId(cardId: string): MeaningRecord | undefined {
  return meanings[cardId];
}

export function getFullCard(cardId: string): { card: CardRecord; meaning: MeaningRecord } | undefined {
  const card = getCardById(cardId);
  const meaning = getMeaningByCardId(cardId);
  
  if (!card || !meaning) return undefined;
  
  return { card, meaning };
}

export function getCardsByArcana(arcana: 'major' | 'minor'): CardRecord[] {
  return allCards.filter(card => card.arcana === arcana);
}

export function getCardsBySuit(suitKey: string): CardRecord[] {
  return allCards.filter(card => card.suit_key === suitKey);
}

export function getSpreadsData(): SpreadsData {
  return spreadsDataTyped;
}

export function getAllSpreads(): Spread[] {
  return spreadsDataTyped.spreads;
}

export function getSpreadById(spreadId: string): Spread | undefined {
  return spreadsDataTyped.spreads.find(s => s.spread_id === spreadId);
}
