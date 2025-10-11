import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send } from 'lucide-react';
import { addRating } from '../services/api';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  animeId: number;
  animeTitle: string;
  onRatingSubmitted?: () => void;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

const RatingModal = ({ isOpen, onClose, animeId, animeTitle, onRatingSubmitted, onShowToast }: RatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Iltimos, reyting bering');
      return;
    }

    // Izoh ixtiyoriy - faqat reyting majburiy

    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      console.log('🎯 Submitting rating:', {
        movie_id: animeId,
        score: rating,
        comment: comment.trim()
      });
      
      // Check if user is logged in
      const token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('user');
      console.log('🔐 Auth status:', {
        hasToken: !!token,
        hasUser: !!userStr,
        user: userStr ? JSON.parse(userStr) : null
      });
      
      await addRating({
        movie_id: animeId,
        score: rating,
        comment: comment.trim() || '' // Bo'sh izoh ham ruxsat etiladi
      });

      setSuccess(true);
      
      // Show success message
      if (onShowToast) {
        onShowToast('Reyting va izoh muvaffaqiyatli yuborildi!', 'success');
      }
      
      // Call callback if provided
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
      
      // Close modal after a short delay to show success state
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      
      // Handle different error types
      if (error.errors) {
        if (error.errors.movie_id) {
          setError('Noto\'g\'ri anime ID');
        } else if (error.errors.score) {
          setError('Noto\'g\'ri reyting qiymati');
        } else if (error.errors.comment) {
          setError('Izoh juda qisqa yoki juda uzun');
        } else {
          setError(error.message || 'Reyting yuborishda xatolik yuz berdi');
        }
      } else {
        setError(error.message || 'Reyting yuborishda xatolik yuz berdi');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setHoveredRating(0);
      setComment('');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 && !isSubmitting) {
                handleClose();
              }
            }}
            className="relative bg-dark border border-dark-lighter rounded-t-xl sm:rounded-xl p-4 sm:p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto"
          >
            {/* Mobile drag indicator */}
            <div className="sm:hidden w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4"></div>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold">
                {success ? 'Muvaffaqiyatli yuborildi!' : 'Baholash va Izoh'}
              </h2>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-2 hover:bg-dark-light rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-gray-300 mb-2 text-sm sm:text-base line-clamp-2">{animeTitle}</h3>
            </div>

            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-green-400 mb-2">Reyting yuborildi!</h3>
                <p className="text-gray-400 text-sm">
                  Sizning {rating}/5 reytingingiz va izohingiz muvaffaqiyatli saqlandi.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3 text-center sm:text-left">
                    Reyting <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        disabled={isSubmitting}
                        className="p-2 sm:p-1 transition-transform hover:scale-110 active:scale-95 disabled:cursor-not-allowed"
                      >
                        <Star
                          className={`w-8 h-8 sm:w-6 sm:h-6 transition-colors ${
                            star <= (hoveredRating || rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-sm text-gray-400">
                      {rating > 0 ? `${rating}/5` : 'Reyting tanlang'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    1 - Yomon, 5 - Mukammal
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Izoh <span className="text-gray-500">(ixtiyoriy)</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Bu anime haqida fikringizni yozing... (ixtiyoriy)"
                    rows={3}
                    maxLength={500}
                    disabled={isSubmitting}
                    className="w-full bg-dark-light border border-dark-lighter rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors resize-none disabled:opacity-50 text-sm sm:text-base"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      Izoh yozish ixtiyoriy
                    </p>
                    <span className="text-xs text-gray-500">
                      {comment.length}/500
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3 flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 sm:py-2 bg-dark-light border border-dark-lighter rounded-lg hover:bg-dark-lighter transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    className="flex-1 px-4 py-3 sm:py-2 bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="hidden sm:inline">Yuborilmoqda...</span>
                        <span className="sm:hidden">Yuborilmoqda</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">Baholash</span>
                        <span className="sm:hidden">Yuborish</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RatingModal;