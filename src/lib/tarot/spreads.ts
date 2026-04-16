import { SpreadPosition, LocalizedText } from './types';
import { drawCards } from './draw';

export const spreads = {
  single: {
    id: 'single',
    name: {
      th: 'ไพ่ใบเดียว',
      en: 'Single Card',
    },
    description: {
      th: 'เปิดไพ่ 1 ใบสำหรับคำถามง่ายๆ',
      en: 'Draw 1 card for a quick question',
    },
    positions: [
      { position: 1, key: 'answer', label: { th: 'คำตอบ', en: 'Answer' } },
    ],
  },
  three: {
    id: 'three',
    name: {
      th: 'ไพ่สามใบ',
      en: 'Three Card Draw',
    },
    description: {
      th: 'อดีต ปัจจุบัน อนาคต',
      en: 'Past, Present, Future',
    },
    positions: [
      { position: 1, key: 'past', label: { th: 'อดีต', en: 'Past' } },
      { position: 2, key: 'present', label: { th: 'ปัจจุบัน', en: 'Present' } },
      { position: 3, key: 'future', label: { th: 'อนาคต', en: 'Future' } },
    ],
  },
  fourNobleTruths: {
    id: 'four-noble-truths',
    name: {
      th: 'สี่สัจจะอันประเสริฐ',
      en: 'Four Noble Truths Spread',
    },
    description: {
      th: 'ทุกข์ สมุทัย นิโรธ มรรค',
      en: 'Dukkha, Samudaya, Nirodha, Magga',
    },
    positions: [
      { position: 1, key: 'dukkha', label: { th: 'ทุกข์ (Dukkha)', en: 'Dukkha - The Truth of Suffering' } },
      { position: 2, key: 'samudaya', label: { th: 'สมุทัย (Samudaya)', en: 'Samudaya - The Origin of Suffering' } },
      { position: 3, key: 'nirodha', label: { th: 'นิโรธ (Nirodha)', en: 'Nirodha - The Cessation of Suffering' } },
      { position: 4, key: 'magga', label: { th: 'มรรค (Magga)', en: 'Magga - The Path to Liberation' } },
    ],
  },
};

export function getSpread(spreadId: string) {
  return spreads[spreadId as keyof typeof spreads];
}

export function executeSpread(spreadId: string): SpreadPosition[] {
  const spread = getSpread(spreadId);
  if (!spread) return [];
  
  const drawnCards = drawCards(spread.positions.length);
  
  return spread.positions.map((pos, index) => ({
    ...pos,
    card: drawnCards[index],
  }));
}
