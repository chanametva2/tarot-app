'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getAllDecks } from '@/lib/tarot/deckLoader';
import { useLanguage } from '@/components/ui/LanguageContext';
import { LanguageToggle } from '@/components/ui/LanguageContext';
import { UserMenu } from '@/components/ui/UserMenu';

function getDeckCoverImage(deckSlug: string): string {
  if (deckSlug === 'dhamma-path-tarot') {
    return '/images/decks/dhamma-path-tarot/images/cover.webp';
  }
  if (deckSlug === 'asian-vogue-tarot') {
    return '/images/decks/asian-vogue-tarot/images/cover.webp';
  }
  return '/images/decks/${deckSlug}/images/cover.webp';
}

export default function DeckSelectionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { lang } = useLanguage();
  const decks = getAllDecks();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900">
        <div className="text-amber-100 text-xl">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center p-4">
        <div className="flex gap-4 text-sm items-center">
          <Link href="/journal" className="text-amber-200/70 hover:text-amber-100 transition-colors">
            📖 {lang === 'th' ? 'สมุดบันทึก' : 'Journal'}
          </Link>
          <Link href="/favorites" className="text-amber-200/70 hover:text-amber-100 transition-colors">
            ★ {lang === 'th' ? 'ชอบ' : 'Favorites'}
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <UserMenu />
          <LanguageToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-8">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-amber-100">
              {lang === 'th' ? 'เลือกสำรับไพ่' : 'Select a Deck'}
            </h1>
            <p className="text-amber-200/60">
              {lang === 'th' 
                ? 'เลือกสำรับไพ่ที่คุณต้องการใช้งาน' 
                : 'Choose a tarot deck to work with'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {decks.map((deck) => (
              <Link
                key={deck.deck_id}
                href={`/decks/${deck.slug}`}
                className="group block"
              >
                <div className="relative p-6 rounded-2xl border border-amber-700/30 bg-gradient-to-br from-amber-900/40 to-stone-900/60 hover:from-amber-900/60 hover:to-stone-900/80 transition-all duration-300">
                  <div className="space-y-4">
                    <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-lg">
                      <Image
                        src={getDeckCoverImage(deck.slug)}
                        alt={deck.title[lang] || 'Deck Cover'}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-xl font-bold text-amber-100 group-hover:text-amber-200 transition-colors">
                        {deck.title[lang]}
                      </h2>
                      <p className="text-amber-200/60 text-sm">
                        {deck.subtitle[lang]}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-amber-200/50">
                        <span>{deck.card_count} cards</span>
                        <span>•</span>
                        <span>{deck.author}</span>
                        {deck.has_minor_arcana === false && (
                          <>
                            <span>•</span>
                            <span>Major Arcana Only</span>
                          </>
                        )}
                        {deck.has_lookbook && (
                          <>
                            <span>•</span>
                            <span>Lookbook</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-amber-800/50 text-amber-300 group-hover:bg-amber-700/60 group-hover:scale-105 transition-all text-sm">
                        {lang === 'th' ? 'เปิดใช้งาน' : 'Open'} →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
