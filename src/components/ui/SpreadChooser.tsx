'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LanguageToggle } from '@/components/ui/LanguageContext';
import { getDeckManifest, getCardById, getMeaningByCardId, getAllSpreads } from '@/lib/tarot/loader';
import { useLanguage } from '@/components/ui/LanguageContext';
import { getDailyCardId, getFormattedDate } from '@/lib/tarot/daily';

export function SpreadChooser() {
  const { lang } = useLanguage();
  const manifest = getDeckManifest();
  const dailyCardId = getDailyCardId();
  const dailyCard = getCardById(dailyCardId);
  const dailyMeaning = getMeaningByCardId(dailyCardId);
  const spreads = getAllSpreads();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center p-4">
        <div className="flex gap-4 text-sm">
          <Link href="/journal" className="text-amber-200/70 hover:text-amber-100 transition-colors">
            📖 {lang === 'th' ? 'สมุดบันทึก' : 'Journal'}
          </Link>
          <Link href="/favorites" className="text-amber-200/70 hover:text-amber-100 transition-colors">
            ★ {lang === 'th' ? 'ชอบ' : 'Favorites'}
          </Link>
        </div>
        <LanguageToggle />
      </header>
      
      <main className="flex-1 flex flex-col items-center px-6 py-8">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="relative w-24 h-32 mx-auto rounded-xl overflow-hidden shadow-2xl border border-amber-700/30">
              <Image
                src="/images/cover.webp"
                alt="Deck Cover"
                fill
                className="object-cover"
                priority
              />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-amber-100">
                {manifest.title[lang]}
              </h1>
              <p className="text-amber-200/60 text-sm mt-1">
                {manifest.subtitle[lang]}
              </p>
            </div>
          </div>
          
          {dailyCard && dailyMeaning && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-amber-400/70 text-sm uppercase tracking-wider">
                  {lang === 'th' ? 'ไพ่ประจำวัน' : 'Daily Card'}
                </h2>
                <span className="text-amber-100/40 text-xs">
                  {getFormattedDate(lang)}
                </span>
              </div>
              
              <Link href={`/cards/${dailyCardId}`} className="group block">
                <div className="relative p-4 rounded-2xl border border-amber-600/40 bg-gradient-to-br from-amber-900/40 to-stone-900/60 hover:from-amber-900/60 hover:to-stone-900/80 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                      <Image
                        src={`/${dailyCard.image}`}
                        alt={dailyCard.name[lang] || dailyCardId}
                        fill
                        className="object-cover"
                        priority
                        quality={85}
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
                        {dailyMeaning.upright?.[lang]?.slice(0, 1)}
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
                    href={`/draw/${spread.spread_id}`}
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
          </div>
          
          <p className="text-center text-amber-100/30 text-xs">
            {manifest.card_count} cards | {manifest.author}
          </p>
        </div>
      </main>
    </div>
  );
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
