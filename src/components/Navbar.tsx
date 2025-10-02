import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

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
              {isLoggedIn && (
                <Link to="/my-list" className="text-sm hover:text-primary transition-colors">
                  Mening Ro'yxatim
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Anime qidirish..."
                  className="bg-dark-light border border-dark-lighter rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors w-64"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </form>

            {isLoggedIn ? (
              <>
                <Link
                  to="/notifications"
                  className="relative p-2 hover:bg-dark-light rounded-full transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-dark-light rounded-full transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-light border-t border-dark-lighter"
          >
            <div className="px-4 py-2 space-y-2">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Anime qidirish..."
                    className="bg-dark border border-dark-lighter rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors w-full"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </form>

              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 hover:text-primary transition-colors border-b border-dark-lighter"
              >
                Bosh Sahifa
              </Link>
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 hover:text-primary transition-colors border-b border-dark-lighter"
              >
                Qidirish
              </Link>
              
              {isLoggedIn ? (
                <>
                  <Link
                    to="/my-list"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 hover:text-primary transition-colors border-b border-dark-lighter"
                  >
                    Mening Ro'yxatim
                  </Link>
                  <Link
                    to="/notifications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 hover:text-primary transition-colors border-b border-dark-lighter"
                  >
                    Bildirishnomalar
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 hover:text-primary transition-colors border-b border-dark-lighter"
                  >
                    Profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left py-3 text-red-400 flex items-center gap-2 border-b border-dark-lighter"
                  >
                    <LogOut className="w-4 h-4" />
                    Chiqish
                  </button>
                </>
              ) : (
                <div className="pt-4 space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-3 text-center border border-primary rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    Kirish
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-3 text-center bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                  >
                    Ro'yxatdan o'tish
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
