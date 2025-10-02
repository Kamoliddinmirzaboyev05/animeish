// Genre translations
export const genreTranslations: Record<string, string> = {
  'Action': 'Jangari',
  'Fantasy': 'Fantastik',
  'Drama': 'Drama',
  'Comedy': 'Komediya',
  'Romance': 'Romantik',
  'Sci-Fi': 'Ilmiy-Fantastik',
  'Horror': 'Qo\'rqinchli',
  'Slice of Life': 'Hayotiy',
};

// Status translations
export const statusTranslations: Record<string, string> = {
  'Ongoing': 'Davom etmoqda',
  'Completed': 'Tugallangan',
  'Upcoming': 'Tez orada',
};

// Translate genre
export const translateGenre = (genre: string): string => {
  return genreTranslations[genre] || genre;
};

// Translate status
export const translateStatus = (status: string): string => {
  return statusTranslations[status] || status;
};

// Translate genres array
export const translateGenres = (genres: string[]): string[] => {
  return genres.map(genre => translateGenre(genre));
};