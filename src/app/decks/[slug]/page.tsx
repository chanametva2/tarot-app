'use client';

import Link from 'next/link';
import Image from 'next/image';
import { use, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { getDeckRegistry, getDeckBundle, getCardById, getMeaningByCardId, getAllSpreads, getDeckAspectRatio } from '@/lib/tarot/deckLoader';
import { getDailyCardId } from '@/lib/tarot/daily';
import { useLanguage, LanguageToggle } from '@/components/ui/LanguageContext';
import { DeckRegistry, Spread } from '@/lib/tarot/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function getDeckCoverImage(deckSlug: string): string {
  if (deckSlug === 'dhamma-path-tarot') {
    return '/images/decks/dhamma-path-tarot/images/cover.jpg';
  }
  if (deckSlug === 'asian-vogue-tarot') {
    return '/images/decks/asian-vogue-tarot/images/cover.png';
  }
  return '/images/decks/${deckSlug}/images/cover.png';
}

function SpreadVisual({ cardCount }: { cardCount: number }) {
  const cardStyle = "w-8 h-10 rounded border border-amber-600/50 bg-amber-900/30 flex items-center justify-center text-amber-400 text-xs";
  
  if (cardCount === 1) {
    return (
      <div className="relative w-12 h-16 rounded border-2 border-amber-600/50 bg-amber-900/30 flex items-center justify-center">
        <span className="text-amber-400 text-sm">○</span>
      </div>
    );
  }
  
  if (cardCount === 3) {
    return (
      <div className="flex gap-1">
        <div className={cardStyle}>1</div>
        <div className={cardStyle}>2</div>
        <div className={cardStyle}>3</div>
      </div>
    );
  }
  
  if (cardCount === 4) {
    return (
      <div className="relative w-14 h-14">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-10 rounded border border-amber-600/50 bg-amber-900/30 flex items-center justify-center text-amber-400 text-xs">
          D
        </div>
        <div className="absolute bottom-0 left-0 w-8 h-10 rounded border border-amber-600/50 bg-amber-900/30 flex items-center justify-center text-amber-400 text-xs">
          S
        </div>
        <div className="absolute bottom-0 right-0 w-8 h-10 rounded border border-amber-600/50 bg-amber-900/30 flex items-center justify-center text-amber-400 text-xs">
          N
        </div>
      </div>
    );
  }
  
  if (cardCount === 5) {
    return (
      <div className="flex flex-col gap-1 items-center">
        <div className={cardStyle}>1</div>
        <div className="flex gap-1">
          <div className={cardStyle}>2</div>
          <div className={cardStyle}>3</div>
        </div>
        <div className="flex gap-1">
          <div className={cardStyle}>4</div>
          <div className={cardStyle}>5</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex gap-1 flex-wrap justify-center max-w-16">
      {Array.from({ length: Math.min(cardCount, 6) }, (_, i) => (
        <div key={i} className={cardStyle}>{i + 1}</div>
      ))}
      {cardCount > 6 && <span className="text-amber-400 text-xs">+{cardCount - 6}</span>}
    </div>
  );
}

export default function DeckHomePage({ params }: PageProps) {
  const { slug } = use(params);
  const { lang } = useLanguage();
  const [registry, setRegistry] = useState<DeckRegistry | undefined>(undefined);
  const [dailyCardId, setDailyCardId] = useState<string | undefined>(undefined);
  const [spreads, setSpreads] = useState<Spread[]>([]);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    const r = getDeckRegistry(slug);
    setRegistry(r);
    
    if (r) {
      const bundle = getDeckBundle(slug);
      if (bundle) {
        const seed = parseInt(slug.replace(/\D/g, '') || '0') * 1000 + new Date().getDate();
        const cards = bundle.cards;
        const index = seed % cards.length;
        setDailyCardId(cards[index]?.card_id);
        setSpreads(getAllSpreads(slug));
      }
    }
    setResolved(true);
  }, [slug]);

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

  const dailyCard = dailyCardId ? getCardById(dailyCardId, slug) : undefined;
  const dailyMeaning = dailyCardId ? getMeaningByCardId(dailyCardId, slug) : undefined;
  const isAsian = getDeckAspectRatio(slug) === '9:16';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center p-4">
        <div className="flex gap-4 text-sm">
          <Link href="/decks" className="text-amber-200/70 hover:text-amber-100 transition-colors">
            ← {lang === 'th' ? 'เลือกสำรับ' : 'Decks'}
          </Link>
          <Link href={`/decks/${slug}/cards`} className="text-amber-200/70 hover:text-amber-100 transition-colors">
            📚 {lang === 'th' ? 'ไพ่ทั้งหมด' : 'All Cards'}
          </Link>
          {slug === 'asian-vogue-tarot' && (
            <Link href={`/decks/${slug}/lookbook`} className="text-amber-200/70 hover:text-amber-100 transition-colors">
              ✨ Lookbook
            </Link>
          )}
        </div>
        <LanguageToggle />
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-8">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="relative w-24 h-32 mx-auto rounded-xl overflow-hidden shadow-2xl border border-amber-700/30">
              <Image
                src={getDeckCoverImage(slug)}
                alt="Deck Cover"
                fill
                className="object-cover"
                priority
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-amber-100">
                {registry.title[lang]}
              </h1>
              <p className="text-amber-200/60 text-sm mt-1">
                {registry.subtitle[lang]}
              </p>
            </div>
          </div>

          {dailyCard && dailyMeaning && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-amber-400/70 text-sm uppercase tracking-wider">
                  {lang === 'th' ? 'ไพ่ประจำวัน' : 'Daily Card'}
                </h2>
              </div>

              <Link href={`/decks/${slug}/cards/${dailyCardId}`} className="group block">
                <div className="relative p-4 rounded-2xl border border-amber-600/40 bg-gradient-to-br from-amber-900/40 to-stone-900/60 hover:from-amber-900/60 hover:to-stone-900/80 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0 rounded-lg overflow-hidden shadow-lg group-hover:scale-105 transition-transform" style={{ width: isAsian ? 90 : 112, height: isAsian ? 160 : 168 }}>
                      <Image
                        src={`/images/decks/${slug}/${dailyCard.image}`}
                        alt={dailyCard.name[lang] || dailyCardId || 'Daily Card'}
                        width={isAsian ? 90 : 112}
                        height={isAsian ? 160 : 168}
                        className="object-cover"
                        priority
                        quality={85}
                        unoptimized={true}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-amber-100 group-hover:text-amber-200 transition-colors">
                        {dailyCard.name[lang] || dailyCardId}
                      </h3>
                      <p className="text-amber-200/50 text-xs mt-0.5">
                        {dailyCard.arcana === 'major' ? 'Major Arcana' : `${dailyCard.suit_key?.toUpperCase()} ${dailyCard.rank}`}
                      </p>
                      <p className="text-amber-200/70 text-sm mt-2 line-clamp-2">
                        {dailyMeaning.upright?.[lang]?.[0]}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-800/50 text-amber-300 group-hover:bg-amber-700/60 group-hover:scale-110 transition-all text-sm">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-center text-amber-400/70 text-sm uppercase tracking-wider">
              {lang === 'th' ? 'เลือกวิธีเปิดไพ่' : 'Choose a Spread'}
            </h2>

            <div className="grid gap-3">
              {spreads.map((spread) => {
                const description = spread.positions
                  .map(p => p.label[lang])
                  .join(' · ');

                return (
                  <Link
                    key={spread.spread_id}
                    href={`/decks/${slug}/draw/${spread.spread_id}`}
                    className="group block"
                  >
                    <div className="relative p-4 rounded-xl border border-amber-700/30 bg-gradient-to-br from-amber-900/30 to-stone-900/50 hover:from-amber-900/50 hover:to-stone-900/70 hover:border-amber-600/50 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <SpreadVisual cardCount={spread.card_count} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-amber-100 group-hover:text-amber-200 transition-colors">
                            {spread.name[lang]}
                          </h3>
                          <p className="text-amber-200/60 text-sm mt-0.5">
                            {description}
                          </p>
                        </div>

                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-800/50 text-amber-300 group-hover:bg-amber-700/60 group-hover:scale-110 transition-all">
                            →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <Link
              href={`/decks/${slug}/draw/freeform`}
              className="group block"
            >
              <div className="relative p-4 rounded-xl border border-dashed border-amber-600/50 bg-amber-900/20 hover:from-amber-900/40 hover:to-stone-900/60 hover:border-amber-500/70 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="relative w-8 h-10">
                      <div className="absolute inset-0 rounded bg-amber-800/50" style={{ transform: 'translate(4px, 4px)' }} />
                      <div className="absolute inset-0 rounded bg-amber-700/60" style={{ transform: 'translate(2px, 2px)' }} />
                      <div className="absolute inset-0 rounded bg-amber-600/70 border border-amber-500/30 flex items-center justify-center">
                        <span className="text-amber-300 text-xs">?</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-amber-100 group-hover:text-amber-200 transition-colors">
                      {lang === 'th' ? 'เลือกไพ่เอง' : 'Free Pick'}
                    </h3>
                    <p className="text-amber-200/60 text-sm mt-0.5">
                      {lang === 'th' ? 'หยิบไพ่จากกองด้วยตัวเอง' : 'Pick cards from the deck yourself'}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-800/50 text-amber-300 group-hover:bg-amber-700/60 group-hover:scale-110 transition-all">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <p className="text-center text-amber-100/30 text-xs">
            {registry.card_count} cards | {registry.author}
          </p>
        </div>
      </main>
    </div>
  );
}
