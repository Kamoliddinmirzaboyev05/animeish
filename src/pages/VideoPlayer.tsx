import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import {
  List,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  Settings,
  Minimize,
  ChevronLeft,
  RotateCcw,
  RotateCw,
  X,
} from 'lucide-react';
import { fetchAnimeById } from '../services/api';

const VideoPlayer = () => {
  const { animeId, episodeNumber } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hideControlsTimerRef = useRef<number | undefined>(undefined);

  const isLoggedIn = localStorage.getItem('access_token');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // States
  const [anime, setAnime] = useState<any>(null);
  const [currentEpisode, setCurrentEpisode] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isVimeoVideo, setIsVimeoVideo] = useState(false);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSkipIndicator, setShowSkipIndicator] = useState<'forward' | 'backward' | null>(null);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Load anime data
  useEffect(() => {
    const loadAnimeData = async () => {
      try {
        const data = await fetchAnimeById(Number(animeId));
        if (data) {
          setAnime(data);
          if (data.type === 'movie') {
            setCurrentEpisode(data.episodes?.[0]);
          } else {
            const episode = data.episodes?.find(
              (e: any) => e.episode_number === Number(episodeNumber)
            );
            setCurrentEpisode(episode || data.episodes?.[0]);
          }
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading anime:', error);
        navigate('/');
      }
    };

    if (animeId) {
      loadAnimeData();
    }
  }, [animeId, episodeNumber, navigate]);

  // Load video URL
  useEffect(() => {
    if (!anime) return;

    let url = '';

    if (anime.type === 'movie') {
      url = anime.episodes?.[0]?.video_url || '';
    } else {
      const episode = anime.episodes?.find((ep: any) => ep.episode_number === Number(episodeNumber));
      url = episode?.video_url || '';
    }

    if (!url) {
      navigate('/');
      return;
    }

    // Handle Vimeo URLs
    if (url.includes('vimeo.com') && !url.includes('player.vimeo.com')) {
      const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      if (vimeoId) {
        url = `https://player.vimeo.com/video/${vimeoId}`;
      }
    }

    // Decode CDN URLs
    if (url.includes('b-cdn.net') || url.includes('cdn.')) {
      try {
        url = decodeURIComponent(url);
      } catch (e) {
        console.log('URL decode failed');
      }
    }

    const isIframe = url.includes('player.vimeo.com') ||
      url.includes('iframe.mediadelivery.net') ||
      url.includes('youtube.com/embed');

    setVideoUrl(url);
    setIsVimeoVideo(isIframe);
    setIsLoading(false);
  }, [anime, episodeNumber, navigate]);

  // Video controls
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error('Play failed:', err);
          setIsBuffering(true);
        });
      }
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  }, [isMuted]);

  const handleSeek = useCallback((time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  const skipTime = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
    videoRef.current.currentTime = newTime;
    setShowSkipIndicator(seconds > 0 ? 'forward' : 'backward');
    setTimeout(() => setShowSkipIndicator(null), 800);
  }, [duration]);

  const changeSpeed = useCallback((speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSettings(false);
  }, []);

  // Video event handlers
  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setIsLoading(false);

    const savedTime = localStorage.getItem(`video-${animeId}-${episodeNumber}`);
    if (savedTime) {
      videoRef.current.currentTime = Number(savedTime);
    }
  }, [animeId, episodeNumber]);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered(bufferedEnd);
    }

    localStorage.setItem(`video-${animeId}-${episodeNumber}`, String(current));

    // Show next episode at 90%
    if (duration > 0 && current / duration > 0.9 && !showNextEpisode && anime?.type === 'series') {
      const nextEp = anime.episodes?.find(
        (e: any) => e.episode_number === (currentEpisode?.episode_number || 0) + 1
      );
      if (nextEp) {
        setShowNextEpisode(true);
      }
    }
  }, [animeId, episodeNumber, duration, showNextEpisode, anime, currentEpisode]);

  const handleProgress = useCallback(() => {
    if (!videoRef.current || !videoRef.current.buffered.length) return;
    const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
    setBuffered(bufferedEnd);
  }, []);

  // Progress bar click
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    handleSeek(pos * duration);
  }, [duration, handleSeek]);

  // Controls visibility
  const showControlsTemp = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (isPlaying) {
      hideControlsTimerRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Episode navigation
  const goToEpisode = useCallback((epNum: number) => {
    navigate(`/watch/${animeId}/${epNum}`);
    setShowEpisodeList(false);
    setCurrentTime(0);
    setIsPlaying(false);
  }, [animeId, navigate]);

  const nextEpisode = useCallback(() => {
    if (!anime || !currentEpisode || anime.type === 'movie') return;
    const nextEp = anime.episodes?.find(
      (e: any) => e.episode_number === (currentEpisode.episode_number || 0) + 1
    );
    if (nextEp) {
      goToEpisode(nextEp.episode_number);
    }
  }, [anime, currentEpisode, goToEpisode]);

  const prevEpisode = useCallback(() => {
    if (!anime || !currentEpisode || anime.type === 'movie') return;
    const prevEp = anime.episodes?.find(
      (e: any) => e.episode_number === (currentEpisode.episode_number || 0) - 1
    );
    if (prevEp) {
      goToEpisode(prevEp.episode_number);
    }
  }, [anime, currentEpisode, goToEpisode]);

  // Countdown timer
  useEffect(() => {
    if (showNextEpisode && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showNextEpisode && countdown === 0) {
      nextEpisode();
      setShowNextEpisode(false);
      setCountdown(10);
    }
  }, [showNextEpisode, countdown, nextEpisode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target !== document.body) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipTime(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipTime(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.min(volume + 0.1, 1);
            videoRef.current.volume = newVol;
            setVolume(newVol);
            setIsMuted(false);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.max(volume - 0.1, 0);
            videoRef.current.volume = newVol;
            setVolume(newVol);
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
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [volume, togglePlay, toggleMute, toggleFullscreen, skipTime]);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={anime?.type === 'movie'
          ? `${anime?.title} - Film | Aniki`
          : `${anime?.title} - Episode ${currentEpisode?.episode_number} | Aniki`
        }
        description={anime?.type === 'movie'
          ? `${anime?.title} filmini tomosha qiling.`
          : `${anime?.title} anime serialining ${currentEpisode?.episode_number}-qismini tomosha qiling.`
        }
        noIndex={true}
      />

      <div
        ref={containerRef}
        className="relative h-screen bg-black overflow-hidden"
        onMouseMove={showControlsTemp}
        onTouchStart={showControlsTemp}
      >
        {/* Video Container */}
        <div className={`absolute inset-0 ${!isFullscreen && anime?.type === 'series' ? 'lg:right-80' : ''}`}>
          {videoUrl && (
            <div
              className="relative h-full w-full"
              onClick={togglePlay}
            >
              {isVimeoVideo ? (
                <iframe
                  src={`${videoUrl}?autoplay=1&title=0&byline=0&portrait=0`}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="Video Player"
                />
              ) : (
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  poster={currentEpisode?.thumbnail}
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => { setIsPlaying(true); setIsBuffering(false); }}
                  onPause={() => setIsPlaying(false)}
                  onWaiting={() => setIsBuffering(true)}
                  onCanPlay={() => setIsBuffering(false)}
                  onProgress={handleProgress}
                  playsInline
                  preload="auto"
                >
                  <source src={videoUrl} type="video/mp4" />
                </video>
              )}

              {/* Buffering Indicator */}
              {isBuffering && !isVimeoVideo && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
                </div>
              )}

              {/* Skip Indicator */}
              <AnimatePresence>
                {showSkipIndicator && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute top-1/2 -translate-y-1/2 ${showSkipIndicator === 'backward' ? 'left-8' : 'right-8'} bg-black/80 rounded-full p-4 pointer-events-none`}
                  >
                    {showSkipIndicator === 'backward' ? (
                      <RotateCcw className="w-8 h-8 text-white" />
                    ) : (
                      <RotateCw className="w-8 h-8 text-white" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Center Play Button */}
              <AnimatePresence>
                {!isVimeoVideo && showControls && !isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="bg-primary/90 rounded-full p-6">
                      <Play className="w-16 h-16 text-white ml-1" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Top Bar */}
              <AnimatePresence>
                {!isVimeoVideo && showControls && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent p-4"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          isFullscreen ? toggleFullscreen() : navigate(`/anime/${animeId}`);
                        }}
                        className="p-2 hover:bg-white/10 rounded-full"
                      >
                        <ChevronLeft className="w-6 h-6 text-white" />
                      </button>

                      <div className="flex-1 text-white">
                        <h1 className="font-semibold truncate">{anime?.title}</h1>
                        <p className="text-sm text-gray-300 truncate">
                          {anime?.type === 'movie' ? 'Film' : `Episode ${currentEpisode?.episode_number}`}
                        </p>
                      </div>

                      {anime?.type === 'series' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowEpisodeList(!showEpisodeList);
                          }}
                          className="p-2 hover:bg-white/10 rounded-full lg:hidden"
                        >
                          <List className="w-6 h-6 text-white" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Controls */}
              {!isVimeoVideo && (
                <AnimatePresence>
                  {showControls && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4"
                    >
                      {/* Progress Bar */}
                      <div
                        ref={progressBarRef}
                        className="w-full h-1 bg-white/30 rounded-full mb-4 cursor-pointer hover:h-2 transition-all"
                        onClick={handleProgressClick}
                      >
                        <div className="relative h-full">
                          <div
                            className="absolute h-full bg-white/50 rounded-full"
                            style={{ width: `${(buffered / duration) * 100}%` }}
                          />
                          <div
                            className="absolute h-full bg-primary rounded-full"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                          {anime?.type === 'series' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); prevEpisode(); }}
                              className="p-2 hover:bg-white/10 rounded-full"
                            >
                              <SkipBack className="w-5 h-5" />
                            </button>
                          )}

                          <button
                            onClick={(e) => { e.stopPropagation(); skipTime(-10); }}
                            className="p-2 hover:bg-white/10 rounded-full hidden sm:block"
                          >
                            <RotateCcw className="w-5 h-5" />
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                            className="p-3 bg-primary hover:bg-primary-dark rounded-full"
                          >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); skipTime(10); }}
                            className="p-2 hover:bg-white/10 rounded-full hidden sm:block"
                          >
                            <RotateCw className="w-5 h-5" />
                          </button>

                          {anime?.type === 'series' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); nextEpisode(); }}
                              className="p-2 hover:bg-white/10 rounded-full"
                            >
                              <SkipForward className="w-5 h-5" />
                            </button>
                          )}

                          <span className="text-sm ml-2 hidden sm:block">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="hidden sm:flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                              className="p-2 hover:bg-white/10 rounded-full"
                            >
                              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={isMuted ? 0 : volume}
                              onChange={(e) => {
                                e.stopPropagation();
                                const v = parseFloat(e.target.value);
                                if (videoRef.current) {
                                  videoRef.current.volume = v;
                                  setVolume(v);
                                  setIsMuted(v === 0);
                                }
                              }}
                              className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                            />
                          </div>

                          <div className="relative">
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                              className="p-2 hover:bg-white/10 rounded-full"
                            >
                              <Settings className="w-5 h-5" />
                            </button>

                            <AnimatePresence>
                              {showSettings && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg p-2 min-w-[140px]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="text-xs text-gray-400 px-2 py-1">Speed</div>
                                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                    <button
                                      key={speed}
                                      onClick={() => changeSpeed(speed)}
                                      className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 rounded ${playbackSpeed === speed ? 'text-primary' : ''}`}
                                    >
                                      {speed}x {speed === 1 ? '(Normal)' : ''}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                            className="p-2 hover:bg-white/10 rounded-full"
                          >
                            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          )}
        </div>

        {/* Episode List Sidebar */}
        <AnimatePresence>
          {showEpisodeList && anime?.type === 'series' && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute top-0 right-0 w-80 h-full bg-gray-900 z-50 lg:hidden"
            >
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-white font-semibold">Episodes</h3>
                <button
                  onClick={() => setShowEpisodeList(false)}
                  className="p-2 hover:bg-white/10 rounded-full"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="overflow-y-auto h-full pb-20">
                {anime.episodes?.map((ep: any) => (
                  <button
                    key={ep.id}
                    onClick={() => goToEpisode(ep.episode_number)}
                    className={`w-full p-4 text-left hover:bg-white/5 border-b border-gray-800 ${ep.episode_number === currentEpisode?.episode_number ? 'bg-primary/20' : ''}`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={ep.thumbnail || anime.thumbnail}
                        alt={ep.title}
                        className="w-20 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm">Episode {ep.episode_number}</p>
                        <p className="text-gray-400 text-xs truncate">{ep.title}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Episode List */}
        {!isFullscreen && anime?.type === 'series' && (
          <div className="hidden lg:block absolute top-0 right-0 w-80 h-full bg-gray-900 border-l border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-white font-semibold">Episodes</h3>
            </div>
            <div className="overflow-y-auto h-full pb-4">
              {anime.episodes?.map((ep: any) => (
                <button
                  key={ep.id}
                  onClick={() => goToEpisode(ep.episode_number)}
                  className={`w-full p-4 text-left hover:bg-white/5 border-b border-gray-800 ${ep.episode_number === currentEpisode?.episode_number ? 'bg-primary/20' : ''}`}
                >
                  <div className="flex gap-3">
                    <img
                      src={ep.thumbnail || anime.thumbnail}
                      alt={ep.title}
                      className="w-20 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">Episode {ep.episode_number}</p>
                      <p className="text-gray-400 text-xs truncate">{ep.title}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Next Episode Countdown */}
        <AnimatePresence>
          {showNextEpisode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/90 rounded-lg p-6 text-center z-50"
            >
              <h3 className="text-white text-lg font-semibold mb-2">Keyingi epizod</h3>
              <div className="text-primary text-4xl font-bold mb-4">{countdown}</div>
              <button
                onClick={() => { setShowNextEpisode(false); setCountdown(10); }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm"
              >
                Bekor qilish
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default VideoPlayer;