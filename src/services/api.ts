const API_BASE_URL = 'https://api.aniki.uz';
console.log('🔧 API_BASE_URL configured as:', API_BASE_URL);

// Simple in-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Cache helper functions
const getCacheKey = (url: string, params?: any): string => {
  return params ? `${url}?${JSON.stringify(params)}` : url;
};

const setCache = (key: string, data: any, ttlMinutes: number = 5): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMinutes * 60 * 1000
  });
};

const getCache = (key: string): any | null => {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > cached.ttl) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
};

// Cache invalidation helper
const invalidateCache = (pattern: string): void => {
  const keysToDelete: string[] = [];
  cache.forEach((_, key) => {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => cache.delete(key));
};

// Enhanced fetch with caching
const cachedFetch = async (url: string, options?: RequestInit, cacheMinutes: number = 5): Promise<Response> => {
  const cacheKey = getCacheKey(url, options?.body);
  
  // Only cache GET requests
  if (!options?.method || options.method === 'GET') {
    const cached = getCache(cacheKey);
    if (cached) {
  
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  const response = await fetch(url, options);
  
  // Cache successful GET responses
  if (response.ok && (!options?.method || options.method === 'GET')) {
    const data = await response.clone().json();
    setCache(cacheKey, data, cacheMinutes);
  }
  
  return response;
};

export interface VideoData {
    id: string;
    videoUrl: string;
}

export interface RegisterData {
    first_name: string;
    email: string;
    password: string;
    confirm_password: string;
}

export interface OTPData {
    email: string;
}

export interface VerifyOTPData {
    email: string;
    code: string;
}

export interface RegisterWithOTPData {
    email: string;
    code: number;
    first_name: string;
    password: string;
    confirm_password: string;
}

export const verifyOTP = async (verifyData: VerifyOTPData): Promise<AuthResponse> => {
    try {
        console.log('Verifying OTP:', verifyData);

        const response = await fetch(`${API_BASE_URL}/verify-otp/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(verifyData),
        });

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            // If response is not JSON (like HTML error page), handle it
            console.error('Failed to parse response as JSON:', parseError);
            throw {
                message: response.status === 500 ? 'Server xatosi. Iltimos, keyinroq urinib ko\'ring.' : 'Noto\'g\'ri javob formati',
                errors: {},
            } as ApiError;
        }

        console.log('OTP verification response:', { status: response.status, data });

        if (!response.ok) {
            throw {
                message: data.message || data.error || 'OTP verification failed',
                errors: data,
            } as ApiError;
        }

        // If verification successful and token is returned, store it
        if (data.access) {
            storeAuthData(data);
        }

        return data;
    } catch (error) {
        console.error('OTP verification error:', error);
        throw error;
    }
};

export const registerWithOTP = async (registerData: RegisterWithOTPData): Promise<AuthResponse> => {
    try {
        console.log('Registering with OTP:', registerData);

        const response = await fetch(`${API_BASE_URL}/verify-otp/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData),
        });

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            console.error('Failed to parse registration response as JSON:', parseError);
            throw {
                message: response.status === 500 ? 'Server xatosi. Iltimos, keyinroq urinib ko\'ring.' : 'Noto\'g\'ri javob formati',
                errors: {},
            } as ApiError;
        }

        console.log('Registration response:', { status: response.status, data });

        if (!response.ok) {
            // Handle different error response formats
            let errorMessage = 'Ro\'yxatdan o\'tishda xatolik';
            
            if (data.error) {
                errorMessage = data.error;
            } else if (data.message) {
                errorMessage = data.message;
            } else if (data.code && Array.isArray(data.code)) {
                errorMessage = data.code[0];
            } else if (data.first_name && Array.isArray(data.first_name)) {
                errorMessage = data.first_name[0];
            } else if (data.password && Array.isArray(data.password)) {
                errorMessage = data.password[0];
            }
            
            throw {
                message: errorMessage,
                errors: data,
            } as ApiError;
        }

        // If registration successful and token is returned, store it
        if (data.access) {
            storeAuthData(data);
        }

        return data;
    } catch (error) {
        console.error('Registration with OTP error:', error);
        throw error;
    }
};

