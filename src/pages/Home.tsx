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
          <AnimeSlider title="Continue Watching" anime={getContinueWatching()} showProgress />
          <AnimeSlider title="Trending Now" anime={getTrendingAnime()} />
          <AnimeSlider title="Popular This Week" anime={getPopularAnime()} />
          <AnimeSlider title="New Releases" anime={getNewReleases()} />
          <AnimeSlider title="Action" anime={getActionAnime()} />
          <AnimeSlider title="Romance" anime={getRomanceAnime()} />
          <AnimeSlider title="Fantasy" anime={getFantasyAnime()} />
        </div>
      </div>
    </div>
  );
};

export default Home;
