import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, X, User, LogOut, Youtube, Instagram, Send, Home, Search, Heart } from 'lucide-react';
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
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled 
            ? 'bg-dark/95 backdrop-blur-md border-white/5 shadow-lg h-16 md:h-20' 
            : 'bg-transparent border-transparent h-20 md:h-24'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-4 md:gap-12">
              <Link to="/" className="flex items-center gap-2 md:gap-3 shrink-0 group">
                <div className="relative">
                  <img src="/logo.svg" alt="Aniki" className="w-8 h-8 md:w-10 md:h-10 transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  Aniki
                </div>
              </Link>

              <div className="hidden md:flex items-center gap-8">
                <Link to="/" className="text-sm font-medium hover:text-primary transition-colors relative group">
                  Bosh Sahifa
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
                <Link to="/search" className="text-sm font-medium hover:text-primary transition-colors relative group">
                  Qidirish
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-4">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/notifications"
                    className="relative p-2.5 hover:bg-white/5 rounded-full transition-all group"
                  >
                    <Bell className="w-5 h-5 text-gray-300 group-hover:text-primary" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold ring-2 ring-dark">
                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                      </span>
                    )}
                  </Link>

                  <div className="hidden md:block relative group">
                    <button className="flex items-center gap-2 p-1 hover:bg-white/5 rounded-full transition-all border border-transparent hover:border-white/10">
                      <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-64 bg-dark-light/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="p-5 border-b border-white/5">
                        <div className="text-sm font-bold text-white">Mening Hisobim</div>
                        <div className="text-xs text-gray-400 mt-1">Profilingizni boshqaring</div>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-primary/10 hover:text-primary rounded-xl transition-all group/item"
                        >
                          <User className="w-4 h-4 text-gray-400 group-hover/item:text-primary" />
                          <span className="font-medium">Profil</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all group/item text-red-400"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="font-medium">Chiqish</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-5 py-2.5 hover:bg-white/5 rounded-full transition-all text-sm font-medium border border-transparent hover:border-white/10"
                  >
                    Kirish
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2.5 bg-primary hover:bg-primary-dark rounded-full transition-all text-sm font-bold shadow-lg shadow-primary/20"
                  >
                    Ro'yxatdan o'tish
                  </Link>
                </div>
              )}

              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2.5 hover:bg-white/5 rounded-full transition-all"
              >
                <Menu className="w-6 h-6 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay - Outside of nav to avoid its transparency/styles */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Sidebar Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-dark-light shadow-2xl border-l border-white/5 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <img src="/logo.svg" alt="Aniki" className="w-8 h-8" />
                  <span className="text-xl font-bold">Aniki</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-all"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-2">
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 py-3.5 px-4 hover:bg-primary/10 hover:text-primary rounded-xl transition-all group"
                  >
                    <div className="w-10 h-10 bg-dark-lighter rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Home className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg">Bosh Sahifa</span>
                  </Link>
                  <Link
                    to="/search"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 py-3.5 px-4 hover:bg-primary/10 hover:text-primary rounded-xl transition-all group"
                  >
                    <div className="w-10 h-10 bg-dark-lighter rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Search className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg">Qidirish</span>
                  </Link>
                  
                  {isLoggedIn && (
                    <>
                      <Link
                        to="/my-list"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-4 py-3.5 px-4 hover:bg-primary/10 hover:text-primary rounded-xl transition-all group"
                      >
                        <div className="w-10 h-10 bg-dark-lighter rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Heart className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg">Mening Ro'yxatim</span>
                      </Link>
                      <Link
                        to="/notifications"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between py-3.5 px-4 hover:bg-primary/10 hover:text-primary rounded-xl transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-dark-lighter rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Bell className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-lg">Bildirishnomalar</span>
                        </div>
                        {unreadNotifications > 0 && (
                          <span className="w-6 h-6 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                            {unreadNotifications > 99 ? '99+' : unreadNotifications}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-4 py-3.5 px-4 hover:bg-primary/10 hover:text-primary rounded-xl transition-all group"
                      >
                        <div className="w-10 h-10 bg-dark-lighter rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <User className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg">Profil</span>
                      </Link>
                    </>
                  )}
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 px-4">Bizning ijtimoiy tarmoqlar</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <a
                      href="https://t.me/Anikiuz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-dark-lighter hover:bg-primary/10 hover:text-primary rounded-2xl transition-all group"
                    >
                      <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-all">
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
                      className="flex items-center gap-4 p-4 bg-dark-lighter hover:bg-primary/10 hover:text-primary rounded-2xl transition-all group"
                    >
                      <div className="w-10 h-10 bg-pink-500/20 text-pink-400 rounded-xl flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-all">
                        <Instagram className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">Instagram</span>
                        <span className="text-xs text-gray-500">Foto va videolar</span>
                      </div>
                    </a>
                    <a
                      href="https://www.youtube.com/@Anikirasmiy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-dark-lighter hover:bg-primary/10 hover:text-primary rounded-2xl transition-all group"
                    >
                      <div className="w-10 h-10 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-all">
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

              <div className="p-6 bg-dark-lighter/50 border-t border-white/5">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-2xl font-bold transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    Chiqish
                  </button>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-4 text-center border border-primary/30 rounded-2xl font-bold hover:bg-primary/10 transition-all"
                    >
                      Kirish
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-4 text-center bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 rounded-2xl font-bold transition-all"
                    >
                      Ro'yxatdan o'tish
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