export interface LoginData {
    username: string;
    password: string;
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user?: {
        id: number;
        email: string;
        first_name: string;
    };
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

export interface UserProfile {
    id: number;
    first_name: string;
    username: string;
    email: string;
    is_premium: boolean;
    created_at: string;
    progress: {
        watched_episodes_count: number;
        total_watched_hours: number;
    };
}

export interface Bookmark {
    id: number;
    movie: {
        id: number;
        title: string;
        slug: string;
        poster: string;
        description: string;
        rating_avg: number;
        release_year: number;
        genres: Array<{ id: number; name: string }>;
        type: string;
        episodes: any[];
    };
    created_at: string;
}

export interface RatingData {
    movie_id: number;
    score: number;
    comment?: string | null;
}

export interface RatingResponse {
    id: number;
    movie_id: number;
    score: number;
    comment: string;
    created_at: string;
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    is_read: boolean;
    created_at: string;
    anime_id?: number;
    episode_number?: number;
}

// Authentication functions
export const sendOTP = async (otpData: OTPData): Promise<{ message: string }> => {
    try {
        console.log('Sending OTP to email:', otpData.email);

        const response = await fetch(`${API_BASE_URL}/send-otp/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(otpData),
        });

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            console.error('Failed to parse OTP response as JSON:', parseError);
            throw {
                message: response.status === 500 ? 'Server xatosi. Iltimos, keyinroq urinib ko\'ring.' : 'Noto\'g\'ri javob formati',
                errors: {},
            } as ApiError;
        }

        console.log('OTP response:', { status: response.status, data });

        if (!response.ok) {
            // Handle different error response formats
            let errorMessage = 'OTP yuborishda xatolik';
            
            if (data.error) {
                errorMessage = data.error;
            } else if (data.message) {
                errorMessage = data.message;
            } else if (data.email && Array.isArray(data.email)) {
                errorMessage = data.email[0];
            }
            
            throw {
                message: errorMessage,
                errors: data,
            } as ApiError;
        }

        return data;
    } catch (error) {
        console.error('OTP sending error:', error);
        throw error;
    }
};

export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
    try {
        console.log('Registering user with data:', userData);

        const response = await fetch(`${API_BASE_URL}/users/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        console.log('Registration response:', { status: response.status, data });

        if (!response.ok) {
            // Handle different error response formats
            let errorMessage = 'Ro\'yxatdan o\'tishda xatolik';
            
            if (data.error) {
                errorMessage = data.error;
            } else if (data.message) {
                errorMessage = data.message;
            } else if (data.email && Array.isArray(data.email)) {
                errorMessage = data.email[0];
            } else if (data.first_name && Array.isArray(data.first_name)) {
                errorMessage = data.first_name[0];
            } else if (data.password && Array.isArray(data.password)) {
                errorMessage = data.password[0];
            }
            
            throw {
                message: errorMessage,
                errors: data,
            } as ApiError;
        }

        return data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

export const loginUser = async (loginData: LoginData): Promise<AuthResponse> => {
    try {
        console.log('Logging in user with data:', loginData);

        const response = await fetch(`${API_BASE_URL}/token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        const data = await response.json();
        console.log('Login response:', { status: response.status, data });

        if (!response.ok) {
            throw {
                message: 'Login failed',
                errors: data,
            } as ApiError;
        }

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Helper function to store auth data
export const storeAuthData = (authData: AuthResponse) => {
    localStorage.setItem('access_token', authData.access);
    localStorage.setItem('refresh_token', authData.refresh);
    if (authData.user) {
        localStorage.setItem('user', JSON.stringify(authData.user));
    }
};

// Helper function to get stored auth data
export const getAuthToken = (): string | null => {
    return localStorage.getItem('access_token');
};

// Helper function to clear auth data
export const clearAuthData = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
};

// Password reset interfaces
export interface PasswordResetRequestData {
    email: string;
}

export interface PasswordResetConfirmData {
    email: string;
    code: string;
    new_password: string;
}

// Password reset functions
export const requestPasswordReset = async (data: PasswordResetRequestData): Promise<{ message: string }> => {
    try {
        console.log('Requesting password reset for email:', data.email);

        const response = await fetch(`${API_BASE_URL}/password-reset/request/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        let responseData;
        try {
            responseData = await response.json();
        } catch (parseError) {
            console.error('Failed to parse password reset response as JSON:', parseError);
            throw {
                message: response.status === 500 ? 'Server xatosi. Iltimos, keyinroq urinib ko\'ring.' : 'Noto\'g\'ri javob formati',
                errors: {},
            } as ApiError;
        }

        console.log('Password reset request response:', { status: response.status, data: responseData });

        if (!response.ok) {
            throw {
                message: responseData.message || responseData.error || 'Parol tiklash so\'rovini yuborishda xatolik',
                errors: responseData,
            } as ApiError;
        }

        return responseData;
    } catch (error) {
        console.error('Password reset request error:', error);
        throw error;
    }
};

export const confirmPasswordReset = async (data: PasswordResetConfirmData): Promise<{ message: string }> => {
    try {
        console.log('Confirming password reset:', { email: data.email, code: data.code });

        const response = await fetch(`${API_BASE_URL}/password-reset/confirm/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        let responseData;
        try {
            responseData = await response.json();
        } catch (parseError) {
            console.error('Failed to parse password reset confirm response as JSON:', parseError);
            throw {
                message: response.status === 500 ? 'Server xatosi. Iltimos, keyinroq urinib ko\'ring.' : 'Noto\'g\'ri javob formati',
                errors: {},
            } as ApiError;
        }

        console.log('Password reset confirm response:', { status: response.status, data: responseData });

        if (!response.ok) {
            throw {
                message: responseData.message || responseData.error || 'Parolni tiklashda xatolik',
                errors: responseData,
            } as ApiError;
        }

        return responseData;
    } catch (error) {
        console.error('Password reset confirm error:', error);
        throw error;
    }
};

// User profile functions
export const getUserProfile = async (): Promise<UserProfile> => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No access token found');
        }

        console.log('Fetching user profile...');

        const response = await fetch(`${API_BASE_URL}/user/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        console.log('Profile response:', { status: response.status, data });

        if (!response.ok) {
            throw {
                message: 'Failed to fetch profile',
                errors: data,
            } as ApiError;
        }

        return data;
    } catch (error) {
        console.error('Profile fetch error:', error);
        throw error;
    }
};

export const fetchVideoData = async (): Promise<VideoData[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/movies/`);
        if (!response.ok) {
            throw new Error(`Failed to fetch video data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        // Transform to VideoData format - optimized for movie/series
        return data.map((item: any) => ({
            id: item.id.toString(),
            videoUrl: item.type === 'movie'
                ? item.episodes?.[0]?.video_url || ''
                : item.episodes?.[0]?.video_url || ''
        }));
    } catch (error) {
        console.error('Error fetching video data:', error);
        return [];
    }
};

export const getVideoUrlById = async (animeId: string | number, episodeNumber: number = 1): Promise<string> => {
    try {
        // Use cached anime data if available
        const anime = await fetchAnimeById(Number(animeId));

        if (!anime) {
            console.log('❌ Anime not found');
            return '';
        }

        // Movie: always has single video in episodes array (movies have episodes with video_url)
        if (anime.type === 'movie') {
            return anime.episodes?.[0]?.video_url || anime.videos?.[0]?.url || '';
        }

        // Series: get specific episode from episodes array
        if (anime.type === 'series') {
            const episode = anime.episodes?.find((ep: any) => ep.episode_number === episodeNumber) || anime.episodes?.[0];
            return episode?.video_url || episode?.videoUrl || '';
        }

        // Fallback
        return anime.videoUrl || '';

    } catch (error) {
        console.error('❌ Error getting video URL:', error);
        return '';
    }
};

// Data transformation function - using only real API data
const transformAnimeData = (apiData: any) => {
    return {
        id: apiData.id,
        title: apiData.title,
        slug: apiData.slug,
        description: apiData.description,
        // Use only real poster from API, no fallbacks
        thumbnail: apiData.poster,
        banner: apiData.poster,
        rating: apiData.rating_avg || 0,
        year: apiData.release_year,
        totalEpisodes: apiData.episodes?.length || 0,
        genres: apiData.genres?.map((g: any) => g.name) || [],
        status: apiData.type === 'series' ? 'Ongoing' : 'Completed',
        episodes: apiData.episodes?.map((ep: any) => ({
            id: ep.id,
            episode_number: ep.episode_number,
            episodeNumber: ep.episode_number, // Keep both for compatibility
            title: ep.title,
            thumbnail: apiData.poster, // Use anime poster for episodes
            duration: ep.duration,
            video_url: ep.video_url,
            videoUrl: ep.video_url,
            watched: false // This should come from user's watch history
        })) || [],
        videos: apiData.videos?.map((video: any) => ({
            id: video.id,
            url: video.url,
            quality: video.quality
        })) || [],
        // Set video URL based on type
        videoUrl: apiData.type === 'movie'
            ? apiData.videos?.[0]?.url || ''
            : apiData.episodes?.[0]?.video_url || '',
        trailerUrl: apiData.videos?.[0]?.url,
        ratings: apiData.ratings?.map((rating: any) => ({
            id: rating.id,
            score: rating.score,
            comment: rating.comment,
            created_at: rating.created_at,
            user: rating.user, // email/username string
            first_name: rating.first_name || 'Anonim',
            is_comment: rating.is_comment
        })) || [],
        ratingsCount: apiData.ratings?.length || 0,
        averageRating: apiData.rating_avg || 0,
        // Additional API fields
        type: apiData.type,
        studio: apiData.studio,
        source: apiData.source,
        duration: apiData.duration,
        aired_from: apiData.aired_from,
        aired_to: apiData.aired_to,
        created_at: apiData.created_at,
        updated_at: apiData.updated_at
    };
};

// Anime API functions
export const fetchAnimeList = async (): Promise<any[]> => {
    try {
        const response = await cachedFetch(`${API_BASE_URL}/movies/`, undefined, 10); // Cache for 10 minutes
        if (!response.ok) {
            throw new Error('Failed to fetch anime list');
        }
        const data = await response.json();
        return data.map(transformAnimeData);
    } catch (error) {
        console.error('Error fetching anime list:', error);
        return [];
    }
};

// Advanced search function with fuzzy matching
export const searchAnime = async (query: string): Promise<any[]> => {
    try {
        const allAnime = await fetchAnimeList();

        if (!query.trim()) {
            return allAnime;
        }

        const searchTerm = query.toLowerCase().trim();

        // Calculate similarity score for fuzzy matching
        const calculateSimilarity = (str1: string, str2: string): number => {
            const longer = str1.length > str2.length ? str1 : str2;
            const shorter = str1.length > str2.length ? str2 : str1;

            if (longer.length === 0) return 1.0;

            const editDistance = levenshteinDistance(longer, shorter);
            return (longer.length - editDistance) / longer.length;
        };

        // Levenshtein distance algorithm for fuzzy matching
        const levenshteinDistance = (str1: string, str2: string): number => {
            const matrix = [];

            for (let i = 0; i <= str2.length; i++) {
                matrix[i] = [i];
            }

            for (let j = 0; j <= str1.length; j++) {
                matrix[0][j] = j;
            }

            for (let i = 1; i <= str2.length; i++) {
                for (let j = 1; j <= str1.length; j++) {
                    if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    } else {
                        matrix[i][j] = Math.min(
                            matrix[i - 1][j - 1] + 1,
                            matrix[i][j - 1] + 1,
                            matrix[i - 1][j] + 1
                        );
                    }
                }
            }

            return matrix[str2.length][str1.length];
        };

        // Search and score results
        const searchResults = allAnime.map(anime => {
            const title = anime.title?.toLowerCase() || '';
            const description = anime.description?.toLowerCase() || '';
            const genres = anime.genres?.join(' ').toLowerCase() || '';
            const year = anime.year?.toString() || '';

            let score = 0;

            // Exact title match gets highest score
            if (title.includes(searchTerm)) {
                score += 100;
                if (title.startsWith(searchTerm)) score += 50;
                if (title === searchTerm) score += 100;
            }

            // Fuzzy title matching
            const titleSimilarity = calculateSimilarity(title, searchTerm);
            if (titleSimilarity > 0.6) {
                score += titleSimilarity * 80;
            }

            // Genre matching
            if (genres.includes(searchTerm)) {
                score += 30;
            }

            // Year matching
            if (year.includes(searchTerm)) {
                score += 20;
            }

            // Description matching
            if (description.includes(searchTerm)) {
                score += 10;
            }

            // Partial word matching in title
            const titleWords = title.split(' ');
            const searchWords = searchTerm.split(' ');

            searchWords.forEach((searchWord: string) => {
                titleWords.forEach((titleWord: string) => {
                    if (titleWord.includes(searchWord) || searchWord.includes(titleWord)) {
                        score += 15;
                    }
                    const wordSimilarity = calculateSimilarity(titleWord, searchWord);
                    if (wordSimilarity > 0.7) {
                        score += wordSimilarity * 25;
                    }
                });
            });

            return { ...anime, searchScore: score };
        });

        // Filter results with minimum score and sort by relevance
        const filteredResults = searchResults
            .filter(anime => anime.searchScore > 5)
            .sort((a, b) => b.searchScore - a.searchScore);

        // If no good matches found, return popular anime as suggestions
        if (filteredResults.length === 0) {
            const suggestions = allAnime
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 12)
                .map(anime => ({ ...anime, isSuggestion: true }));

            console.log('No matches found, returning suggestions:', suggestions.length);
            return suggestions;
        }

        return filteredResults;
    } catch (error) {
        console.error('Error searching anime:', error);
        return [];
    }
};

export const fetchAnimeById = async (id: number): Promise<any | null> => {
    try {
        const response = await cachedFetch(`${API_BASE_URL}/movies/`, undefined, 15); // Cache for 15 minutes
        if (!response.ok) {
            throw new Error('Failed to fetch anime list');
        }
        const data = await response.json();

        const anime = data.find((item: any) => item.id === id);

        if (anime) {
            const transformed = transformAnimeData(anime);
            return transformed;
        } else {
            return null;
        }
    } catch (error) {
        console.error('❌ Error fetching anime by ID:', error);
        return null;
    }
};

// Helper functions for different anime categories - all based on real API data
export const getTrendingAnime = async () => {
    try {
        const animeList = await fetchAnimeList();
        // Sort by rating and return top 10
        return animeList
            .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 10);
    } catch (error) {
        console.error('Error fetching trending anime:', error);
        return [];
    }
};

export const getPopularAnime = async () => {
    try {
        const animeList = await fetchAnimeList();
        // Sort by ratings count and rating, return top 10
        return animeList
            .sort((a: any, b: any) => {
                const aScore = (a.ratingsCount || 0) * (a.rating || 0);
                const bScore = (b.ratingsCount || 0) * (b.rating || 0);
                return bScore - aScore;
            })
            .slice(0, 10);
    } catch (error) {
        console.error('Error fetching popular anime:', error);
        return [];
    }
};

export const getNewReleases = async () => {
    try {
        const animeList = await fetchAnimeList();
        const currentYear = new Date().getFullYear();
        // Filter by recent years and sort by year descending
        return animeList
            .filter((anime: any) => anime.year >= currentYear - 2)
            .sort((a: any, b: any) => (b.year || 0) - (a.year || 0))
            .slice(0, 10);
    } catch (error) {
        console.error('Error fetching new releases:', error);
        return [];
    }
};

export const getActionAnime = async () => {
    try {
        const animeList = await fetchAnimeList();
        return animeList
            .filter((anime: any) => anime.genres?.some((genre: string) =>
                genre.toLowerCase().includes('action') ||
                genre.toLowerCase().includes('jang')
            ))
            .slice(0, 10);
    } catch (error) {
        console.error('Error fetching action anime:', error);
        return [];
    }
};

export const getRomanceAnime = async () => {
    try {
        const animeList = await fetchAnimeList();
        return animeList
            .filter((anime: any) => anime.genres?.some((genre: string) =>
                genre.toLowerCase().includes('romance') ||
                genre.toLowerCase().includes('romantic') ||
                genre.toLowerCase().includes('muhabbat')
            ))
            .slice(0, 10);
    } catch (error) {
        console.error('Error fetching romance anime:', error);
        return [];
    }
};

export const getFantasyAnime = async () => {
    try {
        const animeList = await fetchAnimeList();
        return animeList
            .filter((anime: any) => anime.genres?.some((genre: string) =>
                genre.toLowerCase().includes('fantasy') ||
                genre.toLowerCase().includes('fantastik') ||
                genre.toLowerCase().includes('magic')
            ))
            .slice(0, 10);
    } catch (error) {
        console.error('Error fetching fantasy anime:', error);
        return [];
    }
};

export const getRecommendations = async (): Promise<any[]> => {
    try {
        const token = getAuthToken();
        if (!token) {
            // If no token, return popular anime as fallback
            return await getPopularAnime();
        }

        console.log('Fetching recommendations...');

        const response = await cachedFetch(`${API_BASE_URL}/recommendations/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }, 10); // Cache for 10 minutes

        if (!response.ok) {
            console.warn('Recommendations API failed, falling back to popular anime');
            return await getPopularAnime();
        }

        const data = await response.json();
        console.log('Recommendations response:', data);

        // Transform the data to match our anime format
        return data.map(transformAnimeData);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        // Fallback to popular anime if recommendations fail
        return await getPopularAnime();
    }
};

export const getContinueWatching = async () => {
    try {
        // This should be based on user's watch history from localStorage or API
        const watchHistory = JSON.parse(localStorage.getItem('watchHistory') || '[]');
        if (watchHistory.length === 0) return [];

        const animeList = await fetchAnimeList();
        const continueWatchingIds = [...new Set(watchHistory.map((h: any) => h.animeId))];

        return animeList
            .filter((anime: any) => continueWatchingIds.includes(anime.id))
            .slice(0, 10);
    } catch (error) {
        console.error('Error fetching continue watching:', error);
        return [];
    }
};

// Bookmarks API functions
export const getBookmarks = async (): Promise<any[]> => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No access token found');
        }

        console.log('Fetching bookmarks...');

        const response = await fetch(`${API_BASE_URL}/bookmarks/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        console.log('Bookmarks response:', { status: response.status, data });

        if (!response.ok) {
            throw {
                message: 'Failed to fetch bookmarks',
                errors: data,
            } as ApiError;
        }

        // Transform bookmark data to match our anime format and keep bookmark ID
        return data.map((bookmark: Bookmark) => {
            const transformedAnime = transformAnimeData(bookmark.movie);
            return {
                ...transformedAnime,
                bookmarkId: bookmark.id, // Keep bookmark ID for deletion
                id: bookmark.movie.id // Keep movie ID for navigation
            };
        });
    } catch (error) {
        console.error('Bookmarks fetch error:', error);
        return [];
    }
};

export const addBookmark = async (movieId: number): Promise<{ message: string }> => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No access token found');
        }

        const response = await fetch(`${API_BASE_URL}/bookmarks/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ movie_id: movieId }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw {
                message: 'Failed to add bookmark',
                errors: data,
            } as ApiError;
        }

        // Invalidate bookmarks cache after successful addition
        invalidateCache('/bookmarks/');

        return data;
    } catch (error) {
        console.error('Add bookmark error:', error);
        throw error;
    }
};

export const removeBookmark = async (movieId: number): Promise<{ message: string }> => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No access token found');
        }

        // First get bookmarks to find the bookmark ID for this movie
        const bookmarks = await getBookmarks();
        const bookmark = bookmarks.find((b: any) => b.id === movieId);
        
        if (!bookmark || !bookmark.bookmarkId) {
            throw new Error('Bookmark not found');
        }

        const response = await fetch(`${API_BASE_URL}/bookmark/${bookmark.bookmarkId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const data = await response.json();
            throw {
                message: 'Failed to remove bookmark',
                errors: data,
            } as ApiError;
        }

        // Invalidate bookmarks cache after successful removal
        invalidateCache('/bookmarks/');

        return { message: 'Bookmark removed successfully' };
    } catch (error) {
        console.error('Remove bookmark error:', error);
        throw error;
    }
};

export const checkBookmarkStatus = async (movieId: number): Promise<boolean> => {
    try {
        const bookmarks = await getBookmarks();
        return bookmarks.some((bookmark: any) => bookmark.id === movieId);
    } catch (error) {
        console.error('Check bookmark status error:', error);
        return false;
    }
};

// Rating API functions
export const addRating = async (ratingData: RatingData): Promise<RatingResponse> => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw {
                message: 'Tizimga kirish talab qilinadi',
                errors: { auth: ['Iltimos, avval tizimga kiring'] },
            } as ApiError;
        }

        // Validate rating data
        if (!ratingData.movie_id || ratingData.movie_id <= 0) {
            throw {
                message: 'Noto\'g\'ri anime ID',
                errors: { movie_id: ['Anime ID noto\'g\'ri'] },
            } as ApiError;
        }

        if (!ratingData.score || ratingData.score < 1 || ratingData.score > 5) {
            throw {
                message: 'Reyting 1 dan 5 gacha bo\'lishi kerak',
                errors: { score: ['Reyting 1 dan 5 gacha bo\'lishi kerak'] },
            } as ApiError;
        }

        // Comment is optional, but if provided, check length
        if (ratingData.comment && ratingData.comment.trim().length > 500) {
            throw {
                message: 'Izoh 500 ta belgidan oshmasligi kerak',
                errors: { comment: ['Izoh juda uzun'] },
            } as ApiError;
        }

        // Get user info - try multiple sources
        let userId = 0;

        console.log('🔍 Getting user ID for rating...');

        // First try localStorage
        try {
            const userStr = localStorage.getItem('user');
            console.log('📦 User from localStorage:', userStr);

            if (userStr) {
                const user = JSON.parse(userStr);
                console.log('👤 Parsed user:', user);
                userId = user.id || 0;
            }
        } catch (e) {
            console.error('❌ Error parsing user from localStorage:', e);
        }

        // If no user ID, try to get from API
        if (!userId) {
            console.log('🌐 No user ID in localStorage, fetching from API...');
            try {
                const profile = await getUserProfile();
                console.log('👤 Profile from API:', profile);
                userId = profile.id || 0;

                // Store updated user info
                if (userId) {
                    localStorage.setItem('user', JSON.stringify(profile));
                }
            } catch (profileError) {
                console.error('❌ Could not get user profile:', profileError);
            }
        }

        console.log('🆔 Final user ID:', userId);

        if (!userId) {
            throw {
                message: 'Foydalanuvchi ma\'lumotlari topilmadi. Iltimos, qaytadan tizimga kiring.',
                errors: { user: ['Foydalanuvchi ID topilmadi'] },
            } as ApiError;
        }

        // Prepare the payload exactly as required by the API
        const payload = {
            user: Number(userId),
            movie_id: Number(ratingData.movie_id),
            score: Number(ratingData.score),
            comment: ratingData.comment ? ratingData.comment.trim() : null,
            is_comment: !!ratingData.comment
        };

        console.log('Adding rating with payload:', payload);
        console.log('User ID:', userId);
        console.log('Token:', token ? 'Present' : 'Missing');

        const response = await fetch(`${API_BASE_URL}/ratings/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            console.error('Failed to parse rating response as JSON:', parseError);
            throw {
                message: response.status === 500 ? 'Server xatosi. Iltimos, keyinroq urinib ko\'ring.' : 'Noto\'g\'ri javob formati',
                errors: {},
            } as ApiError;
        }

        console.log('Add rating response:', { status: response.status, data });

        if (!response.ok) {
            // Handle specific error cases
            if (response.status === 400) {
                throw {
                    message: data.message || 'Noto\'g\'ri ma\'lumotlar',
                    errors: data,
                } as ApiError;
            } else if (response.status === 401) {
                throw {
                    message: 'Tizimga kirish talab qilinadi',
                    errors: { auth: ['Iltimos, qaytadan tizimga kiring'] },
                } as ApiError;
            } else if (response.status === 403) {
                throw {
                    message: 'Ruxsat berilmagan',
                    errors: { permission: ['Bu amalni bajarish uchun ruxsatingiz yo\'q'] },
                } as ApiError;
            } else if (response.status === 409) {
                throw {
                    message: 'Siz allaqachon bu animeni baholagansiz',
                    errors: { duplicate: ['Bir animeni faqat bir marta baholash mumkin'] },
                } as ApiError;
            } else {
                throw {
                    message: data.message || 'Reyting yuborishda xatolik yuz berdi',
                    errors: data,
                } as ApiError;
            }
        }

        // Invalidate cache after successful rating submission
        invalidateCache('/movies/');

        return data;
    } catch (error: any) {
        console.error('Add rating error:', error);

        // If it's already a formatted error, throw it as is
        if (error.message && error.errors) {
            throw error;
        }

        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw {
                message: 'Internet aloqasi yo\'q. Iltimos, ulanishni tekshiring.',
                errors: { network: ['Internet aloqasi yo\'q'] },
            } as ApiError;
        }

        // Generic error
        throw {
            message: error.message || 'Reyting yuborishda xatolik yuz berdi',
            errors: {},
        } as ApiError;
    }
};

export const getUserRatings = async (): Promise<RatingResponse[]> => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No access token found');
        }

        console.log('Fetching user ratings...');

        const response = await fetch(`${API_BASE_URL}/ratings/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        console.log('User ratings response:', { status: response.status, data });

        if (!response.ok) {
            throw {
                message: 'Failed to fetch ratings',
                errors: data,
            } as ApiError;
        }

        return data;
    } catch (error) {
        console.error('Fetch ratings error:', error);
        return [];
    }
};

