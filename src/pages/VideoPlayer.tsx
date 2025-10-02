import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  List,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
} from 'lucide-react';
import { mockAnime } from '../data/mockData';
import type { Anime, Episode } from '../data/mockData';

const VideoPlayer = () => {
  const { animeId, episodeNumber } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('access_token');
  
  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
  }, [isLoggedIn, navigate]);

  // Core states
  const [anime, setAnime] = useState<Anime | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const [videoError, setVideoError] = useState(false);

  // Video player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);

  // UI states
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [showNextEpisodeCountdown, setShowNextEpisodeCountdown] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Load anime data
  useEffect(() => {
    const foundAnime = mockAnime.find((a) => a.id === Number(animeId));
    if (foundAnime) {
      setAnime(foundAnime);
      const episode = foundAnime.episodes.find(
        (e) => e.episodeNumber === Number(episodeNumber)
      );
      setCurrentEpisode(episode || foundAnime.episodes[0]);
    }
  }, [animeId, episodeNumber]);

  // Helper functions
  const markAsWatched = useCallback(() => {
    if (!anime || !currentEpisode) return;
    const watched = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    const entry = {
      animeId: anime.id,
      episodeId: currentEpisode.id,
      timestamp: Date.now(),
    };
    const filtered = watched.filter(
      (w: any) => !(w.animeId === anime.id && w.episodeId === currentEpisode.id)
    );
    localStorage.setItem('watchHistory', JSON.stringify([entry, ...filtered]));
  }, [anime, currentEpisode]);

  // Load video URL from API
  useEffect(() => {
    const loadVideo = async () => {
      if (!animeId) return;

      setIsLoadingVideo(true);
      setVideoError(false);

      try {
        console.log('Loading video for animeId:', animeId);

        // Test uchun sample video
        setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
      } catch (error) {
        console.error('Error loading video:', error);
        setVideoError(true);
        setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
      } finally {
        setIsLoadingVideo(false);
      }
    };

    loadVideo();
  }, [animeId]);

  // Video player functions
  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;

    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;

    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;

    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);

    // Restore saved position
    const savedPosition = localStorage.getItem(`video-${animeId}-${episodeNumber}`);
    if (savedPosition) {
      videoRef.current.currentTime = Number(savedPosition);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    // Save progress
    if (current > 0 && animeId && episodeNumber) {
      localStorage.setItem(`video-${animeId}-${episodeNumber}`, String(current));
    }

    // Auto-play next episode at 90%
    if (duration > 0 && current / duration > 0.9) {
      markAsWatched();
      if (anime && currentEpisode && !showNextEpisodeCountdown) {
        const nextEp = anime.episodes.find(
          (e) => e.episodeNumber === currentEpisode.episodeNumber + 1
        );
        if (nextEp) {
          setShowNextEpisodeCountdown(true);
          setCountdown(10);
        }
      }
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setIsBuffering(false);
  };
  
  const handlePause = () => setIsPlaying(false);
  const handleError = () => setVideoError(true);
  
  const handleWaiting = () => setIsBuffering(true);
  const handleCanPlay = () => setIsBuffering(false);

  // Hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timer: number;

    const resetTimer = () => {
      setShowControls(true);
      clearTimeout(timer);
      timer = window.setTimeout(() => setShowControls(false), 3000);
    };

    resetTimer();

    return () => clearTimeout(timer);
  }, [currentTime]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Format time helper
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };



  // Countdown timer
  useEffect(() => {
    let timer: number;
    if (showNextEpisodeCountdown && countdown > 0) {
      timer = window.setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (showNextEpisodeCountdown && countdown === 0) {
      nextEpisode();
      setShowNextEpisodeCountdown(false);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [showNextEpisodeCountdown, countdown]);

  const goToEpisode = useCallback((episodeNum: number) => {
    navigate(`/watch/${animeId}/${episodeNum}`);
    setShowEpisodeList(false);
  }, [animeId, navigate]);

  const nextEpisode = useCallback(() => {
    if (!anime || !currentEpisode) return;
    const nextEp = anime.episodes.find(
      (e) => e.episodeNumber === currentEpisode.episodeNumber + 1
    );
    if (nextEp) {
      goToEpisode(nextEp.episodeNumber);
    }
  }, [anime, currentEpisode, goToEpisode]);

  const previousEpisode = useCallback(() => {
    if (!anime || !currentEpisode) return;
    const prevEp = anime.episodes.find(
      (e) => e.episodeNumber === currentEpisode.episodeNumber - 1
    );
    if (prevEp) {
      goToEpisode(prevEp.episodeNumber);
    }
  }, [anime, currentEpisode, goToEpisode]);



  // Loading state
  if (!anime || !currentEpisode || isLoadingVideo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-xl text-white mb-2">
            {isLoadingVideo ? 'Video yuklanmoqda...' : 'Yuklanmoqda...'}
          </div>
          {isLoadingVideo && (
            <div className="text-sm text-gray-400">
              API dan video ma'lumotlari olinmoqda...
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (videoError && !videoUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <div className="text-xl text-white mb-4">Video yuklanmadi</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary rounded-lg hover:bg-primary/80 transition-colors"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 lg:right-80 z-50 bg-gradient-to-b from-black/80 to-transparent p-2 sm:p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/anime/${animeId}`)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>

          <div className="text-center flex-1 mx-2 sm:mx-4">
            <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-white truncate">
              {anime.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 truncate">
              {currentEpisode.title}
            </p>
          </div>

          <button
            onClick={() => setShowEpisodeList(!showEpisodeList)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <List className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Video Player Container */}
      <div className="absolute inset-0 lg:right-80">
        {videoUrl && (
          <div className="relative h-full w-full bg-black">
            <video
              ref={videoRef}
              src={videoUrl}
              poster={currentEpisode?.thumbnail}
              className="h-full w-full object-contain"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPlay={handlePlay}
              onPause={handlePause}
              onError={handleError}
              onWaiting={handleWaiting}
              onCanPlay={handleCanPlay}
              onClick={togglePlay}
            />

            {/* YouTube-style Loading Spinner */}
            {(isLoadingVideo || isBuffering) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gray-600 border-t-primary rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary rounded-full opacity-20"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Video Controls */}
            {showControls && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                {/* Progress Bar */}
                <div className="mb-4">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full slider-progress"
                    style={{
                      background: `linear-gradient(to right, #740775 0%, #740775 ${(currentTime / duration) * 100}%, rgba(75, 85, 99, 0.5) ${(currentTime / duration) * 100}%, rgba(75, 85, 99, 0.5) 100%)`
                    }}
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlay}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white" />
                      )}
                    </button>

                    <div className="flex items-center gap-2 group">
                      <button
                        onClick={toggleMute}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-5 h-5 text-white" />
                        ) : volume < 0.5 ? (
                          <Volume2 className="w-5 h-5 text-white" />
                        ) : (
                          <Volume2 className="w-5 h-5 text-white" />
                        )}
                      </button>
                      
                      <div className="relative w-0 group-hover:w-20 transition-all duration-200 overflow-hidden">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-20 volume-slider"
                          style={{
                            background: `linear-gradient(to right, #740775 0%, #740775 ${(isMuted ? 0 : volume) * 100}%, rgba(75, 85, 99, 0.5) ${(isMuted ? 0 : volume) * 100}%, rgba(75, 85, 99, 0.5) 100%)`
                          }}
                        />
                      </div>
                    </div>

                    <div className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>

                  <button
                    onClick={toggleFullscreen}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Maximize className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Episode Navigation Arrows - Hidden on mobile for better UX */}
      <div className="hidden sm:block absolute top-1/2 left-4 z-40 -translate-y-1/2">
        <button
          onClick={previousEpisode}
          disabled={!anime.episodes.find(e => e.episodeNumber === currentEpisode.episodeNumber - 1)}
          className="p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="hidden sm:block absolute top-1/2 right-4 z-40 -translate-y-1/2 lg:right-[340px]">
        <button
          onClick={nextEpisode}
          disabled={!anime.episodes.find(e => e.episodeNumber === currentEpisode.episodeNumber + 1)}
          className="p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Next Episode Countdown */}
      {showNextEpisodeCountdown && (
        <div className="absolute bottom-4 sm:bottom-20 right-4 lg:right-[340px] bg-black/90 backdrop-blur-md rounded-lg p-3 sm:p-4 border border-gray-700 z-50 max-w-xs">
          <div className="text-xs sm:text-sm mb-2 text-white">Keyingi epizod:</div>
          <div className="text-xs text-gray-400 mb-3">
            Epizod {currentEpisode.episodeNumber + 1}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-xl sm:text-2xl font-bold text-primary">{countdown}</div>
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => {
                  nextEpisode();
                  setShowNextEpisodeCountdown(false);
                }}
                className="px-2 py-1 sm:px-3 bg-primary rounded text-xs sm:text-sm hover:bg-primary/80 transition-colors text-white"
              >
                Hozir
              </button>
              <button
                onClick={() => setShowNextEpisodeCountdown(false)}
                className="px-2 py-1 sm:px-3 bg-gray-600 rounded text-xs sm:text-sm hover:bg-gray-700 transition-colors text-white"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Episode List */}
      <AnimatePresence>
        {showEpisodeList && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="lg:hidden absolute top-0 right-0 bottom-0 w-full sm:w-80 bg-black/95 backdrop-blur-md border-l border-gray-700 overflow-y-auto z-40"
          >
            <div className="p-3 sm:p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm sm:text-base">Epizodlar</h3>
              <button
                onClick={() => setShowEpisodeList(false)}
                className="p-2 hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-2">
              {anime.episodes.map((episode) => (
                <button
                  key={episode.id}
                  onClick={() => goToEpisode(episode.episodeNumber)}
                  className={`w-full p-2 sm:p-3 rounded-lg text-left hover:bg-gray-800 transition-colors ${episode.episodeNumber === currentEpisode.episodeNumber
                    ? 'bg-primary/20 border border-primary/30'
                    : ''
                    }`}
                >
                  <div className="flex gap-2 sm:gap-3">
                    <img
                      src={episode.thumbnail}
                      alt={episode.title}
                      className="w-14 h-8 sm:w-20 sm:h-12 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-medium truncate text-white">
                        {episode.title}
                      </div>
                      <div className="text-xs text-gray-400">{episode.duration}</div>
                      {episode.watched && (
                        <div className="text-xs text-primary mt-1">Ko'rilgan</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Episode List */}
      <div className="hidden lg:block absolute top-0 right-0 bottom-0 w-80 bg-black/80 backdrop-blur-md border-l border-gray-700 overflow-y-auto">
        <div className="p-4 border-b border-gray-700">
          <h3 className="font-semibold text-white">Epizodlar</h3>
        </div>
        <div className="p-2">
          {anime.episodes.map((episode) => (
            <button
              key={episode.id}
              onClick={() => goToEpisode(episode.episodeNumber)}
              className={`w-full p-3 rounded-lg text-left hover:bg-gray-800/50 transition-colors ${episode.episodeNumber === currentEpisode.episodeNumber
                ? 'bg-primary/20 border border-primary/30'
                : ''
                }`}
            >
              <div className="flex gap-3">
                <img
                  src={episode.thumbnail}
                  alt={episode.title}
                  className="w-20 h-12 object-cover rounded flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate text-white">
                    {episode.title}
                  </div>
                  <div className="text-xs text-gray-400">{episode.duration}</div>
                  {episode.watched && (
                    <div className="text-xs text-primary mt-1">Ko'rilgan</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;