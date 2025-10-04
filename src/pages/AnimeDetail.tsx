import { useParams, useNavigate } from 'react-router-dom';
import { Star, Play, Heart, Calendar, Film } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AnimeSlider from '../components/AnimeSlider';
import { fetchAnimeById, fetchAnimeList } from '../services/api';
import { translateStatus, translateGenres } from '../utils/translations';

const AnimeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<any>(null);
  const [relatedAnime, setRelatedAnime] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const isLoggedIn = sessionStorage.getItem('access_token');

  useEffect(() => {
    const loadAnimeData = async () => {
      try {
        const animeData = await fetchAnimeById(Number(id));
        setAnime(animeData);

        if (animeData) {
          const allAnime = await fetchAnimeList();
          const related = allAnime
            .filter((a: any) => a.id !== animeData.id && a.genres?.some((g: string) => animeData.genres?.includes(g)))
            .slice(0, 10);
          setRelatedAnime(related);
        }
      } catch (error) {
        console.error('Error loading anime data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnimeData();

    const myList = JSON.parse(sessionStorage.getItem('myList') || '[]');
    setIsSaved(myList.includes(Number(id)));
  }, [id]);

  const handleWatch = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate(`/watch/${anime?.id}/1`);
  };

  const handleEpisodeWatch = (episodeNumber: number) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate(`/watch/${anime?.id}/${episodeNumber}`);
  };

  const toggleSaved = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const myList = JSON.parse(sessionStorage.getItem('myList') || '[]');

    if (isSaved) {
      const updated = myList.filter((animeId: number) => animeId !== Number(id));
      sessionStorage.setItem('myList', JSON.stringify(updated));
      setIsSaved(false);
    } else {
      myList.push(Number(id));
      sessionStorage.setItem('myList', JSON.stringify(myList));
      setIsSaved(true);
    }
  };

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

  if (!anime) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Anime topilmadi</h2>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-primary rounded-full hover:bg-primary-dark transition-colors"
            >
              Bosh sahifaga qaytish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-16">
        <div className="relative h-[50vh] sm:h-[60vh]">
          <img
            src={anime.banner}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl"
              >
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 sm:mb-4">{anime.title}</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4 text-sm sm:text-base">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{anime.rating || 'N/A'}</span>
                  </div>
                  <span className="text-gray-400 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{anime.year || 'N/A'}</span>
                  </div>
                  <span className="text-gray-400 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Film className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{anime.totalEpisodes || 0} Epizod</span>
                  </div>
                  <span className="px-2 sm:px-3 py-1 bg-primary/20 text-primary rounded-full text-xs sm:text-sm">
                    {translateStatus(anime.status) || anime.status || 'N/A'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={handleWatch}
                    className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 bg-primary hover:bg-primary-dark rounded-full font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                    Hozir Tomosha Qilish
                  </button>
                  <button
                    onClick={toggleSaved}
                    className={`px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base ${isSaved
                      ? 'bg-primary/20 text-primary border-2 border-primary'
                      : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'
                      }`}
                  >
                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? 'fill-primary' : ''}`} />
                    <span className="hidden sm:inline">{isSaved ? 'Ro\'yxatimda' : 'Ro\'yxatga Qo\'shish'}</span>
                    <span className="sm:hidden">{isSaved ? 'Saqlangan' : 'Saqlash'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 mb-8 sm:mb-12">
            <div className="lg:col-span-2">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Qisqacha Mazmun</h2>
              <p className="text-gray-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">{anime.description}</p>

              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Janrlar</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.genres?.map((genre: string, index: number) => (
                    <span
                      key={`${genre}-${index}`}
                      className="px-3 sm:px-4 py-1 sm:py-2 bg-dark-light border border-dark-lighter rounded-full hover:border-primary transition-colors text-xs sm:text-sm"
                    >
                      {translateGenres([genre])[0] || genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-dark-light border border-dark-lighter rounded-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Ma'lumot</h3>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Holat:</span>
                    <span className="font-semibold">{translateStatus(anime.status) || anime.status || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Epizodlar:</span>
                    <span className="font-semibold">{anime.totalEpisodes || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Yil:</span>
                    <span className="font-semibold">{anime.year || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reyting:</span>
                    <span className="font-semibold">{anime.rating || 'N/A'}/10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {anime.episodes && anime.episodes.length > 0 && (
            <div className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Epizodlar</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {anime.episodes.map((episode: any) => (
                  <button
                    key={episode.id}
                    onClick={() => handleEpisodeWatch(episode.episodeNumber)}
                    className="group text-left w-full"
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-dark-light mb-1 sm:mb-2">
                      <img
                        src={episode.thumbnail}
                        alt={episode.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {episode.watched && (
                        <div className="absolute top-1 sm:top-2 right-1 sm:right-2 w-4 h-4 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-xs">✓</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
                      </div>
                      <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 px-1 sm:px-2 py-0.5 sm:py-1 bg-dark/90 rounded text-xs">
                        {episode.duration}
                      </div>
                    </div>
                    <h3 className="font-semibold text-xs sm:text-sm group-hover:text-primary transition-colors line-clamp-2">
                      {episode.title}
                    </h3>
                  </button>
                ))}
              </div>
            </div>
          )}

          {relatedAnime.length > 0 && (
            <AnimeSlider title="Sizga Yoqishi Mumkin" anime={relatedAnime} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimeDetail;
