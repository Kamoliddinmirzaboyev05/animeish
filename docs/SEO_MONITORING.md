# SEO MONITORING VA ANALYTICS

## 📊 GOOGLE SEARCH CONSOLE SOZLASH

### 1. PROPERTY QOSHISH VA VERIFICATION

#### Domain Property Setup:
```
1. https://search.google.com/search-console ga kiring
2. "Add Property" > "Domain" tanlang
3. "aniki.uz" kiriting
4. DNS verification:
   - TXT record: google-site-verification=abc123...
   - Host: @ yoki aniki.uz
   - TTL: 3600
```

#### URL Prefix Property (Backup):
```
1. "URL prefix" tanlang
2. "https://aniki.uz" kiriting  
3. HTML file verification:
   - google-site-verification.html yuklab oling
   - Root directory'ga joylashtiring
   - https://aniki.uz/google-site-verification.html tekshiring
```

### 2. SITEMAP SUBMISSION

#### Sitemap URLs:
```
https://aniki.uz/sitemap.xml
https://aniki.uz/sitemap-anime.xml
https://aniki.uz/sitemap-episodes.xml
https://aniki.uz/sitemap-images.xml
```

#### Submission Process:
1. **Sitemaps** bo'limiga o'ting
2. **Add a new sitemap** tugmasini bosing
3. Har bir sitemap URL'ini qo'shing
4. **Submit** qiling

### 3. PERFORMANCE MONITORING

#### Asosiy Metriklar:
- **Total Clicks:** Oylik o'sish 20%+
- **Total Impressions:** Oylik o'sish 30%+  
- **Average CTR:** 15%+ (industry average 10%)
- **Average Position:** Top 10'da 50+ keywords

#### Haftalik Monitoring:
```
Dushanba: Performance report tahlil
Chorshanba: New keywords tracking
Juma: Technical issues check
Yakshanba: Competitor analysis
```

### 4. COVERAGE MONITORING

#### Index Status Tracking:
- **Valid pages:** 95%+ indexed
- **Errors:** <5% of total pages
- **Warnings:** Monthly review va fix
- **Excluded:** Intentional exclusions only

#### Common Issues va Solutions:
```
❌ "Crawled - currently not indexed"
✅ Solution: Improve content quality, add internal links

❌ "Discovered - currently not indexed"  
✅ Solution: Submit URL for indexing, improve page authority

❌ "Page with redirect"
✅ Solution: Update internal links to final URL

❌ "Soft 404"
✅ Solution: Add proper content or 404 status
```

## 📈 GOOGLE ANALYTICS 4 SETUP

### 1. GA4 PROPERTY YARATISH

#### Configuration:
```javascript
// Global Site Tag (gtag.js)
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  
  gtag('config', 'G-XXXXXXXXXX', {
    // Enhanced ecommerce for anime tracking
    custom_map: {
      'custom_parameter_1': 'anime_genre',
      'custom_parameter_2': 'episode_number'
    }
  });
</script>
```

### 2. CUSTOM EVENTS TRACKING

#### Anime-Specific Events:
```javascript
// Anime view tracking
gtag('event', 'anime_view', {
  'anime_title': 'Naruto',
  'anime_genre': 'Action',
  'episode_number': 1,
  'user_type': 'registered'
});

// Search tracking
gtag('event', 'anime_search', {
  'search_term': 'naruto',
  'search_results': 15,
  'search_type': 'title'
});

// Engagement tracking
gtag('event', 'video_play', {
  'anime_title': 'Naruto',
  'episode_number': 1,
  'video_duration': 1440, // seconds
  'user_engagement': 'high'
});

// Conversion tracking
gtag('event', 'user_registration', {
  'method': 'email',
  'source': 'anime_page'
});
```

### 3. CUSTOM DIMENSIONS

#### Setup:
```
1. Admin > Custom Definitions > Custom Dimensions
2. Quyidagi dimensions qo'shing:

- anime_genre (Event-scoped)
- user_type (User-scoped)  
- episode_number (Event-scoped)
- search_term (Event-scoped)
- device_type (Session-scoped)
```

### 4. GOALS VA CONVERSIONS

#### Key Conversions:
- **User Registration:** 15% conversion rate target
- **Anime Watchlist Add:** 25% of visitors
- **Episode Completion:** 60% completion rate
- **Return Visitor:** 40% return rate

## 🔍 KEYWORD TRACKING TOOLS

### 1. GOOGLE SEARCH CONSOLE

#### Query Analysis:
```sql
-- Top performing queries
SELECT query, clicks, impressions, ctr, position
FROM search_analytics 
WHERE date >= '2024-01-01'
ORDER BY clicks DESC
LIMIT 100;

-- Opportunity keywords (high impressions, low CTR)
SELECT query, impressions, clicks, ctr, position
FROM search_analytics
WHERE impressions > 100 AND ctr < 0.05
ORDER BY impressions DESC;
```

