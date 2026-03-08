import { Star } from 'lucide-react';
import { useFavoritesStore } from '@/store/favoritesStore';

interface FavoriteButtonProps {
  coinId: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FavoriteButton({ coinId, size = 'md' }: FavoriteButtonProps): React.ReactElement {
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const isFav = isFavorite(coinId);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(coinId);
      }}
      className="rounded-full p-1 transition-colors hover:bg-white/10"
      type="button"
      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star
        className={`${sizeClasses[size]} transition-colors ${
          isFav
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-slate-400 hover:text-yellow-400'
        }`}
      />
    </button>
  );
}
