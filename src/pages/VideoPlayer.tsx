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
  ChevronRight,
  RotateCcw,
  RotateCw,
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
      return;
    }
  }, [isLoggedIn, navigate]);

  // States
  const [anime, setAnime] = useState<any | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<any | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isVimeoVideo, setIsVimeoVideo] = useState(false);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [showNextEpisodeCountdown, setShowNextEpisodeCountdown] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSkipLabel, setShowSkipLabel] = useState<'forward' | 'backward' | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load anime data
  useEffect(() => {
    const loadAnimeData = async () => {
      try {
        const foundAnime = await fetchAnimeById(Number(animeId));
        if (foundAnime) {
          setAnime(foundAnime);
          // For movies, use the first episode (movies have episodes with video_url)
          if (foundAnime.type === 'movie') {
            setCurrentEpisode(foundAnime.episodes?.[0]);
          } else {
            // For series, find the specific episode
            const episode = foundAnime.episodes?.find(
              (e: any) => e.episode_number === Number(episodeNumber)
            );
            setCurrentEpisode(episode || foundAnime.episodes?.[0]);
          }
        } else {
          // No fallback data - redirect to home if anime not found
          console.error('Anime not found:', animeId);
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Error loading anime data:', error);
      }
    };

    if (animeId) {
      loadAnimeData();
    }
  }, [animeId, episodeNumber]);

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

  // Load video URL - optimized for speed
  useEffect(() => {
    const loadVideo = () => {
      if (!anime) return;

      setIsLoadingVideo(true);
      let videoUrl = '';

      try {
        // Movie: single video from episodes array (movies have episodes with video_url)
        if (anime.type === 'movie') {
          videoUrl = anime.episodes?.[0]?.video_url || anime.videos?.[0]?.url || anime.videoUrl || '';
        }
        // Series: specific episode from episodes array
        else if (anime.type === 'series') {
          const episode = anime.episodes?.find((ep: any) => ep.episode_number === Number(episodeNumber)) || anime.episodes?.[0];
          videoUrl = episode?.video_url || episode?.videoUrl || '';
        }
        // Fallback
        else {
          videoUrl = anime.episodes?.[0]?.video_url || anime.videoUrl || '';
        }

        // Handle Vimeo URLs quickly
        if (videoUrl && videoUrl.includes('vimeo.com') && !videoUrl.includes('player.vimeo.com')) {
          const vimeoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
          if (vimeoId) {
            videoUrl = `https://player.vimeo.com/video/${vimeoId}`;
          }
        }

        // Set video URL immediately - no fallback demo videos
        if (!videoUrl) {
          console.error('No video URL found for:', anime.title);
          navigate('/');
          return;
        }
        
        setVideoUrl(videoUrl);
        setIsVimeoVideo(videoUrl.includes('player.vimeo.com') || videoUrl.includes('iframe.mediadelivery.net') || videoUrl.includes('b-cdn.net'));
        setIsLoadingVideo(false);

      } catch (error) {
        console.error('Error loading video:', error);
        navigate('/');
        return;
      }
    };

    if (anime) {
      loadVideo();
    }
  }, [anime, currentEpisode]);

  // Video controls
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

  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        if (isMobile) {
          // Mobile fullscreen with landscape orientation
          await containerRef.current.requestFullscreen();
          if (screen.orientation && 'lock' in screen.orientation) {
            try {
              await (screen.orientation as any).lock('landscape');
            } catch (err) {
              console.log('Orientation lock not supported');
            }
          }
        } else {
          await containerRef.current.requestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        if (isMobile && screen.orientation && 'unlock' in screen.orientation) {
          try {
            (screen.orientation as any).unlock();
          } catch (err) {
            console.log('Orientation unlock not supported');
          }
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const skipForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
    setShowSkipLabel('forward');
    setTimeout(() => setShowSkipLabel(null), 1000);
  };

  const skipBackward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    setShowSkipLabel('backward');
    setTimeout(() => setShowSkipLabel(null), 1000);
  };

  const changePlaybackSpeed = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  // Video events
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setIsLoadingVideo(false);
    setIsBuffering(false);

    const savedPosition = localStorage.getItem(`video-${animeId}-${episodeNumber}`);
    if (savedPosition) {
      videoRef.current.currentTime = Number(savedPosition);
    }

    // Auto-play new episode
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(console.error);
      }
    }, 500);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || isSeeking) return;

    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    // Update buffered time
    if (videoRef.current.buffered.length > 0) {
      const buffered = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBufferedTime(buffered);
    }

    if (current > 0 && animeId && episodeNumber) {
      localStorage.setItem(`video-${animeId}-${episodeNumber}`, String(current));
    }

    if (duration > 0 && current / duration > 0.9) {
      markAsWatched();
      if (anime && currentEpisode && !showNextEpisodeCountdown && anime.type === 'series') {
        const nextEp = anime.episodes.find(
          (e: any) => e.episode_number === currentEpisode.episode_number + 1
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
    setIsLoadingVideo(false);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleWaiting = () => {
    if (videoRef.current && videoRef.current.readyState < 3) {
      setIsBuffering(true);
    }
  };

  const handleCanPlay = () => {
    setIsBuffering(false);
    setIsLoadingVideo(false);
  };

  const handleCanPlayThrough = () => {
    setIsBuffering(false);
    setIsLoadingVideo(false);
  };

  const handleLoadStart = () => {
    setIsLoadingVideo(true);
    setIsBuffering(true);
  };

  const handleLoadedData = () => {
    setIsLoadingVideo(false);
  };

  // Progress bar interaction
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = pos * duration;
    handleSeek(time);
  };

  const handleProgressBarTouchStart = () => {
    setIsSeeking(true);
  };

  const handleProgressBarTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !isSeeking) return;

    const touch = e.touches[0];
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
    const time = pos * duration;
    setCurrentTime(time);
  };

  const handleProgressBarTouchEnd = () => {
    if (!videoRef.current || !isSeeking) return;

    videoRef.current.currentTime = currentTime;
    setIsSeeking(false);
  };

  // Single click to toggle play/pause
  const handleVideoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    togglePlay();
    setShowControls(true);
  };

  // Double tap for mobile skip
  const handleVideoDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMobile) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width / 2) {
      skipBackward();
    } else {
      skipForward();
    }
  };

  // Control visibility
  useEffect(() => {
    if (showControls && isPlaying) {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
      hideControlsTimerRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, [showControls, isPlaying]);

  // Mouse move handler for showing controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (isPlaying) {
      hideControlsTimerRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Keyboard controls
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
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [volume, isPlaying]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Click outside to close speed menu
  useEffect(() => {
    const handleClickOutside = () => {
      if (showSpeedMenu) {
        setShowSpeedMenu(false);
      }
    };

    if (showSpeedMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showSpeedMenu]);

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
    // Reset video state for new episode
    setCurrentTime(0);
    setIsPlaying(false);
    setIsLoadingVideo(true);
  }, [animeId, navigate]);

  const nextEpisode = useCallback(() => {
    if (!anime || !currentEpisode || anime.type === 'movie') return;
    const nextEp = anime.episodes.find(
      (e: any) => e.episode_number === currentEpisode.episode_number + 1
    );
    if (nextEp) {
      goToEpisode(nextEp.episode_number);
    }
  }, [anime, currentEpisode, goToEpisode]);

  const previousEpisode = useCallback(() => {
    if (!anime || !currentEpisode || anime.type === 'movie') return;
    const prevEp = anime.episodes.find(
      (e: any) => e.episode_number === currentEpisode.episode_number - 1
    );
    if (prevEp) {
      goToEpisode(prevEp.episode_number);
    }
  }, [anime, currentEpisode, goToEpisode]);

  // Loading state
  if ((!anime || !currentEpisode) && isLoadingVideo && !isVimeoVideo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-xl text-white mb-2">Yuklanmoqda...</div>
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
          ? `${anime?.title} filmini tomosha qiling. ${anime?.description || 'Eng yaxshi film streaming platformasi Aniki da.'}`
          : `${anime?.title} anime serialining ${currentEpisode?.episode_number}-qismini tomosha qiling. ${currentEpisode?.title || 'Eng yaxshi anime streaming platformasi Aniki da.'}`
        }
        keywords={anime?.type === 'movie'
          ? `${anime?.title}, film, kino, uzbek tilida, aniki, ${anime?.genres?.join(', ') || 'film'}`
          : `${anime?.title}, episode ${currentEpisode?.episode_number}, anime, anime uzbek, anime tomosha, aniki, ${anime?.genres?.join(', ') || 'anime serial'}`
        }
        image={currentEpisode?.thumbnail || anime?.banner}
        url={`https://aniki.uz/watch/${animeId}/${episodeNumber}`}
        type={anime?.type === 'movie' ? 'video.movie' : 'video.episode'}
        noIndex={true}
      />
      <div
        ref={containerRef}
        className={`relative h-screen bg-black overflow-hidden ${isFullscreen && isMobile ? 'landscape-fullscreen' : ''}`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <style>{`
        * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          user-select: none;
        }

        .progress-bar {
          height: 3px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
          position: relative;
          cursor: pointer;
          transition: height 0.2s ease;
        }

        .progress-bar:hover,
        .progress-bar:active {
          height: 5px;
        }

        .progress-bar-fill {
          height: 100%;
          background: #740775;
          border-radius: 3px;
          position: relative;
        }

        .progress-bar-buffered {
          position: absolute;
          height: 100%;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 3px;
          top: 0;
          left: 0;
        }

        .control-btn {
          transition: transform 0.1s ease, opacity 0.2s ease;
        }

        .control-btn:active {
          transform: scale(0.95);
        }

        .landscape-fullscreen {
          transform: rotate(90deg);
          transform-origin: center;
          width: 100vh;
          height: 100vw;
          position: fixed;
          top: 50%;
          left: 50%;
          margin-left: -50vh;
          margin-top: -50vw;
        }

        @media (max-width: 768px) {
          .progress-bar {
            height: 4px;
          }
          
          .control-btn {
            padding: 0.75rem;
          }
        }

        @media screen and (orientation: landscape) and (max-width: 768px) {
          .landscape-fullscreen {
            transform: none;
            width: 100vw;
            height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
            margin: 0;
          }
        }
      `}</style>

        {/* Video Container - Full width for movies, with sidebar for series */}
        <div className={`absolute inset-0 ${!isFullscreen && anime?.type === 'series' ? 'lg:right-80' : ''}`}>
          {videoUrl && (
            <div
              className="relative h-full w-full bg-black"
              onClick={handleVideoClick}
              onDoubleClick={handleVideoDoubleClick}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setShowControls(true)}
            >
              {isVimeoVideo ? (
                <iframe
                  src={`${videoUrl}?autoplay=1&title=0&byline=0&portrait=0&controls=1`}
                  className="h-full w-full"
                  style={{ border: 'none' }}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="Video Player"
                  onLoad={() => {
                    setIsLoadingVideo(false);
                    setIsBuffering(false);
                  }}
                />
              ) : (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  poster={currentEpisode?.thumbnail}
                  className="h-full w-full object-contain"
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onWaiting={handleWaiting}
                  onCanPlay={handleCanPlay}
                  onCanPlayThrough={handleCanPlayThrough}
                  onLoadStart={handleLoadStart}
                  onLoadedData={handleLoadedData}
                  playsInline
                  preload="metadata"
                />
              )}

              {/* Loading/Buffering */}
              {((isLoadingVideo || isBuffering) && !isPlaying) && !isVimeoVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
                  <div className="w-16 h-16 border-4 border-gray-600 border-t-primary rounded-full animate-spin"></div>
                </div>
              )}

              {/* Buffering during playback */}
              {isBuffering && isPlaying && !isVimeoVideo && (
                <div className="absolute top-4 right-4 pointer-events-none">
                  <div className="w-8 h-8 border-2 border-gray-600 border-t-primary rounded-full animate-spin"></div>
                </div>
              )}

              {/* Skip Labels */}
              <AnimatePresence>
                {showSkipLabel && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`absolute top-1/2 ${showSkipLabel === 'backward' ? 'left-8' : 'right-8'} transform -translate-y-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-4 pointer-events-none`}
                  >
                    <div className="flex items-center gap-2 text-white">
                      {showSkipLabel === 'backward' ? (
                        <RotateCcw className="w-6 h-6" />
                      ) : (
                        <RotateCw className="w-6 h-6" />
                      )}
                      <span className="text-sm font-medium">10s</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Center Play/Pause Button */}
              <AnimatePresence>
                {!isVimeoVideo && showControls && !isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="bg-black/60 rounded-full p-4 backdrop-blur-sm">
                      <Play className="w-12 h-12 md:w-16 md:h-16 text-white ml-1" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Top Gradient & Header */}
              <AnimatePresence>
                {!isVimeoVideo && showControls && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`absolute top-0 left-0 right-0 ${!isFullscreen && anime?.type === 'series' ? 'lg:right-80' : ''} bg-gradient-to-b from-black/80 via-black/40 to-transparent p-3 md:p-4`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isFullscreen) {
                            toggleFullscreen();
                          } else {
                            navigate(`/anime/${animeId}`);
                          }
                        }}
                        className="control-btn p-2 hover:bg-primary/20 rounded-full"
                      >
                        <ChevronLeft className="w-6 h-6 text-white" />
                      </button>

                      <div className="flex-1 mx-3 text-center">
                        <h1 className="text-sm md:text-lg font-semibold text-white truncate">
                          {anime?.title}
                        </h1>
                        <p className="text-xs md:text-sm text-gray-300 truncate">
                          {anime?.type === 'movie' 
                            ? currentEpisode?.title || 'Film'
                            : `Episode ${currentEpisode?.episode_number}: ${currentEpisode?.title}`
                          }
                        </p>
                      </div>

                      {/* Episodes list button - Only for Series */}
                      {anime?.type === 'series' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowEpisodeList(!showEpisodeList);
                          }}
                          className={`${isFullscreen ? 'block' : 'lg:hidden'} control-btn p-2 hover:bg-primary/20 rounded-full`}
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
                      className={`absolute bottom-0 left-0 right-0 ${!isFullscreen && anime?.type === 'series' ? 'lg:right-80' : ''} bg-gradient-to-t from-black/90 via-black/60 to-transparent`}
                    >
                      {/* Progress Bar */}
                      <div className="px-4 pb-2">
                        <div
                          ref={progressBarRef}
                          className="progress-bar"
                          onClick={handleProgressBarClick}
                          onTouchStart={handleProgressBarTouchStart}
                          onTouchMove={handleProgressBarTouchMove}
                          onTouchEnd={handleProgressBarTouchEnd}
                        >
                          <div
                            className="progress-bar-buffered"
                            style={{ width: `${(bufferedTime / duration) * 100}%` }}
                          />
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="px-4 pb-4">
                        {/* Mobile Controls */}
                        <div className="md:hidden space-y-3">
                          <div className="flex items-center justify-between">
                            {anime?.type === 'series' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  previousEpisode();
                                }}
                                disabled={!anime?.episodes?.find((e: any) => e.episode_number === (currentEpisode?.episode_number || 1) - 1)}
                                className="control-btn p-2 disabled:opacity-30 hover:bg-primary/20 rounded-full"
                              >
                                <SkipBack className="w-6 h-6 text-white" />
                              </button>
                            )}

                            <div className="flex items-center gap-6">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  skipBackward();
                                }}
                                className="control-btn p-2 hover:bg-primary/20 rounded-full"
                              >
                                <ChevronLeft className="w-8 h-8 text-white" />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePlay();
                                }}
                                className="control-btn p-3 bg-primary hover:bg-primary-dark rounded-full"
                              >
                                {isPlaying ? (
                                  <Pause className="w-7 h-7 text-white" />
                                ) : (
                                  <Play className="w-7 h-7 text-white ml-0.5" />
                                )}
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  skipForward();
                                }}
                                className="control-btn p-2 hover:bg-primary/20 rounded-full"
                              >
                                <ChevronRight className="w-8 h-8 text-white" />
                              </button>
                            </div>

                            {anime?.type === 'series' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  nextEpisode();
                                }}
                                disabled={!anime?.episodes?.find((e: any) => e.episode_number === (currentEpisode?.episode_number || 1) + 1)}
                                className="control-btn p-2 disabled:opacity-30 hover:bg-primary/20 rounded-full"
                              >
                                <SkipForward className="w-6 h-6 text-white" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-white">
                            <span className="text-sm font-medium">
                              {formatTime(currentTime)}
                            </span>

                            <div className="flex items-center gap-3 relative">
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowSpeedMenu(!showSpeedMenu);
                                  }}
                                  className="control-btn p-2 hover:bg-primary/20 rounded-full"
                                >
                                  <Settings className="w-5 h-5" />
                                </button>

                                {/* Speed Menu */}
                                <AnimatePresence>
                                  {showSpeedMenu && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: 10 }}
                                      className="absolute bottom-full right-0 mb-2 bg-dark/95 backdrop-blur-sm rounded-lg border border-primary/20 py-2 min-w-[120px] z-50"
                                    >
                                      <div className="px-3 py-1 text-xs text-gray-400 border-b border-gray-600 mb-1">
                                        Playback Speed
                                      </div>
                                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                        <button
                                          key={speed}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            changePlaybackSpeed(speed);
                                          }}
                                          className={`w-full px-3 py-2 text-left text-sm hover:bg-primary/20 ${playbackSpeed === speed ? 'text-primary bg-primary/10' : 'text-white'
                                            }`}
                                        >
                                          {speed}x {speed === 1 ? '(Normal)' : ''}
                                        </button>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMute();
                                  }}
                                  className="control-btn p-2 hover:bg-primary/20 rounded-full"
                                >
                                  {isMuted ? (
                                    <VolumeX className="w-5 h-5" />
                                  ) : (
                                    <Volume2 className="w-5 h-5" />
                                  )}
                                </button>
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={isMuted ? 0 : volume}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    const newVolume = parseFloat(e.target.value);
                                    if (videoRef.current) {
                                      videoRef.current.volume = newVolume;
                                      videoRef.current.muted = newVolume === 0;
                                      setVolume(newVolume);
                                      setIsMuted(newVolume === 0);
                                    }
                                  }}
                                  className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                                />
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFullscreen();
                                }}
                                className="control-btn p-2 hover:bg-primary/20 rounded-full"
                              >
                                {isFullscreen ? (
                                  <Minimize className="w-5 h-5" />
                                ) : (
                                  <Maximize className="w-5 h-5" />
                                )}
                              </button>
                            </div>

                            <span className="text-sm font-medium">
                              {formatTime(duration)}
                            </span>
                          </div>
                        </div>

                        {/* Desktop Controls */}
                        <div className="hidden md:flex items-center justify-between text-white">
                          <div className="flex items-center gap-4">
                            {anime?.type === 'series' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  previousEpisode();
                                }}
                                disabled={!anime?.episodes?.find((e: any) => e.episode_number === (currentEpisode?.episode_number || 1) - 1)}
                                className="control-btn p-2 disabled:opacity-30 hover:bg-primary/20 rounded-full"
                              >
                                <SkipBack className="w-5 h-5" />
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                skipBackward();
                              }}
                              className="control-btn p-2 hover:bg-primary/20 rounded-full"
                            >
                              <ChevronLeft className="w-6 h-6" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePlay();
                              }}
                              className="control-btn p-3 bg-primary hover:bg-primary-dark rounded-full"
                            >
                              {isPlaying ? (
                                <Pause className="w-6 h-6" />
                              ) : (
                                <Play className="w-6 h-6 ml-0.5" />
                              )}
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                skipForward();
                              }}
                              className="control-btn p-2 hover:bg-primary/20 rounded-full"
                            >
                              <ChevronRight className="w-6 h-6" />
                            </button>

                            {anime?.type === 'series' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  nextEpisode();
                                }}
                                disabled={!anime?.episodes?.find((e: any) => e.episode_number === (currentEpisode?.episode_number || 1) + 1)}
                                className="control-btn p-2 disabled:opacity-30 hover:bg-primary/20 rounded-full"
                              >
                                <SkipForward className="w-5 h-5" />
                              </button>
                            )}

                            <span className="text-sm font-medium ml-4">
                              {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 relative">
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowSpeedMenu(!showSpeedMenu);
                                }}
                                className="control-btn p-2 hover:bg-primary/20 rounded-full"
                              >
                                <Settings className="w-5 h-5" />
                              </button>

                              {/* Speed Menu */}
                              <AnimatePresence>
                                {showSpeedMenu && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-full right-0 mb-2 bg-dark/95 backdrop-blur-sm rounded-lg border border-primary/20 py-2 min-w-[120px] z-50"
                                  >
                                    <div className="px-3 py-1 text-xs text-gray-400 border-b border-gray-600 mb-1">
                                      Playback Speed
                                    </div>
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                      <button
                                        key={speed}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          changePlaybackSpeed(speed);
                                        }}
                                        className={`w-full px-3 py-2 text-left text-sm hover:bg-primary/20 ${playbackSpeed === speed ? 'text-primary bg-primary/10' : 'text-white'
                                          }`}
                                      >
                                        {speed}x {speed === 1 ? '(Normal)' : ''}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleMute();
                                }}
                                className="control-btn p-2 hover:bg-primary/20 rounded-full"
                              >
                                {isMuted ? (
                                  <VolumeX className="w-5 h-5" />
                                ) : (
                                  <Volume2 className="w-5 h-5" />
                                )}
                              </button>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={isMuted ? 0 : volume}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  const newVolume = parseFloat(e.target.value);
                                  if (videoRef.current) {
                                    videoRef.current.volume = newVolume;
                                    videoRef.current.muted = newVolume === 0;
                                    setVolume(newVolume);
                                    setIsMuted(newVolume === 0);
                                  }
                                }}
                                className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                              />
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFullscreen();
                              }}
                              className="control-btn p-2 hover:bg-primary/20 rounded-full"
                            >
                              {isFullscreen ? (
                                <Minimize className="w-5 h-5" />
                              ) : (
                                <Maximize className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          )}
        </div>

        {/* Episode List Sidebar - Only for Series */}
        <AnimatePresence>
          {showEpisodeList && anime?.type === 'series' && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className={`absolute top-0 right-0 w-80 h-full bg-dark-light border-l border-dark-lighter z-50 ${isFullscreen ? 'block' : 'lg:hidden'}`}
            >
              <div className="p-4 border-b border-dark-lighter">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Episodes</h3>
                  <button
                    onClick={() => setShowEpisodeList(false)}
                    className="p-2 hover:bg-white/10 rounded-full"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto h-full pb-20">
                {anime?.episodes?.map((episode: any) => (
                  <button
                    key={episode.id}
                    onClick={() => goToEpisode(episode.episode_number)}
                    className={`w-full p-4 text-left hover:bg-white/5 border-b border-dark-lighter/50 ${episode.episode_number === currentEpisode?.episode_number
                      ? 'bg-primary/20 border-primary/30'
                      : ''
                      }`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={episode.thumbnail || anime.thumbnail}
                        alt={episode.title}
                        className="w-16 h-9 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          Episode {episode.episode_number}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {episode.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {episode.duration}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Episode List - Only for Series */}
        {!isFullscreen && anime?.type === 'series' && (
          <div className="hidden lg:block absolute top-0 right-0 w-80 h-full bg-dark-light border-l border-dark-lighter">
            <div className="p-4 border-b border-dark-lighter">
              <h3 className="text-lg font-semibold text-white">Episodes</h3>
            </div>
            <div className="overflow-y-auto h-full pb-4">
              {anime?.episodes?.map((episode: any) => (
                <button
                  key={episode.id}
                  onClick={() => goToEpisode(episode.episode_number)}
                  className={`w-full p-4 text-left hover:bg-white/5 border-b border-dark-lighter/50 ${episode.episode_number === currentEpisode?.episode_number
                    ? 'bg-primary/20 border-primary/30'
                    : ''
                    }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={episode.thumbnail || anime.thumbnail}
                      alt={episode.title}
                      className="w-16 h-9 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        Episode {episode.episode_number}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {episode.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {episode.duration}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Next Episode Countdown */}
        <AnimatePresence>
          {showNextEpisodeCountdown && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-dark/90 backdrop-blur-sm rounded-lg p-6 text-center z-50"
            >
              <h3 className="text-lg font-semibold text-white mb-2">
                Next Episode Starting In
              </h3>
              <div className="text-4xl font-bold text-primary mb-4">
                {countdown}
              </div>
              <button
                onClick={() => setShowNextEpisodeCountdown(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default VideoPlayer;