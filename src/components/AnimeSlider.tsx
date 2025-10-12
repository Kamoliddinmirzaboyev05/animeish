import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AnimeCard from './AnimeCard';
interface AnimeSliderProps {
  title: string;
  anime: any[];
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
    <div className="mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 px-4 sm:px-0">{title}</h2>
      <div className="relative group">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-dark/80 backdrop-blur-sm hover:bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -ml-4 sm:-ml-6 hidden sm:flex"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
        </button>

        <div
          ref={sliderRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto custom-scrollbar pb-4 snap-x snap-mandatory scroll-smooth px-4 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {anime.map((item) => (
            <div key={item.id} className="flex-none w-36 sm:w-44 lg:w-48 snap-start">
              <AnimeCard anime={item} showProgress={showProgress} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-dark/80 backdrop-blur-sm hover:bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -mr-4 sm:-mr-6 hidden sm:flex"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
        </button>
      </div>
    </div>
  );
};

export default AnimeSlider;
