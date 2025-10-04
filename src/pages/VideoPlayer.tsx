import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { fetchAnimeById } from '../services/api';

const VideoPlayer = () => {
  const { animeId, episodeNumber } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hideControlsTimerRef = useRef<number | undefined>(undefined);

  const isLoggedIn = sessionStorage.getItem('access_token');

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
  const [lastTap, setLastTap] = useState(0);

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
        } else {
          const fallbackAnime = {
            id: Number(animeId),
            title: 'Test Anime',
            episodes: [
              {
                id: 1,
                episodeNumber: 1,
                title: 'Episode 1',
                thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=170&fit=crop',
                duration: '24:00',
                videoUrl: '/video.mp4',
                watched: false
              }
            ]
          };
          setAnime(fallbackAnime);
          setCurrentEpisode(fallbackAnime.episodes[0]);
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

  // Load video URL
  useEffect(() => {
    const loadVideo = async () => {
      if (!anime) return;

      setIsLoadingVideo(true);

      try {
        let videoUrl = '';

        if (currentEpisode?.video_url) {
          videoUrl = currentEpisode.video_url;
        } else if (anime.videos && anime.videos.length > 0) {
          videoUrl = anime.videos[0].url;
        } else {
          videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        }

        if (videoUrl.includes('vimeo.com') && !videoUrl.includes('player.vimeo.com')) {
          const vimeoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
          if (vimeoId) {
            videoUrl = `https://player.vimeo.com/video/${vimeoId}`;
          }
        }

        setVideoUrl(videoUrl);
        setIsVimeoVideo(videoUrl.includes('player.vimeo.com'));

        if (videoUrl.includes('player.vimeo.com')) {
          setIsLoadingVideo(false);
        }
      } catch (error) {
        console.error('Error loading video:', error);
        setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
        setIsLoadingVideo(false);
      }
    };

    if (anime && currentEpisode) {
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
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
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

  // Video events
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setIsLoadingVideo(false);

    const savedPosition = sessionStorage.getItem(`video-${animeId}-${episodeNumber}`);
    if (savedPosition) {
      videoRef.current.currentTime = Number(savedPosition);
    }
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
      sessionStorage.setItem(`video-${animeId}-${episodeNumber}`, String(current));
    }

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
  const handleWaiting = () => setIsBuffering(true);
  const handleCanPlay = () => setIsBuffering(false);

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

  // Mobile double tap to skip
  const handleVideoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap;

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;

      if (x < width / 3) {
        skipBackward();
      } else if (x > (width * 2) / 3) {
        skipForward();
      } else {
        togglePlay();
      }
    } else {
      setShowControls(!showControls);
    }

    setLastTap(now);
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
    <div 
      ref={containerRef}
      className="relative h-screen bg-black overflow-hidden"
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
          background: #ff0000;
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

        @media (max-width: 768px) {
          .progress-bar {
            height: 4px;
          }
          
          .control-btn {
            padding: 0.75rem;
          }
        }
      `}</style>

      {/* Video Container */}
      <div className="absolute inset-0 lg:right-80">
        {videoUrl && (
          <div 
            className="relative h-full w-full bg-black"
            onClick={handleVideoClick}
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
                playsInline
                preload="metadata"
              />
            )}

            {/* Loading/Buffering */}
            {(isLoadingVideo || isBuffering) && !isVimeoVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
                <div className="w-16 h-16 border-4 border-gray-600 border-t-red-600 rounded-full animate-spin"></div>
              </div>
            )}

            {/* Center Play/Pause Button */}
            <AnimatePresence>
              {!isVimeoVideo && showControls && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="bg-black/60 rounded-full p-4 backdrop-blur-sm">
                    {isPlaying ? (
                      <Pause className="w-12 h-12 md:w-16 md:h-16 text-white" />
                    ) : (
                      <Play className="w-12 h-12 md:w-16 md:h-16 text-white ml-1" />
                    )}
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
                  className="absolute top-0 left-0 right-0 lg:right-80 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-3 md:p-4"
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/anime/${animeId}`);
                      }}
                      className="control-btn p-2 hover:bg-white/10 rounded-full"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>

                    <div className="flex-1 mx-3 text-center">
                      <h1 className="text-sm md:text-lg font-semibold text-white truncate">
                        {anime?.title}
                      </h1>
                      <p className="text-xs md:text-sm text-gray-300 truncate">
                        Episode {currentEpisode?.episodeNumber}: {currentEpisode?.title}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowEpisodeList(!showEpisodeList);
                      }}
                      className="lg:hidden control-btn p-2 hover:bg-white/10 rounded-full"
                    >
                      <List className="w-6 h-6 text-white" />
                    </button>
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
                    className="absolute bottom-0 left-0 right-0 lg:right-80 bg-gradient-to-t from-black/90 via-black/60 to-transparent"
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              previousEpisode();
                            }}
                            disabled={!anime?.episodes?.find((e: any) => e.episodeNumber === (currentEpisode?.episodeNumber || 1) - 1)}
                            className="control-btn p-2 disabled:opacity-30"
                          >
                            <SkipBack className="w-6 h-6 text-white" />
                          </button>

                          <div className="flex items-center gap-6">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                skipBackward();
                              }}
                              className="control-btn"
                            >
                              <ChevronLeft className="w-8 h-8 text-white" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePlay();
                              }}
                              className="control-btn p-3 bg-red-600 rounded-full"
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
                              className="control-btn"
                            >
                              <ChevronRight className="w-8 h-8 text-white" />
                            </button>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              nextEpisode();
                            }}
                            disabled={!anime?.episodes?.find((e: any) => e.episodeNumber === (currentEpisode?.episodeNumber || 1) + 1)}
                            className="control-btn p-2 disabled:opacity-30"
                          >
                            <SkipForward className="w-6 h-6 text-white" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-white">
                          <span className="text-sm font-medium">
                            {formatTime(currentTime)}
                          </span>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowSpeedMenu(!showSpeedMenu);
                              }}
                              className="control-btn p-2"
                            >
                              <Settings className="w-5 h-5" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMute();
                              }}
                              className="control-btn p-2"
                            >
                              {isMuted ? (
                                <VolumeX className="w-5 h-5" />
                              ) : (
                                <Volume2 className="w-5 h-5" />
                              )}
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFullscreen();
                              }}
                              className="control-btn p-2"
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              previousEpisode();
                            }}
                            disabled={!anime?.episodes?.find((e: any) => e.episodeNumber === (currentEpisode?.episodeNumber || 1) - 1)}
                            className="control-btn p-2 disabled:opacity-30"
                          >
                            <SkipBack className="w-5 h-5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              skipBackward();
                            }}
                            className="control-btn p-2"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePlay();
                            }}
                            className="control-btn p-3 bg-red-600 rounded-full"
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
                            className="control-btn p-2"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              nextEpisode();
                            }}
                            disabled={!anime?.episodes?.find((e: any) => e.episodeNumber === (currentEpisode?.episodeNumber || 1) + 1)}
                            className="control-btn p-2 disabled:opacity-30"
                          >
                            <SkipForward className="w-5 h-5" />
                          </button>

                          <span className="text-sm font-medium ml-4">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowSpeedMenu(!showSpeedMenu);
                            }}
                            className="control-btn p-2"
                          >
                            <Settings className="w-5 h-5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMute();
                            }}
                            className="control-btn p-2"
                          >
                            {isMuted ? (
                              <VolumeX className="w-5 h-5" />
                            ) : (
                              <Volume2 className="w-5 h-5" />
                            )}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFullscreen();
                            }}
                            className="control-btn p-2"
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

      {/* Episode List Sidebar */}
      <AnimatePresence>
        {showEpisodeList && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute top-0 right-0 w-80 h-full bg-dark-light border-l border-dark-lighter z-50 lg:hidden"
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
                  onClick={() => goToEpisode(episode.episodeNumber)}
                  className={`w-full p-4 text-left hover:bg-white/5 border-b border-dark-lighter/50 ${
                    episode.episodeNumber === currentEpisode?.episodeNumber
                      ? 'bg-primary/20 border-primary/30'
                      : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={episode.thumbnail}
                      alt={episode.title}
                      className="w-16 h-9 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        Episode {episode.episodeNumber}
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

      {/* Desktop Episode List */}
      <div className="hidden lg:block absolute top-0 right-0 w-80 h-full bg-dark-light border-l border-dark-lighter">
        <div className="p-4 border-b border-dark-lighter">
          <h3 className="text-lg font-semibold text-white">Episodes</h3>
        </div>
        <div className="overflow-y-auto h-full pb-4">
          {anime?.episodes?.map((episode: any) => (
            <button
              key={episode.id}
              onClick={() => goToEpisode(episode.episodeNumber)}
              className={`w-full p-4 text-left hover:bg-white/5 border-b border-dark-lighter/50 ${
                episode.episodeNumber === currentEpisode?.episodeNumber
                  ? 'bg-primary/20 border-primary/30'
                  : ''
              }`}
            >
              <div className="flex gap-3">
                <img
                  src={episode.thumbnail}
                  alt={episode.title}
                  className="w-16 h-9 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    Episode {episode.episodeNumber}
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
  );
};

export default VideoPlayer;