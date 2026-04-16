'use client';

import { useState } from 'react';
import Link from 'next/link';
import { drawCardsWithFixedOrientation } from '@/lib/tarot/draw';
import { TarotCard } from '@/components/tarot/TarotCard';
import { useLanguage, LanguageToggle } from '@/components/ui/LanguageContext';
import { DrawResult, SpreadPosition } from '@/lib/tarot/types';
import { ShuffleAnimation, CardFlipAnimation } from '@/components/tarot/ShuffleAnimation';
import { JournalModal } from '@/components/ui/JournalModal';
import { getSpreadById } from '@/lib/tarot/loader';

const positions: SpreadPosition[] = getSpreadById('four_noble_truths')?.positions || [];

export default function FourNobleTruthsPage() {
  const { lang } = useLanguage();
  const [results, setResults] = useState<DrawResult[] | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  
  const handleDraw = () => {
    if (isShuffling) return;
    
    setIsShuffling(true);
    setShowCards(false);
    setResults(null);
    
    setTimeout(() => {
      const drawn = drawCardsWithFixedOrientation(4);
      setResults(drawn);
      setIsShuffling(false);
      
      setTimeout(() => {
        setShowCards(true);
      }, 100);
    }, 2000);
  };
  
  const handleReset = () => {
    setResults(null);
    setShowCards(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center p-4">
        <Link href="/" className="text-amber-200/70 hover:text-amber-100 transition-colors">
          ← {lang === 'th' ? 'กลับ' : 'Back'}
        </Link>
        <LanguageToggle />
      </header>
      
      <main className="flex-1 flex flex-col items-center px-6 py-8">
        <div className="max-w-4xl w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-amber-100">
              {lang === 'th' ? 'อริยสัจสี่' : 'Four Noble Truths Spread'}
            </h1>
            <p className="text-amber-200/70 text-sm">
              {lang === 'th' ? 'ทุกข์ · สมุทัย · นิโรธ · มรรค' : 'Dukkha · Samudaya · Nirodha · Magga'}
            </p>
          </div>
          
          <div className="flex justify-center gap-8 py-8 flex-wrap">
            {isShuffling ? (
              <div className="flex flex-col items-center gap-4">
                <ShuffleAnimation cardCount={4} isShuffling={isShuffling} />
              </div>
            ) : results ? (
              positions.map((pos, index) => (
                <CardFlipAnimation key={pos.position} show={showCards}>
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-amber-400/80 text-sm font-medium px-3 py-1 rounded-full bg-amber-900/30">
                      {pos.label[lang]}
                    </span>
                    <TarotCard draw={results[index]} size="md" showMeaning={false} />
                    
                    <div className="text-left max-w-xs space-y-2 mt-2">
                      <p className="text-amber-100 text-sm">
                        {results[index].card.name[lang]}
                      </p>
                      <p className="text-amber-200/80 text-sm">
                        {results[index].meaning.upright?.[lang]?.slice(0, 2).join(' ')}
                      </p>
                    </div>
                  </div>
                </CardFlipAnimation>
              ))
            ) : (
              <div className="flex gap-6 flex-wrap justify-center">
                {positions.map((pos) => (
                  <div key={pos.position} className="flex flex-col items-center gap-3">
                    <span className="text-amber-400/80 text-sm font-medium px-3 py-1 rounded-full bg-amber-900/30">
                      {pos.label[lang]}
                    </span>
                    <div className="w-40 h-56 rounded-xl border-2 border-dashed border-amber-700/40 flex items-center justify-center text-amber-700/50">
                      ?
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {results && showCards && (
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
                      💭 {results[index].meaning.reflection[lang]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          
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
                  📖 {lang === 'th' ? 'บันทึก' : 'Save'}
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
      
      {results && (
        <JournalModal
          isOpen={showJournal}
          onClose={() => setShowJournal(false)}
          cards={results}
          spreadType="four-noble-truths"
        />
      )}
    </div>
  );
}