### 2. THIRD-PARTY TOOLS

#### SEMrush Tracking:
```
Target Keywords:
- anime (Position tracking)
- anime uzbek (Daily tracking)
- anime serial (Weekly tracking)
- naruto uzbek (Monthly tracking)
- one piece uzbek (Monthly tracking)

Competitor Tracking:
- animego.org
- animeflv.net
- Local competitors
```

#### Ahrefs Monitoring:
```
Backlink Alerts:
- New backlinks to aniki.uz
- Lost backlinks monitoring
- Competitor backlink opportunities
- Brand mention tracking

Keyword Alerts:
- New keyword rankings
- Ranking changes (±3 positions)
- SERP feature appearances
```

## 📊 REPORTING DASHBOARD

### 1. WEEKLY SEO REPORT

#### Template:
```
📈 ANIKI.UZ SEO HAFTALIK HISOBOT

🔍 ORGANIC TRAFFIC:
- Bu hafta: [X] sessions (+/- Y%)
- O'tgan hafta bilan taqqoslash
- Top landing pages

🎯 KEYWORD PERFORMANCE:
- Top 10'da keywords: [X] (+/- Y)
- Yangi rankings: [List]
- Position changes: [List]

🔗 BACKLINKS:
- Yangi backlinks: [X]
- Lost backlinks: [X]  
- DR change: [X] (+/- Y)

⚡ TECHNICAL:
- Core Web Vitals: [Status]
- Indexing issues: [Count]
- Site errors: [Count]

🎬 CONTENT PERFORMANCE:
- Top anime pages: [List]
- New content indexed: [Count]
- User engagement: [Metrics]
```

### 2. MONTHLY SEO REPORT

#### KPI Dashboard:
```
📊 OYLIK SEO KPI'LAR:

TRAFFIC METRICS:
├── Organic Sessions: [Target vs Actual]
├── Organic Users: [Target vs Actual]  
├── Pages/Session: [Target vs Actual]
└── Bounce Rate: [Target vs Actual]

RANKING METRICS:
├── Keywords in Top 10: [Target vs Actual]
├── Keywords in Top 3: [Target vs Actual]
├── Average Position: [Target vs Actual]
└── SERP Features: [Count]

TECHNICAL METRICS:
├── Page Speed Score: [Target vs Actual]
├── Core Web Vitals: [Pass/Fail]
├── Mobile Usability: [Issues Count]
└── Index Coverage: [Percentage]

CONTENT METRICS:
├── New Pages Indexed: [Count]
├── Content Engagement: [Time on Page]
├── Internal Link Clicks: [Count]
└── Social Shares: [Count]
```

## 🎯 COMPETITOR ANALYSIS

### 1. MONTHLY COMPETITOR AUDIT

#### Analysis Framework:
```
COMPETITOR: animego.org

📊 TRAFFIC ANALYSIS:
- Estimated monthly traffic: [X]
- Top traffic sources: [Organic/Direct/Social]
- Geographic distribution: [Countries]

🔍 KEYWORD ANALYSIS:  
- Total keywords: [X]
- Top 10 keywords: [List]
- Keyword gaps: [Opportunities]
- Content gaps: [Missing topics]

🔗 BACKLINK ANALYSIS:
- Total backlinks: [X]
- Referring domains: [X]
- DR/Authority score: [X]
- Link building opportunities: [List]

📱 TECHNICAL ANALYSIS:
- Page speed: [Score]
- Mobile optimization: [Score]
- Schema markup: [Implementation]
- Site structure: [Analysis]
```

### 2. SERP MONITORING

#### Daily SERP Tracking:
```javascript
// Automated SERP monitoring script
const keywords = [
  'anime',
  'anime uzbek', 
  'anime serial',
  'naruto uzbek',
  'one piece uzbek'
];

keywords.forEach(keyword => {
  // Track position changes
  // Monitor SERP features
  // Alert on significant changes
  // Log competitor movements
});
```

## 🚨 ALERT SYSTEM

### 1. CRITICAL ALERTS

#### Immediate Action Required:
- **Traffic drop >20%:** SMS + Email alert
- **Ranking drop >5 positions:** Email alert  
- **Site down:** SMS + Email + Slack
- **Core Web Vitals fail:** Daily email
- **Security issues:** Immediate SMS

### 2. WEEKLY ALERTS

#### Performance Monitoring:
- New backlinks gained/lost
- Keyword ranking changes
- Technical issues discovered
- Content performance updates
- Competitor movements

### 3. MONTHLY ALERTS

#### Strategic Review:
- Overall SEO performance
- Goal achievement status
- ROI analysis
- Strategy adjustments needed
- Next month planning