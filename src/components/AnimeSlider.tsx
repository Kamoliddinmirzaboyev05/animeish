import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AnimeCard from './AnimeCard';
import type { Anime } from '../data/mockData';

interface AnimeSliderProps {
  title: string;
  anime: Anime[];
  showProgress?: boolean;
}

const AnimeSlider = ({ title, anime, showProgress }: AnimeSliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -800 : 800;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (anime.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="relative group">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-dark/80 backdrop-blur-sm hover:bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -ml-6"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto custom-scrollbar pb-4 snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {anime.map((item) => (
            <div key={item.id} className="flex-none w-48 snap-start">
              <AnimeCard anime={item} showProgress={showProgress} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-dark/80 backdrop-blur-sm hover:bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -mr-6"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default AnimeSlider;
