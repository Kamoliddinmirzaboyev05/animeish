import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import AnimeCard from '../components/AnimeCard';
import { mockAnime } from '../data/mockData';
import type { Anime } from '../data/mockData';

type SortOption = 'recent' | 'alphabetical' | 'rating';

const MyList = () => {
  const [myListAnime, setMyListAnime] = useState<Anime[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  useEffect(() => {
    loadMyList();
  }, []);

  const loadMyList = () => {
    const myList = JSON.parse(localStorage.getItem('myList') || '[]');
    const anime = mockAnime.filter((a) => myList.includes(a.id));
    setMyListAnime(anime);
  };

  const removeFromList = (animeId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const myList = JSON.parse(localStorage.getItem('myList') || '[]');
    const updated = myList.filter((id: number) => id !== animeId);
    localStorage.setItem('myList', JSON.stringify(updated));
    loadMyList();
  };

  const sortedAnime = [...myListAnime].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      case 'rating':
        return b.rating - a.rating;
      case 'recent':
      default:
        const myList = JSON.parse(localStorage.getItem('myList') || '[]');
        return myList.indexOf(b.id) - myList.indexOf(a.id);
    }
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My List</h1>
            <p className="text-gray-400">
              {myListAnime.length} {myListAnime.length === 1 ? 'anime' : 'anime'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-dark-light border border-dark-lighter rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
            >
              <option value="recent">Recently Added</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        {myListAnime.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 bg-dark-light rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your list is empty</h2>
            <p className="text-gray-400 mb-6 max-w-md">
              Start adding anime to your list to keep track of what you want to watch
            </p>
            <a
              href="/search"
              className="px-6 py-3 bg-primary rounded-lg hover:bg-primary-dark transition-colors"
            >
              Browse Anime
            </a>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedAnime.map((anime, index) => (
              <motion.div
                key={anime.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                <AnimeCard anime={anime} showProgress />
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={(e) => removeFromList(anime.id, e)}
                  className="absolute top-2 right-2 z-10 w-8 h-8 bg-red-500/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from list"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyList;
