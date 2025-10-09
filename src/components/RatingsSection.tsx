import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, User, ChevronDown, ChevronUp } from 'lucide-react';

interface Rating {
  id: number;
  score: number;
  comment: string;
  created_at: string;
  user: string; // email/username
  first_name: string; // user's first name
  is_comment: boolean;
}

interface RatingsSectionProps {
  ratings: Rating[];
  averageRating: number;
  ratingsCount: number;
  onAddRating?: () => void;
  loading?: boolean;
  userRating?: any;
}

const RatingsSection = ({ ratings, averageRating, ratingsCount, onAddRating, loading = false, userRating }: RatingsSectionProps) => {
  const [showAllRatings, setShowAllRatings] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  const isLoggedIn = localStorage.getItem('access_token');

  // Sort ratings based on selected option
  const sortedRatings = [...ratings].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'highest':
        return b.score - a.score;
      case 'lowest':
        return a.score - b.score;
      default:
        return 0;
    }
  });

  const displayedRatings = showAllRatings ? sortedRatings : sortedRatings.slice(0, 5);

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = ratings.filter(r => r.score === star).length;
    const percentage = ratingsCount > 0 ? (count / ratingsCount) * 100 : 0;
    return { star, count, percentage };
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return 'Hozir';
      if (diffMinutes < 60) return `${diffMinutes} daqiqa oldin`;
      if (diffHours < 24) return `${diffHours} soat oldin`;
      if (diffDays === 1) return 'Kecha';
      if (diffDays < 7) return `${diffDays} kun oldin`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} hafta oldin`;
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} oy oldin`;
      
      // For older dates, show the actual date
      return date.toLocaleDateString('uz-UZ', {
        day: 'numeric',
        month: 'long',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      return 'Noma\'lum sana';
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-dark-light border border-dark-lighter rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h2 className="text-lg sm:text-xl font-bold">Reytinglar va Izohlar</h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="h-12 bg-dark rounded"></div>
              <div className="h-6 bg-dark rounded w-3/4"></div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-4 bg-dark rounded"></div>
                  <div className="flex-1 h-2 bg-dark rounded"></div>
                  <div className="w-8 h-4 bg-dark rounded"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-dark border border-dark-lighter rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-dark rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-dark rounded w-1/4"></div>
                    <div className="h-4 bg-dark rounded w-1/3"></div>
                    <div className="h-16 bg-dark rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-light border border-dark-lighter rounded-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h2 className="text-lg sm:text-xl font-bold">Reytinglar va Izohlar</h2>
        </div>
        {isLoggedIn && onAddRating && (
          <button
            onClick={onAddRating}
            disabled={!!userRating}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium w-full sm:w-auto flex items-center gap-2 ${
              userRating
                ? 'bg-green-500/20 text-green-400 cursor-not-allowed opacity-75'
                : 'bg-primary hover:bg-primary-dark'
            }`}
            title={userRating ? `Siz ${userRating.score}/5 reyting bergansiz` : 'Baholash'}
          >
            {userRating ? (
              <>
                <Star className="w-4 h-4 fill-current" />
                {userRating.score}/5 Berilgan
              </>
            ) : (
              'Baholash'
            )}
          </button>
        )}
      </div>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Average Rating */}
        <div className="text-center lg:text-left">
          <div className="flex flex-col items-center lg:items-start gap-2">
            <div className="text-3xl sm:text-4xl font-bold text-primary">
              {averageRating.toFixed(1)}
            </div>
            {renderStars(Math.round(averageRating), 'lg')}
            <p className="text-gray-400 text-sm">
              {ratingsCount} ta reyting asosida
            </p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12">
                <span className="text-sm">{star}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="flex-1 bg-dark rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-400 w-8">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ratings List */}
      {ratings.length > 0 ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h3 className="text-base sm:text-lg font-semibold">
              Barcha Izohlar ({ratingsCount})
            </h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-dark border border-dark-lighter rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary w-full sm:w-auto"
            >
              <option value="newest">Eng yangi</option>
              <option value="oldest">Eng eski</option>
              <option value="highest">Yuqori reyting</option>
              <option value="lowest">Past reyting</option>
            </select>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {displayedRatings.map((rating, index) => (
                <motion.div
                  key={rating.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-dark border border-dark-lighter rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-2 mb-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">
                            {rating.first_name || 'Anonim'}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatDate(rating.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(rating.score)}
                          <span className="text-sm text-gray-400">
                            {rating.score}/5
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {rating.comment}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {ratings.length > 5 && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowAllRatings(!showAllRatings)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-dark border border-dark-lighter rounded-lg hover:bg-dark-lighter transition-colors text-sm"
              >
                {showAllRatings ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Kamroq ko'rsatish
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Barcha izohlarni ko'rish ({ratings.length - 5} ta qolgan)
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">Hali izohlar yo'q</p>
          <p className="text-sm">
            Birinchi bo'lib fikringizni bildiring!
          </p>
          {isLoggedIn && onAddRating && (
            <button
              onClick={onAddRating}
              className="mt-4 px-6 py-3 bg-primary rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              Birinchi Baholash
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RatingsSection;