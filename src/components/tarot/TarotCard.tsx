'use client';

import Image from 'next/image';
import Link from 'next/link';
import { DrawResult, LocalizedText } from '@/lib/tarot/types';
import { useLanguage } from '@/components/ui/LanguageContext';
import { getDeckAspectRatio } from '@/lib/tarot/deckLoader';

interface TarotCardProps {
  draw: DrawResult;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showMeaning?: boolean;
  priority?: boolean;
  deckSlug?: string;
  clickable?: boolean;
  onClick?: () => void;
}

export function TarotCard({ draw, size = 'md', showName = true, showMeaning = true, priority = false, deckSlug, clickable = true, onClick }: TarotCardProps) {
  const { lang } = useLanguage();
  const { card, meaning, orientation } = draw;
  
  const aspectRatio = deckSlug ? getDeckAspectRatio(deckSlug) : '2:3';
  const aspectStyle = { aspectRatio: aspectRatio === '9:16' ? '9/16' : '2/3' };
  
  const sizeClasses = {
    sm: 'w-20',
    md: 'w-32',
    lg: 'w-40',
  };
  
  const isReversed = orientation === 'reversed';
  const imageSrc = deckSlug ? `/images/decks/${deckSlug}/${card.image}` : `/${card.image}`;
  
  const cardContent = (
    <div className={`relative ${sizeClasses[size]} rounded-lg overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105 ${isReversed ? 'rotate-180' : ''} ${clickable ? 'cursor-pointer' : ''}`} style={aspectStyle}>
      <Image
        src={imageSrc}
        alt={card.name[lang] || card.card_id}
        fill
        className="object-cover"
        sizes={size === 'sm' ? '80px' : size === 'md' ? '128px' : '160px'}
        priority={priority}
        quality={85}
        unoptimized={true}
      />
    </div>
  );
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="group">
        {clickable && onClick ? (
          <div onClick={onClick}>
            {cardContent}
          </div>
        ) : (
          <Link href={deckSlug ? `/decks/${deckSlug}/cards/${card.card_id}` : `/cards/${card.card_id}`} className="block">
            {cardContent}
          </Link>
        )}
      </div>
      
      {showName && (
        <div className="text-center">
          <p className="font-medium text-sm text-amber-100">{card.name[lang]}</p>
          {isReversed && (
            <span className="text-xs text-amber-600/70">({lang === 'th' ? 'กลับหัว' : 'Reversed'})</span>
          )}
        </div>
      )}
      
      {showMeaning && meaning && (
        <div className="max-w-xs text-center text-sm text-amber-200/80 mt-2">
          {isReversed ? (
            <p>{meaning.reversed?.[lang]?.slice(0, 2).join(' ') || ''}</p>
          ) : (
            <p>{meaning.upright?.[lang]?.slice(0, 2).join(' ') || ''}</p>
          )}
        </div>
      )}
    </div>
  );
}

interface SpreadPositionCardProps {
  position: {
    position: number;
    label: LocalizedText;
    card?: DrawResult;
  };
  size?: 'sm' | 'md' | 'lg';
  deckSlug?: string;
}

export function SpreadPositionCard({ position, size = 'md', deckSlug }: SpreadPositionCardProps) {
  const { lang } = useLanguage();
  const aspectRatio = deckSlug ? getDeckAspectRatio(deckSlug) : '2:3';
  const aspectStyle = { aspectRatio: aspectRatio === '9:16' ? '9/16' : '2/3' };
  
  const sizeClasses = {
    sm: 'w-20',
    md: 'w-32',
    lg: 'w-40',
  };
  
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-amber-400/80 text-sm font-medium px-3 py-1 rounded-full bg-amber-900/30">
        {position.label[lang]}
      </span>
      
      {position.card ? (
        <TarotCard draw={position.card} size={size} deckSlug={deckSlug} />
      ) : (
        <div className={`${sizeClasses[size]} rounded-lg border-2 border-dashed border-amber-700/40 flex items-center justify-center text-amber-700/50`} style={aspectStyle}>
          ?
        </div>
      )}
    </div>
  );
}
