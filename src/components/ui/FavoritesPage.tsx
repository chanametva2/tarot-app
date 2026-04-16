'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useFavorites } from './FavoritesContext';
import { useLanguage } from './LanguageContext';
import { getCardById } from '@/lib/tarot/loader';

export function FavoritesPage() {
  const { lang } = useLanguage();
  const { favorites } = useFavorites();

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="flex justify-between items-center p-4">
          <Link href="/" className="text-amber-200/70 hover:text-amber-100 transition-colors">
            ← {lang === 'th' ? 'กลับ' : 'Back'}
          </Link>
        </header>
        
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="text-center space-y-4">
            <div className="text-6xl opacity-30">★</div>
            <h1 className="text-xl font-semibold text-amber-100">
              {lang === 'th' ? 'ยังไม่มีไพ่ที่ชอบ' : 'No favorite cards yet'}
            </h1>
            <p className="text-amber-200/60 text-sm">
              {lang === 'th' 
                ? 'กด ★ ที่ไพ่ที่คุณชอบเพื่อบันทึกไว้'
                : 'Tap ★ on cards you love to save them here'
              }
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2 rounded-full bg-amber-700/50 hover:bg-amber-700/70 text-amber-100 font-medium transition-colors"
            >
              {lang === 'th' ? 'เปิดไพ่' : 'Draw Cards'}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center p-4">
        <Link href="/" className="text-amber-200/70 hover:text-amber-100 transition-colors">
          ← {lang === 'th' ? 'กลับ' : 'Back'}
        </Link>
        <h1 className="text-lg font-semibold text-amber-100">
          ★ {lang === 'th' ? 'ไพ่ที่ชอบ' : 'Favorites'}
        </h1>
        <div className="w-16 text-right text-amber-400/60 text-sm">
          {favorites.length}
        </div>
      </header>
      
      <main className="flex-1 px-6 py-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {favorites.map((cardId) => {
            const card = getCardById(cardId);
            if (!card) return null;
            
            return (
              <Link
                key={cardId}
                href={`/cards/${cardId}`}
                className="group relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform"
              >
                <Image
                  src={`/${card.image}`}
                  alt={card.name[lang] || cardId}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-amber-100 font-medium truncate">
                    {card.name[lang] || cardId}
                  </p>
                </div>
                <div className="absolute top-1 right-1">
                  <span className="text-amber-400 text-sm">★</span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
