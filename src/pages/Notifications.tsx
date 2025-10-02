import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, PlayCircle, Sparkles, AlertCircle, Check } from 'lucide-react';
import Navbar from '../components/Navbar';

type NotificationType = 'new-episode' | 'recommendation' | 'system';

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  animeId?: number;
  episodeNumber?: number;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'new-episode',
    title: 'New Episode Available',
    message: 'Attack on Titan - Episode 26 is now available to watch!',
    timestamp: Date.now() - 1000 * 60 * 30,
    read: false,
    animeId: 2,
    episodeNumber: 26,
  },
  {
    id: 2,
    type: 'new-episode',
    title: 'New Episode Available',
    message: 'My Hero Academia - Episode 26 is now available to watch!',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    read: false,
    animeId: 3,
    episodeNumber: 26,
  },
  {
    id: 3,
    type: 'recommendation',
    title: 'Recommended for You',
    message: 'Based on your watch history, you might like "Hunter x Hunter"',
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    read: true,
    animeId: 12,
  },
  {
    id: 4,
    type: 'system',
    title: 'New Features Available',
    message: 'We\'ve added new video quality options and playback speed controls!',
    timestamp: Date.now() - 1000 * 60 * 60 * 12,
    read: true,
  },
  {
    id: 5,
    type: 'new-episode',
    title: 'New Episode Available',
    message: 'Jujutsu Kaisen - Episode 25 is now available to watch!',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    read: true,
    animeId: 4,
    episodeNumber: 25,
  },
  {
    id: 6,
    type: 'recommendation',
    title: 'Recommended for You',
    message: 'You might enjoy "Steins;Gate" based on your preferences',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
    read: true,
    animeId: 11,
  },
  {
    id: 7,
    type: 'system',
    title: 'Maintenance Scheduled',
    message: 'Platform will be under maintenance on Jan 15, 2024 from 2-4 AM',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
    read: true,
  },
  {
    id: 8,
    type: 'new-episode',
    title: 'New Episode Available',
    message: 'Demon Slayer - Episode 27 is now available to watch!',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 4,
    read: true,
    animeId: 1,
    episodeNumber: 27,
  },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'new-episode':
        return <PlayCircle className="w-5 h-5 text-primary" />;
      case 'recommendation':
        return <Sparkles className="w-5 h-5 text-yellow-500" />;
      case 'system':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredNotifications = notifications.filter(
    (notif) => filter === 'all' || notif.type === filter
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Notifications</h1>
              <p className="text-gray-400">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-primary rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Mark all as read
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-dark-light hover:bg-dark-lighter'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('new-episode')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filter === 'new-episode'
                  ? 'bg-primary text-white'
                  : 'bg-dark-light hover:bg-dark-lighter'
              }`}
            >
              New Episodes
            </button>
            <button
              onClick={() => setFilter('recommendation')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filter === 'recommendation'
                  ? 'bg-primary text-white'
                  : 'bg-dark-light hover:bg-dark-lighter'
              }`}
            >
              Recommendations
            </button>
            <button
              onClick={() => setFilter('system')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filter === 'system'
                  ? 'bg-primary text-white'
                  : 'bg-dark-light hover:bg-dark-lighter'
              }`}
            >
              System Updates
            </button>
          </div>
        </motion.div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.animeId && notification.episodeNumber) {
                    window.location.href = `/watch/${notification.animeId}/${notification.episodeNumber}`;
                  } else if (notification.animeId) {
                    window.location.href = `/anime/${notification.animeId}`;
                  }
                }}
                className={`relative p-4 rounded-lg border transition-all cursor-pointer ${
                  notification.read
                    ? 'bg-dark-light border-dark-lighter hover:bg-dark-lighter'
                    : 'bg-primary/10 border-primary/30 hover:bg-primary/15'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-dark-light rounded-full flex items-center justify-center">
                    {getIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold">{notification.title}</h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{notification.message}</p>
                  </div>

                  {!notification.read && (
                    <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredNotifications.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-24 h-24 bg-dark-light rounded-full flex items-center justify-center mb-6">
                <Bell className="w-12 h-12 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No notifications</h2>
              <p className="text-gray-400">
                You don't have any {filter !== 'all' ? filter.replace('-', ' ') : ''} notifications
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
