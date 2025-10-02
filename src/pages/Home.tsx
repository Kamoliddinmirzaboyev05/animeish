import Navbar from '../components/Navbar';
import HeroSlider from '../components/HeroSlider';
import AnimeSlider from '../components/AnimeSlider';
import {
  getFeaturedAnime,
  getTrendingAnime,
  getPopularAnime,
  getNewReleases,
  getActionAnime,
  getRomanceAnime,
  getFantasyAnime,
  getContinueWatching,
} from '../data/mockData';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-16">
        <HeroSlider anime={getFeaturedAnime()} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <AnimeSlider title="Tomosha Davom Etish" anime={getContinueWatching()} showProgress />
          <AnimeSlider title="Hozir Mashhur" anime={getTrendingAnime()} />
          <AnimeSlider title="Bu Hafta Ommabop" anime={getPopularAnime()} />
          <AnimeSlider title="Yangi Chiqarilganlar" anime={getNewReleases()} />
          <AnimeSlider title="Jangari" anime={getActionAnime()} />
          <AnimeSlider title="Romantik" anime={getRomanceAnime()} />
          <AnimeSlider title="Fantastik" anime={getFantasyAnime()} />
        </div>
      </div>
    </div>
  );
};

export default Home;
