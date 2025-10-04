import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, Clock, Star, TrendingUp, Play, Crown, Calendar, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { fetchAnimeList } from '../services/api';
import { getUserProfile, type UserProfile, type ApiError } from '../services/api';

interface WatchHistoryEntry {
  animeId: number;
  episodeId: number;
  timestamp: number;
}

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [animeList, setAnimeList] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Fetch user profile from API
        const profileData = await getUserProfile();
        setUser(profileData);
        
        // Also update sessionStorage with fresh data
        sessionStorage.setItem('user', JSON.stringify(profileData));

        // Fetch anime list for stats calculation
        const allAnime = await fetchAnimeList();
        setAnimeList(allAnime);
        
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Profil ma\'lumotlarini yuklashda xatolik');
        console.error('Profile fetch error:', err);
        
        // Fallback to sessionStorage data if API fails
        const userData = sessionStorage.getItem('user');
        if (userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    const history = JSON.parse(sessionStorage.getItem('watchHistory') || '[]');
    setWatchHistory(history);
    
    fetchUserData();
  }, []);

  const stats = useMemo(() => {
    const totalEpisodesWatched = watchHistory.length;
    
    const hoursSpent = Math.round((totalEpisodesWatched * 24) / 60 * 10) / 10;

    const genreCounts: Record<string, number> = {};
    watchHistory.forEach((entry) => {
      const anime = animeList.find((a: any) => a.id === entry.animeId);
      if (anime) {
        anime.genres?.forEach((genre: string) => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });

    const favoriteGenre = Object.entries(genreCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0] || 'N/A';

    return {
      totalEpisodesWatched,
      hoursSpent,
      favoriteGenre,
    };
  }, [watchHistory, animeList]);

  const recentHistory = useMemo(() => {
    return watchHistory
      .slice(0, 10)
      .map((entry) => {
        const anime = animeList.find((a: any) => a.id === entry.animeId);
        const episode = anime?.episodes?.find((e: any) => e.id === entry.episodeId);
        return {
          ...entry,
          anime,
          episode,
        };
      })
      .filter((entry) => entry.anime && entry.episode);
  }, [watchHistory, animeList]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <div className="text-xl">Profil yuklanmoqda...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">Xatolik yuz berdi</div>
            <div className="text-gray-400 mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary rounded-lg hover:bg-primary-dark transition-colors"
            >
              Qayta urinish
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-xl">Foydalanuvchi ma'lumotlari topilmadi</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {error && (
            <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 rounded-lg p-3 mb-6">
              <div className="text-sm">
                <strong>Ogohlantirish:</strong> {error}
                <br />
                <span className="text-xs opacity-75">Mahalliy ma'lumotlar ko'rsatilmoqda.</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.first_name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                  <User className="w-12 h-12" />
                </div>
              )}
              {user.is_premium && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold">{user.first_name}</h1>
                {user.is_premium && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-medium">
                    <Crown className="w-4 h-4" />
                    Premium
                  </span>
                )}
              </div>
              <p className="text-gray-400 mb-2">{user.username}</p>
              {user.bio && (
                <p className="text-gray-300 text-sm mb-2">{user.bio}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>
                  Qo'shilgan: {new Date(user.created_at).toLocaleDateString('uz-UZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-dark-light border border-dark-lighter rounded-lg p-4 sm:p-6"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold">{stats.totalEpisodesWatched}</div>
                  <div className="text-xs sm:text-sm text-gray-400">Tomosha Qilingan Epizodlar</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-dark-light border border-dark-lighter rounded-lg p-4 sm:p-6"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold">{stats.hoursSpent}</div>
                  <div className="text-xs sm:text-sm text-gray-400">O'tkazilgan Soatlar</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-dark-light border border-dark-lighter rounded-lg p-4 sm:p-6 sm:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold">{stats.favoriteGenre}</div>
                  <div className="text-xs sm:text-sm text-gray-400">Sevimli Janr</div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-dark-light border border-dark-lighter rounded-lg p-4 sm:p-6"
          >
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-lg sm:text-xl font-bold">Tomosha Tarixi</h2>
            </div>

            {recentHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Hali tomosha tarixi yo'q</p>
                <p className="text-sm mt-2">Tarixni ko'rish uchun anime tomosha qilishni boshlang</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentHistory.map((entry, index) => (
                  <motion.div
                    key={`${entry.animeId}-${entry.episodeId}-${entry.timestamp}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-dark hover:bg-dark-lighter rounded-lg transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/watch/${entry.anime?.id}/${entry.episode?.episodeNumber}`}
                  >
                    <img
                      src={entry.episode?.thumbnail}
                      alt={entry.episode?.title}
                      className="w-20 h-12 sm:w-32 sm:h-18 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 text-sm sm:text-base truncate">{entry.anime?.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2 truncate">{entry.episode?.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleDateString('uz-UZ', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
