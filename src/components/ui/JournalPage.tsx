'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useJournal } from './JournalContext';
import { useLanguage } from './LanguageContext';
import { getCardById, getAllSpreads, getSpreadById } from '@/lib/tarot/loader';

export function JournalPage() {
  const { lang } = useLanguage();
  const { entries, deleteEntry } = useJournal();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (lang === 'th') {
      const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
    }
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const spreadTypeToId: Record<string, string> = {
    'single': 'mindfulness_single',
    'three': 'three_marks',
    'four-noble-truths': 'four_noble_truths',
  };

  const getSpreadName = (spreadType: string) => {
    const spreadId = spreadTypeToId[spreadType];
    if (spreadId) {
      const spread = getSpreadById(spreadId);
      if (spread) return spread.name[lang] || spreadType;
    }
    return spreadType;
  };

  if (entries.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="flex justify-between items-center p-4">
          <Link href="/" className="text-amber-200/70 hover:text-amber-100 transition-colors">
            ← {lang === 'th' ? 'กลับ' : 'Back'}
          </Link>
        </header>
        
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="text-center space-y-4">
            <div className="text-6xl opacity-30">📖</div>
            <h1 className="text-xl font-semibold text-amber-100">
              {lang === 'th' ? 'ยังไม่มีบันทึก' : 'No journal entries yet'}
            </h1>
            <p className="text-amber-200/60 text-sm">
              {lang === 'th' 
                ? 'เปิดไพ่แล้วบันทึกความคิดของคุณได้เลย'
                : 'Draw cards and save your thoughts'
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
          {lang === 'th' ? 'สมุดบันทึก' : 'Journal'}
        </h1>
        <div className="w-16" />
      </header>
      
      <main className="flex-1 px-6 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {entries.map((entry) => (
            <div 
              key={entry.id}
              className="p-4 rounded-xl bg-amber-900/20 border border-amber-700/30 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-amber-100 font-medium">
                    {formatDate(entry.date)}
                  </p>
                  <p className="text-amber-400/70 text-xs">
                    {getSpreadName(entry.spreadType)}
                  </p>
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="text-amber-200/50 hover:text-red-400 transition-colors text-sm"
                >
                  {lang === 'th' ? 'ลบ' : 'Delete'}
                </button>
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-1">
                {entry.cards.map((cardId, index) => {
                  const card = getCardById(cardId);
                  if (!card) return null;
                  
                  return (
                    <Link
                      key={index}
                      href={`/cards/${cardId}`}
                      className="flex-shrink-0 group"
                    >
                      <div className="relative w-16 h-22 rounded-lg overflow-hidden shadow-md group-hover:scale-105 transition-transform">
                        <Image
                          src={`/${card.image}`}
                          alt={card.name[lang] || cardId}
                          fill
                          className="object-cover"
                          quality={75}
                        />
                      </div>
                      <p className="text-xs text-amber-200/70 mt-1 text-center truncate w-16">
                        {card.name[lang] || cardId}
                      </p>
                    </Link>
                  );
                })}
              </div>
              
              {entry.notes && (
                <p className="text-amber-200/80 text-sm leading-relaxed whitespace-pre-wrap">
                  {entry.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
