import { CardRecord, Orientation, DrawResult } from './types';
import { getAllCards, getMeaningByCardId } from './loader';

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

export function drawCard(cardId?: string): DrawResult | null {
  const cards = getAllCards();
  
  if (cards.length === 0) return null;
  
  let selectedCard: CardRecord;
  
  if (cardId) {
    selectedCard = cards.find(c => c.card_id === cardId) || cards[0];
  } else {
    const randomIndex = Math.floor(Math.random() * cards.length);
    selectedCard = cards[randomIndex];
  }
  
  const meaning = getMeaningByCardId(selectedCard.card_id);
  
  if (!meaning) return null;
  
  return {
    card: selectedCard,
    meaning,
    orientation: getRandomOrientation(),
  };
}

export function drawCards(count: number): DrawResult[] {
  const cards = getAllCards();
  const shuffled = shuffle(cards);
  const selected = shuffled.slice(0, count);
  
  const results: DrawResult[] = [];
  
  for (const card of selected) {
    const meaning = getMeaningByCardId(card.card_id);
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

export function drawCardsWithFixedOrientation(count: number): DrawResult[] {
  const cards = getAllCards();
  const shuffled = shuffle(cards);
  const selected = shuffled.slice(0, count);
  
  const results: DrawResult[] = [];
  
  for (const card of selected) {
    const meaning = getMeaningByCardId(card.card_id);
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
