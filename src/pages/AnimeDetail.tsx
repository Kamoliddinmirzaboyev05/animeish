import { useParams, Link } from 'react-router-dom';
import { Star, Play, Heart, Calendar, Film } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AnimeSlider from '../components/AnimeSlider';
import { mockAnime } from '../data/mockData';

const AnimeDetail = () => {
  const { id } = useParams();
  const anime = mockAnime.find((a) => a.id === Number(id));
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const myList = JSON.parse(localStorage.getItem('myList') || '[]');
    setIsSaved(myList.includes(Number(id)));
  }, [id]);

  const toggleSaved = () => {
    const myList = JSON.parse(localStorage.getItem('myList') || '[]');
    
    if (isSaved) {
      const updated = myList.filter((animeId: number) => animeId !== Number(id));
      localStorage.setItem('myList', JSON.stringify(updated));
      setIsSaved(false);
    } else {
      myList.push(Number(id));
      localStorage.setItem('myList', JSON.stringify(myList));
      setIsSaved(true);
    }
  };

  if (!anime) {
    return <div className="min-h-screen flex items-center justify-center">Anime not found</div>;
  }

  const relatedAnime = mockAnime
    .filter((a) => a.id !== anime.id && a.genres.some((g) => anime.genres.includes(g)))
    .slice(0, 10);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-16">
        <div className="relative h-[60vh]">
          <img
            src={anime.banner}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl"
              >
                <h1 className="text-5xl font-bold mb-4">{anime.title}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xl font-semibold">{anime.rating}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{anime.year}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-2">
                    <Film className="w-5 h-5" />
                    <span>{anime.totalEpisodes} Episodes</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                    {anime.status}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Link
                    to={`/watch/${anime.id}/1`}
                    className="px-8 py-3 bg-primary hover:bg-primary-dark rounded-full font-semibold flex items-center gap-2 transition-colors"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    Watch Now
                  </Link>
                  <button
                    onClick={toggleSaved}
                    className={`px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition-colors ${
                      isSaved
                        ? 'bg-primary/20 text-primary border-2 border-primary'
                        : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-primary' : ''}`} />
                    {isSaved ? 'In My List' : 'Add to My List'}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4">Synopsis</h2>
              <p className="text-gray-300 leading-relaxed mb-6">{anime.description}</p>
              
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-4 py-2 bg-dark-light border border-dark-lighter rounded-full hover:border-primary transition-colors"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-dark-light border border-dark-lighter rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className="ml-2 font-semibold">{anime.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Episodes:</span>
                    <span className="ml-2 font-semibold">{anime.totalEpisodes}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Year:</span>
                    <span className="ml-2 font-semibold">{anime.year}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Rating:</span>
                    <span className="ml-2 font-semibold">{anime.rating}/10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Episodes</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {anime.episodes.map((episode) => (
                <Link
                  key={episode.id}
                  to={`/watch/${anime.id}/${episode.episodeNumber}`}
                  className="group"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-dark-light mb-2">
                    <img
                      src={episode.thumbnail}
                      alt={episode.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {episode.watched && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xs">✓</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-12 h-12 text-primary" />
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-dark/90 rounded text-xs">
                      {episode.duration}
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                    {episode.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>

          {relatedAnime.length > 0 && (
            <AnimeSlider title="You Might Also Like" anime={relatedAnime} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimeDetail;
