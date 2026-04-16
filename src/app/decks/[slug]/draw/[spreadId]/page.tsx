'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { drawCards, getSpreadById, getDeckRegistry, getLookbookEntry, getGuidebookEntry, getDeckAspectRatio } from '@/lib/tarot/deckLoader';
import { TarotCard } from '@/components/tarot/TarotCard';
import { CardModal } from '@/components/tarot/CardModal';
import { useLanguage, LanguageToggle } from '@/components/ui/LanguageContext';
import { DrawResult, SpreadPosition, DeckRegistry, LookbookEntry, GuidebookEntry } from '@/lib/tarot/types';
import { ShuffleAnimation, CardFlipAnimation } from '@/components/tarot/ShuffleAnimation';
import { JournalModal } from '@/components/ui/JournalModal';

interface PageProps {
  params: Promise<{ slug: string; spreadId: string }>;
}

export default function DeckDrawPage({ params }: PageProps) {
  const [results, setResults] = useState<DrawResult[] | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [spread, setSpread] = useState<ReturnType<typeof getSpreadById>>(undefined);
  const [registry, setRegistry] = useState<DeckRegistry | undefined>(undefined);
  const [resolved, setResolved] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [spreadId, setSpreadId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<DrawResult | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedLookbookEntry, setSelectedLookbookEntry] = useState<LookbookEntry | undefined>(undefined);
  const [aspectRatio, setAspectRatio] = useState('2/3');
  const [selectedGuidebookEntry, setSelectedGuidebookEntry] = useState<GuidebookEntry | undefined>(undefined);
  
  const { lang } = useLanguage();

  useEffect(() => {
    params.then(p => {
      setSlug(p.slug);
      setSpreadId(p.spreadId);
    });
  }, [params]);

  useEffect(() => {
    if (slug) {
      const r = getDeckRegistry(slug);
      setRegistry(r);
      const ratio = getDeckAspectRatio(slug);
      setAspectRatio(ratio === '9:16' ? '9/16' : '2/3');
    }
  }, [slug]);

  useEffect(() => {
    if (spreadId && slug) {
      const s = getSpreadById(spreadId, slug);
      if (!s) {
        notFound();
      }
      setSpread(s);
      setResolved(true);
    }
  }, [spreadId, slug]);

  const handleCardClick = (draw: DrawResult) => {
    setSelectedCard(draw);
    if (slug) {
      setSelectedLookbookEntry(getLookbookEntry(draw.card.card_id, slug));
      setSelectedGuidebookEntry(getGuidebookEntry(draw.card.card_id, slug));
    }
    setShowCardModal(true);
  };

  const handleCloseModal = () => {
    setShowCardModal(false);
    setSelectedCard(null);
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

  if (!spread || !registry) {
    notFound();
  }

  const positions: SpreadPosition[] = spread.positions;
  const isSingleCard = spread.card_count === 1;

  const handleDraw = () => {
    if (isShuffling) return;
    
    setIsShuffling(true);
    setShowCards(false);
    setResults(null);
    
    setTimeout(() => {
      const drawn = drawCards(spread.card_count, slug || undefined);
      setResults(drawn);
      setIsShuffling(false);
      
      setTimeout(() => {
        setShowCards(true);
      }, 100);
    }, isSingleCard ? 1500 : 2000);
  };
  
  const handleReset = () => {
    setResults(null);
    setShowCards(false);
  };

  const renderCardSlots = () => {
    if (isSingleCard) {
      return (
        <div className="flex justify-center py-8">
          {isShuffling ? (
            <div className="flex flex-col items-center gap-4">
              <ShuffleAnimation cardCount={1} isShuffling={isShuffling} deckSlug={slug || undefined} />
            </div>
          ) : results ? (
            <CardFlipAnimation show={showCards}>
              <TarotCard 
                draw={results[0]} 
                size="lg" 
                showMeaning={true} 
                deckSlug={slug || undefined}
                onClick={() => handleCardClick(results[0])}
              />
            </CardFlipAnimation>
          ) : (
            <div className="w-52 rounded-xl border-2 border-dashed border-amber-700/40 flex items-center justify-center text-amber-700/50" style={{ aspectRatio }}>
              <span className="text-lg">{lang === 'th' ? 'กดปุ่มเพื่อเปิดไพ่' : 'Press to draw'}</span>
            </div>
          )}
        </div>
      );
    }

    if (positions.length === 3) {
      return (
        <div className="overflow-visible py-8 px-4">
          <div className={`flex gap-6 px-4 ${isShuffling ? 'justify-center' : 'justify-center'}`}>
            {isShuffling ? (
              <ShuffleAnimation cardCount={3} isShuffling={isShuffling} deckSlug={slug || undefined} />
            ) : results ? (
              positions.map((pos, index) => (
                <CardFlipAnimation key={pos.position} show={showCards}>
                  <div className="flex flex-col items-center gap-3 w-48">
                    <span className="text-amber-400/80 text-sm font-medium px-3 py-1 rounded-full bg-amber-900/30 whitespace-nowrap">
                      {pos.label[lang]}
                    </span>
                    <TarotCard 
                      draw={results[index]} 
                      size="md" 
                      showMeaning={false} 
                      deckSlug={slug || undefined}
                      onClick={() => handleCardClick(results[index])}
                    />
                    <div className="text-center space-y-1">
                      <p className="text-amber-100 text-sm">{results[index].card.name[lang]}</p>
                      <p className="text-amber-200/80 text-sm">
                        {results[index].orientation === 'upright' 
                          ? results[index].meaning.upright?.[lang]?.slice(0, 2).join(' ')
                          : results[index].meaning.reversed?.[lang]?.slice(0, 2).join(' ')}
                      </p>
                    </div>
                  </div>
                </CardFlipAnimation>
              ))
            ) : (
              positions.map((pos) => (
                <div key={pos.position} className="flex flex-col items-center gap-3 w-48">
                  <span className="text-amber-400/80 text-sm font-medium px-3 py-1 rounded-full bg-amber-900/30 whitespace-nowrap">
                    {pos.label[lang]}
                  </span>
                  <div className="w-40 rounded-xl border-2 border-dashed border-amber-700/40 flex items-center justify-center text-amber-700/50" style={{ aspectRatio }}>
                    ?
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-visible py-8 px-4">
        <div className={`flex gap-4 px-4 ${isShuffling ? 'justify-center' : 'justify-center flex-wrap'}`}>
          {isShuffling ? (
            <ShuffleAnimation cardCount={Math.min(spread.card_count, 5)} isShuffling={isShuffling} deckSlug={slug || undefined} />
          ) : results ? (
            positions.map((pos, index) => (
              <CardFlipAnimation key={pos.position} show={showCards}>
                <div className="flex flex-col items-center gap-3 w-44">
                  <span className="text-amber-400/80 text-sm font-medium px-3 py-1 rounded-full bg-amber-900/30 whitespace-nowrap">
                    {pos.label[lang]}
                  </span>
                   <TarotCard 
                      draw={results[index]} 
                      size="md" 
                      showMeaning={false} 
                      deckSlug={slug || undefined}
                      onClick={() => handleCardClick(results[index])}
                    />
                    <div className="text-center space-y-1">
                      <p className="text-amber-100 text-sm">{results[index].card.name[lang]}</p>
                      <p className="text-amber-200/80 text-xs">
                        {results[index].meaning.upright?.[lang]?.slice(0, 2).join(' ')}
                      </p>
                    </div>
                  </div>
                </CardFlipAnimation>
              ))
            ) : (
              positions.map((pos) => (
              <div key={pos.position} className="flex flex-col items-center gap-3 w-44">
                <span className="text-amber-400/80 text-sm font-medium px-3 py-1 rounded-full bg-amber-900/30 whitespace-nowrap">
                  {pos.label[lang]}
                </span>
                <div className="w-40 rounded-xl border-2 border-dashed border-amber-700/40 flex items-center justify-center text-amber-700/50" style={{ aspectRatio }}>
                  ?
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderDetails = () => {
    if (!results || !showCards) return null;

    if (isSingleCard) {
      return (
        <div className="text-left space-y-4 p-4 rounded-xl bg-amber-900/20 border border-amber-700/30">
          <div>
            <h3 className="text-sm font-medium text-amber-400 mb-1">
              {lang === 'th' ? 'ความหมาย' : 'Meaning'}
            </h3>
            <p className="text-amber-100 text-sm">
              {results[0].orientation === 'upright' 
                ? results[0].meaning.upright?.[lang]?.join(' ')
                : results[0].meaning.reversed?.[lang]?.join(' ')}
            </p>
          </div>
          
          {results[0].meaning.reflection && (
            <div>
              <h3 className="text-sm font-medium text-amber-400 mb-1">
                {lang === 'th' ? 'คำถามสะท้อน' : 'Reflection'}
              </h3>
              <p className="text-amber-200/80 text-sm italic">
                {results[0].meaning.reflection[lang]}
              </p>
            </div>
          )}
        </div>
      );
    }

    if (positions.length === 3) {
      return (
        <div className="mt-8 space-y-6 text-left">
          {positions.map((pos, index) => (
            <div key={pos.position} className="p-4 rounded-xl bg-amber-900/20 border border-amber-700/30">
              <h3 className="font-medium text-amber-100 mb-2">
                {pos.label[lang]} - {results[index].card.name[lang]}
                {results[index].orientation === 'reversed' && ` (${lang === 'th' ? 'กลับหัว' : 'Reversed'})`}
              </h3>
              <p className="text-amber-200/80 text-sm">
                {results[index].orientation === 'upright' 
                  ? results[index].meaning.upright?.[lang]?.join(' ')
                  : results[index].meaning.reversed?.[lang]?.join(' ')}
              </p>
              {results[index].meaning.reflection && (
                <p className="text-amber-300/70 text-sm italic mt-2">
                  {results[index].meaning.reflection[lang]}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        {positions.map((pos, index) => (
          <div key={pos.position} className="p-4 rounded-xl bg-amber-900/20 border border-amber-700/30">
            <h3 className="font-medium text-amber-100 mb-1">
              {pos.label[lang]}
            </h3>
            <p className="text-amber-400 text-sm mb-2">
              {results[index].card.name[lang]}
            </p>
            <p className="text-amber-200/80 text-sm">
              {results[index].meaning.upright?.[lang]?.join(' ')}
            </p>
            {results[index].meaning.core_dhamma?.[lang] && (
              <div className="mt-2 flex flex-wrap gap-1">
                {results[index].meaning.core_dhamma?.[lang]?.map((d, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-amber-800/40 text-amber-300/80">
                    {d}
                  </span>
                ))}
              </div>
            )}
            {results[index].meaning.reflection && (
              <p className="text-amber-300/70 text-sm italic mt-3">
                {results[index].meaning.reflection[lang]}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center p-4">
        <Link href={`/decks/${slug}`} className="text-amber-200/70 hover:text-amber-100 transition-colors">
          ← {lang === 'th' ? 'กลับ' : 'Back'}
        </Link>
        <LanguageToggle />
      </header>
      
      <main className="flex-1 flex flex-col items-center px-6 py-8">
        <div className={`w-full text-center space-y-6 ${isSingleCard ? 'max-w-md' : 'max-w-4xl'}`}>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-amber-100">
              {spread.name[lang]}
            </h1>
            <p className="text-amber-200/70 text-sm">
              {positions.map(p => p.label[lang]).join(' · ')}
            </p>
          </div>
          
          {renderCardSlots()}
          {renderDetails()}
          
          <div className="flex gap-3 justify-center flex-wrap">
            {results ? (
              <>
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-full border border-amber-700/50 hover:bg-amber-900/30 text-amber-200 font-medium transition-colors text-sm"
                >
                  {lang === 'th' ? 'วางไพ่' : 'Reset'}
                </button>
                <button
                  onClick={() => setShowJournal(true)}
                  className="px-5 py-2.5 rounded-full border border-amber-700/50 hover:bg-amber-900/30 text-amber-200 font-medium transition-colors text-sm"
                >
                  {lang === 'th' ? 'บันทึก' : 'Save'}
                </button>
                <button
                  onClick={handleDraw}
                  className="px-5 py-2.5 rounded-full bg-amber-700/50 hover:bg-amber-700/70 text-amber-100 font-medium transition-colors text-sm"
                >
                  {lang === 'th' ? 'เปิดใหม่' : 'Draw Again'}
                </button>
              </>
            ) : (
              <button
                onClick={handleDraw}
                disabled={isShuffling}
                className="px-8 py-3 rounded-full bg-amber-700/50 hover:bg-amber-700/70 text-amber-100 font-medium transition-colors disabled:opacity-50"
              >
                {isShuffling 
                  ? (lang === 'th' ? 'กำลังสับไพ่...' : 'Shuffling...')
                  : (lang === 'th' ? 'เปิดไพ่' : 'Draw Cards')}
              </button>
            )}
          </div>
        </div>
      </main>
      
      <CardModal
        draw={selectedCard}
        isOpen={showCardModal}
        onClose={handleCloseModal}
        deckSlug={slug || undefined}
        lookbookEntry={selectedLookbookEntry}
        guidebookEntry={selectedGuidebookEntry}
      />
      
      {results && (
        <JournalModal
          isOpen={showJournal}
          onClose={() => setShowJournal(false)}
          cards={results}
          spreadType={`/decks/${slug}/draw/${spreadId}`}
        />
      )}
    </div>
  );
}
