const API_BASE_URL = 'https://animeish.pythonanywhere.com/api';

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
    avatar: string | null;
    bio: string | null;
    is_premium: boolean;
    created_at: string;
}

// Authentication functions
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
    sessionStorage.setItem('access_token', authData.access);
    sessionStorage.setItem('refresh_token', authData.refresh);
    if (authData.user) {
        sessionStorage.setItem('user', JSON.stringify(authData.user));
    }
};

// Helper function to get stored auth data
export const getAuthToken = (): string | null => {
    return sessionStorage.getItem('access_token');
};

// Helper function to clear auth data
export const clearAuthData = () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
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
        const response = await fetch(`${API_BASE_URL}/anime`);
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