'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { DrawResult, LookbookEntry, GuidebookEntry } from '@/lib/tarot/types';
import { useLanguage } from '@/components/ui/LanguageContext';
import { getDeckAspectRatio } from '@/lib/tarot/deckLoader';

interface CardModalProps {
  draw: DrawResult | null;
  isOpen: boolean;
  onClose: () => void;
  deckSlug?: string;
  lookbookEntry?: LookbookEntry;
  guidebookEntry?: GuidebookEntry;
}

function getLocalizedText(value: unknown, lang: string): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'th' in (value as Record<string, unknown>)) {
    const obj = value as Record<string, unknown>;
    return (obj[lang] as string) || (obj['en'] as string) || '';
  }
  return '';
}

function getLocalizedArray(value: unknown, lang: string): string[] {
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
    return value as string[];
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

export function CardModal({ draw, isOpen, onClose, deckSlug, lookbookEntry, guidebookEntry }: CardModalProps) {
  const { lang } = useLanguage();
  
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  if (!isOpen || !draw) return null;
  
  const { card, meaning, orientation } = draw;
  const isReversed = orientation === 'reversed';
  const imageSrc = deckSlug ? `/images/decks/${deckSlug}/${card.image}` : `/${card.image}`;
  const isAsian = deckSlug ? getDeckAspectRatio(deckSlug) === '9:16' : false;
  const imgWidth = 320;
  const imgHeight = isAsian ? 570 : 480;
  
  const hasLookbookData = lookbookEntry?.editorial_identity;
  const hasGuidebookData = guidebookEntry?.guidebook;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-4"
      onClick={onClose}
      style={{ overflowY: 'auto' }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      <div 
        className="relative z-10 max-w-3xl w-full my-8 animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white text-3xl leading-none transition-colors"
        >
          ×
        </button>
        
        <div className="bg-amber-950/95 rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col xl:flex-row gap-8">
              <div className="flex-shrink-0 mx-auto xl:mx-0">
                <div className={`relative rounded-xl overflow-hidden shadow-2xl ring-2 ring-amber-700/30 ${isReversed ? 'rotate-180' : ''}`} style={{ width: imgWidth, height: imgHeight }}>
                  <Image
                    src={imageSrc}
                    alt={card.name[lang] || card.card_id}
                    width={imgWidth}
                    height={imgHeight}
                    className="object-cover"
                    quality={95}
                    unoptimized={true}
                    priority
                  />
                </div>
              </div>
            
            <div className="flex-1 space-y-4 max-h-[70vh] overflow-y-auto pr-2 max-w-xl">
              <div className="text-center lg:text-left">
                <p className="text-amber-400/60 text-sm uppercase tracking-wider">
                  {card.arcana === 'major' ? 'Major Arcana' : `${card.suit_key?.toUpperCase()} ${card.rank}`}
                </p>
                <h3 className="text-2xl font-semibold text-amber-100">
                  {card.name[lang]}
                </h3>
                {card.name.th !== card.name.en && (
                  <p className="text-amber-300/60 text-sm">{card.name[lang === 'th' ? 'en' : 'th']}</p>
                )}
                {isReversed && (
                  <span className="inline-block mt-1 text-sm text-amber-500 px-2 py-0.5 rounded-full bg-amber-900/50">
                    ({lang === 'th' ? 'กลับหัว' : 'Reversed'})
                  </span>
                )}
              </div>
              
              {getLocalizedText(meaning.quote, lang) && (
                <div className="border-t border-amber-800/50 pt-4">
                  <blockquote className="border-l-2 border-amber-700/50 pl-4 italic text-amber-200/80">
                    {getLocalizedText(meaning.quote, lang)}
                  </blockquote>
                </div>
              )}
              
              {getLocalizedArray(meaning.core_dhamma, lang).length > 0 && (
                <div className="border-t border-amber-800/50 pt-4">
                  <h4 className="text-sm font-medium text-amber-400 mb-2">
                    {lang === 'th' ? 'แก่นธรรม' : 'Core Dhamma'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {getLocalizedArray(meaning.core_dhamma, lang).map((item, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-amber-800/50 text-amber-300/90">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {getLocalizedText(meaning.visual_description, lang) && (
                <div className="border-t border-amber-800/50 pt-4">
                  <h4 className="text-sm font-medium text-amber-400 mb-2">
                    {lang === 'th' ? 'คำบรรยายภาพ' : 'Visual Description'}
                  </h4>
                  <p className="text-amber-200/80 text-sm">{getLocalizedText(meaning.visual_description, lang)}</p>
                </div>
              )}
              
              {getLocalizedText(meaning.archetype, lang) && (
                <div className="border-t border-amber-800/50 pt-4">
                  <h4 className="text-sm font-medium text-amber-400 mb-2">
                    {lang === 'th' ? 'อาร์คีไทป์' : 'Archetype'}
                  </h4>
                  <p className="text-amber-200/80 text-sm">{getLocalizedText(meaning.archetype, lang)}</p>
                </div>
              )}
              
              {getLocalizedArray(meaning.symbolism, lang).length > 0 && (
                <div className="border-t border-amber-800/50 pt-4">
                  <h4 className="text-sm font-medium text-amber-400 mb-2">
                    {lang === 'th' ? 'สัญลักษณ์' : 'Symbolism'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {getLocalizedArray(meaning.symbolism, lang).map((item, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-amber-800/50 text-amber-300/90">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {getLocalizedArray(meaning.aesthetic_tone, lang).length > 0 && (
                <div className="border-t border-amber-800/50 pt-4">
                  <h4 className="text-sm font-medium text-amber-400 mb-2">
                    {lang === 'th' ? 'บรรยากาศ' : 'Aesthetic Tone'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {getLocalizedArray(meaning.aesthetic_tone, lang).map((item, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-amber-700/50 text-amber-200/90">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="border-t border-amber-800/50 pt-4">
                <h4 className="text-sm font-medium text-amber-400 mb-2">
                  {isReversed 
                    ? (lang === 'th' ? 'ความหมาย (กลับหัว)' : 'Meaning (Reversed)')
                    : (lang === 'th' ? 'ความหมาย (ตรง)' : 'Meaning (Upright)')}
                </h4>
                <div className="space-y-2">
                  {getLocalizedArray(isReversed ? meaning.reversed : meaning.upright, lang).map((item, i) => (
                    <p key={i} className="text-amber-200/90 text-sm">• {item}</p>
                  ))}
                </div>
              </div>
              
              {getLocalizedText(meaning.dharma_essence, lang) && (
                <div className="border-t border-amber-800/50 pt-4">
                  <h4 className="text-sm font-medium text-amber-400 mb-2">
                    {lang === 'th' ? 'แก่นแท้ธรรมะ' : 'Dharma Essence'}
                  </h4>
                  <p className="text-amber-200/80 text-sm">{getLocalizedText(meaning.dharma_essence, lang)}</p>
                </div>
              )}
              
              {getLocalizedText(meaning.reflection, lang) && (
                <div className="border-t border-amber-800/50 pt-4">
                  <h4 className="text-sm font-medium text-amber-400 mb-2">
                    {lang === 'th' ? 'คำถามสะท้อน' : 'Reflection'}
                  </h4>
                  <p className="text-amber-200/80 text-sm italic">{getLocalizedText(meaning.reflection, lang)}</p>
                </div>
              )}
              
              {getLocalizedText(meaning.oracle_message, lang) && (
                <div className="border-t border-amber-800/50 pt-4">
                  <h4 className="text-sm font-medium text-amber-400 mb-2">
                    {lang === 'th' ? 'ข้อความจาก Oracle' : 'Oracle Message'}
                  </h4>
                  <p className="text-amber-200/80 text-sm font-medium italic">{getLocalizedText(meaning.oracle_message, lang)}</p>
                </div>
              )}
              
              {getLocalizedText(meaning.fashion_caption, lang) && (
                <div className="border-t border-amber-800/50 pt-4">
                  <h4 className="text-sm font-medium text-amber-400 mb-2">
                    {lang === 'th' ? 'แฟชั่นแคปชั่น' : 'Fashion Caption'}
                  </h4>
                  <p className="text-amber-200/80 text-sm italic">{getLocalizedText(meaning.fashion_caption, lang)}</p>
                </div>
              )}
              
              {getLocalizedText(meaning.story, lang) && (
                <div className="border-t border-amber-800/50 pt-4">
                  <h4 className="text-sm font-medium text-amber-400 mb-2">
                    {lang === 'th' ? 'เรื่องราว' : 'Story'}
                  </h4>
                  <p className="text-amber-200/80 text-sm">{getLocalizedText(meaning.story, lang)}</p>
                </div>
              )}
              
              {getLocalizedText(meaning.interpretive_note, lang) && (
                <div className="border-t border-amber-800/50 pt-4">
                  <h4 className="text-sm font-medium text-amber-400 mb-2">
                    {lang === 'th' ? 'หมายเหตุการตีความ' : 'Interpretive Note'}
                  </h4>
                  <p className="text-amber-200/80 text-sm">{getLocalizedText(meaning.interpretive_note, lang)}</p>
                </div>
              )}
              
              {card.model_profile && (card.model_profile.model_name || card.model_profile.signature_vibe) && (
                <div className="border-t border-amber-800/50 pt-4">
                  <h4 className="text-sm font-medium text-amber-400 mb-2">
                    {lang === 'th' ? 'โปรไฟล์นายแบบ' : 'Model Profile'}
                  </h4>
                  <div className="space-y-2 text-sm">
                    {card.model_profile.model_name && (
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500/70">{lang === 'th' ? 'ชื่อ' : 'Name'}:</span>
                        <span className="text-amber-200/90">
                          {getLocalizedText(card.model_profile.model_name, lang) || card.model_profile.model_name?.en || ''}
                        </span>
                      </div>
                    )}
                    
                    {card.model_profile.model_stats && Object.keys(card.model_profile.model_stats).length > 0 && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        {card.model_profile.model_stats.height_cm && (
                          <span><span className="text-amber-500/70">ส่วนสูง:</span> <span className="text-amber-200/80">{card.model_profile.model_stats.height_cm} cm</span></span>
                        )}
                        {card.model_profile.model_stats.chest_in && (
                          <span><span className="text-amber-500/70">อก:</span> <span className="text-amber-200/80">{card.model_profile.model_stats.chest_in}"</span></span>
                        )}
                        {card.model_profile.model_stats.waist_in && (
                          <span><span className="text-amber-500/70">เอว:</span> <span className="text-amber-200/80">{card.model_profile.model_stats.waist_in}"</span></span>
                        )}
                        {card.model_profile.model_stats.shoe_eu && (
                          <span><span className="text-amber-500/70">รองเท้า:</span> <span className="text-amber-200/80">EU {card.model_profile.model_stats.shoe_eu}</span></span>
                        )}
                      </div>
                    )}
                    
                    {card.model_profile.key_features && getLocalizedArray(card.model_profile.key_features, lang).length > 0 && (
                      <div className="mt-2">
                        <p className="text-amber-500/70 text-xs mb-1">{lang === 'th' ? 'ลักษณะเด่น' : 'Key Features'}:</p>
                        <ul className="text-amber-200/80 text-xs space-y-0.5">
                          {getLocalizedArray(card.model_profile.key_features, lang).map((feature, i) => (
                            <li key={i}>• {feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {card.model_profile.signature_vibe && (
                      <div className="mt-2">
                        <p className="text-amber-500/70 text-xs mb-1">{lang === 'th' ? 'สไตล์' : 'Signature Vibe'}:</p>
                        <p className="text-amber-200/90 text-sm">
                          {getLocalizedText(card.model_profile.signature_vibe, lang) || card.model_profile.signature_vibe?.en || ''}
                        </p>
                      </div>
                    )}
                    
                    {card.model_profile.editorial_note && getLocalizedText(card.model_profile.editorial_note, lang) && (
                      <p className="text-amber-200/70 text-xs italic mt-2">
                        {getLocalizedText(card.model_profile.editorial_note, lang)}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {hasLookbookData && (
                <div className="border-t border-amber-800/50 pt-4">
                  <h4 className="text-sm font-medium text-amber-400 mb-2">
                    {lang === 'th' ? 'อัตลักษณ์เชิงแฟชั่น' : 'Editorial Identity'}
                  </h4>
                  <div className="space-y-2 text-sm">
                    {lookbookEntry?.editorial_identity?.visual_identity && getLocalizedText(lookbookEntry.editorial_identity.visual_identity, lang) && (
                      <p className="text-amber-200/80">{getLocalizedText(lookbookEntry.editorial_identity.visual_identity, lang)}</p>
                    )}
                    {lookbookEntry?.editorial_identity?.fashion_caption && getLocalizedText(lookbookEntry.editorial_identity.fashion_caption, lang) && (
                      <p className="text-amber-300/80 italic text-xs">
                        "{getLocalizedText(lookbookEntry.editorial_identity.fashion_caption, lang)}"
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {hasGuidebookData && (
                <div className="border-t border-amber-800/50 pt-4">
                  <h4 className="text-sm font-medium text-amber-400 mb-2">
                    {lang === 'th' ? 'คำแนะนำการอ่าน' : 'Reading Guide'}
                  </h4>
                  <div className="space-y-2 text-sm">
                    {guidebookEntry?.guidebook?.reading_focus && getLocalizedArray(guidebookEntry.guidebook.reading_focus, lang).length > 0 && (
                      <div>
                        <p className="text-amber-500/70 text-xs">{lang === 'th' ? 'จุดเน้นการอ่าน' : 'Reading Focus'}</p>
                        {getLocalizedArray(guidebookEntry.guidebook.reading_focus, lang).map((item, i) => (
                          <p key={i} className="text-amber-200/80">• {item}</p>
                        ))}
                      </div>
                    )}
                    {guidebookEntry?.guidebook?.interpretive_note && getLocalizedText(guidebookEntry.guidebook.interpretive_note, lang) && (
                      <p className="text-amber-200/70 text-xs italic mt-2">
                        {getLocalizedText(guidebookEntry.guidebook.interpretive_note, lang)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-in {
          animation: modalIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
