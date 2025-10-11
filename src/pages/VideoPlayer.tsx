import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const VideoPlayer = () => {
  const { animeId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to AnimeDetail page which now handles video playing
    navigate(`/anime/${animeId}`, { replace: true });
  }, [animeId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-600 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-white text-lg">Yo'naltirilmoqda...</div>
      </div>
    </div>
  );
};

export default VideoPlayer;