import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, PlayCircle, AlertCircle, Check, RefreshCw, ChevronLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, type Notification } from '../services/api';
import { useNavigate } from 'react-router-dom';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const success = await markNotificationAsRead(id);
      if (success) {
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === id ? { ...notif, is_read: true } : notif))
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setIsMarkingAllRead(true);
      const success = await markAllNotificationsAsRead();
      if (success) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'success':
        return <PlayCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const formatTimestamp = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 1000 / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (minutes < 1) return 'Hozir';
      if (minutes < 60) return `${minutes} daqiqa oldin`;
      if (hours < 24) return `${hours} soat oldin`;
      if (days < 7) return `${days} kun oldin`;
      
      return date.toLocaleDateString('uz-UZ', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      return 'Noma\'lum vaqt';
    }
  };

  const filteredNotifications = notifications.filter(
    (notif) => filter === 'all' || notif.type === filter
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-20 sm:pt-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Orqaga</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Bildirishnomalar</h1>
              <p className="text-gray-400 text-sm sm:text-base">
                {unreadCount > 0 ? `${unreadCount} ta o'qilmagan bildirishnoma` : 'Hammasi o\'qilgan!'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadNotifications}
                disabled={isLoading}
                className="px-3 py-2 bg-dark-light rounded-lg hover:bg-dark-lighter transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Yangilash</span>
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={isMarkingAllRead}
                  className="px-3 sm:px-4 py-2 bg-primary rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
                >
                  {isMarkingAllRead ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Barchasini O'qilgan Deb Belgilash</span>
                  <span className="sm:hidden">Hammasi O'qilgan</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm sm:text-base ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-dark-light hover:bg-dark-lighter'
              }`}
            >
              Barchasi
            </button>
            <button
              onClick={() => setFilter('info')}
              className={`px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm sm:text-base ${
                filter === 'info'
                  ? 'bg-primary text-white'
                  : 'bg-dark-light hover:bg-dark-lighter'
              }`}
            >
              Ma'lumot
            </button>
            <button
              onClick={() => setFilter('success')}
              className={`px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm sm:text-base ${
                filter === 'success'
                  ? 'bg-primary text-white'
                  : 'bg-dark-light hover:bg-dark-lighter'
              }`}
            >
              Muvaffaqiyat
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm sm:text-base ${
                filter === 'warning'
                  ? 'bg-primary text-white'
                  : 'bg-dark-light hover:bg-dark-lighter'
              }`}
            >
              Ogohlantirish
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm sm:text-base ${
                filter === 'error'
                  ? 'bg-primary text-white'
                  : 'bg-dark-light hover:bg-dark-lighter'
              }`}
            >
              Xatolik
            </button>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-gray-600 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
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
                    if (notification.anime_id && notification.episode_number) {
                      navigate(`/watch/${notification.anime_id}/${notification.episode_number}`);
                    } else if (notification.anime_id) {
                      navigate(`/anime/${notification.anime_id}`);
                    }
                  }}
                  className={`relative p-3 sm:p-4 rounded-lg border transition-all cursor-pointer ${
                    notification.is_read
                      ? 'bg-dark-light border-dark-lighter hover:bg-dark-lighter'
                      : 'bg-primary/10 border-primary/30 hover:bg-primary/15'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-dark-light rounded-full flex items-center justify-center">
                      {getIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm sm:text-base">{notification.title}</h3>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatTimestamp(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{notification.message}</p>
                    </div>

                    {!notification.is_read && (
                      <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-1"></div>
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
              <h2 className="text-2xl font-bold mb-2">Bildirishnomalar yo'q</h2>
              <p className="text-gray-400">
                Sizda {filter !== 'all' ? `${filter} turi` : ''} bildirishnomalari yo'q
              </p>
            </motion.div>
          )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
