'use client';

import { use } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getFullCard } from '@/lib/tarot/loader';
import { useLanguage, LanguageToggle } from '@/components/ui/LanguageContext';
import { FavoritesButton } from '@/components/ui/FavoritesButton';
import { CardModal } from '@/components/tarot/CardModal';
import { MeaningRecord, DrawResult } from '@/lib/tarot/types';

const FIELD_CONFIG: Record<string, { label: Record<string, string>; type: 'text' | 'list' | 'tags' | 'quote'; order: number }> = {
  upright: { label: { th: 'ความหมายไพ่ตรง', en: 'Upright Meaning' }, type: 'list', order: 10 },
  reversed: { label: { th: 'ความหมายไพ่กลับหัว', en: 'Reversed Meaning' }, type: 'list', order: 11 },
  quote: { label: { th: 'คำกล่าว', en: 'Quote' }, type: 'quote', order: 1 },
  core_dhamma: { label: { th: 'แก่นธรรม', en: 'Core Dhamma' }, type: 'tags', order: 5 },
  reflection: { label: { th: 'คำถามสะท้อน', en: 'Reflection' }, type: 'text', order: 20 },
  dharma_essence: { label: { th: 'แก่นแท้ธรรมะ', en: 'Dharma Essence' }, type: 'text', order: 16 },
  visual_description: { label: { th: 'คำบรรยายภาพ', en: 'Visual Description' }, type: 'text', order: 17 },
  story: { label: { th: 'เรื่องราว', en: 'Story' }, type: 'text', order: 25 },
};

const SKIP_FIELDS = ['card_id', 'name', 'name_th', 'name_en', 'manual_title_th', 'manual_title_en'];

function getLocalizedText(value: unknown, lang: string): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'th' in (value as Record<string, unknown>)) {
    const obj = value as Record<string, unknown>;
    return (obj[lang] as string) || (obj['en'] as string) || '';
  }
  return String(value || '');
}

function getLocalizedArray(value: unknown, lang: string): string[] {
  if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] === 'string') {
      return value as string[];
    }
    if (typeof value[0] === 'object') {
      return value.map(item => getLocalizedText(item, lang)).filter(Boolean);
    }
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

function hasContent(value: unknown, lang: string): boolean {
  if (!value) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return !!(obj[lang] || obj['en']);
  }
  return false;
}

function FieldRenderer({ fieldKey, meaning, lang }: { fieldKey: string; meaning: MeaningRecord; lang: string }) {
  const value = (meaning as unknown as Record<string, unknown>)[fieldKey];
  if (!hasContent(value, lang)) return null;

  const config = FIELD_CONFIG[fieldKey];
  const label = config?.label[lang] || fieldKey.replace(/_/g, ' ');

  if (config?.type === 'quote') {
    return (
      <blockquote className="border-l-2 border-amber-700/50 pl-4 italic text-amber-200/80">
        {getLocalizedText(value, lang)}
      </blockquote>
    );
  }

  if (config?.type === 'tags') {
    const items = getLocalizedArray(value, lang);
    if (items.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="px-3 py-1 rounded-full bg-amber-800/40 text-amber-300/90 text-sm">
            {item}
          </span>
        ))}
      </div>
    );
  }

  if (config?.type === 'list') {
    const items = getLocalizedArray(value, lang);
    if (items.length === 0) return null;
    return (
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-amber-200/80">
            <span>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p className="text-amber-200/80 text-sm leading-relaxed">
      {getLocalizedText(value, lang)}
    </p>
  );
}

function SectionRenderer({ fieldKey, meaning, lang }: { fieldKey: string; meaning: MeaningRecord; lang: string }) {
  const value = (meaning as unknown as Record<string, unknown>)[fieldKey];
  if (!hasContent(value, lang)) return null;

  const config = FIELD_CONFIG[fieldKey];
  const label = config?.label[lang] || fieldKey.replace(/_/g, ' ');

  return (
    <div className="p-4 rounded-xl border border-amber-700/30">
      <h2 className="text-lg font-semibold text-amber-100 mb-3">
        {label}
      </h2>
      <FieldRenderer fieldKey={fieldKey} meaning={meaning} lang={lang} />
    </div>
  );
}

export default function CardDetailPage({ params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = use(params);
  const { lang } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  
  const data = getFullCard(cardId);
  
  if (!data) {
    notFound();
  }
  
  const { card, meaning } = data;
  
  const drawResult: DrawResult = {
    card,
    meaning,
    orientation: 'upright',
  };
  
  const meaningKeys = Object.keys(meaning).filter(
    k => !SKIP_FIELDS.includes(k) && hasContent((meaning as unknown as Record<string, unknown>)[k], lang)
  );

  const sortedKeys = meaningKeys.sort((a, b) => {
    const orderA = FIELD_CONFIG[a]?.order ?? 100;
    const orderB = FIELD_CONFIG[b]?.order ?? 100;
    return orderA - orderB;
  });

  const structuredFields = sortedKeys.filter(k => ['upright', 'reversed'].includes(k));
  const textFields = sortedKeys.filter(k => !['upright', 'reversed', 'quote', 'core_dhamma'].includes(k));

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center p-4">
        <Link href="/" className="text-amber-200/70 hover:text-amber-100 transition-colors">
          ← {lang === 'th' ? 'กลับ' : 'Back'}
        </Link>
        <div className="flex items-center gap-3">
          <FavoritesButton cardId={cardId} size="sm" />
          <LanguageToggle />
        </div>
      </header>
      
      <main className="flex-1 px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <div 
                className="relative w-52 h-72 rounded-xl overflow-hidden shadow-2xl mx-auto cursor-pointer transition-transform hover:scale-105"
                onClick={() => setShowModal(true)}
              >
                <Image
                  src={`/${card.image}`}
                  alt={card.name[lang] || cardId}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <p className="text-center text-amber-400/50 text-xs mt-2">
                {lang === 'th' ? 'คลิกเพื่อดูรูปใหญ่' : 'Click to zoom'}
              </p>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-amber-400/70 text-sm uppercase tracking-wider">
                  {card.arcana === 'major' ? 'Major Arcana' : `${card.suit_key?.toUpperCase()} ${card.rank}`}
                </p>
                <h1 className="text-3xl font-bold text-amber-100">
                  {card.name[lang]}
                </h1>
                <p className="text-amber-200/60">
                  {card.name[lang === 'th' ? 'en' : 'th']}
                </p>
              </div>
              
              {card.number !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">#{card.number}</span>
                  {card.roman && <span className="text-amber-400/70">{card.roman}</span>}
                </div>
              )}
              
              {meaningKeys.includes('quote') && (
                <FieldRenderer fieldKey="quote" meaning={meaning} lang={lang} />
              )}
              
              {meaningKeys.includes('core_dhamma') && (
                <div>
                  <h2 className="text-lg font-semibold text-amber-100 mb-2">
                    {FIELD_CONFIG['core_dhamma'].label[lang]}
                  </h2>
                  <FieldRenderer fieldKey="core_dhamma" meaning={meaning} lang={lang} />
                </div>
              )}
            </div>
          </div>
          
          {structuredFields.length > 0 && (
            <div className="space-y-4">
              {structuredFields.map(key => (
                <SectionRenderer key={key} fieldKey={key} meaning={meaning} lang={lang} />
              ))}
            </div>
          )}
          
          {textFields.length > 0 && (
            <div className="space-y-4">
              {textFields.map(key => (
                <SectionRenderer key={key} fieldKey={key} meaning={meaning} lang={lang} />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <CardModal
        draw={drawResult}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
