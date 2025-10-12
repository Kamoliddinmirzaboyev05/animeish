import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import HeroSlider from '../components/HeroSlider';
import AnimeSlider from '../components/AnimeSlider';
import SEO from '../components/SEO';

import {
  getBanners,
  getTrendingAnime,
  getPopularAnime,
  getNewReleases,
  getActionAnime,
  getRomanceAnime,
  getFantasyAnime,
  getContinueWatching,
} from '../services/api';

const Home = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [trendingAnime, setTrendingAnime] = useState<any[]>([]);
  const [popularAnime, setPopularAnime] = useState<any[]>([]);
  const [newReleases, setNewReleases] = useState<any[]>([]);
  const [actionAnime, setActionAnime] = useState<any[]>([]);
  const [romanceAnime, setRomanceAnime] = useState<any[]>([]);
  const [fantasyAnime, setFantasyAnime] = useState<any[]>([]);
  const [continueWatching, setContinueWatching] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadAnimeData = async () => {
      try {
        // Load banners first
        const bannersData = await getBanners();

        // Load other data in parallel for better performance
        const [trending, popular, newRel, action, romance, fantasy, continueWatch] = await Promise.all([
          getTrendingAnime(),
          getPopularAnime(),
          getNewReleases(),
          getActionAnime(),
          getRomanceAnime(),
          getFantasyAnime(),
          getContinueWatching(),
        ]);

        // Set state
        setBanners(bannersData);
        setTrendingAnime(trending);
        setPopularAnime(popular);
        setNewReleases(newRel);
        setActionAnime(action);
        setRomanceAnime(romance);
        setFantasyAnime(fantasy);
        setContinueWatching(continueWatch);
      } catch (error) {
        console.error('Error loading anime data:', error);
        toast.error('Ma\'lumotlarni yuklashda xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    };

    loadAnimeData();
  }, []);



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO
        title="Aniki - Eng Yaxshi Anime Seriallar | Bepul Tomosha"
        description="O'zbekistondagi #1 anime streaming platformasi. 1000+ anime serial va filmni HD sifatda bepul tomosha qiling. Naruto, One Piece va boshqalar."
        keywords="anime, anime uzbek, anime serial, anime film, bepul anime, anime tomosha, naruto uzbek, one piece uzbek, attack on titan uzbek, demon slayer uzbek, aniki"
        url="https://aniki.uz"
      />
      <Navbar />

      <div className="pt-16">
        {/* Hero Section */}
        {loading ? (
          <div className="h-[50vh] sm:h-[60vh] lg:h-[70vh] bg-gradient-to-r from-dark via-dark-light to-dark flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Aniki</h1>
              <p className="text-gray-400 text-lg">Ma'lumotlar yuklanmoqda...</p>
            </div>
          </div>
        ) : banners.length > 0 ? (
          <HeroSlider anime={banners} />
        ) : null}

        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {continueWatching.length > 0 && (
            <AnimeSlider title="Tomosha Davom Etish" anime={continueWatching} showProgress />
          )}

          {trendingAnime.length > 0 && (
            <AnimeSlider title="Hozir Mashhur" anime={trendingAnime} />
          )}

          {popularAnime.length > 0 && (
            <AnimeSlider title="Bu Hafta Ommabop" anime={popularAnime} />
          )}

          {newReleases.length > 0 && (
            <AnimeSlider title="Yangi Chiqarilganlar" anime={newReleases} />
          )}

          {actionAnime.length > 0 && (
            <AnimeSlider title="Jangari" anime={actionAnime} />
          )}

          {romanceAnime.length > 0 && (
            <AnimeSlider title="Romantik" anime={romanceAnime} />
          )}

          {fantasyAnime.length > 0 && (
            <AnimeSlider title="Fantastik" anime={fantasyAnime} />
          )}

          {/* Empty state if no anime data */}
          {trendingAnime.length === 0 && popularAnime.length === 0 && newReleases.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎬</div>
              <h2 className="text-2xl font-bold mb-2">Ma'lumotlar yuklanmoqda...</h2>
              <p className="text-gray-400">Iltimos, biroz kuting</p>
            </div>
          )}
        </div>

        {/* Footer - Hidden on Mobile */}
        <footer className="hidden sm:block py-8 sm:py-12 lg:py-16 bg-dark-light border-t border-dark-lighter mt-8 sm:mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {/* Logo va tavsif */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <img src="/logo.svg" alt="Aniki" className="w-8 h-8 sm:w-10 sm:h-10" />
                  <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                    Aniki
                  </div>
                </div>
                <p className="text-gray-400 mb-6 max-w-md text-sm sm:text-base">
                  Eng yaxshi anime seriallar va filmlarni tomosha qiling. Yuqori sifat, tez yuklash va cheksiz zavq.
                </p>
                <div className="flex gap-3 sm:gap-4">
                  {/* Telegram */}
                  <a
                    href="https://t.me/Anikiuz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-dark hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                    title="Telegram"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://instagram.com/aniki.uz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-dark hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                    title="Instagram"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://youtube.com/@aniki.uz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-dark hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                    title="YouTube"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>

                  {/* Twitter/X */}
                  <a
                    href="https://twitter.com/aniki_uz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-dark hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                    title="Twitter"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Tezkor linklar */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Tezkor Linklar</h3>
                <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                  <li><a href="/" className="hover:text-primary transition-colors">Bosh sahifa</a></li>
                  <li><a href="/search" className="hover:text-primary transition-colors">Anime katalogi</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Yangi chiqarilganlar</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Top reytinglar</a></li>
                  <li><a href="/my-list" className="hover:text-primary transition-colors">Mening ro'yxatim</a></li>
                </ul>
              </div>

              {/* Yordam */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Yordam</h3>
                <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                  <li><a href="#" className="hover:text-primary transition-colors">Yordam markazi</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Bog'lanish</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Maxfiylik siyosati</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Foydalanish shartlari</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
                </ul>
              </div>
            </div>

            {/* Pastki qism */}
            <div className="pt-6 sm:pt-8 border-t border-dark-lighter flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-center sm:text-left text-sm sm:text-base">
                &copy; 2025 Aniki. Barcha huquqlar himoyalangan.
              </p>
              <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400">
                <a href="#" className="hover:text-primary transition-colors">Maxfiylik</a>
                <a href="#" className="hover:text-primary transition-colors">Shartlar</a>
                <a href="#" className="hover:text-primary transition-colors">Cookie-lar</a>
              </div>
            </div>
          </div>
        </footer>
      </div>


    </div>
  );
};

export default Home;
