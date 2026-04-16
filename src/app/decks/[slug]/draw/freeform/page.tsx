'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getDeckRegistry, getDeckBundle, getMeaningByCardId, getDeckAspectRatio, getLookbookEntry, getGuidebookEntry } from '@/lib/tarot/deckLoader';
import { CardModal } from '@/components/tarot/CardModal';
import { useLanguage, LanguageToggle } from '@/components/ui/LanguageContext';
import { DeckRegistry, CardRecord, LookbookEntry, GuidebookEntry } from '@/lib/tarot/types';
import { JournalModal } from '@/components/ui/JournalModal';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getDeckBackImage(slug: string): string {
  if (slug === 'dhamma-path-tarot') {
    return `/images/decks/${slug}/images/back.jpg`;
  }
  return `/images/decks/${slug}/images/back.webp`;
}

export default function FreeFormDrawPage({ params }: PageProps) {
  const [slug, setSlug] = useState<string | null>(null);
  const [registry, setRegistry] = useState<DeckRegistry | undefined>(undefined);
  const [cards, setCards] = useState<CardRecord[]>([]);
  const [shuffledCards, setShuffledCards] = useState<CardRecord[]>([]);
  const [drawnCards, setDrawnCards] = useState<CardRecord[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardRecord | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<ReturnType<typeof getMeaningByCardId>>(undefined);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedLookbookEntry, setSelectedLookbookEntry] = useState<LookbookEntry | undefined>(undefined);
  const [selectedGuidebookEntry, setSelectedGuidebookEntry] = useState<GuidebookEntry | undefined>(undefined);
  const [showJournal, setShowJournal] = useState(false);
  const [isAsian, setIsAsian] = useState(false);
  const [resolved, setResolved] = useState(false);

  const { lang } = useLanguage();

  useEffect(() => {
    params.then(p => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (slug) {
      const r = getDeckRegistry(slug);
      setRegistry(r);
      setIsAsian(getDeckAspectRatio(slug) === '9:16');

      if (r) {
        const bundle = getDeckBundle(slug);
        if (bundle) {
          setCards(bundle.cards);
          setShuffledCards(shuffleArray(bundle.cards));
        }
      }
      setResolved(true);
    }
  }, [slug]);

  const handleDrawCard = (card: CardRecord) => {
    setDrawnCards(prev => [...prev, card]);
    setShuffledCards(prev => prev.filter(c => c.card_id !== card.card_id));
  };

  const handleSelectDrawnCard = (card: CardRecord) => {
    setSelectedCard(card);
    if (slug) {
      setSelectedMeaning(getMeaningByCardId(card.card_id, slug));
      setSelectedLookbookEntry(getLookbookEntry(card.card_id, slug));
      setSelectedGuidebookEntry(getGuidebookEntry(card.card_id, slug));
    }
    setShowCardModal(true);
  };

  const handleRemoveCard = (cardId: string) => {
    const cardToRemove = drawnCards.find(c => c.card_id === cardId);
    if (cardToRemove) {
      setDrawnCards(prev => prev.filter(c => c.card_id !== cardId));
      setShuffledCards(prev => [cardToRemove, ...prev]);
    }
  };

  const handleReset = () => {
    if (cards.length > 0) {
      setShuffledCards(shuffleArray(cards));
      setDrawnCards([]);
    }
  };

  const handleCardModalClose = () => {
    setShowCardModal(false);
    setSelectedCard(null);
    setSelectedMeaning(undefined);
    setSelectedLookbookEntry(undefined);
    setSelectedGuidebookEntry(undefined);
  };

  if (!resolved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-amber-200/60">Loading...</div>
      </div>
    );
  }

  if (!registry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-amber-200/60">Deck not found</div>
      </div>
    );
  }

  const cardWidth = isAsian ? 80 : 90;
  const cardHeight = isAsian ? 142 : 135;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center p-4">
        <Link href={`/decks/${slug}`} className="text-amber-200/70 hover:text-amber-100 transition-colors">
          ← {lang === 'th' ? 'กลับ' : 'Back'}
        </Link>
        <LanguageToggle />
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-4">
        <div className="max-w-6xl w-full space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-amber-100">
              {lang === 'th' ? 'เลือกไพ่เอง' : 'Free Pick'}
            </h1>
            <p className="text-amber-200/60 text-sm mt-1">
              {lang === 'th' ? 'คลิกไพ่ที่ต้องการเพื่อหยิบขึ้นมา' : 'Click cards to pick them up'}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="text-center mb-4">
                <h2 className="text-amber-400/70 text-sm uppercase tracking-wider">
                  {lang === 'th' ? 'ไพ่ที่เลือก' : 'Selected Cards'} ({drawnCards.length})
                </h2>
              </div>

              {drawnCards.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-4 min-h-[200px] p-4 rounded-xl border border-amber-700/30 bg-amber-950/20">
                  {drawnCards.map((card, index) => (
                    <div key={card.card_id} className="relative group">
                      <button
                        onClick={() => handleSelectDrawnCard(card)}
                        className="relative rounded-lg overflow-hidden shadow-lg hover:ring-2 hover:ring-amber-500/50 transition-all hover:scale-105"
                        style={{ width: cardWidth, height: cardHeight }}
                      >
                        <Image
                          src={`/images/decks/${slug}/${card.image}`}
                          alt={card.name[lang] || card.card_id}
                          width={cardWidth}
                          height={cardHeight}
                          className="object-cover"
                          unoptimized={true}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </button>
                      <button
                        onClick={() => handleRemoveCard(card.card_id)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600/80 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        ×
                      </button>
                      <p className="text-center text-amber-100 text-xs mt-1 truncate max-w-[80px]">
                        {card.name[lang]}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="min-h-[200px] flex items-center justify-center rounded-xl border-2 border-dashed border-amber-700/40 text-amber-700/50">
                  {lang === 'th' ? 'ยังไม่ได้เลือกไพ่' : 'No cards selected yet'}
                </div>
              )}

              {drawnCards.length > 0 && (
                <div className="mt-4 flex justify-center gap-3">
                  <button
                    onClick={handleReset}
                    className="px-5 py-2 rounded-full border border-amber-700/50 hover:bg-amber-900/30 text-amber-200 font-medium transition-colors text-sm"
                  >
                    {lang === 'th' ? 'สับไพ่ใหม่' : 'Reshuffle'}
                  </button>
                  <button
                    onClick={() => setShowJournal(true)}
                    className="px-5 py-2 rounded-full border border-amber-700/50 hover:bg-amber-900/30 text-amber-200 font-medium transition-colors text-sm"
                  >
                    {lang === 'th' ? 'บันทึก' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            <div className="lg:w-80 flex flex-col items-center">
              <h2 className="text-amber-400/70 text-sm uppercase tracking-wider mb-4">
                {lang === 'th' ? 'กองไพ่' : 'Deck'} ({shuffledCards.length})
              </h2>

              <button
                onClick={() => {
                  if (shuffledCards.length > 0) {
                    handleDrawCard(shuffledCards[0]);
                  }
                }}
                disabled={shuffledCards.length === 0}
                className="relative rounded-lg overflow-hidden transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  width: cardWidth, 
                  height: cardHeight,
                  boxShadow: '0 12px 40px rgba(255, 200, 100, 0.35), 0 0 60px rgba(255, 200, 100, 0.15), inset 0 0 20px rgba(255, 200, 100, 0.05)',
                  border: '1px solid rgba(255, 200, 100, 0.3)'
                }}
              >
                <Image
                  src={getDeckBackImage(slug || '')}
                  alt="Deck"
                  width={cardWidth}
                  height={cardHeight}
                  className="object-cover"
                  unoptimized={true}
                />
              </button>

              <p className="text-amber-200/50 text-xs mt-3">
                {lang === 'th' 
                  ? `คลิกเพื่อหยิบไพ่ (เหลือ ${shuffledCards.length} ใบ)`
                  : `Click to draw a card (${shuffledCards.length} remaining)`}
              </p>

              {drawnCards.length > 0 && (
                <div className="mt-6 p-4 rounded-xl bg-amber-900/20 border border-amber-700/30">
                  <h3 className="text-amber-100 text-sm font-medium mb-2">
                    {lang === 'th' ? 'คำแนะนำ' : 'Instructions'}
                  </h3>
                  <ul className="text-amber-200/70 text-xs space-y-1">
                    <li>• {lang === 'th' ? 'คลิกไพ่ที่เลือกเพื่อดูรายละเอียด' : 'Click selected cards to view details'}</li>
                    <li>• {lang === 'th' ? 'คลิก × เพื่อคืนไพ่เข้ากอง' : 'Click × to return cards to deck'}</li>
                    <li>• {lang === 'th' ? 'กดปุ่มสับไพ่ใหม่เพื่อเริ่มต้น' : 'Click reshuffle to start over'}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {selectedCard && selectedMeaning && (
        <CardModal
          draw={{
            card: selectedCard,
            meaning: selectedMeaning,
            orientation: 'upright',
          }}
          isOpen={showCardModal}
          onClose={handleCardModalClose}
          deckSlug={slug || undefined}
          lookbookEntry={selectedLookbookEntry}
          guidebookEntry={selectedGuidebookEntry}
        />
      )}

      {drawnCards.length > 0 && (
        <JournalModal
          isOpen={showJournal}
          onClose={() => setShowJournal(false)}
          cards={drawnCards.map(card => ({
            card,
            meaning: getMeaningByCardId(card.card_id, slug || undefined)!,
            orientation: 'upright' as const,
          }))}
          spreadType={`/decks/${slug}/draw/freeform`}
        />
      )}
    </div>
  );
}
