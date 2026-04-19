import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill';
}

const Image = ({ src, alt, className = '', priority = false, objectFit = 'cover' }: ImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;

    const img = new window.Image();
    img.src = src;
    
    if (img.complete) {
      setIsLoaded(true);
      setCurrentSrc(src);
    } else {
      img.onload = () => {
        setIsLoaded(true);
        setCurrentSrc(src);
      };
    }
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-dark-lighter/20 ${className}`}>
      {/* Blurred Placeholder while loading */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-dark-lighter/30 backdrop-blur-2xl animate-pulse"
          />
        )}
      </AnimatePresence>

      {/* Main Image */}
      {currentSrc && (
        <motion.img
          src={currentSrc}
          alt={alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`w-full h-full object-${objectFit} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
        />
      )}
    </div>
  );
};

export default Image;
