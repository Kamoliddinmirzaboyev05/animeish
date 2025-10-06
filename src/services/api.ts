const API_BASE_URL = 'https://animeish.pythonanywhere.com';

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
    avatar: string | null;
    bio: string | null;
    is_premium: boolean;
    created_at: string;
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
        
        const response = await fetch(`${API_BASE_URL}/users/me/`, {
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
            throw new Error('Failed to fetch video data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching video data:', error);
        return [];
    }
};

export const getVideoUrlById = async (animeId: string | number): Promise<string> => {
    try {
        const videoData = await fetchVideoData();
        console.log('Fetched video data:', videoData);
        console.log('Looking for animeId:', animeId);
        
        // Convert animeId to string for comparison
        const targetId = String(animeId);
        const video = videoData.find(v => v.id === targetId);
        
        console.log('Found video:', video);
        
        if (video?.videoUrl) {
            return video.videoUrl;
        }
        
        // If exact match not found, try to get any video from the list
        if (videoData.length > 0) {
            console.log('Using first available video as fallback');
            return videoData[0].videoUrl;
        }
        
        return '/video.mp4'; // Final fallback to local video
    } catch (error) {
        console.error('Error getting video URL:', error);
        return '/video.mp4'; // Fallback to local video
    }
};

// Data transformation function
const transformAnimeData = (apiData: any) => {
    return {
        id: apiData.id,
        title: apiData.title,
        slug: apiData.slug,
        description: apiData.description,
        thumbnail: apiData.poster || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop',
        banner: apiData.poster || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&h=600&fit=crop',
        rating: apiData.rating_avg || 0,
        year: apiData.release_year || 2022,
        totalEpisodes: apiData.episodes?.length || 0,
        genres: apiData.genres?.map((g: any) => g.name) || [],
        status: apiData.type === 'series' ? 'Ongoing' : 'Completed',
        episodes: apiData.episodes?.map((ep: any) => ({
            id: ep.id,
            episodeNumber: ep.episode_number,
            title: ep.title,
            thumbnail: apiData.poster || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=170&fit=crop',
            duration: ep.duration || '24:00',
            video_url: ep.video_url, // Keep original field name for API compatibility
            videoUrl: ep.video_url || '/video.mp4', // Also keep transformed name for backward compatibility
            watched: false
        })) || [],
        videos: apiData.videos || [],
        trailerUrl: apiData.videos?.[0]?.url
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

// Helper functions for different anime categories
export const getTrendingAnime = async () => {
    const animeList = await fetchAnimeList();
    return animeList.slice(0, 10);
};

export const getPopularAnime = async () => {
    const animeList = await fetchAnimeList();
    return animeList.slice(5, 15);
};

export const getNewReleases = async () => {
    const animeList = await fetchAnimeList();
    return animeList.filter((anime: any) => anime.year >= 2020);
};

export const getActionAnime = async () => {
    const animeList = await fetchAnimeList();
    return animeList.filter((anime: any) => anime.genres?.includes('Action'));
};

export const getRomanceAnime = async () => {
    const animeList = await fetchAnimeList();
    return animeList.filter((anime: any) => anime.genres?.includes('Romance'));
};

export const getFantasyAnime = async () => {
    const animeList = await fetchAnimeList();
    return animeList.filter((anime: any) => anime.genres?.includes('Fantasy'));
};

export const getContinueWatching = async () => {
    const animeList = await fetchAnimeList();
    return animeList.filter((anime: any) => anime.episodes?.some((e: any) => e.watched));
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

        // Prepare the payload exactly as required by the API
        const payload = {
            movie_id: Number(ratingData.movie_id),
            score: Number(ratingData.score),
            comment: ratingData.comment.trim()
        };

        console.log('Adding rating with payload:', payload);
        
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

// Banners API function
export const getBanners = async (): Promise<any[]> => {
    try {
        console.log('Fetching banners...');
        
        const response = await fetch(`${API_BASE_URL}/banners/`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch banners');
        }
        
        const data = await response.json();
        console.log('Banners response:', { status: response.status, data });
        
        // Transform banner data to match our hero slider format
        return data.map((banner: any) => ({
            id: banner.id,
            title: banner.title || banner.movie?.title || 'Featured Anime',
            description: banner.description || banner.movie?.description || 'Watch the latest episodes now!',
            banner: banner.image || banner.movie?.poster || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&h=600&fit=crop',
            thumbnail: banner.image || banner.movie?.poster || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop',
            rating: banner.movie?.rating_avg || 8.5,
            year: banner.movie?.release_year || 2024,
            totalEpisodes: banner.movie?.episodes?.length || 12,
            status: banner.movie?.type === 'series' ? 'Ongoing' : 'Completed',
            movieId: banner.movie?.id || banner.id, // For bookmarking
            genres: banner.movie?.genres?.map((g: any) => g.name) || ['Action', 'Adventure']
        }));
    } catch (error) {
        console.error('Banners fetch error:', error);
        // Return fallback banners if API fails
        return [
            {
                id: 1,
                title: 'Featured Anime',
                description: 'Watch the latest episodes now!',
                banner: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&h=600&fit=crop',
                thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop',
                rating: 8.5,
                year: 2024,
                totalEpisodes: 12,
                status: 'Ongoing',
                movieId: 1,
                genres: ['Action', 'Adventure']
            }
        ];
    }
};