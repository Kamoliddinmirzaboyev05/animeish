# Animeish - Modern Anime Streaming Platform

A modern, full-featured anime streaming platform built with React 18, TypeScript, Tailwind CSS v4, and Framer Motion.

## Features

### 🎨 Design
- Modern purple (#8B5CF6) and black (#18181B) color scheme
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and transitions
- Glassmorphism effects
- Custom scrollbars
- Skeleton loading states

### 🔐 Authentication
- Landing page with animated hero
- Login/Register with form validation (Zod)
- Protected routes
- Local storage persistence

### 📺 Core Features

**Home Page:**
- Auto-rotating hero slider (5 featured anime)
- Continue Watching with progress bars
- Multiple category sliders (Trending, Popular, New Releases, Action, Romance, Fantasy)
- Horizontal scrolling with left/right navigation

**Anime Detail Page:**
- Large hero banner with gradient overlay
- Rating, year, episode count, genre tags
- Synopsis and information panel
- Episodes grid with thumbnails
- Watch status indicators
- Related anime recommendations
- Add to My List functionality

**Video Player:**
- Custom video controls
- Play/Pause, Timeline scrubber
- Volume slider
- Playback speed selector (0.5x - 2x)
- Quality selector (360p - 1080p)
- Fullscreen toggle
- Next/Previous episode buttons
- Episode playlist sidebar (collapsible)
- Auto-hide controls (3 seconds)
- Keyboard shortcuts (Space, Arrows, F, M)
- Playback position saving
- Auto-mark as watched

**My List Page:**
- Grid of saved anime
- Remove from list
- Sort options (Recently Added, Alphabetical, Rating)
- Empty state

**Search & Filter:**
- Real-time search with 300ms debounce
- Advanced filters:
  - Genre checkboxes (8 genres)
  - Year range slider (2000-2024)
  - Rating filter (6+, 7+, 8+)
  - Status (Ongoing, Completed, Upcoming)
- Results grid
- Apply/Reset filters

**Profile Page:**
- User information
- Statistics (Episodes watched, Hours spent, Favorite genre)
- Watch history
- Account creation date

**Notifications Page:**
- Mock notifications
- Categories (New Episodes, Recommendations, System Updates)
- Mark all as read
- Filter by type
- Timestamps

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **React Router** - Routing
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **React Hook Form** - Form handling
- **Zod** - Validation
- **Local Storage** - Data persistence

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Tech Stack Versions

- React 18
- TypeScript 5
- Vite 7
- Tailwind CSS 3
- React Router DOM 6
- Framer Motion 11
- Lucide React (latest)
- React Hook Form + Zod validation

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── AnimeCard.tsx   # Anime card with hover effects
│   ├── AnimeSlider.tsx # Horizontal scrolling slider
│   ├── HeroSlider.tsx  # Auto-rotating hero
│   ├── Navbar.tsx      # Sticky navigation
│   ├── ProtectedRoute.tsx
│   └── Toast.tsx       # Toast notifications
├── data/
│   └── mockData.ts     # Mock anime data (22 anime)
├── pages/              # Route pages
│   ├── Landing.tsx     # Landing page
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── Home.tsx        # Dashboard
│   ├── AnimeDetail.tsx # Anime details
│   ├── VideoPlayer.tsx # Video player
│   ├── MyList.tsx      # Saved anime
│   ├── Search.tsx      # Search & filters
│   ├── Profile.tsx     # User profile
│   └── Notifications.tsx
├── App.tsx             # Router configuration
├── main.tsx            # Entry point
└── index.css           # Global styles

## Local Storage

The app uses localStorage for:
- `user` - Current user session
- `users` - Registered users
- `myList` - Saved anime IDs
- `watchHistory` - Watch history with timestamps
- `playbackPositions` - Video playback positions

## Default Credentials

Create a new account or use test credentials after registering.

## Mock Data

22 anime titles with:
- Thumbnails and banners
- Ratings, year, episodes
- Genres and descriptions
- Episode lists with watch status
- Sample video URLs

## Keyboard Shortcuts (Video Player)

- `Space` - Play/Pause
- `← →` - Seek -10s/+10s
- `↑ ↓` - Volume up/down
- `F` - Fullscreen
- `M` - Mute/Unmute

## Responsive Breakpoints

- Mobile: 320px+
- Tablet: 768px+
- Desktop: 1024px+

## Animations

- Fade in (300ms)
- Slide up (300ms)
- Scale in (300ms)
- Hover scale (1.05)
- Smooth transitions throughout

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Author

Built with ❤️ using React and Tailwind CSS
```
