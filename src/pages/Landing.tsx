import { Link } from 'react-router-dom';
import { Play, Star, Users, Tv } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  return (
    <div className="min-h-screen">
      <div className="relative h-screen">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&h=1080&fit=crop"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/80 to-dark/40" />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <nav className="flex items-center justify-between px-8 py-6">
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Animeish
            </div>
            <div className="flex gap-4">
              <Link
                to="/login"
                className="px-6 py-2 hover:bg-white/10 rounded-full transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-primary hover:bg-primary-dark rounded-full transition-colors"
              >
                Get Started
              </Link>
            </div>
          </nav>

          <div className="flex-1 flex items-center">
            <div className="max-w-7xl mx-auto px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl"
              >
                <h1 className="text-6xl md:text-7xl font-bold mb-6">
                  Watch Unlimited
                  <br />
                  <span className="text-primary">Anime</span>
                </h1>
                <p className="text-xl text-gray-300 mb-8">
                  Stream thousands of anime series and movies. Watch anywhere, anytime.
                  Start your journey into the world of anime today.
                </p>
                <div className="flex gap-4">
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-primary hover:bg-primary-dark rounded-full font-semibold text-lg flex items-center gap-2 transition-colors"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    Start Watching
                  </Link>
                  <a
                    href="#features"
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full font-semibold text-lg transition-colors"
                  >
                    Learn More
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div id="features" className="py-20 bg-dark-light">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose Animeish?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-dark p-8 rounded-2xl border border-dark-lighter hover:border-primary transition-colors"
            >
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Tv className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Huge Library</h3>
              <p className="text-gray-400">
                Access thousands of anime series and movies from classics to the latest releases.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-dark p-8 rounded-2xl border border-dark-lighter hover:border-primary transition-colors"
            >
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">HD Quality</h3>
              <p className="text-gray-400">
                Watch in stunning 1080p with multiple quality options for your connection.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-dark p-8 rounded-2xl border border-dark-lighter hover:border-primary transition-colors"
            >
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Watch Together</h3>
              <p className="text-gray-400">
                Create your watchlist and track your progress across all devices.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="py-20 bg-dark">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to start watching?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of anime fans and start your journey today.
          </p>
          <Link
            to="/register"
            className="inline-block px-12 py-4 bg-primary hover:bg-primary-dark rounded-full font-semibold text-lg transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </div>

      <footer className="py-8 bg-dark-light border-t border-dark-lighter">
        <div className="max-w-7xl mx-auto px-8 text-center text-gray-400">
          <p>&copy; 2025 Animeish. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
