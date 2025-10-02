const API_BASE_URL = 'https://68de5c4fd7b591b4b78f41c3.mockapi.io/animeishapi/v1';

export interface VideoData {
    id: string;
    videoUrl: string;
}

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