export const checkUserRating = async (movieId: number): Promise<RatingResponse | null> => {
    try {
        const token = getAuthToken();
        if (!token) {
            console.log('No auth token for rating check');
            return null;
        }

        // Get current user info from multiple sources
        let currentUserEmail = '';
        let currentUserId = 0;

        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                currentUserEmail = user.email || user.username || '';
                currentUserId = user.id || 0;
                console.log('Current user info:', { email: currentUserEmail, id: currentUserId });
            }
        } catch (e) {
            console.error('Error parsing user from localStorage:', e);
        }

        // If no user info in localStorage, try to get from API
        if (!currentUserEmail && !currentUserId) {
            try {
                const profile = await getUserProfile();
                currentUserEmail = profile.email || profile.username || '';
                currentUserId = profile.id || 0;
                console.log('User info from API:', { email: currentUserEmail, id: currentUserId });
            } catch (profileError) {
                console.error('Could not get user profile:', profileError);
            }
        }

        if (!currentUserEmail && !currentUserId) {
            console.log('No user identification found');
            return null;
        }

        // Get the anime data to check ratings
        const anime = await fetchAnimeById(movieId);
        if (!anime || !anime.ratings) {
            console.log('No anime or ratings found');
            return null;
        }

        console.log('Checking ratings for user:', currentUserEmail);
        console.log('Available ratings:', anime.ratings.map((r: any) => ({ user: r.user, score: r.score })));

        // Find user's rating by email/username (more flexible matching)
        const userRating = anime.ratings.find((rating: any) => {
            const ratingUser = rating.user?.toLowerCase?.() || rating.user;
            const currentUser = currentUserEmail.toLowerCase();

            return ratingUser === currentUser ||
                ratingUser === currentUserId.toString() ||
                rating.user === currentUserEmail;
        });

        if (userRating) {
            console.log('Found user rating:', userRating);
        } else {
            console.log('No user rating found');
        }

        return userRating || null;
    } catch (error) {
        console.error('Error checking user rating:', error);
        return null;
    }
};

