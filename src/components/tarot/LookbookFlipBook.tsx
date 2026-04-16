'use client';

import { useEffect, useRef, useState, Fragment } from 'react';
import Image from 'next/image';
import { PageFlip } from 'page-flip';
import { LookbookEntry } from '@/lib/tarot/types';

interface FlipBookProps {
  entries: LookbookEntry[];
  cardImageMap: Record<string, string>;
  cardModelProfileMap: Record<string, {
    model_name?: { th?: string; en?: string };
    signature_vibe?: { th?: string; en?: string };
    editorial_note?: { th?: string; en?: string };
    model_stats?: { height_cm?: number; chest_in?: number; waist_in?: number; shoe_eu?: number };
    key_features?: { th?: string[]; en?: string[] };
  }>;
  lang: 'th' | 'en';
  onClose: () => void;
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

export function LookbookFlipBook({ entries, cardImageMap, cardModelProfileMap, lang, onClose }: FlipBookProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let pf: PageFlip | null = null;
    
    try {
      pf = new PageFlip(container, {
        width: 550,
        height: 700,
        size: 'stretch' as any,
        minWidth: 320,
        maxWidth: 900,
        minHeight: 400,
        maxHeight: 820,
        maxShadowOpacity: 0.4,
        showCover: false,
        mobileScrollSupport: true,
        usePortrait: true,
        flippingTime: 400,
        startZIndex: 1,
        autoSize: true,
        drawShadow: true,
      });
      pageFlipRef.current = pf;
    } catch (e) {
      console.error('PageFlip init error:', e);
      return;
    }

    const timer = setTimeout(() => {
      const pages = container.querySelectorAll('.page');
      if (pages.length > 0 && pageFlipRef.current) {
        pageFlipRef.current.loadFromHTML(Array.from(pages) as HTMLElement[]);
        setIsLoaded(true);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      try {
        if (pf && typeof pf.destroy === 'function') {
          pf.destroy();
        }
      } catch (e) {
        // ignore
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (pageFlipRef.current) pageFlipRef.current.flipPrev();
      } else if (e.key === 'ArrowRight') {
        if (pageFlipRef.current) pageFlipRef.current.flipNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrev = () => {
    if (pageFlipRef.current) {
      pageFlipRef.current.flipPrev();
    }
  };

  const handleNext = () => {
    if (pageFlipRef.current) {
      pageFlipRef.current.flipNext();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-100 flex flex-col">
      <style jsx global>{`
        .flipbook-container {
          width: min(1100px, 92vw);
          height: min(720px, 76vh);
          filter: drop-shadow(0 18px 35px rgba(0,0,0,0.2));
        }
        .page {
          background: #fffdf8 !important;
          overflow: hidden !important;
        }
        .page-hc {
          background: #f4eee4 !important;
        }
        .page-content {
          width: 100%;
          height: 100%;
          padding: 20px;
          position: relative;
          box-sizing: border-box;
        }
        .image-page {
          background: #f4eee4;
        }
        .image-frame {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          overflow: hidden;
          background: #ddd;
          box-shadow: inset 0 0 0 1px rgba(60,40,20,0.08);
          position: relative;
        }
        .image-frame img {
          position: absolute !important;
          top: 0;
          left: 0;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        .caption {
          position: absolute;
          left: 12px;
          bottom: 12px;
          background: rgba(20, 14, 8, 0.6);
          color: #fff;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 0.85rem;
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .text-page {
          background: linear-gradient(180deg, #fffdf9 0%, #f8f2e8 100%);
        }
        .text-page .page-content {
          display: flex;
          flex-direction: column;
        }
        .text-page .chapter {
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #9b7350;
          margin-bottom: 12px;
        }
        .text-page .body {
          flex: 1;
          overflow-y: auto;
        }
      `}</style>

      <header className="flex justify-between items-center p-4 z-20 flex-shrink-0 bg-stone-200">
        <span className="text-stone-600 text-sm font-medium">Master Lookbook</span>
        <button
          onClick={onClose}
          className="text-stone-500 hover:text-stone-800 text-3xl leading-none transition-colors"
        >
          ×
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="flipbook-container" ref={containerRef}>
          {entries.map((entry, idx) => {
            const profile = cardModelProfileMap[entry.card_id];
            
            return (
              <Fragment key={entry.card_id}>
                <div className="page image-page">
                  <div className="page-content">
                    <div className="image-frame">
                      <Image
                        src={`/images/decks/asian-vogue-tarot/${cardImageMap[entry.card_id] || entry.card.image}`}
                        alt={entry.card.name[lang] || entry.card_id}
                        fill
                        className="object-cover"
                        unoptimized={true}
                      />
                      <div className="caption">
                        <span className="text-amber-400/80 text-xs uppercase tracking-wider mr-2">
                          {entry.card.roman || entry.card.number}
                        </span>
                        <span className="text-white/90 text-sm">
                          {getLocalizedText(profile?.model_name, lang) || profile?.model_name?.en}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="page text-page">
                  <div className="page-content">
                    <div className="body">
                      <div className="chapter">
                        {entry.card.roman || entry.card.number} — {entry.card.name[lang]}
                      </div>
                      
                      {profile?.signature_vibe && (
                        <div className="mb-4">
                          <h4 className="text-amber-700/70 text-[10px] uppercase tracking-wider mb-1">
                            {lang === 'th' ? 'สไตล์' : 'Signature Vibe'}
                          </h4>
                          <p className="text-base text-stone-800">
                            {getLocalizedText(profile.signature_vibe, lang) || profile.signature_vibe?.en}
                          </p>
                        </div>
                      )}

                      {profile?.key_features && getLocalizedArray(profile.key_features, lang).length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-amber-700/70 text-[10px] uppercase tracking-wider mb-1">
                            {lang === 'th' ? 'ลักษณะเด่น' : 'Key Features'}
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {getLocalizedArray(profile.key_features, lang).map((f, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {profile?.model_stats && Object.keys(profile.model_stats).length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-amber-700/70 text-[10px] uppercase tracking-wider mb-1">
                            {lang === 'th' ? 'สัดส่วน' : 'Stats'}
                          </h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm">
                            {profile.model_stats.height_cm && (
                              <div><span className="text-stone-500">ส่วนสูง:</span> <span className="text-stone-800">{profile.model_stats.height_cm} cm</span></div>
                            )}
                            {profile.model_stats.chest_in && (
                              <div><span className="text-stone-500">อก:</span> <span className="text-stone-800">{profile.model_stats.chest_in}"</span></div>
                            )}
                            {profile.model_stats.waist_in && (
                              <div><span className="text-stone-500">เอว:</span> <span className="text-stone-800">{profile.model_stats.waist_in}"</span></div>
                            )}
                            {profile.model_stats.shoe_eu && (
                              <div><span className="text-stone-500">รองเท้า:</span> <span className="text-stone-800">EU {profile.model_stats.shoe_eu}</span></div>
                            )}
                          </div>
                        </div>
                      )}

                      {profile?.editorial_note && getLocalizedText(profile.editorial_note, lang) && (
                        <div className="border-t border-amber-200 pt-3">
                          <h4 className="text-amber-700/70 text-[10px] uppercase tracking-wider mb-1">
                            {lang === 'th' ? 'หมายเหตุ' : 'Editorial Note'}
                          </h4>
                          <p className="text-stone-600 text-sm leading-relaxed italic">
                            "{getLocalizedText(profile.editorial_note, lang)}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>

      <footer className="flex justify-center gap-4 pb-6 flex-shrink-0 z-10 bg-stone-200 py-4">
        <button
          onClick={handlePrev}
          className="px-6 py-2 rounded-full bg-stone-700 text-white hover:bg-stone-800 transition-colors"
        >
          ◀ ก่อนหน้า
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 rounded-full bg-stone-700 text-white hover:bg-stone-800 transition-colors"
        >
          ถัดไป ▶
        </button>
      </footer>
    </div>
  );
}
