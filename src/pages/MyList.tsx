import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import AnimeCard from '../components/AnimeCard';
import Toast from '../components/Toast';
import { getBookmarks, removeBookmark } from '../services/api';

type SortOption = 'recent' | 'alphabetical' | 'rating';

const MyList = () => {
  const [myListAnime, setMyListAnime] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    loadMyList();
  }, []);

  const loadMyList = async () => {
    try {
      const bookmarks = await getBookmarks();
      setMyListAnime(bookmarks);
    } catch (error) {
      console.error('Error loading my list:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromList = async (animeId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removeBookmark(animeId);
      loadMyList(); // Reload the list after removal
    } catch (error) {
      console.error('Error removing from list:', error);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const sortedAnime = [...myListAnime].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical':
        return (a.title || '').localeCompare(b.title || '');
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'recent':
      default:
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-20 sm:pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className='sm:flex flex-wrap'>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Mening Ro'yxatim</h1>
            <p className="text-gray-400 text-sm sm:text-base">
              {myListAnime.length} ta anime
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 hidden sm:inline">Saralash:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-dark-light border border-dark-lighter rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors w-full sm:w-auto"
            >
              <option value="recent">Yaqinda Qo'shilgan</option>
              <option value="alphabetical">Alifbo Bo'yicha</option>
              <option value="rating">Reyting Bo'yicha</option>
            </select>
          </div>
        </div>

        {myListAnime.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4"
          >
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-dark-light rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-gray-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Ro'yxatingiz bo'sh</h2>
            <p className="text-gray-400 mb-4 sm:mb-6 max-w-md text-sm sm:text-base">
              Tomosha qilmoqchi bo'lgan animelarni kuzatib borish uchun ro'yxatga qo'shishni boshlang
            </p>
            <a
              href="/search"
              className="px-4 sm:px-6 py-2 sm:py-3 bg-primary rounded-lg hover:bg-primary-dark transition-colors text-sm sm:text-base"
            >
              Anime Qidirish
            </a>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {sortedAnime.map((anime, index) => (
              <motion.div
                key={anime.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                <AnimeCard anime={anime} showProgress onShowToast={showToast} />
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={(e) => removeFromList(anime.id, e)}
                  className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10 w-6 h-6 sm:w-8 sm:h-8 bg-red-500/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Ro'yxatdan o'chirish"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default MyList;
