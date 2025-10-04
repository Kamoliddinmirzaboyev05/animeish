export interface Anime {
  id: number;
  title: string;
  thumbnail: string;
  banner: string;
  rating: number;
  year: number;
  totalEpisodes: number;
  genres: string[];
  description: string;
  status: 'Ongoing' | 'Completed' | 'Upcoming';
  episodes: Episode[];
  trailerUrl?: string;
}

export interface Episode {
  id: number;
  episodeNumber: number;
  title: string;
  thumbnail: string;
  duration: string;
  videoUrl: string;
  watched: boolean;
}

// Hero banner data only
export const heroAnime: Anime[] = [
  {
    id: 1,
    title: "Demon Slayer: Kimetsu no Yaiba",
    thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&h=600&fit=crop",
    rating: 9.2,
    year: 2019,
    totalEpisodes: 26,
    genres: ["Action", "Fantasy", "Drama"],
    description: "Oilaga jinlar hujum qiladi va faqat ikki a'zo omon qoladi - Tanjiro va uning singlisi Nezuko, u asta-sekin jinga aylanib bormoqda. Tanjiro oilasining qasosini olish va singlisini davolash uchun jin qiruvchi bo'lishga qaror qiladi.",
    status: "Completed",
    episodes: []
  },
  {
    id: 2,
    title: "Attack on Titan",
    thumbnail: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=1920&h=600&fit=crop",
    rating: 9.5,
    year: 2013,
    totalEpisodes: 75,
    genres: ["Action", "Drama", "Fantasy"],
    description: "Uning tug'ilgan shahri vayron qilingan va onasi o'ldirilganidan so'ng, yosh Eren Yeager insoniyatni yo'q bo'lish arafasiga olib kelgan ulkan gumanoid Titanlardan yerni tozalashga va'da beradi.",
    status: "Completed",
    episodes: []
  },
  {
    id: 3,
    title: "My Hero Academia",
    thumbnail: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1920&h=600&fit=crop",
    rating: 8.8,
    year: 2016,
    totalEpisodes: 113,
    genres: ["Action", "Comedy", "Fantasy"],
    description: "A superhero-loving boy without any powers is determined to enroll in a prestigious hero academy and learn what it really means to be a hero.",
    status: "Ongoing",
    episodes: []
  },
  {
    id: 4,
    title: "Jujutsu Kaisen",
    thumbnail: "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=1920&h=600&fit=crop",
    rating: 9.0,
    year: 2020,
    totalEpisodes: 24,
    genres: ["Action", "Fantasy", "Drama"],
    description: "A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman's school to be able to locate the demon's other body parts and thus exorcise himself.",
    status: "Ongoing",
    episodes: []
  },
  {
    id: 5,
    title: "One Punch Man",
    thumbnail: "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=1920&h=600&fit=crop",
    rating: 8.9,
    year: 2015,
    totalEpisodes: 24,
    genres: ["Action", "Comedy", "Sci-Fi"],
    description: "The story of Saitama, a hero that can obliterate even the strongest foes with a single punch, a situation that bores him to no end.",
    status: "Completed",
    episodes: []
  }
];

export const getFeaturedAnime = () => heroAnime;
