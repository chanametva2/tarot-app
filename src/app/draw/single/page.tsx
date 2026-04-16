'use client';

import { useState } from 'react';
import Link from 'next/link';
import { drawCard } from '@/lib/tarot/draw';
import { TarotCard } from '@/components/tarot/TarotCard';
import { useLanguage, LanguageToggle } from '@/components/ui/LanguageContext';
import { ShuffleAnimation, CardFlipAnimation, DeckStack } from '@/components/tarot/ShuffleAnimation';
import { JournalModal } from '@/components/ui/JournalModal';
import { DrawResult } from '@/lib/tarot/types';

export default function SingleDrawPage() {
  const { lang } = useLanguage();
  const [result, setResult] = useState<DrawResult | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  
  const handleDraw = () => {
    if (isShuffling) return;
    
    setIsShuffling(true);
    setShowCard(false);
    setResult(null);
    
    setTimeout(() => {
      const drawn = drawCard();
      setResult(drawn);
      setIsShuffling(false);
      
      setTimeout(() => {
        setShowCard(true);
      }, 100);
    }, 1500);
  };
  
  const handleReset = () => {
    setResult(null);
    setShowCard(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center p-4">
        <Link href="/" className="text-amber-200/70 hover:text-amber-100 transition-colors">
          ← {lang === 'th' ? 'กลับ' : 'Back'}
        </Link>
        <LanguageToggle />
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-amber-100">
              {lang === 'th' ? 'ไพ่ใบเดียว' : 'Single Card Draw'}
            </h1>
            <p className="text-amber-200/70 text-sm">
              {lang === 'th' ? 'เปิดไพ่ 1 ใบสำหรับคำถามง่ายๆ' : 'Draw 1 card for a quick question'}
            </p>
          </div>
          
          <div className="flex justify-center py-8">
            {isShuffling ? (
              <div className="flex flex-col items-center gap-4">
                <DeckStack count={5} />
                <ShuffleAnimation cardCount={1} isShuffling={isShuffling} />
              </div>
            ) : result ? (
              <CardFlipAnimation show={showCard}>
                <TarotCard draw={result} size="lg" showMeaning={true} />
              </CardFlipAnimation>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <DeckStack count={5} />
                <div className="w-52 h-72 rounded-xl border-2 border-dashed border-amber-700/40 flex items-center justify-center text-amber-700/50">
                  <span className="text-lg">{lang === 'th' ? 'กดปุ่มเพื่อเปิดไพ่' : 'Press to draw'}</span>
                </div>
              </div>
            )}
          </div>
          
          {result && showCard && result.meaning && (
            <div className="text-left space-y-4 p-4 rounded-xl bg-amber-900/20 border border-amber-700/30">
              <div>
                <h3 className="text-sm font-medium text-amber-400 mb-1">
                  {lang === 'th' ? 'ความหมาย' : 'Meaning'}
                </h3>
                <p className="text-amber-100 text-sm">
                  {result.orientation === 'upright' 
                    ? result.meaning.upright?.[lang]?.join(' ')
                    : result.meaning.reversed?.[lang]?.join(' ')}
                </p>
              </div>
              
              {result.meaning.reflection && (
                <div>
                  <h3 className="text-sm font-medium text-amber-400 mb-1">
                    {lang === 'th' ? 'คำถามสะท้อน' : 'Reflection'}
                  </h3>
                  <p className="text-amber-200/80 text-sm italic">
                    {result.meaning.reflection[lang]}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-3 justify-center flex-wrap">
            {result ? (
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
                  : (lang === 'th' ? 'เปิดไพ่' : 'Draw Card')}
              </button>
            )}
          </div>
        </div>
      </main>
      
      {result && (
        <JournalModal
          isOpen={showJournal}
          onClose={() => setShowJournal(false)}
          cards={[result]}
          spreadType="single"
        />
      )}
    </div>
  );
}
