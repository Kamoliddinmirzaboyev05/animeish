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
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Aniki" className="w-8 h-8" />
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                Aniki
              </div>
            </div>
            <div className="flex gap-4">
              <Link
                to="/login"
                className="px-6 py-2 hover:bg-white/10 rounded-full transition-colors"
              >
                Kirish
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-primary hover:bg-primary-dark rounded-full transition-colors"
              >
                Boshlash
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
                  Cheksiz
                  <br />
                  <span className="text-primary">Anime</span> Tomosha Qiling
                </h1>
                <p className="text-xl text-gray-300 mb-8">
                  Minglab anime seriallar va filmlarni tomosha qiling. Istalgan joyda, istalgan vaqtda.
                  Anime dunyosiga sayohatingizni bugun boshlang.
                </p>
                <div className="flex gap-4">
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-primary hover:bg-primary-dark rounded-full font-semibold text-lg flex items-center gap-2 transition-colors"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    Tomosha Boshlash
                  </Link>
                  <a
                    href="#features"
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full font-semibold text-lg transition-colors"
                  >
                    Batafsil
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div id="features" className="py-20 bg-dark-light">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Nega Aniki?</h2>
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
              <h3 className="text-xl font-bold mb-2">Katta Kutubxona</h3>
              <p className="text-gray-400">
                Klassikadan tortib eng yangi chiqarilganlargacha minglab anime serial va filmlar.
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
              <h3 className="text-xl font-bold mb-2">HD Sifat</h3>
              <p className="text-gray-400">
                Ajoyib 1080p sifatda tomosha qiling, internetingizga mos turli sifat tanlovlari bilan.
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
              <h3 className="text-xl font-bold mb-2">Birga Tomosha</h3>
              <p className="text-gray-400">
                Tomosha ro'yxatingizni yarating va barcha qurilmalarda jarayoningizni kuzatib boring.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="py-20 bg-dark">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Tomosha qilishga tayyormisiz?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Minglab anime muxlislari qatoriga qo'shilib, bugun sayohatingizni boshlang.
          </p>
          <Link
            to="/register"
            className="inline-block px-12 py-4 bg-primary hover:bg-primary-dark rounded-full font-semibold text-lg transition-colors"
          >
            Hoziroq Boshlash
          </Link>
        </div>
      </div>

      <footer className="hidden sm:block py-16 bg-dark-light border-t border-dark-lighter">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo va tavsif */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.svg" alt="Aniki" className="w-10 h-10" />
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  Aniki
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Eng yaxshi anime seriallar va filmlarni tomosha qiling. Yuqori sifat, tez yuklash va cheksiz zavq.
              </p>
              <div className="flex gap-4">
                {/* Telegram */}
                <a 
                  href="https://t.me/Anikiuz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-dark hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                  title="Telegram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
                
                {/* Instagram */}
                <a 
                  href="https://instagram.com/aniki.uz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-dark hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                  title="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a 
                  href="https://youtube.com/@aniki.uz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-dark hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                  title="YouTube"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* Twitter/X */}
                <a 
                  href="https://twitter.com/aniki_uz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-dark hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                  title="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Tezkor linklar */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Tezkor Linklar</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-primary transition-colors">Bosh sahifa</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Anime katalogi</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Yangi chiqarilganlar</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Top reytinglar</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Mening ro'yxatim</a></li>
              </ul>
            </div>

            {/* Yordam */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Yordam</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-primary transition-colors">Yordam markazi</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Bog'lanish</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Maxfiylik siyosati</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Foydalanish shartlari</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>

          {/* Pastki qism */}
          <div className="pt-8 border-t border-dark-lighter flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-center md:text-left">
              &copy; 2025 Aniki. Barcha huquqlar himoyalangan.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-primary transition-colors">Maxfiylik</a>
              <a href="#" className="hover:text-primary transition-colors">Shartlar</a>
              <a href="#" className="hover:text-primary transition-colors">Cookie-lar</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
