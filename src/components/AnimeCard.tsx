import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart, Play, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { addBookmark, removeBookmark, checkBookmarkStatus } from '../services/api';
import RatingModal from './RatingModal';

interface AnimeCardProps {
  anime: any;
  showProgress?: boolean;
  showRating?: boolean;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const AnimeCard = ({ anime, showProgress, showRating = true, onShowToast }: AnimeCardProps) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  
  const isLoggedIn = localStorage.getItem('access_token');

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (isLoggedIn) {
        try {
          const saved = await checkBookmarkStatus(anime.id);
          setIsSaved(saved);
        } catch (error) {
          console.error('Error checking bookmark status:', error);
        }
      }
    };
    
    checkSavedStatus();
  }, [anime.id, isLoggedIn]);

  const toggleSaved = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    try {
      if (isSaved) {
        await removeBookmark(anime.id);
        setIsSaved(false);
      } else {
        await addBookmark(anime.id);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleRatingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    setShowRatingModal(true);
  };

  const watchedEpisodes = anime.episodes?.filter((e: any) => e.watched).length || 0;
  const progress = anime.totalEpisodes > 0 ? (watchedEpisodes / anime.totalEpisodes) * 100 : 0;

  return (
    <Link to={`/anime/${anime.id}`}>
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        className="relative group cursor-pointer"
      >
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-dark-light">
          {anime.thumbnail ? (
            <img
              src={anime.thumbnail}
              alt={anime.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                // Hide image if it fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-light to-dark">
              <div className="text-center p-4">
                <div className="text-4xl mb-2">🎬</div>
                <div className="text-xs text-gray-400 line-clamp-2">{anime.title}</div>
              </div>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: isHovered ? 1 : 0 }}
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-primary rounded-full flex items-center justify-center"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 fill-white" />
              </motion.div>
            </div>
          </div>

          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex gap-1 sm:gap-2">
            <div className="bg-dark/90 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md flex items-center gap-1">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold">{anime.rating || 'N/A'}</span>
            </div>
          </div>

          <div className="absolute top-1 sm:top-2 left-1 sm:left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={toggleSaved}
              className="w-6 h-6 sm:w-8 sm:h-8 bg-dark/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-primary transition-colors"
            >
              <Heart
                className={`w-3 h-3 sm:w-4 sm:h-4 ${isSaved ? 'fill-primary text-primary' : 'text-white'}`}
              />
            </button>
            
            {showRating && isLoggedIn && (
              <button
                onClick={handleRatingClick}
                className="w-6 h-6 sm:w-8 sm:h-8 bg-dark/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors"
                title="Reyting va izoh berish"
              >
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </button>
            )}
          </div>

          {showProgress && watchedEpisodes > 0 && (
            <div className="absolute bottom-0 left-0 right-0">
              <div className="bg-dark/90 backdrop-blur-sm px-1.5 sm:px-2 py-1">
                <div className="text-xs mb-1">
                  {watchedEpisodes} / {anime.totalEpisodes || 0} eps
                </div>
                <div className="h-1 bg-dark-lighter rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-2 space-y-1">
          <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors text-sm sm:text-base">
            {anime.title}
          </h3>
          <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-400">
            <span>{anime.year || 'N/A'}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{anime.totalEpisodes || 0} eps</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {anime.genres?.slice(0, 1).map((genre: string, index: number) => (
              <span
                key={`${genre}-${index}`}
                className="text-xs bg-dark-light px-1.5 sm:px-2 py-0.5 rounded-full text-gray-300"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
      
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        animeId={anime.id}
        animeTitle={anime.title}
        onShowToast={onShowToast}
        onRatingSubmitted={() => {
          // Optionally refresh data or show success message
          console.log('Rating submitted successfully');
        }}
      />
    </Link>
  );
};

export default AnimeCard;
