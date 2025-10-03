import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AnimeDetail from './pages/AnimeDetail';
import VideoPlayer from './pages/VideoPlayer';
import MyList from './pages/MyList';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/home" element={<Home />} />
        
        <Route path="/anime/:id" element={<AnimeDetail />} />
        <Route path="/watch/:animeId/:episodeNumber" element={<VideoPlayer />} />
        <Route path="/search" element={<Search />} />
        
        <Route
          path="/my-list"
          element={
            <ProtectedRoute>
              <MyList />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
