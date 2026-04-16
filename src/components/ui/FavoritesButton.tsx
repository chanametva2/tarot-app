'use client';

import { useFavorites } from './FavoritesContext';

interface FavoritesButtonProps {
  cardId: string;
  size?: 'sm' | 'md';
}

export function FavoritesButton({ cardId, size = 'md' }: FavoritesButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(cardId);

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(cardId);
      }}
      className={`${sizeClasses[size]} rounded-full border border-amber-700/40 flex items-center justify-center transition-all ${
        favorite 
          ? 'bg-amber-600/60 text-amber-100 hover:bg-amber-600/80' 
          : 'bg-amber-900/30 text-amber-400/60 hover:text-amber-300 hover:bg-amber-900/50'
      }`}
      title={favorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {favorite ? '★' : '☆'}
    </button>
  );
}
