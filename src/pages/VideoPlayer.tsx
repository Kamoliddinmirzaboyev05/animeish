import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  List,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { fetchAnimeById } from '../services/api';

const VideoPlayer = () => {
  const { animeId, episodeNumber } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if user is logged in
  const isLoggedIn = sessionStorage.getItem('access_token');
  
  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
  }, [isLoggedIn, navigate]);

  // Core states
  const [anime, setAnime] = useState<any | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<any | null>(null);
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
    const loadAnimeData = async () => {
      try {
        const foundAnime = await fetchAnimeById(Number(animeId));
        if (foundAnime) {
          setAnime(foundAnime);
          const episode = foundAnime.episodes?.find(
            (e: any) => e.episodeNumber === Number(episodeNumber)
          );
          setCurrentEpisode(episode || foundAnime.episodes?.[0]);
        }
      } catch (error) {
        console.error('Error loading anime data:', error);
      }
    };

    if (animeId) {
      loadAnimeData();
    }
  }, [animeId, episodeNumber]);

  // Helper functions
  const markAsWatched = useCallback(() => {
    if (!anime || !currentEpisode) return;
    const watched = JSON.parse(sessionStorage.getItem('watchHistory') || '[]');
    const entry = {
      animeId: anime.id,
      episodeId: currentEpisode.id,
      timestamp: Date.now(),
    };
    const filtered = watched.filter(
      (w: any) => !(w.animeId === anime.id && w.episodeId === currentEpisode.id)
    );
    sessionStorage.setItem('watchHistory', JSON.stringify([entry, ...filtered]));
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

  const skipForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
  };

  const skipBackward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
  };

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);

    // Restore saved position
    const savedPosition = sessionStorage.getItem(`video-${animeId}-${episodeNumber}`);
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
      sessionStorage.setItem(`video-${animeId}-${episodeNumber}`, String(current));
    }

    // Auto-play next episode at 90%
    if (duration > 0 && current / duration > 0.9) {
      markAsWatched();
      if (anime && currentEpisode && !showNextEpisodeCountdown) {
        const nextEp = anime.episodes.find(
          (e: any) => e.episodeNumber === currentEpisode.episodeNumber + 1
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

    const handleMouseMove = () => resetTimer();
    const handleMouseLeave = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => setShowControls(false), 1000);
    };

    const videoContainer = document.getElementById('video-container');
    if (videoContainer) {
      videoContainer.addEventListener('mousemove', handleMouseMove);
      videoContainer.addEventListener('mouseleave', handleMouseLeave);
    }

    resetTimer();

    return () => {
      clearTimeout(timer);
      if (videoContainer) {
        videoContainer.removeEventListener('mousemove', handleMouseMove);
        videoContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent default behavior when video player is focused
      if (e.target === videoRef.current || (e.target as Element)?.closest('#video-container')) {
        switch (e.code) {
          case 'Space':
            e.preventDefault();
            togglePlay();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            skipBackward();
            break;
          case 'ArrowRight':
            e.preventDefault();
            skipForward();
            break;
          case 'ArrowUp':
            e.preventDefault();
            if (videoRef.current) {
              const newVolume = Math.min(volume + 0.1, 1);
              videoRef.current.volume = newVolume;
              setVolume(newVolume);
              setIsMuted(false);
            }
            break;
          case 'ArrowDown':
            e.preventDefault();
            if (videoRef.current) {
              const newVolume = Math.max(volume - 0.1, 0);
              videoRef.current.volume = newVolume;
              setVolume(newVolume);
              setIsMuted(newVolume === 0);
            }
            break;
          case 'KeyF':
            e.preventDefault();
            toggleFullscreen();
            break;
          case 'KeyM':
            e.preventDefault();
            toggleMute();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [volume]);

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
      (e: any) => e.episodeNumber === currentEpisode.episodeNumber + 1
    );
    if (nextEp) {
      goToEpisode(nextEp.episodeNumber);
    }
  }, [anime, currentEpisode, goToEpisode]);

  const previousEpisode = useCallback(() => {
    if (!anime || !currentEpisode) return;
    const prevEp = anime.episodes.find(
      (e: any) => e.episodeNumber === currentEpisode.episodeNumber - 1
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
      {/* Custom Styles for Video Player */}
      <style>{`
        .video-progress-bar {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }
        
        .video-progress-bar::-webkit-slider-track {
          background: rgba(255, 255, 255, 0.2);
          height: 4px;
          border-radius: 2px;
        }
        
        .video-progress-bar::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #740775;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .video-progress-bar:hover::-webkit-slider-thumb {
          opacity: 1;
        }
        
        .video-progress-bar::-moz-range-track {
          background: rgba(255, 255, 255, 0.2);
          height: 4px;
          border-radius: 2px;
          border: none;
        }
        
        .video-progress-bar::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #740775;
          cursor: pointer;
          border: none;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .video-progress-bar:hover::-moz-range-thumb {
          opacity: 1;
        }
        
        .volume-slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }
        
        .volume-slider::-webkit-slider-track {
          background: rgba(255, 255, 255, 0.2);
          height: 3px;
          border-radius: 1.5px;
        }
        
        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #740775;
          cursor: pointer;
        }
        
        .volume-slider::-moz-range-track {
          background: rgba(255, 255, 255, 0.2);
          height: 3px;
          border-radius: 1.5px;
          border: none;
        }
        
        .volume-slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #740775;
          cursor: pointer;
          border: none;
        }
      `}</style>
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
      <div className="absolute inset-0 lg:right-80" id="video-container">
        {videoUrl && (
          <div className="relative h-full w-full bg-black">
            <video
              ref={videoRef}
              src={videoUrl}
              poster={currentEpisode?.thumbnail}
              className="h-full w-full object-contain cursor-pointer"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPlay={handlePlay}
              onPause={handlePause}
              onError={handleError}
              onWaiting={handleWaiting}
              onCanPlay={handleCanPlay}
              onClick={togglePlay}
            />

            {/* Loading Spinner */}
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

            {/* Professional Video Controls */}
            <div className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
              {/* Progress Bar */}
              <div className="px-4 pb-2">
                <div className="relative group">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full video-progress-bar"
                    style={{
                      background: `linear-gradient(to right, #740775 0%, #740775 ${(currentTime / duration) * 100}%, rgba(255, 255, 255, 0.2) ${(currentTime / duration) * 100}%, rgba(255, 255, 255, 0.2) 100%)`
                    }}
                  />

                </div>
              </div>

              {/* Control Bar */}
              <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent px-4 pb-4 pt-2">
                <div className="flex items-center justify-between">
                  {/* Left Controls */}
                  <div className="flex items-center gap-2">
                    {/* Previous Episode */}
                    <button
                      onClick={previousEpisode}
                      disabled={!anime?.episodes?.find((e: any) => e.episodeNumber === currentEpisode.episodeNumber - 1)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Oldingi epizod"
                    >
                      <SkipBack className="w-5 h-5 text-white" />
                    </button>

                    {/* Play/Pause */}
                    <button
                      onClick={togglePlay}
                      className="p-3 hover:bg-white/10 rounded-full transition-colors"
                      title={isPlaying ? 'Pauza' : 'Ijro'}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white ml-1" />
                      )}
                    </button>

                    {/* Next Episode */}
                    <button
                      onClick={nextEpisode}
                      disabled={!anime?.episodes?.find((e: any) => e.episodeNumber === currentEpisode.episodeNumber + 1)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Keyingi epizod"
                    >
                      <SkipForward className="w-5 h-5 text-white" />
                    </button>

                    {/* Time Display */}
                    <div className="text-white text-sm font-medium ml-2">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>

                  {/* Right Controls */}
                  <div className="flex items-center gap-2">
                    {/* Volume Control */}
                    <div className="flex items-center gap-2 group">
                      <button
                        onClick={toggleMute}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        title={isMuted ? 'Ovozni yoqish' : 'Ovozni o\'chirish'}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-5 h-5 text-white" />
                        ) : (
                          <Volume2 className="w-5 h-5 text-white" />
                        )}
                      </button>
                      
                      {/* Volume Slider */}
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
                            background: `linear-gradient(to right, #740775 0%, #740775 ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.2) 100%)`
                          }}
                        />
                      </div>
                    </div>

                    {/* Fullscreen */}
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      title="To'liq ekran"
                    >
                      <Maximize className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
              {anime.episodes.map((episode: any) => (
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
          {anime.episodes.map((episode: any) => (
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