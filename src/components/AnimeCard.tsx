import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Anime } from '../data/mockData';
import { useState, useEffect } from 'react';

interface AnimeCardProps {
  anime: Anime;
  showProgress?: boolean;
}

const AnimeCard = ({ anime, showProgress }: AnimeCardProps) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const isLoggedIn = localStorage.getItem('access_token');

  useEffect(() => {
    const myList = JSON.parse(localStorage.getItem('myList') || '[]');
    setIsSaved(myList.includes(anime.id));
  }, [anime.id]);

  const toggleSaved = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    const myList = JSON.parse(localStorage.getItem('myList') || '[]');
    
    if (isSaved) {
      const updated = myList.filter((id: number) => id !== anime.id);
      localStorage.setItem('myList', JSON.stringify(updated));
      setIsSaved(false);
    } else {
      myList.push(anime.id);
      localStorage.setItem('myList', JSON.stringify(myList));
      setIsSaved(true);
    }
  };

  const watchedEpisodes = anime.episodes.filter(e => e.watched).length;
  const progress = (watchedEpisodes / anime.totalEpisodes) * 100;

  return (
    <Link to={`/anime/${anime.id}`}>
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        className="relative group cursor-pointer"
      >
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-dark-light">
          <img
            src={anime.thumbnail}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: isHovered ? 1 : 0 }}
                className="w-12 h-12 bg-primary rounded-full flex items-center justify-center"
              >
                <Play className="w-6 h-6 fill-white" />
              </motion.div>
            </div>
          </div>

          <div className="absolute top-2 right-2 flex gap-2">
            <div className="bg-dark/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold">{anime.rating}</span>
            </div>
          </div>

          <button
            onClick={toggleSaved}
            className="absolute top-2 left-2 w-8 h-8 bg-dark/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-primary transition-colors opacity-0 group-hover:opacity-100"
          >
            <Heart
              className={`w-4 h-4 ${isSaved ? 'fill-primary text-primary' : 'text-white'}`}
            />
          </button>

          {showProgress && watchedEpisodes > 0 && (
            <div className="absolute bottom-0 left-0 right-0">
              <div className="bg-dark/90 backdrop-blur-sm px-2 py-1">
                <div className="text-xs mb-1">
                  {watchedEpisodes} / {anime.totalEpisodes} episodes
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
          <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {anime.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{anime.year}</span>
            <span>•</span>
            <span>{anime.totalEpisodes} eps</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {anime.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="text-xs bg-dark-light px-2 py-0.5 rounded-full text-gray-300"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default AnimeCard;
