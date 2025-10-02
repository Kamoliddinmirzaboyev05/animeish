import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import AnimeCard from '../components/AnimeCard';
import { mockAnime } from '../data/mockData';
import { translateGenres } from '../utils/translations';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState({ min: 2000, max: 2024 });
  const [minRating, setMinRating] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    mockAnime.forEach((anime) => anime.genres.forEach((g) => genres.add(g)));
    return Array.from(genres).sort();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const filteredAnime = useMemo(() => {
    return mockAnime.filter((anime) => {
      const matchesSearch = anime.title
        .toLowerCase()
        .includes(debouncedQuery.toLowerCase());
      
      const matchesGenre =
        selectedGenres.length === 0 ||
        selectedGenres.some((g) => anime.genres.includes(g));
      
      const matchesYear =
        anime.year >= yearRange.min && anime.year <= yearRange.max;
      
      const matchesRating = anime.rating >= minRating;
      
      const matchesStatus =
        !selectedStatus || anime.status === selectedStatus;

      return (
        matchesSearch &&
        matchesGenre &&
        matchesYear &&
        matchesRating &&
        matchesStatus
      );
    });
  }, [debouncedQuery, selectedGenres, yearRange, minRating, selectedStatus]);

  const resetFilters = () => {
    setSelectedGenres([]);
    setYearRange({ min: 2000, max: 2024 });
    setMinRating(0);
    setSelectedStatus('');
  };

  const hasActiveFilters =
    selectedGenres.length > 0 ||
    yearRange.min !== 2000 ||
    yearRange.max !== 2024 ||
    minRating > 0 ||
    selectedStatus !== '';

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Anime qidirish..."
                className="w-full bg-dark-light border border-dark-lighter rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-primary transition-colors"
              />
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden p-3 bg-dark-light border border-dark-lighter rounded-lg hover:bg-dark-lighter transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>
              {filteredAnime.length} ta natija
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-primary hover:text-primary-light transition-colors"
              >
                Filtrlarni tozalash
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          <AnimatePresence>
            {(showFilters || window.innerWidth >= 1024) && (
              <motion.aside
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="fixed lg:static inset-y-0 left-0 z-40 w-80 lg:w-64 bg-dark lg:bg-transparent p-6 lg:p-0 overflow-y-auto custom-scrollbar lg:overflow-visible"
              >
                <div className="lg:sticky lg:top-24">
                  <div className="flex items-center justify-between mb-6 lg:hidden">
                    <h2 className="text-xl font-bold">Filtrlar</h2>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 hover:bg-dark-light rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Janr</h3>
                      <div className="space-y-2">
                        {allGenres.map((genre) => (
                          <label
                            key={genre}
                            className="flex items-center gap-2 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={selectedGenres.includes(genre)}
                              onChange={() => toggleGenre(genre)}
                              className="w-4 h-4 rounded border-dark-lighter bg-dark-light checked:bg-primary focus:ring-0 focus:ring-offset-0"
                            />
                            <span className="text-sm group-hover:text-primary transition-colors">
                              {translateGenres([genre])[0]}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Yil</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-400">Dan</label>
                          <input
                            type="number"
                            min="2000"
                            max="2024"
                            value={yearRange.min}
                            onChange={(e) =>
                              setYearRange((prev) => ({ ...prev, min: Number(e.target.value) }))
                            }
                            className="w-full bg-dark-light border border-dark-lighter rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Gacha</label>
                          <input
                            type="number"
                            min="2000"
                            max="2024"
                            value={yearRange.max}
                            onChange={(e) =>
                              setYearRange((prev) => ({ ...prev, max: Number(e.target.value) }))
                            }
                            className="w-full bg-dark-light border border-dark-lighter rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Minimal Reyting</h3>
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.5"
                          value={minRating}
                          onChange={(e) => setMinRating(Number(e.target.value))}
                          className="w-full h-2 bg-dark-light rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
                        />
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">0</span>
                          <span className="text-primary font-semibold">{minRating}</span>
                          <span className="text-gray-400">10</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Holat</h3>
                      <div className="space-y-2">
                        {['', 'Ongoing', 'Completed', 'Upcoming'].map((status) => (
                          <label key={status} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="radio"
                              name="status"
                              checked={selectedStatus === status}
                              onChange={() => setSelectedStatus(status)}
                              className="w-4 h-4 border-dark-lighter bg-dark-light checked:bg-primary focus:ring-0 focus:ring-offset-0"
                            />
                            <span className="text-sm group-hover:text-primary transition-colors">
                              {status === '' ? 'Barchasi' : status === 'Ongoing' ? 'Davom etmoqda' : status === 'Completed' ? 'Tugallangan' : status === 'Upcoming' ? 'Tez orada' : status}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-dark-lighter space-y-2">
                      <button
                        onClick={() => setShowFilters(false)}
                        className="w-full px-4 py-2 bg-primary rounded-lg hover:bg-primary-dark transition-colors lg:hidden"
                      >
                        Filtrlarni Qo'llash
                      </button>
                      <button
                        onClick={resetFilters}
                        className="w-full px-4 py-2 bg-dark-light rounded-lg hover:bg-dark-lighter transition-colors"
                      >
                        Tozalash
                      </button>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {showFilters && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-30"
              onClick={() => setShowFilters(false)}
            />
          )}

          <div className="flex-1">
            {filteredAnime.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-24 h-24 bg-dark-light rounded-full flex items-center justify-center mb-6">
                  <SearchIcon className="w-12 h-12 text-gray-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Hech narsa topilmadi</h2>
                <p className="text-gray-400 mb-6">
                  Qidiruv yoki filtrlarni o'zgartirib ko'ring
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredAnime.map((anime, index) => (
                  <motion.div
                    key={anime.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AnimeCard anime={anime} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
