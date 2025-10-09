const API_BASE_URL = 'https://animeish.pythonanywhere.com';
console.log('🔧 API_BASE_URL configured as:', API_BASE_URL);

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
    comment: string;
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
            throw {
                message: data.message || data.error || 'Failed to send OTP',
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
            throw {
                message: 'Registration failed',
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
            user: {
                id: rating.user?.id,
                first_name: rating.user?.first_name || 'Anonim',
                username: rating.user?.username || 'user'
            }
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
        const response = await fetch(`${API_BASE_URL}/movies/`);
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
        const response = await fetch(`${API_BASE_URL}/movies/`);
        if (!response.ok) {
            throw new Error('Failed to fetch anime list');
        }
        const data = await response.json();
        const anime = data.find((item: any) => item.id === id);
        return anime ? transformAnimeData(anime) : null;
    } catch (error) {
        console.error('Error fetching anime by ID:', error);
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

        // Transform bookmark data to match our anime format
        return data.map((bookmark: Bookmark) => transformAnimeData(bookmark.movie));
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

        console.log('Adding bookmark for movie:', movieId);
        
        const response = await fetch(`${API_BASE_URL}/bookmarks/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ movie_id: movieId }),
        });

        const data = await response.json();
        console.log('Add bookmark response:', { status: response.status, data });

        if (!response.ok) {
            throw {
                message: 'Failed to add bookmark',
                errors: data,
            } as ApiError;
        }

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

        console.log('Removing bookmark for movie:', movieId);
        
        const response = await fetch(`${API_BASE_URL}/bookmarks/${movieId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('Remove bookmark response:', { status: response.status });

        if (!response.ok) {
            const data = await response.json();
            throw {
                message: 'Failed to remove bookmark',
                errors: data,
            } as ApiError;
        }

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

        if (!ratingData.comment || ratingData.comment.trim().length < 10) {
            throw {
                message: 'Izoh kamida 10 ta belgidan iborat bo\'lishi kerak',
                errors: { comment: ['Izoh juda qisqa'] },
            } as ApiError;
        }

        if (ratingData.comment.trim().length > 500) {
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
            comment: ratingData.comment.trim(),
            is_comment: true
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

// Banners API function - using real API structure
export const getBanners = async (): Promise<any[]> => {
    try {
        console.log('🔄 Fetching banners from:', `${API_BASE_URL}/banners/`);
        console.log('🌐 Full URL:', `${API_BASE_URL}/banners/`);
        
        const response = await fetch(`${API_BASE_URL}/banners/`);
        console.log('📡 Response status:', response.status, response.statusText);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            console.error('❌ Response not OK:', response.status, response.statusText);
            throw new Error(`Failed to fetch banners: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📦 Raw API data:', data);
        console.log('📊 Data type:', typeof data, 'Is array:', Array.isArray(data), 'Length:', data?.length);
        console.log('🔍 First item structure:', data?.[0]);
        
        if (!Array.isArray(data)) {
            console.error('❌ API did not return an array');
            return [];
        }
        
        if (data.length === 0) {
            console.log('⚠️ No banners in API response');
            return [];
        }
        
        // Transform banner data using the exact API structure
        const transformedBanners = data.map((banner: any, index: number) => {
            console.log(`🔄 Processing banner ${index + 1}:`, banner);
            console.log(`📋 Banner details:`, {
                id: banner.id,
                hasMovie: !!banner.movie,
                hasPhoto: !!banner.photo,
                movieId: banner.movie?.id,
                movieTitle: banner.movie?.title,
                photo: banner.photo,
                poster: banner.movie?.poster
            });
            
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
            
            console.log(`✅ Transformed banner ${index + 1}:`, transformed);
            return transformed;
        });
        
        console.log('🔄 Transformed banners:', transformedBanners);
        
        // Filter valid banners (must have movie and photo)
        const validBanners = transformedBanners.filter((banner: any) => {
            const isValid = banner.movieId && banner.banner;
            console.log(`✅ Banner ${banner.id} validation:`, {
                movieId: banner.movieId,
                hasPhoto: !!banner.banner,
                isValid
            });
            return isValid;
        });
        
        console.log('✅ Valid banners count:', validBanners.length);
        console.log('🎯 Final banners:', validBanners);
        
        return validBanners.slice(0, 5); // Limit to 5 banners
        
    } catch (error) {
        console.error('❌ Banners fetch error:', error);
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