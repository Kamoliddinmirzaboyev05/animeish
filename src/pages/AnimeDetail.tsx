import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Star, Play, Pause, Heart, Calendar, Film, MessageSquare, ChevronLeft,
  Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward,
  Settings, RotateCcw, RotateCw, X, List
} from 'lucide-react';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import StructuredData from '../components/StructuredData';
import RatingModal from '../components/RatingModal';
import RatingsSection from '../components/RatingsSection';
import {
  fetchAnimeById,
  addBookmark,
  removeBookmark,
  checkBookmarkStatus,
  checkUserRating
} from '../services/api';
import { translateStatus, translateGenres } from '../utils/translations';

// ==========================================
// TYPE DEFINITIONS
// ==========================================
interface Episode {
  id: number;
  episode_number: number;
  title: string;
  video_url: string;
  thumbnail: string;
  duration?: string;
  watched?: boolean;
}

interface Anime {
  id: number;
  title: string;
  description: string;
  banner: string;
  thumbnail: string;
  rating: number;
  year: string;
  totalEpisodes: number;
  status: string;
  genres: string[];
  type: 'movie' | 'series';
  episodes: Episode[];
  studio?: string;
  averageRating?: number;
  ratingsCount?: number;
  ratings?: any[];
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
const formatTime = (time: number): string => {
  if (!time || isNaN(time)) return '0:00';
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function AnimeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hideControlsTimerRef = useRef<number | undefined>(undefined);
  const lastTapRef = useRef<number>(0);

  // Auth
  const isLoggedIn = localStorage.getItem('access_token');

  // Data State
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [checkingRating, setCheckingRating] = useState(false);

  // Video Player State
  const [isWatchMode, setIsWatchMode] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSkipIndicator, setShowSkipIndicator] = useState<'forward' | 'backward' | null>(null);
  const [showEpisodeList, setShowEpisodeList] = useState(false);


  // ==========================================
  // LOAD ANIME DATA
  // ==========================================
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchAnimeById(Number(id));
        setAnime(data);

