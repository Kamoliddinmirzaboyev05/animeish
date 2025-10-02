import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, Clock, Star, TrendingUp, Play } from 'lucide-react';
import Navbar from '../components/Navbar';
import { mockAnime } from '../data/mockData';

interface WatchHistoryEntry {
  animeId: number;
  episodeId: number;
  timestamp: number;
}

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryEntry[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const history = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    setWatchHistory(history);
  }, []);

  const stats = useMemo(() => {
    const totalEpisodesWatched = watchHistory.length;
    
    const hoursSpent = Math.round((totalEpisodesWatched * 24) / 60 * 10) / 10;

    const genreCounts: Record<string, number> = {};
    watchHistory.forEach((entry) => {
      const anime = mockAnime.find((a) => a.id === entry.animeId);
      if (anime) {
        anime.genres.forEach((genre) => {
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
  }, [watchHistory]);

  const recentHistory = useMemo(() => {
    return watchHistory
      .slice(0, 10)
      .map((entry) => {
        const anime = mockAnime.find((a) => a.id === entry.animeId);
        const episode = anime?.episodes.find((e) => e.id === entry.episodeId);
        return {
          ...entry,
          anime,
          episode,
        };
      })
      .filter((entry) => entry.anime && entry.episode);
  }, [watchHistory]);

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-xl">Loading...</div>
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
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
              <User className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{user.email || user.username || 'User'}</h1>
              <p className="text-gray-400">Anime Muxlisi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-dark-light border border-dark-lighter rounded-lg p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Play className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalEpisodesWatched}</div>
                  <div className="text-sm text-gray-400">Tomosha Qilingan Epizodlar</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-dark-light border border-dark-lighter rounded-lg p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.hoursSpent}</div>
                  <div className="text-sm text-gray-400">O'tkazilgan Soatlar</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-dark-light border border-dark-lighter rounded-lg p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.favoriteGenre}</div>
                  <div className="text-sm text-gray-400">Sevimli Janr</div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-dark-light border border-dark-lighter rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">Tomosha Tarixi</h2>
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
                    className="flex items-center gap-4 p-4 bg-dark hover:bg-dark-lighter rounded-lg transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/watch/${entry.anime?.id}/${entry.episode?.episodeNumber}`}
                  >
                    <img
                      src={entry.episode?.thumbnail}
                      alt={entry.episode?.title}
                      className="w-32 h-18 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{entry.anime?.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">{entry.episode?.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleDateString('en-US', {
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
