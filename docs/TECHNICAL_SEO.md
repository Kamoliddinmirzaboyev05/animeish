# TEXNIK SEO OPTIMIZATSIYASI

## ⚡ SAYT TEZLIGI OPTIMIZATSIYASI

### 1. CORE WEB VITALS TARGETS

#### Maqsadlar:
- **LCP (Largest Contentful Paint):** <2.5s
- **FID (First Input Delay):** <100ms  
- **CLS (Cumulative Layout Shift):** <0.1
- **FCP (First Contentful Paint):** <1.8s
- **TTI (Time to Interactive):** <3.5s

#### Aniki.uz uchun Optimizatsiya:

```javascript
// 1. Image Optimization
// Lazy loading implementation
const images = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      observer.unobserve(img);
    }
  });
});

// 2. Critical CSS inlining
// Anime poster'lar uchun critical styles
<style>
.anime-poster { width: 200px; height: 300px; object-fit: cover; }
.hero-section { min-height: 60vh; background: linear-gradient(...); }
</style>

// 3. Resource preloading
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/images/hero-bg.webp" as="image">
<link rel="dns-prefetch" href="//api.aniki.uz">
```

### 2. CACHING STRATEGIYASI

#### Browser Caching (.htaccess):
```apache
# Static assets caching
<IfModule mod_expires.c>
    ExpiresActive On
    
    # Images
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    
    # CSS/JS
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    
    # Fonts
    ExpiresByType font/woff2 "access plus 1 year"
    
    # HTML (shorter cache for dynamic content)
    ExpiresByType text/html "access plus 1 hour"
</IfModule>
```

#### CDN Configuration:
```javascript
// Cloudflare settings for aniki.uz
const cdnConfig = {
  // Cache anime posters and static assets
  cacheRules: [
    {
      pattern: "/images/anime/*",
      cacheTTL: "1 year",
      browserTTL: "1 year"
    },
    {
      pattern: "/api/anime/*",
      cacheTTL: "1 hour",
      browserTTL: "5 minutes"
    }
  ],
  
  // Minification
  minify: {
    css: true,
    js: true,
    html: true
  },
  
  // Compression
  compression: "gzip, brotli"
};
```

## 📱 MOBIL OPTIMIZATSIYA

### 1. RESPONSIVE DESIGN CHECKLIST

#### Viewport va Meta Tags:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
<meta name="format-detection" content="telephone=no">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

#### Touch-Friendly Design:
```css
/* Minimum touch target size */
.btn, .anime-card, .episode-item {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}

/* Prevent zoom on input focus */
input, select, textarea {
  font-size: 16px;
}

/* Smooth scrolling for mobile */
html {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}
```

### 2. MOBILE-FIRST INDEXING

#### Structured Data Mobile Optimization:
```json
{
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  "name": "Aniki PWA",
  "operatingSystem": "All",
  "applicationCategory": "Entertainment",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

## 🔒 SSL VA XAVFSIZLIK

### 1. HTTPS Configuration:
```apache
# Force HTTPS redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security headers
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
```

### 2. Content Security Policy:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.aniki.uz;
  media-src 'self' https:;
">
```

## 🗺️ SITEMAP.XML OPTIMIZATSIYASI

### Enhanced Sitemap:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>https://aniki.uz/</loc>
    <lastmod>2024-01-04</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Anime pages with images -->
  <url>
    <loc>https://aniki.uz/anime/naruto</loc>
    <lastmod>2024-01-04</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <image:image>
      <image:loc>https://aniki.uz/images/naruto-poster.webp</image:loc>
      <image:title>Naruto Anime Poster</image:title>
      <image:caption>Naruto Uzumaki ninja anime seriali</image:caption>
    </image:image>
    <video:video>
      <video:thumbnail_loc>https://aniki.uz/images/naruto-trailer-thumb.webp</video:thumbnail_loc>
      <video:title>Naruto Trailer</video:title>
      <video:description>Naruto anime seriali traileri</video:description>
      <video:duration>120</video:duration>
    </video:video>
  </url>
</urlset>
```

## 🤖 ROBOTS.TXT OPTIMIZATSIYASI

### Enhanced Robots.txt:
```
User-agent: *
Allow: /

# Important pages
Allow: /anime/
Allow: /search
Allow: /genre/

# Block unnecessary pages
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /*?*utm_*
Disallow: /*?*fbclid*

# Specific bot rules
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2

User-agent: YandexBot
Allow: /
Crawl-delay: 1

# Social media bots
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: TelegramBot
Allow: /

# Sitemap location
Sitemap: https://aniki.uz/sitemap.xml
Sitemap: https://aniki.uz/sitemap-images.xml
Sitemap: https://aniki.uz/sitemap-videos.xml

# Host directive
Host: https://aniki.uz
```

## 🔗 CANONICAL URL STRATEGIYASI

### Implementation:
```html
<!-- Homepage -->
<link rel="canonical" href="https://aniki.uz/">

<!-- Anime pages -->
<link rel="canonical" href="https://aniki.uz/anime/naruto">

<!-- Search pages with parameters -->
<link rel="canonical" href="https://aniki.uz/search">

<!-- Pagination -->
<link rel="canonical" href="https://aniki.uz/anime/naruto">
<link rel="prev" href="https://aniki.uz/anime/naruto?page=1">
<link rel="next" href="https://aniki.uz/anime/naruto?page=3">
```

## 📊 STRUCTURED DATA IMPLEMENTATION

### 1. Organization Schema:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Aniki",
  "alternateName": "Aniki Anime Streaming",
  "url": "https://aniki.uz",
  "logo": "https://aniki.uz/logo.png",
  "description": "O'zbekistondagi eng yaxshi anime streaming platformasi",
  "foundingDate": "2024",
  "founders": [
    {
      "@type": "Person",
      "name": "Aniki Team"
    }
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": ["Uzbek", "Russian", "English"]
  },
  "sameAs": [
    "https://t.me/aniki_uz",
    "https://instagram.com/aniki_uz"
  ]
}
```

### 2. BreadcrumbList Schema:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Bosh sahifa",
      "item": "https://aniki.uz"
    },
    {
      "@type": "ListItem", 
      "position": 2,
      "name": "Jangari Anime",
      "item": "https://aniki.uz/genre/action"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Naruto",
      "item": "https://aniki.uz/anime/naruto"
    }
  ]
}
```

## 🔍 CRAWLING VA INDEXING

### 1. XML Sitemap Index:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://aniki.uz/sitemap-main.xml</loc>
    <lastmod>2024-01-04</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://aniki.uz/sitemap-anime.xml</loc>
    <lastmod>2024-01-04</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://aniki.uz/sitemap-episodes.xml</loc>
    <lastmod>2024-01-04</lastmod>
  </sitemap>
</sitemapindex>
```

### 2. Internal Linking Architecture:
```
Homepage (/)
├── Genre Pages (/genre/action, /genre/romance)
│   ├── Anime Lists (paginated)
│   └── Individual Anime (/anime/naruto)
│       ├── Episode Pages (/watch/naruto/1)
│       └── Related Anime
├── Search (/search)
├── User Pages (/my-list, /profile)
└── Static Pages (/about, /contact)
```