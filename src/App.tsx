import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterEmail from './pages/RegisterEmail';
import RegisterOTP from './pages/RegisterOTP';
import RegisterDetails from './pages/RegisterDetails';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPasswordEmail from './pages/ForgotPasswordEmail';
import ForgotPasswordReset from './pages/ForgotPasswordReset';
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
        
        {/* New Registration Flow */}
        <Route path="/register" element={<RegisterEmail />} />
        <Route path="/register/verify-otp" element={<RegisterOTP />} />
        <Route path="/register/details" element={<RegisterDetails />} />
        
        {/* Forgot Password Flow */}
        <Route path="/forgot-password" element={<ForgotPasswordEmail />} />
        <Route path="/forgot-password/verify" element={<ForgotPasswordReset />} />
        
        {/* Old routes for backward compatibility */}
        <Route path="/old-register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        
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
