'use client';

import Image from 'next/image';
import { getDeckAspectRatio } from '@/lib/tarot/deckLoader';

interface ShuffleAnimationProps {
  cardCount: number;
  isShuffling: boolean;
  deckSlug?: string;
}

export function ShuffleAnimation({ cardCount, isShuffling, deckSlug }: ShuffleAnimationProps) {
  if (!isShuffling) return null;
  
  let backImageSrc = '/images/back.webp';
  
  if (deckSlug === 'dhamma-path-tarot') {
    backImageSrc = `/images/decks/${deckSlug}/images/back.jpg`;
  } else if (deckSlug) {
    backImageSrc = `/images/decks/${deckSlug}/images/back.webp`;
  }
  
  const aspectRatio = deckSlug ? getDeckAspectRatio(deckSlug) : '2:3';
  const aspectStyle = { aspectRatio: aspectRatio === '9:16' ? '9/16' : '2/3' };
  
  return (
    <div className="flex justify-center items-center gap-2 py-8">
      {Array.from({ length: cardCount }).map((_, index) => (
        <div
          key={index}
          className="relative w-16 rounded-lg overflow-hidden animate-shuffle"
          style={{
            animationDelay: `${index * 100}ms`,
            ...aspectStyle,
          }}
        >
          <Image
            src={backImageSrc}
            alt="Card Back"
            fill
            className="object-cover"
            quality={85}
          />
        </div>
      ))}
      <style jsx>{`
        @keyframes shuffle {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
          25% { transform: translateY(-20px) rotate(-5deg); opacity: 1; }
          50% { transform: translateY(0) rotate(5deg); opacity: 0.8; }
          75% { transform: translateY(-10px) rotate(-3deg); opacity: 1; }
          100% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
        }
        .animate-shuffle {
          animation: shuffle 0.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

interface CardFlipAnimationProps {
  show: boolean;
  children: React.ReactNode;
}

export function CardFlipAnimation({ show, children }: CardFlipAnimationProps) {
  if (!show) return null;
  
  return (
    <div className="perspective-1000 animate-flip-in">
      {children}
      <style jsx>{`
        @keyframes flipIn {
          0% { transform: rotateY(90deg) scale(0.9); opacity: 0; }
          100% { transform: rotateY(0deg) scale(1); opacity: 1; }
        }
        .animate-flip-in {
          animation: flipIn 0.5s ease-out forwards;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}

interface DeckStackProps {
  count?: number;
  deckSlug?: string;
}

export function DeckStack({ count = 5, deckSlug }: DeckStackProps) {
  let backImageSrc = '/images/back.webp';
  
  if (deckSlug === 'dhamma-path-tarot') {
    backImageSrc = `/images/decks/${deckSlug}/images/back.jpg`;
  } else if (deckSlug) {
    backImageSrc = `/images/decks/${deckSlug}/images/back.webp`;
  }
  
  const aspectRatio = deckSlug ? getDeckAspectRatio(deckSlug) : '2:3';
  const aspectStyle = { aspectRatio: aspectRatio === '9:16' ? '9/16' : '2/3' };
  
  return (
    <div className="relative w-20" style={aspectStyle}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="absolute inset-0 rounded-lg overflow-hidden"
          style={{
            transform: `translateY(${-index * 2}px) translateX(${index * 1}px)`,
            zIndex: index,
          }}
        >
          <Image
            src={backImageSrc}
            alt="Card Back"
            fill
            className="object-cover"
            quality={85}
          />
        </div>
      ))}
    </div>
  );
}
