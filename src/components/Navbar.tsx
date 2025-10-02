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
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/home" className="flex items-center gap-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                Animeish
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/home" className="text-sm hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/search" className="text-sm hover:text-primary transition-colors">
                Browse
              </Link>
              <Link to="/my-list" className="text-sm hover:text-primary transition-colors">
                My List
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search anime..."
                  className="bg-dark-light border border-dark-lighter rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors w-64"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </form>

            <Link
              to="/notifications"
              className="relative p-2 hover:bg-dark-light rounded-full transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </Link>

            <div className="hidden md:block relative group">
              <button className="flex items-center gap-2 p-2 hover:bg-dark-light rounded-full transition-colors">
                <User className="w-5 h-5" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-dark-light border border-dark-lighter rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link
                  to="/profile"
                  className="block px-4 py-3 hover:bg-dark-lighter transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-dark-lighter transition-colors flex items-center gap-2 text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>

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
            <div className="px-4 py-4 space-y-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search anime..."
                    className="bg-dark border border-dark-lighter rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors w-full"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </form>

              <Link
                to="/home"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 hover:text-primary transition-colors"
              >
                Browse
              </Link>
              <Link
                to="/my-list"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 hover:text-primary transition-colors"
              >
                My List
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 hover:text-primary transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 text-red-400 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