        if (isLoggedIn) {
          const saved = await checkBookmarkStatus(Number(id));
          setIsSaved(saved);

          setCheckingRating(true);
          const rating = await checkUserRating(Number(id));
          setUserRating(rating);
          setCheckingRating(false);
        }
      } catch (err) {
        setError('Ma\'lumotlarni yuklashda xatolik');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isLoggedIn]);

  // ==========================================
  // VIDEO PLAYER LOGIC
  // ==========================================
  const enterWatchMode = useCallback((episode?: Episode) => {
    if (!anime) return;

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const targetEpisode = episode || anime.episodes[0];
    if (!targetEpisode) return;

    setCurrentEpisode(targetEpisode);
    setVideoUrl(targetEpisode.video_url);
    setIsWatchMode(true);
    setCurrentTime(0);
    setIsPlaying(true); // Auto-play when entering watch mode
    setShowControls(true);

    // Scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [anime, isLoggedIn, navigate]);

  const exitWatchMode = useCallback(() => {
    setIsWatchMode(false);
    setIsPlaying(false);
    setCurrentEpisode(null);
    setVideoUrl('');
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  const goToEpisode = useCallback((episode: Episode) => {
    setIsPlaying(true); // Auto-play when switching episodes
    setCurrentTime(0);
    setCurrentEpisode(episode);
    setVideoUrl(episode.video_url);
    setShowEpisodeList(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  const nextEpisode = useCallback(() => {
    if (!anime || !currentEpisode || anime.type === 'movie') return;
    const nextEp = anime.episodes.find(e => e.episode_number === currentEpisode.episode_number + 1);
    if (nextEp) goToEpisode(nextEp);
  }, [anime, currentEpisode, goToEpisode]);

  const prevEpisode = useCallback(() => {
    if (!anime || !currentEpisode || anime.type === 'movie') return;
    const prevEp = anime.episodes.find(e => e.episode_number === currentEpisode.episode_number - 1);
    if (prevEp) goToEpisode(prevEp);
  }, [anime, currentEpisode, goToEpisode]);

  // ==========================================
  // VIDEO CONTROLS
  // ==========================================
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(console.error);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  }, [isMuted]);

  const skipTime = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
    videoRef.current.currentTime = newTime;
    setShowSkipIndicator(seconds > 0 ? 'forward' : 'backward');
    setTimeout(() => setShowSkipIndicator(null), 800);
  }, [duration]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);

        // Mobile landscape orientation
        if (screen.orientation && 'lock' in screen.orientation) {
          try {
            await (screen.orientation as any).lock('landscape');
          } catch (orientationError) {
            console.log('Orientation lock not supported:', orientationError);
          }
        }
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);

        // Unlock orientation when exiting fullscreen
        if (screen.orientation && 'unlock' in screen.orientation) {
          try {
            (screen.orientation as any).unlock();
          } catch (orientationError) {
            console.log('Orientation unlock not supported:', orientationError);
          }
        }
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  const changeSpeed = useCallback((speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSettings(false);
  }, []);

  const [isDragging, setIsDragging] = useState(false);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevent video click handler
    if (!progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    handleProgressClick(e);
  }, [handleProgressClick]);

  const handleProgressMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [isDragging, duration]);

  const handleProgressMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse and touch events for dragging
  useEffect(() => {
    if (isDragging) {
      const handleTouchMove = (e: TouchEvent) => {
        if (!progressBarRef.current || !videoRef.current) return;
        e.preventDefault();
        const touch = e.touches[0];
        const rect = progressBarRef.current.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
        const newTime = pos * duration;
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      };

      const handleTouchEnd = () => {
        setIsDragging(false);
      };

      document.addEventListener('mousemove', handleProgressMouseMove);
      document.addEventListener('mouseup', handleProgressMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleProgressMouseMove);
        document.removeEventListener('mouseup', handleProgressMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleProgressMouseMove, handleProgressMouseUp, duration]);

  // ==========================================
  // AUTO-HIDE CONTROLS
  // ==========================================
  const showControlsTemp = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (isPlaying && !showSettings && !showEpisodeList) {
      hideControlsTimerRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 4000); // 4 seconds
    }
  }, [isPlaying, showSettings, showEpisodeList]);

  // ==========================================
  // MOBILE DOUBLE TAP
  // ==========================================
  const handleVideoTap = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const currentTapTime = Date.now();
    const tapLength = currentTapTime - lastTapRef.current;

    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clientX = e.touches[0]?.clientX || e.changedTouches[0]?.clientX;
      if (!clientX) return;

      const tapPosition = clientX - rect.left;
      const screenThird = rect.width / 3;

      if (tapPosition < screenThird) {
        skipTime(-10);
      } else if (tapPosition > screenThird * 2) {
        skipTime(10);
      } else {
        togglePlay();
      }

      // Reset tap time to prevent triple tap
      lastTapRef.current = 0;
    } else {
      // Single tap - show controls and set auto-hide timer
      // Clear existing timer
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
        hideControlsTimerRef.current = undefined;
      }

      // Always show controls on tap
      setShowControls(true);

      // Set auto-hide timer (only if video is playing and no menus are open)
      if (isPlaying && !showSettings && !showEpisodeList) {
        hideControlsTimerRef.current = window.setTimeout(() => {
          setShowControls(false);
        }, 4000); // 4 seconds
      }

      lastTapRef.current = currentTapTime;
    }
  }, [skipTime, togglePlay, isPlaying, showSettings, showEpisodeList]);

  // Separate handler for mouse clicks (desktop)
  const handleVideoClick = useCallback((e: React.MouseEvent) => {
    // Only toggle play on desktop mouse clicks
    if (e.detail === 1) { // Single click
      togglePlay();
    }
  }, [togglePlay]);

  // ==========================================
  // VIDEO EVENT HANDLERS
  // ==========================================
  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setIsBuffering(false);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered(bufferedEnd);
    }
  }, []);

  // ==========================================
  // AUTO NEXT EPISODE
  // ==========================================
  const handleVideoEnded = useCallback(() => {
    if (anime?.type === 'series') {
      const nextEp = anime.episodes?.find(e => e.episode_number === (currentEpisode?.episode_number || 0) + 1);
      if (nextEp) {
        // Auto play next episode immediately when current ends
        goToEpisode(nextEp);
      }
    }
  }, [anime, currentEpisode, goToEpisode]);

  // ==========================================
  // AUTO PLAY WHEN VIDEO LOADS
  // ==========================================
  useEffect(() => {
    if (videoRef.current && isPlaying && videoUrl) {
      const playVideo = async () => {
        try {
          await videoRef.current?.play();
        } catch (error) {
          console.log('Auto-play prevented by browser:', error);
          setIsPlaying(false);
        }
      };
      playVideo();
    }
  }, [videoUrl, isPlaying]);

  // ==========================================
  // KEYBOARD SHORTCUTS
  // ==========================================
  useEffect(() => {
    if (!isWatchMode) return;

    const handleKeyPress = (e: KeyboardEvent) => {
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
            setIsMuted(newVol === 0);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.max(volume - 0.1, 0);
            videoRef.current.volume = newVol;
            setVolume(newVol);
            setIsMuted(newVol === 0);
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
        case 'Escape':
          if (showEpisodeList) setShowEpisodeList(false);
          else if (showSettings) setShowSettings(false);
          else if (isFullscreen) toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isWatchMode, volume, togglePlay, toggleMute, toggleFullscreen, skipTime, showEpisodeList, showSettings, isFullscreen]);

  // ==========================================
  // BOOKMARK HANDLERS
  // ==========================================
  const toggleSaved = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    try {
      if (isSaved) {
        await removeBookmark(Number(id));
        setIsSaved(false);
        toast.success('Ro\'yxatdan olib tashlandi');
      } else {
        await addBookmark(Number(id));
        setIsSaved(true);
        toast.success('Ro\'yxatga qo\'shildi');
      }
    } catch (err) {
      console.error('Bookmark error:', err);
      toast.error('Xatolik yuz berdi');
    }
  };

  // ==========================================
  // RATING HANDLERS
  // ==========================================
  const handleRatingClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (userRating) {
      toast.info(`Siz avval ${userRating.score}/5 reyting bergansiz. Bir filmni faqat bir marta baholash mumkin.`);
      return;
    }

    setShowRatingModal(true);
  };

  const handleRatingSubmitted = async () => {
    // Close the rating modal first
    setShowRatingModal(false);

    // Reload anime data to get updated ratings
    try {
      // Small delay to ensure the rating is processed on the server
      await new Promise(resolve => setTimeout(resolve, 500));

      // Force refresh by fetching fresh data
      const animeData = await fetchAnimeById(Number(id));
      setAnime(animeData);

      // Check user rating again
      const rating = await checkUserRating(Number(id));
      setUserRating(rating);

      // Show success message
      toast.success('Reyting muvaffaqiyatli yangilandi!');
    } catch (error) {
      console.error('Error reloading anime data:', error);
      toast.error('Ma\'lumotlarni yangilashda xatolik');
    }
  };



  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Anime topilmadi</h2>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-primary rounded-full hover:bg-primary-dark transition-colors"
            >
              Bosh sahifaga qaytish
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // WATCH MODE (VIDEO PLAYER)
  // ==========================================
  if (isWatchMode) {
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
          <div className={`absolute inset-0 ${!isFullscreen && anime.type === 'series' ? 'lg:right-80' : ''}`}>
            <div
              className="relative h-full w-full"
            >
              <video
                ref={videoRef}
                className="w-full h-full object-contain bg-black cursor-pointer"
                src={videoUrl}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => {
                  setIsPlaying(true);
                  setIsBuffering(false);
                  // Restart auto-hide timer when video starts playing
                  if (showControls && !showSettings && !showEpisodeList) {
                    if (hideControlsTimerRef.current) {
                      clearTimeout(hideControlsTimerRef.current);
                    }
                    hideControlsTimerRef.current = window.setTimeout(() => {
                      setShowControls(false);
                    }, 4000);
                  }
                }}
                onPause={() => {
                  setIsPlaying(false);
                  // Clear auto-hide timer when video is paused
                  if (hideControlsTimerRef.current) {
                    clearTimeout(hideControlsTimerRef.current);
                    hideControlsTimerRef.current = undefined;
                  }
                }}
                onWaiting={() => setIsBuffering(true)}
                onCanPlay={() => setIsBuffering(false)}
                onLoadStart={() => setIsBuffering(true)}
                onLoadedData={() => setIsBuffering(false)}
                onEnded={handleVideoEnded}
                onClick={handleVideoClick}
                onTouchEnd={handleVideoTap}
                playsInline
                preload="auto"
                autoPlay={isPlaying}
                crossOrigin="anonymous"
              />

              {/* Buffering */}
              {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
                </div>
              )}

              {/* Skip Indicators */}
              <AnimatePresence>
                {showSkipIndicator && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute top-1/2 -translate-y-1/2 ${showSkipIndicator === 'backward' ? 'left-8' : 'right-8'} bg-black/80 rounded-full p-4 pointer-events-none z-30`}
                  >
                    <div className="flex items-center gap-2 text-white">
                      {showSkipIndicator === 'backward' ? (
                        <>
                          <RotateCcw className="w-6 h-6" />
                          <span className="font-bold">10s</span>
                        </>
                      ) : (
                        <>
                          <RotateCw className="w-6 h-6" />
                          <span className="font-bold">10s</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Top Bar - Mobile Optimized */}
              <AnimatePresence>
                {showControls && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 via-black/50 to-transparent p-4 z-20"
                  >
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          isFullscreen ? toggleFullscreen() : exitWatchMode();
                        }}
                        className="p-3 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6 text-white" />
                      </motion.button>

                      <div className="flex-1 text-white min-w-0">
                        <h1 className="font-semibold truncate text-base sm:text-lg">{anime.title}</h1>
                        <p className="text-xs sm:text-sm text-gray-300 truncate">
                          {anime.type === 'movie' ? 'Film' : `Episode ${currentEpisode?.episode_number}`}
                          {currentEpisode?.title && ` - ${currentEpisode.title}`}
                        </p>
                      </div>

                      {anime.type === 'series' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowEpisodeList(!showEpisodeList);
                          }}
                          className="p-3 hover:bg-white/10 rounded-full transition-colors lg:hidden"
                        >
                          <List className="w-6 h-6 text-white" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile-First Bottom Controls Overlay */}
              <AnimatePresence>
                {showControls && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 sm:p-6 z-20"
                  >
                    {/* Progress Bar - Mobile Optimized */}
                    <div className="mb-4">
                      <div
                        ref={progressBarRef}
                        className="w-full h-2 sm:h-2 bg-white/20 rounded-full cursor-pointer group hover:h-3 transition-all touch-manipulation"
                        onClick={handleProgressClick}
                        onMouseDown={handleProgressMouseDown}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          setIsDragging(true);
                          handleProgressClick(e as any);
                        }}
                        onTouchMove={(e) => {
                          if (!isDragging || !progressBarRef.current || !videoRef.current) return;
                          e.preventDefault();
                          const touch = e.touches[0];
                          const rect = progressBarRef.current.getBoundingClientRect();
                          const pos = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
                          const newTime = pos * duration;
                          videoRef.current.currentTime = newTime;
                          setCurrentTime(newTime);
                        }}
                        onTouchEnd={() => setIsDragging(false)}
                      >
                        <div className="relative h-full">
                          {/* Buffered Progress */}
                          <div
                            className="absolute h-full bg-white/30 rounded-full transition-all"
                            style={{ width: `${(buffered / duration) * 100}%` }}
                          />
                          {/* Current Progress */}
                          <div
                            className="absolute h-full bg-primary rounded-full transition-all"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                          />
                          {/* Progress Thumb - Larger for mobile */}
                          <div
                            className="absolute w-3 h-3 sm:w-3 sm:h-3 bg-primary rounded-full -translate-y-1/2 top-1/2 shadow-lg border-2 border-white/50 transition-all"
                            style={{
                              left: `${(currentTime / duration) * 100}%`,
                              marginLeft: '-6px',
                              transform: `translateY(-50%) scale(${isDragging ? 1.4 : 1.1})`
                            }}
                          />
                        </div>
                      </div>

                      {/* Time Display - Better mobile typography */}
                      <div className="flex justify-between items-center mt-2 text-xs sm:text-sm text-white/90 font-medium">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Professional Mobile Controls Layout - Single Row */}
                    <div className="flex items-center justify-between">
                      {/* Left Side - Volume Control */}
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleMute();
                          }}
                          className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                        </motion.button>

                        {/* Volume Slider - Hidden on small screens */}
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
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
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="hidden sm:block w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer touch-manipulation
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                            [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg
                            [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-primary 
                            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow-lg"
                          style={{
                            background: `linear-gradient(to right, #740775 0%, #740775 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) 100%)`
                          }}
                        />
                      </div>

                      {/* Center - Main Playback Controls */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        {/* Previous Episode */}
                        {anime.type === 'series' && anime.episodes?.find(e => e.episode_number === (currentEpisode?.episode_number || 0) - 1) && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); prevEpisode(); }}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                          >
                            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </motion.button>
                        )}

                        {/* Skip Backward */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); skipTime(-10); }}
                          className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </motion.button>

                        {/* Play/Pause - Larger and prominent */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            togglePlay();
                          }}
                          className="p-3 sm:p-4 bg-primary hover:bg-primary-dark rounded-full transition-colors shadow-lg"
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          ) : (
                            <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5" />
                          )}
                        </motion.button>

                        {/* Skip Forward */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); skipTime(10); }}
                          className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                          <RotateCw className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </motion.button>

                        {/* Next Episode */}
                        {anime.type === 'series' && anime.episodes?.find(e => e.episode_number === (currentEpisode?.episode_number || 0) + 1) && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); nextEpisode(); }}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                          >
                            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </motion.button>
                        )}
                      </div>

                      {/* Right Side - Settings & Fullscreen */}
                      <div className="flex items-center gap-1 sm:gap-2">
                        {/* Settings */}
                        <div className="relative">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setShowSettings(!showSettings);
                            }}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                          >
                            <Settings className="w-4 h-4 text-white" />
                          </motion.button>

                          <AnimatePresence>
                            {showSettings && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute bottom-full right-0 mb-2 bg-black/95 backdrop-blur-sm rounded-lg p-2 min-w-[120px] border border-gray-700 shadow-xl"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="text-xs text-gray-400 px-2 py-1 mb-1">Tezlik</div>
                                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                  <motion.button
                                    key={speed}
                                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => changeSpeed(speed)}
                                    className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${playbackSpeed === speed ? 'text-primary font-medium bg-primary/10' : 'text-white'
                                      }`}
                                  >
                                    {speed}x {speed === 1 ? '(Normal)' : ''}
                                  </motion.button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Fullscreen */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleFullscreen(); }}
                          className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                          {isFullscreen ? <Minimize className="w-4 h-4 text-white" /> : <Maximize className="w-4 h-4 text-white" />}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Episode List Sidebar */}
          <AnimatePresence>
            {showEpisodeList && anime.type === 'series' && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="absolute top-0 right-0 w-80 h-full bg-dark z-50 lg:hidden overflow-hidden"
              >
                <div className="p-4 border-b border-dark-lighter flex items-center justify-between">
                  <h3 className="text-white font-semibold">Episodes</h3>
                  <button
                    onClick={() => setShowEpisodeList(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div className="overflow-y-auto h-full pb-20 max-h-[calc(100vh-120px)] custom-scrollbar">
                  {anime.episodes.map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => goToEpisode(ep)}
                      className={`w-full p-4 text-left hover:bg-white/5 border-b border-dark-lighter transition-colors ${ep.episode_number === currentEpisode?.episode_number ? 'bg-primary/20 border-primary/30' : ''
                        }`}
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
                          {ep.duration && <p className="text-gray-500 text-xs mt-1">{ep.duration}</p>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Episode List */}
          {!isFullscreen && anime.type === 'series' && (
            <div className="hidden lg:block absolute top-0 right-0 w-80 h-full bg-dark border-l border-dark-lighter overflow-hidden">
              <div className="p-4 border-b border-dark-lighter">
                <h3 className="text-white font-semibold">Episodes</h3>
                <p className="text-sm text-gray-400 mt-1">{anime.episodes.length} Episodes</p>
              </div>
              <div className="overflow-y-auto h-full pb-4 max-h-[calc(100vh-120px)] custom-scrollbar">
                {anime.episodes.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => goToEpisode(ep)}
                    className={`w-full p-4 text-left hover:bg-white/5 border-b border-dark-lighter transition-colors ${ep.episode_number === currentEpisode?.episode_number ? 'bg-primary/20 border-primary/30' : ''
                      }`}
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
                        {ep.duration && <p className="text-gray-500 text-xs mt-1">{ep.duration}</p>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}


        </div>
      </>
    );
  }

  // ==========================================
  // DETAIL MODE (ANIME INFO)
  // ==========================================
  return (
    <div className="min-h-screen">
      <SEO
        title={`${anime.title} - Anime Tomosha Qiling | Aniki`}
        description={`${anime.title} anime serialini yuqori sifatda va bepul tomosha qiling. ${anime.description || 'Eng yaxshi anime streaming platformasi Aniki da.'}`}
        keywords={`${anime.title}, anime, anime uzbek, ${anime.genres?.join(', ') || 'anime serial'}, anime tomosha, aniki`}
        image={anime.banner || anime.thumbnail}
        url={`https://aniki.uz/anime/${anime.id}`}
        type="video.tv_show"
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "TVSeries",
          "name": anime.title,
          "description": anime.description || `${anime.title} anime seriali`,
          "image": anime.banner || anime.thumbnail,
          "url": `https://aniki.uz/anime/${anime.id}`,
          "genre": anime.genres || [],
          "datePublished": anime.year,
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": anime.rating || 8.5,
            "ratingCount": 1000,
            "bestRating": 10,
            "worstRating": 1
          },
          "numberOfEpisodes": anime.totalEpisodes || anime.episodes?.length || 0,
          "numberOfSeasons": 1,
          "productionCompany": {
            "@type": "Organization",
            "name": anime.studio || "Unknown Studio"
          },
          "creator": {
            "@type": "Organization",
            "name": "Aniki",
            "url": "https://aniki.uz"
          },
          "provider": {
            "@type": "Organization",
            "name": "Aniki",
            "url": "https://aniki.uz"
          }
        }}
      />
      <Navbar />

      <div className="pt-16">
        {/* Hero Banner */}
        <div className="relative h-[50vh] sm:h-[60vh]">
          <img
            src={anime.banner}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" />

          {/* Back Button */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Orqaga</span>
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl"
              >
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 sm:mb-4">{anime.title}</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4 text-sm sm:text-base">
                  {anime.rating && anime.rating > 0 && (
                    <>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{anime.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-gray-400 hidden sm:inline">•</span>
                    </>
                  )}
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{anime.year || 'N/A'}</span>
                  </div>
                  <span className="text-gray-400 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Film className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{anime.totalEpisodes || 0} Epizod</span>
                  </div>
                  <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border ${anime.status === 'Ongoing' || anime.status === 'Davom etmoqda'
                    ? 'bg-green-500/10 text-green-400 border-green-500/30'
                    : anime.status === 'Completed' || anime.status === 'Tugallangan'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : 'bg-primary/10 text-primary border-primary/30'
                    }`}>
                    {translateStatus(anime.status) || anime.status}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => enterWatchMode()}
                    className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 bg-primary hover:bg-primary-dark rounded-full font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                    Hozir Tomosha Qilish
                  </button>
                  <button
                    onClick={toggleSaved}
                    className={`px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base ${isSaved
                      ? 'bg-primary/20 text-primary border-2 border-primary'
                      : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'
                      }`}
                  >
                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? 'fill-primary' : ''}`} />
                    <span className="hidden sm:inline">{isSaved ? 'Ro\'yxatimda' : 'Ro\'yxatga Qo\'shish'}</span>
                    <span className="sm:hidden">{isSaved ? 'Saqlangan' : 'Saqlash'}</span>
                  </button>
                  {isLoggedIn && (
                    <button
                      onClick={handleRatingClick}
                      disabled={checkingRating || !!userRating}
                      className={`px-4 sm:px-6 lg:px-8 py-2 sm:py-3 border-2 rounded-full font-semibold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base ${userRating
                        ? 'bg-green-500/20 text-green-400 border-green-500/30 cursor-not-allowed opacity-75'
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30'
                        } ${checkingRating ? 'opacity-50 cursor-wait' : ''}`}
                      title={userRating ? `Siz ${userRating.score}/5 reyting bergansiz` : 'Reyting berish'}
                    >
                      {checkingRating ? (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : userRating ? (
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                      ) : (
                        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                      <span className="hidden sm:inline">
                        {userRating ? `${userRating.score}/5 Berilgan` : 'Baholash'}
                      </span>
                      <span className="sm:hidden">
                        {userRating ? `${userRating.score}/5` : 'Baholash'}
                      </span>
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 mb-8 sm:mb-12">
            <div className="lg:col-span-2">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Qisqacha Mazmun</h2>
              <p className="text-gray-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">{anime.description}</p>

              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Janrlar</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.genres?.map((genre: string, index: number) => (
                    <span
                      key={`${genre}-${index}`}
                      className="px-3 sm:px-4 py-1 sm:py-2 bg-dark-light border border-dark-lighter rounded-full hover:border-primary transition-colors text-xs sm:text-sm"
                    >
                      {translateGenres([genre])[0] || genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-dark-light border border-dark-lighter rounded-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Ma'lumot</h3>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Holat:</span>
                    <span className={`font-semibold ${anime.status === 'Ongoing' || anime.status === 'Davom etmoqda'
                      ? 'text-green-400'
                      : anime.status === 'Completed' || anime.status === 'Tugallangan'
                        ? 'text-blue-400'
                        : 'text-primary'
                      }`}>
                      {translateStatus(anime.status) || anime.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Epizodlar:</span>
                    <span className="font-semibold">{anime.totalEpisodes || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Yil:</span>
                    <span className="font-semibold">{anime.year || 'N/A'}</span>
                  </div>
                  {anime.rating && anime.rating > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reyting:</span>
                      <span className="font-semibold">{anime.rating}/10</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {anime.episodes && anime.episodes.length > 0 && (
            <div className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Epizodlar</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {anime.episodes.map((episode: any) => (
                  <button
                    key={episode.id}
                    onClick={() => enterWatchMode(episode)}
                    className="group text-left w-full"
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-dark-light mb-1 sm:mb-2">
                      <img
                        src={episode.thumbnail}
                        alt={episode.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {episode.watched && (
                        <div className="absolute top-1 sm:top-2 right-1 sm:right-2 w-4 h-4 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-xs">✓</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
                      </div>
                      <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 px-1 sm:px-2 py-0.5 sm:py-1 bg-dark/90 rounded text-xs">
                        {episode.duration}
                      </div>
                    </div>
                    <h3 className="font-semibold text-xs sm:text-sm group-hover:text-primary transition-colors line-clamp-2">
                      {episode.title || `Episode ${episode.episode_number}`}
                    </h3>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ratings and Comments Section */}
          <RatingsSection
            ratings={anime?.ratings || []}
            averageRating={anime?.averageRating || 0}
            ratingsCount={anime?.ratingsCount || 0}
            onAddRating={handleRatingClick}
            loading={loading}
            userRating={userRating}
          />
        </div>
      </div>

      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        animeId={Number(id)}
        animeTitle={anime?.title || ''}

        onRatingSubmitted={handleRatingSubmitted}
      />


    </div>
  );
}