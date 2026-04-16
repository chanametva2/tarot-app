'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getDeckRegistry, getDeckBundle, getDeckAspectRatio } from '@/lib/tarot/deckLoader';
import { useLanguage, LanguageToggle } from '@/components/ui/LanguageContext';
import { DeckRegistry, LookbookEntry } from '@/lib/tarot/types';
import { LookbookFlipBook } from '@/components/tarot/LookbookFlipBook';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function getLocalizedText(value: unknown, lang: string): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'th' in (value as Record<string, unknown>)) {
    const obj = value as Record<string, unknown>;
    return (obj[lang] as string) || (obj['en'] as string) || '';
  }
  return '';
}

function getLocalizedArray(value: unknown, lang: string): string[] {
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
    return value as string[];
  }
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    if (obj[lang] && Array.isArray(obj[lang])) {
      return obj[lang] as string[];
    }
    if (obj['en'] && Array.isArray(obj['en'])) {
      return obj['en'] as string[];
    }
  }
  return [];
}

export default function LookbookPage({ params }: PageProps) {
  const [slug, setSlug] = useState<string | null>(null);
  const [registry, setRegistry] = useState<DeckRegistry | undefined>(undefined);
  const [lookbookEntries, setLookbookEntries] = useState<LookbookEntry[]>([]);
  const [cardImageMap, setCardImageMap] = useState<Record<string, string>>({});
  const [cardModelProfileMap, setCardModelProfileMap] = useState<Record<string, { model_name?: { th?: string; en?: string }; signature_vibe?: { th?: string; en?: string }; editorial_note?: { th?: string; en?: string }; model_stats?: { height_cm?: number; chest_in?: number; waist_in?: number; shoe_eu?: number }; key_features?: { th?: string[]; en?: string[] } }>>({});
  const [selectedEntry, setSelectedEntry] = useState<LookbookEntry | null>(null);
  const [isAsian, setIsAsian] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'flipbook'>('grid');

  const { lang } = useLanguage();

  useEffect(() => {
    params.then(p => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (slug) {
      if (slug !== 'asian-vogue-tarot') {
        setResolved(true);
        return;
      }

      const r = getDeckRegistry(slug);
      setRegistry(r);
      setIsAsian(getDeckAspectRatio(slug) === '9:16');

      const bundle = getDeckBundle(slug);
      if (bundle?.lookbook) {
        setLookbookEntries(bundle.lookbook.entries);
      }
      if (bundle?.cards) {
        const imageMap: Record<string, string> = {};
        const modelMap: Record<string, { model_name?: { th?: string; en?: string }; signature_vibe?: { th?: string; en?: string }; editorial_note?: { th?: string; en?: string }; model_stats?: { height_cm?: number; chest_in?: number; waist_in?: number; shoe_eu?: number }; key_features?: { th?: string[]; en?: string[] } }> = {};
        bundle.cards.forEach(card => {
          imageMap[card.card_id] = card.image;
          if (card.model_profile) {
            modelMap[card.card_id] = card.model_profile as { model_name?: { th?: string; en?: string }; signature_vibe?: { th?: string; en?: string }; editorial_note?: { th?: string; en?: string }; model_stats?: { height_cm?: number; chest_in?: number; waist_in?: number; shoe_eu?: number }; key_features?: { th?: string[]; en?: string[] } };
          }
        });
        setCardImageMap(imageMap);
        setCardModelProfileMap(modelMap);
      }
      setResolved(true);
    }
  }, [slug]);

  const handleCardClick = (entry: LookbookEntry) => {
    setSelectedEntry(entry);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEntry(null);
  };

  if (!resolved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-amber-200/60">Loading...</div>
      </div>
    );
  }

  if (slug !== 'asian-vogue-tarot') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-100 mb-4">Lookbook Coming Soon</h1>
          <p className="text-amber-200/60">This deck doesn't have a lookbook yet.</p>
          <Link href={`/decks/${slug}`} className="text-amber-400 hover:text-amber-300 mt-4 inline-block">
            ← Back to Deck
          </Link>
        </div>
      </div>
    );
  }

  const cardWidth = 180;
  const cardHeight = 320;

  if (viewMode === 'flipbook' && lookbookEntries.length > 0) {
    return (
      <LookbookFlipBook
        entries={lookbookEntries}
        cardImageMap={cardImageMap}
        cardModelProfileMap={cardModelProfileMap}
        lang={lang as 'th' | 'en'}
        onClose={() => setViewMode('grid')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center p-4 sticky top-0 bg-stone-950/90 backdrop-blur-sm z-10">
        <Link href={`/decks/${slug}`} className="text-amber-200/70 hover:text-amber-100 transition-colors">
          ← {lang === 'th' ? 'กลับ' : 'Back'}
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('flipbook')}
            className="px-4 py-2 rounded-full bg-amber-800/40 text-amber-300 hover:bg-amber-700/50 text-sm transition-colors"
          >
            📖 {lang === 'th' ? 'Flip Book' : 'Flip Book'}
          </button>
          <LanguageToggle />
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <p className="text-amber-400/60 text-sm uppercase tracking-widest">
              {lang === 'th' ? 'Limited Edition' : 'Limited Edition'}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-amber-100 tracking-tight">
              MASTER LOOKBOOK
            </h1>
            <p className="text-amber-200/60 text-lg max-w-2xl mx-auto">
              {lang === 'th' 
                ? 'ภาพถ่ายและเรื่องราวเบื้องหลังของ The Archetype: Asian Vogue Tarot'
                : 'Photography and behind-the-scenes stories of The Archetype: Asian Vogue Tarot'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {lookbookEntries.map((entry) => {
              const cardModelProfile = cardModelProfileMap[entry.card_id];
              const editorial = entry.editorial_identity;

              return (
                <button
                  key={entry.card_id}
                  onClick={() => handleCardClick(entry)}
                  className="group text-left focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded-xl"
                >
                  <div 
                    className="relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02]"
                    style={{ 
                      aspectRatio: '2/3',
                      boxShadow: '0 8px 30px rgba(255, 200, 100, 0.15), 0 0 40px rgba(255, 200, 100, 0.08)',
                    }}
                  >
                    <Image
                      src={`/images/decks/${slug}/${cardImageMap[entry.card_id] || entry.card.image}`}
                      alt={entry.card.name[lang] || entry.card_id}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      unoptimized={true}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-amber-400/70 text-xs uppercase tracking-wider mb-1">
                        {entry.card.roman || entry.card.number}
                      </p>
                      <h3 className="text-xl font-semibold text-amber-100 mb-1">
                        {getLocalizedText(cardModelProfile?.model_name, lang) || cardModelProfile?.model_name?.en || entry.card.name[lang]}
                      </h3>
                      <p className="text-amber-200/60 text-sm">
                        {entry.card.name[lang]}
                      </p>
                    </div>

                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="w-8 h-8 rounded-full bg-amber-500/80 text-white flex items-center justify-center">
                        →
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {showModal && selectedEntry && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
          
          <div 
            className="relative z-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-3xl leading-none transition-colors"
            >
              ×
            </button>

            <div className="bg-stone-900/95 rounded-2xl p-6 md:p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/2">
                  <div 
                    className="relative rounded-xl overflow-hidden mx-auto"
                    style={{ 
                      width: cardWidth, 
                      height: cardHeight,
                      boxShadow: '0 12px 40px rgba(255, 200, 100, 0.2), 0 0 60px rgba(255, 200, 100, 0.1)',
                    }}
                  >
                    <Image
                      src={`/images/decks/${slug}/${cardImageMap[selectedEntry.card_id] || selectedEntry.card.image}`}
                      alt={selectedEntry.card.name[lang] || selectedEntry.card_id}
                      fill
                      className="object-cover"
                      unoptimized={true}
                    />
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-amber-400/70 text-sm uppercase tracking-wider">
                      {selectedEntry.card.roman || selectedEntry.card.number}
                    </p>
                    <h2 className="text-2xl font-bold text-amber-100 mt-1">
                      {getLocalizedText(cardModelProfileMap[selectedEntry.card_id]?.model_name, lang) || cardModelProfileMap[selectedEntry.card_id]?.model_name?.en}
                    </h2>
                    <p className="text-amber-200/60 text-sm mt-1">
                      {selectedEntry.card.name[lang]}
                    </p>
                  </div>
                </div>

                <div className="lg:w-1/2 space-y-6">
                  {cardModelProfileMap[selectedEntry.card_id]?.signature_vibe && (
                    <div>
                      <h4 className="text-amber-400/60 text-xs uppercase tracking-wider mb-2">
                        {lang === 'th' ? 'สไตล์' : 'Signature Vibe'}
                      </h4>
                      <p className="text-xl text-amber-100 font-medium">
                        {getLocalizedText(cardModelProfileMap[selectedEntry.card_id]?.signature_vibe, lang) || cardModelProfileMap[selectedEntry.card_id]?.signature_vibe?.en}
                      </p>
                    </div>
                  )}

                  {cardModelProfileMap[selectedEntry.card_id]?.model_stats && Object.keys(cardModelProfileMap[selectedEntry.card_id]?.model_stats || {}).length > 0 && (
                    <div>
                      <h4 className="text-amber-400/60 text-xs uppercase tracking-wider mb-2">
                        {lang === 'th' ? 'สัดส่วน' : 'Stats'}
                      </h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        {cardModelProfileMap[selectedEntry.card_id]?.model_stats?.height_cm && (
                          <span><span className="text-amber-300/70">ส่วนสูง:</span> <span className="text-amber-200">{cardModelProfileMap[selectedEntry.card_id]?.model_stats?.height_cm} cm</span></span>
                        )}
                        {cardModelProfileMap[selectedEntry.card_id]?.model_stats?.chest_in && (
                          <span><span className="text-amber-300/70">อก:</span> <span className="text-amber-200">{cardModelProfileMap[selectedEntry.card_id]?.model_stats?.chest_in}"</span></span>
                        )}
                        {cardModelProfileMap[selectedEntry.card_id]?.model_stats?.waist_in && (
                          <span><span className="text-amber-300/70">เอว:</span> <span className="text-amber-200">{cardModelProfileMap[selectedEntry.card_id]?.model_stats?.waist_in}"</span></span>
                        )}
                        {cardModelProfileMap[selectedEntry.card_id]?.model_stats?.shoe_eu && (
                          <span><span className="text-amber-300/70">รองเท้า:</span> <span className="text-amber-200">EU {cardModelProfileMap[selectedEntry.card_id]?.model_stats?.shoe_eu}</span></span>
                        )}
                      </div>
                    </div>
                  )}

                  {cardModelProfileMap[selectedEntry.card_id]?.key_features && (
                    (() => {
                      const features = cardModelProfileMap[selectedEntry.card_id]?.key_features?.[lang] || cardModelProfileMap[selectedEntry.card_id]?.key_features?.en || [];
                      if (!Array.isArray(features) || features.length === 0) return null;
                      return (
                        <div>
                          <h4 className="text-amber-400/60 text-xs uppercase tracking-wider mb-2">
                            {lang === 'th' ? 'ลักษณะเด่น' : 'Key Features'}
                          </h4>
                          <ul className="text-amber-200/80 text-sm space-y-1">
                            {features.map((feature: string, i: number) => (
                              <li key={i}>• {feature}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()
                  )}

                  {cardModelProfileMap[selectedEntry.card_id]?.editorial_note && 
                   getLocalizedText(cardModelProfileMap[selectedEntry.card_id]?.editorial_note, lang) && (
                    <div>
                      <h4 className="text-amber-400/60 text-xs uppercase tracking-wider mb-2">
                        {lang === 'th' ? 'หมายเหตุการถ่ายทำ' : 'Editorial Note'}
                      </h4>
                      <p className="text-amber-200/80 leading-relaxed">
                        {getLocalizedText(cardModelProfileMap[selectedEntry.card_id]?.editorial_note, lang)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
