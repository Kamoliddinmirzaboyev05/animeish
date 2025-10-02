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

export const mockAnime: Anime[] = [
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
    episodes: Array.from({ length: 26 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}: ${['Cruelty', 'Trainer Sakonji Urokodaki', 'Sabito and Makomo', 'Final Selection'][i % 4]}`,
      thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: i < 5
    }))
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
    episodes: Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      thumbnail: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: i < 10
    }))
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
    episodes: Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      thumbnail: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: false
    }))
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
    episodes: Array.from({ length: 24 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      thumbnail: "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: i < 3
    }))
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
    episodes: Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      thumbnail: "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: false
    }))
  },
  {
    id: 6,
    title: "Death Note",
    thumbnail: "https://images.unsplash.com/photo-1618945524163-32451704427c?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1618945524163-32451704427c?w=1920&h=600&fit=crop",
    rating: 9.3,
    year: 2006,
    totalEpisodes: 37,
    genres: ["Drama", "Fantasy", "Horror"],
    description: "An intelligent high school student goes on a secret crusade to eliminate criminals from the world after discovering a notebook capable of killing anyone whose name is written into it.",
    status: "Completed",
    episodes: Array.from({ length: 37 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      thumbnail: "https://images.unsplash.com/photo-1618945524163-32451704427c?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: i < 15
    }))
  },
  {
    id: 7,
    title: "Sword Art Online",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=600&fit=crop",
    rating: 8.2,
    year: 2012,
    totalEpisodes: 25,
    genres: ["Action", "Romance", "Fantasy"],
    description: "In the year 2022, thousands of people get trapped in a new virtual MMORPG and the lone wolf player must work to survive and free the others.",
    status: "Completed",
    episodes: Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: false
    }))
  },
  {
    id: 8,
    title: "Naruto Shippuden",
    thumbnail: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=1920&h=600&fit=crop",
    rating: 8.7,
    year: 2007,
    totalEpisodes: 500,
    genres: ["Action", "Comedy", "Drama"],
    description: "Naruto Uzumaki, is a loud, hyperactive, adolescent ninja who constantly searches for approval and recognition, as well as to become Hokage.",
    status: "Completed",
    episodes: Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      thumbnail: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: i < 20
    }))
  },
  {
    id: 9,
    title: "Tokyo Ghoul",
    thumbnail: "https://images.unsplash.com/photo-1609743522471-83c84ce23e32?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1609743522471-83c84ce23e32?w=1920&h=600&fit=crop",
    rating: 8.4,
    year: 2014,
    totalEpisodes: 12,
    genres: ["Action", "Drama", "Horror"],
    description: "A Tokyo college student is attacked by a ghoul, a superpowered human who feeds on human flesh. He becomes a ghoul after surgery.",
    status: "Completed",
    episodes: Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      thumbnail: "https://images.unsplash.com/photo-1609743522471-83c84ce23e32?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: false
    }))
  },
  {
    id: 10,
    title: "Fullmetal Alchemist: Brotherhood",
    thumbnail: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1920&h=600&fit=crop",
    rating: 9.6,
    year: 2009,
    totalEpisodes: 64,
    genres: ["Action", "Drama", "Fantasy"],
    description: "Two brothers search for a Philosopher's Stone after an attempt to revive their deceased mother goes awry and leaves them in damaged physical forms.",
    status: "Completed",
    episodes: Array.from({ length: 64 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      thumbnail: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: i < 30
    }))
  },
  {
    id: 11,
    title: "Steins;Gate",
    thumbnail: "https://images.unsplash.com/photo-1635003236519-39e47a927c3d?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1635003236519-39e47a927c3d?w=1920&h=600&fit=crop",
    rating: 9.1,
    year: 2011,
    totalEpisodes: 24,
    genres: ["Sci-Fi", "Drama", "Fantasy"],
    description: "A group of friends have customized their microwave into a device that can send text messages to the past. As they perform different experiments, an organization named SERN tracks them down.",
    status: "Completed",
    episodes: Array.from({ length: 24 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      thumbnail: "https://images.unsplash.com/photo-1635003236519-39e47a927c3d?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: false
    }))
  },
  {
    id: 12,
    title: "Hunter x Hunter",
    thumbnail: "https://images.unsplash.com/photo-1617096200347-cb04ae810b1d?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1617096200347-cb04ae810b1d?w=1920&h=600&fit=crop",
    rating: 9.4,
    year: 2011,
    totalEpisodes: 148,
    genres: ["Action", "Fantasy", "Drama"],
    description: "Gon Freecss aspires to become a Hunter, an exceptional being capable of greatness. With his friends and his potential, he seeks for his father who left him when he was younger.",
    status: "Completed",
    episodes: Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      thumbnail: "https://images.unsplash.com/photo-1617096200347-cb04ae810b1d?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: i < 8
    }))
  },
  {
    id: 13,
    title: "Violet Evergarden",
    thumbnail: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1920&h=600&fit=crop",
    rating: 8.9,
    year: 2018,
    totalEpisodes: 13,
    genres: ["Drama", "Fantasy", "Slice of Life"],
    description: "After the war, Violet Evergarden needs a job. Scarred and emotionless, she takes a job as a letter writer to understand herself and her past.",
    status: "Completed",
    episodes: Array.from({ length: 13 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      thumbnail: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: false
    }))
  },
  {
    id: 14,
    title: "Your Lie in April",
    thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920&h=600&fit=crop",
    rating: 8.8,
    year: 2014,
    totalEpisodes: 22,
    genres: ["Drama", "Romance", "Slice of Life"],
    description: "A piano prodigy who lost his ability to play after suffering a traumatic event in his childhood is forced back into the spotlight by an eccentric girl with a secret of her own.",
    status: "Completed",
    episodes: Array.from({ length: 22 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: false
    }))
  },
  {
    id: 15,
    title: "Code Geass",
    thumbnail: "https://images.unsplash.com/photo-1606144042614-b2417e99c39c?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1606144042614-b2417e99c39c?w=1920&h=600&fit=crop",
    rating: 9.0,
    year: 2006,
    totalEpisodes: 50,
    genres: ["Action", "Drama", "Sci-Fi"],
    description: "After being given a mysterious power to control others, an outcast prince begins a deadly quest to save his nation and his sister.",
    status: "Completed",
    episodes: Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      thumbnail: "https://images.unsplash.com/photo-1606144042614-b2417e99c39c?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: i < 12
    }))
  },
  {
    id: 16,
    title: "Mob Psycho 100",
    thumbnail: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=1920&h=600&fit=crop",
    rating: 8.7,
    year: 2016,
    totalEpisodes: 25,
    genres: ["Action", "Comedy", "Fantasy"],
    description: "A psychic middle school boy tries to live a normal life and keep his growing powers under control, even though he constantly gets into trouble.",
    status: "Completed",
    episodes: Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      thumbnail: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: false
    }))
  },
  {
    id: 17,
    title: "Cowboy Bebop",
    thumbnail: "https://images.unsplash.com/photo-1534412319409-fb4b71ed1b4a?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1534412319409-fb4b71ed1b4a?w=1920&h=600&fit=crop",
    rating: 8.9,
    year: 1998,
    totalEpisodes: 26,
    genres: ["Action", "Sci-Fi", "Drama"],
    description: "The futuristic misadventures and tragedies of an easygoing bounty hunter and his partners.",
    status: "Completed",
    episodes: Array.from({ length: 26 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      thumbnail: "https://images.unsplash.com/photo-1534412319409-fb4b71ed1b4a?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: false
    }))
  },
  {
    id: 18,
    title: "Parasyte",
    thumbnail: "https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=1920&h=600&fit=crop",
    rating: 8.6,
    year: 2014,
    totalEpisodes: 24,
    genres: ["Action", "Horror", "Sci-Fi"],
    description: "A teenage boy infected by mysterious parasites must learn to co-exist with the creature if he is to survive both the life of a Parasyte and human as part monster, part person.",
    status: "Completed",
    episodes: Array.from({ length: 24 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      thumbnail: "https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: false
    }))
  },
  {
    id: 19,
    title: "Re:Zero",
    thumbnail: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=1920&h=600&fit=crop",
    rating: 8.5,
    year: 2016,
    totalEpisodes: 50,
    genres: ["Drama", "Fantasy", "Romance"],
    description: "A young man is transported to a fantasy world where he discovers that he has the ability to turn back time after dying.",
    status: "Ongoing",
    episodes: Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      thumbnail: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: i < 5
    }))
  },
  {
    id: 20,
    title: "One Piece",
    thumbnail: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=1920&h=600&fit=crop",
    rating: 8.9,
    year: 1999,
    totalEpisodes: 1000,
    genres: ["Action", "Comedy", "Fantasy"],
    description: "Monkey D. Luffy sets off on an adventure with his pirate crew in hopes of finding the greatest treasure ever, known as the One Piece.",
    status: "Ongoing",
    episodes: Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      thumbnail: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: i < 25
    }))
  },
  {
    id: 21,
    title: "Spy x Family",
    thumbnail: "https://images.unsplash.com/photo-1618004652321-13a63e576b80?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1618004652321-13a63e576b80?w=1920&h=600&fit=crop",
    rating: 8.7,
    year: 2022,
    totalEpisodes: 25,
    genres: ["Action", "Comedy", "Slice of Life"],
    description: "A spy must create a fake family to execute a mission, not realizing that his adopted daughter is a telepath and his wife is an assassin.",
    status: "Ongoing",
    episodes: Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      thumbnail: "https://images.unsplash.com/photo-1618004652321-13a63e576b80?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: false
    }))
  },
  {
    id: 22,
    title: "Chainsaw Man",
    thumbnail: "https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=400&h=600&fit=crop",
    banner: "https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=1920&h=600&fit=crop",
    rating: 8.8,
    year: 2022,
    totalEpisodes: 12,
    genres: ["Action", "Horror", "Fantasy"],
    description: "Following a betrayal, a young man becomes merged with a devil and is granted the ability to transform parts of his body into chainsaws.",
    status: "Completed",
    episodes: Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      title: `Episode ${i + 1}`,
      thumbnail: "https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=300&h=170&fit=crop",
      duration: "24:00",
      videoUrl: "/video.mp4",
      watched: false
    }))
  }
];

export const getFeaturedAnime = () => mockAnime.slice(0, 5);
export const getTrendingAnime = () => mockAnime.slice(0, 10);
export const getPopularAnime = () => mockAnime.slice(5, 15);
export const getNewReleases = () => mockAnime.filter(a => a.year >= 2020);
export const getActionAnime = () => mockAnime.filter(a => a.genres.includes('Action'));
export const getRomanceAnime = () => mockAnime.filter(a => a.genres.includes('Romance'));
export const getFantasyAnime = () => mockAnime.filter(a => a.genres.includes('Fantasy'));
export const getContinueWatching = () => mockAnime.filter(a => a.episodes.some(e => e.watched));
