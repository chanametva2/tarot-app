'use client';

import Link from 'next/link';
import Image from 'next/image';
import { use, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { getDeckRegistry, getDeckBundle, getDeckAspectRatio, getFullCard, getLookbookEntry, getGuidebookEntry } from '@/lib/tarot/deckLoader';
import { useLanguage, LanguageToggle } from '@/components/ui/LanguageContext';
import { CardModal } from '@/components/tarot/CardModal';
import { DeckRegistry, CardRecord, DrawResult } from '@/lib/tarot/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CardGalleryPage({ params }: PageProps) {
  const { slug } = use(params);
  const { lang } = useLanguage();
  const [registry, setRegistry] = useState<DeckRegistry | undefined>(undefined);
  const [cards, setCards] = useState<CardRecord[]>([]);
  const [resolved, setResolved] = useState(false);
  const [filter, setFilter] = useState<'all' | 'major' | 'minor'>('all');
  const [aspectRatio, setAspectRatio] = useState('2:3');
  const [selectedCard, setSelectedCard] = useState<DrawResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const r = getDeckRegistry(slug);
    setRegistry(r);
    setAspectRatio(getDeckAspectRatio(slug));
    if (r) {
      const bundle = getDeckBundle(slug);
      if (bundle) {
        setCards(bundle.cards);
      }
    }
    setResolved(true);
  }, [slug]);

  const handleCardClick = (card: CardRecord) => {
    const data = getFullCard(card.card_id, slug);
    if (data) {
      setSelectedCard({
        card: data.card,
        meaning: data.meaning,
        orientation: 'upright',
      });
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCard(null);
  };

  if (!resolved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-amber-200/60">Loading...</div>
      </div>
    );
  }

  if (!registry) {
    notFound();
  }

  const filteredCards = filter === 'all' 
    ? cards 
    : cards.filter(c => c.arcana === filter);

  const lookbookEntry = selectedCard ? getLookbookEntry(selectedCard.card.card_id, slug) : undefined;
  const guidebookEntry = selectedCard ? getGuidebookEntry(selectedCard.card.card_id, slug) : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center p-4">
        <div className="flex gap-4 text-sm">
          <Link href={`/decks/${slug}`} className="text-amber-200/70 hover:text-amber-100 transition-colors">
            ← {lang === 'th' ? 'กลับ' : 'Back'}
          </Link>
        </div>
        <LanguageToggle />
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-amber-100">
              {lang === 'th' ? 'ไพ่ทั้งหมด' : 'All Cards'}
            </h1>
            <p className="text-amber-200/60 text-sm">
              {registry.title[lang]} - {cards.length} {lang === 'th' ? 'ใบ' : 'cards'}
            </p>
          </div>

          <div className="flex justify-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                filter === 'all'
                  ? 'bg-amber-700/50 text-amber-100'
                  : 'bg-amber-900/30 text-amber-200/70 hover:bg-amber-900/50'
              }`}
            >
              {lang === 'th' ? 'ทั้งหมด' : 'All'}
            </button>
            <button
              onClick={() => setFilter('major')}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                filter === 'major'
                  ? 'bg-amber-700/50 text-amber-100'
                  : 'bg-amber-900/30 text-amber-200/70 hover:bg-amber-900/50'
              }`}
            >
              Major Arcana
            </button>
            {registry.has_minor_arcana && (
              <button
                onClick={() => setFilter('minor')}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  filter === 'minor'
                    ? 'bg-amber-700/50 text-amber-100'
                    : 'bg-amber-900/30 text-amber-200/70 hover:bg-amber-900/50'
                }`}
              >
                {lang === 'th' ? 'Minor Arcana' : 'Minor Arcana'}
              </button>
            )}
          </div>

          <div className={`flex flex-wrap justify-center gap-4`}>
            {filteredCards.map((card) => (
              <button
                key={card.card_id}
                onClick={() => handleCardClick(card)}
                className="group block focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded-lg"
                style={{ width: aspectRatio === '9:16' ? 96 : 112 }}
              >
                <div 
                  className="relative rounded-xl overflow-hidden shadow-lg border border-amber-700/30 hover:border-amber-500/50 transition-all group-hover:scale-105"
                  style={{ width: aspectRatio === '9:16' ? 96 : 112, aspectRatio: aspectRatio === '9:16' ? '9/16' : '2/3' }}
                >
                  <Image
                    src={`/images/decks/${slug}/${card.image}`}
                    alt={card.name[lang] || card.card_id}
                    width={aspectRatio === '9:16' ? 96 : 112}
                    height={aspectRatio === '9:16' ? 171 : 168}
                    className="object-cover"
                    unoptimized={true}
                  />
                </div>
                <div className="mt-2 text-center h-12">
                  <p className="text-amber-100 text-sm font-medium line-clamp-1">
                    {card.name[lang]}
                  </p>
                  <p className="text-amber-200/50 text-xs">
                    {card.roman || card.number}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {selectedCard && (
        <CardModal
          draw={selectedCard}
          isOpen={showModal}
          onClose={handleCloseModal}
          deckSlug={slug}
          lookbookEntry={lookbookEntry}
          guidebookEntry={guidebookEntry}
        />
      )}
    </div>
  );
}
