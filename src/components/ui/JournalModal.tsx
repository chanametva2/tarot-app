'use client';

import { useState, useEffect } from 'react';
import { DrawResult } from '@/lib/tarot/types';
import { useJournal } from './JournalContext';
import { useLanguage } from './LanguageContext';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: DrawResult[];
  spreadType: string;
}

export function JournalModal({ isOpen, onClose, cards, spreadType }: JournalModalProps) {
  const { lang } = useLanguage();
  const { addEntry } = useJournal();
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNotes('');
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    addEntry({
      date: dateStr,
      spreadType,
      cards: cards.map(c => c.card.card_id),
      notes,
    });
    
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-gradient-to-b from-stone-900 to-stone-950 rounded-2xl border border-amber-700/40 shadow-2xl overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-amber-100">
              {lang === 'th' ? 'บันทึกการเปิดไพ่' : 'Save to Journal'}
            </h2>
            <button
              onClick={onClose}
              className="text-amber-200/60 hover:text-amber-100 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            <p className="text-amber-200/70 text-sm">
              {lang === 'th' ? 'ไพ่ที่เปิดได้:' : 'Cards drawn:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {cards.map((draw, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 rounded-full bg-amber-800/40 text-amber-200 text-sm"
                >
                  {draw.card.name[lang] || draw.card.card_id}
                </span>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-amber-200/70 text-sm">
              {lang === 'th' ? 'บันทึกความคิดของคุณ:' : 'Your thoughts:'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={lang === 'th' 
                ? 'เขียนบันทึกเกี่ยวกับการเปิดไพ่ครั้งนี้...'
                : 'Write your thoughts about this reading...'
              }
              className="w-full h-32 p-3 rounded-xl bg-stone-800/50 border border-amber-700/30 text-amber-100 placeholder-amber-100/30 resize-none focus:outline-none focus:border-amber-600/50"
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-amber-700/40 text-amber-200 hover:bg-amber-900/30 transition-colors"
            >
              {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaved}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                isSaved 
                  ? 'bg-green-700/50 text-green-200'
                  : 'bg-amber-700/50 text-amber-100 hover:bg-amber-700/70'
              }`}
            >
              {isSaved 
                ? (lang === 'th' ? 'บันทึกแล้ว ✓' : 'Saved ✓')
                : (lang === 'th' ? 'บันทึก' : 'Save')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
