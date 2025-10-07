import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addBookmark, removeBookmark, checkBookmarkStatus, getAuthToken } from '../services/api';
interface HeroSliderProps {
  anime: any[];
}

const HeroSlider = ({ anime }: HeroSliderProps) => {
  console.log('🎬 HeroSlider received anime:', anime);
  console.log('📊 Anime count:', anime?.length);
  console.log('🔍 First anime item:', anime?.[0]);
  
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
      console.error('Bookmark error:', error);
    } finally {
      setBookmarkLoading(prev => ({ ...prev, [movieId]: false }));
    }
  };

  const current = anime[currentIndex];
  
  console.log('🎯 Current anime:', current);
  console.log('📍 Current index:', currentIndex);
  console.log('🖼️ Current banner:', current?.banner);
  console.log('📝 Current title:', current?.title);

  if (!current) {
    console.log('❌ No current anime found');
    return null;
  }

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
          {current.banner ? (
            <img
              src={current.banner}
              alt={current.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Replace with gradient background if image fails
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary/20 via-dark to-primary/20" />
          )}
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
                <span className="font-semibold">{current.rating ? current.rating.toFixed(1) : 'N/A'}</span>
                {current.ratingCount && (
                  <span className="text-gray-400 text-xs">({current.ratingCount})</span>
                )}
              </div>
              {current.year && (
                <>
                  <span className="text-gray-400 hidden sm:inline">•</span>
                  <span>{current.year}</span>
                </>
              )}
              {current.totalEpisodes > 0 && (
                <>
                  <span className="text-gray-400 hidden sm:inline">•</span>
                  <span className="hidden sm:inline">{current.totalEpisodes} Epizod</span>
                </>
              )}
              {current.genres && current.genres.length > 0 && (
                <>
                  <span className="text-gray-400 hidden sm:inline">•</span>
                  <span className="hidden md:inline">{current.genres.slice(0, 2).join(', ')}</span>
                </>
              )}
              <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                {current.status}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link
                to={`/watch/${current.movieId || current.id}/1`}
                className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 bg-primary hover:bg-primary-dark rounded-full font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                Tomosha Qilish
              </Link>
              <div className="flex gap-2 sm:gap-3">
                <Link
                  to={`/anime/${current.movieId || current.id}`}
                  className="flex-1 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                >
                  <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                  Batafsil
                </Link>
                {current.movieId && getAuthToken() && (
                  <button
                    onClick={(e) => handleBookmark(current.movieId, e)}
                    disabled={bookmarkLoading[current.movieId]}
                    className="px-3 sm:px-4 py-2 sm:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base disabled:opacity-50"
                    title={bookmarkStates[current.movieId] ? "Ro'yxatdan o'chirish" : "Ro'yxatga qo'shish"}
                  >
                    {bookmarkLoading[current.movieId] ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : bookmarkStates[current.movieId] ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
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

      {/* Dots Navigation */}
      {anime.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {anime.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-primary scale-125'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

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