// Banners API function - using real API structure
export const getBanners = async (): Promise<any[]> => {
    try {
        const response = await cachedFetch(`${API_BASE_URL}/banners/`, undefined, 30); // Cache for 30 minutes

        if (!response.ok) {
            throw new Error(`Failed to fetch banners: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            return [];
        }

        if (data.length === 0) {
            return [];
        }

        // Transform banner data using the exact API structure
        const transformedBanners = data.map((banner: any) => {

            const transformed = {
                id: banner.id,
                title: banner.movie?.title || 'Anime Banner',
                description: banner.movie?.description || 'Eng yaxshi anime seriallarni tomosha qiling',
                // Use photo field for hero slider background
                banner: banner.photo,
                thumbnail: banner.movie?.poster,
                // Movie details
                rating: banner.movie?.rating_avg || 0,
                year: banner.movie?.release_year,
                totalEpisodes: banner.movie?.episodes?.length || 0,
                status: banner.movie?.type === 'series' ? 'Davom etmoqda' : 'Tugallangan',
                movieId: banner.movie?.id,
                genres: banner.movie?.genres?.map((g: any) => g.name) || [],
                // Additional movie info
                slug: banner.movie?.slug,
                type: banner.movie?.type,
                duration: banner.movie?.duration,
                ratingCount: banner.movie?.rating_count || 0,
                // Episodes and ratings info
                episodes: banner.movie?.episodes || [],
                videos: banner.movie?.videos || [],
                ratings: banner.movie?.ratings || [],
                // Banner specific
                bannerId: banner.id,
                bannerPhoto: banner.photo
            };

            return transformed;
        });

        // Filter valid banners (must have movie and photo)
        const validBanners = transformedBanners.filter((banner: any) => {
            return banner.movieId && banner.banner;
        });

        return validBanners.slice(0, 5); // Limit to 5 banners

    } catch (error) {
        return [];
    }
};

// Notifications API functions

export const getNotifications = async (): Promise<Notification[]> => {
    try {
        const token = getAuthToken();
        if (!token) {
            console.log('No auth token for notifications');
            return [];
        }

        console.log('🔔 Fetching notifications...');

        const response = await fetch(`${API_BASE_URL}/notification/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch notifications:', response.status);
            return [];
        }

        const data = await response.json();
        console.log('📬 Notifications received:', data.length);

        return data;
    } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        return [];
    }
};

export const markNotificationAsRead = async (notificationId: number): Promise<boolean> => {
    try {
        const token = getAuthToken();
        if (!token) {
            return false;
        }

        const response = await fetch(`${API_BASE_URL}/notification/${notificationId}/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ is_read: true }),
        });

        return response.ok;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return false;
    }
};

export const markAllNotificationsAsRead = async (): Promise<boolean> => {
    try {
        const token = getAuthToken();
        if (!token) {
            console.error('No auth token for marking all notifications as read');
            return false;
        }

        console.log('🔔 Marking all notifications as read...');

        const response = await fetch(`${API_BASE_URL}/notification/all/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Failed to mark all notifications as read:', response.status);
            return false;
        }

        console.log('✅ All notifications marked as read');
        return true;
    } catch (error) {
        console.error('❌ Error marking all notifications as read:', error);
        return false;
    }
};