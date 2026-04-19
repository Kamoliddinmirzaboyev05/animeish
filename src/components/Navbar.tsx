import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, X, User, LogOut, Youtube, Instagram, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNotifications } from '../services/api';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      const isLoggedIn = localStorage.getItem('access_token');
      if (isLoggedIn) {
        try {
          const notifications = await getNotifications();
          const unreadCount = notifications.filter(n => !n.is_read).length;
          setUnreadNotifications(unreadCount);
        } catch (error) {
          console.error('Error loading notifications:', error);
        }
      }
    };

    loadNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const isLoggedIn = localStorage.getItem('access_token');

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-0 lg:px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 md:gap-3">
              <img src="/logo.svg" alt="Aniki" className="w-6 h-6 md:w-8 md:h-8" />
              <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                Aniki
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm hover:text-primary transition-colors">
                Bosh Sahifa
              </Link>
              <Link to="/search" className="text-sm hover:text-primary transition-colors">
                Qidirish
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link
                  to="/notifications"
                  className="relative p-2 hover:bg-dark-light rounded-full transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {unreadNotifications > 99 ? '99+' : unreadNotifications}
                    </span>
                  )}
                </Link>

                <div className="hidden md:block relative group">
                  <button className="flex items-center gap-2 p-2 hover:bg-dark-light rounded-full transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-56 bg-dark-light border border-dark-lighter rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="p-4 border-b border-dark-lighter">
                      <div className="text-sm font-medium text-white">Mening Hisobim</div>
                      <div className="text-xs text-gray-400 mt-1">Profilingizni boshqaring</div>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-dark-lighter transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Profil</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-lighter transition-colors text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Chiqish</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 hover:bg-dark-light rounded-full transition-colors text-sm"
                >
                  Kirish
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-full transition-colors text-sm"
                >
                  Ro'yxatdan o'tish
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-dark-light rounded-full transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[80%] max-w-sm bg-dark-light z-[70] shadow-2xl md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-dark-lighter">
                <div className="flex items-center gap-2">
                  <img src="/logo.svg" alt="Aniki" className="w-8 h-8" />
                  <span className="text-xl font-bold">Aniki</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-dark-lighter rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-3 px-4 hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                >
                  <span className="font-medium text-lg">Bosh Sahifa</span>
                </Link>
                <Link
                  to="/search"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-3 px-4 hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                >
                  <span className="font-medium text-lg">Qidirish</span>
                </Link>
                
                {isLoggedIn ? (
                  <>
                    <Link
                      to="/notifications"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between py-3 px-4 hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                    >
                      <span className="font-medium text-lg">Bildirishnomalar</span>
                      {unreadNotifications > 0 && (
                        <span className="w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {unreadNotifications > 99 ? '99+' : unreadNotifications}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-3 px-4 hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                    >
                      <span className="font-medium text-lg">Profil</span>
                    </Link>
                  </>
                ) : (
                  <div className="pt-4 space-y-3 px-4">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-3 text-center border border-primary/30 rounded-xl font-bold hover:bg-primary/10 transition-all"
                    >
                      Kirish
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-3 text-center bg-primary hover:bg-primary-dark rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                    >
                      Ro'yxatdan o'tish
                    </Link>
                  </div>
                )}

                {/* Social Media Section */}
                <div className="pt-8 mt-8 border-t border-dark-lighter px-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Biz ijtimoiy tarmoqlarda</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <a
                      href="https://t.me/Anikiuz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-3 bg-dark-lighter hover:bg-primary/10 hover:text-primary rounded-2xl transition-all group"
                    >
                      <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all">
                        <Send className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">Telegram</span>
                        <span className="text-xs text-gray-500">Eng so'nggi yangiliklar</span>
                      </div>
                    </a>
                    <a
                      href="https://instagram.com/anikiuz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-3 bg-dark-lighter hover:bg-primary/10 hover:text-primary rounded-2xl transition-all group"
                    >
                      <div className="w-10 h-10 bg-pink-500/10 text-pink-400 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all">
                        <Instagram className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">Instagram</span>
                        <span className="text-xs text-gray-400 font-medium">Foto va videolar</span>
                      </div>
                    </a>
                    <a
                      href="https://www.youtube.com/@Anikirasmiy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-3 bg-dark-lighter hover:bg-primary/10 hover:text-primary rounded-2xl transition-all group"
                    >
                      <div className="w-10 h-10 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all">
                        <Youtube className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">YouTube</span>
                        <span className="text-xs text-gray-400 font-medium">Rasmiy kanalimiz</span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              {isLoggedIn && (
                <div className="p-4 border-t border-dark-lighter">
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-3 py-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl font-bold transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    Chiqish
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
