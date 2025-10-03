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