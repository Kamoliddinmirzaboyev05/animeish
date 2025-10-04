# ON-PAGE SEO OPTIMIZATSIYASI

## 🖼️ ALT ATRIBUTLAR STRATEGIYASI

### Anime Rasmlari Uchun:
```html
<!-- Yomon misol -->
<img src="naruto.jpg" alt="image">

<!-- Yaxshi misol -->
<img src="naruto-poster.jpg" alt="Naruto anime seriali posteri - 720 qism, jangari janr">

<!-- Eng yaxshi misol -->
<img src="naruto-episode-1-thumbnail.jpg" alt="Naruto 1-qism thumbnail - Ninja yo'li boshlanadi, HD sifat">
```

### Logo va UI Elementlar:
```html
<img src="logo.svg" alt="Aniki - O'zbekiston anime streaming platformasi">
<img src="play-button.svg" alt="Video ijro etish tugmasi">
<img src="heart-icon.svg" alt="Sevimlilar ro'yxatiga qo'shish">
```

## 🔗 INTERNAL LINKING STRATEGIYASI

### 1. Navigatsiya Linking:
```html
<!-- Header navigatsiya -->
<nav>
  <a href="/" title="Bosh sahifa - Eng yangi anime seriallar">Bosh sahifa</a>
  <a href="/search" title="Anime qidiruv - 1000+ serial va film">Qidiruv</a>
  <a href="/my-list" title="Mening ro'yxatim - Saqlangan animeler">Ro'yxatim</a>
</nav>
```

### 2. Contextual Linking:
```html
<!-- Anime detail sahifasida -->
<p>Agar sizga <a href="/anime/1" title="Naruto - 720 qismli jangari anime">Naruto</a> yoqsa, 
<a href="/anime/2" title="One Piece - eng uzun anime serial">One Piece</a>ni ham tomosha qiling.</p>

<!-- Breadcrumb navigation -->
<nav aria-label="Breadcrumb">
  <a href="/">Bosh sahifa</a> > 
  <a href="/search?genre=action">Jangari</a> > 
  <span>Naruto</span>
</nav>
```

### 3. Related Content Linking:
```html
<!-- O'xshash anime seriallar -->
<section>
  <h2>O'xshash Anime Seriallar</h2>
  <a href="/anime/3" title="Attack on Titan - post-apokaliptik anime">Attack on Titan</a>
  <a href="/anime/4" title="Demon Slayer - supernatural jangari anime">Demon Slayer</a>
</section>
```

## 🌐 URL TUZILMASI

### Optimal URL Struktura:
```
✅ YAXSHI:
https://aniki.uz/
https://aniki.uz/search
https://aniki.uz/anime/naruto
https://aniki.uz/anime/naruto/episode-1
https://aniki.uz/genre/action
https://aniki.uz/year/2023

❌ YOMON:
https://aniki.uz/index.php?page=home
https://aniki.uz/anime.php?id=123&ep=1
https://aniki.uz/search.php?q=naruto&filter=action
```

### URL Naming Conventions:
- **Anime sahifalari:** `/anime/[anime-slug]`
- **Episode sahifalari:** `/watch/[anime-id]/[episode-number]`
- **Janr sahifalari:** `/genre/[genre-slug]`
- **Qidiruv:** `/search?q=[query]`

## 📋 SCHEMA MARKUP

### 1. Website Schema (Bosh sahifa):
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Aniki",
  "alternateName": "Aniki Anime Streaming",
  "url": "https://aniki.uz",
  "description": "O'zbekistondagi eng yaxshi anime streaming platformasi",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://aniki.uz/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "sameAs": [
    "https://t.me/aniki_uz",
    "https://instagram.com/aniki_uz"
  ]
}
```

### 2. TV Series Schema (Anime sahifalar):
```json
{
  "@context": "https://schema.org",
  "@type": "TVSeries",
  "name": "Naruto",
  "description": "Ninja dunyosida o'sib ulg'aygan yosh ninja Naruto Uzumakining sarguzashtlari",
  "image": "https://aniki.uz/images/naruto-poster.jpg",
  "genre": ["Action", "Adventure", "Martial Arts"],
  "numberOfEpisodes": 720,
  "numberOfSeasons": 1,
  "datePublished": "2002-10-03",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 8.4,
    "ratingCount": 15000,
    "bestRating": 10,
    "worstRating": 1
  },
  "creator": {
    "@type": "Person",
    "name": "Masashi Kishimoto"
  },
  "productionCompany": {
    "@type": "Organization",
    "name": "Studio Pierrot"
  }
}
```

### 3. Video Object Schema (Episode sahifalar):
```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Naruto 1-Qism - Ninja Yo'li Boshlanadi",
  "description": "Naruto Uzumaki ninja akademiyasida o'qiydi va o'zining ninja yo'lini boshlaydi",
  "thumbnailUrl": "https://aniki.uz/images/naruto-ep1-thumb.jpg",
  "uploadDate": "2023-01-01",
  "duration": "PT23M",
  "contentUrl": "https://aniki.uz/watch/naruto/1",
  "embedUrl": "https://aniki.uz/embed/naruto/1",
  "partOfSeries": {
    "@type": "TVSeries",
    "name": "Naruto"
  },
  "episodeNumber": 1
}
```

## 📝 CONTENT OPTIMIZATION

### 1. H1-H6 Sarlavhalar Ierarxiyasi:
```html
<!-- Anime detail sahifa -->
<h1>Naruto - Barcha Qismlar Uzbek Tilida</h1>
  <h2>Anime Haqida Ma'lumot</h2>
    <h3>Syujet va Qahramonlar</h3>
    <h3>Janr va Yosh Chegarasi</h3>
  <h2>Qismlar Ro'yxati</h2>
    <h3>1-Fasl (1-220 qismlar)</h3>
    <h3>Shippuden (221-720 qismlar)</h3>
  <h2>O'xshash Anime Seriallar</h2>
```

### 2. Content Density:
- **Minimum 300 so'z** har bir sahifada
- **Kalit so'z density:** 1-2% (natural)
- **LSI keywords** ishlatish
- **FAQ section** qo'shish

### 3. User Experience Signals:
- **Dwell time** oshirish uchun engaging content
- **Bounce rate** kamaytirish uchun internal links
- **Click-through rate** oshirish uchun compelling titles