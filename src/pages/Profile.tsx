import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Heart, TrendingUp, Crown, Calendar, Loader2, ChevronLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getBookmarks, getRecommendations } from '../services/api';
import { getUserProfile, type UserProfile, type ApiError } from '../services/api';



const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Fetch user profile from API
        const profileData = await getUserProfile();
        setUser(profileData);

        // Also update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(profileData));

        // Fetch user bookmarks and recommendations in parallel
        const [userBookmarks, userRecommendations] = await Promise.all([
          getBookmarks().catch((error) => {
            console.error('Error fetching bookmarks:', error);
            return [];
          }),
          getRecommendations().catch((error) => {
            console.error('Error fetching recommendations:', error);
            return [];
          })
        ]);

        setBookmarks(userBookmarks);
        setRecommendations(userRecommendations);

        // Debug: Log recommendations data
        console.log('📊 Final recommendations data for Profile:', userRecommendations);
        userRecommendations.forEach((rec, index) => {
          console.log(`📋 Recommendation ${index + 1}:`, {
            id: rec.id,
            title: rec.title,
            thumbnail: rec.thumbnail,
            banner: rec.banner,
            rating: rec.rating,
            hasImage: !!rec.thumbnail
          });
        });

      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Profil ma\'lumotlarini yuklashda xatolik');
        console.error('Profile fetch error:', err);

        // Fallback to localStorage data if API fails
        const userData = localStorage.getItem('user');
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

    fetchUserData();
  }, []);



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
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Orqaga</span>
          </button>
        </div>

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
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                <User className="w-12 h-12" />
              </div>
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
              <p className="text-gray-400 mb-2">{user.email}</p>
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

          {/* Sizga Tavsiya Etiladigan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-light border border-dark-lighter rounded-lg p-4 sm:p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <h2 className="text-lg sm:text-xl font-bold">Sizga Tavsiya Etiladigan</h2>
              </div>
            </div>

            {recommendations.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Tavsiyalar yuklanmoqda...</p>
                <p className="text-sm mt-2">Sizning didingizga mos animelarni topmoqdamiz</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {recommendations.slice(0, 6).map((anime, index) => (
                  <motion.a
                    key={anime.id}
                    href={`/anime/${anime.id}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="group block"
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br from-dark-light to-dark">
                      {anime.thumbnail ? (
                        <>
                          {console.log(`Tavsiya rasmi:  https://api.aniki.uz/${anime.thumbnail}`)}
                          <img
                            src={`https://api.aniki.uz/${anime.thumbnail}`}

                            alt={anime.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              console.log('🖼️ Image failed to load:', anime.thumbnail);
                              // Replace with fallback content
                              const container = (e.target as HTMLImageElement).parentElement;
                              if (container) {
                                container.innerHTML = `
                                  <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                                    <div class="text-center p-2">
                                      <div class="text-2xl mb-1">🎬</div>
                                      <div class="text-xs text-gray-400 line-clamp-2">${anime.title}</div>
                                    </div>
                                  </div>
                                `;
                              }
                            }}
                          />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                          <div className="text-center p-2">
                            <div className="text-2xl mb-1">🎬</div>
                            <div className="text-xs text-gray-400 line-clamp-2">{anime.title}</div>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-2 left-2 right-2">
                          <h3 className="text-xs font-semibold line-clamp-2">{anime.title}</h3>
                          {anime.rating && anime.rating > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                              <span className="text-xs text-yellow-400">{anime.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            )}
          </motion.div>

          {/* Saqlangan Animelar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-dark-light border border-dark-lighter rounded-lg p-4 sm:p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <h2 className="text-lg sm:text-xl font-bold">Saqlangan Animelar</h2>
              </div>
              {bookmarks.length > 0 && (
                <a
                  href="/my-list"
                  className="text-primary hover:text-primary-light text-sm transition-colors"
                >
                  Barchasini ko'rish
                </a>
              )}
            </div>

            {bookmarks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Hali saqlangan animelar yo'q</p>
                <p className="text-sm mt-2">Yoqgan animeleringizni saqlash uchun ♥ tugmasini bosing</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {bookmarks.slice(0, 6).map((anime, index) => (
                  <motion.a
                    key={anime.id}
                    href={`/anime/${anime.id}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="group block"
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-dark">
                      <img
                        src={anime.thumbnail}
                        alt={anime.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-2 left-2 right-2">
                          <h3 className="text-xs font-semibold line-clamp-2">{anime.title}</h3>
                        </div>
                      </div>
                    </div>
                  </motion.a>
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
