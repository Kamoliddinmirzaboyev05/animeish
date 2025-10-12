import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import AnimeCard from '../components/AnimeCard';
import SEO from '../components/SEO';

import { fetchAnimeList, searchAnime } from '../services/api';
import { translateGenres } from '../utils/translations';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState({ min: 2000, max: new Date().getFullYear() });
  const [minRating, setMinRating] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [actualYearRange, setActualYearRange] = useState({ min: 2000, max: new Date().getFullYear() });

  useEffect(() => {
    const loadAnimeData = async () => {
      try {
        const data = await fetchAnimeList();
        setAnimeList(data);
        setSearchResults(data);
      } catch (error) {
        console.error('Error loading anime data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnimeData();
  }, []);

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    animeList.forEach((anime) => {
      if (anime.genres && Array.isArray(anime.genres)) {
        anime.genres.forEach((g: string) => genres.add(g));
      }
    });
    return Array.from(genres).sort();
  }, [animeList]);

  // Dinamik yil oralig'ini hisoblash
  const yearBounds = useMemo(() => {
    if (animeList.length === 0) {
      return { min: 2000, max: new Date().getFullYear() };
    }
    
    const years = animeList
      .map(anime => anime.year)
      .filter(year => year && year > 1900) // Noto'g'ri yillarni filtrlash
      .sort((a, b) => a - b);
    
    const minYear = years.length > 0 ? years[0] : 2000;
    const maxYear = new Date().getFullYear();
    
    console.log('📅 Year bounds calculated:', { minYear, maxYear, totalAnime: animeList.length });
    
    return { min: minYear, max: maxYear };
  }, [animeList]);

  // Yil oralig'ini yangilash
  useEffect(() => {
    setActualYearRange(yearBounds);
    setYearRange(yearBounds);
  }, [yearBounds]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setSearchResults(animeList);
        setShowSuggestions(false);
        setSearching(false);
        return;
      }

      setSearching(true);
      try {
        const results = await searchAnime(debouncedQuery);
        setSearchResults(results);
        setShowSuggestions(results.some((anime: any) => anime.isSuggestion));
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    if (animeList.length > 0) {
      performSearch();
    }
  }, [debouncedQuery, animeList]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const filteredAnime = useMemo(() => {
    return searchResults.filter((anime) => {
      const matchesGenre =
        selectedGenres.length === 0 ||
        (anime.genres && Array.isArray(anime.genres) && selectedGenres.some((g) => anime.genres.includes(g)));
      
      const matchesYear =
        anime.year >= yearRange.min && anime.year <= yearRange.max;
      
      const matchesRating = (anime.rating || 0) >= minRating;
      
      const matchesStatus =
        !selectedStatus || anime.status === selectedStatus;

      return (
        matchesGenre &&
        matchesYear &&
        matchesRating &&
        matchesStatus
      );
    });
  }, [searchResults, selectedGenres, yearRange, minRating, selectedStatus]);

  const resetFilters = () => {
    setSelectedGenres([]);
    setYearRange(actualYearRange);
    setMinRating(0);
    setSelectedStatus('');
  };

  const hasActiveFilters =
    selectedGenres.length > 0 ||
    yearRange.min !== actualYearRange.min ||
    yearRange.max !== actualYearRange.max ||
    minRating > 0 ||
    selectedStatus !== '';



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
      <SEO 
        title={debouncedQuery ? `"${debouncedQuery}" uchun qidiruv natijalari | Aniki` : 'Anime Qidiruv | Aniki'}
        description={debouncedQuery ? `"${debouncedQuery}" uchun anime qidiruv natijalari. Eng yaxshi anime seriallar va filmlarni toping.` : 'Minglab anime seriallar va filmlar orasidan o\'zingizga yoqqanini toping. Aniki - eng yaxshi anime streaming platformasi.'}
        keywords={`anime qidiruv, ${debouncedQuery || 'anime'}, anime serial, anime film, aniki, anime streaming, anime uzbek`}
        url={`https://aniki.uz/search${debouncedQuery ? `?q=${encodeURIComponent(debouncedQuery)}` : ''}`}
      />
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

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            {showSuggestions && !searching && (
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="w-4 h-4" />
                <span>Sizga yoqishi mumkin</span>
              </div>
            )}
            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                  {selectedGenres.length + (minRating > 0 ? 1 : 0) + (yearRange.min !== actualYearRange.min || yearRange.max !== actualYearRange.max ? 1 : 0) + (selectedStatus ? 1 : 0)} ta filtr
                </span>
                <button
                  onClick={resetFilters}
                  className="text-primary hover:text-primary-light transition-colors"
                >
                  Tozalash
                </button>
              </div>
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
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">{actualYearRange.min}</span>
                          <span className="text-primary font-semibold">{yearRange.min} - {yearRange.max}</span>
                          <span className="text-gray-400">{actualYearRange.max}</span>
                        </div>
                        
                        {/* Sodda yil slider */}
                        <input
                          type="range"
                          min={actualYearRange.min}
                          max={actualYearRange.max}
                          value={yearRange.min}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setYearRange({ min: value, max: Math.max(value, actualYearRange.max) });
                          }}
                          className="w-full rating-slider"
                          style={{
                            background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((yearRange.min - actualYearRange.min) / (actualYearRange.max - actualYearRange.min)) * 100}%, #374151 ${((yearRange.min - actualYearRange.min) / (actualYearRange.max - actualYearRange.min)) * 100}%, #374151 100%)`
                          }}
                        />
                        
                        <div className="text-xs text-gray-500 text-center">
                          {yearRange.min === actualYearRange.min ? 'Barcha yillar' : `${yearRange.min} yildan boshlab`}
                        </div>
                        
                        {/* Tezkor tanlash */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setYearRange({ min: actualYearRange.min, max: actualYearRange.max })}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              yearRange.min === actualYearRange.min
                                ? 'bg-primary text-white' 
                                : 'bg-dark-light hover:bg-primary/20'
                            }`}
                          >
                            Barchasi
                          </button>
                          <button
                            onClick={() => setYearRange({ min: actualYearRange.max - 2, max: actualYearRange.max })}
                            className="px-2 py-1 text-xs bg-dark-light hover:bg-primary/20 rounded transition-colors"
                          >
                            2 yil
                          </button>
                          <button
                            onClick={() => setYearRange({ min: actualYearRange.max - 5, max: actualYearRange.max })}
                            className="px-2 py-1 text-xs bg-dark-light hover:bg-primary/20 rounded transition-colors"
                          >
                            5 yil
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Minimal Reyting</h3>
                      <div className="space-y-3">
                        <div className="relative">
                          <input
                            type="range"
                            min="0"
                            max="5"
                            step="0.1"
                            value={minRating}
                            onChange={(e) => setMinRating(Number(e.target.value))}
                            className="w-full rating-slider"
                            style={{
                              background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(minRating / 5) * 100}%, #374151 ${(minRating / 5) * 100}%, #374151 100%)`
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">0.0</span>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            <span className="text-primary font-semibold">{minRating.toFixed(1)}</span>
                          </div>
                          <span className="text-gray-400">5.0</span>
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          {minRating === 0 ? 'Barcha reytinglar' : `${minRating.toFixed(1)} va undan yuqori`}
                        </div>
                        
                        {/* Tezkor reyting tanlash */}
                        <div className="grid grid-cols-3 gap-1 mt-2">
                          {[0, 3, 4].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => setMinRating(rating)}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                minRating === rating 
                                  ? 'bg-primary text-white' 
                                  : 'bg-dark-light hover:bg-primary/20'
                              }`}
                            >
                              {rating === 0 ? 'Barchasi' : `${rating}+ ★`}
                            </button>
                          ))}
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
            {searching ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredAnime.length === 0 ? (
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
              <>
                {showSuggestions && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-primary">Sizga yoqishi mumkin bo'lgan animelar</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Qidiruv bo'yicha aniq natija topilmadi, lekin bu animelar sizni qiziqtirishi mumkin
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredAnime.map((anime, index) => (
                    <motion.div
                      key={anime.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={anime.isSuggestion ? 'relative' : ''}
                    >
                      {anime.isSuggestion && (
                        <div className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-primary to-purple-500 text-white text-xs px-2 py-1 rounded-full">
                          Tavsiya
                        </div>
                      )}
                      <AnimeCard anime={anime} />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      

    </div>
  );
};

export default Search;
