import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight, Plus, Check, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addBookmark, removeBookmark, checkBookmarkStatus, getAuthToken } from '../services/api';
import Image from './Image';
interface HeroSliderProps {
  anime: any[];
}

const HeroSlider = ({ anime }: HeroSliderProps) => {
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bookmarkStates, setBookmarkStates] = useState<Record<number, boolean>>({});
  const [bookmarkLoading, setBookmarkLoading] = useState<Record<number, boolean>>({});



  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % anime.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [anime.length]);

  // Check bookmark status for all anime
  useEffect(() => {
    const checkBookmarks = async () => {
      if (!getAuthToken()) return;
      
      const states: Record<number, boolean> = {};
      for (const item of anime) {
        if (item.movieId) {
          try {
            states[item.movieId] = await checkBookmarkStatus(item.movieId);
          } catch (error) {
            states[item.movieId] = false;
          }
        }
      }
      setBookmarkStates(states);
    };

    if (anime.length > 0) {
      checkBookmarks();
    }
  }, [anime]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + anime.length) % anime.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % anime.length);
  };

  const handleBookmark = async (movieId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!getAuthToken()) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    setBookmarkLoading(prev => ({ ...prev, [movieId]: true }));

    try {
      const isBookmarked = bookmarkStates[movieId];
      
      if (isBookmarked) {
        await removeBookmark(movieId);
        setBookmarkStates(prev => ({ ...prev, [movieId]: false }));
      } else {
        await addBookmark(movieId);
        setBookmarkStates(prev => ({ ...prev, [movieId]: true }));
      }
    } catch (error) {
    } finally {
      setBookmarkLoading(prev => ({ ...prev, [movieId]: false }));
    }
  };

  const current = anime[currentIndex];

  if (!current) {
    return null;
  }

  return (
    <div className="relative h-[65vh] sm:h-[75vh] lg:h-[85vh] overflow-hidden bg-dark">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={current.banner}
            alt={current.title}
            className="w-full h-full object-cover"
            priority={true}
          />
          {/* Professional Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-dark/60 via-transparent to-transparent h-32" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            key={`content-${currentIndex}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Tavsiya etiladi
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold mb-4 lg:mb-6 text-white leading-tight drop-shadow-lg">
              {current.title}
            </h1>
            
            <p className="text-sm sm:text-lg text-gray-200 mb-6 lg:mb-8 line-clamp-2 sm:line-clamp-3 max-w-2xl drop-shadow-md leading-relaxed">
              {current.description}
            </p>

            <div className="flex items-center gap-4 sm:gap-6 mb-8 text-sm sm:text-base flex-wrap text-white font-medium">
              {current.rating && current.rating > 0 && (
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold">{current.rating.toFixed(1)}</span>
                </div>
              )}
              <div className="flex items-center gap-4">
                {current.year && (
                  <span className="drop-shadow-md">{current.year}</span>
                )}
                {current.totalEpisodes > 0 && (
                  <>
                    <span className="w-1 h-1 bg-gray-400 rounded-full" />
                    <span className="drop-shadow-md">{current.totalEpisodes} Qism</span>
                  </>
                )}
                <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                  current.status === 'Ongoing' || current.status === 'Davom etmoqda' 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                }`}>
                  {current.status}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link
                to={`/watch/${current.slug}/1`}
                className="px-8 sm:px-12 py-3 sm:py-4 bg-primary hover:bg-primary-dark text-white rounded-full font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-xl shadow-primary/25"
              >
                <Play className="w-5 h-5 fill-white" />
                Tomosha Qilish
              </Link>
              <div className="flex gap-2 sm:gap-3">
                <Link
                  to={`/anime/${current.slug}`}
                  className="px-6 sm:px-10 py-3 sm:py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 rounded-full font-bold flex items-center justify-center gap-3 transition-all"
                >
                  <Info className="w-5 h-5" />
                  Batafsil
                </Link>
                {current.movieId && getAuthToken() && (
                  <button
                    onClick={(e) => handleBookmark(current.movieId, e)}
                    disabled={bookmarkLoading[current.movieId]}
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
                  >
                    {bookmarkLoading[current.movieId] ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : bookmarkStates[current.movieId] ? (
                      <Check className="w-6 h-6 text-primary" />
                    ) : (
                      <Plus className="w-6 h-6" />
                    )}
                  </button>
                )}
              </div>
            </div>
            
            {/* Additional anime info - only show on larger screens */}
            {(current.episodes?.length > 0 || current.ratings?.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="hidden lg:block mt-6 p-4 bg-dark/60 backdrop-blur-sm rounded-lg border border-white/10"
              >
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {current.episodes?.length > 0 && (
                    <div>
                      <span className="text-gray-400">Oxirgi epizod:</span>
                      <div className="font-medium">
                        {current.episodes[current.episodes.length - 1]?.title || 
                         `${current.episodes.length}-qism`}
                      </div>
                    </div>
                  )}
                  {current.ratings?.length > 0 && (
                    <div>
                      <span className="text-gray-400">Izohlar:</span>
                      <div className="font-medium">{current.ratings.length} ta reyting</div>
                    </div>
                  )}
                  {current.duration && (
                    <div>
                      <span className="text-gray-400">Davomiyligi:</span>
                      <div className="font-medium">
                        {Math.round(parseFloat(current.duration) / 60)} daqiqa
                      </div>
                    </div>
                  )}
                  {current.type && (
                    <div>
                      <span className="text-gray-400">Turi:</span>
                      <div className="font-medium capitalize">{current.type}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <button
        onClick={goToPrevious}
        className="hidden sm:flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full items-center justify-center transition-colors"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
      </button>

      <button
        onClick={goToNext}
        className="hidden sm:flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full items-center justify-center transition-colors"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
      </button>

      {/* Dots Navigation */}
      {anime.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2">
          {anime.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-6 sm:w-8 bg-primary' 
                  : 'w-3 sm:w-4 bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
