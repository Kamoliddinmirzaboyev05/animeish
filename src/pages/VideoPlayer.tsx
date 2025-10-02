import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  SkipBack,
  SkipForward,
  ChevronLeft,
  X,
} from 'lucide-react';
import { mockAnime } from '../data/mockData';
import type { Anime, Episode } from '../data/mockData';

const VideoPlayer = () => {
  const { animeId, episodeNumber } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | undefined>(undefined);

  const [anime, setAnime] = useState<Anime | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState('1080p');
  const [showEpisodeList, setShowEpisodeList] = useState(false);

  useEffect(() => {
    const foundAnime = mockAnime.find((a) => a.id === Number(animeId));
    if (foundAnime) {
      setAnime(foundAnime);
      const episode = foundAnime.episodes.find(
        (e) => e.episodeNumber === Number(episodeNumber)
      );
      setCurrentEpisode(episode || foundAnime.episodes[0]);

      const savedPosition = localStorage.getItem(
        `video-${animeId}-${episodeNumber}`
      );
      if (savedPosition && videoRef.current) {
        videoRef.current.currentTime = Number(savedPosition);
      }
    }
  }, [animeId, episodeNumber]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  useEffect(() => {
    if (currentTime > 0 && animeId && episodeNumber) {
      localStorage.setItem(`video-${animeId}-${episodeNumber}`, String(currentTime));
    }

    if (duration > 0 && currentTime / duration > 0.9) {
      markAsWatched();
    }
  }, [currentTime, duration, animeId, episodeNumber]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          seek(-10);
          break;
        case 'ArrowRight':
          seek(10);
          break;
        case 'ArrowUp':
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          adjustVolume(-0.1);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const markAsWatched = () => {
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
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const adjustVolume = (delta: number) => {
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (newVolume > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
    if (vol > 0) setIsMuted(false);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const goToEpisode = (episodeNum: number) => {
    navigate(`/watch/${animeId}/${episodeNum}`);
    setShowEpisodeList(false);
  };

  const nextEpisode = () => {
    if (!anime || !currentEpisode) return;
    const nextEp = anime.episodes.find(
      (e) => e.episodeNumber === currentEpisode.episodeNumber + 1
    );
    if (nextEp) {
      goToEpisode(nextEp.episodeNumber);
    }
  };

  const previousEpisode = () => {
    if (!anime || !currentEpisode) return;
    const prevEp = anime.episodes.find(
      (e) => e.episodeNumber === currentEpisode.episodeNumber - 1
    );
    if (prevEp) {
      goToEpisode(prevEp.episodeNumber);
    }
  };

  if (!anime || !currentEpisode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-screen bg-black overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={currentEpisode.videoUrl}
        className="w-full h-full object-contain"
        onClick={togglePlay}
      />

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50 pointer-events-none"
          >
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-auto">
              <button
                onClick={() => navigate(`/anime/${animeId}`)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold">{anime.title}</h1>
                <p className="text-sm text-gray-300">{currentEpisode.title}</p>
              </div>
              <button
                onClick={() => setShowEpisodeList(!showEpisodeList)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 pointer-events-auto">
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={togglePlay} className="p-2 hover:bg-white/10 rounded-full">
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>

                  <button onClick={previousEpisode} className="p-2 hover:bg-white/10 rounded-full">
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button onClick={nextEpisode} className="p-2 hover:bg-white/10 rounded-full">
                    <SkipForward className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="p-2 hover:bg-white/10 rounded-full">
                      {isMuted || volume === 0 ? (
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
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                    />
                  </div>

                  <span className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-2 hover:bg-white/10 rounded-full"
                    >
                      <Settings className="w-5 h-5" />
                    </button>

                    {showSettings && (
                      <div className="absolute bottom-full right-0 mb-2 bg-dark-light border border-dark-lighter rounded-lg p-4 min-w-[200px] space-y-4">
                        <div>
                          <div className="text-sm font-semibold mb-2">Playback Speed</div>
                          <div className="grid grid-cols-3 gap-2">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                              <button
                                key={speed}
                                onClick={() => setPlaybackSpeed(speed)}
                                className={`px-3 py-1 rounded text-sm ${
                                  playbackSpeed === speed
                                    ? 'bg-primary'
                                    : 'bg-dark hover:bg-dark-lighter'
                                }`}
                              >
                                {speed}x
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-semibold mb-2">Quality</div>
                          <div className="grid grid-cols-2 gap-2">
                            {['360p', '480p', '720p', '1080p'].map((q) => (
                              <button
                                key={q}
                                onClick={() => setQuality(q)}
                                className={`px-3 py-1 rounded text-sm ${
                                  quality === q ? 'bg-primary' : 'bg-dark hover:bg-dark-lighter'
                                }`}
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-full">
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEpisodeList && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="lg:hidden absolute top-0 right-0 bottom-0 w-80 bg-dark-light border-l border-dark-lighter overflow-y-auto custom-scrollbar"
          >
            <div className="p-4 border-b border-dark-lighter flex items-center justify-between">
              <h3 className="font-semibold">Episodes</h3>
              <button
                onClick={() => setShowEpisodeList(false)}
                className="p-2 hover:bg-dark-lighter rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2">
              {anime.episodes.map((episode) => (
                <button
                  key={episode.id}
                  onClick={() => goToEpisode(episode.episodeNumber)}
                  className={`w-full p-3 rounded-lg text-left hover:bg-dark-lighter transition-colors ${
                    episode.episodeNumber === currentEpisode.episodeNumber ? 'bg-primary/20' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={episode.thumbnail}
                      alt={episode.title}
                      className="w-20 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{episode.title}</div>
                      <div className="text-xs text-gray-400">{episode.duration}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden lg:block absolute top-16 right-0 bottom-0 w-80 bg-dark-light/50 backdrop-blur-md border-l border-dark-lighter overflow-y-auto custom-scrollbar">
        <div className="p-4 border-b border-dark-lighter">
          <h3 className="font-semibold">Episodes</h3>
        </div>
        <div className="p-2">
          {anime.episodes.map((episode) => (
            <button
              key={episode.id}
              onClick={() => goToEpisode(episode.episodeNumber)}
              className={`w-full p-3 rounded-lg text-left hover:bg-dark-lighter transition-colors ${
                episode.episodeNumber === currentEpisode.episodeNumber ? 'bg-primary/20' : ''
              }`}
            >
              <div className="flex gap-3">
                <img
                  src={episode.thumbnail}
                  alt={episode.title}
                  className="w-20 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{episode.title}</div>
                  <div className="text-xs text-gray-400">{episode.duration}</div>
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
