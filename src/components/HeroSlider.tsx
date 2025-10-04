import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface HeroSliderProps {
  anime: any[];
}

const HeroSlider = ({ anime }: HeroSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % anime.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [anime.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + anime.length) % anime.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % anime.length);
  };

  const current = anime[currentIndex];

  return (
    <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={current.banner}
            alt={current.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/60 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            key={`content-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">{current.title}</h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-300 mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3">
              {current.description}
            </p>
            <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 text-sm sm:text-base flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">★</span>
                <span className="font-semibold">{current.rating}</span>
              </div>
              <span className="text-gray-400 hidden sm:inline">•</span>
              <span>{current.year}</span>
              <span className="text-gray-400 hidden sm:inline">•</span>
              <span className="hidden sm:inline">{current.totalEpisodes || 0} Episodes</span>
              <span className="text-gray-400 hidden sm:inline">•</span>
              <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                {current.status}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link
                to={`/watch/${current.id}/1`}
                className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 bg-primary hover:bg-primary-dark rounded-full font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                Watch Now
              </Link>
              <Link
                to={`/anime/${current.id}`}
                className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
              >
                <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                More Info
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <button
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
      </button>

      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2">
        {anime.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1 rounded-full transition-all ${
              index === currentIndex ? 'w-6 sm:w-8 bg-primary' : 'w-3 sm:w-4 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
