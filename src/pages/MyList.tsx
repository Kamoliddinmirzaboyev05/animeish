import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import AnimeCard from '../components/AnimeCard';
import { fetchAnimeList } from '../services/api';

type SortOption = 'recent' | 'alphabetical' | 'rating';

const MyList = () => {
  const [myListAnime, setMyListAnime] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyList();
  }, []);

  const loadMyList = async () => {
    try {
      const myList = JSON.parse(localStorage.getItem('myList') || '[]');
      const allAnime = await fetchAnimeList();
      const anime = allAnime.filter((a: any) => myList.includes(a.id));
      setMyListAnime(anime);
    } catch (error) {
      console.error('Error loading my list:', error);
    } finally {
      setLoading(false);
    }
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
        return (a.title || '').localeCompare(b.title || '');
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'recent':
      default:
        const myList = JSON.parse(localStorage.getItem('myList') || '[]');
        return myList.indexOf(b.id) - myList.indexOf(a.id);
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

      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mening Ro'yxatim</h1>
            <p className="text-gray-400">
              {myListAnime.length} ta anime
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Saralash:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-dark-light border border-dark-lighter rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
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
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 bg-dark-light rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Ro'yxatingiz bo'sh</h2>
            <p className="text-gray-400 mb-6 max-w-md">
              Tomosha qilmoqchi bo'lgan animelarni kuzatib borish uchun ro'yxatga qo'shishni boshlang
            </p>
            <a
              href="/search"
              className="px-6 py-3 bg-primary rounded-lg hover:bg-primary-dark transition-colors"
            >
              Anime Qidirish
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
                  title="Ro'yxatdan o'chirish"
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
